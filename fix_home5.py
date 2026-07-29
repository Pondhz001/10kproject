with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

import re

old_text = "ใช้ระบบ AI และ Slip2Go ในการยืนยันการโอนเงินโดยอัตโนมัติ เพื่อเข้าสมทบเป็นกองทุนอุปถัมภ์ พร้อมทีมงานรุกขกรและคณะผู้จัดทำโครงการเข้าบำรุงและอัปโหลดประวัติการดูแลอย่างโปร่งใส"
new_text = "ทีมงานรุกขกรและคณะผู้จัดทำโครงการเข้าบำรุงดูแลต้นไม้ของคุณ พร้อมอัปโหลดประวัติการดูแลอย่างโปร่งใส ให้คุณติดตามการเติบโตได้ตลอดเวลา"

content = content.replace(old_text, new_text)
content = content.replace("ตรวจสลิปและดูแลกล้าไม้", "การดูแลและติดตามผล")

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
