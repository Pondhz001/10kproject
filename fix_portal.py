import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '  onNavigateToMyTrees,\n  onOrderCreated?: () => void;',
    '  onNavigateToMyTrees?: () => void;'
)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done fix portal")
