with open("server.ts", "r") as f:
    content = f.read()

patch = '''app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  });

  app.get('/api/health', (req, res) => {'''

content = content.replace("app.get('/api/health', (req, res) => {", patch)

with open("server.ts", "w") as f:
    f.write(content)
print("Patched server.ts")
