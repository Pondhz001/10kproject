import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

dashboard_summary = """
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <span className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">รอยืนยัน (Pending)</span>
          <span className="text-3xl font-black text-amber-600">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <span className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">อนุมัติแล้ว (Approved)</span>
          <span className="text-3xl font-black text-emerald-600">{approvedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <span className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">จำนวนต้นไม้ที่รับอุปการะ</span>
          <span className="text-3xl font-black text-emerald-800">{totalTrees}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <span className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">พื้นที่ถูกจองแล้ว</span>
          <span className="text-3xl font-black text-emerald-900">{totalTrees} / 10,000</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="ค้นหา Order ID, ชื่อ, เบอร์โทร..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Pending', 'Paid', 'Failed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {status === 'All' ? 'ทั้งหมด' : status === 'Pending' ? 'รอยืนยัน' : status === 'Paid' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
"""

content = content.replace("{/* Tabs */}", dashboard_summary)

# Update Spreadsheet table headers
content = content.replace(
    '<th className="px-3 py-2 border border-stone-200">ระบุต้นที่ปลูก</th>\n                </tr>',
    '<th className="px-3 py-2 border border-stone-200">ระบุต้นที่ปลูก</th>\n                  <th className="px-3 py-2 border border-stone-200">จัดการ</th>\n                </tr>'
)

# Update Spreadsheet map function to use filteredOrders
content = content.replace("orders.map(order => (", "filteredOrders.map(order => (")

# Update table body for Spreadsheet
table_body_old = """                                        <td className="px-3 py-2 border border-stone-200 text-stone-500 max-w-[200px] truncate" title={order.selectedTreeIndexes?.join(', ')}>
                      {order.selectedTreeIndexes && order.selectedTreeIndexes.length > 0 
                        ? order.selectedTreeIndexes.map(i => `#MK-${i}`).join(', ') 
                        : 'สุ่มอัตโนมัติ'}
                    </td>
                  </tr>"""

table_body_new = """                                        <td className="px-3 py-2 border border-stone-200 text-stone-500 max-w-[200px] truncate" title={order.selectedTreeIndexes?.join(', ')}>
                      {order.selectedTreeIndexes && order.selectedTreeIndexes.length > 0 
                        ? order.selectedTreeIndexes.map(i => `#MK-${i}`).join(', ') 
                        : 'สุ่มอัตโนมัติ'}
                    </td>
                    <td className="px-3 py-2 border border-stone-200 text-center">
                      {order.status === 'Pending' && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleUpdateStatus(order.id, 'Paid')} className="p-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition" title="อนุมัติ">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleUpdateStatus(order.id, 'Failed')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition" title="ปฏิเสธ">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {order.status === 'Paid' && <span className="text-[10px] text-emerald-600 font-bold">Approved</span>}
                      {order.status === 'Failed' && <span className="text-[10px] text-red-600 font-bold">Rejected</span>}
                    </td>
                  </tr>"""

content = content.replace(table_body_old, table_body_new)

# Update Codes view map function to include action buttons and use filteredOrders for Pending
content = content.replace("pendingOrders.map(order => (", "filteredOrders.filter(o => o.status === 'Pending').map(order => (")

pending_body_old = """                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
                            รอยืนยัน
                          </span>
                        </td>
                      </tr>"""

pending_body_new = """                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleUpdateStatus(order.id, 'Paid')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1">
                            <Check className="w-3 h-3" /> ยืนยัน
                          </button>
                          <button onClick={() => handleUpdateStatus(order.id, 'Failed')} className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-300 transition flex items-center gap-1">
                            <X className="w-3 h-3" /> ปฏิเสธ
                          </button>
                        </td>
                      </tr>"""

content = content.replace(pending_body_old, pending_body_new)


with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
print("Done Update Admin Dashboard 2")
