import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Part, PartSchema } from './part.schema.js';
import { PartsService } from './parts.service.js';
import { ExcelService } from './excel.service.js';
import { PartsController } from './parts.controller.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Part.name, schema: PartSchema }])],
  controllers: [PartsController],
  providers: [PartsService, ExcelService],
  exports: [PartsService],
})
export class PartsModule {}
