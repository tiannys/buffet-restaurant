import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Receipt } from '../database/entities/receipt.entity';
import { Payment } from '../database/entities/payment.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';
import { Member } from '../database/entities/member.entity';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Receipt, Payment, CustomerSession, Member]),
        LoyaltyModule,
        SettingsModule,
    ],
    providers: [BillingService],
    controllers: [BillingController],
    exports: [BillingService],
})
export class BillingModule { }
