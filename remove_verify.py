import re
with open("src/App.tsx", "r") as f:
    content = f.read()

content = re.sub(r'import VerifyPlanting from \'./components/VerifyPlanting\';\n', '', content)
content = re.sub(r'\{\s*activeTab === \'verify\' && \(\s*<VerifyPlanting.*?/>\s*\)\}', '', content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
