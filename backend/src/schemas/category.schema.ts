import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CategoryDocument = Category & Document

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId | null

  @Prop({ required: true })
  name: string

  @Prop()
  nameEn: string

  @Prop({ default: 'tag' })
  icon: string

  @Prop({ default: '#6B7280' })
  color: string

  @Prop({ default: 'EXPENSE', enum: ['INCOME', 'EXPENSE', 'TRANSFER'] })
  type: string

  @Prop({ default: false })
  isDefault: boolean
}

export const CategorySchema = SchemaFactory.createForClass(Category)
