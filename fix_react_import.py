import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

# Remove the duplicate one on line 28
content = content.replace("import React, { useState } from 'react';\nexport default function HomeCampaign({ stats, onEnterCampaign }: HomeCampaignProps) {", 
                          "export default function HomeCampaign({ stats, onEnterCampaign }: HomeCampaignProps) {")

# Modify line 1
content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("Done")
