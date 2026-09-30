import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase's password-reset (and email-confirm) links redirect here with a
// ?code=. Exchange it for a session, then continue to the real page.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
