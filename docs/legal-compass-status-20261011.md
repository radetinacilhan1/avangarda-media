# Avangarda — stanje desktop popravke i Pravnog kompasa, 11.10.2026.

Desktop popravka je objavljena i produkciono proverena. Katalog svih 66 propisa, prevodi i kod importa su pripremljeni. **Produkcioni import nije izvršen:** nema ovlašćenog administratorskog pristupa postojećem Strapi CMS-u. Nisu kreirani produkcioni nacrti niti novi zakoni. Javna biblioteka zato još nije kompletirana.

## Stvarni rezultati prema zahtevanoj tabeli

| Podatak | Rezultat |
|---|---|
| Ukupno zakona na ciljnoj listi | 66 |
| Već postojećih i kompletnih | 0 potpuno kompletnih; 6 postojećih ima popunjena 72 sadržajna i 16 SEO polja, ali zahteva dopunu ili korekciju |
| Dopunjenih postojećih | 0 u produkciji; pripremljeno 6 dopuna uz očuvanje postojećih uvoda |
| Novokreiranih | 0 u produkciji; 60 nije vidljivo u javnom inventaru. Odsustvo iz nacrta nije provereno |
| Objavljenih | 6 postojećih zakona iz kataloga; 0 novobjavljenih u ovom zadatku |
| Sa kompletnim prevodima | 6 postojećih javnih; 66 pripremljenih, odnosno 528 jezičkih varijanti |
| Sa proverenim zvaničnim izvorom | 65 sa potvrđenim pravnim stanjem za opis; 66 konkretnih URL-ova dostupno. ID 16 ima izvor, ali konačan sudski status nije potvrđen |
| Sa PDF-om za otvaranje | 5 postojećih se tehnički otvara; 2 su zastarela. 3 postojeća PDF-a potvrđena kao aktuelna |
| Sa fajlom za preuzimanje | 6 postojećih dostupno: 5 PDF-ova i 1 DOCX; 2 PDF-a su zastarela |
| Draft / zahteva dodatnu proveru | 1 pripremljen za neobjavljeni nacrt: Zakon o rodnoj ravnopravnosti. Produkcioni nacrt nije kreiran; ukupan broj postojećih nacrta nije poznat |
| Neuspešnih unosa | 0; produkcioni upisi nisu ni pokušani |

Brojevi lokalne simulacije (65 objavljenih i 1 nacrt) nisu produkcioni rezultati. Nije utvrđeno da je svih 60 ostalih propisa MISSING: za to je potreban autentifikovani inventar koji uključuje nacrte. Javnim inventarom obuhvaćeno je 7 resursa: 6 ciljnih zakona i postojeći obrazac zahteva koji je izvan kataloga.

## Desktop navigacija

Uzrok je bila kombinacija skupljanja flex elemenata, minimalne širine nula i nasleđenog overflow-wrap:anywhere, uz ograničenje ukupne širine zaglavlja. Četiri lokalna fajla sada čuvaju cela imena u jednom redu i raspoređuju kontrole prema raspoloživom prostoru. Mobilni drawer, hero, fontovi i prevodi nisu menjani.

- Zaseban commit: [35dfecce](https://github.com/radetinacilhan1/avangarda-media/commit/35dfecce1b6ea9dbdb0239ea9d8388e9d7a20e6b), poslat na main; sva 3 Vercel statusa success.
- Lokalno 48 slučajeva, produkciono 24 slučaja: 8 jezika × 1366/1440/1920 px. Svi nazivi celi i jednoredni, bez prelivanja. Dodatno reflow, granica 770 px, dropdownovi, roditeljski linkovi, Enter/Escape, fokus, klik van i RTL. Mobilni prikazi sr/en/ar provereni.
- Alat nema komandu za fizički browser zoom. Veći zoom proveren je odgovarajućim CSS viewportima i reflow ponašanjem; to nije fizičko menjanje browser zooma.
- Dokaz: [produkcijska matrica](qa/legal-compass-20261011/production-navigation-matrix.json), [prikaz 1180 px](qa/legal-compass-20261011/after-production-navigation-1180.jpg).

## Pravna i urednička provera

Sadržaj je proveravan 10–11.10.2026. Svaki zapis ima poseban checkedAt, konkretne institucionalne izvore, pravni status i 8 jezika. Datum uredničke provere nije upisan kao datum izmene zakona. Devet sadržajnih polja i 16 SEO polja koriste postojeću šemu. Prevodi su urednički prikazi, a ne zvanični prevodi zakona. Kratki opisi i objašnjenja su specifični za propis; dugački tipski pasusi su uklonjeni. Veći tekstovi kod složenih propisa nisu mehanički skraćivani.

Za [Zakon o rodnoj ravnopravnosti](https://www.ustavni.sud.rs/sednice-suda/saopstenja-sa-sednice-suda/saopstenje-sa-8-sednice-ustavnog-suda-odrzane), zvanični Ustavni sud potvrđuje pokretanje postupka i privremenu meru 27.6.2024. Nije potvrđena kasnija konačna odluka ili prestanak mere. Zapis ima verified:false i konkretan reviewReason; importer ga neće objaviti. Mera nije predstavljena kao konačno ukidanje zakona.

Ustav i zakon o pristupu informacijama imaju provereno zastarele postojeće PDF priloge. Pripremljeno je odvezivanje samo njihovih veza nakon potpunog izvoza i provere tačnog starog ID-a/URL-a. Medijski fajlovi se ne brišu. Ustav dobija konkretnu vezu ka aktuelnom PIS tekstu; zakon o pristupu informacijama aktuelan zvanični sudski PDF. Postojeći DOCX zakona o medijima ostaje povezan. Za nacionalne zakone nisu proizvoljno dodavani gradovi; postojeće relacije nisu menjane.

## Kod, testovi i produkciona provera

Stvarna verzija je **Strapi 4.26.1**, sa prevodima u jednom zapisu, a ne Strapi 5 naveden u prilogu. Nema migracije, promene modela, javnih dozvola, direktnog PostgreSQL upisa ili resetovanja baze.

Prethodni zaseban commit [55da080](https://github.com/radetinacilhan1/avangarda-media/commit/55da080fc0408dac3f3f87748c2e021489d25b4b) objavljen je na main; sva 3 Vercel statusa success. Donosi importer, frontend CMS SEO i ispravno preuzimanje postojećeg DOCX-a. Ovaj sledeći paket dodaje kompletan katalog, evidenciju, izveštaj i guardove za dopune; objava koda ne objavljuje sadržaj u CMS-u.

| Provera | Rezultat |
|---|---|
| Frontend production build i TypeScript | PASS za objavljeni frontend 55da080; od tada frontend kod nije menjan |
| Importer integracija na stvarnom Strapi 4.26.1 | 17 scenarija PASS: nacrti, paginacija, izvoz veza, backup, očuvanje, uncertain POST, idempotentnost, konflikt urednika, dokumenti i dopune |
| Ceo katalog u novom izolovanom lokalnom Strapi okruženju | PASS: 6 dopuna i 60 kreiranja, 65 objavljenih i 1 nacrt, obrazac nepromenjen, svih 66 na ponavljanju no-op. Isključivo localhost/SQLite |
| Tehnička validacija svih 66 | PASS: 528 varijanti, 72 sadržajna i 16 SEO polja po novom/merged zapisu, bez praznih prevoda, ispravna grčka/arapska pisma, bez dupliranih slugova, stvarni ID-evi veza, očuvani uvodi i SEO |
| SEO varijacije | Različiti opisi svih 66; postojeći kvalitetan SEO sačuvan čak i kada prelazi ciljanu dužinu |
| Zvanični URL-ovi | 66/66 dostupno; HTTP dostupnost odvojena je od provere pravnog važenja |
| Postojeće javne stranice i metadata | 48/48 PASS: 6 zakona × 8 jezika, naslov, opis, canonical, hreflang i RTL |
| Postojeće preuzimanje | 6/6 HTTP 200; DOCX byte-identičan originalu, ispravan MIME/ekstenzija i nosniff |
| Vizuelna provera Pravnog kompasa | Desktop 1440 px: filter Srbija+Zakon prikazuje 6 unosa; arapski telefon 390 px: RTL i bez horizontalnog prelivanja |

Lokalne provere ne dokazuju produkcionu objavu novih 60 zakona. Za njih nije moguće proveriti javne slugove dok nisu uneti i objavljeni. Dokumenti koji su samo amandmani označeni su kao takvi; konkretno kod ID 61 je osnovni tekst posebno povezan i nije označen kao ceo aktuelni PDF. Kada pouzdan ceo dokument nije potvrđen, nema izmišljenog media ID-a ili PDF-a iz uredničkog sažetka.

## Sačuvani materijal i nastavak

- Import input: [serbia-laws-20261011.json](../apps/cms/data/legal-compass/serbia-laws-20261011.json), SHA-256: 9d5a2bc88a6d3ac3be4603be2fab5af214d1deef6785cfdd92af593038bc6d90.
- Pravni dokazi i evidencija po propisu: [serbia-law-evidence-20261011.json](../apps/cms/data/legal-compass/serbia-law-evidence-20261011.json). Svih 66 je NOT_APPLIED.
- [Tehnička validacija](qa/legal-compass-20261011/catalogue-technical-audit.json) i [provera celog kataloga u Strapi-u](qa/legal-compass-20261011/full-catalogue-local-qa.json).
- [Importer i način nastavka](serbia-law-import.md). Serije od 3 zapisa, serijski zahtevi, ograničen backoff, puni privatni izvoz pre upisa, backup po zapisu, readback pre objave i progress/journal za nastavak.

Jedina pristupna blokada produkcionog izvršenja je ovlašćena administracija CMS-a. Privatni fajl predviđen u ovom zadatku, .codex-temp/legal-compass-20261009/credentials.private.json, nije prisutan; nema ni AVANGARDA_CMS_ADMIN_TOKEN. Povezivanje zahteva postojeći ovlašćeni nalog ili token, ne kreiranje novih korisnika/ovlašćenja. Posle obezbeđenog pristupa najpre se proveravaju nacrti i puni inventar, izvozi backup i ponavlja autentifikovani dry-run; tek tada se primenjuje pregledan plan.

Originalni korisnički checkout nije resetovan ni stageovan. Kod se radi u izdvojenom checkoutu. Poslednja kontrola baselinea našla je samo generisani .strapi-updater.json cache kao razliku; izvorni kod i ostale korisničke izmene su očuvani.

## Stvarne postojeće javne stranice

- [Ustav Republike Srbije](https://avangarda.media/sr/pravni-kompas/ustav-republike-srbije)
- [Zabrana diskriminacije](https://avangarda.media/sr/pravni-kompas/zakon-o-zabrani-diskriminacije)
- [Zaštitnik građana](https://avangarda.media/sr/pravni-kompas/zakon-o-zastitniku-gradjana)
- [Pristup informacijama](https://avangarda.media/sr/pravni-kompas/zakon-o-slobodnom-pristupu-informacijama-od-javnog-znacaja)
- [Životna sredina](https://avangarda.media/sr/pravni-kompas/zakon-o-zastiti-zivotne-sredine)
- [Javno informisanje i mediji](https://avangarda.media/sr/pravni-kompas/legal-azakon-o-javnom-informisanju-i-medijimaresource)

## Evidencija svih 66 propisa

EXISTS_INCOMPLETE označava šest postojećih unosa kojima se dodaje samo konkretna dopuna ili proverena korekcija. PENDING_AUTHENTICATED_INVENTORY se ne sme tumačiti kao potvrđeno MISSING. Ova evidencija je checkpoint istraživanja i pripreme, a ne zamena za CMS progress.json nakon stvarnog importa.

| ID | Propis | Klasifikacija | Stvarna veza | Napomena |
|---|---|---|---|---|
| 1 | Ustav Republike Srbije | EXISTS_INCOMPLETE | [Postojeći javni unos](https://avangarda.media/sr/pravni-kompas/ustav-republike-srbije) | Zastareo PDF; pogrešan izvor. Proverena dopuna i uklanjanje samo veze ka starom dokumentu. |
| 2 | Zakon o zabrani diskriminacije | EXISTS_INCOMPLETE | [Postojeći javni unos](https://avangarda.media/sr/pravni-kompas/zakon-o-zabrani-diskriminacije) | Postojeći uvod i SEO ostaju; dopuna pravnih puteva i režima 52/2021. |
| 3 | Zakon o Zaštitniku građana | EXISTS_INCOMPLETE | [Postojeći javni unos](https://avangarda.media/sr/pravni-kompas/zakon-o-zastitniku-gradjana) | Postojeći uvod i SEO ostaju; dopuna nadležnosti, uslova pritužbe i režima 105/2021. |
| 4 | Zakon o slobodnom pristupu informacijama od javnog značaja | EXISTS_INCOMPLETE | [Postojeći javni unos](https://avangarda.media/sr/pravni-kompas/zakon-o-slobodnom-pristupu-informacijama-od-javnog-znacaja) | Zastareo PDF do 36/2010; sadašnji izvor izostavlja 105/2021. Pripremljena korekcija. |
| 5 | Zakon o zaštiti podataka o ličnosti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/2018/2959-18.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 6 | Zakon o besplatnoj pravnoj pomoći | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2018/87/15/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 7 | Zakon o opštem upravnom postupku | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2016/18/2/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 8 | Zakon o upravnim sporovima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://mduls.gov.rs/wp-content/uploads/ZAKON-O-UPRAVNIM-SPOROVIMA.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 9 | Zakon o zaštiti uzbunjivača | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/2014/3140-14.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 10 | Zakon o sprečavanju korupcije | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.acas.rs/storage/page_files/Zakon%20o%20spre%C4%8Davanju%20korupcije_Redakcijski%20pre%C4%8Di%C5%A1%C4%87en%20tekst%2031_08_2026.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 11 | Zakon o javnom okupljanju | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/2016/3711-15.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 12 | Zakon o udruženjima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://minljmpdd.gov.rs/wp-content/uploads/2025/04/zakon-o-udruzenjima.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 13 | Zakon o zaštiti prava i sloboda nacionalnih manjina | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://minljmpdd.gov.rs/wp-content/uploads/2024/10/Zakon-o-zastiti-prava-i-sloboda-nacionalnih-manjina.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 14 | Zakon o nacionalnim savetima nacionalnih manjina | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://minljmpdd.gov.rs/wp-content/uploads/2024/10/zakon-o-nacionalnim-savetima-nacionalnih-manjina-srb.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 15 | Zakon o službenoj upotrebi jezika i pisama | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://mduls.gov.rs/wp-content/uploads/ZAKON-O-SLUZBENOJ-UPOTREBI-JEZIKA-I-PISAMA040718.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 16 | Zakon o rodnoj ravnopravnosti | NEEDS_REVIEW | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2021/52/3) | NEEDS_REVIEW: konačna odluka ili prestanak privremene mere IUz 85/2021 nisu potvrđeni. |
| 17 | Zakon o sprečavanju diskriminacije osoba sa invaliditetom | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.minrzs.gov.rs/sites/default/files/2021-02/Закон%20о%20спречавању%20дискриминације.doc) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 18 | Zakon o upotrebi znakovnog jezika | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/2015/673-15.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 19 | Zakon o profesionalnoj rehabilitaciji i zapošljavanju osoba sa invaliditetom | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://nsz.gov.rs/filemanager/Files/Dokumenta/Zakoni/Zakon%20o%20prof.%20rehabilitaciji%20i%20zapo%C5%A1ljavanju%20OSI.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 20 | Zakon o sprečavanju nasilja u porodici | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2016/94/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 21 | Porodični zakon | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.vrh.sud.rs/sites/default/files/attachments/%D0%9F%D0%BE%D1%80%D0%BE%D0%B4%D0%B8%D1%87%D0%BD%D0%B8%20%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD%20109-25.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 22 | Zakon o socijalnoj zaštiti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.minrzs.gov.rs/sites/default/files/2021-02/Zakon%20o%20socijalnoj%20zastiti.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 23 | Zakon o mladima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2011/50/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 24 | Zakon o zdravstvenoj zaštiti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2019/25/2/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 25 | Zakon o pravima pacijenata | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2013/45/2) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 26 | Krivični zakonik | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2005/85/6) | PIS prečišćen tekst uključuje 63/2026; odložena primena čl. 2–3 nije predstavljena kao tekuća. |
| 27 | Zakonik o krivičnom postupku | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.vrh.sud.rs/sites/default/files/attachments/%D0%97%D0%B0%D0%BA%D0%BE%D0%BD%D0%B8%D0%BA%20%D0%BE%20%D0%BA%D1%80%D0%B8%D0%B2%D0%B8%D1%87%D0%BD%D0%BE%D0%BC%20%D0%BF%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%BA%D1%83%20-24-06-21.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 28 | Zakon o parničnom postupku | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/reg/viewAct/ff7a2508-60fe-41f6-a66b-b538c3d17021) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 29 | Zakon o zaštiti prava na suđenje u razumnom roku | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/13_saziv/1839-23%20lat..pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 30 | Zakon o policiji | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.mup.gov.rs/wps/wcm/connect/052f5a3d-903a-4dcf-b576-244b2194e897/LAT_Zakon%2Bo%2Bpoliciji.pdf?CVID=mtqKGWF&MOD=AJPERES) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 31 | Zakon o radu | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/za/2005/24) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 32 | Zakon o bezbednosti i zdravlju na radu | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.minrzs.gov.rs/sites/default/files/2023-05/%D0%97%D0%B0%D0%BA%D0%BE%D0%BD%20%D0%BE%20%D0%B1%D0%B5%D0%B7%D0%B1%D0%B5%D0%B4%D0%BD%D0%BE%D1%81%D1%82%D0%B8%20%D0%B8%20%D0%B7%D0%B4%D1%80%D0%B0%D0%B2%D1%99%D1%83%20%D0%BD%D0%B0%20%D1%80%D0%B0%D0%B4%D1%83.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 33 | Zakon o zapošljavanju i osiguranju za slučaj nezaposlenosti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2009/36/25) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 34 | Zakon o zaštiti potrošača | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2026/35/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 35 | Zakon o stanovanju i održavanju zgrada | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://kirs.gov.rs/upload/tenderi/UOYqsrkrwVZAKON-O-STANOVANJU-I-ODRZAVANU-ZGRADA.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 36 | Zakon o finansijskoj podršci porodici sa decom | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.minbpd.gov.rs/zakon-o-finansijskoj-podrsci-porodici-sa-decom/) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 37 | Zakon o sprečavanju zlostavljanja na radu | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.croso.gov.rs/storage/files/propisi/Zakon_o_sprecavanju_zlostavljanja_na_radu.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 38 | Zakon o javnom informisanju i medijima | EXISTS_INCOMPLETE | [Postojeći javni unos](https://avangarda.media/sr/pravni-kompas/legal-azakon-o-javnom-informisanju-i-medijimaresource) | Sačuvan neobičan objavljeni slug i postojeći DOCX. Ispravka zamenjenih srpskih ko/kada; dopuna. |
| 39 | Zakon o elektronskim medijima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2023/92/3/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 40 | Zakon o javnim medijskim servisima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2014/83/6/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 41 | Zakon o elektronskim komunikacijama | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2023/35/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 42 | Zakon o elektronskoj upravi | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2018/27/4/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 43 | Zakon o informacionoj bezbednosti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2025/91/5/reg) | Novi zakon 91/2025; čl. 29 od 1.1.2027 i prelazni CERT režim. |
| 44 | Zakon o autorskom i srodnim pravima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2011/99/13) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 45 | Zakon o zaštiti životne sredine | EXISTS_INCOMPLETE | [Postojeći javni unos](https://avangarda.media/sr/pravni-kompas/zakon-o-zastiti-zivotne-sredine) | Postojeći uvod, SEO, PDF i relacije ostaju; dopuna prestanka poglavlja o udesima 6.12.2025. |
| 46 | Zakon o proceni uticaja na životnu sredinu | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/14_saziv/2034-24.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 47 | Zakon o strateškoj proceni uticaja na životnu sredinu | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/14_saziv/2035-24.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 48 | Zakon o zaštiti prirode | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2021/71/1) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 49 | Zakon o zaštiti vazduha | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/14_saziv/926-25.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 50 | Zakon o upravljanju otpadom | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/14_saziv/2349-25.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 51 | Zakon o vodama | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2018/95/40) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 52 | Zakon o rudarstvu i geološkim istraživanjima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.mre.gov.rs/extfile/sector/sr/899/zakon_o_rudarstvu_i_geoloskim_istrazivanjima.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 53 | Zakon o klimatskim promenama | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2021/26) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 54 | Zakon o integrisanom sprečavanju i kontroli zagađivanja životne sredine | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/14_saziv/2294-26.pdf) | Novi zakon 63/2026, sa prelaznim postupcima; stari nije predstavljen kao aktuelni. |
| 55 | Zakon o osnovama sistema obrazovanja i vaspitanja | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2017/88/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 56 | Zakon o osnovnom obrazovanju i vaspitanju | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2013/55/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 57 | Zakon o visokom obrazovanju | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2023/76/7) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 58 | Zakon o azilu i privremenoj zaštiti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://kirs.gov.rs/media/uploads/Zakon_o_azilu_i_privremenoj_zast.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 59 | Zakon o strancima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2023/62/10) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 60 | Zakon o upravljanju migracijama | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://kirs.gov.rs/upload/tenderi/ENvHRKECDDZakon_o_upravljanju_migracijama.pdf) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 61 | Zakon o izboru narodnih poslanika | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://www.parlament.gov.rs/upload/archive/files/cir/pdf/zakoni/14_saziv/1551-26.pdf) | Povezani PDF je 47/2026 izmena; osnovni 14/2022 je zaseban vidljiv link. Nije ceo konsolidovan PDF. |
| 62 | Zakon o lokalnim izborima | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2022/14/3) | Izmena 47/2026: različite uloge i datumi 1.1.2027/1.1.2028. |
| 63 | Zakon o referendumu i narodnoj inicijativi | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/eli/rep/sgrs/skupstina/zakon/2021/111/1/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 64 | Zakon o finansiranju političkih aktivnosti | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2022/14/4/reg) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 65 | Zakon o jedinstvenom biračkom spisku | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/reg/viewAct/c066fc2d-8919-434c-9e4b-6ad7856ec5ac) | Sadržaj i 8 jezika pripremljeni; unos u produkciju nije izvršen. |
| 66 | Zakon o lokalnoj samoupravi | PENDING_AUTHENTICATED_INVENTORY | [Zvanični izvor](https://pravno-informacioni-sistem.rs/SlGlasnikPortal/reg/viewAct/2e5d965c-289e-4c70-af35-79af41aaf916) | Aktuelan PIS sa 111/2021; lokalni organi i rokovi provereni. |
