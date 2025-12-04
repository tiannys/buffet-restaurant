# Buffet Restaurant QR Ordering System - Implementation Plan

## Overview

A comprehensive web-based buffet restaurant management system for Thai users, featuring QR code ordering, package-based menu access, table management, billing with VAT/service charge, and loyalty program integration.

## User Review Required

> [!IMPORTANT]
> **Technology Stack Confirmation**
> - **Backend**: NestJS (Node.js + TypeScript) with Express
> - **Frontend**: Next.js 14+ with React, TypeScript, and Tailwind CSS
> - **Database**: PostgreSQL 14+
> - **Authentication**: JWT with role-based access control
> - **QR Generation**: qrcode library
> - **PDF Generation**: pdfkit or puppeteer for receipts
> 
> Please confirm if this stack is acceptable or if you prefer alternatives.

> [!IMPORTANT]
> **Package Inheritance Strategy**
> The system will use a hierarchical package inheritance model where:
> - Each package can reference a "parent_package_id"
> - Gold inherits all menus from Silver + its own exclusive menus
> - Platinum inherits all menus from Gold (which includes Silver) + its own exclusive menus
> 
> This allows flexible package creation beyond just Silver/Gold/Platinum.

> [!WARNING]
> **Multi-branch Support**
> The database schema includes branch support for future expansion. Initially, all data will belong to a default branch. Confirm if you need multi-branch features in the first release.

## Proposed Changes

### Component 1: Database Schema & Models

#### Core Authentication & User Management
- [NEW] `migrations/001_create_core_tables.sql` - Core tables for users, roles, branches
- [NEW] `src/database/entities/user.entity.ts` - User entity with role relationship
- [NEW] `src/database/entities/role.entity.ts` - Role entity (Admin, Staff, Cashier, Kitchen, Manager)
- [NEW] `src/database/entities/branch.entity.ts` - Branch entity for multi-location support

#### Package & Menu System
- [NEW] `migrations/002_create_package_menu_tables.sql` - Package and menu tables
- [NEW] `src/database/entities/package.entity.ts` - Package with inheritance support
- [NEW] `src/database/entities/menu-category.entity.ts` - Menu categories
- [NEW] `src/database/entities/menu-item.entity.ts` - Menu items with images
- [NEW] `src/database/entities/package-menu.entity.ts` - Many-to-many package-menu mapping

#### Table & Session Management
- [NEW] `migrations/003_create_table_session_tables.sql` - Table and session tables
- [NEW] `src/database/entities/table.entity.ts` - Restaurant tables with status
- [NEW] `src/database/entities/customer-session.entity.ts` - Customer dining sessions

#### Order Management
- [NEW] `migrations/004_create_order_tables.sql` - Order and order items tables
- [NEW] `src/database/entities/order.entity.ts` - Customer orders
- [NEW] `src/database/entities/order-item.entity.ts` - Individual order items

#### Billing & Receipt
- [NEW] `migrations/005_create_billing_tables.sql` - Receipt and payment tables
- [NEW] `src/database/entities/receipt.entity.ts` - Receipt with VAT/service charge
- [NEW] `src/database/entities/payment.entity.ts` - Payment records

#### Loyalty Program
- [NEW] `migrations/006_create_loyalty_tables.sql` - Member and points tables
- [NEW] `src/database/entities/member.entity.ts` - Customer membership
- [NEW] `src/database/entities/member-points.entity.ts` - Points transaction history

#### Settings & Configuration
- [NEW] `migrations/007_create_settings_tables.sql` - System settings table
- [NEW] `src/database/entities/setting.entity.ts` - Configurable system settings

#### Audit Logging
- [NEW] `migrations/008_create_audit_tables.sql` - Audit log table
- [NEW] `src/database/entities/audit-log.entity.ts` - System activity logging

---

### Component 2: Backend API (NestJS)

#### Project Structure
- [NEW] `backend/package.json` - Backend dependencies
- [NEW] `backend/tsconfig.json` - TypeScript configuration
- [NEW] `backend/nest-cli.json` - NestJS CLI configuration
- [NEW] `backend/.env.example` - Environment variables template
- [NEW] `backend/src/main.ts` - Application entry point

#### Authentication Module
- [NEW] `src/auth/auth.module.ts` - Authentication module
- [NEW] `src/auth/auth.service.ts` - JWT token generation and validation
- [NEW] `src/auth/auth.controller.ts` - Login/logout endpoints
- [NEW] `src/auth/guards/jwt-auth.guard.ts` - JWT authentication guard
- [NEW] `src/auth/guards/roles.guard.ts` - Role-based authorization guard
- [NEW] `src/auth/decorators/roles.decorator.ts` - Roles decorator

#### User Management Module
- [NEW] `src/users/users.module.ts` - User management module
- [NEW] `src/users/users.service.ts` - User CRUD operations
- [NEW] `src/users/users.controller.ts` - User management endpoints
- [NEW] `src/users/dto/create-user.dto.ts` - User creation DTO
- [NEW] `src/users/dto/update-user.dto.ts` - User update DTO

#### Package Management Module
- [NEW] `src/packages/packages.module.ts` - Package management module
- [NEW] `src/packages/packages.service.ts` - Package CRUD with inheritance logic
- [NEW] `src/packages/packages.controller.ts` - Package management endpoints
- [NEW] `src/packages/dto/create-package.dto.ts` - Package creation DTO

#### Menu Management Module
- [NEW] `src/menus/menus.module.ts` - Menu management module
- [NEW] `src/menus/menus.service.ts` - Menu CRUD operations
- [NEW] `src/menus/menus.controller.ts` - Menu management endpoints
- [NEW] `src/menus/categories.service.ts` - Category management
- [NEW] `src/menus/dto/create-menu-item.dto.ts` - Menu item creation DTO

#### Table Management Module
- [NEW] `src/tables/tables.module.ts` - Table management module
- [NEW] `src/tables/tables.service.ts` - Table CRUD and status management
- [NEW] `src/tables/tables.controller.ts` - Table management endpoints
- [NEW] `src/tables/dto/create-table.dto.ts` - Table creation DTO

#### Session Management Module
- [NEW] `src/sessions/sessions.module.ts` - Session management module
- [NEW] `src/sessions/sessions.service.ts` - Session lifecycle management
- [NEW] `src/sessions/sessions.controller.ts` - Session endpoints
- [NEW] `src/sessions/dto/start-session.dto.ts` - Session start DTO
- [NEW] `src/sessions/qr-generator.service.ts` - QR code generation

#### Order Management Module
- [NEW] `src/orders/orders.module.ts` - Order management module
- [NEW] `src/orders/orders.service.ts` - Order processing logic
- [NEW] `src/orders/orders.controller.ts` - Order endpoints
- [NEW] `src/orders/dto/create-order.dto.ts` - Order creation DTO
- [NEW] `src/orders/dto/update-order-status.dto.ts` - Order status update DTO

#### Billing Module
- [NEW] `src/billing/billing.module.ts` - Billing module
- [NEW] `src/billing/billing.service.ts` - Bill calculation with VAT/service charge
- [NEW] `src/billing/billing.controller.ts` - Billing endpoints
- [NEW] `src/billing/receipt-generator.service.ts` - PDF receipt generation
- [NEW] `src/billing/dto/calculate-bill.dto.ts` - Bill calculation DTO

#### Loyalty Module
- [NEW] `src/loyalty/loyalty.module.ts` - Loyalty program module
- [NEW] `src/loyalty/loyalty.service.ts` - Points calculation and redemption
- [NEW] `src/loyalty/loyalty.controller.ts` - Loyalty endpoints
- [NEW] `src/loyalty/dto/create-member.dto.ts` - Member creation DTO

#### Reports Module
- [NEW] `src/reports/reports.module.ts` - Reporting module
- [NEW] `src/reports/reports.service.ts` - Report generation logic
- [NEW] `src/reports/reports.controller.ts` - Report endpoints

#### Settings Module
- [NEW] `src/settings/settings.module.ts` - Settings module
- [NEW] `src/settings/settings.service.ts` - Settings management
- [NEW] `src/settings/settings.controller.ts` - Settings endpoints

#### File Upload Module
- [NEW] `src/uploads/uploads.module.ts` - File upload module
- [NEW] `src/uploads/uploads.service.ts` - Image upload handling
- [NEW] `src/uploads/uploads.controller.ts` - Upload endpoints

---

### Component 3: Frontend Application (Next.js)

#### Project Structure
- [NEW] `frontend/package.json` - Frontend dependencies
- [NEW] `frontend/tsconfig.json` - TypeScript configuration
- [NEW] `frontend/next.config.js` - Next.js configuration
- [NEW] `frontend/tailwind.config.js` - Tailwind CSS configuration
- [NEW] `frontend/.env.local.example` - Environment variables template

#### Core Layout & Components
- [NEW] `src/app/layout.tsx` - Root layout with Thai font
- [NEW] `src/app/globals.css` - Global styles with Thai design system
- [NEW] `src/components/ui/button.tsx` - Reusable button component
- [NEW] `src/components/ui/card.tsx` - Card component
- [NEW] `src/components/ui/modal.tsx` - Modal component
- [NEW] `src/components/ui/table.tsx` - Table component
- [NEW] `src/components/layout/navbar.tsx` - Navigation bar
- [NEW] `src/components/layout/sidebar.tsx` - Admin sidebar

#### Authentication Pages
- [NEW] `src/app/login/page.tsx` - Login page
- [NEW] `src/lib/auth.ts` - Authentication utilities
- [NEW] `src/contexts/auth-context.tsx` - Auth context provider

#### Admin Pages
- [NEW] `src/app/admin/layout.tsx` - Admin layout with sidebar
- [NEW] `src/app/admin/dashboard/page.tsx` - Admin dashboard
- [NEW] `src/app/admin/packages/page.tsx` - Package management page
- [NEW] `src/app/admin/packages/[id]/page.tsx` - Package edit page
- [NEW] `src/app/admin/menus/page.tsx` - Menu management page
- [NEW] `src/app/admin/menus/[id]/page.tsx` - Menu edit page
- [NEW] `src/app/admin/tables/page.tsx` - Table management page
- [NEW] `src/app/admin/users/page.tsx` - User management page
- [NEW] `src/app/admin/settings/page.tsx` - Settings page
- [NEW] `src/app/admin/reports/page.tsx` - Reports page
- [NEW] `src/app/admin/loyalty/page.tsx` - Loyalty management page

#### Staff Pages
- [NEW] `src/app/staff/layout.tsx` - Staff layout
- [NEW] `src/app/staff/tables/page.tsx` - Table dashboard
- [NEW] `src/app/staff/orders/page.tsx` - Order management
- [NEW] `src/components/staff/table-card.tsx` - Table status card
- [NEW] `src/components/staff/start-session-modal.tsx` - Start session modal
- [NEW] `src/components/staff/order-list.tsx` - Order list component

#### Cashier Pages
- [NEW] `src/app/cashier/layout.tsx` - Cashier layout
- [NEW] `src/app/cashier/billing/page.tsx` - Billing page
- [NEW] `src/app/cashier/receipts/page.tsx` - Receipt history
- [NEW] `src/components/cashier/bill-calculator.tsx` - Bill calculation component
- [NEW] `src/components/cashier/receipt-preview.tsx` - Receipt preview

#### Customer Pages (QR Access)
- [NEW] `src/app/customer/[sessionId]/page.tsx` - Customer menu page
- [NEW] `src/app/customer/[sessionId]/order-status/page.tsx` - Order status page
- [NEW] `src/components/customer/menu-grid.tsx` - Menu display grid
- [NEW] `src/components/customer/menu-filter.tsx` - Category filter
- [NEW] `src/components/customer/cart.tsx` - Shopping cart
- [NEW] `src/components/customer/timer.tsx` - Countdown timer
- [NEW] `src/components/customer/call-staff-button.tsx` - Call staff button

#### API Integration
- [NEW] `src/lib/api/client.ts` - API client with axios
- [NEW] `src/lib/api/packages.ts` - Package API calls
- [NEW] `src/lib/api/menus.ts` - Menu API calls
- [NEW] `src/lib/api/tables.ts` - Table API calls
- [NEW] `src/lib/api/sessions.ts` - Session API calls
- [NEW] `src/lib/api/orders.ts` - Order API calls
- [NEW] `src/lib/api/billing.ts` - Billing API calls
- [NEW] `src/lib/api/loyalty.ts` - Loyalty API calls

---

### Component 4: Documentation & Deployment

- [NEW] `README.md` - Project overview and setup instructions
- [NEW] `DATABASE_SCHEMA.md` - Database schema documentation with ERD
- [NEW] `API_DOCUMENTATION.md` - REST API endpoint documentation
- [NEW] `DEPLOYMENT.md` - Deployment guide
- [NEW] `USER_MANUAL_TH.md` - User manual in Thai
- [NEW] `docker-compose.yml` - Docker compose for local development
- [NEW] `backend/Dockerfile` - Backend Docker image
- [NEW] `frontend/Dockerfile` - Frontend Docker image
- [NEW] `.github/workflows/deploy.yml` - CI/CD workflow
- [NEW] `.gitignore` - Git ignore file

## Verification Plan

### Automated Tests

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

### Manual Verification

#### 1. Authentication & Authorization Flow
- Login as Admin, Staff, Cashier, Kitchen, Manager
- Verify role-based access to different pages
- Test JWT token expiration and refresh

#### 2. Package Management
- Create Silver package with base menus
- Create Gold package inheriting from Silver + additional menus
- Create Platinum package inheriting from Gold + premium menus
- Verify menu inheritance works correctly
- Test package pricing for adults/children

#### 3. Table & Session Workflow
- Staff opens a table and starts a session
- Select package (Gold)
- Set number of adults and children
- Generate QR code
- Scan QR code on mobile device
- Verify customer sees correct menu items for Gold package
- Verify timer countdown displays correctly

#### 4. Customer Ordering
- Browse menu by category
- Add items to cart
- Submit order
- Verify order appears in staff/kitchen view
- Update order status (Accepted → In Progress → Served)
- Verify customer sees real-time status updates

#### 5. Billing & Receipt
- Navigate to cashier billing page
- Select table with active session
- Verify bill calculation:
  - Package price × number of people
  - VAT calculation (7%)
  - Service charge calculation (10%)
  - Total amount
- Apply discount (percentage and fixed amount)
- Add member to earn points
- Process payment
- Generate and download PDF receipt
- Verify receipt contains all required information

#### 6. Loyalty Program
- Register new member at checkout
- Verify points are calculated correctly (e.g., 100 THB = 1 point)
- Use points to redeem discount
- Verify points deduction is recorded
- Check member points history

#### 7. Reports
- View daily sales report
- View sales by package
- View top menu items
- Export report to CSV
- Verify data accuracy

#### 8. Mobile Responsiveness
- Test all customer pages on mobile devices
- Verify QR scanning works on iOS and Android
- Test touch interactions and scrolling
- Verify Thai fonts display correctly

## Business Flow Summary

### 1. System Setup (Admin)
1. Admin logs in to the system
2. Configure restaurant settings (name, address, logo, VAT%, service charge%)
3. Create user accounts for Staff, Cashier, Kitchen staff
4. Create menu categories (ย่าง, ทอด, ซูชิ, ของหวาน, เครื่องดื่ม)
5. Add menu items with images, descriptions, categories
6. Create packages (Silver, Gold, Platinum) with pricing
7. Assign menus to packages with inheritance
8. Setup tables with table numbers and zones
9. Configure loyalty program rules

### 2. Daily Operations (Staff)
1. Staff logs in and sees table dashboard
2. Customer arrives, staff selects available table
3. Staff selects package (e.g., Gold Buffet)
4. Staff enters number of adults and children
5. Staff clicks "เริ่มรอบโต๊ะ" (Start Session)
6. System creates session, starts timer, generates QR code
7. Staff shows QR code to customer or places QR stand on table

### 3. Customer Experience
1. Customer scans QR code with phone
2. Customer sees menu page with:
   - Restaurant name and table number
   - Package name (Gold Buffet)
   - Timer showing remaining time
   - Menu items filtered by package
3. Customer browses menu by category
4. Customer adds items to cart with quantities
5. Customer clicks "ส่งออเดอร์" (Send Order)
6. Order is submitted to kitchen
7. Customer can view order status in real-time
8. Customer can place additional orders
9. Customer can click "เรียกพนักงาน" (Call Staff) if needed

### 4. Kitchen/Staff Order Processing
1. Kitchen staff sees new orders in order management page
2. Staff updates order status:
   - New → Accepted → In Progress → Served
3. Customer sees status updates in real-time
4. Process repeats for each new order

### 5. Checkout (Cashier)
1. Customer requests bill
2. Cashier selects the table
3. System calculates:
   - Package price × (adults + children)
   - Add any extra menu items (if applicable)
   - Subtotal
   - Service charge (10%)
   - VAT (7%)
   - Grand total
4. Cashier can apply discounts with reason
5. Cashier asks for member phone number
6. If member exists, show points balance
7. If new customer, register as member
8. Customer can use points for discount
9. Cashier selects payment method (cash, transfer, QR, card)
10. Cashier confirms payment
11. System:
    - Closes the session
    - Sets table status to "ว่าง" (Available)
    - Calculates and adds loyalty points
    - Generates receipt
12. Print or email receipt to customer

### 6. Reporting (Admin/Manager)
1. Admin/Manager views reports dashboard
2. Select date range
3. View sales summary, package breakdown, top menus
4. View member statistics
5. Export data to CSV/Excel

## Future Expansion Recommendations

### 1. Promotion & Coupon System
- Create promotional campaigns (e.g., "Happy Hour 50% off")
- Generate coupon codes with expiration dates
- Apply coupons at checkout
- Track coupon usage and effectiveness

### 2. Advanced Loyalty Features
- Tier-based membership (Bronze, Silver, Gold members)
- Birthday promotions (free dessert, bonus points)
- Referral program (earn points for bringing friends)
- Member-exclusive menu items or packages

### 3. Online Table Reservation
- Customer web portal for booking tables
- Select date, time, number of people, package
- Receive confirmation via email/SMS
- Staff view upcoming reservations
- Integration with Google Calendar

### 4. Kitchen Display System (KDS)
- Dedicated screen for kitchen showing orders
- Color-coded by urgency
- Audio alerts for new orders
- One-tap status updates

### 5. Inventory Management
- Track ingredient stock levels
- Auto-deduct ingredients when menu items are ordered
- Low stock alerts
- Purchase order management
- Supplier management

### 6. Multi-language Support
- Add English translations for all UI elements
- Language switcher for customer menu
- Support for other languages (Chinese, Japanese)

### 7. Analytics & Business Intelligence
- Customer behavior analysis
- Peak hours identification
- Menu item profitability analysis
- Predictive analytics for inventory
- Customer lifetime value tracking

### 8. Integration with Third-party Services
- Line Notify for staff alerts
- SMS notifications for customers
- Payment gateway integration (Omise, 2C2P)
- Accounting software integration (e.g., export to QuickBooks)

### 9. Mobile Apps
- Native iOS/Android apps for better performance
- Push notifications for order status
- Offline mode for staff tablets

### 10. Advanced Reporting
- Custom report builder
- Scheduled report emails
- Dashboard widgets
- Real-time sales monitoring

---

## Next Steps

After approval of this plan, I will:

1. Create the project directory structure
2. Generate complete database schema with SQL DDL
3. Build the backend API with all modules
4. Build the frontend application with all pages
5. Create comprehensive documentation
6. Setup Docker configuration for easy deployment
7. Prepare the GitHub repository

Please review this implementation plan and let me know if you have any questions or would like any modifications before I proceed with the implementation.
