"use client";
import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/lib/admin/actions";

const initial: FormState = { ok: false, message: "" };

export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-xs text-stone-600">Your account email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={pending} className="w-full rounded bg-ink px-5 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Sending..." : "Send reset link"}
      </button>
      {(state.message || notice) && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>{state.message || notice}</p>
      )}
      <p className="text-center text-sm"><Link href="/admin/login" className="underline">Back to sign in</Link></p>
    </form>
  );
}
