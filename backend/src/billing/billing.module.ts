import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Receipt } from '../database/entities/receipt.entity';
import { Payment } from '../database/entities/payment.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';
import { Setting } from '../database/entities/setting.entity';
import { Member } from '../database/entities/member.entity';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Receipt, Payment, CustomerSession, Setting, Member]),
        LoyaltyModule,
    ],
    providers: [BillingService],
    controllers: [BillingController],
    exports: [BillingService],
})
export class BillingModule { }
