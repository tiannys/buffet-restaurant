import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { CustomerSession, SessionStatus } from '../database/entities/customer-session.entity';
import { Table, TableStatus } from '../database/entities/table.entity';
import { Package } from '../database/entities/package.entity';
import { PackagesService } from '../packages/packages.service';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(CustomerSession)
        private sessionsRepository: Repository<CustomerSession>,
        @InjectRepository(Table)
        private tablesRepository: Repository<Table>,
        @InjectRepository(Package)
        private packagesRepository: Repository<Package>,
        private packagesService: PackagesService,
    ) { }

    async startSession(data: {
        table_id: string;
        package_id: string;
        adult_count: number;
        child_count: number;
        started_by_user_id: string;
    }) {
        // Get package to determine duration
        const pkg = await this.packagesRepository.findOne({
            where: { id: data.package_id },
        });

        if (!pkg) {
            throw new Error('Package not found');
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + pkg.duration_minutes * 60000);

        // Create session
        const session = this.sessionsRepository.create({
            ...data,
            start_time: startTime,
            end_time: endTime,
            status: SessionStatus.ACTIVE,
        });

        const savedSession = await this.sessionsRepository.save(session);

        // Generate QR code
        const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/customer/${savedSession.id}`;
        const qrCode = await QRCode.toDataURL(qrData);

        savedSession.qr_code = qrCode;
        await this.sessionsRepository.save(savedSession);

        // Update table status
        await this.tablesRepository.update(data.table_id, {
            status: TableStatus.OCCUPIED,
        });

        return this.findOne(savedSession.id);
    }

    async findOne(id: string) {
        return this.sessionsRepository.findOne({
            where: { id },
            relations: ['table', 'package', 'started_by', 'orders', 'orders.items', 'orders.items.menu_item'],
        });
    }

    async getSessionForCustomer(id: string) {
        const session = await this.findOne(id);

        if (!session || session.status !== SessionStatus.ACTIVE) {
            throw new Error('Session not found or inactive');
        }

        // Get available menus for this package
        const menus = await this.packagesService.getPackageMenus(session.package_id);

        // Calculate remaining time
        const now = new Date();
        const remainingMs = session.end_time.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

        return {
            session: {
                id: session.id,
                table_number: session.table.table_number,
                package_name: session.package.name,
                start_time: session.start_time,
                end_time: session.end_time,
                remaining_minutes: remainingMinutes,
            },
            menus,
            orders: session.orders,
        };
    }

    async findActiveSessions(branchId?: string) {
        const queryBuilder = this.sessionsRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.table', 'table')
            .leftJoinAndSelect('session.package', 'package')
            .leftJoinAndSelect('session.started_by', 'user')
            .where('session.status = :status', { status: SessionStatus.ACTIVE });

        if (branchId) {
            queryBuilder.andWhere('table.branch_id = :branchId', { branchId });
        }

        return queryBuilder.getMany();
    }

    async endSession(id: string) {
        const session = await this.sessionsRepository.findOne({
            where: { id },
            relations: ['table'],
        });

        if (!session) {
            throw new Error('Session not found');
        }

        session.status = SessionStatus.COMPLETED;
        await this.sessionsRepository.save(session);

        // Update table status
        await this.tablesRepository.update(session.table_id, {
            status: TableStatus.CLEANING,
        });

        return { message: 'Session ended successfully' };
    }
}
