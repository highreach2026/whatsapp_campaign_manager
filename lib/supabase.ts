import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("YOUR_PROJECT") &&
    key !== "replace_me" &&
    key !== "replace_me_with_supabase_service_role_secret_key"
  );
}

export function supabaseAdmin() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
  }
  return client;
}

