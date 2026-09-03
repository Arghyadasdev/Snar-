import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// For public, non-personalized reads only (catalog, homepage content, FAQs).
// Doesn't touch cookies, and tags every request for Next's Data Cache so
// repeat page loads within the window are served without hitting Supabase.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, next: { revalidate: 60 } }),
      },
    }
  );
}
