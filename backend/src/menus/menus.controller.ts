import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
    createMenu(@Body() menuData: CreateMenuDto) {
        return this.menusService.createMenu(menuData);
    }

    @Put(':id')
    @Roles('Admin')
    updateMenu(@Param('id') id: string, @Body() menuData: UpdateMenuDto) {
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

    @Patch(':id/toggle-stock')
    @Roles('Admin', 'Staff', 'Kitchen')
    toggleStock(@Param('id') id: string, @Body() data: { is_out_of_stock: boolean }) {
        return this.menusService.toggleStock(id, data.is_out_of_stock);
    }

    @Get('low-stock')
    @Roles('Admin', 'Staff', 'Kitchen')
    getLowStockItems(@Query('branch_id') branchId?: string) {
        return this.menusService.getLowStockItems(branchId);
    }

    @Patch(':id/update-stock')
    @Roles('Admin', 'Staff', 'Kitchen')
    updateStock(@Param('id') id: string, @Body() data: { stock_quantity: number }) {
        return this.menusService.updateStock(id, data.stock_quantity);
    }



    // Image Upload
    @Post('upload-image')
    @Roles('Admin')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/menus',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `menu-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Only image files (jpg, jpeg, png) are allowed!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        return {
            filename: file.filename,
            path: `/uploads/menus/${file.filename}`,
            url: `${process.env.API_URL || 'http://localhost:3000'}/uploads/menus/${file.filename}`,
        };
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
    createCategory(@Body() categoryData: CreateCategoryDto) {
        return this.menusService.createCategory(categoryData);
    }

    @Put('categories/:id')
    @Roles('Admin')
    updateCategory(@Param('id') id: string, @Body() categoryData: UpdateCategoryDto) {
        return this.menusService.updateCategory(id, categoryData);
    }

    @Delete('categories/:id')
    @Roles('Admin')
    deleteCategory(@Param('id') id: string) {
        return this.menusService.deleteCategory(id);
    }
	
	@Get('low-stock')
    @Roles('Admin', 'Staff', 'Kitchen')
    getLowStockItems(@Query('branch_id') branchId?: string) {
        return this.menusService.getLowStockItems(branchId);
    }
    @Patch(':id/update-stock')
    @Roles('Admin', 'Staff', 'Kitchen')
    updateStock(@Param('id') id: string, @Body() data: { stock_quantity: number }) {
        return this.menusService.updateStock(id, data.stock_quantity);
    }
}
