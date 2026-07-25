import re

with open("src/db.ts", "r") as f:
    content = f.read()

content = content.replace("const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;",
                          "const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');\n    const id = `MK-${randomStr}`;")

with open("src/db.ts", "w") as f:
    f.write(content)
print("Done db.ts")
