import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) { }

    async findAll() {
        return this.usersRepository.find({
            relations: ['role', 'branch'],
            select: ['id', 'username', 'full_name', 'email', 'phone', 'is_active', 'created_at'],
        });
    }

    async findOne(id: string) {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['role', 'branch'],
        });
    }

    async create(userData: any) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async update(id: string, userData: any) {
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        await this.usersRepository.update(id, userData);
        return this.findOne(id);
    }

    async delete(id: string) {
        await this.usersRepository.update(id, { is_active: false });
        return { message: 'User deactivated successfully' };
    }
}
