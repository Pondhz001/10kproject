import re

with open("server.ts", "r") as f:
    content = f.read()

# Make app accessible outside
content = content.replace(
    'async function startServer() {\n  try {\n    await connectDB();',
    'const app = express();\n\nasync function startServer() {\n  try {\n    await connectDB();'
)
content = content.replace(
    '  } catch (err) {\n    console.error("Failed to connect to MongoDB on startup:", err);\n    process.exit(1);\n  }\n  const app = express();',
    '  } catch (err) {\n    console.error("Failed to connect to MongoDB on startup:", err);\n    if (process.env.NODE_ENV !== "production") process.exit(1);\n  }'
)

# Export app for Vercel
content = content.replace(
    "  app.listen(PORT, '0.0.0.0', () => {\n    console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);\n  });\n}",
    "  if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {\n    app.listen(PORT, '0.0.0.0', () => {\n      console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);\n    });\n  }\n}\n\nexport default app;"
)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching Vercel server.ts")
