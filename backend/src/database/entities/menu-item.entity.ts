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
import { MenuCategory } from './menu-category.entity';
import { Branch } from './branch.entity';
import { PackageMenu } from './package-menu.entity';

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid' })
    category_id: string;

    @ManyToOne(() => MenuCategory)
    @JoinColumn({ name: 'category_id' })
    category: MenuCategory;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost: number;

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: 'uuid' })
    branch_id: string;

    @ManyToOne(() => Branch)
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column({ default: true })
    is_available: boolean;

    @Column({ default: false })
    is_out_of_stock: boolean;

    @Column({ type: 'integer', nullable: true })
    stock_quantity: number | null;

    @Column({ type: 'integer', nullable: true, default: 10 })
    low_stock_threshold: number | null;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'integer', default: 0 })
    sort_order: number;

    @OneToMany(() => PackageMenu, (pm) => pm.menu_item)
    package_menus: PackageMenu[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
