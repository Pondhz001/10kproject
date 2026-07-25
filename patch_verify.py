import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Add a state for verification code
content = content.replace("  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);",
                          "  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);\n  const [verificationCode, setVerificationCode] = useState('');\n  const [isVerifying, setIsVerifying] = useState(false);\n  const [verifyCodeError, setVerifyCodeError] = useState<string | null>(null);")

# Add the verify handle function before return
verify_func = """
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerifyCodeError('กรุณากรอกรหัสยืนยัน');
      return;
    }
    
    setIsVerifying(true);
    setVerifyCodeError(null);
    
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder?.id,
          verificationCode
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถยืนยันการปลูกได้');
      }
      
      onOrderCompleted(activeOrder!, []);
      setActiveOrder(null);
    } catch (err: any) {
      setVerifyCodeError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsVerifying(false);
    }
  };
"""

content = content.replace("  return (", verify_func + "\n  return (")

# Modify the view
verify_ui = """
              <div className="space-y-4 pt-4 border-t border-stone-200">
                 <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                   <h4 className="text-sm font-bold text-emerald-800 mb-2">ใส่รหัสยืนยันการปลูก</h4>
                   <p className="text-xs text-emerald-700 mb-4">
                     หลังจากส่งสลิปผ่าน Line OA แอดมินจะตรวจสอบและส่งรหัสยืนยัน 6 หลักกลับมาให้คุณ 
                     กรุณานำรหัสดังกล่าวมากรอกที่นี่เพื่อเสร็จสิ้นการร่วมปลูก
                   </p>
                   <div className="flex gap-2">
                     <input
                       type="text"
                       placeholder="รหัสยืนยัน 6 หลัก..."
                       value={verificationCode}
                       onChange={(e) => setVerificationCode(e.target.value)}
                       className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition"
                     />
                     <button
                       onClick={handleVerifyCode}
                       disabled={isVerifying}
                       className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl transition shadow-sm whitespace-nowrap"
                     >
                       {isVerifying ? 'กำลังตรวจสอบ...' : 'ยืนยันการปลูก'}
                     </button>
                   </div>
                   {verifyCodeError && (
                     <p className="text-[10px] text-red-600 mt-2">{verifyCodeError}</p>
                   )}
                 </div>
                 
                 <div className="text-center mt-4">
                   <button onClick={() => { setActiveOrder(null); }} className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium text-sm rounded-lg transition">
                     ปิดหน้าต่าง (รหัสจะถูกส่งให้ภายหลัง)
                   </button>
                 </div>
              </div>
"""

content = content.replace("""              <div className="space-y-4 pt-4 border-t border-stone-200 text-center">
                 <p className="text-xs text-stone-500">
                   เมื่อส่งสลิปเรียบร้อยแล้ว ทีมงานจะทำการอัปเดตข้อมูลกล้าไม้ลงในระบบแผนที่ภายใน 24 ชั่วโมง
                 </p>
                 <button onClick={() => { onOrderCompleted(activeOrder, []); setActiveOrder(null); }} className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium text-sm rounded-lg transition">
                   กลับสู่หน้าหลัก
                 </button>
              </div>""", verify_ui)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
