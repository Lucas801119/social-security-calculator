import { createClient } from '@supabase/supabase-js';

// 服务端专用的 Supabase 客户端
// 使用 NEXT_PUBLIC_ 前缀的变量在服务端和客户端都可用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 在运行时验证环境变量（不在构建时验证）
if (typeof window === 'undefined') {
  // 服务端环境：只在实际调用时才会检查
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('警告: Supabase 环境变量未设置，API 调用将失败');
  }
}

// 创建服务端 Supabase 客户端
// 使用空字符串作为后备值，允许构建通过
export const supabaseServer = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
