import re

with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

content = content.replace("รหัสยืนยัน 6 หลัก...", "Order ID...")
content = content.replace("นำรหัส 6 หลักที่ได้รับจากแอดมิน", "นำ Order ID ที่ได้รับจากแอดมิน")
content = content.replace("ยืนยันรหัสการร่วมปลูก", "ยืนยัน Order ID การร่วมปลูก")
content = content.replace("กรอกรหัสยืนยันการปลูกจาก Line OA", "กรอก Order ID ยืนยันการปลูกจาก Line OA")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace("รหัสยืนยัน 6 หลัก...", "Order ID...")
content = content.replace("แอดมินจะตรวจสอบและส่งรหัสยืนยัน 6 หลักกลับมาให้คุณ", "แอดมินจะตรวจสอบและส่ง Order ID กลับมาให้คุณ")

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done UI Text")
