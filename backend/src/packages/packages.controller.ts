import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
    constructor(private packagesService: PackagesService) { }

    @Get()
    findAll(@Query('branch_id') branchId?: string) {
        return this.packagesService.findAll(branchId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.packagesService.findOne(id);
    }

    @Get(':id/menus')
    getPackageMenus(@Param('id') id: string) {
        return this.packagesService.getPackageMenus(id);
    }

    @Post()
    @Roles('Admin')
    create(@Body() packageData: any) {
        return this.packagesService.create(packageData);
    }

    @Put(':id')
    @Roles('Admin')
    update(@Param('id') id: string, @Body() packageData: any) {
        return this.packagesService.update(id, packageData);
    }

    @Delete(':id')
    @Roles('Admin')
    delete(@Param('id') id: string) {
        return this.packagesService.delete(id);
    }

    @Post(':id/menus/:menuId')
    @Roles('Admin')
    addMenu(@Param('id') id: string, @Param('menuId') menuId: string) {
        return this.packagesService.addMenuToPackage(id, menuId);
    }

    @Delete(':id/menus/:menuId')
    @Roles('Admin')
    removeMenu(@Param('id') id: string, @Param('menuId') menuId: string) {
        return this.packagesService.removeMenuFromPackage(id, menuId);
    }
}
