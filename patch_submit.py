import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "userId: ''",
    "userId: '',\n          isAdmin"
)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
