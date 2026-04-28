# Media Platform (Docker) - "Make it run" pack

Ovo je mali paket da ti smanji šanse da se opet zaglaviš na istim greškama.

## 0) Šta ovo rešava (ono što smo videli kod tebe)
1) Strapi CMS se gasi jer:
   - pita da instalira admin zavisnosti i nema interaktivan terminal,
   - ili izbaci grešku da /app/public "ne postoji / nije dostupan".
2) Web (Next) baca "fetch failed" ili ECONNREFUSED jer pokušava da dođe do Strapi-ja na localhost:1337 iz KONTEJNERA (a tamo localhost nije tvoj PC, nego sam kontejner).

## 1) Kako da koristiš ovo (najjednostavnije)
1) Raspakuj sve fajlove u ROOT projekta:
   C:\Users\Ilhan\Desktop\media-platform-fixed

2) Pokreni po redu (dupli klik ili CMD):
   A) 01-fix-cms-public.bat
   B) 02-install-cms-admin-deps.bat
   C) 03-reset-and-up.bat

3) Posle toga otvori:
   - Strapi admin: http://localhost:1337/admin
   - Web: http://localhost:3000

Ako web i dalje baca "fetch failed", idi na deo 4 (STRAPI_URL fix).

## 2) Ako želiš preko CMD (ručno)
U CMD:
cd C:\Users\Ilhan\Desktop\media-platform-fixed

Pa onda:
- docker compose run --rm cms sh -lc "mkdir -p /app/public && chmod 755 /app/public && echo ok > /app/public/.keep && ls -la /app/public"
- docker compose run --rm cms sh -lc "npm install"
- docker compose down -v
- docker compose up --build

## 3) Najčešće greške i šta znače
### A) "The public folder (/app/public) doesn't exist or is not accessible"
To znači da u KONTEJNERU Strapi ne vidi folder /app/public.
Fiks: 01-fix-cms-public.bat (pravi folder i daje permisije).

### B) "Would you like to install these dependencies now? (Y/n)" pa se ugasi
Docker log nije interaktivan, Strapi pita a ne dobije odgovor.
Fiks: 02-install-cms-admin-deps.bat (npm install unapred).

### C) Web: ECONNREFUSED / fetch failed
Web kontejner često pokušava da gađa Strapi na http://localhost:1337.
Ali "localhost" unutar kontejnera nije tvoj komp, nego taj kontejner.
Fiks: u docker-compose.yml dodaj STRAPI_URL na http://cms:1337 (servis ime).
Detalji su u fajlu: 04-compose-changes.txt

## 4) Obavezno proveri docker-compose (STRAPI_URL)
Kod tebe se u kodu koristi env STRAPI_URL u Next-u.
Server-side fetch mora ići ka: http://cms:1337

U docker-compose.yml, pod web: environment dodaj/izmeni:
- STRAPI_URL: http://cms:1337
- NEXT_PUBLIC_STRAPI_URL: http://localhost:1337   (ovo je za browser, ako ti treba na frontendu)

Tačan snippet imaš u 04-compose-changes.txt

## 5) Brzi check lista ako opet zapne
- docker compose ps (da li su cms i db up?)
- docker compose logs -f cms
- docker compose logs -f web
- da li je port zauzet: 1337 ili 3000 (nekad drugi proces drži port)
- ako si menjao compose: docker compose down -v pa docker compose up --build

## 6) Napomena
Ovo ne menja tvoj projekat automatski osim što bat skripte izvrše komande u dockeru.
Za docker-compose izmene, otvori fajl ručno i primeni snippet.

Ako zapne, pošalji screenshot "docker compose ps" i poslednjih 30 linija "docker compose logs cms".
