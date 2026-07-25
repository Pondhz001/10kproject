import re

with open("server.ts", "r") as f:
    content = f.read()

old_func = """  const createPledgeHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { donorName, organization, donorOrganization, donorPhone, treeCount, selectedTreeIndexes, treeNames, userId, isAdmin } = req.body;
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
        amount: isAdmin ? 0 : amount,
        status: isAdmin ? 'Paid' : 'Pending',
        slipVerified: isAdmin ? true : false,
        selectedTreeIndexes: selectedTreeIndexes || [],
        treeNames: treeNames || [],
        verificationCode: ''
      });

      const createdTrees = [];
      const actualTreeNames = treeNames || [];
      const indexesToUse = selectedTreeIndexes && selectedTreeIndexes.length > 0 
        ? selectedTreeIndexes 
        : Array.from({length: Number(treeCount)}).map(() => null);

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
      }

      res.json({
        success: true,
        order,
        trees: createdTrees,
        message: 'สร้างรายการร่วมปลูกเรียบร้อยแล้ว กรุณาชำระเงินผ่าน QR Code'
      });
    } catch (e) {
      console.error('Error creating pledge order:', e);
      res.status(500).json({ error: 'ไม่สามารถสร้างรายการร่วมปลูกได้' });
    }
  };"""

new_func = """  const createPledgeHandler = async (req: express.Request, res: express.Response) => {
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
        selectedTreeIndexes: selectedTreeIndexes || [],
        treeNames: treeNames || [],
        verificationCode: ''
      });
      console.log(`[DATABASE INSERT SUCCESS] Order created with ID:`, order.id);

      const createdTrees = [];
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
        console.log(`[DATABASE INSERT SUCCESS] Tree created with Index:`, tree.index);
      }

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
  };"""

content = content.replace(old_func, new_func)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching createPledgeHandler")
