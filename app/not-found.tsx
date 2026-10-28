import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="site container-site py-section text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-serif text-h1 font-medium">Page not found</h1>
      <p className="mx-auto mt-5 max-w-md text-body text-stone-600">This page does not exist or is not published.</p>
      <ButtonLink href="/" className="mt-10">Back to home</ButtonLink>
    </div>
  );
}
