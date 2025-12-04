import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../database/entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Settings)
        private settingsRepository: Repository<Settings>,
    ) { }

    async get(): Promise<Settings> {
        const settings = await this.settingsRepository.findOne({ where: {} });

        if (!settings) {
            // Create default settings if none exist
            const defaultSettings = this.settingsRepository.create({
                restaurant_name: 'ร้านบุฟเฟ่ต์',
                vat_percent: 7.00,
                service_charge_percent: 10.00,
            });
            return this.settingsRepository.save(defaultSettings);
        }

        return settings;
    }

    async update(updateData: Partial<Settings>): Promise<Settings> {
        const settings = await this.get();

        // Update fields
        if (updateData.restaurant_name !== undefined) {
            settings.restaurant_name = updateData.restaurant_name;
        }
        if (updateData.logo_url !== undefined) {
            settings.logo_url = updateData.logo_url;
        }
        if (updateData.vat_percent !== undefined) {
            settings.vat_percent = updateData.vat_percent;
        }
        if (updateData.service_charge_percent !== undefined) {
            settings.service_charge_percent = updateData.service_charge_percent;
        }
        if (updateData.promptpay_id !== undefined) {
            settings.promptpay_id = updateData.promptpay_id;
        }
        if (updateData.promptpay_type !== undefined) {
            settings.promptpay_type = updateData.promptpay_type;
        }

        return this.settingsRepository.save(settings);
    }

    async getPromptPayQrUrl(amount: number): Promise<string | null> {
        const settings = await this.get();

        if (!settings.promptpay_id) {
            return null;
        }

        // Generate PromptPay QR URL
        return `https://promptpay.io/${settings.promptpay_id}/${amount.toFixed(2)}.png`;
    }
}
