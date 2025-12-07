import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ResultRecord } from '@/lib/types';

export async function GET() {
  try {
    // 获取所有计算结果
    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .order('employee_name', { ascending: true });

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 类型断言
    const typedResults = (results || []) as ResultRecord[];

    // 计算汇总信息
    const totalEmployees = typedResults.length;
    const totalCompanyFee = typedResults.reduce(
      (sum, r) => sum + Number(r.company_fee),
      0
    );

    const cityName = typedResults.length > 0 ? typedResults[0].city_name : '';
    const year = typedResults.length > 0 ? typedResults[0].year : 0;

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
