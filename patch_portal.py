import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Add to interface
content = content.replace(
    'onOrderCompleted: (order: Order, newTrees: Tree[]) => void;',
    'onOrderCompleted: (order: Order, newTrees: Tree[]) => void;\n  onOrderCreated?: () => void;'
)

# Add to destructuring
content = content.replace(
    'onNavigateToMyTrees',
    'onNavigateToMyTrees,\n  onOrderCreated'
)

# Call it in handleCreateOrder
content = content.replace(
    'setActiveOrder(responseData.order);',
    'setActiveOrder(responseData.order);\n          if (onOrderCreated) onOrderCreated();'
)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done PlantingPortal")
