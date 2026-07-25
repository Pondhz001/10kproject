import re

with open("src/components/ForestMap.tsx", "r") as f:
    content = f.read()

# getStatusColor
content = content.replace("const getStatusColor = (status: string) => {",
                          "const getStatusColor = (status: string) => {\n    if (status === 'Pending Verification') return 'bg-amber-100/80 text-amber-800 border-amber-300';")

# Translation mappings
content = content.replace("selectedTree.status === 'Seedling' ? '🌱 ต้นกล้า' :",
                          "selectedTree.status === 'Pending Verification' ? '⏳ รอยืนยัน' : \n                     selectedTree.status === 'Seedling' ? '🌱 ต้นกล้า' :")

content = content.replace("(isEditing ? editStatus : selectedTree.status) === 'Seedling' ? '🌱 ต้นกล้า' :",
                          "(isEditing ? editStatus : selectedTree.status) === 'Pending Verification' ? '⏳ รอยืนยัน' : \n                     (isEditing ? editStatus : selectedTree.status) === 'Seedling' ? '🌱 ต้นกล้า' :")

# Edit dropdown for admin
dropdown = """<select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-sans text-stone-900 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="Pending Verification">รอยืนยัน (รอรหัส)</option>
                          <option value="Seedling">ต้นกล้า</option>
                          <option value="Growing">กำลังโต</option>
                          <option value="Young Tree">สักรุ่นเยาว์</option>
                          <option value="Mature">สักเต็มวัย</option>
                        </select>"""

content = content.replace("""<select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-sans text-stone-900 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="Seedling">ต้นกล้า</option>
                          <option value="Growing">กำลังโต</option>
                          <option value="Young Tree">สักรุ่นเยาว์</option>
                          <option value="Mature">สักเต็มวัย</option>
                        </select>""", dropdown)

with open("src/components/ForestMap.tsx", "w") as f:
    f.write(content)
print("Done")
