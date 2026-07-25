import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Replace the "Line OA Slip Verification Box" section with an embedded Verify section
old_section = r'\{/\* Line OA Slip Verification Box \*/\}.*?</motion\.div>'

new_section = """{/* Verification Box */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-stone-800">
                    ยืนยันการโอนเงิน (Order ID: {activeOrder.id})
                  </h3>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  เมื่อท่านโอนเงินเรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อยืนยันการชำระเงิน หรือส่งสลิปผ่าน Line OA 
                </p>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col items-center">
                  <p className="text-xs text-stone-500 mb-4 text-center">
                    (จำลองการยืนยัน: ในระบบจริงจะมีการแนบสลิปหรือตรวจสอบผ่าน API ธนาคาร)
                  </p>
                  
                  <button
                    onClick={async () => {
                      setIsVerifying(true);
                      setVerifyCodeError(null);
                      try {
                        const res = await fetch('/api/orders/confirm', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ verificationCode: activeOrder.id, orderId: activeOrder.id })
                        });
                        const data = await res.json();
                        if(res.ok) {
                          onOrderCompleted(activeOrder, []); // We can pass empty array, App.tsx fetches from backend anyway
                        } else {
                          setVerifyCodeError(data.error || 'เกิดข้อผิดพลาด');
                        }
                      } catch(e) {
                        setVerifyCodeError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
                      } finally {
                        setIsVerifying(false);
                      }
                    }}
                    disabled={isVerifying}
                    className="w-full max-w-sm py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition shadow-sm disabled:opacity-50 flex justify-center items-center cursor-pointer"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ยืนยันการชำระเงินทันที (Demo)'}
                  </button>
                  
                  {verifyCodeError && (
                    <p className="text-xs text-red-600 mt-3 font-bold">{verifyCodeError}</p>
                  )}
                </div>
              </div>
                 
              <div className="space-y-4 pt-4 border-t border-stone-200">
                 <div className="flex flex-col w-full max-w-sm mx-auto gap-3">
                    <a href="https://lin.ee/Sv5qrGD" target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-[#00B900]/10 hover:bg-[#00B900]/20 text-[#00B900] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 no-underline cursor-pointer">
                      <MessageCircle className="w-4 h-4" />
                      ติดต่อแอดมินผ่าน Line OA
                    </a>
                 </div>
                 <div className="text-center mt-2">
                   <button onClick={() => { setActiveOrder(null); }} className="text-xs text-stone-500 hover:text-stone-800 underline transition cursor-pointer">
                     ทำรายการอื่นต่อไป
                   </button>
                 </div>
              </div>

            </div>
          </motion.div>"""

content = re.sub(old_section, new_section, content, flags=re.DOTALL)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done Patching Portal Step 2")
