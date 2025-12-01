import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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

    // Public endpoint for customers (no auth)
    @Get('customer/:id')
    getSessionForCustomer(@Param('id') id: string) {
        return this.sessionsService.getSessionForCustomer(id);
    }
}
