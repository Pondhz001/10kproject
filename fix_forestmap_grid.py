import re

with open("src/components/ForestMap.tsx", "r") as f:
    content = f.read()

replacement = """              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectSeedlingIndex(index, tree)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative p-2.5 rounded-xl border text-left transition flex flex-col justify-between h-[64px] ${
                    active
                      ? 'bg-amber-500 border-amber-400 text-stone-900 shadow-md shadow-amber-500/10 z-20 font-bold'
                      : isPlanted
                        ? (tree?.status === 'Pending Verification' 
                            ? 'bg-amber-100 border-amber-300 text-amber-800 hover:border-amber-400 hover:bg-amber-50' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50')
                        : 'bg-white border-stone-200 text-stone-400 hover:border-amber-400 hover:bg-stone-50'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold block ${active ? 'text-stone-950' : 'text-stone-500'}`}>
                    #{index}
                  </span>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[9px] font-medium truncate max-w-[65px] ${active ? 'text-stone-950' : 'text-stone-600'}`} title={isPlanted ? (tree?.status === 'Pending Verification' ? 'รอยืนยัน' : 'เสร็จสิ้น') : 'ว่าง'}>
                      {isPlanted ? (tree?.status === 'Pending Verification' ? 'รอยืนยัน' : 'เสร็จสิ้น') : 'ว่าง'}
                    </span>
                    {isPlanted ? (
                      tree?.status === 'Pending Verification' 
                        ? <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-stone-950' : 'bg-amber-500 animate-pulse'}`} /> 
                        : <TreePine className={`w-3.5 h-3.5 ${active ? 'text-stone-950' : 'text-emerald-600'}`} />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-stone-950' : 'bg-stone-300'}`} />
                    )}
                  </div>
                </motion.button>
              );"""

# The chunk we want to replace starts with "return (" and ends right before "          </div>" after the button
regex_to_replace = r'return \(\s*<motion\.button.*?key=\{index\}.*?</motion\.button>\s*\);'
content = re.sub(regex_to_replace, replacement, content, flags=re.DOTALL)

with open("src/components/ForestMap.tsx", "w") as f:
    f.write(content)
print("Done")
