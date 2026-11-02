
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error("Supabase 环境变量尚未配置");
  }

  return createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
