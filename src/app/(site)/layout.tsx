import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
export const dynamic = "force-dynamic";
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[70vh]">
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="site-shell flex flex-wrap items-center justify-between gap-4 py-7 text-sm text-muted-foreground">
          <div>
            <p className="font-serif text-xl text-foreground">Zenith</p>
            <p className="mt-1 text-xs leading-relaxed">
              Kroniki mrocznego słowiańskiego świata
            </p>
          </div>
          <Link href="/admin" className="back-link">
            Panel autora
          </Link>
        </div>
      </footer>
    </>
  );
}
