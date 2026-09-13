import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Zenith — powieść i jej świat", template: "%s · Zenith" },
  description: "Cyfrowe kompendium i czytnik powieści dark fantasy Zenith",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
