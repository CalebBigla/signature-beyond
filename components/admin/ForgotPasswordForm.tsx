"use client";
import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/lib/admin/actions";
import { btn, inputClass } from "./ui";

const initial: FormState = { ok: false, message: "" };

export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">Your account email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      <button type="submit" disabled={pending} className={`${btn("primary")} w-full`}>
        {pending ? "Sending..." : "Send reset link"}
      </button>
      {(state.message || notice) && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>{state.message || notice}</p>
      )}
      <p className="text-center text-sm"><Link href="/admin/login" className="underline">Back to sign in</Link></p>
    </form>
  );
}
