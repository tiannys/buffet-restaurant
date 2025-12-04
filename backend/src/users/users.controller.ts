import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles('Admin')
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles('Admin')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles('Admin')
    create(@Body() userData: any) {
        return this.usersService.create(userData);
    }

    @Put(':id')
    @Roles('Admin')
    update(@Param('id') id: string, @Body() userData: any) {
        return this.usersService.update(id, userData);
    }

    @Delete(':id')
    @Roles('Admin')
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}
