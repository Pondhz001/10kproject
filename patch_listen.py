import re

with open("server.ts", "r") as f:
    content = f.read()

old_listen = """  if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);
    });
  }"""

new_listen = """  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Muen Kla Pa Khiao Backend running on port ${PORT}`);
  });"""

content = content.replace(old_listen, new_listen)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching Listen")
