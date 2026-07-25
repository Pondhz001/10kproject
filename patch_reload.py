import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Replace window.location.reload()
content = content.replace("onClick={() => { setActiveOrder(null); window.location.reload(); }}", 
                          "onClick={() => { onOrderCompleted(activeOrder, []); setActiveOrder(null); }}")

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
