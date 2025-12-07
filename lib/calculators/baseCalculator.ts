/**
 * 计算缴费基数
 * @param avgSalary - 年度月平均工资
 * @param baseMin - 社保缴费基数下限
 * @param baseMax - 社保缴费基数上限
 * @returns 最终缴费基数
 */
export function calculateContributionBase(
  avgSalary: number,
  baseMin: number,
  baseMax: number
): number {
  if (avgSalary < baseMin) {
    return parseFloat(baseMin.toFixed(2));
  }
  if (avgSalary > baseMax) {
    return parseFloat(baseMax.toFixed(2));
  }
  return parseFloat(avgSalary.toFixed(2));
}
