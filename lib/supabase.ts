import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '缺少 Supabase 环境变量。请在 .env.local 文件中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// 默认导出
export const supabase = getSupabaseClient();
