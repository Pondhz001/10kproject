with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

old_btn_group = '''            <button
              onClick={() => onEnterCampaign('plant')}
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-white/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shovel className="w-4 h-4 text-amber-300" />
              ร่วมปลูกกล้าไม้สัก 100฿
            </button>

            <button
              onClick={() => onEnterCampaign('verify')}
              className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 w-full md:w-auto"
            >
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              แจ้งโอนเงิน/ยืนยัน
            </button>'''

new_btn_group = '''            <a
              href="https://lin.ee/Sv5qrGD"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#00B900] hover:bg-[#009900] text-white font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3 cursor-pointer no-underline border border-white/20"
            >
              <MessageCircle className="w-6 h-6 animate-pulse" />
              ติดต่อร่วมปลูก 100฿ (แอด Line OA)
            </a>'''

content = content.replace(old_btn_group, new_btn_group)

old_bottom_btn = '''          <button
            onClick={() => onEnterCampaign('plant')}
            className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition shadow-lg hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
          >
            <Shovel className="w-4 h-4 text-amber-950" />
            ร่วมปลูกกล้าไม้สัก 100฿ ตอนนี้เลย!
          </button>'''

new_bottom_btn = '''          <a
            href="https://lin.ee/Sv5qrGD"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-5 bg-[#00B900] hover:bg-[#009900] text-white font-black text-lg rounded-2xl transition shadow-xl hover:scale-[1.05] cursor-pointer inline-flex items-center gap-3 no-underline"
          >
            <MessageCircle className="w-6 h-6 animate-pulse" />
            แอด Line OA เพื่อร่วมปลูก ตอนนี้เลย!
          </a>'''

content = content.replace(old_bottom_btn, new_bottom_btn)

# Make sure MessageCircle is imported, it probably is but just in case, it might not be.
if "MessageCircle" not in content and "import {" in content:
    content = content.replace("import {", "import { MessageCircle,")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("HomeCampaign patched successfully.")
