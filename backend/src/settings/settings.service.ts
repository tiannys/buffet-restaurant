import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../database/entities/setting.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Setting)
        private settingsRepository: Repository<Setting>,
    ) { }

    async findAll() {
        return this.settingsRepository.find();
    }

    async findOne(key: string) {
        return this.settingsRepository.findOne({ where: { key } });
    }

    async upsert(key: string, value: string, description?: string) {
        const existing = await this.findOne(key);

        if (existing) {
            existing.value = value;
            if (description) existing.description = description;
            return this.settingsRepository.save(existing);
        } else {
            const setting = this.settingsRepository.create({ key, value, description });
            return this.settingsRepository.save(setting);
        }
    }
}
