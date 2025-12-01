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

// Import all entities
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Branch } from './database/entities/branch.entity';
import { Package } from './database/entities/package.entity';
import { MenuItem } from './database/entities/menu-item.entity';
import { MenuCategory } from './database/entities/menu-category.entity';
import { PackageMenu } from './database/entities/package-menu.entity';
import { Table } from './database/entities/table.entity';
import { CustomerSession } from './database/entities/customer-session.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Receipt } from './database/entities/receipt.entity';
import { Payment } from './database/entities/payment.entity';
import { Member } from './database/entities/member.entity';
import { MemberPoints } from './database/entities/member-points.entity';
import { Setting } from './database/entities/setting.entity';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [
                    User,
                    Role,
                    Branch,
                    Package,
                    MenuItem,
                    MenuCategory,
                    PackageMenu,
                    Table,
                    CustomerSession,
                    Order,
                    OrderItem,
                    Receipt,
                    Payment,
                    Member,
                    MemberPoints,
                    Setting,
                ],
                synchronize: true, // Auto-create tables
                logging: configService.get('NODE_ENV') === 'development',
            }),
        }),

        // Feature modules
        AuthModule,
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
