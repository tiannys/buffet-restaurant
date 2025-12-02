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
            relations: ['category', 'package_menus', 'package_menus.package'],
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

        // Insert menu item and get the ID
        const result = await this.menuItemsRepository.insert(menuFields);
        const menuId = result.identifiers[0].id;

        // Create package-menu relationship if package_id provided
        if (package_id && menuId) {
            await this.packageMenusRepository.insert({
                package_id,
                menu_item_id: menuId,
            });
        }

        return this.findOneMenu(menuId);
    }

    async updateMenu(id: string, menuData: any) {
        const { package_id, ...menuFields } = menuData;

        // Update menu item fields
        await this.menuItemsRepository.update(id, menuFields);

        // Update package-menu relationship if package_id provided
        if (package_id !== undefined) {
            // Delete existing package-menu relationships
            await this.packageMenusRepository.delete({ menu_item_id: id });

            // Create new relationship if package_id is not empty
            if (package_id) {
                await this.packageMenusRepository.insert({
                    package_id,
                    menu_item_id: id,
                });
            }
        }

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

    async toggleStock(id: string, isOutOfStock: boolean) {
        const menu = await this.menuItemsRepository.findOne({ where: { id } });
        if (!menu) {
            throw new Error('Menu item not found');
        }
        menu.is_out_of_stock = isOutOfStock;
        await this.menuItemsRepository.save(menu);
        return {
            message: `Menu item marked as ${isOutOfStock ? 'out of stock' : 'in stock'}`,
            menu
        };
    }

    async checkStockAvailability(menuItemId: string, quantity: number = 1): Promise<boolean> {
        const item = await this.menuItemsRepository.findOne({ where: { id: menuItemId } });
    
        if (!item) return false;
        if (item.is_out_of_stock) return false;
        if (item.stock_quantity === null) return true; // Unlimited
    
        return item.stock_quantity >= quantity;
    }

    async decrementStock(menuItemId: string, quantity: number = 1): Promise<void> {
        const item = await this.menuItemsRepository.findOne({ where: { id: menuItemId } });
    
        if (!item || item.stock_quantity === null) return;
    
        const newQuantity = item.stock_quantity - quantity;
    
        await this.menuItemsRepository.update(menuItemId, {
            stock_quantity: Math.max(0, newQuantity),
            is_out_of_stock: newQuantity <= 0,
        });
    }

    async incrementStock(menuItemId: string, quantity: number = 1): Promise<void> {
        const item = await this.menuItemsRepository.findOne({ where: { id: menuItemId } });

        if (!item || item.stock_quantity === null) return; // Skip if unlimited

        const newQuantity = item.stock_quantity + quantity;

        await this.menuItemsRepository.update(menuItemId, {
            stock_quantity: newQuantity,
            is_out_of_stock: false,
        });
    }


    async getLowStockItems(branchId?: string): Promise<MenuItem[]> {
        const queryBuilder = this.menuItemsRepository
            .createQueryBuilder('item')
            .where('item.stock_quantity IS NOT NULL')
            .andWhere('item.stock_quantity <= item.low_stock_threshold')
            .andWhere('item.is_active = true');
    
        if (branchId) {
            queryBuilder.andWhere('item.branch_id = :branchId', { branchId });
        }
    
        return queryBuilder.getMany();
    }

    async updateStock(id: string, stockQuantity: number) {
        await this.menuItemsRepository.update(id, {
            stock_quantity: stockQuantity,
            is_out_of_stock: stockQuantity <= 0,
        });
        return this.findOneMenu(id);
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
