import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The password-reset email link lands here. It swaps the one-time code for a short login session,
// then sends the person to the "choose a new password" page.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const db = await createClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin/reset-password`);
  }
  return NextResponse.redirect(`${origin}/admin/forgot-password?error=expired`);
}
