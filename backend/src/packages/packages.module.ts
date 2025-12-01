import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Package } from '../database/entities/package.entity';
import { PackageMenu } from '../database/entities/package-menu.entity';
import { MenuItem } from '../database/entities/menu-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Package, PackageMenu, MenuItem])],
    providers: [PackagesService],
    controllers: [PackagesController],
    exports: [PackagesService],
})
export class PackagesModule { }
