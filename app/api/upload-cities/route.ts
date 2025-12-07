import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseCitiesExcel } from '@/lib/parsers/excelParser';
import { validateExcelFile, validateCitiesData } from '@/lib/validation/excelValidator';

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
    const parseResult = await parseCitiesExcel(file);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({
        success: false,
        error: 'FILE_PARSE_ERROR',
        message: parseResult.error || 'Excel 解析失败'
      }, { status: 400 });
    }

    // Debug: 记录解析后的数据
    console.log('解析后的数据条数:', parseResult.data.length);
    console.log('第一行数据:', JSON.stringify(parseResult.data[0], null, 2));
    if (parseResult.rawData && parseResult.rawData.length > 0) {
      console.log('原始数据第一行:', JSON.stringify(parseResult.rawData[0], null, 2));
      console.log('原始数据列名:', Object.keys(parseResult.rawData[0]));
    }

    // 4. 验证数据
    const dataValidation = validateCitiesData(parseResult.data);

    if (!dataValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '数据验证失败',
        details: dataValidation.errors,
        debug: {
          parsedDataSample: parseResult.data[0],
          rawDataSample: parseResult.rawData?.[0],
          columnNames: parseResult.rawData && parseResult.rawData.length > 0 ? Object.keys(parseResult.rawData[0]) : []
        }
      }, { status: 400 });
    }

    // 5. 清空旧数据
    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      throw new Error(`清空旧数据失败: ${deleteError.message}`);
    }

    // 6. 插入新数据
    const { error: insertError } = await supabase
      .from('cities')
      .insert(parseResult.data as any);

    if (insertError) {
      throw new Error(`插入数据失败: ${insertError.message}`);
    }

    // 7. 返回成功
    return NextResponse.json({
      success: true,
      message: '城市数据上传成功',
      data: {
        recordsInserted: parseResult.data.length,
        cityName: parseResult.data[0].city_name,
        year: parseResult.data[0].year
      }
    });

  } catch (error: any) {
    console.error('[Upload Cities Error]', error);

    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误',
      details: error.message
    }, { status: 500 });
  }
}
