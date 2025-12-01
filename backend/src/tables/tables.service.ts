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
}
