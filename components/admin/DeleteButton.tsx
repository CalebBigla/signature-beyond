"use client";

export function DeleteButton({ action, resource, id, what }: { action: (f: FormData) => Promise<void>; resource: string; id: string; what: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(`Delete "${what}"? This cannot be undone.`)) e.preventDefault(); }}>
      <input type="hidden" name="_resource" value={resource} />
      <input type="hidden" name="_id" value={id} />
      <button type="submit" className="text-xs text-red-700 underline">Delete</button>
    </form>
  );
}
