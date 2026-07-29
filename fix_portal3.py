import re
with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Fix donorPhoneError
content = content.replace('''                  {donorPhoneError && (
                    <p className="text-[10px] text-red-600">กรุณาระบุช่องทางการติดต่อสำหรับรับใบประกาศ/รายงาน</p>
    </div>''', '''                  {donorPhoneError && (
                    <p className="text-[10px] text-red-600">กรุณาระบุช่องทางการติดต่อสำหรับรับใบประกาศ/รายงาน</p>
                  )}
                </div>''')

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
