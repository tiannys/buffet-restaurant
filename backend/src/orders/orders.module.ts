import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { MenusModule } from '../menus/menus.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, CustomerSession, MenuItem]),
        MenusModule,
    ],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService],
})
export class OrdersModule { }
