import type { Metadata } from "next";
import { DemoNotice } from "@/components/admin/DemoNotice";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import { isDemoMode } from "@/lib/services";
import { AuthLayout } from "@/components/admin/AuthLayout";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (isDemoMode) return <DemoNotice />;
  const { error } = await searchParams;
  return (
    <AuthLayout title="Forgot password?" description="Enter your account email and we will send you a link to choose a new password.">
      <ForgotPasswordForm
        notice={
          error === "other-browser"
            ? "That link was opened in a different browser or device from the one that asked for it. Choose \"I already have a code\" and type the code from the email instead, or request a new email from this browser."
            : error === "expired"
              ? "That reset link is invalid or has expired. Please request a new one."
              : undefined
        }
      />
    </AuthLayout>
  );
}
