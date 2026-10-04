import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Panel autora",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdmin();
  return (
    <>
      <header className="border-b border-border">
        <nav
          aria-label="Panel autora"
          className="site-shell py-4 flex flex-wrap items-center gap-5 text-sm"
        >
          <Link
            href="/"
            className="mr-auto flex min-h-11 items-center font-serif text-[28px] tracking-tight"
          >
            Zenith
          </Link>
          {authenticated && (
            <>
              <Link className="nav-link" href="/admin/chapters">
                Rozdziały
              </Link>
              <Link className="nav-link" href="/admin/characters">
                Postacie
              </Link>
              <Link className="nav-link" href="/admin/sagas">
                Sagi
              </Link>
              <Link className="nav-link" href="/admin/pages">
                Sekcje strony
              </Link>
              <form action={logoutAction}>
                <button className="secondary-button">Wyloguj</button>
              </form>
            </>
          )}
        </nav>
      </header>
      <main className="page-shell">{children}</main>
    </>
  );
}
