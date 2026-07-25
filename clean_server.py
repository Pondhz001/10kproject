import re

with open("server.ts", "r") as f:
    content = f.read()

# Remove the verifySlipHandler endpoint
verify_regex = r"  const verifySlipHandler = async \(req: express\.Request, res: express\.Response\) => \{.*?\n  app\.post\('/api/payment/verify-slip', verifySlipHandler\);\n"
content = re.sub(verify_regex, "", content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
print("Done")
