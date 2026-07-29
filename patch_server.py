import re

with open("server.ts", "r") as f:
    content = f.read()

# Remove startServer
content = content.replace(
    'const app = express();\n\nasync function startServer() {\n  try {\n    await connectDB();\n    console.log("MongoDB Connection Initialized successfully");\n  } catch (err) {\n    console.error("Failed to connect to MongoDB on startup:", err);\n    if (process.env.NODE_ENV !== "production") process.exit(1);\n  }',
    'const app = express();\nconnectDB().catch(console.error);'
)

# Fix Vite async middleware
content = content.replace(
    '''  // ==========================================
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

content = content.replace(
    '''    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);
    });
  }
}

export default app;''',
    '''    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);
    });
  }

export default app;'''
)


with open("server.ts", "w") as f:
    f.write(content)
print("Done refactoring server.ts")
