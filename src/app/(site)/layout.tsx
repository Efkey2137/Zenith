import Link from 'next/link';

const navItems = [
  { href: '/characters', label: 'Postacie' },
  { href: '/world', label: 'Świat' },
  { href: '/chapters', label: 'Rozdziały' },
  { href: '/power-system', label: 'System Mocy' },
  { href: '/author', label: 'Autor' },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-serif tracking-widest text-foreground">
            ZENITH
          </Link>
          <ul className="flex gap-6 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}