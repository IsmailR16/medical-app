import { createClient } from "@supabase/supabase-js";

// Server-side client using service role key — bypasses RLS.
// Use ONLY in API routes / webhooks, never expose to the client.
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
