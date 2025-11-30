# Buffet Restaurant QR Ordering System
# ระบบจัดการร้านบุฟเฟ่ต์แบบสแกน QR

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ระบบจัดการร้านบุฟเฟ่ต์ครบวงจร สำหรับลูกค้าสแกน QR ที่โต๊ะเพื่อดูเมนูและสั่งอาหาร พร้อมระบบหลังบ้านสำหรับจัดการโต๊ะ แพ็กเกจ เมนู การขาย และสมาชิก

## ✨ Features / ฟีเจอร์หลัก

### 👥 สำหรับลูกค้า (Customer)
- 📱 สแกน QR Code ที่โต๊ะเพื่อเข้าสู่ระบบ (ไม่ต้องล็อกอิน)
- 🍽️ ดูเมนูตามแพ็กเกจที่เลือก (Silver, Gold, Platinum)
- ⏱️ ดูเวลาที่เหลือในการทาน (Countdown Timer)
- 🛒 สั่งอาหารผ่านระบบตะกร้า
- 📊 ดูสถานะออเดอร์แบบ Real-time
- 🔔 เรียกพนักงาน (Call Staff)

### 👨‍💼 สำหรับพนักงาน (Staff)
- 📋 Dashboard แสดงสถานะโต๊ะทั้งหมด
- ▶️ เปิดรอบการนั่ง (Start Session) พร้อมเลือกแพ็กเกจ
- 📱 สร้าง QR Code สำหรับลูกค้า
- 📝 จัดการออเดอร์และเปลี่ยนสถานะ
- ⏰ ดูเวลาที่เหลือของแต่ละโต๊ะ

### 💰 สำหรับแคชเชียร์ (Cashier)
- 🧾 คำนวณบิลอัตโนมัติ (แพ็กเกจ + VAT + Service Charge)
- 💳 รองรับหลายช่องทางชำระเงิน (เงินสด, โอน, QR PromptPay, บัตร)
- 🎁 ใช้ส่วนลดและแต้มสะสม
- 📄 ออกใบเสร็จ PDF
- 👥 ลงทะเบียนสมาชิกใหม่

### 🔧 สำหรับแอดมิน (Admin)
- 📦 จัดการแพ็กเกจ (Package Management) พร้อมระบบ Inheritance
- 🍜 จัดการเมนูและหมวดหมู่
- 🪑 จัดการโต๊ะ
- 👤 จัดการผู้ใช้และสิทธิ์
- ⚙️ ตั้งค่าระบบ (VAT%, Service Charge%, แต้มสะสม)
- 📊 รายงานยอดขาย

### 🎯 ระบบสมาชิก (Loyalty Program)
- 💎 สะสมแต้มจากการใช้จ่าย
- 🎁 แลกแต้มเป็นส่วนลด
- 📈 ดูประวัติการใช้แต้ม
- 🎂 โปรโมชั่นวันเกิด (รองรับในอนาคต)

## 🏗️ Technology Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM
- **Authentication**: JWT + Bcrypt
- **File Upload**: Multer
- **QR Code**: qrcode
- **PDF**: pdfkit

### Frontend
- **Framework**: Next.js 14+ (React + TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form

### DevOps
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git
- **CI/CD**: GitHub Actions (optional)

## 📁 Project Structure

```
buffet-restaurant/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── packages/       # Package management
│   │   ├── menus/          # Menu management
│   │   ├── tables/         # Table management
│   │   ├── sessions/       # Session management
│   │   ├── orders/         # Order management
│   │   ├── billing/        # Billing & receipts
│   │   ├── loyalty/        # Loyalty program
│   │   ├── reports/        # Reports
│   │   ├── settings/       # Settings
│   │   └── uploads/        # File uploads
│   ├── database/
│   │   └── migrations/     # SQL migrations
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── staff/     # Staff pages
│   │   │   ├── cashier/   # Cashier pages
│   │   │   └── customer/  # Customer pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities & API client
│   │   └── contexts/     # React contexts
│   └── package.json
├── docs/                  # Documentation
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   └── USER_MANUAL_TH.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/tiannys/buffet-restaurant.git
cd buffet-restaurant
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb buffet_restaurant

# Run migrations
cd backend
npm install
npm run migration:run
```

### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# Run development server
npm run start:dev
```

Backend will run on `http://localhost:3000`

### 4. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3001`

### 5. Default Admin Account
```
Username: admin
Password: admin123
```

**⚠️ Please change the default password after first login!**

## 🐳 Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

## 📖 Documentation

- [Database Schema](./docs/DATABASE_SCHEMA.md) - ER Diagram และโครงสร้างฐานข้อมูล
- [API Documentation](./docs/API_DOCUMENTATION.md) - REST API Endpoints
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) - แผนการพัฒนา
- [User Manual (Thai)](./docs/USER_MANUAL_TH.md) - คู่มือการใช้งาน

## 🎯 Package Inheritance Logic

ระบบรองรับการสืบทอดเมนูระหว่างแพ็กเกจ:

```
Silver Package (แพ็กเกจพื้นฐาน)
  └─ เมนู Silver เท่านั้น (45 รายการ)

Gold Package (สืบทอดจาก Silver)
  └─ เมนู Silver (45) + เมนู Gold (30) = 75 รายการ

Platinum Package (สืบทอดจาก Gold)
  └─ เมนู Silver (45) + Gold (30) + Platinum (25) = 100 รายการ
```

## 💳 Billing Calculation

```
Subtotal = (Adults × Adult Price) + (Children × Child Price)
Service Charge = Subtotal × Service Charge %
Subtotal with Service = Subtotal + Service Charge
VAT = Subtotal with Service × VAT %
Grand Total = Subtotal with Service + VAT - Discount - Points Value
```

## 🎁 Loyalty Points

- **Earn**: 1 point per 100 THB spent
- **Redeem**: 1 point = 1 THB discount
- **Minimum**: 10 points to redeem

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access |
| **Staff** | Table & order management |
| **Cashier** | Billing & receipts |
| **Kitchen** | View & update order status |
| **Manager** | Reports & analytics (read-only) |

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Admin
- `GET /api/v1/admin/packages` - List packages
- `POST /api/v1/admin/packages` - Create package
- `GET /api/v1/admin/menus` - List menus
- `POST /api/v1/admin/menus` - Create menu

### Staff
- `GET /api/v1/staff/tables/dashboard` - Table dashboard
- `POST /api/v1/staff/sessions/start` - Start session

### Customer (No Auth)
- `GET /api/v1/customer/session/:id` - Get session & menus
- `POST /api/v1/customer/session/:id/orders` - Place order

### Cashier
- `GET /api/v1/cashier/sessions/:id/calculate-bill` - Calculate bill
- `POST /api/v1/cashier/receipts` - Create receipt

[Full API Documentation](./docs/API_DOCUMENTATION.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tiannys**
- GitHub: [@tiannys](https://github.com/tiannys)

## 🙏 Acknowledgments

- Built with ❤️ for Thai buffet restaurants
- Designed for ease of use and scalability
- Open for contributions and improvements

## 🚧 Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Line Notify integration
- [ ] Promotion & coupon system
- [ ] Online table reservation
- [ ] Inventory management
- [ ] Multi-language support (EN, CN, JP)
- [ ] Kitchen Display System (KDS)
- [ ] Payment gateway integration

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

---

**Made with ❤️ for Thai Buffet Restaurants** 🇹🇭
