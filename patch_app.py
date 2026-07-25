import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add import
content = content.replace("import AdminDashboard from './components/AdminDashboard';", "import AdminDashboard from './components/AdminDashboard';\nimport VerifyPlanting from './components/VerifyPlanting';")

# Add to activeTab types
content = content.replace("'home' | 'map' | 'plant' | 'about' | 'my-trees' | 'admin-dashboard'", "'home' | 'map' | 'plant' | 'about' | 'my-trees' | 'admin-dashboard' | 'verify'")
content = content.replace("<'home' | 'map' | 'plant' | 'about' | 'my-trees'>", "<'home' | 'map' | 'plant' | 'about' | 'my-trees' | 'admin-dashboard' | 'verify'>")
content = content.replace("useState<'home' | 'map' | 'plant' | 'about' | 'my-trees'>('home');", "useState<'home' | 'map' | 'plant' | 'about' | 'my-trees' | 'admin-dashboard' | 'verify'>('home');")

# Add the Verify tab to the header (Next to 'plant')
verify_tab_html = """
              <button
                onClick={() => setActiveTab('verify')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'verify'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                    : 'text-stone-600 hover:text-amber-600 hover:bg-white/80'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${activeTab === 'verify' ? 'text-stone-950' : 'text-amber-600'}`} />
                ยืนยันการปลูก
              </button>
"""

content = content.replace("""              <button
                onClick={() => {
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <Shovel className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' ? 'text-stone-950' : 'text-amber-700'}`} />
                ร่วมปลูก (สมาชิก)
              </button>""", """              <button
                onClick={() => {
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <Shovel className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' ? 'text-stone-950' : 'text-amber-700'}`} />
                ร่วมปลูก (สมาชิก)
              </button>""" + "\n" + verify_tab_html)

# Add component rendering
verify_comp_html = """
            {activeTab === 'verify' && (
              <VerifyPlanting onVerified={() => setActiveTab('my-trees')} />
            )}
"""

content = content.replace("""            {activeTab === 'about' && (
              <AboutCampaign />
            )}""", """            {activeTab === 'about' && (
              <AboutCampaign />
            )}""" + "\n" + verify_comp_html)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done App.tsx")
