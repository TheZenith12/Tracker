import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Transaction, TransactionDocument } from '../schemas/transaction.schema'
import { Response } from 'express'

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Transaction.name) private txModel: Model<TransactionDocument>) {}

  async getMonthlyTrend(userId: string, year: number) {
    const result = await this.txModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          type: { $in: ['INCOME', 'EXPENSE'] },
          date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ])

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const income = result.find(r => r._id.month === month && r._id.type === 'INCOME')?.total || 0
      const expense = result.find(r => r._id.month === month && r._id.type === 'EXPENSE')?.total || 0
      return { month, income, expense, balance: income - expense }
    })
  }

  async getCategoryBreakdown(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const txs = await this.txModel.find({
      userId: new Types.ObjectId(userId),
      type: 'EXPENSE',
      date: { $gte: start, $lte: end },
    }).populate('categoryId', 'name color icon')

    const grouped: Record<string, any> = {}
    for (const t of txs) {
      const cat: any = t.categoryId
      const key = cat?._id?.toString() || 'other'
      if (!grouped[key]) {
        grouped[key] = { id: key, name: cat?.name || 'Бусад', color: cat?.color || '#6B7280', icon: cat?.icon || 'tag', value: 0, count: 0 }
      }
      grouped[key].value += t.amount
      grouped[key].count += 1
    }

    return Object.values(grouped).sort((a: any, b: any) => b.value - a.value)
  }

  async getDailySpending(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const txs = await this.txModel.find({
      userId: new Types.ObjectId(userId),
      type: { $in: ['INCOME', 'EXPENSE'] },
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 })

    const daily: Record<string, any> = {}
    for (const t of txs) {
      const day = t.date.toISOString().split('T')[0]
      if (!daily[day]) daily[day] = { date: day, income: 0, expense: 0 }
      if (t.type === 'INCOME') daily[day].income += t.amount
      else daily[day].expense += t.amount
    }

    return Object.values(daily)
  }

  async exportCsv(userId: string, month: number, year: number, res: Response) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const txs = await this.txModel.find({
      userId: new Types.ObjectId(userId),
      date: { $gte: start, $lte: end },
    }).populate('categoryId', 'name').populate('fromAccountId', 'name').sort({ date: -1 })

    const rows = txs.map(t => ({
      Огноо: t.date.toLocaleDateString('mn-MN'),
      Төрөл: t.type === 'INCOME' ? 'Орлого' : t.type === 'EXPENSE' ? 'Зарлага' : 'Шилжүүлэг',
      Категори: (t.categoryId as any)?.name || '-',
      Данс: (t.fromAccountId as any)?.name || '-',
      Дүн: t.amount,
      Тайлбар: t.description || '',
    }))

    const headers = Object.keys(rows[0] || {})
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h]}"`).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename=finance-${year}-${month}.csv`)
    res.send('﻿' + csv)
  }
}
