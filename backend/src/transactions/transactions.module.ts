import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TransactionsService } from './transactions.service'
import { TransactionsController } from './transactions.controller'
import { Transaction, TransactionSchema } from '../schemas/transaction.schema'
import { Account, AccountSchema } from '../schemas/account.schema'
import { Category, CategorySchema } from '../schemas/category.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
