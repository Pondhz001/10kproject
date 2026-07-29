with open("src/components/HomeCampaign.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "{/* 4. STEPS TO JOIN */}" in line:
        skip = True
    
    if skip and "</div>" in line and i > 324: # roughly line 324 is the end of the section
        pass

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.writelines(new_lines)
