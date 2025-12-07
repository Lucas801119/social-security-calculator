import { createClient } from '@supabase/supabase-js';

// 确保环境变量存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 环境变量');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '已设置' : '未设置');
}

// 创建 Supabase 客户端
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false
    }
  }
);
