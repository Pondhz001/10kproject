import re

with open("src/App.tsx", "r") as f:
    content = f.read()

nav_str = """
              <button
                onClick={() => {
                  setPlantMode('member');
                  setPlantSubTab('new');
                  setActiveTab('plant');
                }}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member' && plantSubTab === 'new'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' && plantSubTab === 'new' ? 'text-amber-300' : 'text-amber-500'}`} />
                ร่วมปลูก (สมาชิก)
              </button>

              <button
                onClick={() => {
                  setPlantMode('member');
                  setPlantSubTab('verify');
                  setActiveTab('plant');
                }}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member' && plantSubTab === 'verify'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' && plantSubTab === 'verify' ? 'text-amber-300' : 'text-emerald-600'}`} />
                แจ้งโอนเงิน/ยืนยันการซื้อ
              </button>
"""

content = re.sub(
    r'<button\s+onClick=\{\(\) => \{\s*setPlantMode\(\'member\'\);\s*setPlantSubTab\(\'new\'\);\s*setActiveTab\(\'plant\'\);\s*\}\}.*?ร่วมปลูก \(สมาชิก\)\s*</button>',
    nav_str,
    content,
    flags=re.DOTALL
)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done App.tsx nav")
