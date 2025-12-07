import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | undefined;

// 获取 Supabase 客户端（延迟初始化）
export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        '缺少 Supabase 环境变量。请在 .env.local 文件中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// 向后兼容的导出 - 使用 getter 确保延迟执行
export const supabase = {
  get from() {
    return getSupabase().from.bind(getSupabase());
  },
  get auth() {
    return getSupabase().auth;
  },
  get storage() {
    return getSupabase().storage;
  },
  get rpc() {
    return getSupabase().rpc.bind(getSupabase());
  },
  get channel() {
    return getSupabase().channel.bind(getSupabase());
  }
};
