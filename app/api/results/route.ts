import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import type { ResultRecord } from '@/lib/types';

export async function GET() {
  try {
    // 获取所有计算结果
    const response = await supabase
      .from('results')
      .select('*')
      .order('employee_name', { ascending: true });

    if (response.error) {
      throw new Error(`查询失败: ${response.error.message}`);
    }

    // 安全的类型转换
    const rawData = response.data;
    const typedResults: ResultRecord[] = [];

    if (rawData && Array.isArray(rawData)) {
      rawData.forEach((item: any) => {
        typedResults.push({
          id: item.id,
          employee_id: item.employee_id,
          employee_name: item.employee_name,
          year: item.year,
          city_name: item.city_name,
          avg_salary: item.avg_salary,
          contribution_base: item.contribution_base,
          company_fee: item.company_fee,
          calculated_at: item.calculated_at
        });
      });
    }

    // 计算汇总信息
    let totalCompanyFee = 0;
    for (const record of typedResults) {
      totalCompanyFee += Number(record.company_fee);
    }

    const totalEmployees = typedResults.length;
    const cityName = typedResults.length > 0 ? String(typedResults[0].city_name) : '';
    const year = typedResults.length > 0 ? Number(typedResults[0].year) : 0;

    return NextResponse.json({
      success: true,
      data: {
        results: typedResults,
        metadata: {
          totalEmployees,
          totalCompanyFee: parseFloat(totalCompanyFee.toFixed(2)),
          cityName,
          year
        }
      }
    });

  } catch (error: any) {
    console.error('[Get Results API Error]', error);

    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误',
      details: error.message
    }, { status: 500 });
  }
}
