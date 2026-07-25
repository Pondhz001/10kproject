import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# First, extract the "แอดมิน [ออก]" block
admin_label_regex = r'\{isAdmin && \(\s*<div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 px-3 py-1\.5 rounded-xl text-xs text-amber-900 font-medium shrink-0 shadow-xs">.*?</button>\s*</div>\s*\)\}'
admin_label_match = re.search(admin_label_regex, content, flags=re.DOTALL)
if admin_label_match:
    admin_label_html = admin_label_match.group(0)
    # Remove from its current place
    content = content[:admin_label_match.start()] + content[admin_label_match.end():]
    
    # Let's place it inside the Admin nav, or before the buttons in the Admin nav.
    admin_nav_regex = r'<nav className="flex gap-1 bg-amber-50 p-1\.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">'
    
    # We will just prepend it to the admin nav
    new_admin_nav_start = """<div className="flex items-center gap-1 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">
                <div className="flex items-center gap-1.5 px-2 mr-1 text-xs text-amber-900 font-bold border-r border-amber-200/50 pr-3">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  แอดมิน
                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      localStorage.removeItem('is_admin');
                      setActiveTab('map');
                    }}
                    className="text-[9px] text-stone-400 hover:text-red-600 transition ml-1 cursor-pointer font-black font-mono bg-white px-1.5 py-0.5 rounded-md border border-stone-200"
                  >
                    ออก
                  </button>
                </div>"""
                
    content = content.replace(admin_nav_regex, new_admin_nav_start)
    content = content.replace('</nav>\n            )}', '</div>\n            )}')

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
