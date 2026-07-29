with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

import re

# Fix state initialization
old_init = '''  const [stats, setStats] = useState<CampaignStats>({
    totalPlanted: 0,
    totalDonated: 0,
    totalArea: 0,
    participants: 0,
    carbonOffset: 0
  } as any);'''

old_init_fallback = '''  const [stats, setStats] = useState<CampaignStats>({
    totalPlanted: 0,
    totalDonated: 0,
    totalArea: 0,
    participants: 0,
    carbonOffset: 0
  });'''

new_init = '''  const [stats, setStats] = useState<CampaignStats>({
    totalTarget: 10000,
    totalPlanted: 0,
    totalCO2Offset: 0,
    totalDonors: 0
  });'''

if old_init in content:
    content = content.replace(old_init, new_init)
else:
    content = content.replace(old_init_fallback, new_init)

# Fix UI usages
content = content.replace("stats.participants.toLocaleString()", "stats.totalDonors.toLocaleString()")
content = content.replace("stats.totalArea.toLocaleString()", "+(stats.totalPlanted * 0.0025).toFixed(2)")
content = content.replace("stats.carbonOffset", "stats.totalCO2Offset")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
