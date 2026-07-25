import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

# Replace the PromptPay QR Code img class
content = content.replace(
    'className="w-48 h-48 mx-auto"\n                  referrerPolicy="no-referrer"',
    'className="w-full max-w-[240px] h-auto object-contain mx-auto"\n                  referrerPolicy="no-referrer"'
)

# And also for the Line OA one, just in case
content = content.replace(
    'className="w-40 h-40 object-cover rounded-xl shadow-sm"',
    'className="w-40 h-auto object-contain rounded-xl shadow-sm"'
)

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
