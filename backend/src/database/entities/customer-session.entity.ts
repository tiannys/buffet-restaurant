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
import { Table } from './table.entity';
import { Package } from './package.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

export enum SessionStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('customer_sessions')
export class CustomerSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    table_id: string;

    @ManyToOne(() => Table)
    @JoinColumn({ name: 'table_id' })
    table: Table;

    @Column({ type: 'uuid' })
    package_id: string;

    @ManyToOne(() => Package)
    @JoinColumn({ name: 'package_id' })
    package: Package;

    @Column({ type: 'integer' })
    adult_count: number;

    @Column({ type: 'integer', default: 0 })
    child_count: number;

    @Column({ type: 'timestamp' })
    start_time: Date;

    @Column({ type: 'timestamp' })
    end_time: Date;

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.ACTIVE,
    })
    status: SessionStatus;

    @Column({ type: 'uuid' })
    started_by_user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'started_by_user_id' })
    started_by: User;

    @Column({ type: 'text', nullable: true })
    qr_code: string;

    @OneToMany(() => Order, (order) => order.session)
    orders: Order[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
