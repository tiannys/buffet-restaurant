import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../database/entities/menu-item.entity';
import { MenuCategory } from '../database/entities/menu-category.entity';

@Injectable()
export class MenusService {
    constructor(
        @InjectRepository(MenuItem)
        private menuItemsRepository: Repository<MenuItem>,
        @InjectRepository(MenuCategory)
        private categoriesRepository: Repository<MenuCategory>,
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
            relations: ['category', 'branch'],
        });
    }

    async createMenu(menuData: any) {
        const menu = this.menuItemsRepository.create(menuData);
        return this.menuItemsRepository.save(menu);
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
