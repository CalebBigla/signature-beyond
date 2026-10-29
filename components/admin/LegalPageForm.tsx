"use client";
import Link from "next/link";
import { useActionState } from "react";
import { restoreLegalPage, saveLegalPage, type FormState } from "@/lib/admin/actions";

import { Card, Field, Notice, btn, inputClass as input } from "./ui";
import { ConfirmButton } from "./DeleteButton";
const initial: FormState = { ok: false, message: "" };

interface Props { pageKey: string; title: string; content: string; lastUpdated: string; showDraftNotice: boolean; hasSavedVersion: boolean }

export function LegalPageForm({ pageKey, title, content, lastUpdated, showDraftNotice, hasSavedVersion }: Props) {
  const [state, action, pending] = useActionState(saveLegalPage, initial);

  return (
    <div className="space-y-6">
      <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <input type="hidden" name="_key" value={pageKey} />
        <div className="space-y-6">
          {state.message && <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>}
          <Card title="Page text">
            <div className="space-y-5">
              <Field id="title" label="Page title" required>
                <input id="title" name="title" type="text" defaultValue={title} required className={input} />
              </Field>
              <Field id="content" label="Text" required>
                <textarea id="content" name="content" rows={28} defaultValue={content} required className={`${input} font-mono leading-relaxed`} />
              </Field>

        <details className="rounded-md border border-stone-200 bg-stone-50 p-4 text-sm">
          <summary className="cursor-pointer font-medium">How to format the text</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-stone-600">
            <li>Start a line with <code>## </code> (two hash signs and a space) to make a section heading. Headings are numbered automatically.</li>
            <li>Leave a blank line between paragraphs.</li>
            <li>Type <code>{"{{contact}}"}</code> on its own line to show the gallery&apos;s email, phone and address from Website settings.</li>
            <li>Plain text only. Web code (HTML) is not used and will appear as typed.</li>
            <li>Text in [square brackets] is a reminder that something still needs to be confirmed. Delete the brackets once it is confirmed.</li>
          </ul>
        </details>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Publishing">
            <div className="space-y-4">
              <Field id="last_updated" label="Last updated date" help="Shown on the page. Change it when you change the wording.">
                <input id="last_updated" name="last_updated" type="date" defaultValue={lastUpdated} className={input} />
              </Field>
              <label className="flex items-start gap-3 text-sm text-stone-700">
                <input type="checkbox" name="show_draft_notice" defaultChecked={showDraftNotice} className="mt-0.5 h-4 w-4 rounded border-stone-300" />
                <span>Show the &quot;Draft for review&quot; notice<span className="block text-xs text-stone-500">Untick once the gallery (or a legal adviser) has approved the wording.</span></span>
              </label>
              <button type="submit" disabled={pending} className={`${btn("primary")} w-full`}>{pending ? "Saving…" : "Save changes"}</button>
              <Link href="/admin/legal" className={`${btn("ghost", "sm")} w-full`}>Back to Legal pages</Link>
            </div>
          </Card>
        </div>
      </form>

      {hasSavedVersion && (
        <form action={restoreLegalPage} className="rounded-lg border border-red-200 bg-white p-5 lg:mr-[21.5rem]">
          <input type="hidden" name="_key" value={pageKey} />
          <p className="mb-3 text-sm text-stone-600">Made a mess? This replaces your saved text with the original wording that came with the website.</p>
          <ConfirmButton message="Throw away your edits to this page and go back to the original wording? This cannot be undone." className={btn("danger", "sm")}>Restore original wording</ConfirmButton>
        </form>
      )}
    </div>
  );
}
