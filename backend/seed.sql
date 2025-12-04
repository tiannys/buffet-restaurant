-- Buffet Restaurant Database Seed Script
-- Run this script to populate initial data

-- 1. Create Branch
INSERT INTO branch (id, name, address, phone, is_active, created_at, updated_at) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'สาขาหลัก', '123 ถนนสุขุมวิท กรุงเทพฯ', '02-123-4567', true, NOW(), NOW());

-- 2. Create Roles
INSERT INTO role (id, name, description, created_at, updated_at) 
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'Admin', 'ผู้ดูแลระบบ', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', 'Staff', 'พนักงานต้อนรับ', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', 'Cashier', 'พนักงานการเงิน', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440004', 'Kitchen', 'พนักงานครัว', NOW(), NOW());

-- 3. Create Users (password for all: admin123, staff123, cashier123, kitchen123)
INSERT INTO "user" (id, username, password, full_name, email, phone, is_active, role_id, branch_id, created_at, updated_at)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'admin', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlzIZWjpKpY15q7mu1Ocejbj.YO', 'ผู้ดูแลระบบ', 'admin@buffet.com', '081-234-5678', true, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', 'staff', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlzIZWjpKpY15q7mu1Ocejbj.YO', 'พนักงานต้อนรับ', 'staff@buffet.com', '081-234-5679', true, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'cashier', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlzIZWjpKpY15q7mu1Ocejbj.YO', 'พนักงานการเงิน', 'cashier@buffet.com', '081-234-5680', true, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', 'kitchen', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlzIZWjpKpY15q7mu1Ocejbj.YO', 'พนักงานครัว', 'kitchen@buffet.com', '081-234-5681', true, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW());

-- 4. Create Menu Categories
INSERT INTO menu_category (id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'เนื้อสัตว์', 'เนื้อหมู เนื้อวัว ไก่', 1, true, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440002', 'อาหารทะเล', 'กุ้ง ปลา หอย', 2, true, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440003', 'ผัก', 'ผักสด ผักต่างๆ', 3, true, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440004', 'ของหวาน', 'ไอศกรีม ผลไม้', 4, true, NOW(), NOW());

-- 5. Create Sample Menu Items
INSERT INTO menu_item (id, name, description, category_id, image_url, is_active, is_available, sort_order, created_at, updated_at)
VALUES
  ('990e8400-e29b-41d4-a716-446655440001', 'เนื้อวัวสไลด์', 'เนื้อวัวคุณภาพดี', '880e8400-e29b-41d4-a716-446655440001', NULL, true, true, 1, NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440002', 'หมูสามชั้น', 'หมูสามชั้นสด', '880e8400-e29b-41d4-a716-446655440001', NULL, true, true, 2, NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440003', 'กุ้งแช่แข็ง', 'กุ้งสด', '880e8400-e29b-41d4-a716-446655440002', NULL, true, true, 1, NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440004', 'ผักรวม', 'ผักสดหลากหลาย', '880e8400-e29b-41d4-a716-446655440003', NULL, true, true, 1, NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440005', 'ไอศกรีม', 'ไอศกรีมหลายรส', '880e8400-e29b-41d4-a716-446655440004', NULL, true, true, 1, NOW(), NOW());

-- 6. Create Packages
INSERT INTO package (id, name, description, price_adult, price_child, duration_minutes, is_active, sort_order, branch_id, parent_package_id, created_at, updated_at)
VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', 'Silver Buffet', 'บุฟเฟ่ต์มาตรฐาน', 299, 199, 90, true, 1, '550e8400-e29b-41d4-a716-446655440000', NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'Gold Buffet', 'บุฟเฟ่ต์พรีเมี่ยม', 399, 249, 120, true, 2, '550e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'Platinum Buffet', 'บุฟเฟ่ต์พิเศษ', 499, 299, 150, true, 3, '550e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440002', NOW(), NOW());

-- 7. Assign Menus to Packages
INSERT INTO package_menu (package_id, menu_item_id, created_at, updated_at)
VALUES
  -- Silver Package
  ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
  -- Gold Package (inherits from Silver + adds beef and shrimp)
  ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440003', NOW(), NOW());

-- 8. Create Tables
INSERT INTO "table" (id, table_number, zone, capacity, status, branch_id, is_active, created_at, updated_at)
VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'A1', 'Zone A', 4, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'A2', 'Zone A', 4, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'A3', 'Zone A', 6, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440004', 'B1', 'Zone B', 4, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440005', 'B2', 'Zone B', 4, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440006', 'B3', 'Zone B', 6, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440007', 'C1', 'Zone C', 8, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440008', 'C2', 'Zone C', 8, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440009', 'C3', 'Zone C', 10, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW()),
  ('bb0e8400-e29b-41d4-a716-446655440010', 'VIP1', 'VIP Zone', 12, 'AVAILABLE', '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW());

-- 9. Create Settings
INSERT INTO setting (id, key, value, description, created_at, updated_at)
VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', 'vat_percent', '7', 'VAT percentage', NOW(), NOW()),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'service_charge_percent', '10', 'Service charge percentage', NOW(), NOW()),
  ('cc0e8400-e29b-41d4-a716-446655440003', 'points_per_baht', '0.01', 'Points earned per baht spent', NOW(), NOW()),
  ('cc0e8400-e29b-41d4-a716-446655440004', 'baht_per_point', '1', 'Baht value per point redeemed', NOW(), NOW());

-- Done!
SELECT 'Database seeded successfully!' AS message;
