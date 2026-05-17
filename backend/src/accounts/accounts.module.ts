import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountsService } from './accounts.service'
import { AccountsController } from './accounts.controller'
import { Account, AccountSchema } from '../schemas/account.schema'
import { Transaction, TransactionSchema } from '../schemas/transaction.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
