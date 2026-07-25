import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'onOrderCompleted={handleOrderCompleted}',
    'onOrderCompleted={handleOrderCompleted}\n                onOrderCreated={() => fetchStatsAndTrees()}'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done App.tsx")
