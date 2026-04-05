import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @MinLength(4)
  @IsOptional()
  password?: string;
}
