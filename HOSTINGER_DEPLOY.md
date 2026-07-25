# คู่มือการนำระบบขึ้นใช้งานบนโดเมนจริง (Hostinger)

ระบบนี้ถูกออกแบบให้ทำงานแบบ Full-Stack (มี Frontend เป็น React และ Backend เป็น Express + MongoDB) ซึ่งสามารถนำขึ้นบน Hostinger ที่รองรับ Node.js ได้อย่างสมบูรณ์แบบครับ

## สิ่งที่เตรียมการไว้ให้แล้ว
- **รองรับ Hostinger Passenger (app.js)**: สร้างไฟล์ `app.js` ไว้สำหรับ Hostinger ที่บางครั้งบังคับให้ใช้ชื่อไฟล์นี้ในการรัน
- **การตั้งค่า Environment ที่ยืดหยุ่น**: ระบบจะตรวจหาโฟลเดอร์ `dist` เพื่อรันแบบ Production อัตโนมัติ (ไม่ต้องห่วงเรื่องการตั้ง `NODE_ENV=production`)
- **การจัดการ Port**: ระบบจะใช้ `process.env.PORT` อัตโนมัติซึ่ง Hostinger จะเป็นคนกำหนดให้

## วิธีการ Deploy บน Hostinger

1. **เตรียมไฟล์สำหรับอัปโหลด**
   - รันคำสั่ง `npm run build` เพื่อเตรียมไฟล์
   - ระบบจะสร้างโฟลเดอร์ `dist` ขึ้นมา และไฟล์ `dist/server.cjs`
   - ไฟล์ที่คุณต้องอัปโหลดขึ้น Hostinger (ผ่าน File Manager หรือ FTP หรือ Git) มีดังนี้:
     - `app.js` (ไฟล์จุดเริ่มต้น)
     - `package.json` และ `package-lock.json`
     - โฟลเดอร์ `dist` ทั้งโฟลเดอร์
     - (ไม่บังคับ) โฟลเดอร์ `src` และ `server.ts` หากต้องการให้ครบถ้วน แต่ตอนรันจริงจะใช้แค่ `dist/server.cjs`

2. **ตั้งค่าใน Hostinger cPanel / hPanel**
   - ไปที่เมนู **Node.js** (หากซื้อแพ็กเกจที่รองรับ Node.js)
   - สร้าง Application ใหม่
   - กำหนด **Application root** ไปยังโฟลเดอร์ที่คุณอัปโหลดไฟล์ (เช่น `public_html/`)
   - กำหนด **Application startup file** เป็น `app.js`
   - ในส่วนของ **Environment variables** ให้เพิ่มค่าต่างๆ ดังนี้:
     - `MONGODB_URI` = `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority` (ใช้ URL ฐานข้อมูลของคุณ)
     - `NODE_ENV` = `production`

3. **ติดตั้ง Package (Dependencies)**
   - ในหน้าจัดการ Node.js ของ Hostinger จะมีปุ่ม **NPM Install** หรือให้รันคำสั่ง `npm install --production`
   - Hostinger จะติดตั้งเครื่องมือต่างๆ ที่อยู่ใน `package.json` ให้

4. **เริ่มรันแอปพลิเคชัน (Start App)**
   - กดปุ่ม **Start** หรือ **Restart** ในแผงควบคุม Node.js
   - ตัวเว็บควรจะแสดงผลพร้อมใช้งานบนโดเมนจริงของคุณเรียบร้อย!

## การแก้ไขปัญหาเบื้องต้น
- หากหน้าเว็บขาว หรือมีข้อความ Error เกี่ยวกับการเชื่อมต่อฐานข้อมูล ให้เช็ค `MONGODB_URI` อีกครั้ง และตรวจสอบว่าใน MongoDB Atlas ได้ตั้งค่า **Network Access (IP Whitelist)** เป็น `0.0.0.0/0` (Allow access from anywhere) หรือยัง เนื่องจาก Hostinger อาจจะเปลี่ยน IP ไปเรื่อยๆ
- หากรูปภาพจากการอัปโหลดไม่แสดงผล เนื่องจากมันถูกเก็บไว้ในโฟลเดอร์ `uploads` บนเซิร์ฟเวอร์ ถ้ามีการรีเซ็ตหรือย้ายเซิร์ฟเวอร์ โฟลเดอร์นี้อาจจะหาย แนะนำให้แบคอัพเป็นระยะครับ
