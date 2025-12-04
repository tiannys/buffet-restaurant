import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { Member } from '../database/entities/member.entity';
import { MemberPoints } from '../database/entities/member-points.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Member, MemberPoints])],
    providers: [LoyaltyService],
    controllers: [LoyaltyController],
    exports: [LoyaltyService],
})
export class LoyaltyModule { }
