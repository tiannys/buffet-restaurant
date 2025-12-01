import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../database/entities/menu-item.entity';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { PackageMenu } from '../database/entities/package-menu.entity';

@Injectable()
export class MenusService {
    constructor(
        @InjectRepository(MenuItem)
        private menuItemsRepository: Repository<MenuItem>,
        @InjectRepository(MenuCategory)
        private categoriesRepository: Repository<MenuCategory>,
        @InjectRepository(PackageMenu)
        private packageMenusRepository: Repository<PackageMenu>,
    ) { }

    // Menu Items
    async findAllMenus(branchId?: string) {
        const where = branchId ? { branch_id: branchId, is_active: true } : { is_active: true };
        return this.menuItemsRepository.find({
            where,
            relations: ['category'],
            order: { sort_order: 'ASC' },
        });
    }

    async findOneMenu(id: string) {
        return this.menuItemsRepository.findOne({
            where: { id },
            relations: ['category', 'branch', 'package_menus', 'package_menus.package'],
        });
    }

    async createMenu(menuData: any) {
        const { package_id, ...menuFields } = menuData;

        // Create menu item
        const menu = this.menuItemsRepository.create(menuFields);
        const savedMenu: MenuItem = await this.menuItemsRepository.save(menu);

        // Create package-menu relationship if package_id provided
        if (package_id) {
            const packageMenu = this.packageMenusRepository.create({
                package_id,
                menu_item_id: savedMenu.id,
            });
            await this.packageMenusRepository.save(packageMenu);
        }

        return this.findOneMenu(savedMenu.id);
    }

    async updateMenu(id: string, menuData: any) {
        await this.menuItemsRepository.update(id, menuData);
        return this.findOneMenu(id);
    }

    async deleteMenu(id: string) {
        await this.menuItemsRepository.update(id, { is_active: false });
        return { message: 'Menu item deactivated successfully' };
    }

    async toggleAvailability(id: string) {
        const menu = await this.menuItemsRepository.findOne({ where: { id } });
        if (!menu) {
            throw new Error('Menu item not found');
        }
        menu.is_available = !menu.is_available;
        await this.menuItemsRepository.save(menu);
        return { message: `Menu item ${menu.is_available ? 'enabled' : 'disabled'}`, menu };
    }

    // Categories
    async findAllCategories(branchId?: string) {
        const where = branchId ? { branch_id: branchId, is_active: true } : { is_active: true };
        return this.categoriesRepository.find({
            where,
            order: { sort_order: 'ASC' },
        });
    }

    async findOneCategory(id: string) {
        return this.categoriesRepository.findOne({
            where: { id },
        });
    }

    async createCategory(categoryData: any) {
        const category = this.categoriesRepository.create(categoryData);
        return this.categoriesRepository.save(category);
    }

    async updateCategory(id: string, categoryData: any) {
        await this.categoriesRepository.update(id, categoryData);
        return this.findOneCategory(id);
    }

    async deleteCategory(id: string) {
        await this.categoriesRepository.update(id, { is_active: false });
        return { message: 'Category deactivated successfully' };
    }
}
