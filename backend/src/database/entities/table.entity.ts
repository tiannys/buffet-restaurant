import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

export enum TableType {
    NORMAL = 'normal',
    VIP = 'vip',
    PRIVATE = 'private',
}

export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved',
    CLEANING = 'cleaning',
}

@Entity('tables')
export class Table {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    table_number: string;

    @Column({ nullable: true })
    zone: string;

    @Column({ type: 'integer' })
    capacity: number;

    @Column({
        type: 'enum',
        enum: TableStatus,
        default: TableStatus.AVAILABLE,
    })
    status: TableStatus;

    @Column({
        type: 'enum',
        enum: TableType,
        default: TableType.NORMAL,
    })
    table_type: TableType;

    @Column({ default: false })
    is_out_of_service: boolean;

    @Column({ type: 'text', nullable: true })
    service_notes: string;

    @Column({ type: 'uuid' })
    branch_id: string;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
