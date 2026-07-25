import re

with open("src/types.ts", "r") as f:
    content = f.read()

content = content.replace(
    "status: 'Seedling' | 'Growing' | 'Young Tree' | 'Mature';",
    "status: 'Pending Verification' | 'Seedling' | 'Growing' | 'Young Tree' | 'Mature';"
)

content = content.replace(
    "status: 'Pending' | 'Paid' | 'Failed';",
    "status: 'Pending' | 'Paid' | 'Failed';\n  verificationCode?: string;"
)

with open("src/types.ts", "w") as f:
    f.write(content)
print("Done")
