import { IsString, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['approved', 'preparing', 'ready', 'delivered'], { message: 'حالة غير صالحة' })
  status: string;
}
