/** Every admin screen, including login: switches on the admin tokens (warm brand ink) defined in globals.css. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
