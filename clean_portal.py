import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Remove the whole handleVerifySlip function
content = re.sub(r"  // Slip Verify handler.*?  \};\n", "", content, flags=re.DOTALL)

# Remove the unused states
content = re.sub(r"  const \[dragActive, setDragActive\] = useState\(false\);\n", "", content)
content = re.sub(r"  const \[uploadedFile, setUploadedFile\] = useState<File \| null>\(null\);\n", "", content)
content = re.sub(r"  const \[previewUrl, setPreviewUrl\] = useState<string \| null>\(null\);\n", "", content)
content = re.sub(r"  const \[isVerifyingSlip, setIsVerifyingSlip\] = useState\(false\);\n", "", content)
content = re.sub(r"  const \[verifyError, setVerifyError\] = useState<string \| null>\(null\);\n", "", content)
content = re.sub(r"  const \[verifyStep, setVerifyStep\] = useState<string>\(''\);\n", "", content)
content = re.sub(r"  const fileInputRef = useRef<HTMLInputElement>\(null\);\n", "", content)

# Remove the drag/drop handler functions
content = re.sub(r"  const handleDrag =.*?  \};\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const handleDrop =.*?  \};\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const processFile =.*?  \};\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const fileToBase64 =.*?  \};\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const handleFileChange =.*?  \};\n", "", content, flags=re.DOTALL)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
