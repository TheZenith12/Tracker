import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  name: string

  @Prop({ default: 'USER', enum: ['USER', 'ADMIN'] })
  role: string

  @Prop({ default: false })
  isEmailVerified: boolean

  @Prop()
  emailVerifyToken: string

  @Prop()
  resetPasswordToken: string

  @Prop()
  resetPasswordExpiry: Date

  @Prop()
  refreshToken: string
}

export const UserSchema = SchemaFactory.createForClass(User)
