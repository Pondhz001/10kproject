with open("server.ts", "r") as f:
    content = f.read()

content = content.replace(
    "const PORT = Number(process.env.PORT) || 3000;",
    "const PORT = 3000;"
)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching Port")
