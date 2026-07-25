import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'if(onNavigateToMyTrees,\n  onOrderCreated) onNavigateToMyTrees,\n  onOrderCreated();',
    'if(onNavigateToMyTrees) onNavigateToMyTrees();'
)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done Fixing Syntax Error")
