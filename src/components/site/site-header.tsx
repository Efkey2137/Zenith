"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { BranchMark } from "./book-mark";
const items = [
  { href: "/chapters", label: "Rozdziały" },
  { href: "/characters", label: "Postacie" },
  { href: "/world", label: "Świat" },
  { href: "/power-system", label: "System Mocy" },
  { href: "/author", label: "Autor" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <header className="border-b border-border bg-background">
      <a href="#main" className="skip-link">
        Przejdź do treści
      </a>
      <nav
        aria-label="Główna nawigacja"
        className="site-shell flex flex-wrap items-center justify-between gap-4 py-4"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            setOpen(false);
            trigger.current?.focus();
          }
        }}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex min-h-11 items-center gap-2 font-serif text-[28px] tracking-tight"
        >
          <BranchMark size={30} className="text-brass" />
          Zenith
        </Link>
        <button
          ref={trigger}
          className="icon-button md:hidden"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <ul
          id="site-menu"
          className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-border pt-3 md:flex md:w-auto md:flex-row md:border-0 md:pt-0`}
        >
          {items.map((item) => (
            <li key={item.href}>
              <Link
                onClick={() => setOpen(false)}
                href={item.href}
                aria-current={
                  pathname.startsWith(item.href) ? "page" : undefined
                }
                className="nav-link"
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
