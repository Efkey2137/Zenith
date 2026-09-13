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
      <footer className="border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap justify-between gap-4 text-xs text-muted-foreground">
          <p className="tracking-widest">
            ZENITH · Kroniki mrocznego słowiańskiego świata
          </p>
          <Link href="/admin" className="hover:text-foreground">
            Panel autora
          </Link>
        </div>
      </footer>
    </>
  );
}
