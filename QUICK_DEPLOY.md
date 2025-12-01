# Quick Deployment Guide

## บน Linux Server

### 1. Clone และ Setup
```bash
cd /opt/buffet-restaurant
git pull origin main
```

### 2. กำหนด IP/Domain ของ Server
```bash
# สร้างไฟล์ .env
nano .env

# ใส่ค่าต่อไปนี้ (แทนที่ YOUR_SERVER_IP ด้วย IP จริงของคุณ):
API_URL=http://YOUR_SERVER_IP:3000/api/v1
FRONTEND_URL=http://YOUR_SERVER_IP:3001

# ตัวอย่าง:
# API_URL=http://103.123.45.67:3000/api/v1
# FRONTEND_URL=http://103.123.45.67:3001
```

### 3. Build และ Run
```bash
# Stop containers เก่า (ถ้ามี)
docker-compose down

# Build ใหม่ด้วย environment variables
docker-compose up -d --build
```

### 4. Seed Database
```bash
docker exec -it buffet-backend sh
npx ts-node src/database/seed.ts
exit
```

### 5. เข้าใช้งาน
- เปิดเบราว์เซอร์: `http://YOUR_SERVER_IP:3001`
- Login: `admin` / `admin123`

---

## ตัวอย่างการใช้งานกับ Domain

ถ้ามี domain (เช่น buffet.example.com):

```bash
# ในไฟล์ .env
API_URL=http://buffet.example.com:3000/api/v1
FRONTEND_URL=http://buffet.example.com:3001
```

---

## Troubleshooting

### ถ้า login ไม่ได้
1. ตรวจสอบว่า seed database แล้ว
2. ตรวจสอบ logs: `docker-compose logs -f`
3. ตรวจสอบว่า .env ใช้ IP ที่ถูกต้อง

### ถ้าต้องการเปลี่ยน IP/Domain
1. แก้ไขไฟล์ `.env`
2. Rebuild: `docker-compose up -d --build`

---

**Made with ❤️ for Thai Buffet Restaurants** 🇹🇭
