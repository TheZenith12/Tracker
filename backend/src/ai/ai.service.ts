import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private client: Anthropic;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.client = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') });
  }

  async getAdvice(userId: string): Promise<{ advice: string; generatedAt: string }> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const [accounts, txSummary, categoryBreakdown, budgets] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId },
        select: { name: true, type: true, balance: true, currency: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where: { fromAccount: { userId }, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          fromAccount: { userId },
          type: 'EXPENSE',
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
      this.prisma.budget.findMany({
        where: { userId, month, year },
        include: { category: { select: { name: true } } },
      }),
    ]);

    // Resolve category names for the breakdown
    const categoryIds = categoryBreakdown.map(c => c.categoryId).filter(Boolean) as string[];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    // Build budget spending data
    const budgetData = await Promise.all(
      budgets.map(async b => {
        const spent = await this.prisma.transaction.aggregate({
          where: {
            fromAccount: { userId },
            categoryId: b.categoryId,
            type: 'EXPENSE',
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });
        return {
          category: b.category.name,
          limit: Number(b.limit),
          spent: Number(spent._sum.amount || 0),
        };
      }),
    );

    const totalIncome = Number(txSummary.find(s => s.type === 'INCOME')?._sum.amount || 0);
    const totalExpense = Number(txSummary.find(s => s.type === 'EXPENSE')?._sum.amount || 0);
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    const prompt = `
Та доорх хэрэглэгчийн санхүүгийн мэдээллийг үндэслэн Монгол хэлээр хувийн зөвлөгөө өгнө үү.

## Дансны мэдээлэл
${accounts.map(a => `- ${a.name} (${a.type}): ${Number(a.balance).toLocaleString()} ${a.currency}`).join('\n')}
Нийт үлдэгдэл: ${totalBalance.toLocaleString()} ₮

## ${month}-р сарын гүйлгээний хураангуй
- Нийт орлого: ${totalIncome.toLocaleString()} ₮
- Нийт зарлага: ${totalExpense.toLocaleString()} ₮
- Цэвэр хуримтлал: ${(totalIncome - totalExpense).toLocaleString()} ₮

## Зарлагын топ ангиллууд (${month}-р сар)
${categoryBreakdown.map(c => `- ${catMap[c.categoryId!] || 'Бусад'}: ${Number(c._sum.amount || 0).toLocaleString()} ₮`).join('\n') || '- Мэдээлэл алга'}

## Төсвийн биелэлт
${budgetData.length > 0 ? budgetData.map(b => `- ${b.category}: ${b.spent.toLocaleString()} / ${b.limit.toLocaleString()} ₮ (${Math.round((b.spent / b.limit) * 100)}%)`).join('\n') : '- Төсөв тохируулаагүй'}

Дээрх мэдээллийг харгалзан:
1. Санхүүгийн байдлын товч үнэлгээ
2. 2-3 практик зөвлөгөө (хуримтлал нэмэгдүүлэх, зарлагаа багасгах эсвэл шаардлагатай бол)
3. Тухайн сарын гүйцэтгэлийн дүгнэлт

Зөвлөгөөг найрсаг, тодорхой, 200-300 үгэнд багтааж бичнэ үү. Markdown formatting ашиглаж болно (## гарчиг, **тод**, - жагсаалт).
`.trim();

    try {
      const message = await this.client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        system: 'Та хувийн санхүүгийн зөвлөх бөгөөд Монгол хэлээр тодорхой, практик зөвлөгөө өгдөг.',
      });

      const advice = message.content[0].type === 'text' ? message.content[0].text : '';
      return { advice, generatedAt: new Date().toISOString() };
    } catch (err) {
      throw new InternalServerErrorException('AI зөвлөгөө авахад алдаа гарлаа');
    }
  }
}
