const fs = require('fs');
let code = fs.readFileSync('src/components/PlantingPortal.tsx', 'utf8');

const target = code.match(/\{\/\* PromptPay Account Details Card \*\/\}[\s\S]*?(?=<div className="space-y-1">)/);

if (target) {
  code = code.replace(
    target[0],
    `{/* Kasikorn Account Details Card */}
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 text-left space-y-2 w-full max-w-sm mx-auto shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">ธนาคาร:</span>
                  <span className="text-stone-800 font-semibold font-mono">กสิกรไทย (KBank)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">เลขที่บัญชี:</span>
                  <span className="text-emerald-700 font-bold font-mono">234-8-79081-4</span>
                </div>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-stone-500 font-medium min-w-[70px]">ชื่อบัญชี:</span>
                  <span className="text-stone-800 font-semibold text-right">โครงการหมื่นกล้าป่าเขียว โดย นาย ปินะ ไชยบุตร</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">เลขที่อ้างอิง:</span>
                  <span className="text-stone-800 font-mono">004999246212814</span>
                </div>
              </div>

              `
  );
  fs.writeFileSync('src/components/PlantingPortal.tsx', code);
}
