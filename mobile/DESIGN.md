# Zenith — nocny las

Odświeżenie aplikacji do testów na iPhonie. Zachowujemy mroczny, literacki klimat; ułatwiamy powrót do książki i czytanie. Treści i decyzje autora pozostają źródłem biblioteki.

## Plan przed implementacją

| Token              | Kolor     | Rola                                 |
| ------------------ | --------- | ------------------------------------ |
| Noc                | `#101714` | Tło                                  |
| Leśna powierzchnia | `#1B2520` | Grupowanie i kontrolki               |
| Kość słoniowa      | `#EEEFE7` | Główny tekst                         |
| Mgła               | `#ABB6AE` | Tekst pomocniczy                     |
| Szałwia            | `#A5B9A5` | Aktywne kontrolki, przycisk czytania |
| Mosiądz            | `#C6AE80` | Znak książki, szczegół okładki       |

Georgia: tytuły i tekst książki. Czcionka systemowa: nawigacja, opisy, wyszukiwanie i ustawienia. Bez wersalików w opisach i filtrach. Linie tekstu ograniczone do szerokości czytnika; kontrolki rosną wraz z systemowym rozmiarem tekstu.

Jedna kolumna, jeden główny przycisk; motyw gałęzi i oprawy książki wyłącznie na starcie.

```text
Zenith                   gałąź
Kroniki mrocznego słowiańskiego świata

[ książka | ostatni rozdział       ]
[         | postęp i Czytaj dalej ]

Twoja biblioteka              Spis
Saga                         liczba >
Saga                         liczba >

Poza rozdziałami
[ Postacie ] [ Świat ]

Start   Rozdziały   Postacie   Świat
```

Apple Design: znajome natywne przejścia, panel ustawień zsuwany gestem, wyraźne cele dotykowe minimum 44–48 pt, bez przejmowania gestów systemowych. Emil Design Engineering: natychmiastowa reakcja na dotyk i krótki powrót sprężynowy, respektowanie ograniczenia ruchu, bez animowania często używanych list i wyszukiwania. Frontend Design: własna typografia i literacka kompozycja; spokojny interfejs zamiast szeregu identycznych ozdobnych kart.

## Krytyka planu

Same zaokrąglone karty i zielony akcent byłyby zbyt generyczne. Zamiast powtarzać kartę na każdym ekranie, wyróżniamy tylko bieżącą lekturę oprawą książki. Biblioteka i kompendium mają zwykłe czytelne wiersze. Motyw gałęzi jest abstrakcyjnym ornamentem, nie nową ilustracją kanonu. Nie dodajemy animacji wejścia, gradientów ani śledzących wersalików. Ustawienia czytnika przenosimy poza strumień tekstu, żeby otwieranie panelu nie zmieniało miejsca w rozdziale.

## Ocena gotowego interfejsu

| Before | After | Why |
| --- | --- | --- |
| Dwa duże przyciski rozpoczynania i wznawiania | Jedna karta bieżącej lektury | Najważniejszy wybór jest jednoznaczny |
| Wszystkie elementy w ostrych ramkach | Oprawa książki na starcie, spokojne wiersze w listach | Zachowanie charakteru bez wizualnego szumu |
| Szeryf i wersaliki również w małych kontrolkach | Czcionka systemowa w opisach, Georgia w książce | Czytelniejsze sterowanie na telefonie |
| Ustawienia w strumieniu rozdziału | Osobny natywny panel, dolny pasek narzędzi | Tekst zaczyna się wcześniej; panel nie zmienia jego długości |
| Zakładka nadpisywana bez wyboru | Zapis, a potem wybór powrotu lub aktualizacji | Czytelnik kontroluje zapisane miejsce |
| Wybrana saga częściowo poza ekranem | Filtry odsłaniają aktywny wybór | Zrozumiały rezultat wejścia ze strony startowej |

Podgląd sprawdzony w Expo Go na symulatorze iPhone 16e / iOS 26.2: cztery zakładki, wejście w sagę, wyszukiwanie bez polskich znaków, jasny papier, zwiększenie tekstu, zapis i powrót do zakładki, oznaczenie przeczytania, pobranie rozdziału oraz otwarcie kompendium. Gesty fizycznego telefonu i systemowy powiększony tekst wymagają sprawdzenia na urządzeniu; nie były częścią tej weryfikacji na symulatorze.
