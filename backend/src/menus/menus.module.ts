import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { MenuItem } from '../database/entities/menu-item.entity';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { PackageMenu } from '../database/entities/package-menu.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MenuItem, MenuCategory, PackageMenu])],
    providers: [MenusService],
    controllers: [MenusController],
    exports: [MenusService],
})
export class MenusModule { }
