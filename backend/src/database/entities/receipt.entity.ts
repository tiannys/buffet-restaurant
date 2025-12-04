import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { CustomerSession } from './customer-session.entity';
import { Member } from './member.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';

@Entity('receipts')
export class Receipt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    receipt_number: string;

    @Column({ type: 'uuid' })
    session_id: string;

    @ManyToOne(() => CustomerSession)
    @JoinColumn({ name: 'session_id' })
    session: CustomerSession;

    @Column({ type: 'uuid', nullable: true })
    member_id: string;

    @ManyToOne(() => Member, { nullable: true })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    service_charge: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    vat: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount_amount: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    discount_reason: string;

    @Column({ type: 'integer', default: 0 })
    points_used: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    points_value: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    grand_total: number;

    @Column({ type: 'integer', default: 0 })
    points_earned: number;

    @Column({ type: 'uuid' })
    cashier_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'cashier_id' })
    cashier: User;

    @OneToMany(() => Payment, (payment) => payment.receipt)
    payments: Payment[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
