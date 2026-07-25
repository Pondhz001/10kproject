import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

# Replace the button to trigger onEnterCampaign('verify')
button_regex = r'<button\s+onClick=\{\(\) => setShowVerifyModal\(true\)\}\s+className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 w-full md:w-auto"\s+>\s+<Key className="w-4 h-4 text-emerald-300" />\s+กรอก Order ID ยืนยันการปลูกจาก Line OA\s+</button>'

replacement = """<button
              onClick={() => onEnterCampaign('verify')}
              className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 w-full md:w-auto"
            >
              <Key className="w-4 h-4 text-emerald-300" />
              กรอก Order ID ยืนยันการปลูกจาก Line OA
            </button>"""

content = re.sub(button_regex, replacement, content)

# Remove the Modal completely
modal_regex = r'\{showVerifyModal && \(\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">.*?</div>\s*\)\}'

content = re.sub(modal_regex, '', content, flags=re.DOTALL)

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
print("Done HomeCampaign")
