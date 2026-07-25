import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Add verifyError back
content = re.sub(r"  const \[manualInputError, setManualInputError\] = useState<string \| null>\(null\);\n", 
                 "  const [manualInputError, setManualInputError] = useState<string | null>(null);\n  const [verifyError, setVerifyError] = useState<string | null>(null);\n", content)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)

with open("src/App.tsx", "r") as f:
    app_content = f.read()

# Import MessageCircle in App.tsx
if "MessageCircle" not in app_content.split("import {")[1].split("}")[0]:
    app_content = app_content.replace("CheckCircle, User, Loader2", "CheckCircle, User, Loader2, MessageCircle")

with open("src/App.tsx", "w") as f:
    f.write(app_content)
    
print("Done")
