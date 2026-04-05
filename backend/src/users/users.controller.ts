import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAllShops() {
    return this.usersService.findAllShops();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createShop(@Body() dto: CreateUserDto) {
    return this.usersService.createShop(dto);
  }

  @Put(':id')
  updateShop(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateShop(id, dto);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
