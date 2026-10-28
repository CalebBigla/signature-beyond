import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource, type Option } from "@/lib/admin/resources";
import { deleteArtworkImage, setMainImage } from "@/lib/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { mediaUrl } from "@/lib/supabase/env";

export default async function EditRecord({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const res = getResource(resource);
  if (!res) notFound();
  const { db } = await requireAdmin();
  const isNew = id === "new";

  let values: Record<string, unknown> = { status: "draft", availability: "on_request", price_on_request: true, ...res.defaults };
  if (!isNew) {
    const { data, error } = await db.from(res.table).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Could not load: ${error.message}`);
    if (!data) notFound();
    values = data as Record<string, unknown>;
  }

  const refTables = new Map<string, string>();
  res.fields.forEach((f) => f.refTable && refTables.set(f.refTable, f.refLabel ?? "name"));
  res.links?.forEach((l) => refTables.set(l.refTable, l.refLabel));
  const refOptions: Record<string, Option[]> = {};
  for (const [table, label] of refTables) {
    const { data } = await db.from(table).select(`id, ${label}`).order(label);
    refOptions[table] = ((data ?? []) as unknown as Record<string, string>[]).map((r) => ({ value: r.id, label: r[label] }));
  }

  const linkSelected: Record<string, string[]> = {};
  if (!isNew) {
    for (const l of res.links ?? []) {
      const { data } = await db.from(l.table).select(l.childCol).eq(l.parentCol, id);
      linkSelected[l.table] = ((data ?? []) as unknown as Record<string, string>[]).map((r) => r[l.childCol]);
    }
  }

  const imageUrls: Record<string, string | null> = {};
  res.fields.filter((f) => f.type === "image").forEach((f) => { imageUrls[f.name] = mediaUrl((values[f.name] as string | null) ?? null); });

  const images = res.gallery && !isNew
    ? ((await db.from("artwork_images").select("*").eq("artwork_id", id).order("sort_order")).data ?? []) as { id: string; storage_path: string; is_main: boolean }[]
    : [];

  return (
    <>
      <Link href={`/admin/${res.key}`} className="text-xs underline">← {res.label}</Link>
      <h1 className="mb-6 mt-3 font-serif text-3xl">{isNew ? `Add ${res.singular}` : `Edit ${res.singular}`}</h1>
      <ResourceForm resource={res} id={isNew ? null : id} values={values} refOptions={refOptions} linkSelected={linkSelected} imageUrls={imageUrls} />

      {res.gallery && !isNew && (
        <section className="mt-12 max-w-2xl">
          <h2 className="mb-3 font-serif text-xl">Artwork images</h2>
          {images.length === 0 ? <p className="text-sm text-stone-500">No images yet. Add some using the form above and save.</p> : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((img) => (
                <li key={img.id} className="rounded border border-stone-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(img.storage_path) ?? ""} alt="" className="aspect-square w-full rounded object-cover" />
                  <p className="mt-2 text-xs">{img.is_main ? "Main image" : ""}</p>
                  <div className="mt-1 flex gap-3">
                    {!img.is_main && (
                      <form action={setMainImage}>
                        <input type="hidden" name="_artwork" value={id} /><input type="hidden" name="_image" value={img.id} />
                        <button type="submit" className="text-xs underline">Make main</button>
                      </form>
                    )}
                    <form action={deleteArtworkImage}>
                      <input type="hidden" name="_artwork" value={id} /><input type="hidden" name="_image" value={img.id} />
                      <button type="submit" className="text-xs text-red-700 underline">Delete</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
