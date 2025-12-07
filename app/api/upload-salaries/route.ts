import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSalariesExcel } from '@/lib/parsers/excelParser';
import { validateExcelFile, validateSalariesData } from '@/lib/validation/excelValidator';

export async function POST(request: NextRequest) {
  try {
    // 1. 获取文件
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: '未找到上传文件'
      }, { status: 400 });
    }

    // 2. 验证文件基本信息
    const fileValidation = validateExcelFile(file);
    if (!fileValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: '文件验证失败',
        details: fileValidation.errors
      }, { status: 400 });
    }

    // 3. 解析 Excel
    const parseResult = await parseSalariesExcel(file);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({
        success: false,
        error: 'FILE_PARSE_ERROR',
        message: parseResult.error || 'Excel 解析失败'
      }, { status: 400 });
    }

    // 4. 验证数据
    const dataValidation = validateSalariesData(parseResult.data);

    if (!dataValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '数据验证失败',
        details: dataValidation.errors,
        warnings: dataValidation.warnings
      }, { status: 400 });
    }

    // 5. 清空旧数据
    const { error: deleteError } = await supabase
      .from('salaries')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      throw new Error(`清空旧数据失败: ${deleteError.message}`);
    }

    // 6. 批量插入新数据（分批处理以避免超时）
    const batchSize = 1000;
    for (let i = 0; i < parseResult.data.length; i += batchSize) {
      const batch = parseResult.data.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('salaries')
        .insert(batch as any);

      if (insertError) {
        throw new Error(`插入数据失败: ${insertError.message}`);
      }
    }

    // 7. 统计信息
    const uniqueEmployees = new Set(parseResult.data.map((r: any) => r.employee_id));
    const months = parseResult.data.map((r: any) => r.month);
    const monthRange = `${Math.min(...months)}-${Math.max(...months)}`;

    // 8. 返回成功
    return NextResponse.json({
      success: true,
      message: '工资数据上传成功',
      data: {
        recordsInserted: parseResult.data.length,
        employeeCount: uniqueEmployees.size,
        monthRange: monthRange
      },
      warnings: dataValidation.warnings
    });

  } catch (error: any) {
    console.error('[Upload Salaries Error]', error);

    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误',
      details: error.message
    }, { status: 500 });
  }
}
