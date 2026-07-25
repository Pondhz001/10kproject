import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace(
    'async function startServer() {\n  const app = express();',
    'async function startServer() {\n  try {\n    await connectDB();\n    console.log("MongoDB Connection Initialized successfully");\n  } catch (err) {\n    console.error("Failed to connect to MongoDB on startup:", err);\n    process.exit(1);\n  }\n  const app = express();'
)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching startServer")
