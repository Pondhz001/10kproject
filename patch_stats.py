import re

with open("server.ts", "r") as f:
    content = f.read()

old_stats = """  app.get('/api/stats', async (req, res) => {
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
      });"""

new_stats = """  app.get('/api/stats', async (req, res) => {
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
      });"""

content = content.replace(old_stats, new_stats)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching stats")
