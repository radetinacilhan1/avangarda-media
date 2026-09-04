# Avangarda: optimizacija i regresione provere — 4. septembar 2026.

## Status

Lokalna implementacija i Save/Publish end-to-end provera su završene; zadatak nije proglašen završenim dok se odvojeno ne potvrde produkcioni deployevi. Status push-a i deployeva beleži se posebno ispod. Nisu uključeni plaćeni servisi, promene plana, keep-alive pingovi ni produkcioni load testovi.

Polazno stanje: main / origin/main, commit `f3705d5`. `git pull --ff-only` je završen bez novih izmena. Nepovezane korisničke izmene i upload fajlovi nisu uključeni u commitove.

## 1. CPU: dokazi i uzrok

Read-only Vercel Usage za period 5. avgust–4. septembar pokazao je 4 h 7 min od 4 h uključenog Fluid Active CPU vremena (103,1841%) na nivou naloga. Avangarda je činila približno 3 h 2 min / 73,7%; SPONA oko 1 h 5 min / 26,3%. SPONA nije menjana. Limit je zajednički: optimizacija Avangarde sama ne predstavlja dokaz ukupne buduće uštede naloga.

U pregledanom 12-časovnom Observability prozoru zabeleženo je 160 invokacija, 0 grešaka i 0 timeout-a, P75 Active CPU 769 ms, P75 TTFB 210 ms i 70,6% cold start-ova. Najveće posmatrane grupe: početna 36 invokacija / 33 s CPU, profili 16 / 12 s, arhiva 21 / 12 s, članci 8 / 10 s. External API prikaz je beležio 704 CMS poziva. To nije broj CMS poziva po pojedinačnom članku.

Pregled koda je otkrio konkretne mehanizme nepotrebnog rada:

- Zajednički root layout je forsirao dinamičko renderovanje. Jezički prefiksi su rewritovani na query-param rute; middleware je postavljao cookie na javnim odgovorima.
- Članak i metadata nisu delili dovoljno usko i stabilno dohvaćanje; sidebar je zavisio od velikog skupa članaka sa nepotrebnim sadržajem.
- Brojač pregleda pozivao je article update lifecycle, koji je tretirao svaki pregled kao uredničku izmenu i invalidirao cache. Time je čitanje članka rušilo korist cachea.
- Sitemap je koristio šira urednička dohvaćanja nego što su potrebni URL-ovima.

Ovo objašnjava potrošnju, ali nije precizna atribucija celog Vercel CPU računa pojedinačnom uzroku. Trajanje HTTP odgovora nije isto što i Active CPU vreme.

## 2. Merenja pre i posle

### Produkcija pre izmene

Samo po jedan kontrolisani GET za sledeće rute:

| Ruta | HTTP | Ukupno vreme | HTML | Cache |
|---|---:|---:|---:|---|
| /sr | 200 | 3.244 s | 146274 B | X-Vercel-Cache: MISS; Age: 0 |
| /a/od-krvave-sake-do-muzejskog-zida-kako-protest-proizvodi-umetnost?lang=sr | 200 | 7.474 s | 123529 B | X-Vercel-Cache: MISS; Age: 0 |

Oba odgovora: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` i serverski `Set-Cookie` za jezik.

### Lokalno posle izmene

Izolovani production Next build iz git archive + samo editor izmena, iza GET-only proxyja ka lokalnom CMS-u. Proxy blokira CMS upise i broji stvarne odlazne GET zahteve. Lokalni podaci, hardver i mreža razlikuju se od produkcije; sledeći brojevi nisu pošten A/B dokaz produkcione uštede.

| Scenario članka /sr/a/article-3 | HTTP | Vreme | Next cache | CMS GET |
|---|---:|---:|---|---:|
| Hladno učitavanje | 200 | 318 ms | MISS | 8 |
| Odmah ponovljeno | 200 | 16 ms | HIT | 0 |
| Posle autorizovane invalidacije | 200 | 198 ms | MISS | 8 |
| Ponovljeno posle regeneracije | 200 | 18 ms | HIT | 0 |
| CMS nedostupan, poznat dobar cache | 200 | 17 ms | HIT | 0 |
| Istek TTL-a tokom CMS greške | 200 | 155 ms | STALE | 8 neuspelih pokušaja |

HTML članka: 98001 B; svi odgovori bez serverskog Set-Cookie. Poslednja dva odgovora zadržala su identičan prethodni HTML. Za ubrzanu proveru isteka korišćen je isključivo lokalni QA override od 2 s; normalni podrazumevani CMS TTL je 300 s. Ranija provera sa normalnim TTL-om pokazala je članak sa s-maxage=300, a početnu sa s-maxage=60 zbog najkraćeg postojećeg homepage dohvaćanja.

Produkcioni rezultat POSLE izmene i nova Vercel CPU potrošnja nisu dostupni: kod nije pushovan. Nema obećanog procenta uštede.

## 3. Cache i rutiranje

- React request memoization, Next Data Cache / tagovi i deduplikacija samo trenutno aktivnih javnih GET zahteva. Nema novog trajnog in-memory cachea.
- Native ISR rute za jezičke početne, članke, profile, teme i sekcije. Ostale query-zavisne stranice zadržavaju dinamičko ponašanje u `(legacy)` route grupi.
- Postojeće query adrese članaka/profila/tema/sekcija preusmeravaju se na jezički prefiks; interni linkovi, canonical i hreflang koriste prefikse. Prefix rute imaju serverski lang/dir iz parametra.
- 40 stranica premešteno je bez promene sadržaja (Git R100); implementacija članka je optimizovana. Root HTML shell izdvojen je u SiteDocument.
- Middleware ne šalje jezički Set-Cookie; postojeći klijentski sync pamti izbor. Statički fajlovi i API isključeni su iz matchera.
- Uži article/sidebar/sitemap upiti. Top-read, najnoviji i autorovi tekstovi imaju zasebne upite, pa stari tekstovi nisu ograničeni na poslednjih 240 članaka.
- Postojeći CMS_REVALIDATE_SECRET i timing-safe provera ostaju. Dodati lifecycle tagovi za dosad nepokrivene uredničke tipove. Samo viewCount/updatedAt izmene ne invalidiraju; urednički Save/Publish/Unpublish payload-i i dalje invalidiraju.
- HTTP greške ne pretvaraju neuspelu ISR regeneraciju u uspešnu praznu stranicu. Pre on-demand invalidacije radi se jednokratna CMS health provera: pri poznatoj nedostupnosti vraća 503/deferred, ne briše dobar cache. Ovo nije periodični ping.
- Ograničenje: Next 14 on-demand purge nije atomska stale-on-error zamena. Ako CMS padne između health provere i narednog dohvaćanja, garancija za taj uski prozor nije potpuna; novi nekeshirani URL nema prethodni sadržaj. Neuspela webhook isporuka nema novi retry servis; vremenski TTL ostaje rezervni mehanizam.

Pretraga, assistant, download i mutirajući API-ji zadržavaju potrebnu dinamičnost. PDF ruta i njena bezbednosna provera nisu menjane. Sat i slider imaju samo UI intervale; nisu novi mrežni pingovi. Air quality se dohvaća pri izboru grada/jezika, bez dodatnog periodičnog pollinga. OG putanja nije uvodila novu dinamičku generaciju slike. Production robots ostaje otvoren za Google; ograničenje indeksiranja važi za Vercel preview.

## 4. Naslov članka

Samo `.article-header__title`: maksimalno 4.8rem → 3.9rem, odnosno 18,75% manje. Desktop `clamp(2.35rem, 4.2vw, 3.9rem)`, line-height 0.98, max-width 20ch, prelamanje dugih reči i uravnotežen tekst. Mobilna veličina koristi postojeći responzivni sistem; korigovani su razmaci naslova i byline-a. Slider, kartice i homepage naslovi nisu menjani.

Dugačak i kratak naslov provereni su na sr/en/ar, LTR/RTL, 360/390/430/768/1440/1920 px, pri scale=1. Read-only HTML/CSS fixture koristi stvarni article layout, bez menjanja CMS-a. Stabilno učitani rasporedi nisu prelivali niti prekrivali sledeći blok. Jedno prerano merenje pre završetka CSS učitavanja ponovljeno je posle load događaja i prošlo. Poseban CLS benchmark nije rađen.

## 5. Editor i renderer

Projekat koristi Strapi 4.25.x i postojeće Markdown richtext polje, NE Strapi 5 Blocks. Zato nije sprovedena Strapi 5 nadogradnja, zamena tipa polja ni migracija baze.

Postojeće admin bootstrap proširenje sada nudi: paragraf, H2/H3/H4, bold, italic, underline, precrtano, obe liste, citat, link/uklanjanje linka, native Media Library sliku, video URL, horizontalnu liniju, inline code, code block, undo/redo i živi vizuelni preview. Native preview ostaje. Toolbar ima tooltipove i mobilno prelamanje/skrolovanje. Nepromenjeni media čvorovi u živom preview-u ostaju montirani dok se uređuje tekst drugde.

Važna ograničenja:

- Ovo je postojeći Markdown editor sa formatiranim prikazom uživo, ne pravi inline WYSIWYG/Word niti podržani Strapi 5 Blocks extension.
- Integracija je u postojećem bootstrap-u, uz CodeMirror API i semantičke/native selektore; nema menjanja node_modules ni generisanih CSS klasnih selektora. Ipak zavisi od Strapi 4 DOM strukture, pa posle upgrade-a zahteva UI regresiju.
- Slika se bira native Media Library komandom. Alt/caption/kredit ostaju u postojećim „Fotografije i potpisi”; položaj/širina u postojećim „Fotografije u tekstu”. Poseban blok ne treba duplirati i Markdown slikom.
- Preview prikazuje Markdown sliku i njen alt/title, ali ne spaja uživo sva odvojena CMS image-credit polja. Javni renderer ih i dalje koristi.
- Video iz Media Library unosi se kopiranjem URL-a postojećeg fajla, ne novim native video picker-om. YouTube/Vimeo imaju allowlist; proizvoljni iframe/HTML embed se ne prihvata.
- Novi format je backward-compatible Markdown direktiva `@[video](URL "opis")`; stari Markdown članci i image-credit/bodyImages renderer ostaju. Nije dodata podrška za proizvoljan Blocks JSON, jer takvo polje nije u upotrebi.
- Video ima kontrole, pristupačan opis, responzivan okvir i bez autoplay-a. Iframe je lazy; video fajl koristi preload=metadata. Code fence ne pretvara primer direktive u aktivan video.

Posle korisničke prijave u lokalni CMS provereno je svih osam richtext polja. UI provera je otkrila i ispravila tri integraciona problema: native „More” koristi aria-labelledby pa toolbar nije bio prepoznat; Undo je gubio Redo istoriju zbog Strapi setValue efekta pri gubitku fokusa; mobilni header spacer i toolbar širina izazivali su preklapanje/sužavanje. Sada se toolbar prepoznaje preko native semantike, istorijska komanda prvo fokusira CodeMirror, a mobilni header i toolbar pravilno zauzimaju prostor. Native Preview režim isključuje dodatne komande.

Video komanda koristi pristupačan HTML dijalog umesto window.prompt, koji ugrađeni pregledač ne podržava. Na 430 px provereni su unos, odbijanje neodobrenog domena i umetanje dozvoljenog YouTube URL-a u nesnimljen test sadržaj. Preview iframe ima youtube-nocookie domen, title, loading=lazy, autoplay=0 i controls=1. Test izmene su odbačene ponovnim učitavanjem; video nije sačuvan niti objavljen. Stvarna reprodukcija videa nije potvrđena ovim testom.

„Nova oznaka”, „Nova tema” i „Nova lokacija” su sačuvane. Nakon izričitog odobrenja korisnika, stvarni UI test otkrio je postojeću ugnježdenu quick-create formu: submit je osvežavao članak GET zahtevom, bez kreiranja zapisa. Dijalog je izdvojen React portalom izvan Strapi article forme, uz očuvanje stilova. Posle toga sva tri quick-create POST-a, Save i Publish prolaze iz prvog pokušaja. Nema izmene modela, baze šeme ili postojećih relacija.

Lokalni end-to-end tok (production Next, normalni TTL 300 s): nacrt nije izložen javnim API-jem; Save relacija HTTP 200; Publish HTTP 200; javna stranica prikazuje novi članak, naslovnu 37.png, body sliku 43.png i formatiranje. Na već objavljenom test članku promenjeni su podnaslov i naslovna na 35.png, pa Save HTTP 200. Sledeći javni zahtev bez redeploy-a vratio je novu verziju, cache MISS, oko 304 ms zajedno sa odvojenom API proverom. U pregledaču obe slike uspešno učitane, bold weight=800 i italic font-style=italic. Posle uklanjanja test članka invalidacija uklanja njegov sadržaj i sa javne rute. Next streaming not-found odgovor ovde nosi HTTP 200, ali ne sadrži članak; javni article API vraća prazan niz.

## 6. Regresione provere

| Provera | Rezultat / granica dokaza |
|---|---|
| Frontend production build | Prošao u lokalnom Docker okruženju i u izolovanoj release kopiji iz git archive + samo editor izmena; bez nepovezanih korisničkih fajlova |
| Strapi admin production build | Prošao i posle poslednje editor/CSS izmene |
| TypeScript | Prošao u svežem Docker build-u i zasebnim tsc --noEmit |
| verify-public-content.cjs | Prošao: legacy formatiranje, slike/caption, sanitizacija, video allowlist, code fence, preview, canonical/hreflang/linkovi; regresije za aria-labelledby More, fokus pre Undo/Redo, canonical authors/publicProfile vezu i sr/en/ar lokalizovane autorske tekstove |
| verify-revalidation.cjs | Prošao: in-memory editorial/view-only lifecycle scenariji, bez DB upisa |
| verify-isr.cjs | Prošao: home jezici, HIT bez CMS poziva, secret 401/200, invalidacija, simulirani CMS outage |
| /sr, /en, /ar | HTTP 200; sr/LTR i ar/RTL HTML proveren |
| Postojeći članak/fotografije | Stvarni lokalni članak i slika prikazani; renderer regresije prošle |
| Profili i arapska navigacija | Arapski profil i /ar linkovi prikazani. Lokalni author ima publicProfile:null pa prikazuje 0, bez menjanja podataka. In-memory regresija potvrđuje 2 stvarno autorska teksta, ignoriše zastarelu curated relaciju i lokalizuje sr/en/ar naslove. Postojeći prikaz profila ograničen je na 6 kartica i tu dužinu koristi u oznaci broja; taj raniji limit nije menjan |
| CARTO mapa | Lokalno prikazana mapa, tile-ovi, kontrole i klasteri; postojeći key kod netaknut, bez uočenih console error/warn |
| Pravni kompas | Stranica prikazana; lokalni HTTP upload URL-ovi i dalje se odbijaju postojećim HTTPS/SSRF guard-om. Na postojećoj produkciji kontrolisani inline i attachment GET za ustav-republike-srbije vratili su HTTP 200, application/pdf, 303100 B i odgovarajući Content-Disposition; 3.142 s / 1.661 s. Ovo je baseline, ne provera novog deploy-a |
| OG / WhatsApp | OG image i canonical prisutni u server HTML-u; stvarno WhatsApp preuzimanje preview-a nije provereno |
| Sitemap / SEO | Lokalni sitemap odgovara, članci su zastupljeni; canonical i devet jezičkih alternata uključuju x-default |
| Mobilni CMS | Proveren na 360/390/430 px posle ispravki: dokument bez horizontalnog prelivanja, naslov više ne prekriva formu, toolbar koristi raspoloživu širinu i skroluje dodatne komande. H2/H3/H4, Undo/Redo i native Preview provereni u UI-ju |
| Save i Media Library | Jedan novi lokalni nacrt #28 sačuvan iz prvog pokušaja (HTTP 200), pa ponovo učitan. Postojeća 37.png izabrana za naslovnu, 43.png umetnuta u sadržaj i vidljiva u živom preview-u. Postojeći medijski fajlovi nisu menjani |
| Publish, quick-create, slika nakon objave | Prošlo nakon izričitog odobrenja: tri quick-create relacije, Save, Publish, zatim izmena podnaslova/slike kroz Save → stvarni CMS webhook → regenerisana javna stranica bez redeploy-a. Sve privremene test zapise korisnik je odobrio i za uklanjanje; uklonjeni su i odsustvo potvrđeno API-jem |
| Cloudinary | Provider i njegove tajne netaknuti; produkcioni PDF sa postojećeg Cloudinary URL-a uspešno preuzet kroz download rutu. Novi upload nije rađen |
| Supabase Data API | Nikakva promena podešavanja nije rađena; stanje u udaljenoj konzoli nije nezavisno ponovo potvrđeno |
| git diff --check | Prošao |

Frontend nema test script u package.json. CMS ima `verify:editorial-workflow`, koji kreira i uklanja članke, profile i relacije u bazi. Pregled pokazuje i da createStrapi().load() pokreće schema sync i postojeći app bootstrap, pa taj test nije bezbedan za pokretanje nad postojećom bazom u okviru ograničenja ovog zadatka. Nije pokrenut. Umesto njega izvršen je odobren, ograničen UI tok sa jednim člankom i tri relacije; profili provereni read-only i in-memory bez kreiranja novog autora/profila.

Build upozorenja: postojeći Autoprefixer start/end kompatibilnost, zastareo caniuse-lite, lokalno nedostajući TRANSFER_TOKEN_SALT. Nisu automatski menjane zavisnosti ili tajne.

## 7. Zaštita sadržaja i naredni uslov

Nije izvršena migracija, urednička izmena postojećeg članka, prevoda, slike ili veze autora. Nisu menjane tajne, Supabase podešavanja, SPONA/RIC niti plaćeni plan. QA proxy ne propušta upise u CMS; odobreni UI test upisuje direktno preko prijavljenog lokalnog admina. Privremeni članak #28 (`codex-ui-20260904-1735`), oznaka #18 (`…-tag`), tema #24 (`…-topic`) i lokacija #9 (`…-location`) kreirani su/testirani, zatim odobreno uklonjeni kroz CMS. Odsustvo sva četiri zapisa potvrđeno je javnim API-jem; medijski fajlovi 35/37/43.png nisu obrisani niti izmenjeni. Nema preostalih test zapisa iz ovog toka. Ranije korisničke izmene u about/impressum, CMS bootstrap podacima, generisanim fajlovima i uploadima nisu commitovane u ovaj rad.

Korisnički untracked `apps/web/src/app/not-found.tsx` sačuvan je bez promene sadržaja na `apps/web/src/app/(legacy)/not-found.tsx`, prilagođeno razdvajanju layout-a; nije dodat u commit. Global-error i ostali korisnički untracked fajlovi nisu prisvojeni.

Ranije odbijanje test objave nije zaobiđeno; korisnik je naknadno izričito odobrio konkretan lokalni tok i uklanjanje. Lokalni Save/Publish/quick-create uslov sada je ispunjen. Slede završna provera release verzije, push, odvojena potvrda Vercel i Render deploy-a i najviše 1–2 kontrolisana produkciona zahteva po kritičnoj ruti. Bez produkcione potvrde status ostaje nepotpun.

Lokalni web na portu 3000 koristi production QA image za stvarnu Save/Publish → webhook → ISR proveru, pokrenut samo za web servis pomoću `.codex-temp/qa-production.yml`; CMS, baza, worker i Meili nisu restartovani u ovom nastavku. Ubrzani TTL nije uključen u ovu instancu. Ugrađeni pregledač vraćen je na normalnu širinu; test nacrt više ne postoji.

## 8. Commitovi i deploy

1. `7efbcb5` — Optimize localized ISR and CMS cache invalidation.
2. `b70a96a` — Refine article-only responsive headline typography.
3. Editor/renderer commit nosi poruku `Enhance existing CMS editor and safe rich-text media rendering`; konačan hash je u završnoj poruci i git log-u (izveštaj je deo tog commita).

Vercel: nije deployovano. Render: nije deployovano. Main na origin-u nije pushovan ovim radom.

## 9. Fajlovi obuhvaćeni ovim radom

Putanje su relativne u odnosu na repozitorijum. Kod premeštenih stranica ovo su nove putanje; git diff --name-status f3705d5 HEAD pokazuje i stare putanje. Nepovezane lokalne izmene nisu na spisku.

- `apps/cms/config/middlewares.js`
- `apps/cms/scripts/verify-revalidation.cjs`
- `apps/cms/src/admin/components/QuickCreateRelations/index.js`
- `apps/cms/src/admin/components/QuickCreateRelations/quick-create-relations.css`
- `apps/cms/src/admin/mobile-admin.css`
- `apps/cms/src/admin/richtext-editor-enhancements.js`
- `apps/cms/src/api/about-page/content-types/about-page/lifecycles.js`
- `apps/cms/src/api/comment/content-types/comment/lifecycles.js`
- `apps/cms/src/api/contribute-page/content-types/contribute-page/lifecycles.js`
- `apps/cms/src/api/daily-question/content-types/daily-question/lifecycles.js`
- `apps/cms/src/api/editorial-direction/content-types/editorial-direction/lifecycles.js`
- `apps/cms/src/api/editorial-signal/content-types/editorial-signal/lifecycles.js`
- `apps/cms/src/api/human-right/content-types/human-right/lifecycles.js`
- `apps/cms/src/api/human-rights-page/content-types/human-rights-page/lifecycles.js`
- `apps/cms/src/api/impressum/content-types/impressum/lifecycles.js`
- `apps/cms/src/api/legal-resource/content-types/legal-resource/lifecycles.js`
- `apps/cms/src/api/signal/content-types/signal/lifecycles.js`
- `apps/cms/src/revalidate-frontend.js`
- `apps/web/next.config.js`
- `apps/web/scripts/article-typography-fixture.cjs`
- `apps/web/scripts/qa-server.cjs`
- `apps/web/scripts/verify-isr.cjs`
- `apps/web/scripts/verify-public-content.cjs`
- `apps/web/src/app/(legacy)/a/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/about/page.tsx`
- `apps/web/src/app/(legacy)/archive/page.tsx`
- `apps/web/src/app/(legacy)/author/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/contact/page.tsx`
- `apps/web/src/app/(legacy)/contribute/page.tsx`
- `apps/web/src/app/(legacy)/cookie-policy/page.tsx`
- `apps/web/src/app/(legacy)/dokumentarci/page.tsx`
- `apps/web/src/app/(legacy)/editorial-principle/page.tsx`
- `apps/web/src/app/(legacy)/front/page.tsx`
- `apps/web/src/app/(legacy)/galerije/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/galerije/page.tsx`
- `apps/web/src/app/(legacy)/help/page.tsx`
- `apps/web/src/app/(legacy)/impresum/page.tsx`
- `apps/web/src/app/(legacy)/interaktivno/algoritam/page.tsx`
- `apps/web/src/app/(legacy)/interaktivno/cekaonica/page.tsx`
- `apps/web/src/app/(legacy)/interaktivno/moc/page.tsx`
- `apps/web/src/app/(legacy)/interaktivno/neutralni-covek/page.tsx`
- `apps/web/src/app/(legacy)/interaktivno/page.tsx`
- `apps/web/src/app/(legacy)/interaktivno/rogozna/page.tsx`
- `apps/web/src/app/(legacy)/kontra/page.tsx`
- `apps/web/src/app/(legacy)/layout.tsx`
- `apps/web/src/app/(legacy)/ljudska-prava/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/ljudska-prava/page.tsx`
- `apps/web/src/app/(legacy)/mapa/page.tsx`
- `apps/web/src/app/(legacy)/o-nama/page.tsx`
- `apps/web/src/app/(legacy)/odjek/page.tsx`
- `apps/web/src/app/(legacy)/page.tsx`
- `apps/web/src/app/(legacy)/people/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/podrzi/page.tsx`
- `apps/web/src/app/(legacy)/pravni-kompas/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/pravni-kompas/page.tsx`
- `apps/web/src/app/(legacy)/privacy-policy/page.tsx`
- `apps/web/src/app/(legacy)/search/page.tsx`
- `apps/web/src/app/(legacy)/section/[section]/page.tsx`
- `apps/web/src/app/(legacy)/sistem/page.tsx`
- `apps/web/src/app/(legacy)/teren/page.tsx`
- `apps/web/src/app/(legacy)/terms-of-use/page.tsx`
- `apps/web/src/app/(legacy)/tisina/page.tsx`
- `apps/web/src/app/(legacy)/topic/[slug]/page.tsx`
- `apps/web/src/app/(legacy)/topics/page.tsx`
- `apps/web/src/app/(legacy)/vesti/page.tsx`
- `apps/web/src/app/[lang]/a/[slug]/page.tsx`
- `apps/web/src/app/[lang]/layout.tsx`
- `apps/web/src/app/[lang]/page.tsx`
- `apps/web/src/app/[lang]/people/[slug]/page.tsx`
- `apps/web/src/app/[lang]/section/[section]/page.tsx`
- `apps/web/src/app/[lang]/topic/[slug]/page.tsx`
- `apps/web/src/app/api/comments/route.ts`
- `apps/web/src/app/api/revalidate-cms/route.ts`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/robots.ts`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/components/site-document.tsx`
- `apps/web/src/lib/i18n.ts`
- `apps/web/src/lib/richtext.ts`
- `apps/web/src/lib/security.ts`
- `apps/web/src/lib/seo.ts`
- `apps/web/src/lib/strapi.ts`
- `apps/web/src/lib/video.ts`
- `apps/web/src/middleware.ts`
- `docs/optimization-report-2026-09-04.md`
- `vercel.json`

## Tehničke reference

- [Next.js 14 cache model](https://nextjs.org/docs/14/app/building-your-application/caching) — razlika Data Cache/Full Route Cache i invalidacije.
- [Next.js 14 layouts](https://nextjs.org/docs/14/app/api-reference/file-conventions/layout) — params i više root layout-a.
- [Next.js 14 data fetching/revalidation](https://nextjs.org/docs/14/app/building-your-application/data-fetching/fetching-caching-and-revalidating) — vremenski SWR i čuvanje uspešnih podataka pri grešci.
