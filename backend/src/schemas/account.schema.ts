import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AccountDocument = Account & Document

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ default: 'CASH', enum: ['CASH', 'BANK', 'CARD', 'EWALLET'] })
  type: string

  @Prop({ default: 'MNT', enum: ['MNT', 'USD', 'EUR'] })
  currency: string

  @Prop({ default: 0 })
  balance: number

  @Prop({ default: '#3B82F6' })
  color: string

  @Prop({ default: 'wallet' })
  icon: string

  @Prop({ default: false })
  isDefault: boolean
}

export const AccountSchema = SchemaFactory.createForClass(Account)
