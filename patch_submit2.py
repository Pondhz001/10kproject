import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

replacement = """      const responseData = await response.json();
      if (responseData.order) {
        if (responseData.order.status === 'Paid') {
          onOrderCompleted(responseData.order, responseData.trees || []);
        } else {
          setActiveOrder(responseData.order);
        }
      } else {"""

content = content.replace("""      const responseData = await response.json();
      if (responseData.order) {
        setActiveOrder(responseData.order);
      } else {""", replacement)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
