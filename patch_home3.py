import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

content = content.replace("onEnterCampaign: (tab: 'map' | 'plant' | 'about') => void;", "onEnterCampaign: (tab: 'map' | 'plant' | 'about' | 'verify') => void;")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("Done HomeCampaign 3")
