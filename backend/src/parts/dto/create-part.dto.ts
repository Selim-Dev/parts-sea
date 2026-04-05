import { IsString, IsNotEmpty, IsNumber, IsInt, IsOptional, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty({ message: 'رقم القطعة مطلوب' })
  partNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'اسم القطعة مطلوب' })
  name: string;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'الكمية يجب أن تكون عدداً صحيحاً' })
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;
}
