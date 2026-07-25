import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

# I want to restore the end of the file properly.
# Find where the main div closes (which was line 330)
# Then cut everything after it and just put </>\n);\n}

# Let's search for "      </div>\n    </div>" which is the end of the main container
main_end_match = re.search(r'      </div>\n    </div>', content)
if main_end_match:
    content = content[:main_end_match.end()] + "\n    </>\n  );\n}\n"

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("Done fix_home_end")
