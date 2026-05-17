import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { Account, AccountSchema } from '../schemas/account.schema'
import { Transaction, TransactionSchema } from '../schemas/transaction.schema'
import { Category, CategorySchema } from '../schemas/category.schema'
import { Budget, BudgetSchema } from '../schemas/budget.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Budget.name, schema: BudgetSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
