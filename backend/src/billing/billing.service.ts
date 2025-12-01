import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from '../database/entities/receipt.entity';
import { Payment, PaymentMethod } from '../database/entities/payment.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';
import { Setting } from '../database/entities/setting.entity';
import { Member } from '../database/entities/member.entity';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Receipt)
        private receiptsRepository: Repository<Receipt>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        @InjectRepository(CustomerSession)
        private sessionsRepository: Repository<CustomerSession>,
        @InjectRepository(Setting)
        private settingsRepository: Repository<Setting>,
        @InjectRepository(Member)
        private membersRepository: Repository<Member>,
        private loyaltyService: LoyaltyService,
    ) { }

    async calculateBill(sessionId: string) {
        const session = await this.sessionsRepository.findOne({
            where: { id: sessionId },
            relations: ['package'],
        });

        if (!session) {
            throw new Error('Session not found');
        }

        // Get system settings
        const vatPercent = await this.getSetting('vat_percent', 7);
        const serviceChargePercent = await this.getSetting('service_charge_percent', 10);

        // Calculate subtotal
        const subtotal =
            session.adult_count * Number(session.package.adult_price) +
            session.child_count * Number(session.package.child_price);

        // Calculate service charge
        const serviceCharge = (subtotal * serviceChargePercent) / 100;

        // Calculate VAT on subtotal + service charge
        const subtotalWithService = subtotal + serviceCharge;
        const vat = (subtotalWithService * vatPercent) / 100;

        // Grand total
        const grandTotal = subtotalWithService + vat;

        return {
            session_id: sessionId,
            package_name: session.package.name,
            adult_count: session.adult_count,
            child_count: session.child_count,
            adult_price: session.package.adult_price,
            child_price: session.package.child_price,
            subtotal,
            service_charge: serviceCharge,
            service_charge_percent: serviceChargePercent,
            vat,
            vat_percent: vatPercent,
            grand_total: grandTotal,
        };
    }

    async createReceipt(data: {
        session_id: string;
        cashier_id: string;
        member_id?: string;
        discount_amount?: number;
        discount_reason?: string;
        points_used?: number;
        payments: Array<{ payment_method: PaymentMethod; amount: number; reference_number?: string }>;
    }) {
        const billCalculation = await this.calculateBill(data.session_id);

        let pointsValue = 0;
        let pointsEarned = 0;

        // Handle points redemption
        if (data.member_id && data.points_used && data.points_used > 0) {
            const pointsPerBaht = await this.getSetting('baht_per_point', 1);
            pointsValue = data.points_used * pointsPerBaht;

            await this.loyaltyService.redeemPoints(data.member_id, data.points_used);
        }

        // Calculate final total
        const grandTotal =
            billCalculation.grand_total - (data.discount_amount || 0) - pointsValue;

        // Generate receipt number
        const receiptNumber = await this.generateReceiptNumber();

        // Create receipt
        const receipt = this.receiptsRepository.create({
            receipt_number: receiptNumber,
            session_id: data.session_id,
            member_id: data.member_id,
            subtotal: billCalculation.subtotal,
            service_charge: billCalculation.service_charge,
            vat: billCalculation.vat,
            discount_amount: data.discount_amount || 0,
            discount_reason: data.discount_reason,
            points_used: data.points_used || 0,
            points_value: pointsValue,
            grand_total: grandTotal,
            cashier_id: data.cashier_id,
        });

        const savedReceipt = await this.receiptsRepository.save(receipt);

        // Create payment records
        const payments = data.payments.map(p =>
            this.paymentsRepository.create({
                receipt_id: savedReceipt.id,
                payment_method: p.payment_method,
                amount: p.amount,
                reference_number: p.reference_number,
            }),
        );

        await this.paymentsRepository.save(payments);

        // Calculate and award points
        if (data.member_id) {
            const pointsPerBaht = await this.getSetting('points_per_baht', 0.01);
            pointsEarned = Math.floor(grandTotal * pointsPerBaht);

            if (pointsEarned > 0) {
                await this.loyaltyService.earnPoints(data.member_id, pointsEarned, savedReceipt.id);
            }

            savedReceipt.points_earned = pointsEarned;
            await this.receiptsRepository.save(savedReceipt);
        }

        return this.findOne(savedReceipt.id);
    }

    async findOne(id: string) {
        return this.receiptsRepository.findOne({
            where: { id },
            relations: ['session', 'session.table', 'session.package', 'member', 'cashier', 'payments'],
        });
    }

    async findAll() {
        return this.receiptsRepository.find({
            relations: ['session', 'session.table', 'member', 'cashier'],
            order: { created_at: 'DESC' },
        });
    }

    private async getSetting(key: string, defaultValue: number): Promise<number> {
        const setting = await this.settingsRepository.findOne({ where: { key } });
        return setting ? parseFloat(setting.value) : defaultValue;
    }

    private async generateReceiptNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const count = await this.receiptsRepository.count();
        const sequence = String(count + 1).padStart(6, '0');

        return `RCP${year}${month}${day}${sequence}`;
    }
}
