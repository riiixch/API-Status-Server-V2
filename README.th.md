# API Status Server V2

เซิร์ฟเวอร์ที่มีน้ำหนักเบาสำหรับการตรวจสอบสถานะของระบบ เช่น ข้อมูลระบบปฏิบัติการ, การใช้งาน CPU, การใช้งาน RAM, ข้อมูลดิสก์, สถิติเน็ตเวิร์ก, อัพไทม์, และเวอร์ชัน Node.js ออกแบบให้ทำงานได้ทั้งในระบบ **Windows** และ **Linux**.

## ฟีเจอร์

- ดึงข้อมูลสถิติเบื้องต้นของระบบแบบเรียลไทม์:
  - ข้อมูลระบบปฏิบัติการ
  - โมเดล CPU, จำนวนคอร์, จำนวนเธรด และเปอร์เซ็นต์การใช้งาน
  - RAM (รวม, ใช้แล้ว, เหลือ, และเปอร์เซ็นต์การใช้งาน)
  - ดิสก์ (รวม, ใช้แล้ว, เหลือ, และเปอร์เซ็นต์การใช้งาน)
  - เน็ตเวิร์ก (ข้อมูลที่รับ/ส่งทั้งหมดและความเร็วแบบเรียลไทม์)
  - อัพไทม์ของระบบในรูปแบบที่เข้าใจง่าย
  - เวอร์ชันของ Node.js
- รองรับระบบปฏิบัติการ **Windows** และ **Linux**
- อัพเดตสถิติอัตโนมัติทุกวินาที
- API REST ที่ง่ายสำหรับการดึงข้อมูล

## ข้อกำหนดเบื้องต้น

- Node.js >= 14.x
- ระบบที่รองรับ: Windows หรือ Linux

## การติดตั้ง

1. โคลน repository:
   ```bash
   git clone https://github.com/riiixch/API-Status-Server-V2.git
   cd API-Status-Server-V2
   ```

2. ติดตั้ง dependencies:
   ```bash
   npm install
   ```

3. เริ่มเซิร์ฟเวอร์:
   ```bash
   node .
   ```

4. เข้าถึงเซิร์ฟเวอร์:
   - Endpoint หลัก: [http://localhost:3000](http://localhost:3000)
   - Endpoint สถานะ: [http://localhost:3000/status](http://localhost:3000/status)

## API Endpoints

### GET `/status`

ดึงข้อมูลสถานะปัจจุบันของระบบ

#### ตัวอย่างการตอบกลับ:
```json
{
  "data": {
    "os": "Linux",
    "cpu": {
      "model": "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
      "cores": 6,
      "threads": 12,
      "usage": 15.2
    },
    "ram": {
      "total": "16.00 GB",
      "free": "8.00 GB",
      "used": "8.00 GB",
      "usage": 50.0
    },
    "disk": {
      "total": "500.00 GB",
      "free": "200.00 GB",
      "used": "300.00 GB",
      "usage": 60.0
    },
    "network": {
      "received": "1.00 GB",
      "sent": "500.00 MB",
      "speed": {
        "received": "1.00 Mbps",
        "sent": "500.00 Kbps"
      }
    },
    "uptime": "02:15:30",
    "nodejs": "20.0.0"
  }
}
```

### Root (`/`)

แสดงข้อความต้อนรับ

### Catch-All (`*`)

จัดการเส้นทางที่ไม่ได้กำหนดด้วยข้อความเริ่มต้น

## Platform Support

- **Windows**: ใช้ `wmic` สำหรับข้อมูล CPU และดิสก์
- **Linux**: ใช้ `lscpu`, `df`, และ `/proc/net/dev` สำหรับสถิติเกี่ยวกับระบบ

## Customization

- อัปเดตตัวแปร `PORT` ในซอร์สโค้ดเพื่อเปลี่ยนพอร์ตของเซิร์ฟเวอร์
- ปรับตัวแปร `updateStatsInterval` เพื่อปรับช่วงเวลาในการอัพเดตสถิติ

## Notes

- ตรวจสอบให้แน่ใจว่าเครื่องมือที่จำเป็นมีอยู่ในแพลตฟอร์มของคุณ:
  - **Windows**: ต้องเปิดใช้งาน `wmic`
  - **Linux**: คำสั่งอย่าง `lscpu`, `df`, และ `/proc/net/dev` ควรสามารถเข้าถึงได้

## License

โปรเจ็กต์นี้ใช้ [MIT License](LICENSE)

---

Created with ❤️ by **RIIIXCH**
