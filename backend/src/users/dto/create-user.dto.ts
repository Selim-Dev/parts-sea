import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @IsOptional()
  shopName?: string;
}
