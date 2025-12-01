import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from '../database/entities/order.entity';

@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    // Public endpoint for customers
    @Post('customer')
    createOrder(@Body() data: any) {
        return this.ordersService.createOrder(data);
    }

    @Get('pending')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Kitchen', 'Admin')
    findAllPending() {
        return this.ordersService.findAllPending();
    }

    @Get('session/:sessionId')
    findBySession(@Param('sessionId') sessionId: string) {
        return this.ordersService.findBySession(sessionId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Kitchen', 'Admin')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Kitchen', 'Admin')
    updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
        return this.ordersService.updateStatus(id, status);
    }

    @Post('items/:itemId/mark-waste')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Kitchen', 'Admin')
    markWaste(@Param('itemId') itemId: string, @Body() data: any) {
        return this.ordersService.markWaste(itemId, data);
    }
}
