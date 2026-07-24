import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import QRCode from 'qrcode';
import { LocalDb } from './src/db';
import { CareUpdate, Tree } from './src/types';

// PromptPay EMVCo Payload Generator
function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    const charCode = str.charCodeAt(c);
    let x = ((crc >> 8) ^ charCode) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePromptPayPayload(amount: number, phoneNumber: string = '0817960622'): string {
  const targetPP = phoneNumber.startsWith('0') 
    ? `0066${phoneNumber.substring(1)}` 
    : phoneNumber;
  
  const accountInfo = `0016A0000006770101110113${targetPP}`;
  const merchantField = `29${accountInfo.length}${accountInfo}`;
  const amountStr = Number(amount).toFixed(2);
  const amountField = `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  let payload = `000201010211${merchantField}5303764${amountField}5802TH6304`;
  return payload + crc16(payload);
}

// Load environment variables
dotenv.config();

// Shared Gemini SDK client utility with User-Agent set to 'aistudio-build' for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      const trees = await LocalDb.getTrees();
      // Calculate unique donors by name, since some don't have phone numbers or share the same default '-' phone number
      const uniqueDonors = new Set(
        trees.map(t => (t.ownerName || '').trim().toLowerCase()).filter(n => n.length > 0)
      ).size;
      const totalCO2Offset = Number(trees.reduce((sum, t) => sum + (t.carbonOffset || 0), 0).toFixed(1));

      res.json({
        totalTarget: 10000,
        totalPlanted: trees.length,
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

  // Create order/pledge (Supported via both /api/forest/pledge and /api/orders)
  const createPledgeHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { donorName, organization, donorOrganization, donorPhone, treeCount, selectedTreeIndexes, treeNames, userId } = req.body;
      if (!donorName || !donorPhone || !treeCount || treeCount < 1) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลชื่อ เบอร์โทรศัพท์ และจำนวนต้นไม้ให้ครบถ้วน' });
      }

      const org = organization || donorOrganization || '';
      const amount = treeCount * 100; // 100 THB per tree

      const order = await LocalDb.addOrder({
        donorName,
        donorOrganization: org,
        donorPhone,
        userId: userId || '',
        treeCount: Number(treeCount),
        amount,
        status: 'Pending',
        slipVerified: false,
        selectedTreeIndexes: selectedTreeIndexes || [],
        treeNames: treeNames || []
      });

      res.json({
        success: true,
        order,
        message: 'สร้างรายการร่วมปลูกเรียบร้อยแล้ว กรุณาชำระเงินผ่าน QR Code'
      });
    } catch (e) {
      console.error('Error creating pledge order:', e);
      res.status(500).json({ error: 'ไม่สามารถสร้างรายการร่วมปลูกได้' });
    }
  };

  app.post('/api/forest/pledge', createPledgeHandler);
  app.post('/api/orders', createPledgeHandler);

  // Generate PromptPay QR Code
  app.post('/api/payment/generate-qr', async (req, res) => {
    try {
      const { amount, orderId, phoneNumber } = req.body;
      const targetAmount = Number(amount) || 100;
      const targetPhone = phoneNumber || '0817960622';

      const payload = generatePromptPayPayload(targetAmount, targetPhone);
      const qrImageUrl = await QRCode.toDataURL(payload, { margin: 2, width: 320 });

      res.json({
        success: true,
        amount: targetAmount,
        orderId: orderId || null,
        payload,
        qrImageUrl
      });
    } catch (e) {
      console.error('Error generating QR Code:', e);
      res.status(500).json({ error: 'ไม่สามารถสร้าง QR Code สำหรับชำระเงินได้' });
    }
  });

  // Sync user profile
  app.post('/api/user/sync', async (req, res) => {
    try {
      const userProfile = req.body;
      if (!userProfile || !userProfile.uid) {
        return res.status(400).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
      }
      const saved = await LocalDb.saveUserProfile(userProfile);
      res.json({ success: true, user: saved });
    } catch (e) {
      res.status(500).json({ error: 'Failed to sync user profile' });
    }
  });

  // Get user trees by userId or phone or ownerName
  app.get('/api/user/trees', async (req, res) => {
    try {
      const { userId, phone, name } = req.query;
      const trees = await LocalDb.getTrees();

      const userTrees = trees.filter(t => {
        if (userId && t.userId === String(userId)) return true;
        if (phone && t.ownerPhone && t.ownerPhone.replace(/\D/g, '') === String(phone).replace(/\D/g, '')) return true;
        if (name && t.ownerName && t.ownerName.trim().toLowerCase().includes(String(name).trim().toLowerCase())) return true;
        return false;
      });

      res.json({ success: true, count: userTrees.length, trees: userTrees });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch user trees' });
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

  // Verify slip via Gemini + Slip2Go simulation
  const verifySlipHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { orderId, slipImage } = req.body;
      if (!orderId || !slipImage) {
        return res.status(400).json({ error: 'ข้อมูลตรวจสอบสลิปไม่ครบถ้วน (orderId, slipImage)' });
      }

      const order = await LocalDb.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'ไม่พบรหัสรายการร่วมปลูกที่ระบุ' });
      }

      if (order.status === 'Paid') {
        return res.json({ success: true, message: 'รายการร่วมปลูกนี้ได้รับการชำระเงินเรียบร้อยแล้ว', order });
      }

      // 1. Process base64 slip image
      let mimeType = 'image/png';
      let base64Data = slipImage;
      if (slipImage.startsWith('data:')) {
        const parts = slipImage.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      }

      let parsedDetails: any = null;
      let isVerified = false;

      // 2. Try real Slip2Go API if key is present
      if (process.env.SLIP2GO_API_KEY) {
        try {
          console.log('Sending slip to real Slip2Go API...');
          
          // Build native multipart/form-data for Slip2Go API
          const formData = new FormData();
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer], { type: mimeType });
          const filename = `slip_${orderId}.${mimeType.split('/')[1] || 'png'}`;
          
          // Append multiple common field names to ensure Slip2Go endpoint matches correctly
          formData.append('files', blob, filename);
          formData.append('file', blob, filename);
          formData.append('image', blob, filename);

          const slip2goResponse = await fetch('https://connect.slip2go.com/api/verify-slip/qr-image/info', {
            method: 'POST',
            headers: {
              'x-api-key': process.env.SLIP2GO_API_KEY,
              'Authorization': `Bearer ${process.env.SLIP2GO_API_KEY}`
            },
            body: formData
          });

          if (slip2goResponse.ok) {
            const result = await slip2goResponse.json();
            console.log('Slip2Go API Response:', result);
            
            // Check success at root level, or if result itself represents a successful parsed slip
            const isSuccess = result && (result.success || result.status === 'success' || result.amount || (result.data && (result.data.amount || result.data.refId)));
            
            if (isSuccess) {
              const data = result.data || result;
              const transAmount = Number(data.amount || data.transAmount || data.totalAmount || data.total || 0);
              const transRefId = data.refId || data.transRef || data.ref || data.transactionRefId || data.referenceNo || data.reference;
              const transReceiverName = data.receiver?.name || data.receiver?.displayName || data.receiverName || data.receiver?.accountName || data.receiverAccountName || '';
              const transSenderName = data.sender?.name || data.sender?.displayName || data.senderName || data.sender?.accountName || data.senderAccountName || 'ลูกค้าของโครงการ';
              
              parsedDetails = {
                transDate: data.transDate || data.date || data.transactionDate || new Date().toISOString().split('T')[0],
                transTime: data.transTime || data.time || data.transactionTime || '00:00:00',
                senderName: transSenderName,
                receiverName: transReceiverName || 'ปินะ ไชยบุตร',
                amount: transAmount,
                refId: transRefId || `TX-${Date.now()}`,
                sendingBank: data.sender?.bank || data.sendingBank || data.senderBank || 'ธนาคารทั่วไป'
              };

              // Strict checks on the Slip2Go response:
              // 1. Amount Verification
              if (Math.abs(transAmount - order.amount) >= 1) {
                return res.status(400).json({ 
                  success: false,
                  error: `ยอดเงินโอนไม่ตรงกับรายการสั่งร่วมปลูก (สลิปโอนเงินจำนวน ${transAmount} บาท แต่ยอดที่ต้องการชำระคือ ${order.amount} บาท)` 
                });
              }

              // 2. Double-spend prevention
              const allOrders = await LocalDb.getOrders();
              const isDuplicate = allOrders.some(o => o.status === 'Paid' && o.slipDetails?.refId === transRefId);
              if (isDuplicate) {
                return res.status(400).json({
                  success: false,
                  error: `สลิปการโอนเงินนี้เคยถูกใช้งานไปแล้ว (Reference ID: ${transRefId}) ไม่สามารถทำซ้ำได้`
                });
              }

              isVerified = true;
            } else {
              return res.status(400).json({
                success: false,
                error: `Slip2Go ตรวจพบข้อผิดพลาด: ${result?.message || 'ภาพที่ส่งไม่ใช่สลิปธนาคารที่ถูกต้อง หรือทำรายการไม่สำเร็จ'}`
              });
            }
          } else {
            const errorText = await slip2goResponse.text();
            console.error('Slip2Go non-ok status:', slip2goResponse.status, errorText);
            return res.status(400).json({
              success: false,
              error: `ไม่สามารถเชื่อมต่อระบบ Slip2Go ได้สำเร็จ (Status: ${slip2goResponse.status})`
            });
          }
        } catch (apiError) {
          console.error('Real Slip2Go API failed with error:', apiError);
          return res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการตรวจสอบสลิปผ่านทาง Slip2Go API'
          });
        }
      }

      // 3. Fallback to Gemini smart OCR verification (runs ONLY if SLIP2GO_API_KEY is not defined)
      if (!isVerified && !process.env.SLIP2GO_API_KEY) {
        console.log('Running Gemini-based bank slip OCR parser...');
        try {
          const imagePart = {
            inlineData: {
              mimeType,
              data: base64Data
            }
          };

          const textPart = {
            text: `You are an expert Thai Bank Transfer Slip Reader. Inspect this slip and extract the transaction details in JSON.
            Thai bank slips are standard transaction receipts that show cash transfers between bank accounts.
            Verify that the slip is indeed a successful transaction receipt (successful transfer/โอนเงินสำเร็จ) with a transaction QR code.
            If the slip amount (amount in THB) matches the expected amount of ${order.amount} THB, set isValidSlip to true.
            
            Return the output adhering strictly to the JSON schema.`
          };

          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  transDate: { type: Type.STRING, description: "Transaction date in format YYYY-MM-DD or DD/MM/YYYY" },
                  transTime: { type: Type.STRING, description: "Transaction time in format HH:MM:SS" },
                  senderName: { type: Type.STRING, description: "Sender's name in Thai or English" },
                  receiverName: { type: Type.STRING, description: "Receiver's name (should contain merchant or forest name, or just recipient)" },
                  amount: { type: Type.NUMBER, description: "The exact amount transferred in THB" },
                  refId: { type: Type.STRING, description: "Transaction reference ID / TxID" },
                  sendingBank: { type: Type.STRING, description: "The bank name that sent the money (e.g. KBANK, SCB, BBL, GSB)" },
                  isValidSlip: { type: Type.BOOLEAN, description: "Set to true ONLY if this is a valid Thai bank transfer slip indicating a successful transfer." }
                },
                required: ["amount", "isValidSlip"]
              }
            }
          });

          const responseText = geminiResponse.text?.trim() || '{}';
          console.log('Gemini raw OCR output:', responseText);
          const geminiResult = JSON.parse(responseText);

          if (geminiResult && geminiResult.amount) {
            parsedDetails = {
              transDate: geminiResult.transDate || new Date().toISOString().split('T')[0],
              transTime: geminiResult.transTime || '00:00:00',
              senderName: geminiResult.senderName || 'ลูกค้าของโครงการ',
              receiverName: geminiResult.receiverName || 'ปินะ ไชยบุตร',
              amount: Number(geminiResult.amount),
              refId: geminiResult.refId || `TX-${Date.now()}`,
              sendingBank: geminiResult.sendingBank || 'ธนาคารทั่วไป'
            };

            // Strict checks in Gemini sandbox fallback:
            if (geminiResult.isValidSlip && Math.abs(parsedDetails.amount - order.amount) < 5) {
              // Double-spend prevention
              const allOrders = await LocalDb.getOrders();
              const isDuplicate = allOrders.some(o => o.status === 'Paid' && o.slipDetails?.refId === parsedDetails.refId);
              if (isDuplicate) {
                return res.status(400).json({
                  success: false,
                  error: `[Sandbox] สลิปการโอนเงินนี้เคยถูกใช้งานไปแล้ว (Reference ID: ${parsedDetails.refId})`
                });
              }
              isVerified = true;
              // Add a flag to indicate sandbox verification success
              parsedDetails.isSandboxVerified = true;
            } else {
              return res.status(400).json({
                success: false,
                error: `[Sandbox] ยอดเงินโอนไม่ตรงกับรายการสั่งปลูก (ในสลิป: ${parsedDetails.amount}฿, ยอดที่ต้องโอน: ${order.amount}฿) หรือรูปภาพไม่ใช่สลิปโอนเงินสำเร็จที่ถูกต้อง`
              });
            }
          } else {
            return res.status(400).json({
              success: false,
              error: '[Sandbox] ไม่พบข้อมูลยอดเงินโอนในสลิป กรุณาอัปโหลดรูปภาพสลิปที่ชัดเจน'
            });
          }
        } catch (geminiError) {
          console.error('Gemini verification failed:', geminiError);
          return res.status(400).json({
            success: false,
            error: '[Sandbox] เกิดข้อผิดพลาดในการวิเคราะห์สลิปด้วยระบบอัจฉริยะ กรุณาใช้สลิปโอนเงินที่มีรายละเอียดครบถ้วน'
          });
        }
      }

      // 4. Handle successful verification
      if (isVerified && parsedDetails) {
        // Update Order
        const updatedOrder = await LocalDb.updateOrder(orderId, {
          status: 'Paid',
          slipVerified: true,
          slipDetails: parsedDetails
        });

        // Automatically plant the tree seedlings in our forest!
        const newlyPlantedTrees = [];
        const chosenIndexes = order.selectedTreeIndexes || [];
        for (let i = 0; i < order.treeCount; i++) {
          const indexToPlant = chosenIndexes[i];
          const ownerNameForTree = (order.treeNames && order.treeNames[i] && order.treeNames[i].trim()) ? order.treeNames[i].trim() : order.donorName;
          const tree = await LocalDb.addTree({
            ownerName: ownerNameForTree,
            ownerOrganization: order.donorOrganization || '',
            ownerPhone: order.donorPhone,
            userId: order.userId || '',
            plantedAt: new Date().toISOString(),
            status: 'Seedling',
            height: 15, // standard starting seedling height (cm)
            index: indexToPlant,
            carbonOffset: 1.5, // 1.5 kg start CO2
            slipDetails: parsedDetails,
            careHistory: [
              {
                date: new Date().toISOString().split('T')[0],
                status: 'Seedling',
                height: 15,
                image: 'https://images.unsplash.com/photo-1588714024415-7485307b2203?auto=format&fit=crop&w=300&q=80',
                note: `ร่วมลงทะเบียนกล้าไม้สักสลักชื่อ คุณ ${ownerNameForTree}${order.donorOrganization ? ` (${order.donorOrganization})` : ''} เรียบร้อยแล้ว ได้รับความคุ้มครองและดูแลโดยทีมงานหมื่นกล้าป่าเขียว`
              }
            ]
          });
          newlyPlantedTrees.push(tree);
        }

        return res.json({
          success: true,
          message: `ตรวจสอบสลิปผ่าน slip2go สำเร็จ! โอนเงินจำนวน ${parsedDetails.amount}฿ ถูกต้อง สั่งปลูกกล้าไม้สักจำนวน ${order.treeCount} ต้นเข้าระบบเรียบร้อยแล้ว`,
          order: updatedOrder,
          newTrees: newlyPlantedTrees
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'ไม่สามารถตรวจสอบสลิปได้ยอดเงินโอนไม่ตรงกับยอดที่สั่งปลูก กรุณาอัปโหลดสลิปที่ถูกต้องจำนวนเงิน ' + order.amount + '฿'
        });
      }
    } catch (e) {
      console.error('Error in /api/verify-slip:', e);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสลิปการโอนเงิน' });
    }
  };

  app.post('/api/verify-slip', verifySlipHandler);
  app.post('/api/payment/verify-slip', verifySlipHandler);

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
