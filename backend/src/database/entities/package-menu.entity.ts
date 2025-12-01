import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Package } from './package.entity';
import { MenuItem } from './menu-item.entity';

@Entity('package_menus')
export class PackageMenu {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    package_id: string;

    @ManyToOne(() => Package, (pkg) => pkg.package_menus)
    @JoinColumn({ name: 'package_id' })
    package: Package;

    @Column({ type: 'uuid' })
    menu_item_id: string;

    @ManyToOne(() => MenuItem, (item) => item.package_menus)
    @JoinColumn({ name: 'menu_item_id' })
    menu_item: MenuItem;

    @CreateDateColumn()
    created_at: Date;
}
