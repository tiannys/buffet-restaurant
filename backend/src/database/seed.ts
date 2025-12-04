import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Branch } from './entities/branch.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Package } from './entities/package.entity';
import { PackageMenu } from './entities/package-menu.entity';
import { Table } from './entities/table.entity';
import { Settings } from './entities/settings.entity';

// This script seeds the database with initial data
// Run with: npm run seed

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'buffet_restaurant',
    entities: [Branch, Role, User, MenuCategory, MenuItem, Package, PackageMenu, Table, Settings],
    synchronize: false,
});

async function seed() {
    await AppDataSource.initialize();

    console.log('🌱 Seeding database...');

    // 1. Create Branch
    const branchRepo = AppDataSource.getRepository(Branch);
    let branch = await branchRepo.findOne({ where: { name: 'สาขาหลัก' } });
    if (!branch) {
        branch = await branchRepo.save({
            name: 'สาขาหลัก',
            address: 'กรุงเทพมหานคร',
            phone: '02-123-4567',
            is_active: true,
        });
        console.log('✅ Created branch');
    } else {
        console.log('ℹ️  Branch already exists');
    }

    // 2. Create Roles
    const roleRepo = AppDataSource.getRepository(Role);
    const roles = ['Admin', 'Staff', 'Cashier', 'Kitchen'];
    const roleMap: any = {};

    for (const roleName of roles) {
        let role = await roleRepo.findOne({ where: { name: roleName } });
        if (!role) {
            role = await roleRepo.save({
                name: roleName,
                description: `${roleName} role`,
            });
        }
        roleMap[roleName] = role;
    }
    console.log('✅ Created roles');

    // 3. Create Users
    const userRepo = AppDataSource.getRepository(User);
    const users = [
        { username: 'admin', password: 'admin123', full_name: 'ผู้ดูแลระบบ', role: 'Admin' },
        { username: 'staff', password: 'staff123', full_name: 'พนักงานเสิร์ฟ', role: 'Staff' },
        { username: 'cashier', password: 'cashier123', full_name: 'แคชเชียร์', role: 'Cashier' },
        { username: 'kitchen', password: 'kitchen123', full_name: 'พนักงานครัว', role: 'Kitchen' },
    ];

    for (const userData of users) {
        const existing = await userRepo.findOne({ where: { username: userData.username } });
        if (!existing) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await userRepo.save({
                username: userData.username,
                password: hashedPassword,
                full_name: userData.full_name,
                role_id: roleMap[userData.role].id,
                branch_id: branch.id,
                is_active: true,
            });
            console.log(`  ✅ Created user: ${userData.username}`);
        } else {
            console.log(`  ℹ️  User ${userData.username} already exists`);
        }
    }
    console.log('✅ Created users');

    // 4. Create Menu Categories
    const categoryRepo = AppDataSource.getRepository(MenuCategory);
    const categories = [
        { name: 'เนื้อสัตว์', sort_order: 1 },
        { name: 'อาหารทะเล', sort_order: 2 },
        { name: 'ผัก', sort_order: 3 },
        { name: 'ซูชิ', sort_order: 4 },
        { name: 'ของหวาน', sort_order: 5 },
        { name: 'เครื่องดื่ม', sort_order: 6 },
    ];

    const categoryMap: any = {};
    for (const catData of categories) {
        let cat = await categoryRepo.findOne({ where: { name: catData.name, branch_id: branch.id } });
        if (!cat) {
            cat = await categoryRepo.save({
                ...catData,
                branch_id: branch.id,
                is_active: true,
            });
        }
        categoryMap[catData.name] = cat;
    }
    console.log('✅ Created categories');

    // 5. Create Sample Menu Items
    const menuRepo = AppDataSource.getRepository(MenuItem);
    const sampleMenus = [
        { name: 'หมูสามชั้น', category: 'เนื้อสัตว์', cost: 15 },
        { name: 'เนื้อวัว', category: 'เนื้อสัตว์', cost: 25 },
        { name: 'ไก่', category: 'เนื้อสัตว์', cost: 12 },
        { name: 'กุ้ง', category: 'อาหารทะเล', cost: 30 },
        { name: 'ปลาหมึก', category: 'อาหารทะเล', cost: 20 },
        { name: 'ผักรวม', category: 'ผัก', cost: 5 },
        { name: 'ซูชิแซลมอน', category: 'ซูชิ', cost: 35 },
        { name: 'ไอศกรีม', category: 'ของหวาน', cost: 8 },
        { name: 'น้ำอัดลม', category: 'เครื่องดื่ม', cost: 3 },
    ];

    const menuIds: string[] = [];
    for (const menuData of sampleMenus) {
        let menu = await menuRepo.findOne({ where: { name: menuData.name, branch_id: branch.id } });
        if (!menu) {
            menu = await menuRepo.save({
                name: menuData.name,
                category_id: categoryMap[menuData.category].id,
                cost: menuData.cost,
                branch_id: branch.id,
                is_active: true,
                is_available: true,
                sort_order: 0,
            });
        }
        menuIds.push(menu.id);
    }
    console.log('✅ Created sample menus');

    // 6. Create Packages
    const packageRepo = AppDataSource.getRepository(Package);

    let silverPkg = await packageRepo.findOne({ where: { name: 'Silver Buffet', branch_id: branch.id } });
    if (!silverPkg) {
        silverPkg = await packageRepo.save({
            name: 'Silver Buffet',
            description: 'แพ็กเกจพื้นฐาน',
            adult_price: 299,
            child_price: 149,
            duration_minutes: 120,
            branch_id: branch.id,
            is_active: true,
            sort_order: 1,
        });
    }

    let goldPkg = await packageRepo.findOne({ where: { name: 'Gold Buffet', branch_id: branch.id } });
    if (!goldPkg) {
        goldPkg = await packageRepo.save({
            name: 'Gold Buffet',
            description: 'แพ็กเกจยอดนิยม',
            adult_price: 399,
            child_price: 199,
            duration_minutes: 150,
            parent_package_id: silverPkg.id,
            branch_id: branch.id,
            is_active: true,
            sort_order: 2,
        });
    }

    let platinumPkg = await packageRepo.findOne({ where: { name: 'Platinum Buffet', branch_id: branch.id } });
    if (!platinumPkg) {
        platinumPkg = await packageRepo.save({
            name: 'Platinum Buffet',
            description: 'แพ็กเกจพรีเมียม',
            adult_price: 599,
            child_price: 299,
            duration_minutes: 180,
            parent_package_id: goldPkg.id,
            branch_id: branch.id,
            is_active: true,
            sort_order: 3,
        });
    }
    console.log('✅ Created packages');

    // 7. Assign menus to packages
    const packageMenuRepo = AppDataSource.getRepository(PackageMenu);

    // Assign all menus to Silver (base package)
    for (const menuId of menuIds) {
        const existing = await packageMenuRepo.findOne({
            where: { package_id: silverPkg.id, menu_item_id: menuId },
        });
        if (!existing) {
            await packageMenuRepo.save({
                package_id: silverPkg.id,
                menu_item_id: menuId,
            });
        }
    }
    console.log('✅ Assigned menus to packages');

    // 8. Create Tables
    const tableRepo = AppDataSource.getRepository(Table);
    for (let i = 1; i <= 10; i++) {
        const tableNumber = i.toString();
        const existing = await tableRepo.findOne({ where: { table_number: tableNumber, branch_id: branch.id } });
        if (!existing) {
            await tableRepo.save({
                table_number: tableNumber,
                zone: i <= 5 ? 'Zone A' : 'Zone B',
                capacity: 4,
                status: 'available',
                branch_id: branch.id,
                is_active: true,
            });
        }
    }
    console.log('✅ Created tables');

    // 9. Create Settings (create one default settings record)
    const settingRepo = AppDataSource.getRepository(Settings);
    const existingSettings = await settingRepo.find();

    if (existingSettings.length === 0) {
        await settingRepo.save({
            restaurant_name: 'ร้านบุฟเฟ่ต์',
            vat_percent: 7.00,
            service_charge_percent: 10.00,
        });
        console.log('✅ Created default settings');
    } else {
        console.log('ℹ️  Settings already exist');
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📝 Default credentials:');
    console.log('  👤 Admin: admin / admin123');
    console.log('  👤 Staff: staff / staff123');
    console.log('  👤 Cashier: cashier / cashier123');
    console.log('  👤 Kitchen: kitchen / kitchen123');

    await AppDataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
