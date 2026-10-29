"use client";
import { useActionState, useEffect, useRef } from "react";
import { sendEnquiry, type EnquiryState } from "@/app/(site)/contact/actions";
import { buttonClass } from "@/components/ui/Button";

const initial: EnquiryState = { ok: false, message: "" };
const input =
  "block min-h-11 w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2.5 text-body text-ink placeholder:text-stone-500 focus:border-ink focus:outline-none focus:ring-0 aria-[invalid=true]:border-red-700";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-2 text-caption text-red-700">{error}</p>}
    </div>
  );
}

export function EnquiryForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, action, pending] = useActionState(sendEnquiry, initial);
  const e = state.errors ?? {};
  const statusRef = useRef<HTMLDivElement>(null);

  // Move focus to the result so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (state.message) statusRef.current?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border-t border-brand pt-10 focus:outline-none">
        <p className="eyebrow">Message sent</p>
        <h2 className="mt-4 font-serif text-h2 font-medium">Thank you.</h2>
        <p className="mt-5 max-w-md text-body text-stone-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8" noValidate>
      <h2 className="font-serif text-h2 font-medium">Send a message</h2>

      {state.message && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 focus:outline-none">
          {state.message}
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
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
          <input id="subject" name="subject" defaultValue={defaultSubject} maxLength={200} className={input} />
        </Field>
      </div>
      <Field id="message" label="Message" error={e.message}>
        <textarea id="message" name="message" rows={5} required className={`${input} resize-y`} aria-describedby={e.message ? "message-error" : undefined} aria-invalid={Boolean(e.message)} />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
