with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

old_button = '''            <a
              href="https://lin.ee/Sv5qrGD"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#00B900] hover:bg-[#009900] text-white font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3 cursor-pointer no-underline border border-white/20"
            >
              <MessageCircle className="w-6 h-6 animate-pulse" />
              ติดต่อร่วมปลูก 100฿ (แอด Line OA)
            </a>'''

new_button = '''            <button
              onClick={() => onEnterCampaign('plant')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
            >
              <Sparkles className="w-6 h-6 text-amber-300" />
              ร่วมปลูกกล้าไม้สัก 100฿
            </button>'''

content = content.replace(old_button, new_button)

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
