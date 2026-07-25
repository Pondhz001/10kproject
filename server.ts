import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import { LocalDb, connectDB } from './src/db';
import { CareUpdate, Tree } from './src/types';

// Load environment variables
dotenv.config();

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB Connection Initialized successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB on startup:", err);
    process.exit(1);
  }
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize and ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static files from uploads folder
  app.use('/uploads', express.static(uploadsDir));

  // Increase payload size limits for image base64 uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // ==========================================
  // API Routes
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Handle local image upload (base64)
  app.post('/api/upload', (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'ไม่พบข้อมูลรูปภาพที่จะอัปโหลด' });
      }

      let mimeType = 'image/png';
      let base64Data = image;
      let extension = 'png';

      if (image.startsWith('data:')) {
        const parts = image.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
          extension = 'jpg';
        } else if (mimeType.includes('gif')) {
          extension = 'gif';
        } else if (mimeType.includes('webp')) {
          extension = 'webp';
        }
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `care-${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);

      res.json({ imageUrl: `/uploads/${filename}` });
    } catch (error) {
      console.error('Local upload failed:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกไฟล์รูปภาพได้' });
    }
  });

  // Campaign Stats
  app.get('/api/stats', async (req, res) => {
    try {
      const allTrees = await LocalDb.getTrees();
      // Only count confirmed trees for planted count
      const confirmedTrees = allTrees.filter(t => t.status !== 'Pending Verification');
      
      const uniqueDonors = new Set(
        confirmedTrees.map(t => (t.ownerName || '').trim().toLowerCase()).filter(n => n.length > 0)
      ).size;
      const totalCO2Offset = Number(confirmedTrees.reduce((sum, t) => sum + (t.carbonOffset || 0), 0).toFixed(1));

      res.json({
        totalTarget: 10000,
        totalPlanted: confirmedTrees.length,
        totalCO2Offset: Number(totalCO2Offset.toFixed(1)),
        totalDonors: uniqueDonors
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Get all trees
  app.get('/api/trees', async (req, res) => {
    try {
      const trees = await LocalDb.getTrees();
      res.json(trees);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch trees' });
    }
  });


  // Get all orders (Admin only)
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await LocalDb.getOrders();
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Create order/pledge (Supported via both /api/forest/pledge and /api/orders)
  const createPledgeHandler = async (req: express.Request, res: express.Response) => {
    console.log(`[API REQUEST] POST /api/forest/pledge received.`);
    console.log(`[REQUEST BODY]`, JSON.stringify(req.body));
    try {
      const { donorName, organization, donorOrganization, donorPhone, treeCount, selectedTreeIndexes, treeNames, userId, isAdmin } = req.body;
      if (!donorName || !donorPhone || !treeCount || treeCount < 1) {
        console.warn(`[VALIDATION FAILED] Missing required fields`);
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลชื่อ เบอร์โทรศัพท์ และจำนวนต้นไม้ให้ครบถ้วน' });
      }

      const org = organization || donorOrganization || '';
      const amount = treeCount * 100; // 100 THB per tree
      
      const createdTrees = [];
      const finalIndexes = [];
      const actualTreeNames = treeNames || [];
      const indexesToUse = selectedTreeIndexes && selectedTreeIndexes.length > 0 
        ? selectedTreeIndexes 
        : Array.from({length: Number(treeCount)}).map(() => null);

      console.log(`[DATABASE] Creating ${treeCount} Trees...`);
      for (let i = 0; i < Number(treeCount); i++) {
        const nameToUse = actualTreeNames[i] || donorName;
        const indexToUse = indexesToUse[i];
        
        const treeParams: any = {
          ownerName: nameToUse,
          ownerOrganization: org,
          ownerPhone: donorPhone,
          userId: userId || '',
          plantedAt: new Date().toISOString(),
          status: isAdmin ? 'Seedling' : 'Pending Verification',
          height: 15,
          carbonOffset: 0,
          careHistory: [{
            date: new Date().toISOString().split('T')[0],
            status: isAdmin ? 'Seedling' : 'Pending Verification',
            height: 15,
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: isAdmin ? 'ลงทะเบียนกล้าไม้สักโดยแอดมิน' : 'ลงทะเบียนกล้าไม้สักลงในระบบแผนที่เรียบร้อย รอการตรวจสอบยอดเงินและการปักป้าย'
          }]
        };

        if (indexToUse !== null) {
          treeParams.index = indexToUse;
        }

        const tree = await LocalDb.addTree(treeParams);
        createdTrees.push(tree);
        finalIndexes.push(tree.index);
        console.log(`[DATABASE INSERT SUCCESS] Tree created with Index:`, tree.index);
      }

      console.log(`[DATABASE] Creating Order...`);
      const order = await LocalDb.addOrder({
        donorName,
        donorOrganization: org,
        donorPhone,
        userId: userId || '',
        treeCount: Number(treeCount),
        amount: isAdmin ? 0 : amount,
        status: isAdmin ? 'Paid' : 'Pending',
        slipVerified: isAdmin ? true : false,
        selectedTreeIndexes: finalIndexes,
        treeNames: treeNames || [],
        verificationCode: ''
      });
      console.log(`[DATABASE INSERT SUCCESS] Order created with ID:`, order.id);

      console.log(`[API RESPONSE] Success. Order ID:`, order.id, `Trees created:`, createdTrees.length);
      res.json({
        success: true,
        order,
        trees: createdTrees,
        message: 'สร้างรายการร่วมปลูกเรียบร้อยแล้ว กรุณาชำระเงินผ่าน QR Code'
      });
    } catch (e: any) {
      console.error('[ERROR] Failed to create pledge order:', e.message, e.stack);
      res.status(500).json({ error: 'ไม่สามารถสร้างรายการร่วมปลูกได้' });
    }
  };

  app.post('/api/forest/pledge', createPledgeHandler);
  app.post('/api/orders', createPledgeHandler);





  // Admin Confirm/Reject Order
  app.patch('/api/orders/:id', async (req, res) => {
    console.log(`[API REQUEST] PATCH /api/orders/${req.params.id} received.`);
    console.log(`[REQUEST BODY]`, JSON.stringify(req.body));
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (status !== 'Paid' && status !== 'Failed') {
        return res.status(400).json({ error: 'Invalid status' });
      }

      console.log(`[DATABASE] Fetching order ${id}...`);
      const order = await LocalDb.getOrder(id);
      if (!order) {
        console.warn(`[DATABASE ERROR] Order not found: ${id}`);
        return res.status(404).json({ error: 'ไม่พบรายการนี้' });
      }

      console.log(`[DATABASE] Updating order ${id} to ${status}...`);
      const updatedOrder = await LocalDb.updateOrder(id, {
        status,
        slipVerified: status === 'Paid'
      });
      console.log(`[DATABASE UPDATE SUCCESS] Order updated.`);

      if (status === 'Paid') {
        console.log(`[DATABASE] Fetching trees for order...`);
        const trees = await LocalDb.getTrees();
        const orderTrees = trees.filter(t => order.selectedTreeIndexes?.includes(t.index) || order.treeNames?.includes(t.ownerName));
        
        for (const t of orderTrees) {
          if (t.status === 'Pending Verification') {
            let updatedCareHistory = [...(t.careHistory || [])];
            updatedCareHistory.push({
              date: new Date().toISOString().split('T')[0],
              status: 'Seedling',
              height: 15,
              image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
              note: 'อนุมัติการร่วมปลูกโดยแอดมิน'
            });
            
            await LocalDb.updateTree(t.id, {
              status: 'Seedling',
              careHistory: updatedCareHistory
            });
            console.log(`[DATABASE UPDATE SUCCESS] Tree ${t.id} (index ${t.index}) updated to Seedling.`);
          }
        }
      }

      res.json({ success: true, order: updatedOrder });
    } catch (e: any) {
      console.error('[ERROR] Error updating order:', e.message, e.stack);
      res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะได้' });
    }
  });

  app.post('/api/orders/confirm', async (req, res) => {
    console.log(`[API REQUEST] POST /api/orders/confirm received.`);
    console.log(`[REQUEST BODY]`, JSON.stringify(req.body));
    try {
      const { verificationCode, orderId } = req.body;
      
      const targetId = verificationCode || orderId;
      if (!targetId) {
        console.warn(`[VALIDATION FAILED] Missing Order ID`);
        return res.status(400).json({ error: 'กรุณาระบุ Order ID' });
      }

      if (orderId && verificationCode && orderId !== verificationCode) {
         console.warn(`[VALIDATION FAILED] Mismatched Order IDs`);
         return res.status(400).json({ error: 'Order ID ไม่ถูกต้อง' });
      }
      
      console.log(`[DATABASE] Fetching order ${targetId}...`);
      let order = await LocalDb.getOrder(targetId);
      
      if (!order) {
        console.warn(`[DATABASE ERROR] Order not found: ${targetId}`);
        return res.status(404).json({ error: 'ไม่พบรายการร่วมปลูก หรือ Order ID ไม่ถูกต้อง' });
      }
      
      if (order.status !== 'Pending') {
        console.warn(`[VALIDATION FAILED] Order ${targetId} already confirmed.`);
        return res.status(400).json({ error: 'รายการนี้ได้รับการยืนยันไปแล้ว' });
      }
      
      console.log(`[DATABASE] Updating order ${targetId} status to Paid...`);
      const updatedOrder = await LocalDb.updateOrder(order.id, {
        status: 'Paid',
        slipVerified: true
      });
      console.log(`[DATABASE UPDATE SUCCESS] Order updated.`);
      
      console.log(`[DATABASE] Fetching trees...`);
      const trees = await LocalDb.getTrees();
      
      const orderTrees = trees.filter(t => order.selectedTreeIndexes?.includes(t.index) || order.treeNames?.includes(t.ownerName));
      console.log(`[DATABASE] Found ${orderTrees.length} trees related to order ${targetId}`);
      
      for (const t of orderTrees) {
        if (t.status === 'Pending Verification') {
          let updatedCareHistory = [...(t.careHistory || [])];
          updatedCareHistory.push({
            date: new Date().toISOString().split('T')[0],
            status: 'Seedling',
            height: 15,
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: 'ยืนยันการปลูกเรียบร้อยแล้ว'
          });
          
          await LocalDb.updateTree(t.id, {
            status: 'Seedling',
            careHistory: updatedCareHistory
          });
          console.log(`[DATABASE UPDATE SUCCESS] Tree ${t.id} (index ${t.index}) updated to Seedling.`);
        }
      }
      
      console.log(`[API RESPONSE] Order ${targetId} confirmed successfully.`);
      res.json({ success: true, message: 'ยืนยันการปลูกสำเร็จ' });
    } catch (e: any) {
      console.error('[ERROR] Error confirming order:', e.message, e.stack);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการยืนยัน' });
    }
  });

  // Generate PromptPay QR Code
  app.post('/api/payment/generate-qr', async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      const targetAmount = Number(amount) || 100;
      
      const qrImageUrl = '/payment-qr.jpeg';

      res.json({
        success: true,
        amount: targetAmount,
        orderId: orderId || null,
        payload: 'static-qr',
        qrImageUrl
      });
    } catch (e) {
      console.error('Error generating QR Code:', e);
      res.status(500).json({ error: 'ไม่สามารถสร้าง QR Code สำหรับชำระเงินได้' });
    }
  });




  // Update Tree Care (Admin / Tracker portal)
  app.post('/api/trees/:id/care', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, height, image, note, date } = req.body;

      if (!status || !height || !note) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลการติดตามให้ครบถ้วน' });
      }

      const careUpdate: CareUpdate = {
        date: date || new Date().toISOString().split('T')[0],
        status,
        height: Number(height),
        image: image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
        note
      };

      const updatedTree = await LocalDb.addCareUpdate(id, careUpdate);
      if (!updatedTree) {
        return res.status(404).json({ error: 'ไม่พบข้อมูลต้นกล้าสักที่ระบุ' });
      }

      res.json(updatedTree);
    } catch (e) {
      res.status(500).json({ error: 'Failed to add care update' });
    }
  });

  // Update general tree details
  app.put('/api/trees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { ownerName, ownerPhone, status, height, carbonOffset, imageUrl, note, appendNewLog } = req.body;

      // Fetch the current tree
      const trees = await LocalDb.getTrees();
      const currentTree = trees.find(t => t.id === id);
      if (!currentTree) {
        return res.status(404).json({ error: 'ไม่พบข้อมูลต้นกล้าสักที่ระบุ' });
      }

      const updates: Partial<Tree> = {};
      if (ownerName !== undefined) updates.ownerName = ownerName;
      if (ownerPhone !== undefined) updates.ownerPhone = ownerPhone;
      if (status !== undefined) updates.status = status;
      if (height !== undefined) updates.height = Number(height);
      if (carbonOffset !== undefined) updates.carbonOffset = Number(carbonOffset);

      // Handle Care History Update
      let updatedCareHistory = currentTree.careHistory ? [...currentTree.careHistory] : [];
      const newStatus = status !== undefined ? status : currentTree.status;
      const newHeight = height !== undefined ? Number(height) : currentTree.height;
      const newImage = imageUrl !== undefined ? imageUrl : '';
      const newNote = note !== undefined ? note : '';

      if (appendNewLog) {
        // Append a new care log entry
        updatedCareHistory.push({
          date: new Date().toISOString().split('T')[0],
          status: newStatus,
          height: newHeight,
          image: newImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
          note: newNote || 'อัปเดตสถานะและรูปถ่ายล่าสุดจากการติดตามผล'
        });
      } else {
        // Edit the latest care log entry
        if (updatedCareHistory.length > 0) {
          const lastIdx = updatedCareHistory.length - 1;
          updatedCareHistory[lastIdx] = {
            ...updatedCareHistory[lastIdx],
            status: newStatus,
            height: newHeight,
            image: newImage || updatedCareHistory[lastIdx].image,
            note: newNote || updatedCareHistory[lastIdx].note
          };
        } else {
          // Fallback if careHistory is empty
          updatedCareHistory.push({
            date: new Date().toISOString().split('T')[0],
            status: newStatus,
            height: newHeight,
            image: newImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: newNote || 'ลงทะเบียนความสูงและรูปถ่ายจากการติดตาม'
          });
        }
      }

      updates.careHistory = updatedCareHistory;

      const updatedTree = await LocalDb.updateTree(id, updates);
      if (!updatedTree) {
        return res.status(404).json({ error: 'ไม่พบข้อมูลต้นกล้าสักที่ระบุ' });
      }

      res.json(updatedTree);
    } catch (e) {
      console.error('Error updating tree:', e);
      res.status(500).json({ error: 'Failed to update tree details' });
    }
  });

  // ==========================================
  // Vite Server Setup for Client Assets
  // ==========================================

  // ==========================================
  // Vite Server Setup for Client Assets
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);
  });
}

startServer();
