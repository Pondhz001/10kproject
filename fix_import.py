with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

content = content.replace("  Trees,", "  MessageCircle,\n  Trees,")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
