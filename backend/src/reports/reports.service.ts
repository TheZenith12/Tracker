import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyTrend(userId: string, year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const data = await Promise.all(
      months.map(async (month) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const [income, expense] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: { fromAccount: { userId }, type: 'INCOME', date: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: { fromAccount: { userId }, type: 'EXPENSE', date: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
        ]);

        return {
          month,
          income: Number(income._sum.amount || 0),
          expense: Number(expense._sum.amount || 0),
          balance: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
        };
      }),
    );

    return data;
  }

  async getCategoryBreakdown(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        fromAccount: { userId },
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
      include: { category: { select: { name: true, color: true, icon: true } } },
    });

    const grouped = transactions.reduce((acc: any, t) => {
      const key = t.categoryId || 'other';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          name: t.category?.name || 'Бусад',
          color: t.category?.color || '#6B7280',
          icon: t.category?.icon || 'tag',
          value: 0,
          count: 0,
        };
      }
      acc[key].value += Number(t.amount);
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => b.value - a.value);
  }

  async getDailySpending(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        fromAccount: { userId },
        date: { gte: start, lte: end },
        type: { in: ['INCOME', 'EXPENSE'] },
      },
      orderBy: { date: 'asc' },
    });

    const daily = transactions.reduce((acc: any, t) => {
      const day = t.date.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
      if (t.type === 'INCOME') acc[day].income += Number(t.amount);
      else acc[day].expense += Number(t.amount);
      return acc;
    }, {});

    return Object.values(daily);
  }

  async exportCsv(userId: string, month: number, year: number, res: Response) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: { fromAccount: { userId }, date: { gte: start, lte: end } },
      include: { category: true, fromAccount: true },
      orderBy: { date: 'desc' },
    });

    const rows = transactions.map(t => ({
      Огноо: t.date.toLocaleDateString('mn-MN'),
      Төрөл: t.type === 'INCOME' ? 'Орлого' : t.type === 'EXPENSE' ? 'Зарлага' : 'Шилжүүлэг',
      Категори: t.category?.name || '-',
      Данс: t.fromAccount.name,
      Дүн: Number(t.amount),
      Тайлбар: t.description || '',
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${(row as any)[h]}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=finance-${year}-${month}.csv`);
    res.send('﻿' + csv); // BOM for Excel UTF-8
  }
}
