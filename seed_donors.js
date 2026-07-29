const data = `
ปัทมพร เพียคำ 100098
ศคพรฌ์ ชูชนะชัยบดินทร์ และ รัชพง ชูชนะชัยบดินทร์ 100326-100336
Meteor shower 101010
ธนพัฒน์ น้อยมณี พร้อมครอบครัว 100168
ภูธนเมษฐ์ ทนทาน 100055 0980365826
กนกพร รักโชคเจริญ 100666 0980365826
กรกรรณ รักโชคเจริญ 100011 0980365826
กรพิชา เป้ก้า 100030 
สมมาตร กาญจนกุลานุรักษ์ 100031
ชัญญาม กาญจนกุลานุรักษ์ 100032
รามริศ เป้ก้า 100033
ณีรนุช ปานโต 100034
ชำนาญ เป้ก้า 100035
นวลจันทร์ อ่อนสิงห์ 100036
อภิชาติ อินทรัตน์ 100037
วรางคณา เป้ก้่ 100038
ปกรณ์ เป้ก้า 100040
ชญานันท์ คุณยศยิ่ง 100999
ธนาภา เทพประสิทธิ์ 100099
เอกจำนงค์ กลิ่นประทุม 109999
ธนพล เกตุคง 100089
อลิสา พงษ์สำราญ 108888
`;

const lines = data.trim().split('\n');

async function seed() {
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Extract phone if present
    const phoneMatch = line.match(/\b0\d{9}\b/);
    const phone = phoneMatch ? phoneMatch[0] : '-';
    
    // Remove phone from line
    if (phone !== '-') {
      line = line.replace(phone, '').trim();
    }
    
    // Extract index(es)
    const indexMatch = line.match(/(\d{6})(?:-(\d{6}))?/);
    if (indexMatch) {
      const idxStr = indexMatch[0];
      line = line.replace(idxStr, '').trim();
      
      let indexes = [];
      if (idxStr.includes('-')) {
        const [start, end] = idxStr.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          indexes.push(i);
        }
      } else {
        indexes = [Number(idxStr)];
      }
      
      const donorName = line;
      const treeCount = indexes.length;
      
      const payload = {
        donorName: donorName,
        donorPhone: phone,
        treeCount: treeCount,
        selectedTreeIndexes: indexes,
        isAdmin: true
      };
      
      try {
        const res = await fetch("http://localhost:3000/api/forest/pledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Adding ${donorName}: ${res.status} ${text}`);
      } catch (e) {
        console.log(`Error adding ${donorName}:`, e);
      }
    } else {
      console.log(`Could not parse line: ${line}`);
    }
  }
}

seed();
