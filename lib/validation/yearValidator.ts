import { supabaseServer as supabase } from '../supabase-server';
import type { YearValidationResult } from '../types';

/**
 * 验证城市年份与工资年份是否匹配
 */
export async function validateYearConsistency(): Promise<YearValidationResult> {
  try {
    // 1. 获取城市数据
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('year');

    if (citiesError) {
      return {
        isValid: false,
        error: `数据库查询失败: ${citiesError.message}`
      };
    }

    if (!cities || cities.length === 0) {
      return {
        isValid: false,
        error: '未找到城市数据，请先上传 cities.xlsx'
      };
    }

    // 2. 检查 cities 表是否只有一个年份
    const uniqueCityYears = [...new Set(cities.map((c: any) => c.year))];
    if (uniqueCityYears.length > 1) {
      return {
        isValid: false,
        error: `cities 表包含多个年份: ${uniqueCityYears.join(', ')}`
      };
    }

    const cityYear = uniqueCityYears[0];

    // 3. 获取工资数据的年份
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('month');

    if (salariesError) {
      return {
        isValid: false,
        error: `数据库查询失败: ${salariesError.message}`
      };
    }

    if (!salaries || salaries.length === 0) {
      return {
        isValid: false,
        error: '未找到工资数据，请先上传 salaries.xlsx'
      };
    }

    // 4. 提取所有年份
    const salaryYears = salaries.map((s: any) => Math.floor(s.month / 100));
    const uniqueSalaryYears = [...new Set(salaryYears)];

    // 5. 检查是否所有工资年份都匹配城市年份
    const mismatchedYears = uniqueSalaryYears.filter(year => year !== cityYear);

    if (mismatchedYears.length > 0) {
      return {
        isValid: false,
        cityYear,
        salaryYears: uniqueSalaryYears,
        mismatchedYears,
        error: `年份不匹配: 城市年份为 ${cityYear}，但工资数据包含 ${mismatchedYears.join(', ')}`
      };
    }

    return {
      isValid: true,
      cityYear,
      salaryYears: uniqueSalaryYears
    };

  } catch (error: any) {
    return {
      isValid: false,
      error: `年份验证过程出错: ${error.message}`
    };
  }
}
