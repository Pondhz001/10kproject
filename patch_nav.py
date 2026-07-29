import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace the two member buttons in the nav
old_nav = '''              <button
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
              </button>'''

new_nav = '''              <a
                href="https://lin.ee/Sv5qrGD"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer bg-[#00B900] text-white shadow-md hover:bg-[#009900] hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                ร่วมปลูก (แอด Line OA)
              </a>'''

content = content.replace(old_nav, new_nav)

# Add the member planting to admin menu
old_admin_btn = '''              <button
                onClick={() => {
                  checkAdminAndExecute(() => {
                    setPlantMode('admin');
                    setActiveTab('plant');
                  });
                }}'''

new_admin_btn = '''              <button
                onClick={() => {
                  checkAdminAndExecute(() => {
                    setPlantMode('member');
                    setPlantSubTab('new');
                    setActiveTab('plant');
                  });
                }}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' ? 'text-stone-950' : 'text-amber-700'}`} />
                สร้างฟอร์ม (สมาชิก)
              </button>
              <button
                onClick={() => {
                  checkAdminAndExecute(() => {
                    setPlantMode('admin');
                    setActiveTab('plant');
                  });
                }}'''

content = content.replace(old_admin_btn, new_admin_btn)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Nav patched successfully.")
