import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category, CategoryDocument } from '../schemas/category.schema'
import { CreateCategoryDto } from './dto/create-category.dto'

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async findAll(userId: string) {
    const cats = await this.categoryModel
      .find({ $or: [{ userId }, { userId: null }] })
      .sort({ isDefault: -1, name: 1 })
    return cats.map(c => ({ ...c.toObject(), id: c._id.toString() }))
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const cat = await this.categoryModel.create({ ...dto, userId })
    return { ...cat.toObject(), id: cat._id.toString() }
  }

  async remove(userId: string, id: string) {
    await this.categoryModel.deleteOne({ _id: id, userId })
    return { message: 'Ангилал устгагдлаа' }
  }
}
