import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnvironment } from "@/lib/env";

export function getSupabaseServerClient() {
  const { url, serviceRoleKey } = getSupabaseEnvironment();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
