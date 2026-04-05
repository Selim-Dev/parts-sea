import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Part } from './part.schema.js';

interface ParsedRow {
  partNumber: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
  brand?: string;
}

export interface RowError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface ValidationResult {
  valid: ParsedRow[];
  errors: RowError[];
}

interface ImportSummary {
  totalRows: number;
  imported: number;
  updated: number;
  failed: number;
  errors: RowError[];
}

@Injectable()
export class ExcelService {
  constructor(
    @InjectModel(Part.name)
    private readonly partModel: Model<Part>,
  ) {}

  /**
   * Parse Excel file and extract rows
   */
  async parseExcelFile(file: any): Promise<ParsedRow[]> {
    if (!file) {
      throw new BadRequestException('لم يتم تحميل أي ملف');
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      throw new BadRequestException('الملف المرفوع ليس ملف Excel صالح');
    }

    try {
      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('ملف Excel فارغ - لا توجد بيانات للاستيراد');
      }

      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawRows = XLSX.utils.sheet_to_json(worksheet);
      
      if (!rawRows || rawRows.length === 0) {
        throw new BadRequestException('ملف Excel فارغ - لا توجد بيانات للاستيراد');
      }

      return rawRows as ParsedRow[];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('فشل في قراءة ملف Excel - تأكد من صحة الملف');
    }
  }

  /**
   * Validate a single row
   */
  validateRow(row: any, rowNumber: number): { isValid: boolean; errors: RowError[] } {
    const errors: RowError[] = [];

    // Map Arabic column names to English field names
    const partNumber = row['رقم القطعة'] || row.partNumber;
    const name = row['الاسم'] || row.name;
    const price = row['السعر'] || row.price;
    const stock = row['المخزون'] || row.stock;

    // Check required field: partNumber
    if (!partNumber || String(partNumber).trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'partNumber',
        message: 'رقم القطعة مطلوب',
        value: partNumber,
      });
    }

    // Check required field: name
    if (!name || String(name).trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'اسم القطعة مطلوب',
        value: name,
      });
    }

    // Check required field: price
    if (price === undefined || price === null || price === '') {
      errors.push({
        row: rowNumber,
        field: 'price',
        message: 'السعر مطلوب',
        value: price,
      });
    } else {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.push({
          row: rowNumber,
          field: 'price',
          message: 'السعر يجب أن يكون رقم موجب',
          value: price,
        });
      }
    }

    // Check required field: stock
    if (stock === undefined || stock === null || stock === '') {
      errors.push({
        row: rowNumber,
        field: 'stock',
        message: 'المخزون مطلوب',
        value: stock,
      });
    } else {
      const stockNum = Number(stock);
      if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
        errors.push({
          row: rowNumber,
          field: 'stock',
          message: 'المخزون يجب أن يكون رقم صحيح غير سالب',
          value: stock,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate all rows
   */
  validateRows(rows: any[]): ValidationResult {
    const valid: ParsedRow[] = [];
    const errors: RowError[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // Excel rows start at 1, header is row 1
      const validation = this.validateRow(row, rowNumber);

      if (validation.isValid) {
        // Map Arabic column names to English field names
        const parsedRow: ParsedRow = {
          partNumber: String(row['رقم القطعة'] || row.partNumber).trim(),
          name: String(row['الاسم'] || row.name).trim(),
          price: Number(row['السعر'] || row.price),
          stock: Number(row['المخزون'] || row.stock),
          description: row['الوصف'] || row.description || '',
          category: row['التصنيف'] || row.category || '',
          brand: row['الماركة'] || row.brand || '',
        };
        valid.push(parsedRow);
      } else {
        errors.push(...validation.errors);
      }
    });

    return { valid, errors };
  }

  /**
   * Import parts with bulk operations
   */
  async importParts(validRows: ParsedRow[]): Promise<ImportSummary> {
    let imported = 0;
    let updated = 0;
    let failed = 0;
    const errors: RowError[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const rowNumber = i + 2; // Excel rows start at 1, header is row 1

      try {
        // Check if part exists
        const existingPart = await this.partModel.findOne({ partNumber: row.partNumber }).exec();

        if (existingPart) {
          // Update existing part
          await this.partModel.updateOne(
            { partNumber: row.partNumber },
            {
              name: row.name,
              price: row.price,
              stock: row.stock,
              description: row.description || '',
              category: row.category || '',
              brand: row.brand || '',
            }
          ).exec();
          updated++;
        } else {
          // Create new part
          await this.partModel.create({
            partNumber: row.partNumber,
            name: row.name,
            price: row.price,
            stock: row.stock,
            description: row.description || '',
            category: row.category || '',
            brand: row.brand || '',
          });
          imported++;
        }
      } catch (error) {
        failed++;
        errors.push({
          row: rowNumber,
          field: 'general',
          message: `فشل في حفظ البيانات: ${error.message}`,
          value: row.partNumber,
        });
      }
    }

    return {
      totalRows: validRows.length,
      imported,
      updated,
      failed,
      errors,
    };
  }

  /**
   * Generate Excel template with Arabic headers and sample data
   */
  generateTemplate(): Buffer {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Define headers (Arabic)
    const headers = [
      'رقم القطعة',
      'الاسم',
      'السعر',
      'المخزون',
      'الوصف',
      'التصنيف',
      'الماركة',
    ];

    // Sample data row
    const sampleData = [
      'PART-001',
      'قطعة غيار مثال',
      100.50,
      50,
      'وصف القطعة',
      'فئة مثال',
      'ماركة مثال',
    ];

    // Create worksheet data
    const worksheetData = [headers, sampleData];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // رقم القطعة
      { wch: 25 }, // الاسم
      { wch: 10 }, // السعر
      { wch: 10 }, // المخزون
      { wch: 30 }, // الوصف
      { wch: 15 }, // التصنيف
      { wch: 15 }, // الماركة
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'القطع');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }
}
