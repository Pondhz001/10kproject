import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("import AdminOrders from './components/AdminOrders';", "import AdminDashboard from './components/AdminDashboard';")

content = content.replace("""              {isAdmin && (
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
              )}""", """              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-purple-700 text-white shadow-sm font-black'
                      : 'text-stone-600 hover:text-purple-900 hover:bg-white/80'
                  }`}
                >
                  <EcoIcon className={`w-4 h-4 ${activeTab === 'admin-dashboard' ? 'text-amber-300' : 'text-purple-600'}`} />
                  ระบบจัดการข้อมูล (แอดมิน)
                </button>
              )}""")

content = content.replace("""            {activeTab === 'admin-orders' && isAdmin && (
              <AdminOrders />
            )}""", """            {activeTab === 'admin-dashboard' && isAdmin && (
              <AdminDashboard />
            )}""")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
