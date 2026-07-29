import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Match the two member buttons
pattern1 = r'<\s*button\s+onClick=\{\(\)\s*=>\s*\{\s*setPlantMode\(\'member\'\);\s*setPlantSubTab\(\'new\'\);.*?แจ้งโอนเงิน/ยืนยันการซื้อ\s*</button>'
replacement1 = '''<a
                href="https://lin.ee/Sv5qrGD"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer bg-[#00B900] text-white shadow-md hover:bg-[#009900] hover:scale-105 no-underline"
              >
                <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                ร่วมปลูก (แอด Line OA)
              </a>'''

content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

pattern2 = r'<\s*button\s+onClick=\{\(\)\s*=>\s*\{\s*checkAdminAndExecute\(\(\)\s*=>\s*\{\s*setPlantMode\(\'admin\'\);\s*setActiveTab\(\'plant\'\);\s*\}\);\s*\}\}.*?บันทึกปลูกแทน\s*</button>'

replacement2 = '''<button
                onClick={() => {
                  checkAdminAndExecute(() => {
                    setPlantMode('member');
                    setPlantSubTab('new');
                    setActiveTab('plant');
                  });
                }}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member' && plantSubTab === 'new'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' && plantSubTab === 'new' ? 'text-stone-950' : 'text-amber-700'}`} />
                สร้างฟอร์ม (สมาชิก)
              </button>
              <button
                onClick={() => {
                  checkAdminAndExecute(() => {
                    setPlantMode('admin');
                    setActiveTab('plant');
                  });
                }}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'admin'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
                }`}
              >
                <EcoIcon className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'admin' ? 'text-stone-950' : 'text-amber-700'}`} />
                บันทึกปลูกแทน
              </button>'''

content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done regex patch.")
