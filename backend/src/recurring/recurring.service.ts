import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: { user: { select: { id: true } } },
      orderBy: { nextDate: 'asc' },
    });
  }

  async create(userId: string, dto: CreateRecurringDto) {
    return this.prisma.recurringTransaction.create({
      data: {
        userId,
        title: dto.title,
        amount: dto.amount,
        type: dto.type,
        categoryId: dto.categoryId,
        accountId: dto.accountId,
        frequency: dto.frequency || 'MONTHLY',
        startDate: new Date(dto.startDate),
        nextDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async togglePause(userId: string, id: string) {
    const recurring = await this.prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!recurring) return null;
    return this.prisma.recurringTransaction.update({
      where: { id },
      data: { isPaused: !recurring.isPaused },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.recurringTransaction.deleteMany({ where: { id, userId } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurring() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = await this.prisma.recurringTransaction.findMany({
      where: {
        isPaused: false,
        nextDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    });

    for (const r of due) {
      try {
        const delta = r.type === 'INCOME' ? Number(r.amount) : -Number(r.amount);

        await this.prisma.$transaction([
          this.prisma.transaction.create({
            data: {
              fromAccountId: r.accountId,
              categoryId: r.categoryId,
              type: r.type,
              amount: r.amount,
              description: r.title,
              date: today,
              isRecurring: true,
              recurringId: r.id,
            },
          }),
          this.prisma.account.update({
            where: { id: r.accountId },
            data: { balance: { increment: delta } },
          }),
          this.prisma.recurringTransaction.update({
            where: { id: r.id },
            data: { nextDate: this.calcNextDate(today, r.frequency) },
          }),
        ]);

        this.logger.log(`Processed recurring: ${r.title}`);
      } catch (err) {
        this.logger.error(`Failed recurring ${r.id}:`, err);
      }
    }
  }

  private calcNextDate(from: Date, frequency: string): Date {
    const next = new Date(from);
    switch (frequency) {
      case 'DAILY': next.setDate(next.getDate() + 1); break;
      case 'WEEKLY': next.setDate(next.getDate() + 7); break;
      case 'MONTHLY': next.setMonth(next.getMonth() + 1); break;
      case 'YEARLY': next.setFullYear(next.getFullYear() + 1); break;
    }
    return next;
  }
}
