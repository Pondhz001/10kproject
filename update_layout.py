import re

# Read App.tsx
with open("src/App.tsx", "r") as f:
    app_content = f.read()

# We need to remove the whole section: 
# {/* Main Campaign Stats Dashboard (Bento Grid) - Conditionally hidden on Home tab */}
# to </section>

pattern = r"\{\/\* Main Campaign Stats Dashboard \(Bento Grid\).*?<\/section>\n      \)\}"
app_content_new = re.sub(pattern, "", app_content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(app_content_new)

print("App.tsx modified")
