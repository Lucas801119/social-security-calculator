import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // 计算汇总信息
    const totalEmployees = results?.length || 0;
    const totalCompanyFee = results?.reduce(
      (sum, r) => sum + Number(r.company_fee),
      0
    ) || 0;

    const cityName = results && results.length > 0 ? results[0].city_name : '';
    const year = results && results.length > 0 ? results[0].year : 0;

    return NextResponse.json({
      success: true,
      data: {
        results: results || [],
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
