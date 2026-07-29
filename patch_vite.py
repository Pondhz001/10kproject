import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace(
    '''  // ==========================================
  // Vite Server Setup for Client Assets
  // ==========================================
  // ==========================================
  // Vite Server Setup for Client Assets
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {''',
    '''  // ==========================================
  // Vite Server Setup for Client Assets
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then(vite => {
      app.use(vite.middlewares);
    });
  } else {'''
)

# In case it wasn't duplicated that way:
content = content.replace(
    '''  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {''',
    '''  if (process.env.NODE_ENV !== 'production') {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then(vite => {
      app.use(vite.middlewares);
    });
  } else {'''
)

with open("server.ts", "w") as f:
    f.write(content)
print("Fixed Vite async")
