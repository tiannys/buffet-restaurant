import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
    constructor(private settingsService: SettingsService) { }

    @Get()
    get() {
        return this.settingsService.get();
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    update(@Body() updateData: any) {
        return this.settingsService.update(updateData);
    }
}
