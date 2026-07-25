import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Replace the Slip Verification Box
slip_box_regex = r"            \{\/\* Slip Verification Box \*\/}.*?            <\/div>\n          <\/motion.div>"
replacement = r"""            {/* Line OA Slip Verification Box */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <MessageCircle className="w-5 h-5 text-[#00B900]" />
                  <h3 className="font-semibold text-stone-800">
                    ยืนยันการโอนเงินผ่าน Line OA
                  </h3>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  เมื่อท่านโอนเงินเรียบร้อยแล้ว <b>กรุณาส่งสลิปโอนเงินพร้อมแจ้งชื่อและเบอร์โทรศัพท์</b> เพื่อให้ทีมงานตรวจสอบความถูกต้องและรับใบประกาศเกียรติคุณได้ทาง Line Official
                </p>

                <div className="flex flex-col items-center justify-center p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                  <img src="/line-oa-qr.png" alt="Line OA QR Code" className="w-40 h-40 object-cover rounded-xl shadow-sm" onError={(e) => { e.currentTarget.src = 'https://qr-official.line.me/gs/M_502xoloz_GW.png'; }} />
                  
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

              <div className="space-y-4 pt-4 border-t border-stone-200 text-center">
                 <p className="text-xs text-stone-500">
                   เมื่อส่งสลิปเรียบร้อยแล้ว ทีมงานจะทำการอัปเดตข้อมูลกล้าไม้ลงในระบบแผนที่ภายใน 24 ชั่วโมง
                 </p>
                 <button onClick={() => { setActiveOrder(null); window.location.reload(); }} className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium text-sm rounded-lg transition">
                   กลับสู่หน้าหลัก
                 </button>
              </div>
            </div>
          </motion.div>"""

content = re.sub(slip_box_regex, replacement, content, flags=re.DOTALL)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
