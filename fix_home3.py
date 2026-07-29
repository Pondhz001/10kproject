with open("src/components/HomeCampaign.tsx", "r") as f:
    lines = f.readlines()

with open("src/components/HomeCampaign.tsx", "w") as f:
    for line in lines:
        if "    </div>" == line.strip("\n"):
            pass # We will remove some trailing divs if needed
            
