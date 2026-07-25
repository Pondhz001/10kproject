import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix the <nav className="flex gap-1 bg-amber-50 p-1.5 ... ">
old_nav = '<nav className="flex gap-1 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">'
new_nav = """<div className="flex items-center gap-1 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">
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

content = content.replace(old_nav, new_nav)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
