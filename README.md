# Zenith

Polskie kompendium powieści i czytnik w ciemnej, oszczędnej stylistyce. Next.js 16, React 19, Tailwind CSS, Drizzle, Turso i Vercel Blob.

## Funkcje

- Strona główna, nawigacja na telefonie i komputerze, ekrany błędu i braku strony.
- Rozdziały: wyszukiwanie bez polskich znaków, filtrowanie sag, kolejność między sagami.
- Czytnik: pamięć miejsca, zakładka dla każdego rozdziału, oznaczenie przeczytania, wielkość tekstu, interlinia, szerokość i jasny papier. Zapis pozostaje w danej przeglądarce; nie synchronizuje się między urządzeniami.
- Postacie: wyszukiwanie, frakcje, portrety i biografie w Markdown.
- Edytowalne sekcje Świat, System Mocy i Autor. Aplikacja nie generuje treści książki.
- Panel autora: logowanie, tworzenie i edycja postaci i sag, import/aktualizacja rozdziałów oraz edycja sekcji z podglądem.

## Uruchomienie lokalne

Wymagany Node.js 24 LTS.

```sh
npm ci
mkdir -p data
cp .env.example .env.local
# Ustaw ADMIN_PASSWORD: losowe hasło o długości przynajmniej 24 znaków.
npm run db:init
npm run dev
```

Domyślny adres bazy w przykładzie tworzy lokalny plik SQLite. `db:init` tworzy wyłącznie brakujące tabele, nie usuwa i nie nadpisuje treści. Skrypt można uruchamiać ponownie. Nie dodaje przykładowych postaci ani rozdziałów.

Jeśli lokalne ograniczenia systemu uniemożliwiają Turbopackowi tworzenie procesów lub portów, użyj `npm run dev -- --webpack` oraz `npm run build -- --webpack`.

## Vercel — przygotowanie do publikacji

Projekt jest połączony z repozytorium `Efkey2137/Zenith`. Gałęzie robocze służą do podglądu, `main` do produkcji.

1. Zachowaj istniejące `TURSO_DATABASE_URL` i `TURSO_AUTH_TOKEN`.
2. Na istniejącej bazie tabela `pages` zostanie dodana automatycznie przy pierwszym zapisie sekcji przez zalogowanego autora. Do tego momentu sekcje wyświetlają stan pusty. Dla nowej bazy uruchom `npm run db:init`. Istniejące treści pozostają bez zmian. Nie używaj lokalnego `file:` jako bazy wdrożenia.
3. Ustaw `ADMIN_PASSWORD` na losowe hasło o długości co najmniej 24 znaków, oddzielnie dla odpowiednich środowisk. Bez niego zapisy są zamknięte. Zmiana hasła unieważnia dotychczasowe sesje. Sesja trwa 12 godzin; cookie jest HttpOnly, SameSite=Strict, a w produkcji Secure.
4. Podłącz istniejący **publiczny** magazyn Vercel Blob do Zenith. Przesyłanie używa `BLOB_READ_WRITE_TOKEN` albo `BLOB_STORE_ID` z Vercel OIDC. Kod zapisuje rzeczywisty URL zwrócony przez magazyn. Nie tworzy płatnych zasobów. Portrety: JPG/PNG/WebP do 2 MB; stare portrety nie są usuwane z magazynu przy wymianie.
5. Zweryfikuj podgląd przed scaleniem zmian do `main`. Podgląd podłączony do tej samej bazy ma dostęp do tych samych treści: testuj zapisy na osobnej bazie.

Panel dostępny jest pod `/admin`. Publiczne strony nie wymagają konta. Każda operacja zapisu sprawdza sesję na serwerze. Nie umieszczaj hasła ani tokenów w kodzie, linkach ani opisie PR.

## Import rozdziałów

Utwórz sagę w panelu i użyj jej adresu w polu `saga`:

```md
---
title: Tytuł rozdziału
chapterNumber: 1
saga: adres-sagi
slug: adres-rozdzialu
---

Treść w Markdown.
```

Do 30 plików `.md` lub `.txt` jednocześnie, do 512 KB na plik i do 3 MB łącznie. Pole `slug` jest opcjonalne dla nowych rozdziałów. Przy aktualizacji zachowaj istniejący adres: ten sam adres nadpisuje tekst, tytuł i przypisanie do sagi. Tytuł może pochodzić z nazwy pliku. Numer jest nieujemną liczbą całkowitą; drugi adres z tym samym numerem w sadze zostanie odrzucony. Obsługiwany jest wyłącznie nagłówek YAML, także z BOM i końcami linii Windows.

## Sprawdzenie

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

Testy obejmują walidację importu, brak wykonywania nagłówków JavaScript, wyszukiwanie polskich znaków, uszkodzone dane czytnika, ważność sesji i nawigację między sagami. Test bazy używa osobnej bazy w pamięci. Dodatkowo należy sprawdzić w przeglądarce logowanie, zapisy formularzy, odświeżenie czytnika i widok mobilny.

Pozostałe ostrzeżenia `npm audit` dotyczą starego pomocniczego esbuild w narzędziu `drizzle-kit`; nie uruchamiaj `db:studio` na publicznym interfejsie. Nie stosuj `audit fix --force`, które proponuje niezgodny downgrade tego narzędzia.
