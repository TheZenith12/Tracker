import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type BudgetDocument = Budget & Document

@Schema({ timestamps: true })
export class Budget {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId

  @Prop({ required: true })
  month: number

  @Prop({ required: true })
  year: number

  @Prop({ required: true })
  limit: number

  @Prop({ default: 'MNT', enum: ['MNT', 'USD', 'EUR'] })
  currency: string
}

export const BudgetSchema = SchemaFactory.createForClass(Budget)
BudgetSchema.index({ userId: 1, categoryId: 1, month: 1, year: 1 }, { unique: true })
