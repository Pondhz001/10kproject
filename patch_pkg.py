import json

with open("package.json", "r") as f:
    data = json.load(f)

data["main"] = "app.js"

with open("package.json", "w") as f:
    json.dump(data, f, indent=2)

print("Done")
