# Provera činjenica i privatni prijem

Ove kolekcije nisu integracija sa iVerify/UNDP-om. Deploy ne kreira niti objavljuje izmišljene provere. AI može pomoći pripremi nacrta; objavu potvrđuje odgovoran urednik.

## Urednički rad

1. **Provera činjenica** je zasebna kolekcija, bez obaveznog članka. Sadrži tvrdnju, izvor, govornika/datum kada su poznati, jednu stabilnu ocenu (`true`, `partly_true`, `false`, `misleading`, `unverifiable`), obrazloženje, kontekst, izvore sa datumima pristupa, potpis i datum provere. Prevodi su postojeći sufiksni atributi `_en`, `_tr`, `_fr`, `_de`, `_es`, `_el`, `_ar`; srpski je osnovna vrednost. `unverifiable` znači da nema dovoljno dokaza za zaključak, a ne da je tvrdnja netačna.
2. Sačuvati nacrt, pregledati tvrdnju, dokaze, ocenu i sve prevode. U panelu **Urednička potvrda provere** potvrditi pregled sačuvane verzije. Server proverava prijavljenu admin sesiju i dozvole čitanja/objave tog modela i zapisa; identitet ne preuzima iz zahteva. Zastarela verzija se odbija sa HTTP 409.
3. Posle potvrde koristiti običan **Publish**. Generički Content Manager i Entity Service ne mogu objaviti nepotvrđen zapis. Grupna objava je namerno blokirana da bi svaki zapis dobio svoj pregled. Promena javnog sadržaja, uključujući prevode, komponente izvora i ispravki, poništava potvrdu i vraća zapis u nacrt. Menjanje interne beleške ne poništava pregled.
4. Naknadnu ispravku upisati u javnu komponentu **Javna ispravka**, sa datumom, napomenom i prevodima; zatim ponoviti pregled i objavu. Objavljeni pregled sadrži vidljivu istoriju ispravki i vreme poslednje izmene.
5. **Prijave za proveru (privatno)** sadrže nove prijave, status (`new`, `in_review`, `processed`, `rejected`), interni komentar i vezu ka proveri. Kontakt i originalni screenshot ostaju privatni. Screenshot se preuzima samo kroz admin panel sa proverom RBAC-a, nikada preko Media Library/javnog URL-a.
6. **Primljena saradnja (privatno)** sadrži uredničke predloge sa `/contribute`. Redakcija obrađuje status i interne beleške u CMS-u. Objava predloga kao članka nije automatska.

Super Admin treba da dodeli željenim uredničkim ulogama pravo čitanja/uređivanja novih privatnih kolekcija i čitanja/objavljivanja provera. Prava javne uloge za privatne kolekcije se ne uključuju. Nova API kolekcija nema generičke javne REST rute.

## Javni API i privatnost

- `GET /api/fact-checks` i `GET /api/fact-checks/:slug`: isključivo objavljeni zapisi sa važećom serverskom potvrdom sačuvanog sadržaja; eksplicitna javna projekcija, bez internih beležaka, privatnog identiteta pregleda, kontakata ili originalnih priloga. Parametri `publicationState`, `fields` i `populate` ne mogu proširiti projekciju. Lista podržava `pagination[page]`, `pagination[pageSize]` (1–50) i `filters[slug][$eq]`.
- `POST /api/fact-check-submissions/submit`: JSON `{data:{claim,sourceUrl?,contact?,lang,website?,screenshot?}}`; `screenshot` je `{name,mimeType,base64}`. Prihvataju se PNG/JPEG/WebP sa potvrđenom binarnom signaturom i stvarnim ograničenjem od 2 MiB. SVG i MIME zamena se odbijaju. Fajl se čuva u privatnom JSON polju baze, bez javnog Upload zapisa.
- `POST /api/contribute-page/submit`: postojeća polja obrasca; `submissionEnabled=false` uvek odbija nove prijave. Pozitivan odgovor dolazi tek kada je privatni DB zapis sačuvan. Greška baze vraća 503 bez potvrde prijema.
- Oba direktna CMS endpointa imaju validaciju i ograničavanje učestalosti po stvarnom mrežnom susedu (socket; 30/10 min), ponovljenom sadržaju (3/10 min) i ukupnom broju zahteva (300/10 min). Ne veruju proizvoljnom `X-Forwarded-For` ili `ctx.ip` kada je proxy uključen; posrednički server deli grubu mrežnu kvotu, uz dodatni postojeći limiter web forme. Honeypot vraća grešku, bez lažne potvrde. Stvarni streaming JSON parser ima zasebno ograničenje od 3 MiB za ova dva endpointa, uključujući chunked zahteve. Postojeći limit od 25 MB za urednik/ostali CMS ostaje isti. Ograničenje učestalosti je procesno; novi proces počinje novu vremensku kvotu.
- Privatni original: `/content-manager/fact-check-submissions/:id/attachment?download=1`, uz proveru autentifikovanog urednika i prava čitanja priloga. Odgovor ima `private, no-store`, `nosniff` i bezbedan `attachment` naziv. Nijedan javni endpoint ne vraća base64 ili putanju do originala.

## Saradnja: konfiguracija i stvarno stanje

Pre izmene je javna spremnost zahtevala **sva četiri** uslova: `submissionEnabled`, validnog primaoca, email servis sa metodom `send` i `CONTRIBUTE_SUBMISSION_READY=true|1|yes`. Ovlašćeno čitanje produkcije 22. oktobra 2026. potvrdilo je `submissionEnabled=true` i podešen CMS primalac; javni API je istovremeno vraćao `submissionFormReady=false`. Primalac i otvaranje stoga nisu bili uzrok. Bez čitanja privatnog okruženja ne može se dokazati da li nedostaje flag ili raspoloživ email transport, pa se precizniji uzrok ne pretpostavlja.

Sada je autoritativan prijem u trajnu privatnu CMS bazu. `submissionFormReady` postaje true samo kada je saradnja otvorena i stvarni upit nove privatne kolekcije uspe. Zatvaranje u CMS-u zaustavlja i server; postojeći `contribute-page` lifecycle, cache tag i frontend invalidacija ostaju očuvani. Ako CMS ili skladište nisu dostupni, readiness ostaje false, a upis ne potvrđuje uspeh.

Email je opcionalno obaveštenje posle sačuvanog zapisa. Postojeći `CONTRIBUTE_RECIPIENT_EMAIL` ima prioritet nad privatnim `submissionRecipientEmail`; postojeći `CONTRIBUTE_SUBMISSION_READY` sada upravlja samo pokušajem email obaveštenja, a ne dostupnošću trajnog prijema. Servis se ne predstavlja kao funkcionalan samo zato što ima `send`: greška slanja se beleži, sačuvana prijava ostaje vidljiva redakciji. Nijedan primalac, ključ ili email transport nije dodat u javni JSON ili klijentski bundle.

## Provere

`node scripts/verify-fact-check-workflow.cjs` proverava privatnost, dozvole i identitet urednika, zabranu neodobrene/grupne objave, zastarelo odobrenje, ponovno odobravanje posle izmena tvrdnje/dokaza/ocene/prevoda/ispravki, validaciju originalnog fajla, pristup originalu, direktno CMS ograničenje slanja, zatvorenu saradnju, neuspešno trajno čuvanje i odsustvo lažne potvrde, opcionu email grešku posle sačuvanog zapisa i stvarni chunked limit parsera. Test koristi isključivo lokalne fixture podatke, lažni email servis i privatan localhost server; ne šalje stvarne email poruke i ne upisuje test sadržaj u produkciju.

`npm run verify:fact-checks:integration` podiže stvarni Strapi u novom, izdvojenom direktorijumu sa svežom SQLite bazom i nasumičnim lokalnim admin tajnama. Ne čita produkcione kredencijale i isključuje email/revalidacione ključeve. Proverava stvarnu admin prijavu, zabranu native Content Manager objave bez potvrde, objavu posle potvrde i poništavanje posle izmene komponente izvora. Takođe proverava sačuvan privatan original, zabranu anonimnog preuzimanja, dozvoljeno preuzimanje običnog urednika sa eksplicitnim pravom na screenshot i HTTP 403 po uklanjanju tog prava. Otvaranje/zatvaranje saradnje proverava stvarnim HTTP zahtevima i brojem sačuvanih redova. Postojeći middleware vraća prazan HTTP 204 za neke nepostojeće API rute; test u tom slučaju zahteva potpuno odsustvo tela, nikada prihvatanje podataka privatnog reda.

Provera 23. oktobra 2026: **85 funkcionalnih/unit i 25 stvarnih Strapi/SQLite provera uspešno**, bez stvarnih email poruka ili produkcionih upisa. Integracioni test odbija ponovnu upotrebu postojećeg test direktorijuma; promenljiva `CMS_EDITORIAL_QA_DIR` može zadati novu praznu lokaciju radi čuvanja izveštaja i baze za reviziju.

Production CMS build: `npm run build`. Baza se sinhronizuje standardnim Strapi deploy postupkom; postojeće kolekcije, tajne i infrastruktura se ne menjaju. Posle deploya proveriti praznu javnu biblioteku, odbijanje anonimnog admin pregleda/priloga, readiness otvorene/zatvorene saradnje i jedan jasno označen kontrolisan privatni unos ako je redakcija odobrila takvu proveru. Test provere ne objavljivati kao stvaran sadržaj.
