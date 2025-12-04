import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { CustomerSession, SessionStatus } from '../database/entities/customer-session.entity';
import { Table, TableStatus } from '../database/entities/table.entity';
import { Package } from '../database/entities/package.entity';
import { PackagesService } from '../packages/packages.service';
import { BillingService } from '../billing/billing.service';
import { PaymentMethod } from '../database/entities/payment.entity';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(CustomerSession)
        private sessionsRepository: Repository<CustomerSession>,
        @InjectRepository(Table)
        private tablesRepository: Repository<Table>,
        @InjectRepository(Package)
        private packagesRepository: Repository<Package>,
        private packagesService: PackagesService,
        private billingService: BillingService,
    ) { }

    async startSession(data: {
        table_id: string;
        package_id: string;
        adult_count: number;
        child_count: number;
        started_by_user_id: string;
    }) {
        // Get package to determine duration
        const pkg = await this.packagesRepository.findOne({
            where: { id: data.package_id },
        });

        if (!pkg) {
            throw new Error('Package not found');
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + pkg.duration_minutes * 60000);

        // Create session
        const session = this.sessionsRepository.create({
            ...data,
            start_time: startTime,
            end_time: endTime,
            status: SessionStatus.ACTIVE,
        });

        const savedSession = await this.sessionsRepository.save(session);

        // Generate QR code
        const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/customer/${savedSession.id}`;
        const qrCode = await QRCode.toDataURL(qrData);

        savedSession.qr_code = qrCode;
        await this.sessionsRepository.save(savedSession);

        // Update table status
        await this.tablesRepository.update(data.table_id, {
            status: TableStatus.OCCUPIED,
        });

        return this.findOne(savedSession.id);
    }

    async findOne(id: string) {
        return this.sessionsRepository.findOne({
            where: { id },
            relations: ['table', 'package', 'started_by', 'orders', 'orders.items', 'orders.items.menu_item'],
        });
    }

    async getSessionForCustomer(id: string) {
        const session = await this.findOne(id);

        if (!session || session.status !== SessionStatus.ACTIVE) {
            throw new Error('Session not found or inactive');
        }

        // Get available menus for this package
        const menus = await this.packagesService.getPackageMenus(session.package_id);

        // Calculate remaining time
        const now = new Date();
        const remainingMs = session.end_time.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

        return {
            session: {
                id: session.id,
                table_number: session.table.table_number,
                package_name: session.package.name,
                start_time: session.start_time,
                end_time: session.end_time,
                remaining_minutes: remainingMinutes,
            },
            menus,
            orders: session.orders,
        };
    }

    async findActiveSessions(branchId?: string) {
        const queryBuilder = this.sessionsRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.table', 'table')
            .leftJoinAndSelect('session.package', 'package')
            .leftJoinAndSelect('session.started_by', 'user')
            .where('session.status = :status', { status: SessionStatus.ACTIVE });

        if (branchId) {
            queryBuilder.andWhere('table.branch_id = :branchId', { branchId });
        }

        return queryBuilder.getMany();
    }

    async endSession(
        id: string,
        cashierId?: string,
        paymentData?: {
            member_id?: string;
            discount_amount?: number;
            discount_reason?: string;
            points_used?: number;
            payments?: Array<{ payment_method: PaymentMethod; amount: number; reference_number?: string }>;
        }
    ) {
        const session = await this.sessionsRepository.findOne({
            where: { id },
            relations: ['table'],
        });

        if (!session) {
            throw new Error('Session not found');
        }

        let receipt = null;

        // Always create receipt when cashierId is provided
        if (cashierId) {
            // Calculate bill to get the total amount
            const billCalculation = await this.billingService.calculateBill(id);

            // Use provided payment data or create default CASH payment
            const payments = paymentData?.payments || [
                {
                    payment_method: PaymentMethod.CASH,
                    amount: billCalculation.grand_total,
                }
            ];

            receipt = await this.billingService.createReceipt({
                session_id: id,
                cashier_id: cashierId,
                member_id: paymentData?.member_id,
                discount_amount: paymentData?.discount_amount || 0,
                discount_reason: paymentData?.discount_reason,
                points_used: paymentData?.points_used || 0,
                payments: payments,
            });
        }

        // Update session status
        session.status = SessionStatus.COMPLETED;
        session.actual_end_time = new Date();
        await this.sessionsRepository.save(session);

        // Update table status
        await this.tablesRepository.update(session.table_id, {
            status: TableStatus.CLEANING,
        });

        return {
            message: 'Session ended successfully',
            receipt: receipt,
        };
    }

    async pauseSession(id: string) {
        const session = await this.sessionsRepository.findOne({ where: { id } });

        if (!session) {
            throw new Error('Session not found');
        }

        if (session.paused_at) {
            throw new Error('Session is already paused');
        }

        session.paused_at = new Date();
        await this.sessionsRepository.save(session);

        return { message: 'Session paused successfully', paused_at: session.paused_at };
    }

    async resumeSession(id: string) {
        const session = await this.sessionsRepository.findOne({ where: { id } });

        if (!session) {
            throw new Error('Session not found');
        }

        if (!session.paused_at) {
            throw new Error('Session is not paused');
        }

        // Calculate paused duration
        const now = new Date();
        const pausedMs = now.getTime() - session.paused_at.getTime();
        const pausedMinutes = Math.floor(pausedMs / 60000);

        session.paused_duration_minutes += pausedMinutes;
        session.paused_at = null;

        // Extend end time by paused duration
        const newEndTime = new Date(session.end_time.getTime() + pausedMs);
        session.end_time = newEndTime;

        await this.sessionsRepository.save(session);

        return {
            message: 'Session resumed successfully',
            paused_minutes: pausedMinutes,
            new_end_time: newEndTime
        };
    }

    async updatePackage(id: string, newPackageId: string) {
        const session = await this.sessionsRepository.findOne({
            where: { id },
            relations: ['package'],
        });

        if (!session) {
            throw new Error('Session not found');
        }

        const newPackage = await this.packagesRepository.findOne({
            where: { id: newPackageId },
        });

        if (!newPackage) {
            throw new Error('Package not found');
        }

        // Calculate new end time based on new package duration
        const elapsed = new Date().getTime() - session.start_time.getTime();
        const newEndTime = new Date(session.start_time.getTime() + newPackage.duration_minutes * 60000);

        session.package_id = newPackageId;
        session.end_time = newEndTime;

        await this.sessionsRepository.save(session);

        return this.findOne(id);
    }

    async updateGuestCount(id: string, adultCount: number, childCount: number) {
        const session = await this.sessionsRepository.findOne({ where: { id } });

        if (!session) {
            throw new Error('Session not found');
        }

        session.adult_count = adultCount;
        session.child_count = childCount;

        await this.sessionsRepository.save(session);

        return this.findOne(id);
    }

    async transferTable(id: string, newTableId: string) {
        const session = await this.sessionsRepository.findOne({
            where: { id },
            relations: ['table'],
        });

        if (!session) {
            throw new Error('Session not found');
        }

        const newTable = await this.tablesRepository.findOne({
            where: { id: newTableId },
        });

        if (!newTable) {
            throw new Error('Table not found');
        }

        if (newTable.status !== TableStatus.AVAILABLE) {
            throw new Error('New table is not available');
        }

        const oldTableId = session.table_id;

        // Update session
        session.table_id = newTableId;
        await this.sessionsRepository.save(session);

        // Update old table status
        await this.tablesRepository.update(oldTableId, {
            status: TableStatus.CLEANING,
        });

        // Update new table status
        await this.tablesRepository.update(newTableId, {
            status: TableStatus.OCCUPIED,
        });

        return this.findOne(id);
    }

    async getTimeRemaining(id: string) {
        const session = await this.sessionsRepository.findOne({ where: { id } });

        if (!session) {
            throw new Error('Session not found');
        }

        const now = new Date();

        // If paused, calculate from when it was paused
        if (session.paused_at) {
            const remainingMs = session.end_time.getTime() - session.paused_at.getTime();
            const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

            return {
                remaining_minutes: remainingMinutes,
                is_paused: true,
                paused_at: session.paused_at,
                total_paused_minutes: session.paused_duration_minutes,
            };
        }

        // Normal calculation
        const remainingMs = session.end_time.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

        return {
            remaining_minutes: remainingMinutes,
            is_paused: false,
            total_paused_minutes: session.paused_duration_minutes,
            end_time: session.end_time,
        };
    }

    async getQRCode(id: string) {
        const session = await this.sessionsRepository.findOne({ where: { id } });

        if (!session) {
            throw new Error('Session not found');
        }

        return {
            qr_code: session.qr_code,
            session_id: session.id,
        };
    }

    async getSessionsNeedingWarning() {
        const activeSessions = await this.sessionsRepository.find({
            where: { status: SessionStatus.ACTIVE },
            relations: ['table', 'package'],
        });

        const now = new Date();
        const warnings = [];

        for (const session of activeSessions) {
            // Skip paused sessions
            if (session.paused_at) continue;

            const remainingMs = session.end_time.getTime() - now.getTime();
            const remainingMinutes = Math.floor(remainingMs / 60000);

            // Check for 15-minute warning
            if (remainingMinutes <= 15 && remainingMinutes > 5) {
                const lastWarning = session.last_warning_sent;
                const shouldWarn = !lastWarning ||
                    (now.getTime() - lastWarning.getTime()) > 10 * 60000; // 10 minutes since last warning

                if (shouldWarn) {
                    warnings.push({
                        session_id: session.id,
                        table_number: session.table.table_number,
                        remaining_minutes: remainingMinutes,
                        warning_level: 'medium',
                    });
                }
            }

            // Check for 5-minute warning
            if (remainingMinutes <= 5 && remainingMinutes > 0) {
                const lastWarning = session.last_warning_sent;
                const shouldWarn = !lastWarning ||
                    (now.getTime() - lastWarning.getTime()) > 5 * 60000; // 5 minutes since last warning

                if (shouldWarn) {
                    warnings.push({
                        session_id: session.id,
                        table_number: session.table.table_number,
                        remaining_minutes: remainingMinutes,
                        warning_level: 'critical',
                    });
                }
            }

            // Check for overtime
            if (remainingMinutes <= 0) {
                warnings.push({
                    session_id: session.id,
                    table_number: session.table.table_number,
                    remaining_minutes: remainingMinutes,
                    warning_level: 'overtime',
                });
            }
        }

        return warnings;
    }

    async checkTimeWarnings(sessionId: string) {
        const session = await this.sessionsRepository.findOne({
            where: { id: sessionId },
            relations: ['table'],
        });

        if (!session) {
            throw new Error('Session not found');
        }

        if (session.paused_at) {
            return {
                has_warning: false,
                warning_level: null,
                remaining_minutes: null,
                message: 'Session is paused',
            };
        }

        const now = new Date();
        const remainingMs = session.end_time.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingMs / 60000);

        let warningLevel = null;
        let hasWarning = false;

        if (remainingMinutes <= 0) {
            warningLevel = 'overtime';
            hasWarning = true;
        } else if (remainingMinutes <= 5) {
            warningLevel = 'critical';
            hasWarning = true;
        } else if (remainingMinutes <= 15) {
            warningLevel = 'medium';
            hasWarning = true;
        }

        return {
            has_warning: hasWarning,
            warning_level: warningLevel,
            remaining_minutes: remainingMinutes,
            table_number: session.table.table_number,
        };
    }

    async markWarningAsSent(sessionId: string) {
        await this.sessionsRepository.update(sessionId, {
            last_warning_sent: new Date(),
        });
    }
}
