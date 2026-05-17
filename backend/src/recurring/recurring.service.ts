import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Recurring, RecurringDocument } from '../schemas/recurring.schema'
import { Transaction, TransactionDocument } from '../schemas/transaction.schema'
import { Account, AccountDocument } from '../schemas/account.schema'
import { CreateRecurringDto } from './dto/create-recurring.dto'

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name)

  constructor(
    @InjectModel(Recurring.name) private recurringModel: Model<RecurringDocument>,
    @InjectModel(Transaction.name) private txModel: Model<TransactionDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async findAll(userId: string) {
    const list = await this.recurringModel.find({ userId }).sort({ nextDate: 1 })
    return list.map(r => ({ ...r.toObject(), id: r._id.toString() }))
  }

  async create(userId: string, dto: CreateRecurringDto) {
    const r = await this.recurringModel.create({
      userId,
      title: dto.title,
      amount: dto.amount,
      type: dto.type,
      categoryId: dto.categoryId || null,
      accountId: dto.accountId,
      frequency: dto.frequency || 'MONTHLY',
      startDate: new Date(dto.startDate),
      nextDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    })
    return { ...r.toObject(), id: r._id.toString() }
  }

  async togglePause(userId: string, id: string) {
    const r = await this.recurringModel.findOne({ _id: id, userId })
    if (!r) return null
    r.isPaused = !r.isPaused
    await r.save()
    return { ...r.toObject(), id: r._id.toString() }
  }

  async remove(userId: string, id: string) {
    await this.recurringModel.deleteOne({ _id: id, userId })
    return { message: 'Устгагдлаа' }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurring() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = await this.recurringModel.find({
      isPaused: false,
      nextDate: { $lte: today },
      $or: [{ endDate: null }, { endDate: { $gte: today } }],
    })

    for (const r of due) {
      try {
        const delta = r.type === 'INCOME' ? r.amount : -r.amount
        await this.txModel.create({
          userId: r.userId,
          fromAccountId: r.accountId,
          categoryId: r.categoryId,
          type: r.type,
          amount: r.amount,
          description: r.title,
          date: today,
          isRecurring: true,
          recurringId: r._id,
        })
        await this.accountModel.findByIdAndUpdate(r.accountId, { $inc: { balance: delta } })
        await this.recurringModel.findByIdAndUpdate(r._id, { nextDate: this.calcNext(today, r.frequency) })
        this.logger.log(`Processed: ${r.title}`)
      } catch (err) {
        this.logger.error(`Failed ${r._id}:`, err)
      }
    }
  }

  private calcNext(from: Date, freq: string): Date {
    const d = new Date(from)
    if (freq === 'DAILY') d.setDate(d.getDate() + 1)
    else if (freq === 'WEEKLY') d.setDate(d.getDate() + 7)
    else if (freq === 'MONTHLY') d.setMonth(d.getMonth() + 1)
    else if (freq === 'YEARLY') d.setFullYear(d.getFullYear() + 1)
    return d
  }
}
