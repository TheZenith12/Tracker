import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AccountsModule } from './accounts/accounts.module'
import { CategoriesModule } from './categories/categories.module'
import { TransactionsModule } from './transactions/transactions.module'
import { BudgetsModule } from './budgets/budgets.module'
import { ReportsModule } from './reports/reports.module'
import { AiModule } from './ai/ai.module'
import { RecurringModule } from './recurring/recurring.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    ReportsModule,
    AiModule,
    RecurringModule,
  ],
})
export class AppModule {}
