with open("src/App.tsx", "r") as f:
    content = f.read()

import re

old_button = '''              <a
                href="https://lin.ee/Sv5qrGD"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer bg-[#00B900] text-white shadow-md hover:bg-[#009900] hover:scale-105 no-underline"
              >
                <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                ร่วมปลูก (แอด Line OA)
              </a>'''

new_button = '''              <button
                onClick={() => {
                  setPlantMode('member');
                  setPlantSubTab('new');
                  setActiveTab('plant');
                }}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'plant' ? 'text-amber-300' : 'text-emerald-600'}`} />
                ร่วมปลูก
              </button>'''

content = content.replace(old_button, new_button)

with open("src/App.tsx", "w") as f:
    f.write(content)
