import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  partId: string;

  @IsInt()
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'يجب إضافة قطعة واحدة على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
