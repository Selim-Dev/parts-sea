import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Part } from './part.schema.js';
import { CreatePartDto } from './dto/create-part.dto.js';
import { UpdatePartDto } from './dto/update-part.dto.js';

@Injectable()
export class PartsService {
  constructor(
    @InjectModel(Part.name)
    private readonly partModel: Model<Part>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    brand?: string,
  ): Promise<{ data: Part[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (category) {
      filter.category = category;
    }
    if (brand) {
      filter.brand = brand;
    }
    if (search) {
      filter.$or = [
        { partNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.partModel.find(filter).skip(skip).limit(limit).exec(),
      this.partModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async getDistinctCategories(): Promise<string[]> {
    const categories = await this.partModel
      .distinct('category')
      .where('category')
      .ne('')
      .exec();
    return (categories as string[]).sort();
  }

  async getDistinctBrands(): Promise<string[]> {
    const brands = await this.partModel
      .distinct('brand')
      .where('brand')
      .ne('')
      .exec();
    return (brands as string[]).sort();
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.partModel.findById(id).exec();
    if (!part) {
      throw new NotFoundException('العنصر المطلوب غير موجود');
    }
    return part;
  }

  async create(dto: CreatePartDto): Promise<Part> {
    const existing = await this.partModel
      .findOne({ partNumber: dto.partNumber })
      .exec();
    if (existing) {
      throw new ConflictException('رقم القطعة موجود مسبقاً');
    }
    const part = new this.partModel(dto);
    return part.save();
  }

  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.partModel.findById(id).exec();
    if (!part) {
      throw new NotFoundException('العنصر المطلوب غير موجود');
    }
    Object.assign(part, dto);
    return part.save();
  }
}
