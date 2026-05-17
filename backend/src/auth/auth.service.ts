import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { User, UserDocument } from '../schemas/user.schema'
import { Account, AccountDocument } from '../schemas/account.schema'
import { Category, CategoryDocument } from '../schemas/category.schema'
import { MailService } from '../mail/mail.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

const DEFAULT_CATEGORIES = [
  { name: 'Цалин', nameEn: 'Salary', icon: 'briefcase', color: '#10B981', type: 'INCOME' },
  { name: 'Бизнес', nameEn: 'Business', icon: 'trending-up', color: '#3B82F6', type: 'INCOME' },
  { name: 'Хөрөнгө оруулалт', nameEn: 'Investment', icon: 'bar-chart', color: '#8B5CF6', type: 'INCOME' },
  { name: 'Бусад орлого', nameEn: 'Other Income', icon: 'plus-circle', color: '#6B7280', type: 'INCOME' },
  { name: 'Хоол хүнс', nameEn: 'Food', icon: 'coffee', color: '#EF4444', type: 'EXPENSE' },
  { name: 'Тээвэр', nameEn: 'Transport', icon: 'truck', color: '#F59E0B', type: 'EXPENSE' },
  { name: 'Орон сууц', nameEn: 'Housing', icon: 'home', color: '#3B82F6', type: 'EXPENSE' },
  { name: 'Эрүүл мэнд', nameEn: 'Health', icon: 'heart', color: '#EC4899', type: 'EXPENSE' },
  { name: 'Боловсрол', nameEn: 'Education', icon: 'book', color: '#8B5CF6', type: 'EXPENSE' },
  { name: 'Цэнгэл', nameEn: 'Entertainment', icon: 'film', color: '#F97316', type: 'EXPENSE' },
  { name: 'Хувцас', nameEn: 'Clothing', icon: 'shopping-bag', color: '#14B8A6', type: 'EXPENSE' },
  { name: 'Бусад зарлага', nameEn: 'Other', icon: 'more-horizontal', color: '#6B7280', type: 'EXPENSE' },
]

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() })
    if (exists) throw new ConflictException('И-мэйл бүртгэлтэй байна')

    const hashed = await bcrypt.hash(dto.password, 12)
    const verifyToken = uuidv4()

    const user = await this.userModel.create({
      email: dto.email.toLowerCase(),
      password: hashed,
      name: dto.name,
      emailVerifyToken: verifyToken,
      isEmailVerified: true,
    })

    await this.accountModel.create({
      userId: user._id,
      name: 'Бэлэн мөнгө',
      type: 'CASH',
      currency: 'MNT',
      isDefault: true,
    })

    await this.categoryModel.insertMany(
      DEFAULT_CATEGORIES.map(c => ({ ...c, userId: user._id, isDefault: true }))
    )

    try {
      await this.mailService.sendVerificationEmail(user.email, user.name, verifyToken)
    } catch (_) {}

    return { message: 'Бүртгэл амжилттай.' }
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({ emailVerifyToken: token })
    if (!user) throw new BadRequestException('Буруу баталгаажуулах токен')
    await user.updateOne({ isEmailVerified: true, emailVerifyToken: null })
    return { message: 'И-мэйл амжилттай баталгаажлаа' }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() })
    if (!user) throw new UnauthorizedException('И-мэйл эсвэл нууц үг буруу')

    const isMatch = await bcrypt.compare(dto.password, user.password)
    if (!isMatch) throw new UnauthorizedException('И-мэйл эсвэл нууц үг буруу')

    if (!user.isEmailVerified) throw new UnauthorizedException('И-мэйлээ баталгаажуулна уу')

    return this.generateTokens(user)
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() })
    if (!user) return null
    const isMatch = await bcrypt.compare(password, user.password)
    return isMatch ? user : null
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      })
      const user = await this.userModel.findById(payload.sub)
      if (!user || user.refreshToken !== token) throw new Error()
      return this.generateTokens(user)
    } catch {
      throw new UnauthorizedException('Буруу refresh token')
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null })
    return { message: 'Гарлаа' }
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() })
    if (!user) return { message: 'Хэрэв бүртгэлтэй бол имэйл илгээнэ' }
    const token = uuidv4()
    await user.updateOne({ resetPasswordToken: token, resetPasswordExpiry: new Date(Date.now() + 3600000) })
    try { await this.mailService.sendPasswordResetEmail(user.email, user.name, token) } catch (_) {}
    return { message: 'Нууц үг шинэчлэх холбоос илгээлээ' }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    })
    if (!user) throw new BadRequestException('Токен дууссан эсвэл буруу байна')
    const hashed = await bcrypt.hash(newPassword, 12)
    await user.updateOne({ password: hashed, resetPasswordToken: null, resetPasswordExpiry: null })
    return { message: 'Нууц үг амжилттай шинэчлэгдлээ' }
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role }
    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })
    await user.updateOne({ refreshToken })
    return {
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    }
  }
}
