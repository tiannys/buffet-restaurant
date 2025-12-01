import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Receipt } from '../database/entities/receipt.entity';
import { OrderItem } from '../database/entities/order-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Receipt, OrderItem])],
    providers: [ReportsService],
    controllers: [ReportsController],
})
export class ReportsModule { }
