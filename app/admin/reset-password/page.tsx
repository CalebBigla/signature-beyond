import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice } from "@/components/admin/DemoNotice";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { isDemoMode } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { AuthLayout } from "@/components/admin/AuthLayout";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default async function ResetPasswordPage() {
  if (isDemoMode) return <DemoNotice />;
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  return (
    <AuthLayout title="Choose a new password">
      {user ? (
        <ResetPasswordForm />
      ) : (
        <p className="text-sm">
          This reset link is invalid or has expired.{" "}
          <Link href="/admin/forgot-password" className="underline">Request a new one</Link>.
        </p>
      )}
    </AuthLayout>
  );
}
