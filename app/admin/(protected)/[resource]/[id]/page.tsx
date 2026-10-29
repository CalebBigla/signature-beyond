import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource, type Option } from "@/lib/admin/resources";
import { deleteArtworkImage, moveImage, setMainImage, updateImageAlt } from "@/lib/admin/actions";
import { mediaUrl } from "@/lib/supabase/env";
import { Icon } from "@/components/ui/Icon";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { Badge, Card, PageHeader, btn, inputClass } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/DeleteButton";

interface ImageRow { id: string; storage_path: string; alt: string; is_main: boolean; sort_order: number }

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
  await Promise.all(
    [...refTables].map(async ([table, label]) => {
      const { data } = await db.from(table).select(`id, ${label}`).order(label);
      refOptions[table] = ((data ?? []) as unknown as Record<string, string>[]).map((r) => ({ value: r.id, label: r[label] }));
    })
  );

  const linkSelected: Record<string, string[]> = {};
  if (!isNew) {
    await Promise.all(
      (res.links ?? []).map(async (l) => {
        const { data } = await db.from(l.table).select(l.childCol).eq(l.parentCol, id);
        linkSelected[l.table] = ((data ?? []) as unknown as Record<string, string>[]).map((r) => r[l.childCol]);
      })
    );
  }

  const imageUrls: Record<string, string | null> = {};
  res.fields.filter((f) => f.type === "image").forEach((f) => { imageUrls[f.name] = mediaUrl((values[f.name] as string | null) ?? null); });

  const images = res.gallery && !isNew
    ? (((await db.from("artwork_images").select("*").eq("artwork_id", id).order("sort_order")).data ?? []) as ImageRow[])
    : [];

  const title = isNew ? `Add ${res.singular}` : String(values[res.titleField] || `Edit ${res.singular}`);
  const publicHref = res.publicPath && values.slug ? `${res.publicPath}${String(values.slug)}` : null;
  const hidden = (img: ImageRow) => (
    <>
      <input type="hidden" name="_artwork" value={id} />
      <input type="hidden" name="_image" value={img.id} />
    </>
  );

  return (
    <>
      <PageHeader title={title} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: res.label, href: `/admin/${res.key}` }, { label: isNew ? "New" : "Edit" }]} />
      <ResourceForm resource={res} id={isNew ? null : id} values={values} refOptions={refOptions} linkSelected={linkSelected} imageUrls={imageUrls} publicHref={publicHref} />

      {res.gallery && !isNew && (
        <div id="images" className="mt-6 scroll-mt-24 lg:mr-[21.5rem]">
          <Card title="Artwork images" description="The main image is used in lists and as the first view. Describe each image for screen readers and search engines.">
            {images.length === 0 ? (
              <p className="text-sm text-stone-500">No images yet. Add some above, then save.</p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {images.map((img, i) => (
                  <li key={img.id} className="flex flex-wrap items-start gap-4 py-4 first:pt-0 last:pb-0 sm:flex-nowrap">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from Storage */}
                    <img src={mediaUrl(img.storage_path) ?? ""} alt="" className="h-24 w-24 shrink-0 rounded-md bg-stone-100 object-contain" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span>Image {i + 1}</span>
                        {img.is_main && <Badge tone="published">Main</Badge>}
                      </div>
                      <form action={updateImageAlt} className="flex gap-2">
                        {hidden(img)}
                        <label htmlFor={`alt-${img.id}`} className="sr-only">Description of image {i + 1}</label>
                        <input id={`alt-${img.id}`} name="alt" defaultValue={img.alt} maxLength={300} placeholder="Describe the image, e.g. Oil painting of two dancers in blue" className={inputClass} />
                        <button type="submit" className={btn("secondary", "sm")}>Save</button>
                      </form>
                    </div>
                    <div className="flex items-center gap-1">
                      <form action={moveImage}>
                        {hidden(img)}<input type="hidden" name="_dir" value="up" />
                        <button type="submit" disabled={i === 0} className={btn("ghost", "sm")} aria-label={`Move image ${i + 1} earlier`} title="Move earlier"><Icon name="arrowUp" className="h-4 w-4" /></button>
                      </form>
                      <form action={moveImage}>
                        {hidden(img)}<input type="hidden" name="_dir" value="down" />
                        <button type="submit" disabled={i === images.length - 1} className={btn("ghost", "sm")} aria-label={`Move image ${i + 1} later`} title="Move later"><Icon name="arrowDown" className="h-4 w-4" /></button>
                      </form>
                      {!img.is_main && (
                        <form action={setMainImage}>
                          {hidden(img)}
                          <button type="submit" className={btn("ghost", "sm")}>Set as main</button>
                        </form>
                      )}
                      <form action={deleteArtworkImage}>
                        {hidden(img)}
                        <ConfirmButton message="Delete this image? This cannot be undone." className={`${btn("ghost", "sm")} text-red-700`} aria-label={`Delete image ${i + 1}`} title="Delete image"><Icon name="trash" className="h-4 w-4" /></ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
