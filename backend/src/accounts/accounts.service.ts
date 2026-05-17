import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Account, AccountDocument } from '../schemas/account.schema'
import { Transaction, TransactionDocument } from '../schemas/transaction.schema'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name) private txModel: Model<TransactionDocument>,
  ) {}

  async findAll(userId: string) {
    const accounts = await this.accountModel.find({ userId }).sort({ isDefault: -1, createdAt: 1 })
    return accounts.map(a => ({ ...a.toObject(), id: a._id.toString() }))
  }

  async findOne(userId: string, id: string) {
    const account = await this.accountModel.findOne({ _id: id, userId })
    if (!account) throw new NotFoundException('Данс олдсонгүй')
    return account
  }

  async create(userId: string, dto: CreateAccountDto) {
    const account = await this.accountModel.create({ ...dto, userId })
    return { ...account.toObject(), id: account._id.toString() }
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id)
    const updated = await this.accountModel.findByIdAndUpdate(id, dto, { new: true })
    return { ...updated.toObject(), id: updated._id.toString() }
  }

  async remove(userId: string, id: string) {
    const account = await this.findOne(userId, id)
    if (account.isDefault) throw new ForbiddenException('Үндсэн дансыг устгах боломжгүй')
    await this.accountModel.findByIdAndDelete(id)
    return { message: 'Данс устгагдлаа' }
  }
}
