import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TransactionDocument = Transaction & Document

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Account' })
  fromAccountId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Account', default: null })
  toAccountId: Types.ObjectId | null

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId | null

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE', 'TRANSFER'] })
  type: string

  @Prop({ required: true })
  amount: number

  @Prop({ default: 'MNT', enum: ['MNT', 'USD', 'EUR'] })
  currency: string

  @Prop()
  description: string

  @Prop()
  note: string

  @Prop({ required: true })
  date: Date

  @Prop({ default: false })
  isRecurring: boolean

  @Prop({ type: Types.ObjectId, ref: 'Recurring', default: null })
  recurringId: Types.ObjectId | null
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ fromAccountId: 1 })
TransactionSchema.index({ categoryId: 1 })
