export function DemoNotice() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">Admin is not available in demo mode</h1>
      <p className="mt-3 text-sm text-stone-600">
        The admin area needs the database. Follow docs/SUPABASE_SETUP.md, then set NEXT_PUBLIC_DATA_MODE=supabase.
      </p>
    </div>
  );
}
