import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PackagesModule } from './packages/packages.module';
import { MenusModule } from './menus/menus.module';
import { TablesModule } from './tables/tables.module';
import { SessionsModule } from './sessions/sessions.module';
import { OrdersModule } from './orders/orders.module';
import { BillingModule } from './billing/billing.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            UsersModule,
            PackagesModule,
            MenusModule,
            TablesModule,
            SessionsModule,
            OrdersModule,
            BillingModule,
            LoyaltyModule,
            ReportsModule,
            SettingsModule,
            UploadsModule,
    ],
})
export class AppModule { }
