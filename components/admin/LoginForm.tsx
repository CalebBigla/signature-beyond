"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/admin/actions";
import { PasswordInput } from "./PasswordInput";
import { btn, inputClass as input } from "./ui";

export function LoginForm({ notice, success }: { notice?: string; success?: string }) {
  const [state, action, pending] = useActionState(login, { error: "" });
  const error = state.error || notice;
  return (
    <form action={action} className="space-y-4">
      {success && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{success}</p>}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={input} />
      </div>
      <PasswordInput id="password" name="password" label="Password" autoComplete="current-password" />
      <div className="text-right">
        <Link href="/admin/forgot-password" className="text-sm underline">Forgot password?</Link>
      </div>
      <button type="submit" disabled={pending} className={`${btn("primary")} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </form>
  );
}
