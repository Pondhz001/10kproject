import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# I will replace the <nav> block with two separate <nav> blocks based on isAdmin.
old_nav_regex = r'<nav className="flex gap-1 bg-stone-100/80 p\.1\.5 rounded-2xl border border-stone-200/80 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar">.*?</nav>'

# Actually, I can use start and end markers. Let's find exactly the block to replace.
start_idx = content.find('<nav className="flex gap-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar">')
end_idx = content.find('</nav>', start_idx) + 6

if start_idx != -1 and end_idx != -1:
    new_nav_html = """<nav className="flex gap-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-amber-300' : 'text-emerald-600'}`} />
                หน้าแรก
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-emerald-800 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Info className={`w-4 h-4 ${activeTab === 'about' ? 'text-amber-300' : 'text-emerald-600'}`} />
                เกี่ยวกับโครงการ
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Trees className={`w-4 h-4 ${activeTab === 'map' ? 'text-amber-300' : 'text-emerald-600'}`} />
                กล้าไม้สักในโครงการ
              </button>

              <button
                onClick={() => {
                  setPlantMode('member');
                  setPlantSubTab('new');
                  setActiveTab('plant');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' ? 'text-amber-300' : 'text-amber-500'}`} />
                ร่วมปลูก (สมาชิก)
              </button>

              <button
                onClick={() => setActiveTab('my-trees')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'my-trees'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${activeTab === 'my-trees' ? 'text-amber-300' : 'text-emerald-600'}`} />
                ต้นไม้ของฉัน
              </button>
            </nav>

            {isAdmin && (
              <nav className="flex gap-1 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-purple-700 text-white shadow-sm font-black'
                      : 'text-stone-600 hover:text-purple-900 hover:bg-amber-100/50'
                  }`}
                >
                  <Lock className={`w-4 h-4 ${activeTab === 'admin-dashboard' ? 'text-amber-300' : 'text-purple-600'}`} />
                  ระบบจัดการข้อมูล
                </button>

                <button
                  onClick={() => {
                    checkAdminAndExecute(() => {
                      setPlantMode('admin');
                      setActiveTab('plant');
                    });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'plant' && plantMode === 'admin'
                      ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
                  }`}
                >
                  <EcoIcon className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'admin' ? 'text-stone-950' : 'text-amber-700'}`} />
                  บันทึกปลูกแทน
                </button>
              </nav>
            )}"""
            
    content = content[:start_idx] + new_nav_html + content[end_idx:]
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Done")
else:
    print("Not found")

