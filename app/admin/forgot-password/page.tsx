import type { Metadata } from "next";
import { DemoNotice } from "@/components/admin/DemoNotice";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import { isDemoMode } from "@/lib/services";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (isDemoMode) return <DemoNotice />;
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="mb-2 font-serif text-3xl">Forgot password?</h1>
      <p className="mb-6 text-sm text-stone-600">Enter your account email and we will send you a link to choose a new password.</p>
      <ForgotPasswordForm notice={error === "expired" ? "That reset link is invalid or has expired. Please request a new one." : undefined} />
    </div>
  );
}
