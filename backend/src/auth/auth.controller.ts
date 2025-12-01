import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        return this.authService.login(body.username, body.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout() {
        return { message: 'Logged out successfully' };
    }
}
