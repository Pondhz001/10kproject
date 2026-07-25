import re

with open("server.ts", "r") as f:
    content = f.read()

old_func = """      console.log(`[DATABASE] Creating Order...`);
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
        verificationCode: ''
      });
      console.log(`[DATABASE INSERT SUCCESS] Order created with ID:`, order.id);

      const createdTrees = [];
      const actualTreeNames = treeNames || [];
      const indexesToUse = selectedTreeIndexes && selectedTreeIndexes.length > 0 
        ? selectedTreeIndexes 
        : Array.from({length: Number(treeCount)}).map(() => null);

      console.log(`[DATABASE] Creating ${treeCount} Trees...`);
      for (let i = 0; i < Number(treeCount); i++) {
        const nameToUse = actualTreeNames[i] || donorName;
        const indexToUse = indexesToUse[i];
        
        const treeParams: any = {
          ownerName: nameToUse,
          ownerOrganization: org,
          ownerPhone: donorPhone,
          userId: userId || '',
          plantedAt: new Date().toISOString(),
          status: isAdmin ? 'Seedling' : 'Pending Verification',
          height: 15,
          carbonOffset: 0,
          careHistory: [{
            date: new Date().toISOString().split('T')[0],
            status: isAdmin ? 'Seedling' : 'Pending Verification',
            height: 15,
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: isAdmin ? 'ลงทะเบียนกล้าไม้สักโดยแอดมิน' : 'ลงทะเบียนกล้าไม้สักลงในระบบแผนที่เรียบร้อย รอการตรวจสอบยอดเงินและการปักป้าย'
          }]
        };

        if (indexToUse !== null) {
          treeParams.index = indexToUse;
        }

        const tree = await LocalDb.addTree(treeParams);
        createdTrees.push(tree);
        console.log(`[DATABASE INSERT SUCCESS] Tree created with Index:`, tree.index);
      }"""

new_func = """      const createdTrees = [];
      const finalIndexes = [];
      const actualTreeNames = treeNames || [];
      const indexesToUse = selectedTreeIndexes && selectedTreeIndexes.length > 0 
        ? selectedTreeIndexes 
        : Array.from({length: Number(treeCount)}).map(() => null);

      console.log(`[DATABASE] Creating ${treeCount} Trees...`);
      for (let i = 0; i < Number(treeCount); i++) {
        const nameToUse = actualTreeNames[i] || donorName;
        const indexToUse = indexesToUse[i];
        
        const treeParams: any = {
          ownerName: nameToUse,
          ownerOrganization: org,
          ownerPhone: donorPhone,
          userId: userId || '',
          plantedAt: new Date().toISOString(),
          status: isAdmin ? 'Seedling' : 'Pending Verification',
          height: 15,
          carbonOffset: 0,
          careHistory: [{
            date: new Date().toISOString().split('T')[0],
            status: isAdmin ? 'Seedling' : 'Pending Verification',
            height: 15,
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
            note: isAdmin ? 'ลงทะเบียนกล้าไม้สักโดยแอดมิน' : 'ลงทะเบียนกล้าไม้สักลงในระบบแผนที่เรียบร้อย รอการตรวจสอบยอดเงินและการปักป้าย'
          }]
        };

        if (indexToUse !== null) {
          treeParams.index = indexToUse;
        }

        const tree = await LocalDb.addTree(treeParams);
        createdTrees.push(tree);
        finalIndexes.push(tree.index);
        console.log(`[DATABASE INSERT SUCCESS] Tree created with Index:`, tree.index);
      }

      console.log(`[DATABASE] Creating Order...`);
      const order = await LocalDb.addOrder({
        donorName,
        donorOrganization: org,
        donorPhone,
        userId: userId || '',
        treeCount: Number(treeCount),
        amount: isAdmin ? 0 : amount,
        status: isAdmin ? 'Paid' : 'Pending',
        slipVerified: isAdmin ? true : false,
        selectedTreeIndexes: finalIndexes,
        treeNames: treeNames || [],
        verificationCode: ''
      });
      console.log(`[DATABASE INSERT SUCCESS] Order created with ID:`, order.id);"""

content = content.replace(old_func, new_func)

with open("server.ts", "w") as f:
    f.write(content)
print("Done Patching createPledgeHandler 2")
