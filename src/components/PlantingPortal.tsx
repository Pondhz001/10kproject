import React, { useState, useEffect, useMemo } from 'react';
import { Tree, Order } from '../types';
import { MessageCircle, Copy, CheckCircle, Trees, Loader2, Sparkles, Plus, X, QrCode, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import ForestMap from './ForestMap';

interface PlantingPortalProps {
  onOrderCompleted: (order: Order, newTrees: Tree[]) => void;
  onOrderCreated?: () => void;
  preSelectedTreeIndex?: number | null;
  setPreSelectedTreeIndex?: (index: number | null) => void;
  preSelectedTreeIndexes?: number[];
  setPreSelectedTreeIndexes?: (indexes: number[]) => void;
  trees: Tree[];
  initialMemberMode?: boolean;
  isAdmin?: boolean;
  onNavigateToMyTrees?: () => void;
  initialSubTab?: 'new' | 'verify';
}

const PlantingPortal: React.FC<PlantingPortalProps> = ({ 
  onOrderCompleted,
  onOrderCreated,
  preSelectedTreeIndexes = [],
  setPreSelectedTreeIndexes,
  trees
}) => {
  const [donorName, setDonorName] = useState('');
  const [donorOrganization, setDonorOrganization] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [treeCount, setTreeCount] = useState<number>(preSelectedTreeIndexes?.length || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [newlyPlantedTrees, setNewlyPlantedTrees] = useState<Tree[]>([]);
  const [copied, setCopied] = useState(false);
  
  const [inputIndex, setInputIndex] = useState(''); 

  useEffect(() => {
    if (preSelectedTreeIndexes && preSelectedTreeIndexes.length > 0) {
      setTreeCount(preSelectedTreeIndexes.length);
    }
  }, [preSelectedTreeIndexes]);

  const availableOptions = useMemo(() => {
    const takenIndexes = new Set(trees.map(t => t.index));
    const opts = [];
    for (let i = 100001; i <= 110000 && opts.length < 50; i++) {
      if (!takenIndexes.has(i) && !preSelectedTreeIndexes.includes(i)) {
        opts.push(i);
      }
    }
    return opts;
  }, [trees, preSelectedTreeIndexes]);

  const handleAddIndex = () => {
    const idx = parseInt(inputIndex);
    if (idx >= 100001 && idx <= 110000) {
      if (trees.some(t => t.index === idx)) {
        setErrorMsg(`พิกัดต้นไม้ #${idx} มีผู้อุปถัมภ์แล้ว`);
      } else if (preSelectedTreeIndexes.includes(idx)) {
        setErrorMsg(`คุณได้เลือกพิกัด #${idx} ไปแล้ว`);
      } else {
        if (setPreSelectedTreeIndexes) {
          setPreSelectedTreeIndexes([...preSelectedTreeIndexes, idx]);
        }
        setInputIndex('');
        setErrorMsg('');
      }
    } else {
      setErrorMsg('หมายเลขต้นไม้ต้องอยู่ระหว่าง 100001 - 110000');
    }
  };

  const handleRemoveIndex = (idx: number) => {
    if (setPreSelectedTreeIndexes) {
      setPreSelectedTreeIndexes(preSelectedTreeIndexes.filter(i => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone) {
      setErrorMsg('กรุณากรอกชื่อและเบอร์โทรติดต่อ');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          donorOrganization,
          donorPhone,
          treeCount: Math.max(treeCount, preSelectedTreeIndexes?.length || 1),
          selectedTreeIndexes: preSelectedTreeIndexes || []
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การลงทะเบียนล้มเหลว');
      }
      
      setSuccessOrder(data.order || data);
      setNewlyPlantedTrees(data.trees || []);
      if (onOrderCreated) onOrderCreated();
      if (setPreSelectedTreeIndexes) setPreSelectedTreeIndexes([]);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!successOrder) return;
    const treeNumbers = newlyPlantedTrees.map(t => t.index).join(', ');
    const text = `ขอร่วมอุปถัมภ์กล้าไม้ โครงการ 10K หมื่นกล้าป่าเขียว\nชื่อ: ${successOrder.donorName}\nองค์กร: ${successOrder.donorOrganization || '-'}\nติดต่อ: ${successOrder.donorPhone}\nจำนวน: ${successOrder.treeCount} ต้น (ยอดโอน ${successOrder.amount} บาท)\nพิกัดต้น: ${treeNumbers}\n\n(แนบสลิปการโอนเงินด้านล่างนี้ได้เลยครับ/ค่ะ)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (successOrder) {
        
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-12 pt-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-emerald-950">ลงทะเบียนสำเร็จ!</h2>
          <p className="text-stone-600">
            ระบบได้บันทึกข้อมูลและจองพิกัดต้นไม้ของคุณเรียบร้อยแล้ว 
            กรุณาสแกน QR Code ด้านล่างเพื่อชำระเงิน จากนั้นคัดลอกข้อมูลและส่งให้เจ้าหน้าที่ทาง Line พร้อมสลิปโอนเงิน
          </p>

          <div className="flex flex-col items-center justify-center bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
               <QrCode className="w-5 h-5" /> 
               สแกนเพื่อชำระเงิน ({successOrder.amount} บาท)
            </h3>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-100">
               <img src="/payment-qr.jpeg" alt="QR Code" className="w-full max-w-[280px] h-auto object-contain rounded-lg mx-auto" />
            </div>
            <p className="text-xs font-bold text-stone-600 bg-amber-100 px-3 py-1 rounded-full">ยอดที่ต้องโอน: {successOrder.amount} บาท</p>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-left font-mono text-sm text-stone-700 whitespace-pre-wrap relative">
            ขอร่วมอุปถัมภ์กล้าไม้ โครงการ 10K หมื่นกล้าป่าเขียว<br />
            ชื่อ: {successOrder.donorName}<br />
            องค์กร: {successOrder.donorOrganization || '-'}<br />
            ช่องทางติดต่อ: {successOrder.donorPhone}<br />
            จำนวน: {successOrder.treeCount} ต้น (ยอดโอน {successOrder.amount} บาท)<br />
            พิกัดต้น: {newlyPlantedTrees.map(t => t.index).join(', ')}<br /><br />
            (แนบสลิปการโอนเงินด้านล่างนี้ได้เลยครับ/ค่ะ)
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={copyToClipboard}
              className={`py-4 font-bold text-lg rounded-2xl transition shadow-sm flex items-center justify-center gap-2 ${
                copied ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อมูลเพื่อส่ง Line'}
            </button>
            <a
              href="https://lin.ee/Sv5qrGD"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 bg-[#00B900] hover:bg-[#009900] text-white font-black text-lg rounded-2xl transition shadow-xl hover:scale-[1.02] inline-flex items-center justify-center gap-3 no-underline"
              onClick={() => onOrderCompleted(successOrder, newlyPlantedTrees)}
            >
              <MessageCircle className="w-6 h-6 animate-pulse" />
              แอด Line แจ้งชำระเงินพร้อมสลิป
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12 pt-4">

      <div className="space-y-4">
        <h3 className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-600" /> แผนที่กล้าไม้ในโครงการ
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          คลิกเลือกกล้าไม้ที่ต้องการอุปถัมภ์จากแผนที่ด้านล่าง ระบบจะเพิ่มลงในฟอร์มอัตโนมัติ (เลือกได้มากกว่า 1 ต้น)
        </p>
        <ForestMap 
           trees={trees} 
           onSelectTree={() => {}} 
           selectedTree={null} 
           onJoinPlantingMultiple={(indexes) => {
               if (setPreSelectedTreeIndexes) setPreSelectedTreeIndexes(indexes);
               // Scroll to form
               document.getElementById('planting-form')?.scrollIntoView({ behavior: 'smooth' });
           }} 
        />
      </div>

      <motion.div 
        id="planting-form"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-8"
      >
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl lg:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
              ร่วมปลูกกล้าไม้สัก
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              กรอกข้อมูลเพื่อลงทะเบียนรับพิกัดกล้าไม้ จากนั้นระบบจะเตรียมข้อมูลให้คุณคัดลอกไปส่งให้เจ้าหน้าที่ทาง Line
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-4">
             <h3 className="font-bold text-emerald-900 flex items-center gap-2">
               <Trees className="w-5 h-5 text-emerald-600" />
               พิกัดที่คุณเลือก
             </h3>
             
             {preSelectedTreeIndexes && preSelectedTreeIndexes.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {preSelectedTreeIndexes.map(idx => (
                   <span key={idx} className="bg-emerald-600 text-white pl-2.5 pr-1 py-1 rounded-lg text-xs font-mono font-bold shadow-sm flex items-center gap-1">
                     #{idx}
                     <button onClick={() => handleRemoveIndex(idx)} className="hover:bg-emerald-700 p-0.5 rounded-full" type="button">
                        <X className="w-3 h-3" />
                     </button>
                   </span>
                 ))}
               </div>
             ) : (
               <p className="text-xs text-stone-500">
                 คุณยังไม่ได้เลือกพิกัดจากแผนที่ ระบบจะทำการสุ่มพิกัดให้โดยอัตโนมัติ
               </p>
             )}
             
             <div className="pt-2 border-t border-emerald-200/50 space-y-3">
                <div className="text-xs font-bold text-emerald-800">เลือกพิกัดเพิ่ม:</div>
                <div className="flex gap-2">
                   <select 
                     className="flex-1 px-3 py-2 text-sm bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     onChange={(e) => {
                       const idx = parseInt(e.target.value);
                       if (idx && !preSelectedTreeIndexes.includes(idx) && setPreSelectedTreeIndexes) {
                          setPreSelectedTreeIndexes([...preSelectedTreeIndexes, idx]);
                       }
                       e.target.value = "";
                     }}
                   >
                     <option value="">-- เลือกจากพิกัดที่ว่าง --</option>
                     {availableOptions.map(opt => (
                       <option key={opt} value={opt}>พิกัด #{opt}</option>
                     ))}
                   </select>
                </div>
                
                <div className="flex gap-2">
                   <input 
                      type="number" 
                      placeholder="หรือระบุเลข 100001..." 
                      className="flex-1 px-3 py-2 text-sm bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={inputIndex}
                      onChange={(e) => setInputIndex(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIndex(); } }}
                   />
                   <button 
                     type="button" 
                     onClick={handleAddIndex}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl flex items-center justify-center transition"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="md:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                ชื่อ - นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                placeholder="ชื่อสำหรับสลักบนป้าย"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                หน่วยงาน / องค์กร (ถ้ามี)
              </label>
              <input
                type="text"
                value={donorOrganization}
                onChange={e => setDonorOrganization(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                placeholder="ชื่อองค์กร หรือ บริษัท"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                ช่องทางติดต่อ (เบอร์โทรศัพท์ / Line ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={donorPhone}
                onChange={e => setDonorPhone(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                placeholder="สำหรับใช้ยืนยันการรับเกียรติบัตร"
              />
            </div>

            {(!preSelectedTreeIndexes || preSelectedTreeIndexes.length === 0) && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  จำนวนกล้าไม้ที่ต้องการอุปถัมภ์ (100฿ / ต้น) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={treeCount}
                  onChange={e => setTreeCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition font-mono"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="pt-4 border-t border-stone-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl transition shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  ลงทะเบียน
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlantingPortal;
