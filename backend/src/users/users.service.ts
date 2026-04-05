import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAllShops(): Promise<any[]> {
    const users = await this.userModel
      .find({ role: 'shop' })
      .sort({ createdAt: -1 })
      .exec();
    return users.map((user) => {
      const { passwordHash, ...rest } = user.toObject();
      return rest;
    });
  }

  async createShop(dto: CreateUserDto): Promise<any> {
    const existing = await this.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('اسم المستخدم موجود مسبقاً');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      username: dto.username,
      passwordHash: hashed,
      role: 'shop',
      shopName: dto.shopName || '',
      isActive: true,
    });

    const saved = await user.save();
    const { passwordHash, ...result } = saved.toObject();
    return result;
  }

  async updateShop(
    id: string,
    dto: UpdateUserDto,
  ): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('المتجر غير موجود');
    }

    if (dto.shopName !== undefined) {
      user.shopName = dto.shopName;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const saved = await user.save();
    const { passwordHash, ...result } = saved.toObject();
    return result;
  }

  async toggleActive(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('المتجر غير موجود');
    }

    user.isActive = !user.isActive;
    const saved = await user.save();
    const { passwordHash, ...result } = saved.toObject();
    return result;
  }
}
