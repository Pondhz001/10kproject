import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Add ForestMap import
if "import ForestMap" not in content:
    content = content.replace("import { QRCodeSVG } from 'qrcode.react';", "import { QRCodeSVG } from 'qrcode.react';\nimport ForestMap from './ForestMap';")

# Render ForestMap above the form
map_jsx = """
      <div className="space-y-4">
        <h3 className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-600" /> แผนที่กล้าไม้ในโครงการ
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          คลิกเลือกกล้าไม้ที่ต้องการอุปถัมภ์จากแผนที่ด้านล่าง ระบบจะเพิ่มลงในฟอร์มอัตโนมัติ (เลือกได้มากกว่า 1 ต้น)
        </p>
        <ForestMap 
           trees={trees} 
           onSelectTree={() => {}} 
           selectedTree={null} 
           onJoinPlantingMultiple={(indexes) => {
               if (setPreSelectedTreeIndexes) setPreSelectedTreeIndexes(indexes);
               // Scroll to form
               document.getElementById('planting-form')?.scrollIntoView({ behavior: 'smooth' });
           }} 
        />
      </div>

      <motion.div 
        id="planting-form"
"""

content = content.replace("""      <motion.div 
        initial={{ opacity: 0, y: 10 }}""", map_jsx + """        initial={{ opacity: 0, y: 10 }}""")

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
