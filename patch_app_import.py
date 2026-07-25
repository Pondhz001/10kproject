import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import AboutCampaign from './components/AboutCampaign';",
    "import AboutCampaign from './components/AboutCampaign';\nimport AdminOrders from './components/AdminOrders';"
)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
