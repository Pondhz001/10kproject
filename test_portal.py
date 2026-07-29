import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

print("ForestMap" in content)
