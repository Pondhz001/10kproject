import re

with open("server.ts", "r") as f:
    content = f.read()

old_func = """  app.post('/api/orders/confirm', async (req, res) => {
    try {
      const { verificationCode, orderId } = req.body;
      
      const targetId = verificationCode || orderId;
      if (!targetId) {
        return res.status(400).json({ error: 'กรุณาระบุ Order ID' });
      }

      if (orderId && verificationCode && orderId !== verificationCode) {
         return res.status(400).json({ error: 'Order ID ไม่ถูกต้อง' });
      }
      
      let order = await LocalDb.getOrder(targetId);
      
      if (!order) {
        return res.status(404).json({ error: 'ไม่พบรายการร่วมปลูก หรือ Order ID ไม่ถูกต้อง' });
      }
      
      if (order.status !== 'Pending') {
        return res.status(400).json({ error: 'รายการนี้ได้รับการยืนยันไปแล้ว' });
      }
      
      const updatedOrder = await LocalDb.updateOrder(order.id, {
        status: 'Paid',
        slipVerified: true
      });
      
      const trees = await LocalDb.getTrees();
      const orderTrees = trees.filter(t => order.selectedTreeIndexes?.includes(t.index));
      
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
        }
      }
      
      res.json({ success: true, message: 'ยืนยันการปลูกสำเร็จ' });
    } catch (e) {
      console.error('Error confirming order:', e);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการยืนยัน' });
    }
  });"""

new_func = """  app.post('/api/orders/confirm', async (req, res) => {
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
  });"""

content = content.replace(old_func, new_func)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching confirm handler")
