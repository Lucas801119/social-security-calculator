import { NextResponse } from 'next/server';
import { executeCalculation } from '@/lib/services/calculationService';

export async function POST() {
  try {
    const result = await executeCalculation();

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Calculate API Error]', error);

    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误',
      details: error.message
    }, { status: 500 });
  }
}
