import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(CustomerSession)
        private sessionsRepository: Repository<CustomerSession>,
    ) { }

    async createOrder(orderData: any) {
        // Check stock for all items
        for (const item of orderData.items) {
            const hasStock = await this.menusService.checkStockAvailability(
                item.menu_item_id,
                item.quantity
            );
        
            if (!hasStock) {
                throw new Error(`Menu item ${item.menu_item_id} is out of stock`);
            }
        }
    
        // Create order
        const order = await this.ordersRepository.save(orderData);
    
        // Decrement stock
        for (const item of orderData.items) {
            await this.menusService.decrementStock(item.menu_item_id, item.quantity);
        }
    
        return order;
    }

    async findOne(id: string) {
        return this.ordersRepository.findOne({
            where: { id },
            relations: ['session', 'session.table', 'items', 'items.menu_item', 'items.menu_item.category'],
        });
    }

    async findBySession(sessionId: string) {
        return this.ordersRepository.find({
            where: { session_id: sessionId },
            relations: ['items', 'items.menu_item', 'items.menu_item.category'],
            order: { created_at: 'DESC' },
        });
    }

    async findAllPending() {
        return this.ordersRepository.find({
            where: { status: OrderStatus.PENDING },
            relations: ['session', 'session.table', 'items', 'items.menu_item'],
            order: { created_at: 'ASC' },
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        await this.ordersRepository.update(id, { status });
        return this.findOne(id);
    }

    async markWaste(orderItemId: string, data: {
        waste_quantity: number;
        waste_reason: string;
    }) {
        const orderItem = await this.orderItemsRepository.findOne({
            where: { id: orderItemId },
            relations: ['menu_item'],
        });

        if (!orderItem) {
            throw new Error('Order item not found');
        }

        if (data.waste_quantity > orderItem.quantity) {
            throw new Error('Waste quantity cannot exceed ordered quantity');
        }

        orderItem.waste_quantity = data.waste_quantity;
        orderItem.waste_reason = data.waste_reason;

        await this.orderItemsRepository.save(orderItem);

        return {
            order_item_id: orderItem.id,
            menu_item_name: orderItem.menu_item.name,
            ordered_quantity: orderItem.quantity,
            waste_quantity: orderItem.waste_quantity,
            waste_percentage: (orderItem.waste_quantity / orderItem.quantity) * 100,
        };
    }
}
