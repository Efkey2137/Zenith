"use client";
import Link from "next/link";
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="eyebrow">Przerwa w podróży</p>
      <h1 className="font-serif text-3xl mt-4">
        Nie udało się wczytać strony.
      </h1>
      <p className="text-muted-foreground my-6">
        Spróbuj ponownie za chwilę. Twoje zapisane miejsce w lekturze pozostaje
        w tej przeglądarce.
      </p>
      <button onClick={retry} className="primary-button">
        Spróbuj ponownie
      </button>
      <Link href="/" className="block mt-5 text-sm">
        Wróć na początek
      </Link>
    </div>
  );
}
