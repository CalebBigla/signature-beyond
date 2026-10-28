"use client";
import Link from "next/link";
import { useActionState } from "react";
import { restoreLegalPage, saveLegalPage, type FormState } from "@/lib/admin/actions";

const input = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";
const initial: FormState = { ok: false, message: "" };

interface Props { pageKey: string; title: string; content: string; lastUpdated: string; showDraftNotice: boolean; hasSavedVersion: boolean }

export function LegalPageForm({ pageKey, title, content, lastUpdated, showDraftNotice, hasSavedVersion }: Props) {
  const [state, action, pending] = useActionState(saveLegalPage, initial);

  return (
    <div className="max-w-3xl space-y-8">
      <form action={action} className="space-y-5">
        <input type="hidden" name="_key" value={pageKey} />

        <div>
          <label htmlFor="title" className="mb-1 block text-xs text-stone-600">Page title *</label>
          <input id="title" name="title" type="text" defaultValue={title} required className={input} />
        </div>

        <div>
          <label htmlFor="last_updated" className="mb-1 block text-xs text-stone-600">Last updated date</label>
          <input id="last_updated" name="last_updated" type="date" defaultValue={lastUpdated} className={input} />
          <p className="mt-1 text-xs text-stone-500">Shown on the page. Remember to change it when you change the wording.</p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="show_draft_notice" defaultChecked={showDraftNotice} className="mt-1" />
          <span>Show the &quot;Draft for review&quot; notice at the top of the page<br /><span className="text-xs text-stone-500">Untick this once the gallery (or a legal adviser) has approved the wording.</span></span>
        </label>

        <div>
          <label htmlFor="content" className="mb-1 block text-xs text-stone-600">Page text *</label>
          <textarea id="content" name="content" rows={28} defaultValue={content} required className={`${input} font-mono leading-relaxed`} />
        </div>

        <details className="rounded border border-stone-200 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-medium">How to format the text</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-stone-600">
            <li>Start a line with <code>## </code> (two hash signs and a space) to make a section heading. Headings are numbered automatically.</li>
            <li>Leave a blank line between paragraphs.</li>
            <li>Type <code>{"{{contact}}"}</code> on its own line to show the gallery&apos;s email, phone and address from Website settings.</li>
            <li>Plain text only. Web code (HTML) is not used and will appear as typed.</li>
            <li>Text in [square brackets] is a reminder that something still needs to be confirmed. Delete the brackets once it is confirmed.</li>
          </ul>
        </details>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className="rounded bg-ink px-5 py-2 text-sm text-white disabled:opacity-60">{pending ? "Saving..." : "Save changes"}</button>
          <Link href="/admin/legal" className="text-sm underline">Back to Legal pages</Link>
        </div>
        {state.message && <p role="alert" className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>{state.message}</p>}
      </form>

      {hasSavedVersion && (
        <form
          action={restoreLegalPage}
          onSubmit={(e) => { if (!window.confirm("Throw away your edits to this page and go back to the original wording? This cannot be undone.")) e.preventDefault(); }}
          className="border-t border-stone-200 pt-6"
        >
          <input type="hidden" name="_key" value={pageKey} />
          <p className="mb-2 text-xs text-stone-500">Made a mess? This replaces your saved text with the original wording that came with the website.</p>
          <button type="submit" className="text-sm text-red-700 underline">Restore original wording</button>
        </form>
      )}
    </div>
  );
}
