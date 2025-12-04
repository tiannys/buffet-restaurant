import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Receipt } from './receipt.entity';

export enum PointsTransactionType {
    EARNED = 'earned',
    REDEEMED = 'redeemed',
    EXPIRED = 'expired',
    ADJUSTED = 'adjusted',
}

@Entity('member_points')
export class MemberPoints {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    member_id: string;

    @ManyToOne(() => Member, (member) => member.points_history)
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({
        type: 'enum',
        enum: PointsTransactionType,
    })
    transaction_type: PointsTransactionType;

    @Column({ type: 'integer' })
    points: number;

    @Column({ type: 'integer' })
    balance_after: number;

    @Column({ type: 'uuid', nullable: true })
    receipt_id: string;

    @ManyToOne(() => Receipt, { nullable: true })
    @JoinColumn({ name: 'receipt_id' })
    receipt: Receipt;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;
}
