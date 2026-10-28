"use client";
import { useActionState } from "react";
import { updatePassword } from "@/lib/admin/actions";
import { PasswordInput } from "./PasswordInput";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, { error: "" });
  return (
    <form action={action} className="space-y-4">
      <PasswordInput id="password" name="password" label="New password (at least 8 characters)" autoComplete="new-password" minLength={8} />
      <PasswordInput id="confirm" name="confirm" label="Confirm new password" autoComplete="new-password" minLength={8} />
      <button type="submit" disabled={pending} className="w-full rounded bg-ink px-5 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Saving..." : "Set new password"}
      </button>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
