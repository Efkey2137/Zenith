# Zenith na iPhonie — wersja do testów

Natywna aplikacja React Native / Expo SDK 57. Zachowuje ciemny styl Zenith, szeryfową typografię i treści z obecnej biblioteki. Ekrany są natywne; czytnik nie jest stroną osadzoną w przeglądarce.

## Uruchomienie na telefonie

1. Otwórz `Start-Zenith.command` na Macu. Przy pierwszym uruchomieniu zaloguj się w terminalu na to samo konto Expo co w aplikacji Expo Go. Nie wpisuj hasła w rozmowie ani w repozytorium.
2. Połącz Maca i iPhone’a z tą samą siecią Wi-Fi. Zaktualizuj Expo Go, jeśli prosi o nowszą wersję.
3. Zeskanuj kod QR pokazany w terminalu aparatem iPhone’a i wybierz otwarcie w Expo Go. Pozostaw terminal uruchomiony podczas testowania.

Alternatywnie, w tym katalogu:

```sh
npm ci
npx expo login
npx expo start --go --lan
```

Expo opisuje ten sposób testowania w [instrukcji uruchomienia](https://docs.expo.dev/get-started/start-developing/). Jeśli Wi-Fi blokuje połączenie między urządzeniami, można użyć `npx expo start --go --tunnel`; wymaga to dodatkowego narzędzia tunelowania i udostępnia serwer testowy przez adres Expo.

## Co można testować

- Cztery ekrany: Zenith, Rozdziały, Postacie i Świat.
- Wyszukiwanie rozdziałów i postaci bez polskich znaków, filtrowanie sag i frakcji.
- Czytnik Markdown, wielkość tekstu, interlinia, jasny papier, pamięć miejsca, zakładki i oznaczenie przeczytania.
- Pobieranie rozdziałów do czytania offline oraz usuwanie kopii z urządzenia.
- Biografie, atlas, system mocy i informacje o autorze pobierane z istniejącej biblioteki.

Postęp i ustawienia zapisują się na urządzeniu, niezależnie od wersji przeglądarkowej. Treść rozdziału zapisuje się offline dopiero po wybraniu „Pobierz”. Biografie wymagają internetu.

## Publikacja i źródło treści

Domyślnie aplikacja korzysta z podglądu gałęzi `codex/ios-test-app` na Vercel. Nie trzeba uruchamiać lokalnego serwera strony. Podgląd czyta tę samą bibliotekę co strona — nie testuj w nim zapisu treści próbnych.

Adres można zmienić w `.env.local`, według `.env.example`, i ponownie uruchomić Expo:

```sh
EXPO_PUBLIC_ZENITH_URL=https://adres-twojej-strony.vercel.app
```

Ten adres jest publiczny. Nigdy nie zapisuj w zmiennych `EXPO_PUBLIC_*` hasła autora, tokenów bazy ani sekretów Vercel. API `/api/mobile/v1` udostępnia wyłącznie treści publiczne i nie pozwala na zapis. Ukryty rozdział zwraca 404 także przy zalogowanej sesji autora. Panel autora otwiera się w przeglądarce z ekranu Świat.

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
