# REST API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

All endpoints (except customer endpoints) require JWT authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Authentication Endpoints

### POST /auth/login
Login to the system

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "full_name": "ผู้ดูแลระบบ",
      "role": {
        "id": 1,
        "name": "Admin"
      },
      "branch_id": "uuid"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

### POST /auth/logout
Logout from the system

**Response:**
```json
{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}
```

### GET /auth/me
Get current user information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "full_name": "ผู้ดูแลระบบ",
    "role": {
      "id": 1,
      "name": "Admin",
      "permissions": {"all": true}
    },
    "branch_id": "uuid"
  }
}
```

---

## 2. Admin - User Management

**Role Required:** Admin

### GET /admin/users
Get all users

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role_id` (optional): Filter by role
- `search` (optional): Search by name or username

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "staff01",
        "full_name": "พนักงาน 1",
        "role": {
          "id": 2,
          "name": "Staff"
        },
        "is_active": true,
        "last_login": "2023-11-30T10:30:00Z",
        "created_at": "2023-11-01T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

### POST /admin/users
Create new user

**Request:**
```json
{
  "username": "staff02",
  "password": "password123",
  "full_name": "พนักงาน 2",
  "role_id": 2,
  "branch_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "staff02",
    "full_name": "พนักงาน 2",
    "role_id": 2,
    "is_active": true
  }
}
```

### PATCH /admin/users/:id
Update user

**Request:**
```json
{
  "full_name": "พนักงาน 2 (แก้ไข)",
  "is_active": false
}
```

### DELETE /admin/users/:id
Delete user

---

## 3. Admin - Package Management

**Role Required:** Admin

### GET /admin/packages
Get all packages

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Silver Buffet",
      "name_en": "Silver Buffet",
      "description": "แพ็กเกจพื้นฐาน",
      "color_hex": "#C0C0C0",
      "price_adult": 299.00,
      "price_child": 199.00,
      "time_limit_minutes": 90,
      "parent_package_id": null,
      "is_active": true,
      "menu_count": 45
    },
    {
      "id": "uuid",
      "name": "Gold Buffet",
      "name_en": "Gold Buffet",
      "description": "รวมเมนู Silver + เมนูพิเศษ",
      "color_hex": "#FFD700",
      "price_adult": 399.00,
      "price_child": 249.00,
      "time_limit_minutes": 120,
      "parent_package_id": "silver-uuid",
      "is_active": true,
      "menu_count": 75
    }
  ]
}
```

### POST /admin/packages
Create new package

**Request:**
```json
{
  "name": "Platinum Buffet",
  "name_en": "Platinum Buffet",
  "description": "แพ็กเกจพรีเมียม รวมเมนูทั้งหมด",
  "color_hex": "#E5E4E2",
  "price_adult": 599.00,
  "price_child": 349.00,
  "time_limit_minutes": 150,
  "parent_package_id": "gold-uuid",
  "branch_id": "uuid"
}
```

### PATCH /admin/packages/:id
Update package

### DELETE /admin/packages/:id
Delete package

### GET /admin/packages/:id/menus
Get all menus for a package (including inherited)

**Response:**
```json
{
  "success": true,
  "data": {
    "package": {
      "id": "uuid",
      "name": "Gold Buffet"
    },
    "menus_by_category": [
      {
        "category_id": "uuid",
        "category_name": "ย่าง",
        "items": [
          {
            "id": "uuid",
            "name": "หมูสามชั้น",
            "image_url": "/uploads/pork.jpg",
            "is_inherited": false,
            "is_available": true
          }
        ]
      }
    ]
  }
}
```

### PUT /admin/packages/:id/menus
Update package menu assignments

**Request:**
```json
{
  "menu_item_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

## 4. Admin - Menu Management

**Role Required:** Admin

### GET /admin/menus
Get all menu items

**Query Parameters:**
- `category_id` (optional): Filter by category
- `search` (optional): Search by name
- `is_available` (optional): Filter by availability

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "หมูสามชั้น",
      "name_en": "Pork Belly",
      "description": "หมูสามชั้นสดใหม่",
      "category": {
        "id": "uuid",
        "name": "ย่าง"
      },
      "image_url": "/uploads/pork.jpg",
      "price_standalone": 0,
      "is_available": true,
      "is_out_of_stock": false,
      "tags": ["popular"]
    }
  ]
}
```

### POST /admin/menus
Create new menu item

**Request (multipart/form-data):**
```
name: "เนื้อวากิว"
name_en: "Wagyu Beef"
description: "เนื้อวากิวชั้นพรีเมียม"
category_id: "uuid"
price_standalone: 0
image: <file>
tags: ["premium", "popular"]
```

### PATCH /admin/menus/:id
Update menu item

### DELETE /admin/menus/:id
Delete menu item

### GET /admin/menu-categories
Get all menu categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ย่าง",
      "name_en": "Grilled",
      "icon": "fire",
      "sort_order": 1,
      "item_count": 25
    }
  ]
}
```

### POST /admin/menu-categories
Create menu category

---

## 5. Admin - Table Management

**Role Required:** Admin

### GET /admin/tables
Get all tables

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "table_number": "A01",
      "zone": "ชั้น 1",
      "capacity": 4,
      "status": "available",
      "qr_code_url": "/qr/table-a01.png"
    }
  ]
}
```

### POST /admin/tables
Create new table

**Request:**
```json
{
  "table_number": "A05",
  "zone": "ชั้น 1",
  "capacity": 6,
  "branch_id": "uuid"
}
```

### PATCH /admin/tables/:id
Update table

### DELETE /admin/tables/:id
Delete table

### POST /admin/tables/:id/generate-qr
Generate QR code for table

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code_url": "/qr/table-a01.png",
    "qr_code_data": "https://restaurant.com/customer/table/uuid"
  }
}
```

---

## 6. Admin - Settings

**Role Required:** Admin

### GET /admin/settings
Get all settings

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant_name": "ร้านบุฟเฟ่ต์สุขใจ",
    "vat_percent": 7,
    "service_charge_percent": 10,
    "loyalty_points_per_baht": 0.01,
    "loyalty_points_value": 1,
    "restaurant_address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "restaurant_phone": "02-123-4567"
  }
}
```

### PUT /admin/settings
Update settings

**Request:**
```json
{
  "vat_percent": 7,
  "service_charge_percent": 10,
  "restaurant_name": "ร้านบุฟเฟ่ต์สุขใจ"
}
```

---

## 7. Staff - Table Dashboard

**Role Required:** Staff, Admin

### GET /staff/tables/dashboard
Get table dashboard with current status

**Response:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "uuid",
        "table_number": "A01",
        "zone": "ชั้น 1",
        "capacity": 4,
        "status": "occupied",
        "current_session": {
          "id": "uuid",
          "package": {
            "name": "Gold Buffet",
            "color_hex": "#FFD700"
          },
          "num_adults": 2,
          "num_children": 1,
          "start_time": "2023-11-30T12:00:00Z",
          "time_limit_minutes": 120,
          "minutes_remaining": 85,
          "total_orders": 5
        }
      },
      {
        "id": "uuid",
        "table_number": "A02",
        "zone": "ชั้น 1",
        "capacity": 4,
        "status": "available",
        "current_session": null
      }
    ],
    "summary": {
      "total_tables": 20,
      "available": 12,
      "occupied": 6,
      "billing": 2,
      "disabled": 0
    }
  }
}
```

---

## 8. Staff - Session Management

**Role Required:** Staff, Admin

### POST /staff/sessions/start
Start a new customer session

**Request:**
```json
{
  "table_id": "uuid",
  "package_id": "uuid",
  "num_adults": 2,
  "num_children": 1,
  "notes": "ลูกค้า VIP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "session_token": "abc123-1234567890-xyz789",
    "table_number": "A01",
    "package_name": "Gold Buffet",
    "start_time": "2023-11-30T12:00:00Z",
    "time_limit_minutes": 120,
    "token_expires_at": "2023-11-30T14:30:00Z",
    "qr_url": "https://restaurant.com/customer/session/abc123-1234567890-xyz789",
    "qr_code_image": "data:image/png;base64,iVBORw0KG..."
  }
}
```

> [!IMPORTANT]
> **QR Code Security**: Each session generates a unique `session_token` that must be printed fresh. Old QR codes cannot be reused to prevent unauthorized ordering.

### GET /staff/sessions/:id
Get session details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "table": {
      "id": "uuid",
      "table_number": "A01"
    },
    "package": {
      "id": "uuid",
      "name": "Gold Buffet",
      "price_adult": 399.00,
      "price_child": 249.00
    },
    "num_adults": 2,
    "num_children": 1,
    "start_time": "2023-11-30T12:00:00Z",
    "time_limit_minutes": 120,
    "minutes_remaining": 85,
    "status": "active",
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-001",
        "status": "served",
        "created_at": "2023-11-30T12:05:00Z",
        "items_count": 5
      }
    ]
  }
}
```

### PATCH /staff/sessions/:id/close
Close a session (move to billing)

**Response:**
```json
{
  "success": true,
  "message": "ปิดรอบการนั่งสำเร็จ โต๊ะพร้อมสำหรับเช็กบิล"
}
```

---

## 9. Staff/Kitchen - Order Management

**Role Required:** Staff, Kitchen, Admin

### GET /staff/orders
Get all orders

**Query Parameters:**
- `status` (optional): Filter by status
- `table_id` (optional): Filter by table
- `session_id` (optional): Filter by session

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-001",
      "session": {
        "id": "uuid",
        "table_number": "A01",
        "package_name": "Gold Buffet"
      },
      "status": "in_progress",
      "items": [
        {
          "id": "uuid",
          "menu_item": {
            "name": "หมูสามชั้น",
            "image_url": "/uploads/pork.jpg"
          },
          "quantity": 2,
          "notes": "ไม่เผ็ด"
        }
      ],
      "created_at": "2023-11-30T12:05:00Z",
      "updated_at": "2023-11-30T12:10:00Z"
    }
  ]
}
```

### PATCH /staff/orders/:id/status
Update order status

**Request:**
```json
{
  "status": "in_progress"
}
```

**Valid status transitions:**
- new → accepted
- accepted → in_progress
- in_progress → served
- Any → cancelled

---

## 10. Customer - QR Menu Access

**No Authentication Required**

> [!WARNING]
> **Session Token Validation**: All customer endpoints validate the `session_token` to ensure:
> - Token exists and is valid
> - Session is still active
> - Token has not expired
> - Time limit has not been exceeded

### GET /customer/session/:sessionToken
Get session info and available menus using the unique session token from QR code

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "table_number": "A01",
      "package": {
        "name": "Gold Buffet",
        "color_hex": "#FFD700"
      },
      "start_time": "2023-11-30T12:00:00Z",
      "time_limit_minutes": 120,
      "minutes_remaining": 85,
      "num_adults": 2,
      "num_children": 1
    },
    "restaurant": {
      "name": "ร้านบุฟเฟ่ต์สุขใจ",
      "logo_url": "/logo.png"
    },
    "categories": [
      {
        "id": "uuid",
        "name": "ย่าง",
        "icon": "fire",
        "items": [
          {
            "id": "uuid",
            "name": "หมูสามชั้น",
            "description": "หมูสามชั้นสดใหม่",
            "image_url": "/uploads/pork.jpg",
            "is_available": true,
            "is_out_of_stock": false,
            "tags": ["popular"]
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**
```json
// Invalid or not found token
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "ไม่พบรอบการนั่งนี้"
  }
}

// Session already closed
{
  "success": false,
  "error": {
    "code": "SESSION_CLOSED",
    "message": "รอบการนั่งนี้ถูกปิดแล้ว กรุณาติดต่อพนักงาน"
  }
}

// Token expired
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "QR Code หมดอายุแล้ว กรุณาขอ QR Code ใหม่จากพนักงาน"
  }
}
```

### POST /customer/session/:sessionToken/orders
Place an order

**Request:**
```json
{
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "notes": "ไม่เผ็ด"
    },
    {
      "menu_item_id": "uuid",
      "quantity": 1
    }
  ],
  "notes": "ขอเสิร์ฟพร้อมกัน"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-005",
    "status": "new",
    "items_count": 2,
    "created_at": "2023-11-30T12:30:00Z"
  }
}
```

**Error Responses:**
```json
// Time limit exceeded
{
  "success": false,
  "error": {
    "code": "TIME_LIMIT_EXCEEDED",
    "message": "เวลาในการทานหมดแล้ว ไม่สามารถสั่งอาหารเพิ่มได้"
  }
}
```

### GET /customer/session/:sessionToken/orders
Get order history for session

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-005",
      "status": "in_progress",
      "items": [
        {
          "menu_item_name": "หมูสามชั้น",
          "quantity": 2,
          "notes": "ไม่เผ็ด"
        }
      ],
      "created_at": "2023-11-30T12:30:00Z",
      "updated_at": "2023-11-30T12:32:00Z"
    }
  ]
}
```

### POST /customer/session/:sessionToken/call-staff
Call staff for assistance

**Request:**
```json
{
  "reason": "ขอน้ำเพิ่ม"
}
```

---

## 11. Cashier - Billing

**Role Required:** Cashier, Admin

### GET /cashier/sessions/:sessionId/calculate-bill
Calculate bill for a session

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "table_number": "A01",
      "package_name": "Gold Buffet"
    },
    "package_charges": {
      "adults": {
        "count": 2,
        "price_per_person": 399.00,
        "total": 798.00
      },
      "children": {
        "count": 1,
        "price_per_person": 249.00,
        "total": 249.00
      },
      "subtotal": 1047.00
    },
    "extra_items": {
      "items": [],
      "total": 0.00
    },
    "subtotal": 1047.00,
    "service_charge": {
      "percent": 10,
      "amount": 104.70
    },
    "subtotal_with_service": 1151.70,
    "vat": {
      "percent": 7,
      "amount": 80.62
    },
    "grand_total": 1232.32,
    "settings": {
      "vat_percent": 7,
      "service_charge_percent": 10
    }
  }
}
```

### POST /cashier/receipts
Create receipt and process payment

**Request:**
```json
{
  "session_id": "uuid",
  "member_phone": "0812345678",
  "discount_percent": 0,
  "discount_amount": 0,
  "discount_reason": "",
  "points_used": 0,
  "payment_method": "cash",
  "payment_amount": 1232.32,
  "payment_reference": ""
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt_id": "uuid",
    "receipt_number": "R20231130-0001",
    "grand_total": 1232.32,
    "points_earned": 12,
    "member": {
      "name": "คุณสมชาย",
      "new_points_balance": 112
    },
    "pdf_url": "/receipts/R20231130-0001.pdf"
  }
}
```

### GET /cashier/receipts/:id
Get receipt details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "receipt_number": "R20231130-0001",
    "created_at": "2023-11-30T14:00:00Z",
    "session": {
      "table_number": "A01",
      "package_name": "Gold Buffet",
      "num_adults": 2,
      "num_children": 1
    },
    "subtotal": 1047.00,
    "service_charge_percent": 10,
    "service_charge_amount": 104.70,
    "vat_percent": 7,
    "vat_amount": 80.62,
    "discount_amount": 0,
    "points_used": 0,
    "points_value": 0,
    "grand_total": 1232.32,
    "payment": {
      "method": "cash",
      "amount": 1232.32
    },
    "member": {
      "name": "คุณสมชาย",
      "phone": "0812345678",
      "points_earned": 12
    }
  }
}
```

### GET /cashier/receipts
Get receipt history

**Query Parameters:**
- `date_from` (optional): Start date
- `date_to` (optional): End date
- `member_id` (optional): Filter by member

---

## 12. Loyalty Program

**Role Required:** Cashier, Admin

### GET /loyalty/members/search
Search member by phone

**Query Parameters:**
- `phone`: Phone number

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "member_code": "M000001",
    "name": "คุณสมชาย",
    "phone": "0812345678",
    "total_points": 100,
    "total_visits": 10,
    "total_spent": 12000.00
  }
}
```

### POST /loyalty/members
Register new member

**Request:**
```json
{
  "name": "คุณสมหญิง",
  "phone": "0823456789",
  "email": "somying@example.com",
  "birthdate": "1990-05-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "member_code": "M000002",
    "name": "คุณสมหญิง",
    "phone": "0823456789",
    "total_points": 0
  }
}
```

### GET /loyalty/members/:id/points-history
Get member points history

**Response:**
```json
{
  "success": true,
  "data": {
    "member": {
      "name": "คุณสมชาย",
      "total_points": 100
    },
    "history": [
      {
        "id": "uuid",
        "points_change": 12,
        "reason": "earn_purchase",
        "description": "ใบเสร็จ R20231130-0001",
        "balance_after": 112,
        "created_at": "2023-11-30T14:00:00Z"
      },
      {
        "id": "uuid",
        "points_change": -50,
        "reason": "redeem_discount",
        "description": "แลกส่วนลด 50 บาท",
        "balance_after": 100,
        "created_at": "2023-11-25T13:00:00Z"
      }
    ]
  }
}
```

---

## 13. Reports

**Role Required:** Admin

### GET /reports/sales-summary
Get sales summary

**Query Parameters:**
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `branch_id` (optional): Filter by branch

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2023-11-01",
      "to": "2023-11-30"
    },
    "summary": {
      "total_receipts": 150,
      "total_customers": 450,
      "gross_sales": 150000.00,
      "total_discounts": 5000.00,
      "total_service_charge": 14500.00,
      "total_vat": 10150.00,
      "net_sales": 169650.00
    },
    "by_package": [
      {
        "package_name": "Gold Buffet",
        "count": 80,
        "total_amount": 95000.00
      },
      {
        "package_name": "Silver Buffet",
        "count": 70,
        "total_amount": 55000.00
      }
    ],
    "by_payment_method": [
      {
        "method": "cash",
        "count": 100,
        "total": 120000.00
      },
      {
        "method": "qr_promptpay",
        "count": 50,
        "total": 49650.00
      }
    ]
  }
}
```

### GET /reports/top-menu-items
Get top selling menu items

**Query Parameters:**
- `date_from`: Start date
- `date_to`: End date
- `limit` (optional): Number of items (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "menu_item_id": "uuid",
      "name": "หมูสามชั้น",
      "category": "ย่าง",
      "total_orders": 450,
      "total_quantity": 1200
    }
  ]
}
```

### GET /reports/customer-traffic
Get customer traffic report

**Query Parameters:**
- `date_from`: Start date
- `date_to`: End date

**Response:**
```json
{
  "success": true,
  "data": {
    "daily_traffic": [
      {
        "date": "2023-11-30",
        "total_sessions": 25,
        "total_customers": 75,
        "adults": 50,
        "children": 25,
        "avg_session_duration_minutes": 105
      }
    ],
    "peak_hours": [
      {
        "hour": 12,
        "sessions": 15
      },
      {
        "hour": 18,
        "sessions": 20
      }
    ]
  }
}
```

### GET /reports/loyalty-summary
Get loyalty program summary

**Response:**
```json
{
  "success": true,
  "data": {
    "total_members": 500,
    "new_members_this_month": 25,
    "total_points_issued": 50000,
    "total_points_redeemed": 15000,
    "top_members": [
      {
        "member_code": "M000001",
        "name": "คุณสมชาย",
        "total_visits": 50,
        "total_spent": 50000.00,
        "current_points": 500
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลไม่ถูกต้อง",
    "details": [
      {
        "field": "username",
        "message": "กรุณากรอก username"
      }
    ]
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `BUSINESS_LOGIC_ERROR`: Business rule violation
- `INTERNAL_SERVER_ERROR`: Server error

---

## 15. Waste Tracking

**Role Required:** Staff, Kitchen, Admin

### POST /staff/orders/:orderId/items/:itemId/mark-waste
Mark food waste for tracking

**Request:**
```json
{
  "waste_quantity": 2,
  "reason": "customer_leftover",
  "notes": "ลูกค้าสั่งแต่ไม่ได้กิน"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_item_id": "uuid",
    "menu_item_name": "หมูสามชั้น",
    "ordered_quantity": 3,
    "waste_quantity": 2,
    "waste_percentage": 66.67
  }
}
```

### GET /admin/reports/waste-summary
Get waste summary report

**Query Parameters:**
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `reason`: Filter by waste reason (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_waste_items": 450,
      "total_waste_cost": 12500.00
    },
    "by_reason": [
      {
        "reason": "customer_leftover",
        "count": 320,
        "cost": 8900.00
      }
    ],
    "top_wasted_items": [
      {
        "menu_item_id": "uuid",
        "name": "ซูชิแซลมอน",
        "total_waste": 120,
        "total_cost": 3600.00
      }
    ]
  }
}
```

---

## 16. Kitchen Printer

**Role Required:** Admin

### POST /admin/printer/test
Test kitchen printer connection

**Response:**
```json
{
  "success": true,
  "message": "ทดสอบพิมพ์สำเร็จ"
}
```

### POST /staff/orders/:orderId/print
Manually print order to kitchen

**Response:**
```json
{
  "success": true,
  "message": "พิมพ์ใบสั่งสำเร็จ"
}
```

---

## 17. Menu Stock Management

**Role Required:** Staff, Kitchen, Admin

### PATCH /staff/menus/:id/toggle-stock
Quick toggle menu stock status

**Request:**
```json
{
  "is_out_of_stock": true,
  "reason": "วัตถุดิบหมด",
  "estimated_available_time": "14:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "menu_id": "uuid",
    "name": "ซูชิแซลมอน",
    "is_out_of_stock": true,
    "estimated_available_time": "14:00"
  }
}
```

---

## WebSocket Events (Real-time Updates)

### Connection
```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: {
    userId: 'user-uuid',
    userRole: 'Staff'
  }
});
```

### Events

#### customer:called
Customer called staff for assistance
```json
{
  "type": "CUSTOMER_CALL",
  "table_number": "A01",
  "session_id": "uuid",
  "reason": "ขอน้ำเพิ่ม",
  "timestamp": "2023-11-30T12:30:00Z"
}
```

#### session:time-warning
Session time warning (5 minutes before end)
```json
{
  "type": "TIME_WARNING",
  "table_number": "A01",
  "session_id": "uuid",
  "minutes_remaining": 5,
  "package_name": "Gold Buffet",
  "timestamp": "2023-11-30T13:55:00Z"
}
```

#### order:new
New order created
```json
{
  "type": "NEW_ORDER",
  "table_number": "A01",
  "order_number": "ORD-123",
  "items_count": 5,
  "timestamp": "2023-11-30T12:15:00Z"
}
```

#### order:status_updated
Order status changed
```json
{
  "order_id": "uuid",
  "order_number": "ORD-123",
  "old_status": "new",
  "new_status": "in_progress",
  "timestamp": "2023-11-30T12:16:00Z"
}
```

#### table:status_updated
Table status changed
```json
{
  "table_id": "uuid",
  "table_number": "A01",
  "old_status": "available",
  "new_status": "occupied"
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `NOT_FOUND` | Resource not found | Requested resource doesn't exist |
| `SESSION_CLOSED` | Session already closed | Cannot perform action on closed session |
| `TOKEN_EXPIRED` | Token expired | QR code or JWT token has expired |
| `TIME_LIMIT_EXCEEDED` | Time limit exceeded | Session time has run out |
| `UNAUTHORIZED` | Unauthorized | Invalid or missing authentication |
| `FORBIDDEN` | Forbidden | Insufficient permissions |
| `VALIDATION_ERROR` | Validation failed | Request data validation failed |
| `PRINTER_ERROR` | Printer connection failed | Cannot connect to kitchen printer |
