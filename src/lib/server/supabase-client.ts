import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only reads/writes. NEXT_PUBLIC_SUPABASE_URL
// is safe to expose (it's just the project endpoint), but
// SUPABASE_SERVICE_ROLE_KEY bypasses RLS and must never reach the client
// bundle — this module is guarded by the "server-only" import above and
// must not be imported from client components.
let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}
