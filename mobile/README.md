# Zenith na iPhonie — wersja do testów

Natywna aplikacja React Native / Expo SDK 57. Zachowuje ciemny styl Zenith, szeryfową typografię i treści z obecnej biblioteki. Ekrany są natywne; czytnik nie jest stroną osadzoną w przeglądarce.

Odświeżony wygląd „Nocny las” łączy ciemną zieleń, jasny tekst i przygaszony mosiądz. Start eksponuje ostatnią lekturę i pozwala otworzyć konkretną sagę. Listy mają wyszukiwanie, wyraźne filtry, postęp i oznaczenia pobrania. Czytnik ma stały dolny pasek, natywny panel wyglądu oraz menu powrotu do zakładki. Interfejs respektuje systemowe ograniczenie ruchu. Paleta, typografia i założenia są w [DESIGN.md](./DESIGN.md).

## Uruchomienie na telefonie

1. Otwórz `Start-Zenith.command` na Macu. Przy pierwszym uruchomieniu zaloguj się w terminalu na to samo konto Expo co w aplikacji Expo Go. Nie wpisuj hasła w rozmowie ani w repozytorium.
2. Połącz Maca i iPhone’a z tą samą siecią Wi-Fi. Zaktualizuj Expo Go, jeśli prosi o nowszą wersję.
3. Zeskanuj kod QR pokazany w terminalu aparatem iPhone’a i wybierz otwarcie w Expo Go. Pozostaw terminal uruchomiony podczas testowania. Mac obsługuje także połączenie z biblioteką.

Alternatywnie uruchom w terminalu `./Start-Zenith.command`. Do bezpośredniego uruchamiania Expo z publicznym, dostępnym API:

```sh
npm ci
npx expo login
npx expo start --go --lan
```

Expo opisuje ten sposób testowania w [instrukcji uruchomienia](https://docs.expo.dev/get-started/start-developing/). Jeśli Wi-Fi blokuje połączenie między urządzeniami, można użyć `npx expo start --go --tunnel`; wymaga to dodatkowego narzędzia tunelowania i udostępnia serwer testowy przez adres Expo.

## Co można testować

- Cztery ekrany: Start, Rozdziały, Postacie i Świat.
- Wyszukiwanie rozdziałów i postaci bez polskich znaków, filtrowanie sag i frakcji.
- Czytnik Markdown, wielkość tekstu, interlinia, jasny papier, pamięć miejsca, zakładki i oznaczenie przeczytania.
- Pobieranie rozdziałów do czytania offline oraz usuwanie kopii z urządzenia.
- Biografie, atlas, system mocy i informacje o autorze pobierane z istniejącej biblioteki.

W Expo Go wybierz „Reload”, aby zobaczyć zmiany wyglądu w już otwartym projekcie. Pierwsze naciśnięcie „Zakładka” zapisuje miejsce; kolejne daje wybór powrotu albo zapisania nowego miejsca.

Postęp i ustawienia zapisują się na urządzeniu, niezależnie od wersji przeglądarkowej. Treść rozdziału zapisuje się offline dopiero po wybraniu „Pobierz”. Biografie wymagają internetu.

## Publikacja i źródło treści

Podgląd gałęzi `codex/ios-test-app` na Vercel czyta tę samą bibliotekę co strona. Jest chroniony logowaniem Vercel. Plik `Start-Zenith.command` uruchamia na Macu połączenie do podglądu i kieruje do niego Expo Go. Lokalny serwer udostępnia wyłącznie trzy publiczne odczyty API; odrzuca inne ścieżki, parametry i metody zapisu. Nie przekazuje żadnych sekretów do telefonu. Panel autora otwiera produkcyjną stronę w przeglądarce.

Zatwierdzony tymczasowy link dostępu znajduje się w ignorowanym pliku `../.vercel/mobile-preview-access.json` z uprawnieniami 600. Link wygasa po około 23 godzinach; po jego wygaśnięciu potrzebne jest ponowne zatwierdzenie dostępu lub publiczne wdrożenie API. Nie dodawaj tego pliku do Git ani nie udostępniaj go. Bez pliku launcher uruchamia lokalną bibliotekę zamiast podglądu; może ona być pusta. Lokalny serwer strony słucha wtedy tylko na Macu, a połączenie dla telefonu udostępnia jedynie publiczne API.

Podczas testu Mac i telefon muszą być w tej samej sieci. Tunelowanie samego Expo nie zapewnia dostępu do lokalnego połączenia biblioteki. Nie testuj zapisu treści próbnych w podglądzie współdzielącym bazę produkcyjną.

Do bezpośredniego połączenia z publicznym API adres można zmienić w `.env.local`, według `.env.example`, i ponownie uruchomić Expo (bez launchera):

```sh
EXPO_PUBLIC_ZENITH_URL=https://adres-twojej-strony.vercel.app
```

Ten adres jest publiczny. Nigdy nie zapisuj w zmiennych `EXPO_PUBLIC_*` hasła autora, tokenów bazy, linku dostępu ani sekretów Vercel. API `/api/mobile/v1` udostępnia wyłącznie treści publiczne i nie pozwala na zapis. Ukryty rozdział zwraca 404 także przy zalogowanej sesji autora.

Po odświeżeniu biblioteki online wycofane rozdziały znikają z katalogu i z pobranych kopii. Potwierdzone 404 nie uruchamia kopii offline. Rozdział pobrany wcześniej może pozostać dostępny bez internetu do następnego połączenia — nie można zdalnie wycofać pliku z urządzenia, które jest offline.

## Kontrola jakości

```sh
npm run lint
npm run typecheck
npm test
npx expo-doctor
npm run export:ios
```

Testy API są w głównym projekcie (`npm test` w katalogu nadrzędnym). Sprawdzają również brak ujawnienia szkiców i kolejność publicznych rozdziałów.

`export:ios` tworzy pakiet JavaScript/Hermes i zasoby, a nie podpisany plik `.ipa`. Ten etap służy Expo Go. Osobna instalacja przez TestFlight wymaga później konfiguracji EAS, podpisywania i konta Apple Developer.

Audyt zależności nadal zgłasza ostrzeżenia w drzewie Expo/Metro. Parser Markdown został zaktualizowany przez override do `markdown-it` 15. Nie stosuj `npm audit fix --force`: proponuje niezgodne wersje Expo/React Native. Przed wydaniem poza Expo Go trzeba ponownie ocenić te ostrzeżenia.
