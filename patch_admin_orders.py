import re

with open("server.ts", "r") as f:
    content = f.read()

new_api = """
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
"""

# Insert before `app.post('/api/orders/confirm', ...)`
content = content.replace("  app.post('/api/orders/confirm', async (req, res) => {", new_api + "\n  app.post('/api/orders/confirm', async (req, res) => {")

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching Admin Orders API")
