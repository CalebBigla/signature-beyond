"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset, verifyResetCode, type FormState } from "@/lib/admin/actions";
import { btn, inputClass, Notice } from "./ui";

const initial: FormState = { ok: false, message: "" };
const label = "mb-1.5 block text-sm font-medium text-stone-700";

/** Step 1: send the reset email. Step 2: type the code from the email (or click the link in it). */
export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [sent, sendAction, sending] = useActionState(requestPasswordReset, initial);
  const [checked, verifyAction, verifying] = useActionState(verifyResetCode, initial);
  const [email, setEmail] = useState("");
  const [haveCode, setHaveCode] = useState(false);
  const step2 = sent.ok || haveCode;

  return (
    <div className="space-y-6">
      {notice && !sent.message && <Notice tone="error">{notice}</Notice>}

      {!step2 ? (
        <form action={sendAction} className="space-y-4">
          <div>
            <label htmlFor="email" className={label}>Your account email</label>
            <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={sending} className={`${btn("primary")} w-full`}>{sending ? "Sending…" : "Send reset email"}</button>
          {sent.message && !sent.ok && <Notice tone="error">{sent.message}</Notice>}
          <button type="button" onClick={() => setHaveCode(true)} className="w-full text-center text-sm text-stone-600 underline">I already have a code</button>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4">
          {sent.ok && <Notice tone="success">{sent.message} Type the code from the email below, or click the link in it.</Notice>}
          <div>
            <label htmlFor="reset-email" className={label}>Email</label>
            <input id="reset-email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="code" className={label}>Code from the email</label>
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="123456" className={`${inputClass} text-lg tracking-[0.3em]`} />
          </div>
          <button type="submit" disabled={verifying} className={`${btn("primary")} w-full`}>{verifying ? "Checking…" : "Continue"}</button>
          {checked.message && <Notice tone="error">{checked.message}</Notice>}
          <button type="button" onClick={() => setHaveCode(false)} className="w-full text-center text-sm text-stone-600 underline">Send a new email</button>
        </form>
      )}

      <p className="text-center text-sm"><Link href="/admin/login" className="underline">Back to sign in</Link></p>
    </div>
  );
}
