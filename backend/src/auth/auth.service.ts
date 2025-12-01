import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersRepository.findOne({
            where: { username, is_active: true },
            relations: ['role', 'branch'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);

        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role.name,
            branch_id: user.branch_id,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role.name,
                branch_id: user.branch_id,
            },
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role', 'branch'],
            select: ['id', 'username', 'full_name', 'email', 'phone', 'is_active'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
