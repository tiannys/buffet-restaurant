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
import { Branch } from './branch.entity';
import { PackageMenu } from './package-menu.entity';

@Entity('packages')
export class Package {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    adult_price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    child_price: number;

    @Column({ type: 'integer' })
    duration_minutes: number;

    @Column({ type: 'uuid', nullable: true })
    parent_package_id: string;

    @ManyToOne(() => Package, { nullable: true })
    @JoinColumn({ name: 'parent_package_id' })
    parent_package: Package;

    @Column({ type: 'uuid' })
    branch_id: string;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'integer', default: 0 })
    sort_order: number;

    @OneToMany(() => PackageMenu, (pm) => pm.package)
    package_menus: PackageMenu[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
