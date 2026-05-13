import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    });

    // Calculate spent for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.prisma.transaction.aggregate({
          where: {
            fromAccount: { userId },
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: { gte: start, lte: end },
          },
          _sum: { amount: true },
        });
        const spentAmount = Number(spent._sum.amount || 0);
        const limitAmount = Number(budget.limit);
        return {
          ...budget,
          spent: spentAmount,
          remaining: limitAmount - spentAmount,
          percentage: Math.min(Math.round((spentAmount / limitAmount) * 100), 100),
          isExceeded: spentAmount > limitAmount,
        };
      }),
    );

    return budgetsWithSpent;
  }

  async upsert(userId: string, dto: CreateBudgetDto) {
    const { categoryId, month, year, limit } = dto;
    return this.prisma.budget.upsert({
      where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
      create: { userId, categoryId, month, year, limit },
      update: { limit },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.budget.deleteMany({ where: { id, userId } });
  }

  async getOverview(userId: string, month: number, year: number) {
    const budgets = await this.findAll(userId, month, year);
    const exceeded = budgets.filter(b => b.isExceeded);
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    return { budgets, exceeded, totalBudget, totalSpent };
  }
}
