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
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    IN_PROGRESS = 'in_progress',
    SERVED = 'served',
    CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    session_id: string;

    @ManyToOne(() => CustomerSession, (session) => session.orders)
    @JoinColumn({ name: 'session_id' })
    session: CustomerSession;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
