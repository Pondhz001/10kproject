import requests
import re
import json

data = """
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
"""

lines = data.strip().split('\n')

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Extract phone if present
    phone_match = re.search(r'\b0\d{9}\b', line)
    phone = phone_match.group(0) if phone_match else '-'
    
    # Remove phone from line
    if phone != '-':
        line = line.replace(phone, '').strip()
    
    # Extract index(es)
    index_match = re.search(r'(\d{6})(?:-(\d{6}))?', line)
    if index_match:
        idx_str = index_match.group(0)
        line = line.replace(idx_str, '').strip()
        
        indexes = []
        if '-' in idx_str:
            start, end = map(int, idx_str.split('-'))
            indexes = list(range(start, end + 1))
        else:
            indexes = [int(idx_str)]
            
        donorName = line
        treeCount = len(indexes)
        
        payload = {
            "donorName": donorName,
            "donorPhone": phone,
            "treeCount": treeCount,
            "selectedTreeIndexes": indexes,
            "isAdmin": True
        }
        
        res = requests.post("http://localhost:3000/api/forest/pledge", json=payload)
        print(f"Adding {donorName}: {res.status_code} {res.text}")
    else:
        print(f"Could not parse line: {line}")
