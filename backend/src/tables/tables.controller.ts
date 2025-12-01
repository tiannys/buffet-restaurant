import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TableStatus } from '../database/entities/table.entity';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
    constructor(private tablesService: TablesService) { }

    @Get()
    @Roles('Admin', 'Staff')
    findAll(@Query('branch_id') branchId?: string) {
        return this.tablesService.findAll(branchId);
    }

    @Get('dashboard')
    @Roles('Admin', 'Staff')
    getDashboard(@Query('branch_id') branchId?: string) {
        return this.tablesService.getDashboard(branchId);
    }

    @Get(':id')
    @Roles('Admin', 'Staff')
    findOne(@Param('id') id: string) {
        return this.tablesService.findOne(id);
    }

    @Post()
    @Roles('Admin')
    create(@Body() tableData: any) {
        return this.tablesService.create(tableData);
    }

    @Put(':id')
    @Roles('Admin')
    update(@Param('id') id: string, @Body() tableData: any) {
        return this.tablesService.update(id, tableData);
    }

    @Delete(':id')
    @Roles('Admin')
    delete(@Param('id') id: string) {
        return this.tablesService.delete(id);
    }

    @Patch(':id/status')
    @Roles('Admin', 'Staff')
    updateStatus(@Param('id') id: string, @Body('status') status: TableStatus) {
        return this.tablesService.updateStatus(id, status);
    }
}
