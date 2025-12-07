import { supabase } from '../supabase';
import { validateYearConsistency } from '../validation/yearValidator';
import { calculateAverageSalaries } from '../calculators/salaryCalculator';
import { calculateContributionBase } from '../calculators/baseCalculator';
import { calculateCompanyFee } from '../calculators/feeCalculator';
import type { ApiResponse, CalculationData } from '../types';

/**
 * 执行完整的五险一金计算流程
 */
export async function executeCalculation(): Promise<ApiResponse<CalculationData>> {
  try {
    // 步骤 1: 验证年份一致性
    console.log('[计算服务] 步骤 1: 验证年份一致性...');
    const yearValidation = await validateYearConsistency();

    if (!yearValidation.isValid) {
      return {
        success: false,
        error: 'YEAR_MISMATCH',
        message: '年份不匹配，需要重新上传数据',
        details: yearValidation
      };
    }

    console.log('[计算服务] 年份验证通过:', yearValidation.cityYear);

    // 步骤 2: 读取城市标准
    console.log('[计算服务] 步骤 2: 读取城市社保标准...');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1)
      .single();

    if (citiesError || !cities) {
      return {
        success: false,
        error: 'DATA_MISSING',
        message: '未找到城市数据',
        details: { error: citiesError?.message }
      };
    }

    const { city_name, year, base_min, base_max, rate } = cities;
    console.log(`[计算服务] 城市标准: ${city_name} (${year}), 基数范围: ${base_min}-${base_max}, 费率: ${rate}`);

    // 步骤 3: 读取所有工资数据
    console.log('[计算服务] 步骤 3: 读取员工工资数据...');
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('*');

    if (salariesError || !salaries || salaries.length === 0) {
      return {
        success: false,
        error: 'DATA_MISSING',
        message: '未找到工资数据',
        details: { error: salariesError?.message }
      };
    }

    console.log(`[计算服务] 获取到 ${salaries.length} 条工资记录`);

    // 步骤 4: 计算每位员工的平均工资
    console.log('[计算服务] 步骤 4: 计算平均工资...');
    const employeeData = calculateAverageSalaries(salaries);
    console.log(`[计算服务] 共 ${employeeData.length} 位员工`);

    // 步骤 5: 计算缴费基数和公司应缴金额
    console.log('[计算服务] 步骤 5: 计算缴费基数和应缴金额...');
    const results = employeeData.map(emp => {
      const contributionBase = calculateContributionBase(
        emp.avgSalary,
        base_min,
        base_max
      );

      const companyFee = calculateCompanyFee(contributionBase, rate);

      return {
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        year: year,
        city_name: city_name,
        avg_salary: emp.avgSalary,
        contribution_base: contributionBase,
        company_fee: companyFee
      };
    });

    // 步骤 6: 清空 results 表
    console.log('[计算服务] 步骤 6: 清空旧结果...');
    const { error: deleteError } = await supabase
      .from('results')
      .delete()
      .neq('id', 0); // 删除所有记录

    if (deleteError) {
      throw new Error(`清空结果表失败: ${deleteError.message}`);
    }

    // 步骤 7: 插入新结果
    console.log('[计算服务] 步骤 7: 插入新计算结果...');
    const { error: insertError } = await supabase
      .from('results')
      .insert(results);

    if (insertError) {
      throw new Error(`插入结果失败: ${insertError.message}`);
    }

    // 计算汇总信息
    const totalCompanyFee = results.reduce(
      (sum, r) => sum + r.company_fee,
      0
    );

    console.log('[计算服务] 计算完成！');

    return {
      success: true,
      message: '计算完成',
      data: {
        employeesProcessed: results.length,
        totalCompanyFee: parseFloat(totalCompanyFee.toFixed(2)),
        cityName: city_name,
        year: year,
        calculationTime: new Date().toISOString()
      }
    };

  } catch (error: any) {
    console.error('[计算服务] 错误:', error);
    return {
      success: false,
      error: 'CALCULATION_ERROR',
      message: '计算过程出现错误',
      details: { error: error.message }
    };
  }
}
