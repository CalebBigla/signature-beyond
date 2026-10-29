import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { DemoNotice } from "@/components/admin/DemoNotice";
import { AuthLayout } from "@/components/admin/AuthLayout";
import { isDemoMode } from "@/lib/services";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; detail?: string; reset?: string }> }) {
  if (isDemoMode) return <DemoNotice />;
  const { error, detail, reset } = await searchParams;
  const notice =
    error === "not-admin" ? "This account is not an administrator. See docs/SUPABASE_SETUP.md, step 4."
    : error === "profile-error" ? `Could not check admin access: ${detail ?? "unknown error"}`
    : undefined;
  return (
    <AuthLayout title="Sign in" description="Sign in to manage the Signature Beyond website.">
      <LoginForm notice={notice} success={reset === "1" ? "Your password was updated. Please sign in with the new password." : undefined} />
    </AuthLayout>
  );
}
