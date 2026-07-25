import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

replacement = """
              <div className="space-y-4 pt-4 border-t border-stone-200">
                 <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center">
                   <h4 className="text-sm font-bold text-emerald-800 mb-2">ขั้นตอนต่อไป</h4>
                   <p className="text-xs text-emerald-700 mb-4">
                     หลังจากส่งสลิปผ่าน Line OA แอดมินจะตรวจสอบและส่ง Order ID กลับมาให้คุณ <br/>
                     คุณสามารถนำรหัสดังกล่าวไปกรอกที่เมนู <b>"ยืนยันการปลูก"</b> เพื่อเสร็จสิ้นกระบวนการ
                   </p>
                 </div>
                 
                 <div className="text-center mt-4">
                   <button onClick={() => { setActiveOrder(null); }} className="px-6 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-sm rounded-xl transition cursor-pointer">
                     ปิดหน้าต่างนี้ (รอรับรหัสจาก Line OA)
                   </button>
                 </div>
              </div>
"""

content = re.sub(r'<div className="space-y-4 pt-4 border-t border-stone-200">\s*<div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">.*?</div>\s*</div>', replacement, content, flags=re.DOTALL)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done PlantingPortal")
