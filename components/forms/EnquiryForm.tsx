"use client";
import { useActionState } from "react";
import { sendEnquiry, type EnquiryState } from "@/app/(site)/contact/actions";

const initial: EnquiryState = { ok: false, message: "" };
const input = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-stone-600">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function EnquiryForm() {
  const [state, action, pending] = useActionState(sendEnquiry, initial);
  const e = state.errors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <h2 className="font-serif text-2xl">Send a message</h2>
      <Field id="name" label="Name" error={e.name}>
        <input id="name" name="name" required autoComplete="name" className={input} aria-describedby={e.name ? "name-error" : undefined} aria-invalid={Boolean(e.name)} />
      </Field>
      <Field id="email" label="Email" error={e.email}>
        <input id="email" name="email" type="email" required autoComplete="email" className={input} aria-describedby={e.email ? "email-error" : undefined} aria-invalid={Boolean(e.email)} />
      </Field>
      <Field id="phone" label="Phone (optional)">
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={input} />
      </Field>
      <Field id="subject" label="Subject (optional)">
        <input id="subject" name="subject" className={input} />
      </Field>
      <Field id="message" label="Message" error={e.message}>
        <textarea id="message" name="message" rows={5} required className={input} aria-describedby={e.message ? "message-error" : undefined} aria-invalid={Boolean(e.message)} />
      </Field>
      <button type="submit" disabled={pending} className="rounded bg-ink px-5 py-3 text-sm text-white disabled:opacity-60">
        {pending ? "Sending..." : "Send message"}
      </button>
      {state.message && (
        <p role="status" className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>{state.message}</p>
      )}
    </form>
  );
}
