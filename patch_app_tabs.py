import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add Admin panel tab
tab_nav = """
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
              
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin-orders')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'admin-orders'
                      ? 'bg-purple-700 text-white shadow-sm font-black'
                      : 'text-stone-600 hover:text-purple-900 hover:bg-white/80'
                  }`}
                >
                  <EcoIcon className={`w-4 h-4 ${activeTab === 'admin-orders' ? 'text-amber-300' : 'text-purple-600'}`} />
                  ยืนยันการปลูก (รอส่ง Line OA)
                </button>
              )}
"""

content = content.replace("""              <button
                onClick={() => setActiveTab('my-trees')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'my-trees'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${activeTab === 'my-trees' ? 'text-amber-300' : 'text-emerald-600'}`} />
                ต้นไม้ของฉัน
              </button>""", tab_nav)


# Render the new tab
tab_content = """
            {activeTab === 'my-trees' && (
              <UserDashboard
                trees={trees}
                onViewCertificate={handleViewCertificate}
                onGoToPlanting={() => {
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
              />
            )}
            
            {activeTab === 'admin-orders' && isAdmin && (
              <AdminOrders />
            )}
"""

content = content.replace("""            {activeTab === 'my-trees' && (
              <UserDashboard
                trees={trees}
                onViewCertificate={handleViewCertificate}
                onGoToPlanting={() => {
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
              />
            )}""", tab_content)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
