import React, { useState, useEffect } from 'react';
import { Tree } from '../types';
import { Trees, Calendar, Award, Image as ImageIcon, ChevronRight, Phone, ShieldCheck, Search, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CertificateCanvas from './CertificateCanvas';

interface UserDashboardProps {
  trees?: Tree[];
  onViewCertificate?: (tree: Tree) => void;
  onGoToPlanting?: () => void;
}

export default function UserDashboard({ trees = [], onViewCertificate, onGoToPlanting }: UserDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userTrees, setUserTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCertTree, setSelectedCertTree] = useState<Tree | null>(null);

  useEffect(() => {
    fetchUserTrees();
  }, [trees]);

  const fetchUserTrees = async () => {
    setLoading(true);
    try {
      let filtered: Tree[] = [];

      // If user provided a search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const cleanPhoneQuery = query.replace(/\D/g, '');
        
        const matches = trees.filter(t => {
          if (cleanPhoneQuery && t.ownerPhone && t.ownerPhone.replace(/\D/g, '').includes(cleanPhoneQuery)) return true;
          if (t.ownerName && t.ownerName.toLowerCase().includes(query)) return true;
          if (t.index && t.index.toString() === cleanPhoneQuery) return true;
          return false;
        });
        
        // Merge without duplicates
        const existingIds = new Set(filtered.map(t => t.id));
        matches.forEach(t => {
          if (!existingIds.has(t.id)) filtered.push(t);
        });
      }

      setUserTrees(filtered);
    } catch (e) {
      console.error('Failed to load user trees', e);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'Seedling': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Growing': 'bg-green-100 text-green-800 border-green-300',
    'Young Tree': 'bg-teal-100 text-teal-800 border-teal-300',
    'Mature': 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const statusTextTh = {
    'Seedling': 'กล้าไม้แรกปลูก (Seedling)',
    'Growing': 'กำลังเจริญเติบโต (Growing)',
    'Young Tree': 'ต้นสักวัยรุ่น (Young Tree)',
    'Mature': 'ต้นสักสมบูรณ์ (Mature)',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700/80 border-2 border-emerald-400/30 flex items-center justify-center text-emerald-200 shadow-lg">
              <Trees className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                  ระบบติดตามต้นไม้
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                ระบบบันทึกและติดตามกล้าไม้ส่วนบุคคล
              </h1>
              <p className="text-xs text-emerald-200/90 font-mono mt-1">
                ตรวจสอบสถานะ รูปการเติบโต และใบประกาศกล้าไม้สักของคุณ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-900/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาด้วยเบอร์โทรศัพท์ ชื่อ หรือเลขต้นไม้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
        <button
          onClick={fetchUserTrees}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>ค้นหากล้าไม้</span>
        </button>
      </div>

      {/* Trees List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-600" />
            <span>ต้นไม้สักของคุณในโครงการ ({userTrees.length} ต้น)</span>
          </h2>
        </div>

        {userTrees.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <Trees className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-stone-800 text-base">ยังไม่พบข้อมูลกล้าไม้สักของคุณ</h3>
              <p className="text-xs text-stone-500">
                หากคุณเพิ่งร่วมปลูกสำเร็จ สามารถค้นหาด้วยเบอร์โทรศัพท์ ชื่อ หรือหมายเลขต้นไม้ได้ทันที หรือเลือกเมนู "ร่วมปลูก" ด้านบน
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userTrees.map((tree) => (
              <motion.div
                key={tree.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-stone-50 p-4 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      #{tree.index}
                    </span>
                    <h3 className="font-black text-stone-900 text-base mt-1">
                      {tree.ownerName}
                    </h3>
                    {tree.ownerOrganization && (
                      <p className="text-xs font-semibold text-emerald-700 font-sans">
                        🏢 {tree.ownerOrganization}
                      </p>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[tree.status] || 'bg-stone-100 text-stone-700'}`}>
                    {statusTextTh[tree.status] || tree.status}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xl font-mono">
                    <div>
                      <span className="text-stone-400 block text-[10px]">ความสูงต้นกล้า</span>
                      <span className="font-bold text-emerald-900">{tree.height} ซม.</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">ดูดซับ CO2 สะสม</span>
                      <span className="font-bold text-emerald-700">{tree.carbonOffset} kgCO2e</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">วันที่ลงทะเบียนปลูก</span>
                      <span className="font-semibold text-stone-700">
                        {new Date(tree.plantedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">เบอร์โทรศัพท์</span>
                      <span className="font-semibold text-stone-700">{tree.ownerPhone}</span>
                    </div>
                  </div>

                  {/* Care Growth Log Images */}
                  {tree.careHistory && tree.careHistory.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ประวัติการเจริญเติบโต ({tree.careHistory.length} บันทึก)</span>
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {tree.careHistory.slice(0, 2).map((log, i) => (
                          <div key={i} className="bg-stone-50 rounded-xl p-2 border border-stone-200/60 space-y-1.5">
                            <img src={log.image} alt={log.note} className="w-full h-24 object-cover rounded-lg" />
                            <div className="text-[10px] text-stone-600">
                              <span className="font-bold block text-emerald-800">{log.date}</span>
                              <p className="line-clamp-2">{log.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCertTree(tree)}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>ดาวน์โหลดเกียรติบัตรอนุโมทนา</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCertTree && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-emerald-900/10 my-8"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-emerald-950 text-base">
                    ใบประกาศเกียรติคุณ - คุณ {selectedCertTree.ownerName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCertTree(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-x-auto smooth-scroll flex justify-center py-2">
                <CertificateCanvas
                  donorName={selectedCertTree.ownerName}
                  treeCount={1}
                  selectedTreeIndexes={[selectedCertTree.index]}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedCertTree(null)}
                  className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
