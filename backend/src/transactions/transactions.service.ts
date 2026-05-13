import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryTransactionDto) {
    const { page = 1, limit = 20, type, categoryId, accountId, startDate, endDate, search } = query;

    const where: any = {
      fromAccount: { userId },
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.fromAccountId = accountId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const [total, transactions] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          fromAccount: { select: { id: true, name: true, type: true } },
          toAccount: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, fromAccount: { userId } },
      include: { category: true, fromAccount: true, toAccount: true },
    });
    if (!tx) throw new NotFoundException('Гүйлгээ олдсонгүй');
    return tx;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: dto.fromAccountId, userId },
    });
    if (!account) throw new NotFoundException('Данс олдсонгүй');

    const balanceDelta = dto.type === 'INCOME' ? dto.amount : -dto.amount;

    return this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          fromAccountId: dto.fromAccountId,
          toAccountId: dto.toAccountId,
          categoryId: dto.categoryId,
          type: dto.type,
          amount: dto.amount,
          currency: dto.currency || account.currency,
          description: dto.description,
          note: dto.note,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
        include: { category: true, fromAccount: true },
      }),
      this.prisma.account.update({
        where: { id: dto.fromAccountId },
        data: { balance: { increment: balanceDelta } },
      }),
    ]).then(([tx]) => tx);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);

    const oldDelta = existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount);
    const newDelta = dto.type
      ? dto.type === 'INCOME' ? dto.amount || Number(existing.amount) : -(dto.amount || Number(existing.amount))
      : 0;

    return this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: {
          categoryId: dto.categoryId,
          amount: dto.amount,
          type: dto.type,
          description: dto.description,
          note: dto.note,
          date: dto.date ? new Date(dto.date) : undefined,
        },
        include: { category: true, fromAccount: true },
      }),
      this.prisma.account.update({
        where: { id: existing.fromAccountId },
        data: { balance: { increment: oldDelta + newDelta } },
      }),
    ]).then(([tx]) => tx);
  }

  async remove(userId: string, id: string) {
    const tx = await this.findOne(userId, id);
    const delta = tx.type === 'INCOME' ? -Number(tx.amount) : Number(tx.amount);

    return this.prisma.$transaction([
      this.prisma.transaction.delete({ where: { id } }),
      this.prisma.account.update({
        where: { id: tx.fromAccountId },
        data: { balance: { increment: delta } },
      }),
    ]);
  }

  async getSummary(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        fromAccount: { userId },
        date: { gte: start, lte: end },
        type: { in: ['INCOME', 'EXPENSE'] },
      },
      include: { category: { select: { name: true, color: true, icon: true } } },
    });

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc: any, t) => {
        const key = t.categoryId || 'other';
        if (!acc[key]) {
          acc[key] = { name: t.category?.name || 'Бусад', color: t.category?.color || '#6B7280', amount: 0 };
        }
        acc[key].amount += Number(t.amount);
        return acc;
      }, {});

    return {
      income,
      expense,
      balance: income - expense,
      byCategory: Object.values(byCategory),
    };
  }
}
