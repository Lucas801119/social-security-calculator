/**
 * 计算公司应缴金额
 * @param contributionBase - 缴费基数
 * @param rate - 综合缴纳比例
 * @returns 公司应缴金额
 */
export function calculateCompanyFee(
  contributionBase: number,
  rate: number
): number {
  const fee = contributionBase * rate;
  return parseFloat(fee.toFixed(2));
}
