import re

with open("server.ts", "r") as f:
    content = f.read()

# 1. createPledgeHandler: remove verificationCode generation
content = content.replace("const verificationCode = isAdmin ? '' : Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code", "")
content = content.replace("verificationCode\n      });", "verificationCode: ''\n      });")

# 2. confirm endpoint
replacement = """
  app.post('/api/orders/confirm', async (req, res) => {
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
  });
"""
content = re.sub(r"  app\.post\('/api/orders/confirm', async \(req, res\) => \{.*?\n  \}\);\n", replacement, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
print("Done server")
