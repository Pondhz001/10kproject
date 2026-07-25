import re

with open("server.ts", "r") as f:
    content = f.read()

replacement = """
  // ==========================================
  // Vite Server Setup for Client Assets
  // ==========================================
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
"""

regex = r'// ==========================================\s*// Vite Server Setup for Client Assets\s*// ==========================================\s*if \(process\.env\.NODE_ENV !== \'production\'\) \{.*?\}\s*\}'

content = re.sub(regex, replacement, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
print("Done")
