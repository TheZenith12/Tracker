import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { Model, Types } from 'mongoose'
import Anthropic from '@anthropic-ai/sdk'
import { Account, AccountDocument } from '../schemas/account.schema'
import { Transaction, TransactionDocument } from '../schemas/transaction.schema'
import { Budget, BudgetDocument } from '../schemas/budget.schema'

@Injectable()
export class AiService {
  private client: Anthropic

  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name) private txModel: Model<TransactionDocument>,
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    private config: ConfigService,
  ) {
    this.client = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') })
  }

  async getAdvice(userId: string): Promise<{ advice: string; generatedAt: string }> {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)
    const uid = new Types.ObjectId(userId)

    const [accounts, txs, budgets] = await Promise.all([
      this.accountModel.find({ userId: uid }),
      this.txModel.find({ userId: uid, date: { $gte: start, $lte: end }, type: { $in: ['INCOME', 'EXPENSE'] } })
        .populate('categoryId', 'name'),
      this.budgetModel.find({ userId: uid, month, year }).populate('categoryId', 'name'),
    ])

    const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

    const catMap: Record<string, number> = {}
    for (const t of txs.filter(t => t.type === 'EXPENSE')) {
      const name = (t.categoryId as any)?.name || 'Бусад'
      catMap[name] = (catMap[name] || 0) + t.amount
    }
    const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const budgetLines = await Promise.all(budgets.map(async b => {
      const spent = txs.filter(t => t.type === 'EXPENSE' && t.categoryId?.toString() === b.categoryId?.toString())
        .reduce((s, t) => s + t.amount, 0)
      return `- ${(b.categoryId as any)?.name}: ${spent.toLocaleString()} / ${b.limit.toLocaleString()} ₮`
    }))

    const prompt = `
Та доорх хэрэглэгчийн санхүүгийн мэдээллийг үндэслэн Монгол хэлээр хувийн зөвлөгөө өгнө үү.

## Дансны мэдээлэл
${accounts.map(a => `- ${a.name} (${a.type}): ${a.balance.toLocaleString()} ${a.currency}`).join('\n')}
Нийт үлдэгдэл: ${totalBalance.toLocaleString()} ₮

## ${month}-р сарын хураангуй
- Нийт орлого: ${income.toLocaleString()} ₮
- Нийт зарлага: ${expense.toLocaleString()} ₮
- Цэвэр хуримтлал: ${(income - expense).toLocaleString()} ₮

## Зарлагын топ ангиллууд
${topCats.map(([n, a]) => `- ${n}: ${a.toLocaleString()} ₮`).join('\n') || '- Мэдээлэл алга'}

## Төсвийн биелэлт
${budgetLines.join('\n') || '- Төсөв тохируулаагүй'}

Дээрх мэдээллийг харгалзан 200-300 үгэнд:
1. Санхүүгийн байдлын товч үнэлгээ
2. 2-3 практик зөвлөгөө
3. Сарын гүйцэтгэлийн дүгнэлт

Markdown ашигла (## гарчиг, **тод**, - жагсаалт).`.trim()

    try {
      const msg = await this.client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        system: 'Та хувийн санхүүгийн зөвлөх бөгөөд Монгол хэлээр тодорхой, практик зөвлөгөө өгдөг.',
        messages: [{ role: 'user', content: prompt }],
      })
      const advice = msg.content[0].type === 'text' ? msg.content[0].text : ''
      return { advice, generatedAt: new Date().toISOString() }
    } catch {
      throw new InternalServerErrorException('AI зөвлөгөө авахад алдаа гарлаа')
    }
  }
}
