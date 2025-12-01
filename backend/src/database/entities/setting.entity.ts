import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    key: string;

    @Column({ type: 'text' })
    value: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50, default: 'string' })
    value_type: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
