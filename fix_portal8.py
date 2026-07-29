import re
with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = re.sub(r'\)\s*</div>', '))}</div>', content)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
