import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Search, XCircle, RefreshCw, Table2, Key, Check, X, FileImage } from 'lucide-react';
import { Order } from '../types';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spreadsheet' | 'codes'>('spreadsheet');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Failed'>('All');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const handleUpdateStatus = async (id: string, newStatus: 'Paid' | 'Failed') => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        o.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (o.donorPhone && o.donorPhone.includes(searchTerm));
    const matchStatus = statusFilter === 'All' ? true : o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalTrees = orders.filter(o => o.status === 'Paid').reduce((acc, curr) => acc + curr.treeCount, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const approvedCount = orders.filter(o => o.status === 'Paid').length;

  const pendingOrders = orders.filter(o => o.status === 'Pending');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">ระบบแดชบอร์ด (แอดมิน)</h2>
          <p className="text-xs text-stone-500 mt-1">จัดการข้อมูลผู้ร่วมปลูกและรหัสยืนยัน</p>
        </div>
        <button onClick={fetchOrders} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition shadow-sm">
          <RefreshCw className={`w-4 h-4 text-stone-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      
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

      <div className="flex space-x-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('spreadsheet')}
          className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'spreadsheet' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Table2 className="w-4 h-4" />
          ฐานข้อมูลผู้ร่วมปลูก (Spreadsheet)
        </button>
        <button
          onClick={() => setActiveTab('codes')}
          className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'codes' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Key className="w-4 h-4" />
          รหัสยืนยันการปลูก (รอส่ง Line OA)
        </button>
      </div>

      {activeTab === 'spreadsheet' && (
        <div className="bg-white border border-stone-200 shadow-sm overflow-hidden rounded-xl">
          <div className="overflow-x-auto smooth-scroll max-h-[600px] custom-scrollbar">
            <table className="w-full text-left text-[11px] font-sans border-collapse whitespace-nowrap">
              <thead className="bg-stone-100 text-stone-600 font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2 border border-stone-200">Order ID (รหัสยืนยัน)</th>
                  <th className="px-3 py-2 border border-stone-200">วันที่ทำรายการ</th>
                  <th className="px-3 py-2 border border-stone-200">ชื่อผู้ร่วมปลูก</th>
                  <th className="px-3 py-2 border border-stone-200">องค์กร/บริษัท</th>
                  <th className="px-3 py-2 border border-stone-200">เบอร์ติดต่อ</th>
                  <th className="px-3 py-2 border border-stone-200">จำนวนต้น</th>
                  <th className="px-3 py-2 border border-stone-200">ยอดเงิน (฿)</th>
                  <th className="px-3 py-2 border border-stone-200">สถานะ</th>
                                    <th className="px-3 py-2 border border-stone-200">ระบุต้นที่ปลูก</th>
                  <th className="px-3 py-2 border border-stone-200">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 transition cursor-default">
                    <td className="px-3 py-2 border border-stone-200 text-purple-600 font-bold font-mono">{order.id}</td>
                    <td className="px-3 py-2 border border-stone-200 text-stone-600">
                      {new Date(order.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-3 py-2 border border-stone-200 font-semibold text-stone-800">{order.donorName}</td>
                    <td className="px-3 py-2 border border-stone-200 text-stone-600">{order.donorOrganization || '-'}</td>
                    <td className="px-3 py-2 border border-stone-200 text-stone-600 font-mono">{order.donorPhone}</td>
                    <td className="px-3 py-2 border border-stone-200 text-emerald-700 font-bold">{order.treeCount}</td>
                    <td className="px-3 py-2 border border-stone-200 text-stone-600">{order.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 border border-stone-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status === 'Paid' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                      </span>
                    </td>
                                        <td className="px-3 py-2 border border-stone-200 text-stone-500 max-w-[200px] truncate" title={order.selectedTreeIndexes?.join(', ')}>
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
                  </tr>
                ))}
                {orders.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-stone-500">ไม่มีข้อมูล</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'codes' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            {isLoading && pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-sm">กำลังโหลด...</div>
            ) : pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-sm flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                ไม่มีรายการรอส่งรหัสยืนยัน
              </div>
            ) : (
              <div className="overflow-x-auto smooth-scroll">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">รหัสยืนยัน</th>
                      <th className="px-4 py-3">ชื่อผู้ร่วมปลูก</th>
                      <th className="px-4 py-3">เบอร์ติดต่อ</th>
                      <th className="px-4 py-3">จำนวนต้นไม้</th>
                      <th className="px-4 py-3">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.filter(o => o.status === 'Pending').map(order => (
                      <tr key={order.id} className="hover:bg-stone-50/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-600 text-lg bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {order.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-stone-800">{order.donorName}</p>
                          {order.donorOrganization && <p className="text-[10px] text-stone-500">{order.donorOrganization}</p>}
                        </td>
                        <td className="px-4 py-3 text-stone-600 font-mono">{order.donorPhone}</td>
                        <td className="px-4 py-3 text-stone-600 font-mono">{order.treeCount} ต้น</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleUpdateStatus(order.id, 'Paid')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1">
                            <Check className="w-3 h-3" /> ยืนยัน
                          </button>
                          <button onClick={() => handleUpdateStatus(order.id, 'Failed')} className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-300 transition flex items-center gap-1">
                            <X className="w-3 h-3" /> ปฏิเสธ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {orders.filter(o => o.status === 'Paid').length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-stone-600 mb-4 px-2">รายการที่ยืนยันแล้วล่าสุด</h3>
              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden opacity-70">
                <div className="overflow-x-auto smooth-scroll">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3">รหัสยืนยัน</th>
                        <th className="px-4 py-3">ชื่อผู้ร่วมปลูก</th>
                        <th className="px-4 py-3">จำนวนต้นไม้</th>
                        <th className="px-4 py-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.filter(o => o.status === 'Paid').slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td className="px-4 py-2 font-mono text-stone-400">{order.id}</td>
                          <td className="px-4 py-2 text-stone-600">{order.donorName}</td>
                          <td className="px-4 py-2 text-stone-500">{order.treeCount} ต้น</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                              ยืนยันแล้ว
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
