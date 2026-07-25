import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace padding for admin "ออก" and "เข้าสู่ระบบ" buttons to be easier to touch
content = content.replace(
    'px-1.5 py-0.5 rounded-md',
    'px-2 py-1.5 min-h-[36px] rounded-lg'
)

# And for the admin box itself
content = content.replace(
    'bg-amber-50 p-1.5 rounded-2xl',
    'bg-amber-50 p-2 rounded-2xl'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
