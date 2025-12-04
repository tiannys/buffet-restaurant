import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { CustomerSession } from '../database/entities/customer-session.entity';
import { Table } from '../database/entities/table.entity';
import { Package } from '../database/entities/package.entity';
import { PackagesModule } from '../packages/packages.module';
import { TablesModule } from '../tables/tables.module';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerSession, Table, Package]),
        PackagesModule,
        TablesModule,
        BillingModule,
    ],
    providers: [SessionsService],
    controllers: [SessionsController],
    exports: [SessionsService],
})
export class SessionsModule { }
