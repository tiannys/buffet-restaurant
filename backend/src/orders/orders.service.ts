import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { CustomerSession } from '../database/entities/customer-session.entity';
import { MenuItem } from '../database/entities/menu-item.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(CustomerSession)
        private sessionsRepository: Repository<CustomerSession>,
        @InjectRepository(MenuItem)
        private menuItemsRepository: Repository<MenuItem>,
    ) { }

    async createOrder(orderData: any) {
        // Validate stock availability and deduct stock for tracked items
        if (orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                const menuItem = await this.menuItemsRepository.findOne({
                    where: { id: item.menu_item_id }
                });

                if (!menuItem) {
                    throw new Error(`Menu item ${item.menu_item_id} not found`);
                }

                // Check if item is out of stock
                if (menuItem.is_out_of_stock) {
                    throw new Error(`${menuItem.name} is currently out of stock`);
                }

                // If stock is tracked (not null), validate and deduct
                if (menuItem.stock_quantity !== null) {
                    if (menuItem.stock_quantity < item.quantity) {
                        throw new Error(`Insufficient stock for ${menuItem.name}. Available: ${menuItem.stock_quantity}, Requested: ${item.quantity}`);
                    }

                    // Deduct stock
                    const newStock = menuItem.stock_quantity - item.quantity;
                    await this.menuItemsRepository.update(menuItem.id, {
                        stock_quantity: newStock,
                        is_out_of_stock: newStock <= 0,
                    });
                }
            }
        }

        // Create order
        const order = await this.ordersRepository.save(orderData);
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
