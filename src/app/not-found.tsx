import Link from "next/link";
export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-6 py-28 text-center">
      <p className="eyebrow">404 · Nieznana ścieżka</p>
      <h1 className="font-serif text-4xl mt-5">Ta strona nie istnieje.</h1>
      <p className="text-muted-foreground my-6">
        Być może adres się zmienił. Wróć do spisu i wybierz kolejną historię.
      </p>
      <Link href="/chapters" className="primary-button">
        Spis rozdziałów
      </Link>
      <Link href="/" className="block text-sm mt-6">
        Strona główna
      </Link>
    </main>
  );
}
