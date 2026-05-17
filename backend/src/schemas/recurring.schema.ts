import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type RecurringDocument = Recurring & Document

@Schema({ timestamps: true })
export class Recurring {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  amount: number

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE', 'TRANSFER'] })
  type: string

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId | null

  @Prop({ required: true, type: Types.ObjectId, ref: 'Account' })
  accountId: Types.ObjectId

  @Prop({ default: 'MONTHLY', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] })
  frequency: string

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  nextDate: Date

  @Prop()
  endDate: Date

  @Prop({ default: false })
  isPaused: boolean
}

export const RecurringSchema = SchemaFactory.createForClass(Recurring)
