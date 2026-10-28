"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/admin/actions";
import { PasswordInput } from "./PasswordInput";

const input = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";

export function LoginForm({ notice, success }: { notice?: string; success?: string }) {
  const [state, action, pending] = useActionState(login, { error: "" });
  const error = state.error || notice;
  return (
    <form action={action} className="space-y-4">
      {success && <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">{success}</p>}
      <div>
        <label htmlFor="email" className="mb-1 block text-xs text-stone-600">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={input} />
      </div>
      <PasswordInput id="password" name="password" label="Password" autoComplete="current-password" />
      <div className="text-right">
        <Link href="/admin/forgot-password" className="text-sm underline">Forgot password?</Link>
      </div>
      <button type="submit" disabled={pending} className="w-full rounded bg-ink px-5 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
