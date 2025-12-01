import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { MemberPoints } from './member-points.entity';

@Entity('members')
export class Member {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    full_name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;

    @Column({ type: 'integer', default: 0 })
    total_points: number;

    @Column({ default: true })
    is_active: boolean;

    @OneToMany(() => MemberPoints, (points) => points.member)
    points_history: MemberPoints[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
