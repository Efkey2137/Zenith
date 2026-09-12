"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
const items = [
  { href: "/characters", label: "Postacie" },
  { href: "/world", label: "Świat" },
  { href: "/chapters", label: "Rozdziały" },
  { href: "/power-system", label: "System Mocy" },
  { href: "/author", label: "Autor" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-border bg-background">
      <a href="#main" className="skip-link">
        Przejdź do treści
      </a>
      <nav
        aria-label="Główna nawigacja"
        className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4"
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-xl font-serif tracking-[0.2em]"
        >
          ZENITH
          <span
            className="text-muted-foreground ml-2 text-xs"
            aria-hidden="true"
          >
            ✦
          </span>
        </Link>
        <button
          className="md:hidden icon-button"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <ul
          id="site-menu"
          className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 md:w-auto md:flex md:flex-row md:gap-6 text-sm`}
        >
          {items.map((item) => (
            <li key={item.href}>
              <Link
                onClick={() => setOpen(false)}
                href={item.href}
                aria-current={
                  pathname.startsWith(item.href) ? "page" : undefined
                }
                className={`block py-2 transition-colors ${pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
