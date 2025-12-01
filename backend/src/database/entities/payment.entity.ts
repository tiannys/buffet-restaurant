import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Receipt } from './receipt.entity';

export enum PaymentMethod {
    CASH = 'cash',
    TRANSFER = 'transfer',
    QR_PROMPTPAY = 'qr_promptpay',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    receipt_id: string;

    @ManyToOne(() => Receipt, (receipt) => receipt.payments)
    @JoinColumn({ name: 'receipt_id' })
    receipt: Receipt;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    payment_method: PaymentMethod;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reference_number: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;
}
