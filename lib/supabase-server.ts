import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 延迟初始化的 Supabase 客户端
let _supabaseServer: SupabaseClient | null = null;

function getSupabaseServer(): SupabaseClient {
  // 如果已经初始化过，直接返回
  if (_supabaseServer) {
    return _supabaseServer;
  }

  // 获取环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 运行时验证环境变量
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 环境变量未设置。请在 Vercel 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // 创建并缓存客户端
  _supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return _supabaseServer;
}

// 导出一个 Proxy 对象，使其看起来像 SupabaseClient
// 但实际上会延迟初始化
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServer();
    return (client as any)[prop];
  }
});
