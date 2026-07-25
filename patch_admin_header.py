import re

with open("src/App.tsx", "r") as f:
    content = f.read()

old_block = r'\{isAdmin && \(\s*<div className="flex items-center gap-1 bg-amber-50 p-1\.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">.*?<EcoIcon.*?บันทึกปลูกแทน\s*</button>\s*</div>\s*\)\}'

new_block = """<div className="flex items-center gap-1 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/60 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar sm:ml-2">
              <div className={`flex items-center gap-1.5 px-2 mr-1 text-xs font-bold border-r border-amber-200/50 pr-3 ${isAdmin ? 'text-amber-900' : 'text-stone-500'}`}>
                <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-amber-600' : 'text-stone-400'}`} />
                แอดมิน
                {isAdmin ? (
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
                ) : (
                  <button
                    onClick={() => {
                      checkAdminAndExecute(() => {});
                    }}
                    className="text-[9px] text-emerald-600 hover:text-emerald-700 transition ml-1 cursor-pointer font-black font-mono bg-white px-1.5 py-0.5 rounded-md border border-stone-200"
                  >
                    เข้าสู่ระบบ
                  </button>
                )}
              </div>
              <button
                onClick={() => checkAdminAndExecute(() => setActiveTab('admin-dashboard'))}
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
            </div>"""

content = re.sub(old_block, new_block, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
