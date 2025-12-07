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

  // 详细的环境变量调试日志
  console.log('[Supabase Server] 环境变量检查:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `已设置 (${supabaseUrl.substring(0, 20)}...)` : '未设置');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `已设置 (长度: ${supabaseAnonKey.length})` : '未设置');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- VERCEL:', process.env.VERCEL);

  // 运行时验证环境变量
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = `Supabase 环境变量未设置。URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`;
    console.error('[Supabase Server] 错误:', errorMsg);
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
