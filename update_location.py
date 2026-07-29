import re

with open("src/components/AboutCampaign.tsx", "r") as f:
    content = f.read()

# Replace the specific mentions of the location with the full address
old_loc = "สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ จังหวัดเชียงใหม่"
new_loc = "สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ (P6QR+5F9 ตำบลออนใต้ อำเภอสันกำแพง จังหวัดเชียงใหม่ 50130)"

content = content.replace(old_loc, new_loc)

# Ensure the area is mentioned as 15 rai in phase 1
old_desc = "มุ่งปลูกต้นไม้สักคุณภาพจำนวน <strong className=\"text-emerald-700\">10,000 ต้น</strong>"
new_desc = "มุ่งปลูกต้นไม้สักคุณภาพจำนวน <strong className=\"text-emerald-700\">10,000 ต้น</strong> บนพื้นที่ 15 ไร่ ในเฟสแรก"
content = content.replace(old_desc, new_desc)

with open("src/components/AboutCampaign.tsx", "w") as f:
    f.write(content)

with open("src/components/HomeCampaign.tsx", "r") as f:
    content_home = f.read()

# Change the area calculation in HomeCampaign from 0.0025 to 0.0015
content_home = content_home.replace("+(stats.totalPlanted * 0.0025).toFixed(2)", "+(stats.totalPlanted * 0.0015).toFixed(2)")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content_home)

print("Done")
