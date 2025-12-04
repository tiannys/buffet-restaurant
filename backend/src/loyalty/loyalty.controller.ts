import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('loyalty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyController {
    constructor(private loyaltyService: LoyaltyService) { }

    @Get('members')
    @Roles('Cashier', 'Admin')
    findAllMembers() {
        return this.loyaltyService.findAllMembers();
    }

    @Get('members/phone/:phone')
    @Roles('Cashier', 'Admin')
    findMemberByPhone(@Param('phone') phone: string) {
        return this.loyaltyService.findMemberByPhone(phone);
    }

    @Post('members')
    @Roles('Cashier', 'Admin')
    createMember(@Body() memberData: any) {
        return this.loyaltyService.createMember(memberData);
    }

    @Put('members/:id')
    @Roles('Cashier', 'Admin')
    updateMember(@Param('id') id: string, @Body() memberData: any) {
        return this.loyaltyService.updateMember(id, memberData);
    }

    @Get('members/:id/points-history')
    @Roles('Cashier', 'Admin')
    getPointsHistory(@Param('id') id: string) {
        return this.loyaltyService.getPointsHistory(id);
    }
}
