import re

with open("server.ts", "r") as f:
    content = f.read()

get_orders = """
  // Get all orders (Admin only)
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await LocalDb.getOrders();
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });
"""

# Insert before `// Create order/pledge`
content = content.replace("  // Create order/pledge (Supported via both /api/forest/pledge and /api/orders)", get_orders + "\n  // Create order/pledge (Supported via both /api/forest/pledge and /api/orders)")

with open("server.ts", "w") as f:
    f.write(content)
print("Done")
