import { AuthLayout } from "./AuthLayout";

export function DemoNotice() {
  return (
    <AuthLayout title="Connect the database" description="The admin needs a Supabase database. The website is running on built-in sample content until one is connected.">
      <ol className="list-decimal space-y-3 pl-5 text-sm text-stone-700">
        <li>Create a project at supabase.com and run the SQL files in <code className="rounded bg-stone-100 px-1">supabase/migrations/</code> (001, then 003).</li>
        <li>Copy <code className="rounded bg-stone-100 px-1">.env.example</code> to <code className="rounded bg-stone-100 px-1">.env.local</code> and fill in the Supabase URL and publishable key, with <code className="rounded bg-stone-100 px-1">NEXT_PUBLIC_DATA_MODE=supabase</code>.</li>
        <li>Create your user in Supabase, run <code className="rounded bg-stone-100 px-1">002_make_first_admin.sql</code> with your email, and restart the site.</li>
      </ol>
      <p className="mt-6 text-xs text-stone-500">Full steps: docs/SUPABASE_SETUP.md</p>
    </AuthLayout>
  );
}
