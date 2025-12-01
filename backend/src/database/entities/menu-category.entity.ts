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

@Entity('menu_categories')
export class MenuCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid' })
    branch_id: string;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column({ type: 'integer', default: 0 })
    sort_order: number;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
