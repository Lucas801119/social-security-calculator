import { createClient } from '@supabase/supabase-js';

// 服务端专用的 Supabase 客户端
// 使用 NEXT_PUBLIC_ 前缀的变量在服务端和客户端都可用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量');
}

// 创建服务端 Supabase 客户端
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
