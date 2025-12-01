import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Package } from '../database/entities/package.entity';
import { PackageMenu } from '../database/entities/package-menu.entity';
import { MenuItem } from '../database/entities/menu-item.entity';

@Injectable()
export class PackagesService {
    constructor(
        @InjectRepository(Package)
        private packagesRepository: Repository<Package>,
        @InjectRepository(PackageMenu)
        private packageMenusRepository: Repository<PackageMenu>,
        @InjectRepository(MenuItem)
        private menuItemsRepository: Repository<MenuItem>,
    ) { }

    async findAll(branchId?: string) {
        const where = branchId ? { branch_id: branchId, is_active: true } : { is_active: true };
        return this.packagesRepository.find({
            where,
            relations: ['parent_package', 'branch'],
            order: { sort_order: 'ASC' },
        });
    }

    async findOne(id: string) {
        return this.packagesRepository.findOne({
            where: { id },
            relations: ['parent_package', 'branch', 'package_menus', 'package_menus.menu_item'],
        });
    }

    async getPackageMenus(packageId: string) {
        // Get package with parent
        const pkg = await this.packagesRepository.findOne({
            where: { id: packageId },
            relations: ['parent_package'],
        });
    });

    if(!pkg) return[];

    // Get own menus
    const ownMenus = await this.packageMenusRepository.find({
        where: { package_id: packageId },
        select: ['menu_item_id'],
    });

    const menuIds = ownMenus.map(pm => pm.menu_item_id);

    // If has parent, get parent's menus recursively
    if(pkg.parent_package_id) {
        const parentMenuIds = await this.getInheritedMenuIds(pkg.parent_package_id);
        menuIds.push(...parentMenuIds);
    }

        // Return unique IDs
        return[...new Set(menuIds)];
    }

    async create(packageData: any) {
    const pkg = this.packagesRepository.create(packageData);
    return this.packagesRepository.save(pkg);
}

    async update(id: string, packageData: any) {
    await this.packagesRepository.update(id, packageData);
    return this.findOne(id);
}

    async delete (id: string) {
    await this.packagesRepository.update(id, { is_active: false });
    return { message: 'Package deactivated successfully' };
}

    async addMenuToPackage(packageId: string, menuItemId: string) {
    const packageMenu = this.packageMenusRepository.create({
        package_id: packageId,
        menu_item_id: menuItemId,
    });
    return this.packageMenusRepository.save(packageMenu);
}

    async removeMenuFromPackage(packageId: string, menuItemId: string) {
    await this.packageMenusRepository.delete({
        package_id: packageId,
        menu_item_id: menuItemId,
    });
    return { message: 'Menu removed from package successfully' };
}
}
