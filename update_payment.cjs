const fs = require('fs');
let code = fs.readFileSync('src/components/PlantingPortal.tsx', 'utf8');

// Replace the QR code section
code = code.replace(
  /const promptPayString = activeOrder \? generatePromptPayPayload\(activeOrder\.amount\) : '';[\s\S]*?const qrCodeUrl = `https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=250x250&data=\$\{encodeURIComponent\(promptPayString\)\}`;/,
  `// Use static payment QR provided by user
  const qrCodeUrl = '/payment-qr.jpg';`
);

// Replace the download handler to just open the static image or download it
code = code.replace(
  /const handleDownloadQR = async \(\) => \{[\s\S]*?window\.open\(qrCodeUrl, '_blank'\);\n    \}\n  \};/,
  `const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'muenkla-qr.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`
);

// Replace the account details card
code = code.replace(
  /<div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 text-left space-y-2 w-full max-w-sm mx-auto shadow-sm">[\s\S]*?<\/div>/,
  `<div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 text-left space-y-2 w-full max-w-sm mx-auto shadow-sm">
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
              </div>`
);

// Replace PromptPay Standard banner mockup
code = code.replace(
  /<div className="bg-\[#002f6c\] text-white py-1 px-3 rounded-lg text-\[9px\] font-bold tracking-wider uppercase mb-3 flex items-center justify-center gap-1">[\s\S]*?<\/div>/,
  `<div className="bg-[#00a86b] text-white py-1 px-3 rounded-lg text-[9px] font-bold tracking-wider uppercase mb-3 flex items-center justify-center gap-1">
                  <span className="text-white">●</span> KASIKORNBANK / กสิกรไทย
                </div>`
);

fs.writeFileSync('src/components/PlantingPortal.tsx', code);
