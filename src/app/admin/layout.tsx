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
          className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center gap-5 text-sm"
        >
          <Link href="/" className="mr-auto font-serif tracking-widest">
            ZENITH
          </Link>
          {authenticated && (
            <>
              <Link href="/admin/chapters">Rozdziały</Link>
              <Link href="/admin/characters">Postacie</Link>
              <Link href="/admin/sagas">Sagi</Link>
              <Link href="/admin/pages">Sekcje strony</Link>
              <form action={logoutAction}>
                <button className="text-muted-foreground">Wyloguj</button>
              </form>
            </>
          )}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>
    </>
  );
}
