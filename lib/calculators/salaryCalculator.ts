import type { SalaryRecord, EmployeeSalaryData } from '../types';

/**
 * 按员工分组并计算平均工资
 */
export function calculateAverageSalaries(salaries: SalaryRecord[]): EmployeeSalaryData[] {
  // 1. 按 employee_id 和 employee_name 分组
  const grouped = new Map<string, { id: string; name: string; amounts: number[] }>();

  for (const record of salaries) {
    const key = record.employee_id;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: record.employee_id,
        name: record.employee_name,
        amounts: []
      });
    }
    grouped.get(key)!.amounts.push(record.salary_amount);
  }

  // 2. 计算每位员工的平均工资
  const results: EmployeeSalaryData[] = [];

  for (const [_, employeeData] of grouped.entries()) {
    const totalSalary = employeeData.amounts.reduce((sum, amount) => sum + amount, 0);
    const monthCount = employeeData.amounts.length;
    const avgSalary = totalSalary / monthCount;

    results.push({
      employee_id: employeeData.id,
      employee_name: employeeData.name,
      salaries: employeeData.amounts,
      monthCount,
      avgSalary: parseFloat(avgSalary.toFixed(2))
    });
  }

  return results;
}
