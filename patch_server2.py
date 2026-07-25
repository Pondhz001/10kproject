import re

with open("server.ts", "r") as f:
    content = f.read()

pledge_handler_regex = r"      const { donorName, organization, donorOrganization, donorPhone, treeCount, selectedTreeIndexes, treeNames, userId } = req\.body;\n      if \(\!donorName \|\| \!donorPhone \|\| \!treeCount \|\| treeCount \< 1\) \{\n        return res\.status\(400\)\.json\(\{ error: 'กรุณากรอกข้อมูลชื่อ เบอร์โทรศัพท์ และจำนวนต้นไม้ให้ครบถ้วน' \}\);\n      \}\n\n      const org = organization \|\| donorOrganization \|\| '';\n      const amount = treeCount \* 100; // 100 THB per tree\n\n      const order = await LocalDb\.addOrder\(\{\n        donorName,\n        donorOrganization: org,\n        donorPhone,\n        userId: userId \|\| '',\n        treeCount: Number\(treeCount\),\n        amount,\n        status: 'Pending',\n        slipVerified: false,\n        selectedTreeIndexes: selectedTreeIndexes \|\| \[\],\n        treeNames: treeNames \|\| \[\]\n      \}\);"

replacement = r"""      const { donorName, organization, donorOrganization, donorPhone, treeCount, selectedTreeIndexes, treeNames, userId, isAdmin } = req.body;
      if (!donorName || !donorPhone || !treeCount || treeCount < 1) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลชื่อ เบอร์โทรศัพท์ และจำนวนต้นไม้ให้ครบถ้วน' });
      }

      const org = organization || donorOrganization || '';
      const amount = treeCount * 100; // 100 THB per tree
      
      const verificationCode = isAdmin ? '' : Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
      
      const order = await LocalDb.addOrder({
        donorName,
        donorOrganization: org,
        donorPhone,
        userId: userId || '',
        treeCount: Number(treeCount),
        amount: isAdmin ? 0 : amount,
        status: isAdmin ? 'Paid' : 'Pending',
        slipVerified: isAdmin ? true : false,
        selectedTreeIndexes: selectedTreeIndexes || [],
        treeNames: treeNames || [],
        verificationCode
      });"""

content = re.sub(pledge_handler_regex, replacement, content, flags=re.DOTALL)

tree_creation_regex = r"          status: 'Seedling',\n          height: 15,\n          carbonOffset: 0,\n          careHistory: \[\{\n            date: new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],\n            status: 'Seedling',\n            height: 15,\n            image: 'https://images\.unsplash\.com/photo-1542601906990-b4d3fb778b09\?auto=format\&fit=crop\&w=300\&q=80',\n            note: 'ลงทะเบียนกล้าไม้สักลงในระบบแผนที่เรียบร้อย รอการตรวจสอบยอดเงินและการปักป้าย'\n          \}\]"

replacement2 = r"""          status: isAdmin ? 'Seedling' : 'Pending Verification',
          height: 15,
          carbonOffset: 0,
          careHistory: [{
            date: new Date().toISOString().split('T')[0],
            status: isAdmin ? 'Seedling' : 'Pending Verification',
            height: 15,
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: isAdmin ? 'ลงทะเบียนกล้าไม้สักโดยแอดมิน' : 'ลงทะเบียนกล้าไม้สักลงในระบบแผนที่เรียบร้อย รอการตรวจสอบยอดเงินและการปักป้าย'
          }]"""

content = re.sub(tree_creation_regex, replacement2, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
print("Done")
