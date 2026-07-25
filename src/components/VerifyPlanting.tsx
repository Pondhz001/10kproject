import React, { useState } from 'react';
import { Key, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifyPlantingProps {
  onVerified: () => void;
}

export default function VerifyPlanting({ onVerified }: VerifyPlantingProps) {
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{success: boolean, message: string} | null>(null);

  const handleVerify = async () => {
    if(!orderId.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ verificationCode: orderId.trim(), orderId: orderId.trim() })
      });
      const data = await res.json();
      if(res.ok) {
        setVerifyResult({success: true, message: data.message});
        setTimeout(() => {
          onVerified();
        }, 2000);
      } else {
        setVerifyResult({success: false, message: data.error || 'เกิดข้อผิดพลาด'});
      }
    } catch(e) {
      setVerifyResult({success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'});
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Key className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-center text-stone-900 mb-2">ยืนยันการร่วมปลูก</h2>
        <p className="text-center text-stone-500 mb-8 text-sm">
          หากคุณได้ทำการโอนเงินและส่งสลิปผ่าน Line OA เรียบร้อยแล้ว <br/>
          กรุณานำ <span className="font-bold text-emerald-600">Order ID</span> ที่ได้รับจากแอดมินมากรอกที่นี่เพื่อเสร็จสิ้นกระบวนการ
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Order ID</label>
            <input
              type="text"
              placeholder="เช่น MK-A1B2045"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-center text-xl font-bold tracking-widest font-mono text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition uppercase"
            />
          </div>

          {verifyResult && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${verifyResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {verifyResult.success ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm font-medium">{verifyResult.message}</p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying || !orderId.trim()}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isVerifying ? 'กำลังตรวจสอบ...' : 'ยืนยัน Order ID'}
          </button>
          
          <div className="pt-6 border-t border-stone-100 flex flex-col items-center gap-3">
             <p className="text-xs text-stone-500">ยังไม่ได้รับ Order ID หรือต้องการส่งสลิป?</p>
             <a href="https://lin.ee/Sv5qrGD" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-[#00B900]/10 hover:bg-[#00B900]/20 text-[#00B900] font-bold text-xs rounded-full transition flex items-center justify-center gap-2 no-underline cursor-pointer">
               <MessageCircle className="w-4 h-4" />
               ติดต่อแอดมินผ่าน Line OA
             </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
