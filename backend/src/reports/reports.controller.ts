import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('sales')
    getSalesSummary(
        @Query('date_from') dateFrom: string,
        @Query('date_to') dateTo: string,
    ) {
        return this.reportsService.getSalesSummary(new Date(dateFrom), new Date(dateTo));
    }

    @Get('waste')
    getWasteSummary(
        @Query('date_from') dateFrom: string,
        @Query('date_to') dateTo: string,
    ) {
        return this.reportsService.getWasteSummary(new Date(dateFrom), new Date(dateTo));
    }
}
