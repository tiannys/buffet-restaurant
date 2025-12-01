const fs = require('fs');
const path = require('path');

const translations = {
    // User Management
    'จัดการผู้ใช้งาน': 'User Management',
    'เพิ่มผู้ใช้': 'Add User',
    'แก้ไขผู้ใช้': 'Edit User',
    'ปิด': 'Close',
    'ชื่อผู้ใช้': 'Username',
    'ชื่อ-นามสกุล': 'Full Name',
    'บทบาท': 'Role',
    'สาขา': 'Branch',
    'รหัสผ่าน': 'Password',
    'เลือกบทบาท': 'Select Role',
    'เลือกสาขา': 'Select Branch',
    'ยกเลิก': 'Cancel',
    'บันทึก': 'Save',
    'เพิ่ม': 'Add',
    'แก้ไข': 'Edit',
    'ลบ': 'Delete',
    'จัดการ': 'Actions',

    // Alerts
    'ต้องการลบผู้ใช้': 'Are you sure you want to delete user',
    'ใช่หรือไม่?': '?',
    'ลบผู้ใช้สำเร็จ': 'User deleted successfully',
    'ไม่สามารถลบผู้ใช้ได้': 'Failed to delete user',
    'อัพเดทผู้ใช้สำเร็จ': 'User updated successfully',
    'เพิ่มผู้ใช้สำเร็จ': 'User created successfully',
    'ไม่สามารถบันทึกข้อมูลได้': 'Failed to save user',
    'ไม่สามารถโหลดข้อมูลผู้ใช้ได้': 'Failed to load users',
    'กำลังโหลด...': 'Loading...',

    // Dashboard
    'แดชบอร์ดผู้ดูแลระบบ': 'Admin Dashboard',
    'ผู้ใช้งานทั้งหมด': 'Total Users',
    'ระบบจัดการร้านบุฟเฟ่ต์': 'Buffet Restaurant Management System',
    'โต๊ะทั้งหมด': 'Total Tables',
    'แพ็คเกจ': 'Packages',
    'เมนูอาหาร': 'Menu Items',
    'จัดการบัญชีผู้ใช้และสิทธิ์': 'Manage user accounts and permissions',
    'จัดการเมนู': 'Menu Management',
    'เพิ่ม แก้ไข ลบเมนูอาหาร': 'Add, edit, delete menu items',
    'จัดการแพ็คเกจ': 'Package Management',
    'จัดการแพ็คเกจบุฟเฟ่ต์': 'Manage buffet packages',
    'จัดการโต๊ะ': 'Table Management',
    'เพิ่ม แก้ไข ลบโต๊ะ': 'Add, edit, delete tables',
    'รายงาน': 'Reports',
    'ดูรายงานยอดขายและสถิติ': 'View sales reports and statistics',
    'ดูรายงาน': 'View Reports',
    'กำลังโหลดข้อมูลโต๊ะ...': 'Loading tables...',
    'แดชบอร์ดโต๊ะ': 'Table Dashboard',
    'โต๊ะ': 'Table',
    'เริ่มรอบโต๊ะ': 'Start Session',
    'โต๊ะที่มีลูกค้า': 'Active Tables',
    'เลือกโต๊ะเพื่อคำนวณบิล': 'Select a table to calculate bill',

    // Login
    'เข้าสู่ระบบ': 'Login',
    'ออกจากระบบ': 'Logout',

    // Settings
    'ตั้งค่าระบบ': 'System Settings',
    'ตั้งค่า': 'Settings',
    'ชื่อร้าน': 'Restaurant Name',
    'โลโก้': 'Logo',
};

function translateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Sort by length (longest first) to avoid partial replacements
    const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);

    for (const thai of sortedKeys) {
        const english = translations[thai];
        content = content.split(thai).join(english);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Translated: ${filePath}`);
}

// Get file path from command line
const filePath = process.argv[2];
if (filePath) {
    translateFile(filePath);
} else {
    console.log('Usage: node translate.js <file-path>');
}
