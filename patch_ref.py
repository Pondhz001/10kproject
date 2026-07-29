import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace(
    """<div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">เลขที่อ้างอิง:</span>
                  <span className="text-stone-800 font-mono">004999246212814</span>
                </div>""",
    """<div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">เลขที่อ้างอิง (Order ID):</span>
                  <span className="text-stone-800 font-bold font-mono">{activeOrder.id}</span>
                </div>"""
)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done Patching Reference ID")
