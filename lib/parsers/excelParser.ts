import * as XLSX from 'xlsx';

export interface ParseResult<T> {
  success: boolean;
  data?: T[];
  rawData?: any[];
  error?: string;
}

/**
 * 通用 Excel 文件解析函数
 * @param file - 上传的 Excel 文件
 * @returns 解析结果，包含 JSON 格式的数据
 */
export async function parseExcelFile(file: File): Promise<ParseResult<any>> {
  try {
    // 1. 读取文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2. 使用 xlsx 库解析
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 3. 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { success: false, error: 'Excel 文件不包含任何工作表' };
    }

    const worksheet = workbook.Sheets[sheetName];

    // 4. 转换为 JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // 将数字转为字符串，保持精度
      defval: null // 空单元格默认值
    });

    if (!rawData || rawData.length === 0) {
      return { success: false, error: 'Excel 文件不包含数据' };
    }

    // 5. 规范化列名（去除首尾空格）
    const data = rawData.map((row: any) => {
      const normalizedRow: any = {};
      for (const key in row) {
        const trimmedKey = key.trim();
        normalizedRow[trimmedKey] = row[key];
      }
      return normalizedRow;
    });

    return { success: true, data };

  } catch (error: any) {
    return {
      success: false,
      error: `Excel 解析失败: ${error.message}`
    };
  }
}

/**
 * 解析 Cities Excel 文件
 */
export async function parseCitiesExcel(file: File): Promise<ParseResult<any>> {
  const parseResult = await parseExcelFile(file);

  if (!parseResult.success || !parseResult.data) {
    return parseResult;
  }

  // 转换数据类型
  try {
    const cities = parseResult.data.map((row: any) => ({
      city_name: String(row.city_name || '').trim(),
      year: parseInt(String(row.year || '0')),
      base_min: parseInt(String(row.base_min || '0')),
      base_max: parseInt(String(row.base_max || '0')),
      rate: parseFloat(String(row.rate || '0'))
    }));

    return { success: true, data: cities, rawData: parseResult.data };
  } catch (error: any) {
    return {
      success: false,
      error: `数据类型转换失败: ${error.message}`,
      rawData: parseResult.data
    };
  }
}

/**
 * 解析 Salaries Excel 文件
 */
export async function parseSalariesExcel(file: File): Promise<ParseResult<any>> {
  const parseResult = await parseExcelFile(file);

  if (!parseResult.success || !parseResult.data) {
    return parseResult;
  }

  // 转换数据类型
  try {
    const salaries = parseResult.data.map((row: any) => ({
      employee_id: String(row.employee_id || '').trim(),
      employee_name: String(row.employee_name || '').trim(),
      month: parseInt(String(row.month || '0')),
      salary_amount: parseFloat(String(row.salary_amount || '0'))
    }));

    return { success: true, data: salaries };
  } catch (error: any) {
    return {
      success: false,
      error: `数据类型转换失败: ${error.message}`
    };
  }
}
