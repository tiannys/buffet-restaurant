import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
    constructor(private billingService: BillingService) { }

    @Get('calculate/:sessionId')
    @Roles('Cashier', 'Admin')
    calculateBill(@Param('sessionId') sessionId: string) {
        return this.billingService.calculateBill(sessionId);
    }

    @Post('receipts')
    @Roles('Cashier', 'Admin')
    createReceipt(@Body() data: any, @Request() req) {
        return this.billingService.createReceipt({
            ...data,
            cashier_id: req.user.userId,
        });
    }

    @Get('receipts')
    @Roles('Cashier', 'Admin')
    findAllReceipts() {
        return this.billingService.findAll();
    }

    @Get('receipts/:id')
    @Roles('Cashier', 'Admin')
    findOneReceipt(@Param('id') id: string) {
        return this.billingService.findOne(id);
    }
}
