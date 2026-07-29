with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace("                      {/* Seedling Selection Preview Card */}", 
                          "                    </div>\n                      {/* Seedling Selection Preview Card */}")

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
