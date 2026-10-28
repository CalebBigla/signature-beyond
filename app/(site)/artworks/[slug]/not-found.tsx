import { ButtonLink } from "@/components/ui/Button";

export default function ArtworkNotFound() {
  return (
    <div className="container-site py-section text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-serif text-h1 font-medium">Artwork not found</h1>
      <p className="mx-auto mt-5 max-w-md text-body text-stone-600">This artwork may have been removed or is not published.</p>
      <ButtonLink href="/artworks" className="mt-10">Back to artworks</ButtonLink>
    </div>
  );
}
