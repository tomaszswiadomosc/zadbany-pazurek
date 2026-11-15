// Ustawienia strony Zadbany Pazurek.
// Podmień wartości w cudzysłowach. Nic poza tym plikiem nie musisz ruszać.

window.LANDING = {
  // Te same dane co w app/config.js aplikacji (Supabase -> Project Settings -> API)
  SUPABASE_URL: "https://jwwcvbbsksumglmxvbzm.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2N2YmJza3N1bWdsbXh2YnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzOTI2MzksImV4cCI6MjEwOTk2ODYzOX0.t7GFOMqhq8s3DuH6eYtkiB5UOyy30S9WzTaSv-A-UzA",

  // Film z YouTube (niepubliczny). Z linku https://youtu.be/AbCdEf12345 wklej tylko: AbCdEf12345
  // Puste = w miejscu filmu pojawi się napis "Film pojawi się wkrótce".
  YOUTUBE_ID: "",

  // Twoje zdjęcie do sekcji "Kim jestem". Wrzuć plik do folderu landing, np. tomasz.jpg, i wpisz: "tomasz.jpg"
  PHOTO_URL: "tomasz.jpg",

  // GALERIA w nagłówku (prawa strona, 6 kafelków): zdjęcia zadbanych dłoni.
  // Wrzuć pliki do folderu landing/zdjecia i wpisz nazwy, np. "zdjecia/dlonie1.jpg".
  // Tylko Twoje zdjęcia albo takie, do których masz prawa (np. od uczestników za zgodą).
  // Puste miejsca pokazują ciemny kafelek z napisem.
  GALERIA: ["", "", "", "", "", ""],

  // PRZED I PO: prawdziwe zdjęcia uczestników bety, tylko za ich pisemną zgodą.
  // Każda para: { przed: "zdjecia/anna-przed.jpg", po: "zdjecia/anna-po.jpg", podpis: "Anna, 27 lat · 90 dni" }
  // Pusta lista = sekcja pokazuje 3 miejsca z napisem „Pierwsze efekty bety już wkrótce”.
  // Teraz: zdjęcia poglądowe (nie są to uczestnicy programu). Po becie podmień na prawdziwe efekty uczestników.
  PRZED_PO: [
    { przed: "zdjecia/para1-przed.jpg", po: "zdjecia/para1-po.jpg" },
    { przed: "zdjecia/para5-przed.jpg", po: "zdjecia/para5-po.jpg" },
    { przed: "zdjecia/para3-przed.jpg", po: "zdjecia/para3-po.jpg" }
  ],
  // Czy to są zdjęcia poglądowe (true), czy efekty Twoich uczestników (false). Zmienia opis sekcji.
  PRZED_PO_POGLADOWE: true,

  // Zdjęcia do sekcji „Dlaczego nawyk jest silniejszy od Ciebie” (puste = sekcja bez zdjęć)
  NAWYK_ZDJECIA: ["zdjecia/nawyk-2.jpg"],

  // PŁATNOŚCI Przelewy24. Puste = formularz działa jak zapis (bez płatności).
  // Po wdrożeniu funkcji „platnosci” w Supabase wpisz:
  // "https://jwwcvbbsksumglmxvbzm.supabase.co/functions/v1/platnosci"
  PAY_URL: "",

  // Strona z podziękowaniem (dziekuje.html)
  APP_URL: "https://zadbany-pazurek-app.vercel.app", // adres aplikacji
  MEET_INFO: "W każdą niedzielę o 20:00 czasu polskiego. Link do spotkania znajdziesz w aplikacji.", // opcjonalnie własny tekst o terminie spotkań (puste = „termin i link w aplikacji”)

  // Linki
  PRIVACY_URL: "https://zadbany-pazurek-app.vercel.app/prywatnosc.html",
  TERMS_URL: "https://zadbany-pazurek-app.vercel.app/regulamin.html",
  INSTAGRAM_URL: "https://www.instagram.com/"
};
