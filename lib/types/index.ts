// 数据库表记录类型

export interface CityRecord {
  id?: number;
  city_name: string;
  year: number;
  base_min: number;
  base_max: number;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryRecord {
  id?: number;
  employee_id: string;
  employee_name: string;
  month: number;
  salary_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface ResultRecord {
  id?: number;
  employee_id: string;
  employee_name: string;
  year: number;
  city_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
  calculated_at?: string;
}

// Excel 解析后的数据类型

export interface CityExcelRow {
  city_name: string;
  year: string | number;
  base_min: string | number;
  base_max: string | number;
  rate: string | number;
}

export interface SalaryExcelRow {
  employee_id: string | number;
  employee_name: string;
  month: string | number;
  salary_amount: string | number;
}

// API 响应类型

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

// 验证结果类型

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 年份验证结果类型

export interface YearValidationResult {
  isValid: boolean;
  cityYear?: number;
  salaryYears?: number[];
  mismatchedYears?: number[];
  error?: string;
}

// 员工工资数据类型

export interface EmployeeSalaryData {
  employee_id: string;
  employee_name: string;
  salaries: number[];
  monthCount: number;
  avgSalary: number;
}

// 计算结果数据类型

export interface CalculationData {
  employeesProcessed: number;
  totalCompanyFee: number;
  cityName: string;
  year: number;
  calculationTime?: string;
}

// 错误代码枚举

export enum ErrorCode {
  // 文件相关
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_PARSE_ERROR = 'FILE_PARSE_ERROR',

  // 数据验证
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_COLUMNS = 'MISSING_REQUIRED_COLUMNS',

  // 业务逻辑
  YEAR_MISMATCH = 'YEAR_MISMATCH',
  DATA_MISSING = 'DATA_MISSING',
  CALCULATION_ERROR = 'CALCULATION_ERROR',

  // 数据库
  DATABASE_ERROR = 'DATABASE_ERROR',
  INSERT_FAILED = 'INSERT_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',

  // 系统
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
