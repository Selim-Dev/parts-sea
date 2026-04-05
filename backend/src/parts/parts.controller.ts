import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { PartsService } from './parts.service.js';
import { ExcelService } from './excel.service.js';
import { CreatePartDto } from './dto/create-part.dto.js';
import { UpdatePartDto } from './dto/update-part.dto.js';

@Controller('parts')
export class PartsController {
  constructor(
    private readonly partsService: PartsService,
    private readonly excelService: ExcelService,
  ) {}

  @Get('categories')
  getCategories() {
    return this.partsService.getDistinctCategories();
  }

  @Get('brands')
  getBrands() {
    return this.partsService.getDistinctBrands();
  }

  @Get('template')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getTemplate(@Res() res: Response) {
    const buffer = this.excelService.generateTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="parts-template.xlsx"');
    res.send(buffer);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.partsService.findAll(pageNum, limitNum, search, category, brand);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return this.partsService.update(id, updatePartDto);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, callback) => {
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        return callback(new BadRequestException('الملف المرفوع ليس ملف Excel صالح'), false);
      }
      
      callback(null, true);
    },
  }))
  @HttpCode(HttpStatus.OK)
  async importParts(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('لم يتم تحميل أي ملف');
    }

    // Parse Excel file
    const rows = await this.excelService.parseExcelFile(file);

    // Validate rows
    const validationResult = this.excelService.validateRows(rows);

    // Import valid rows
    const importSummary = await this.excelService.importParts(validationResult.valid);

    // Combine validation errors with import errors
    const allErrors = [...validationResult.errors, ...importSummary.errors];

    return {
      success: allErrors.length === 0,
      message: `تم استيراد ${importSummary.imported} قطعة، تحديث ${importSummary.updated} قطعة، فشل ${allErrors.length} قطعة`,
      data: {
        totalRows: rows.length,
        imported: importSummary.imported,
        updated: importSummary.updated,
        failed: allErrors.length,
        errors: allErrors,
      },
    };
  }
}
