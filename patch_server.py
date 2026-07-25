import re

with open("server.ts", "r") as f:
    content = f.read()

pledge_handler_regex = r"      const order = await LocalDb\.addOrder\(\{.*?\}\);\n\n      res\.json\(\{\n        success: true,\n        order,\n        message: 'สร้างรายการร่วมปลูกเรียบร้อยแล้ว กรุณาชำระเงินผ่าน QR Code'\n      \}\);"

replacement = r"""      const order = await LocalDb.addOrder({
        donorName,
        donorOrganization: org,
        donorPhone,
        userId: userId || '',
        treeCount: Number(treeCount),
        amount,
        status: 'Pending',
        slipVerified: false,
        selectedTreeIndexes: selectedTreeIndexes || [],
        treeNames: treeNames || []
      });

      const createdTrees = [];
      const actualTreeNames = treeNames || [];
      const indexesToUse = selectedTreeIndexes && selectedTreeIndexes.length > 0 
        ? selectedTreeIndexes 
        : Array.from({length: Number(treeCount)}).map(() => null);

      for (let i = 0; i < Number(treeCount); i++) {
        const nameToUse = actualTreeNames[i] || donorName;
        const indexToUse = indexesToUse[i];
        
        const treeParams: any = {
          ownerName: nameToUse,
          ownerOrganization: org,
          ownerPhone: donorPhone,
          userId: userId || '',
          plantedAt: new Date().toISOString(),
          status: 'Seedling',
          height: 15,
          carbonOffset: 0,
          careHistory: [{
            date: new Date().toISOString().split('T')[0],
            status: 'Seedling',
            height: 15,
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: 'ลงทะเบียนกล้าไม้สักลงในระบบแผนที่เรียบร้อย รอการตรวจสอบยอดเงินและการปักป้าย'
          }]
        };

        if (indexToUse !== null) {
          treeParams.index = indexToUse;
        }

        const tree = await LocalDb.addTree(treeParams);
        createdTrees.push(tree);
      }

      res.json({
        success: true,
        order,
        trees: createdTrees,
        message: 'สร้างรายการร่วมปลูกเรียบร้อยแล้ว กรุณาชำระเงินผ่าน QR Code'
      });"""

content = re.sub(pledge_handler_regex, replacement, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
print("Done")
