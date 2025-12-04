import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum PromptPayType {
    PHONE = 'phone',
    ID = 'id',
}

@Entity('settings')
export class Settings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, default: 'ร้านบุฟเฟ่ต์' })
    restaurant_name: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    logo_url: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 7.00 })
    vat_percent: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
    service_charge_percent: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    promptpay_id: string;

    @Column({ type: 'enum', enum: PromptPayType, nullable: true })
    promptpay_type: PromptPayType;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
