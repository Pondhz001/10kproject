import re
with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace('''                          </span>
                        )    </div>''', '''                          </span>
                        ))}
                      </div>''')

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
