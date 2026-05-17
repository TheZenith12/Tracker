import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Budget, BudgetDocument } from '../schemas/budget.schema'
import { Transaction, TransactionDocument } from '../schemas/transaction.schema'
import { CreateBudgetDto } from './dto/create-budget.dto'

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Transaction.name) private txModel: Model<TransactionDocument>,
  ) {}

  async findAll(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const budgets = await this.budgetModel.find({ userId, month: Number(month), year: Number(year) })
      .populate('categoryId', 'name icon color')

    return Promise.all(budgets.map(async b => {
      const [{ total }] = await this.txModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId), categoryId: b.categoryId, type: 'EXPENSE', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(r => r.length ? r : [{ total: 0 }])

      const pct = Math.round((total / b.limit) * 100)
      return {
        id: b._id.toString(),
        categoryId: (b.categoryId as any)?._id?.toString(),
        category: b.categoryId,
        month: b.month, year: b.year, limit: b.limit, currency: b.currency,
        spent: total, remaining: b.limit - total,
        percentage: pct, isExceeded: total > b.limit,
      }
    }))
  }

  async upsert(userId: string, dto: CreateBudgetDto) {
    const { categoryId, month, year, limit } = dto
    const budget = await this.budgetModel.findOneAndUpdate(
      { userId, categoryId, month, year },
      { limit },
      { upsert: true, new: true },
    )
    return { ...budget.toObject(), id: budget._id.toString() }
  }

  async remove(userId: string, id: string) {
    await this.budgetModel.deleteOne({ _id: id, userId })
    return { message: 'Төсөв устгагдлаа' }
  }

  async getOverview(userId: string, month: number, year: number) {
    const budgets = await this.findAll(userId, month, year)
    const exceeded = budgets.filter(b => b.isExceeded)
    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
    return { budgets, exceeded, totalBudget, totalSpent }
  }
}
