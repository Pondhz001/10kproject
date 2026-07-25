import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

content = content.replace("Activity\n} from 'lucide-react';", "Activity,\n  Key,\n  X\n} from 'lucide-react';")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("Done")
