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

    // Existing endpoints
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

    // NEW Endpoints
    @Get('daily-sales')
    getDailySales(
        @Query('start_date') startDate: string,
        @Query('end_date') endDate: string,
    ) {
        return this.reportsService.getDailySales(new Date(startDate), new Date(endDate));
    }

    @Get('revenue-by-package')
    getRevenueByPackage(
        @Query('start_date') startDate: string,
        @Query('end_date') endDate: string,
    ) {
        return this.reportsService.getRevenueByPackage(new Date(startDate), new Date(endDate));
    }

    @Get('payment-methods')
    getPaymentMethodDistribution(
        @Query('start_date') startDate: string,
        @Query('end_date') endDate: string,
    ) {
        return this.reportsService.getPaymentMethodDistribution(new Date(startDate), new Date(endDate));
    }

    @Get('top-items')
    getTopSellingItems(
        @Query('start_date') startDate: string,
        @Query('end_date') endDate: string,
        @Query('limit') limit?: string,
    ) {
        const itemLimit = limit ? parseInt(limit) : 10;
        return this.reportsService.getTopSellingItems(
            new Date(startDate),
            new Date(endDate),
            itemLimit
        );
    }

    @Get('menu-stats')
    getMenuStatistics(
        @Query('start_date') startDate: string,
        @Query('end_date') endDate: string,
    ) {
        return this.reportsService.getMenuStatistics(new Date(startDate), new Date(endDate));
    }

    @Get('dashboard-summary')
    getDashboardSummary(
        @Query('start_date') startDate: string,
        @Query('end_date') endDate: string,
    ) {
        return this.reportsService.getDashboardSummary(new Date(startDate), new Date(endDate));
    }
}
