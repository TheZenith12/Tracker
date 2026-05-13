import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return accounts;
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Данс олдсонгүй');
    return account;
  }

  async create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: { ...dto, userId },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const account = await this.findOne(userId, id);
    if (account.isDefault) throw new ForbiddenException('Үндсэн дансыг устгах боломжгүй');
    return this.prisma.account.delete({ where: { id } });
  }

  async transfer(userId: string, dto: TransferDto) {
    const [fromAccount, toAccount] = await Promise.all([
      this.findOne(userId, dto.fromAccountId),
      this.findOne(userId, dto.toAccountId),
    ]);

    return this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.account.update({
        where: { id: toAccount.id },
        data: { balance: { increment: dto.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          fromAccountId: dto.fromAccountId,
          toAccountId: dto.toAccountId,
          type: 'TRANSFER',
          amount: dto.amount,
          description: dto.description || 'Шилжүүлэг',
          date: new Date(),
        },
      }),
    ]);
  }

  async getTotalBalance(userId: string) {
    const accounts = await this.prisma.account.findMany({ where: { userId } });
    const mntTotal = accounts
      .filter(a => a.currency === 'MNT')
      .reduce((sum, a) => sum + Number(a.balance), 0);
    return { mntTotal, accounts };
  }
}
