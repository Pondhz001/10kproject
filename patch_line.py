import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

old_section = r'\{/\* Verification Box \*/\}.*?</motion\.div>'

new_section = """{/* Line OA Slip Verification Box */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <MessageCircle className="w-5 h-5 text-[#00B900]" />
                  <h3 className="font-semibold text-stone-800">
                    ยืนยันการโอนเงินผ่าน Line OA
                  </h3>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  เมื่อท่านโอนเงินเรียบร้อยแล้ว <b>กรุณาส่งสลิปโอนเงินพร้อมแจ้งชื่อและเบอร์โทรศัพท์ (หรือ Order ID: {activeOrder.id})</b> เพื่อให้ทีมงานตรวจสอบความถูกต้องและรับใบประกาศเกียรติคุณได้ทาง Line Official
                </p>

                <div className="flex flex-col items-center justify-center p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                  <img src="/line-oa-qr.png" alt="Line OA QR Code" className="w-40 h-auto object-contain rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = 'https://qr-official.line.me/gs/M_502xoloz_GW.png'; }} />
                    
                  <div className="flex flex-col w-full max-w-xs gap-3 mt-2">
                    <a href="https://lin.ee/Sv5qrGD" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#00B900] hover:bg-[#009900] text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 no-underline">
                      <MessageCircle className="w-5 h-5" />
                      เพิ่มเพื่อนและส่งสลิปผ่าน Line
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61591647386304" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 no-underline">
                      <ExternalLink className="w-5 h-5" />
                      ติดตามแฟนเพจของเรา
                    </a>
                  </div>
                </div>
              </div>


                
              <div className="space-y-4 pt-4 border-t border-stone-200">
                 <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center">
                   <h4 className="text-sm font-bold text-emerald-800 mb-2">ขั้นตอนต่อไป</h4>
                   <p className="text-xs text-emerald-700 mb-4">
                     หลังจากส่งสลิปผ่าน Line OA แอดมินจะตรวจสอบและยืนยันในระบบให้คุณ <br/>
                     คุณสามารถนำ Order ID ไปตรวจสอบในเมนู <b>"แจ้งโอนเงิน/ยืนยันการซื้อ"</b> เพื่อเสร็จสิ้นกระบวนการ หรือรอแอดมินดำเนินการให้
                   </p>
                 </div>
                   
                 <div className="text-center mt-4">
                   <button onClick={() => { setActiveOrder(null); }} className="px-6 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-sm rounded-xl transition cursor-pointer">
                     ปิดหน้าต่างนี้ (รอรับการตรวจสอบจาก Line OA)
                   </button>
                 </div>
              </div>


            </div>
          </motion.div>"""

content = re.sub(old_section, new_section, content, flags=re.DOTALL)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done Patching Portal Line OA")
