import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../database/entities/member.entity';
import { MemberPoints, PointsTransactionType } from '../database/entities/member-points.entity';

@Injectable()
export class LoyaltyService {
    constructor(
        @InjectRepository(Member)
        private membersRepository: Repository<Member>,
        @InjectRepository(MemberPoints)
        private pointsRepository: Repository<MemberPoints>,
    ) { }

    async findAllMembers() {
        return this.membersRepository.find({
            where: { is_active: true },
            order: { created_at: 'DESC' },
        });
    }

    async findMemberByPhone(phone: string) {
        return this.membersRepository.findOne({
            where: { phone, is_active: true },
        });
    }

    async createMember(memberData: any) {
        const existing = await this.findMemberByPhone(memberData.phone);
        if (existing) {
            throw new Error('Member with this phone number already exists');
        }

        const member = this.membersRepository.create(memberData);
        return this.membersRepository.save(member);
    }

    async updateMember(id: string, memberData: any) {
        await this.membersRepository.update(id, memberData);
        return this.membersRepository.findOne({ where: { id } });
    }

    async earnPoints(memberId: string, points: number, receiptId?: string) {
        const member = await this.membersRepository.findOne({ where: { id: memberId } });
        if (!member) {
            throw new Error('Member not found');
        }

        const newBalance = member.total_points + points;

        // Create points transaction
        const transaction = this.pointsRepository.create({
            member_id: memberId,
            transaction_type: PointsTransactionType.EARNED,
            points: points,
            balance_after: newBalance,
            receipt_id: receiptId,
            notes: 'Points earned from purchase',
        });

        await this.pointsRepository.save(transaction);

        // Update member balance
        member.total_points = newBalance;
        await this.membersRepository.save(member);

        return { points_earned: points, new_balance: newBalance };
    }

    async redeemPoints(memberId: string, points: number, receiptId?: string) {
        const member = await this.membersRepository.findOne({ where: { id: memberId } });
        if (!member) {
            throw new Error('Member not found');
        }

        if (member.total_points < points) {
            throw new Error('Insufficient points');
        }

        const newBalance = member.total_points - points;

        // Create points transaction
        const transaction = this.pointsRepository.create({
            member_id: memberId,
            transaction_type: PointsTransactionType.REDEEMED,
            points: -points,
            balance_after: newBalance,
            receipt_id: receiptId,
            notes: 'Points redeemed for discount',
        });

        await this.pointsRepository.save(transaction);

        // Update member balance
        member.total_points = newBalance;
        await this.membersRepository.save(member);

        return { points_redeemed: points, new_balance: newBalance };
    }

    async getPointsHistory(memberId: string) {
        return this.pointsRepository.find({
            where: { member_id: memberId },
            relations: ['receipt'],
            order: { created_at: 'DESC' },
        });
    }
}
