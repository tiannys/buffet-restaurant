import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sessions')
export class SessionsController {
    constructor(private sessionsService: SessionsService) { }

    @Post('start')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    startSession(@Body() data: any, @Request() req) {
        return this.sessionsService.startSession({
            ...data,
            started_by_user_id: req.user.userId,
        });
    }

    @Get('active')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin', 'Cashier')
    findActiveSessions(@Request() req) {
        return this.sessionsService.findActiveSessions(req.user.branch_id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin', 'Cashier')
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }

    @Post(':id/end')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Cashier', 'Admin')
    endSession(@Param('id') id: string) {
        return this.sessionsService.endSession(id);
    }

    @Post(':id/pause')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    pauseSession(@Param('id') id: string) {
        return this.sessionsService.pauseSession(id);
    }

    @Post(':id/resume')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    resumeSession(@Param('id') id: string) {
        return this.sessionsService.resumeSession(id);
    }

    @Patch(':id/package')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    updatePackage(@Param('id') id: string, @Body('package_id') packageId: string) {
        return this.sessionsService.updatePackage(id, packageId);
    }

    @Patch(':id/guests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    updateGuestCount(
        @Param('id') id: string,
        @Body('adult_count') adultCount: number,
        @Body('child_count') childCount: number,
    ) {
        return this.sessionsService.updateGuestCount(id, adultCount, childCount);
    }

    @Patch(':id/transfer')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    transferTable(@Param('id') id: string, @Body('new_table_id') newTableId: string) {
        return this.sessionsService.transferTable(id, newTableId);
    }

    @Get(':id/time-remaining')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin', 'Cashier')
    getTimeRemaining(@Param('id') id: string) {
        return this.sessionsService.getTimeRemaining(id);
    }

    @Get(':id/qr-code')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Staff', 'Admin')
    getQRCode(@Param('id') id: string) {
        return this.sessionsService.getQRCode(id);
    }

    // Public endpoint for customers (no auth)
    @Get('customer/:id')
    getSessionForCustomer(@Param('id') id: string) {
        return this.sessionsService.getSessionForCustomer(id);
    }
}
