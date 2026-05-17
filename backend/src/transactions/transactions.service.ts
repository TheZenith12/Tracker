import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Transaction, TransactionDocument } from '../schemas/transaction.schema'
import { Account, AccountDocument } from '../schemas/account.schema'
import { Category, CategoryDocument } from '../schemas/category.schema'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { QueryTransactionDto } from './dto/query-transaction.dto'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private txModel: Model<TransactionDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private fmt(doc: any) {
    const o = doc.toObject ? doc.toObject() : doc
    return { ...o, id: o._id?.toString() }
  }

  async findAll(userId: string, query: QueryTransactionDto) {
    const { page = 1, limit = 20, type, categoryId, accountId, startDate, endDate, search } = query
    const filter: any = { userId }
    if (type) filter.type = type
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId)
    if (accountId) filter.fromAccountId = new Types.ObjectId(accountId)
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    if (search) filter.description = { $regex: search, $options: 'i' }

    const [total, txs] = await Promise.all([
      this.txModel.countDocuments(filter),
      this.txModel.find(filter)
        .populate('categoryId', 'name icon color')
        .populate('fromAccountId', 'name type')
        .populate('toAccountId', 'name')
        .sort({ date: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
    ])

    return {
      data: txs.map(t => {
        const o = t.toObject()
        return {
          ...o,
          id: o._id.toString(),
          category: o.categoryId,
          fromAccount: o.fromAccountId,
          toAccount: o.toAccountId,
        }
      }),
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    }
  }

  async findOne(userId: string, id: string) {
    const tx = await this.txModel.findOne({ _id: id, userId })
      .populate('categoryId', 'name icon color')
      .populate('fromAccountId', 'name type')
    if (!tx) throw new NotFoundException('Гүйлгээ олдсонгүй')
    return tx
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const account = await this.accountModel.findOne({ _id: dto.fromAccountId, userId })
    if (!account) throw new NotFoundException('Данс олдсонгүй')

    const delta = dto.type === 'INCOME' ? dto.amount : -dto.amount
    const tx = await this.txModel.create({
      userId,
      fromAccountId: dto.fromAccountId,
      toAccountId: dto.toAccountId || null,
      categoryId: dto.categoryId || null,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency || account.currency,
      description: dto.description,
      note: dto.note,
      date: dto.date ? new Date(dto.date) : new Date(),
    })
    await this.accountModel.findByIdAndUpdate(dto.fromAccountId, { $inc: { balance: delta } })
    if (dto.type === 'TRANSFER' && dto.toAccountId) {
      await this.accountModel.findByIdAndUpdate(dto.toAccountId, { $inc: { balance: dto.amount } })
    }
    return this.fmt(tx)
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id)
    const oldDelta = existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount)
    const newType = dto.type || existing.type
    const newAmount = dto.amount ?? Number(existing.amount)
    const newDelta = newType === 'INCOME' ? newAmount : -newAmount

    await this.accountModel.findByIdAndUpdate(existing.fromAccountId, { $inc: { balance: oldDelta + newDelta } })
    const updated = await this.txModel.findByIdAndUpdate(id, {
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.type && { type: dto.type }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.note !== undefined && { note: dto.note }),
      ...(dto.date && { date: new Date(dto.date) }),
    }, { new: true })
    return this.fmt(updated)
  }

  async remove(userId: string, id: string) {
    const tx = await this.findOne(userId, id)
    const delta = tx.type === 'INCOME' ? -Number(tx.amount) : Number(tx.amount)
    await Promise.all([
      this.txModel.findByIdAndDelete(id),
      this.accountModel.findByIdAndUpdate(tx.fromAccountId, { $inc: { balance: delta } }),
    ])
    return { message: 'Гүйлгээ устгагдлаа' }
  }

  async getSummary(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const txs = await this.txModel.find({
      userId,
      date: { $gte: start, $lte: end },
      type: { $in: ['INCOME', 'EXPENSE'] },
    }).populate('categoryId', 'name color icon')

    const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

    const byCatMap: Record<string, any> = {}
    for (const t of txs.filter(t => t.type === 'EXPENSE')) {
      const cat: any = t.categoryId
      const key = cat?._id?.toString() || 'other'
      if (!byCatMap[key]) byCatMap[key] = { name: cat?.name || 'Бусад', color: cat?.color || '#6B7280', amount: 0 }
      byCatMap[key].amount += t.amount
    }

    return { income, expense, balance: income - expense, byCategory: Object.values(byCatMap) }
  }
}
