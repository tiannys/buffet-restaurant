import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem, CustomerSession])],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService],
})
export class OrdersModule { }
