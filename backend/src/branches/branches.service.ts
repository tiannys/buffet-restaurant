import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../database/entities/branch.entity';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private branchesRepository: Repository<Branch>,
    ) { }

    async findAll(): Promise<Branch[]> {
        return this.branchesRepository.find({
            order: { name: 'ASC' },
        });
    }
}
