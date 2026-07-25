import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

# Remove state variables
content = re.sub(r'const \[showVerifyModal, setShowVerifyModal\] = useState\(false\);\n', '', content)
content = re.sub(r'const \[verificationCode, setVerificationCode\] = useState\(\'\'\);\n', '', content)
content = re.sub(r'const \[isVerifying, setIsVerifying\] = useState\(false\);\n', '', content)
content = re.sub(r'const \[verifyResult, setVerifyResult\] = useState<\{success: boolean, message: string\} \| null>\(null\);\n', '', content)

# Remove handleVerify
handle_regex = r'const handleVerify = async \(\) => \{.*?\};\n'
content = re.sub(handle_regex, '', content, flags=re.DOTALL)

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("Done HomeCampaign 2")
