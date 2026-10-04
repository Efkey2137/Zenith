# Zenith w przeglądarce — Nocny las

Przeniesienie zatwierdzonego wyglądu aplikacji na stronę i panel autora. Wspólna tożsamość, układ dostosowany do szerokości przeglądarki.

## Plan przed implementacją

Paleta: Noc `#101714`, Leśna powierzchnia `#1B2520`, Kość słoniowa `#EEEFE7`, Mgła `#ABB6AE`, Szałwia `#A5B9A5`, Mosiądz `#C6AE80`. Ramki korzystają z pochodnego odcienia `#334238`.

Georgia w nazwie Zenith, tytułach i treści książki; czcionka systemowa w opisach, formularzach, filtrach i nawigacji. Tytuły mają ciasny rytm, treść spokojną interlinię i ograniczoną długość wiersza. Treści są wyrównane do lewej.

Na komputerze otwarcie ma dwie kolumny: tożsamość książki i bieżąca lektura. Biblioteka poniżej pozostaje listą. Na telefonie całość przechodzi w jedną kolumnę.

```text
Zenith       Rozdziały  Postacie  Świat  System Mocy  Autor

Zenith + gałąź             [ oprawa | ostatni rozdział ]
Kroniki mrocznego świata   [        | Czytaj dalej    ]

Twoja biblioteka                               Spis
Saga                                          liczba >
Saga                                          liczba >

Poza rozdziałami
Postacie        Świat        System Mocy

Czytnik: tekst książki + spokojny pasek narzędzi
Wygląd otwiera oddzielny panel; zakładka daje wybór powrotu.
```

Apple Design: przewidywalna nawigacja, duże cele dotykowe, zarządzanie fokusem panelu i czytelne warstwy. Emil Design Engineering: natychmiastowa reakcja na naciśnięcie, krótkie przejścia tylko przy działaniu użytkownika, ograniczenie ruchu. Frontend Design: literacka kompozycja oparta na istniejącej książce, ornament gałęzi przeniesiony z aplikacji i cisza w pozostałych częściach strony.

## Krytyka planu

Nie kopiujemy czterech mobilnych zakładek do szerokiej przeglądarki ani nie zamieniamy każdej sekcji w identyczną kartę. Elementem rozpoznawalnym jest oprawa książki w otwarciu; spisy są czytelnymi wierszami. Nie dodajemy gradientów, wersalikowych etykiet ani animacji wejścia. Panel autora korzysta ze wspólnych kolorów i kontrolek, zachowując prosty układ pracy. Dane, publikacja rozdziałów i fabuła nie wymagają zmian.

## Ocena po wdrożeniu

| Before                               | After                                                              | Why                                                |
| ------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------- |
| Duży nagłówek i cztery podobne kafle | Oprawa książki, bieżąca lektura i biblioteka w wierszach           | Jedno wyraźne miejsce rozpoczęcia czytania         |
| Drobne filtry i ostre ramki          | Wyszukiwanie i przyciski wyboru z celami dotykowymi 44–48 px       | Wygodniejsze używanie telefonu                     |
| Ustawienia i zakładki nad treścią    | Pasek czytnika i natywny dialog z obsługą Escape i powrotem fokusu | Więcej miejsca na tekst i przewidywalne sterowanie |

Po sprawdzeniu podglądu poprawiono kontrast prozy, odstęp wyszukiwarki od filtrów oraz pełną szerokość mobilnego panelu. Sprawdzono układ 390 × 844 i 1440 × 960, wyszukiwanie bez polskich znaków, wybór sagi ze strony głównej, postęp po zmianie typografii, powrót do zakładki i ponowne otwarcie rozdziału. Dane do podglądu są oddzielną lokalną kopią wyłącznie publicznej biblioteki.
