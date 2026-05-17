import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RecurringService } from './recurring.service'
import { RecurringController } from './recurring.controller'
import { Recurring, RecurringSchema } from '../schemas/recurring.schema'
import { Transaction, TransactionSchema } from '../schemas/transaction.schema'
import { Account, AccountSchema } from '../schemas/account.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recurring.name, schema: RecurringSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  providers: [RecurringService],
  controllers: [RecurringController],
})
export class RecurringModule {}
