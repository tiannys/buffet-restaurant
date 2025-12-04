import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Receipt } from '../database/entities/receipt.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Order } from '../database/entities/order.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Receipt)
        private receiptsRepository: Repository<Receipt>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
    ) { }

    // Existing methods
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

    // NEW: Daily Sales Report
    async getDailySales(startDate: Date, endDate: Date) {
        const receipts = await this.receiptsRepository
            .createQueryBuilder('receipt')
            .leftJoinAndSelect('receipt.session', 'session')
            .leftJoinAndSelect('session.package', 'package')
            .where('receipt.created_at >= :startDate', { startDate })
            .andWhere('receipt.created_at <= :endDate', { endDate })
            .orderBy('receipt.created_at', 'ASC')
            .getMany();

        // Group by date
        const dailyData = new Map<string, any>();

        receipts.forEach(receipt => {
            const date = receipt.created_at.toISOString().split('T')[0];

            if (!dailyData.has(date)) {
                dailyData.set(date, {
                    date,
                    revenue: 0,
                    sessions: 0,
                    customers: 0,
                });
            }

            const day = dailyData.get(date);
            day.revenue += Number(receipt.grand_total);
            day.sessions += 1;
            day.customers += receipt.session.adult_count + receipt.session.child_count;
        });

        return Array.from(dailyData.values());
    }

    // NEW: Revenue by Package
    async getRevenueByPackage(startDate: Date, endDate: Date) {
        const result = await this.receiptsRepository
            .createQueryBuilder('receipt')
            .leftJoinAndSelect('receipt.session', 'session')
            .leftJoinAndSelect('session.package', 'package')
            .where('receipt.created_at >= :startDate', { startDate })
            .andWhere('receipt.created_at <= :endDate', { endDate })
            .select('package.name', 'package_name')
            .addSelect('SUM(receipt.grand_total)', 'revenue')
            .addSelect('COUNT(receipt.id)', 'session_count')
            .groupBy('package.id, package.name')
            .orderBy('revenue', 'DESC')
            .getRawMany();

        const totalRevenue = result.reduce((sum, r) => sum + Number(r.revenue), 0);

        return result.map(r => ({
            package_name: r.package_name,
            revenue: Number(r.revenue),
            session_count: Number(r.session_count),
            percentage: totalRevenue > 0 ? (Number(r.revenue) / totalRevenue) * 100 : 0,
        }));
    }

    // NEW: Payment Method Distribution
    async getPaymentMethodDistribution(startDate: Date, endDate: Date) {
        const payments = await this.receiptsRepository.query(`
            SELECT 
                p.payment_method as method,
                SUM(p.amount) as amount,
                COUNT(p.id) as count
            FROM payments p
            INNER JOIN receipts r ON p.receipt_id = r.id
            WHERE r.created_at >= $1 AND r.created_at <= $2
            GROUP BY p.payment_method
            ORDER BY amount DESC
        `, [startDate, endDate]);

        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return payments.map(p => ({
            method: p.method,
            amount: Number(p.amount),
            count: Number(p.count),
            percentage: totalAmount > 0 ? (Number(p.amount) / totalAmount) * 100 : 0,
        }));
    }

    // NEW: Top Selling Items
    async getTopSellingItems(startDate: Date, endDate: Date, limit = 10) {
        const result = await this.orderItemsRepository
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.menu_item', 'menu')
            .leftJoinAndSelect('menu.category', 'category')
            .leftJoinAndSelect('item.order', 'order')
            .where('order.created_at >= :startDate', { startDate })
            .andWhere('order.created_at <= :endDate', { endDate })
            .select('menu.id', 'menu_id')
            .addSelect('menu.name', 'menu_name')
            .addSelect('category.name', 'category_name')
            .addSelect('COUNT(DISTINCT order.id)', 'order_count')
            .addSelect('SUM(item.quantity)', 'total_quantity')
            .groupBy('menu.id, menu.name, category.name')
            .orderBy('total_quantity', 'DESC')
            .limit(limit)
            .getRawMany();

        return result.map((r, index) => ({
            rank: index + 1,
            menu_item: {
                id: r.menu_id,
                name: r.menu_name,
                category: r.category_name,
            },
            order_count: Number(r.order_count),
            total_quantity: Number(r.total_quantity),
        }));
    }

    // NEW: Menu Statistics
    async getMenuStatistics(startDate: Date, endDate: Date) {
        const byCategory = await this.orderItemsRepository.query(`
            SELECT 
                mc.name as category_name,
                COUNT(DISTINCT o.id) as order_count,
                SUM(oi.quantity) as total_quantity
            FROM order_items oi
            INNER JOIN menu_items mi ON oi.menu_item_id = mi.id
            INNER JOIN menu_categories mc ON mi.category_id = mc.id
            INNER JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= $1 AND o.created_at <= $2
            GROUP BY mc.id, mc.name
            ORDER BY total_quantity DESC
        `, [startDate, endDate]);

        const total = byCategory.reduce((sum, c) => sum + Number(c.total_quantity), 0);

        return {
            by_category: byCategory.map(c => ({
                category_name: c.category_name,
                order_count: Number(c.order_count),
                total_quantity: Number(c.total_quantity),
                percentage: total > 0 ? (Number(c.total_quantity) / total) * 100 : 0,
            })),
        };
    }

    // NEW: Dashboard Summary
    async getDashboardSummary(startDate: Date, endDate: Date) {
        const receipts = await this.receiptsRepository
            .createQueryBuilder('receipt')
            .leftJoinAndSelect('receipt.session', 'session')
            .where('receipt.created_at >= :startDate', { startDate })
            .andWhere('receipt.created_at <= :endDate', { endDate })
            .getMany();

        const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.grand_total), 0);
        const totalSessions = receipts.length;
        const totalCustomers = receipts.reduce(
            (sum, r) => sum + (r.session?.adult_count || 0) + (r.session?.child_count || 0),
            0
        );
        const averageBill = totalSessions > 0 ? totalRevenue / totalSessions : 0;

        return {
            total_revenue: totalRevenue,
            total_sessions: totalSessions,
            total_customers: totalCustomers,
            average_bill: averageBill,
        };
    }
}
