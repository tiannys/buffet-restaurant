import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class SettingsController {
    constructor(private settingsService: SettingsService) { }

    @Get()
    findAll() {
        return this.settingsService.findAll();
    }

    @Get(':key')
    findOne(@Param('key') key: string) {
        return this.settingsService.findOne(key);
    }

    @Post()
    upsert(@Body() data: { key: string; value: string; description?: string }) {
        return this.settingsService.upsert(data.key, data.value, data.description);
    }
}
