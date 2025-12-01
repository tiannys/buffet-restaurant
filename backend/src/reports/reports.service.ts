import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Receipt } from '../database/entities/receipt.entity';
import { OrderItem } from '../database/entities/order-item.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Receipt)
        private receiptsRepository: Repository<Receipt>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
    ) { }

    async getSalesSummary(dateFrom: Date, dateTo: Date) {
        const receipts = await this.receiptsRepository.find({
            where: {
                created_at: Between(dateFrom, dateTo),
            },
            relations: ['session', 'session.package'],
        });

        const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.grand_total), 0);
        const totalOrders = receipts.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            period: { from: dateFrom, to: dateTo },
            total_revenue: totalRevenue,
            total_orders: totalOrders,
            average_order_value: averageOrderValue,
            receipts,
        };
    }

    async getWasteSummary(dateFrom: Date, dateTo: Date) {
        const wasteItems = await this.orderItemsRepository
            .createQueryBuilder('oi')
            .leftJoinAndSelect('oi.menu_item', 'mi')
            .leftJoinAndSelect('oi.order', 'o')
            .where('oi.waste_quantity > 0')
            .andWhere('o.created_at BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
            .getMany();

        const totalWasteItems = wasteItems.reduce((sum, item) => sum + item.waste_quantity, 0);
        const totalWasteCost = wasteItems.reduce(
            (sum, item) => sum + item.waste_quantity * (Number(item.menu_item.cost) || 0),
            0,
        );

        return {
            period: { from: dateFrom, to: dateTo },
            total_waste_items: totalWasteItems,
            total_waste_cost: totalWasteCost,
            waste_items: wasteItems,
        };
    }
}
