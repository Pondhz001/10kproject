import re

with open("server.ts", "r") as f:
    content = f.read()

confirm_handler = r"""
  app.post('/api/orders/confirm', async (req, res) => {
    try {
      const { orderId, verificationCode } = req.body;
      const order = await LocalDb.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'ไม่พบรายการร่วมปลูก' });
      }
      
      if (order.status !== 'Pending') {
        return res.status(400).json({ error: 'รายการนี้ได้รับการยืนยันไปแล้ว' });
      }
      
      if (order.verificationCode !== verificationCode) {
        return res.status(400).json({ error: 'รหัสยืนยันไม่ถูกต้อง' });
      }
      
      const updatedOrder = await LocalDb.updateOrder(orderId, {
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
  });
"""

# Insert before `// Generate PromptPay QR Code`
content = content.replace("  // Generate PromptPay QR Code", confirm_handler + "\n  // Generate PromptPay QR Code")

with open("server.ts", "w") as f:
    f.write(content)
print("Done")
