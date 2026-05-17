import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../schemas/user.schema'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password -refreshToken -emailVerifyToken -resetPasswordToken -resetPasswordExpiry')
    if (!user) throw new NotFoundException('Хэрэглэгч олдсонгүй')
    return { id: user._id.toString(), email: user.email, name: user.name, role: user.role, createdAt: (user as any).createdAt }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true }).select('email name')
    return { id: user._id.toString(), email: user.email, name: user.name }
  }

  async findById(userId: string) {
    return this.userModel.findById(userId)
  }
}
