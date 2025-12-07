import type { ValidationResult } from '../types';

/**
 * 验证 Excel 文件基本信息
 */
export function validateExcelFile(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 检查文件类型
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    errors.push('文件必须是 .xlsx 或 .xls 格式');
  }

  // 2. 检查文件大小 (限制 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('文件大小不能超过 10MB');
  }

  if (file.size === 0) {
    errors.push('文件为空');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证 Cities 数据
 */
export function validateCitiesData(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 检查是否为空
  if (!data || data.length === 0) {
    errors.push('文件不包含数据');
    return { isValid: false, errors, warnings };
  }

  // 2. 验证必需列
  const requiredColumns = ['city_name', 'year', 'base_min', 'base_max', 'rate'];
  const firstRow = data[0];
  const actualColumns = Object.keys(firstRow);

  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      errors.push(`缺少必需列: ${col}`);
    }
  }

  if (errors.length > 0) {
    errors.push(`实际列名: [${actualColumns.join(', ')}]`);
    errors.push(`需要的列名: [${requiredColumns.join(', ')}]`);
    return { isValid: false, errors, warnings };
  }

  // 3. 验证每行数据
  data.forEach((row, index) => {
    const rowNum = index + 2; // Excel 行号 (从2开始)

    // 验证 city_name
    if (!row.city_name || String(row.city_name).trim() === '') {
      errors.push(`第${rowNum}行: city_name 不能为空`);
    }

    // 验证 year (格式: YYYY)
    const yearStr = String(row.year);
    if (!/^\d{4}$/.test(yearStr)) {
      errors.push(`第${rowNum}行: year 格式不正确，应为4位数字(如2024)`);
    }

    // 验证数值字段
    if (isNaN(Number(row.base_min)) || Number(row.base_min) <= 0) {
      errors.push(`第${rowNum}行: base_min 必须是正数`);
    }

    if (isNaN(Number(row.base_max)) || Number(row.base_max) <= 0) {
      errors.push(`第${rowNum}行: base_max 必须是正数`);
    }

    if (Number(row.base_max) < Number(row.base_min)) {
      errors.push(`第${rowNum}行: base_max 不能小于 base_min`);
    }

    if (isNaN(Number(row.rate)) || Number(row.rate) <= 0 || Number(row.rate) > 1) {
      errors.push(`第${rowNum}行: rate 必须在 0-1 之间`);
    }
  });

  // 4. 检查是否有多个城市或年份
  const uniqueCities = new Set(data.map(r => r.city_name));
  const uniqueYears = new Set(data.map(r => String(r.year)));

  if (uniqueCities.size > 1) {
    warnings.push(`检测到多个城市: ${Array.from(uniqueCities).join(', ')}`);
  }

  if (uniqueYears.size > 1) {
    errors.push(`cities 表只能包含一个年份，当前包含: ${Array.from(uniqueYears).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证 Salaries 数据
 */
export function validateSalariesData(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || data.length === 0) {
    errors.push('文件不包含数据');
    return { isValid: false, errors, warnings };
  }

  const requiredColumns = ['employee_id', 'employee_name', 'month', 'salary_amount'];
  const firstRow = data[0];

  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      errors.push(`缺少必需列: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  const monthSet = new Set();
  const employeeMonthSet = new Set();

  data.forEach((row, index) => {
    const rowNum = index + 2;

    // 验证 employee_id
    if (!row.employee_id || String(row.employee_id).trim() === '') {
      errors.push(`第${rowNum}行: employee_id 不能为空`);
    }

    // 验证 employee_name
    if (!row.employee_name || String(row.employee_name).trim() === '') {
      errors.push(`第${rowNum}行: employee_name 不能为空`);
    }

    // 验证 month (格式: YYYYMM)
    const monthStr = String(row.month);
    if (!/^\d{6}$/.test(monthStr)) {
      errors.push(`第${rowNum}行: month 格式不正确，应为YYYYMM(如202401)`);
    } else {
      monthSet.add(monthStr);

      // 验证月份合法性
      const month = parseInt(monthStr.substring(4, 6));
      if (month < 1 || month > 12) {
        errors.push(`第${rowNum}行: month 中的月份部分不合法(${month})`);
      }

      // 检查重复
      const key = `${row.employee_id}_${monthStr}`;
      if (employeeMonthSet.has(key)) {
        errors.push(`第${rowNum}行: 员工${row.employee_id}在${monthStr}月已有记录（重复）`);
      }
      employeeMonthSet.add(key);
    }

    // 验证 salary_amount
    if (isNaN(Number(row.salary_amount)) || Number(row.salary_amount) < 0) {
      errors.push(`第${rowNum}行: salary_amount 必须是非负数`);
    }
  });

  // 检查月份完整性
  if (monthSet.size < 12) {
    warnings.push(`数据中只包含 ${monthSet.size} 个月，少于一年`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
