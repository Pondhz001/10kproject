import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Replace QR payload generation
content = re.sub(r'const qrPayload = generatePromptPayPayload.*?;\n', '', content)

# Remove the generatePromptPayPayload function
pattern_generate = r'const generatePromptPayPayload =.*?};\n\n'
content = re.sub(pattern_generate, '', content, flags=re.DOTALL)

# Replace QRCodeSVG tag
content = content.replace('<QRCodeSVG value={qrPayload} size={180} />', '<img src="/payment-qr.jpeg" alt="QR Code" className="w-44 h-44 object-contain rounded-lg" />')

# Remove promptpay text
content = re.sub(r'<p className="text-xs text-stone-500">พร้อมเพย์: \{PROMPTPAY_ID\}</p>', '<p className="text-xs font-bold text-stone-600 bg-amber-100 px-3 py-1 rounded-full">ยอดที่ต้องโอน: {successOrder.amount} บาท</p>', content)

# Remove promptpay ID
content = re.sub(r'\s*// 0888888888 can be replaced with actual promptpay phone number\n\s*const PROMPTPAY_ID = "0888888888";', '', content)

# Remove import
content = content.replace("import { QRCodeSVG } from 'qrcode.react';", "")

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)

