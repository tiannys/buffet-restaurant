import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenusController {
    constructor(private menusService: MenusService) { }

    // Menu Items
    @Get()
    findAllMenus(@Query('branch_id') branchId?: string) {
        return this.menusService.findAllMenus(branchId);
    }

    @Get(':id')
    findOneMenu(@Param('id') id: string) {
        return this.menusService.findOneMenu(id);
    }

    @Post()
    @Roles('Admin')
    createMenu(@Body() menuData: any) {
        return this.menusService.createMenu(menuData);
    }

    @Put(':id')
    @Roles('Admin')
    updateMenu(@Param('id') id: string, @Body() menuData: any) {
        return this.menusService.updateMenu(id, menuData);
    }

    @Delete(':id')
    @Roles('Admin')
    deleteMenu(@Param('id') id: string) {
        return this.menusService.deleteMenu(id);
    }

    @Patch(':id/toggle-availability')
    @Roles('Admin', 'Staff')
    toggleAvailability(@Param('id') id: string) {
        return this.menusService.toggleAvailability(id);
    }

    // Categories
    @Get('categories/all')
    findAllCategories(@Query('branch_id') branchId?: string) {
        return this.menusService.findAllCategories(branchId);
    }

    @Get('categories/:id')
    @Roles('Admin')
    findOneCategory(@Param('id') id: string) {
        return this.menusService.findOneCategory(id);
    }

    @Post('categories')
    @Roles('Admin')
    createCategory(@Body() categoryData: any) {
        return this.menusService.createCategory(categoryData);
    }

    @Put('categories/:id')
    @Roles('Admin')
    updateCategory(@Param('id') id: string, @Body() categoryData: any) {
        return this.menusService.updateCategory(id, categoryData);
    }

    @Delete('categories/:id')
    @Roles('Admin')
    deleteCategory(@Param('id') id: string) {
        return this.menusService.deleteCategory(id);
    }
}
