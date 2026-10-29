import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// The password-reset email link lands here. It swaps the one-time code for a short login session,
// then sends the person to the "choose a new password" page. Two link styles are supported:
//  - ?token_hash=...&type=recovery  (works in any browser; see docs/SUPABASE_SETUP.md, email template)
//  - ?code=...                      (Supabase's default link; must be opened in the browser that asked for it)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "recovery") as EmailOtpType;
  const db = await createClient();

  if (tokenHash) {
    const { error } = await db.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/admin/reset-password`);
  } else if (code) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin/reset-password`);
    // A code opened in another browser or device cannot be exchanged here.
    return NextResponse.redirect(`${origin}/admin/forgot-password?error=other-browser`);
  }
  return NextResponse.redirect(`${origin}/admin/forgot-password?error=expired`);
}
