import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Make the wrapper for tabs more elegant
old_tabs_html = """
      {isMemberMode && !isAdmin && (
        <div className="flex space-x-2 border-b border-stone-200 mb-6">"""

new_tabs_html = """
      {isMemberMode && !isAdmin && (
        <div className="flex space-x-6 border-b border-stone-200 mb-8 px-2 relative z-10">"""
        
content = content.replace(old_tabs_html, new_tabs_html)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
