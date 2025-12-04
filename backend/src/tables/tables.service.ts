import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table, TableStatus } from '../database/entities/table.entity';

@Injectable()
export class TablesService {
    constructor(
        @InjectRepository(Table)
        private tablesRepository: Repository<Table>,
    ) { }

    async findAll(branchId?: string) {
        const where = branchId ? { branch_id: branchId, is_active: true } : { is_active: true };
        return this.tablesRepository.find({
            where,
            relations: ['branch'],
            order: { table_number: 'ASC' },
        });
    }

    async findOne(id: string) {
        return this.tablesRepository.findOne({
            where: { id },
            relations: ['branch'],
        });
    }

    async create(tableData: any) {
        const table = this.tablesRepository.create(tableData);
        return this.tablesRepository.save(table);
    }

    async update(id: string, tableData: any) {
        await this.tablesRepository.update(id, tableData);
        return this.findOne(id);
    }

    async delete(id: string) {
        await this.tablesRepository.update(id, { is_active: false });
        return { message: 'Table deactivated successfully' };
    }

    async updateStatus(id: string, status: TableStatus) {
        await this.tablesRepository.update(id, { status });
        return this.findOne(id);
    }

    async getDashboard(branchId?: string) {
        const tables = await this.findAll(branchId);

        const summary = {
            total: tables.length,
            available: tables.filter(t => t.status === TableStatus.AVAILABLE).length,
            occupied: tables.filter(t => t.status === TableStatus.OCCUPIED).length,
            reserved: tables.filter(t => t.status === TableStatus.RESERVED).length,
            cleaning: tables.filter(t => t.status === TableStatus.CLEANING).length,
        };

        return { summary, tables };
    }

    async toggleOutOfService(id: string, notes?: string) {
        const table = await this.findOne(id);
        if (!table) {
            throw new Error('Table not found');
        }

        const newOutOfServiceStatus = !table.is_out_of_service;

        await this.tablesRepository.update(id, {
            is_out_of_service: newOutOfServiceStatus,
            service_notes: newOutOfServiceStatus ? notes : null, // Clear notes when back in service
        });

        return this.findOne(id);
    }

    async getDashboardWithSessions(branchId?: string) {
        const queryBuilder = this.tablesRepository
            .createQueryBuilder('table')
            .leftJoinAndSelect('table.branch', 'branch')
            .leftJoinAndSelect(
                'customer_sessions',
                'session',
                'session.table_id = table.id AND session.status = :status',
                { status: 'active' }
            )
            .leftJoinAndSelect('session.package', 'package')
            .leftJoinAndSelect('session.started_by', 'user')
            .where('table.is_active = :isActive', { isActive: true });

        if (branchId) {
            queryBuilder.andWhere('table.branch_id = :branchId', { branchId });
        }

        queryBuilder.orderBy('table.table_number', 'ASC');

        const tables = await queryBuilder.getRawAndEntities();

        // Process results to include session data
        const tablesWithSessions = tables.entities.map((table, index) => {
            const raw = tables.raw[index];
            return {
                ...table,
                current_session: raw.session_id ? {
                    id: raw.session_id,
                    package_name: raw.package_name,
                    adult_count: raw.session_adult_count,
                    child_count: raw.session_child_count,
                    start_time: raw.session_start_time,
                    end_time: raw.session_end_time,
                    paused_at: raw.session_paused_at,
                } : null,
            };
        });

        const summary = {
            total: tablesWithSessions.length,
            available: tablesWithSessions.filter(t => t.status === TableStatus.AVAILABLE && !t.is_out_of_service).length,
            occupied: tablesWithSessions.filter(t => t.status === TableStatus.OCCUPIED).length,
            reserved: tablesWithSessions.filter(t => t.status === TableStatus.RESERVED).length,
            cleaning: tablesWithSessions.filter(t => t.status === TableStatus.CLEANING).length,
            out_of_service: tablesWithSessions.filter(t => t.is_out_of_service).length,
        };

        return { summary, tables: tablesWithSessions };
    }

    async getTablesByType(branchId: string, tableType: string) {
        return this.tablesRepository.find({
            where: {
                branch_id: branchId,
                table_type: tableType as any,
                is_active: true,
            },
            relations: ['branch'],
            order: { table_number: 'ASC' },
        });
    }

    async getTablesByZone(branchId: string, zone: string) {
        return this.tablesRepository.find({
            where: {
                branch_id: branchId,
                zone,
                is_active: true,
            },
            relations: ['branch'],
            order: { table_number: 'ASC' },
        });
    }
}
