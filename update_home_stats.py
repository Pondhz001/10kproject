import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

# Replace the Project Stats block in HomeCampaign.tsx
# with the Bento Grid layout from App.tsx.

new_stats_block = """{/* Project Stats - Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="campaign-bento-grid">
            {/* Total Goal */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">เป้าหมายโครงการ</span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono">
                  10,000
                </p>
                <div className="flex justify-between items-center mt-1 text-[10px] text-stone-500">
                  <span>ต้นกล้าไม้สัก</span>
                  <span className="text-emerald-700 font-semibold">100% สักสายพันธุ์ดี</span>
                </div>
              </div>
            </div>

            {/* Total Planted */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">ปลูกแล้วสำเร็จ</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono flex items-baseline gap-1.5">
                  {isLoadingStats ? '...' : stats.totalPlanted.toLocaleString()}
                  <span className="text-xs font-semibold text-emerald-600">
                    ({isLoadingStats ? '0' : ((stats.totalPlanted / 10000) * 100).toFixed(1)}%)
                  </span>
                </p>
                {/* Visual Progress bar */}
                <div className="w-full bg-[#f0f4f0] h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${isLoadingStats ? 0 : Math.min(100, (stats.totalPlanted / 10000) * 100)}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Carbon Offset */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">ดูดซับคาร์บอนสะสม</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono">
                  {isLoadingStats ? '...' : stats.totalCO2Offset.toLocaleString()} <span className="text-xs text-stone-500 font-normal">กก./ปี</span>
                </p>
                <p className="text-[10px] text-stone-500 mt-1">
                  ลดปริมาณก๊าซเรือนกระจกเพื่อโลกสีเขียว
                </p>
              </div>
            </div>

            {/* Total Donors */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">จำนวนผู้ร่วมปลูก</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono">
                  {isLoadingStats ? '...' : stats.totalDonors.toLocaleString()} <span className="text-xs text-stone-500 font-normal">คน</span>
                </p>
                <p className="text-[10px] text-amber-700/80 mt-1">
                  ร่วมสร้างทานบารมี คืนชีวิตสู่แผ่นดิน
                </p>
              </div>
            </div>
        </div>"""

pattern = r"\{\/\* Project Stats \*\/\}[\s\S]*?\{\/\* Introduction \/ Problem \& Solution \*\/\} "

if "Project Stats" in content:
    content = re.sub(pattern, new_stats_block + "\n\n        {/* Introduction / Problem & Solution */} ", content)

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)

