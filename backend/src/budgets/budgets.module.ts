import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BudgetsService } from './budgets.service'
import { BudgetsController } from './budgets.controller'
import { Budget, BudgetSchema } from '../schemas/budget.schema'
import { Transaction, TransactionSchema } from '../schemas/transaction.schema'
import { Category, CategorySchema } from '../schemas/category.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Budget.name, schema: BudgetSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [BudgetsService],
  controllers: [BudgetsController],
})
export class BudgetsModule {}
