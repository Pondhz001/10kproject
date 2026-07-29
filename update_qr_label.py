import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Update QR code size
content = content.replace('className="w-44 h-44 object-contain rounded-lg"', 'className="w-full max-w-[280px] h-auto object-contain rounded-lg mx-auto"')

# Update label in the text block
content = content.replace('ติดต่อ: {successOrder.donorPhone}', 'ช่องทางติดต่อ: {successOrder.donorPhone}')

# Update label in the form
content = content.replace('เบอร์โทรศัพท์ / Line ID <span className="text-red-500">*</span>', 'ช่องทางติดต่อ (เบอร์โทรศัพท์ / Line ID) <span className="text-red-500">*</span>')

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
