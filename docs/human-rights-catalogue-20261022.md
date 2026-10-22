# Katalog ljudskih prava — dopuna 22. oktobra 2026.

## Obuhvat i inventar

Autentifikovan CMS inventar sa svim stranicama je pre upisa sadržao **5 zapisa: 5 objavljenih, 0 nacrta**. Svaki postojeći zapis ima popunjeno svih devet tekstualnih polja na jezicima `sr`, `en`, `tr`, `fr`, `de`, `es`, `el`, `ar`. To je provera prisustva sadržaja, a ne tvrdnja o nezavisnoj stručnoj lekturi svakog prevoda. Javni `start=0&limit=20` vratio je pet zapisa; `start=5` vratio je praznu stranicu. Prvi odgovor nije tretiran kao automatski potpun inventar.

| Postojeće pravo | Stabilni ID / slug | Proveren pravni okvir | Prevodi | Postupak |
|---|---|---|---|---|
| Zdrava životna sredina | 1 / `pravo-na-zdravu-zivotnu-sredinu` | Ustav 74; ICESCR 12(2)(b), povezano sa zdravljem | 8 × 9/9 | Sačuvano bez prepisivanja |
| Život | 2 / `pravo-na-zivot` | UDHR 3; ICCPR 6; ECHR 2; Ustav 24 | 8 × 9/9 | Sačuvano bez prepisivanja |
| Sloboda izražavanja | 3 / `pravo-na-slobodu-izrazavanja` | UDHR 19; ICCPR 19; ECHR 10; Ustav 46, 50–51 | 8 × 9/9 | Sačuvano bez prepisivanja |
| Pravično suđenje | 4 / `pravo-na-pravicno-sudjenje` | UDHR 8, 10–11; ICCPR 2(3), 14–15; ECHR 6–7, 13; Ustav 32–36, 67 | 8 × 9/9 | Sačuvano bez prepisivanja; pravni lekovi ne dupliraju se novom karticom |
| Zaštita od diskriminacije | 5 / `pravo-na-zastitu-od-diskriminacije` | UDHR 2, 7; ICCPR 2, 26; ECHR 14 i Protokol 12; Ustav 21 | 8 × 9/9 | Sačuvano bez prepisivanja |

Pripremljene su 22 dodatne tematske oblasti. To nisu 22 člana jednog dokumenta niti tvrdnja da postoji konačan zbir od 27 svih ljudskih prava. Neke povezane slobode su namerno u jednom objašnjenju: udruživanje i sindikati; rad, uslovi rada i odmor; porodični život i brak. Katalog ne pravi nova prava iz institucionalnih, završnih ili opštih odredaba ugovora. Kolektivno samoopredeljenje naroda iz člana 1 oba pakta nije izjednačeno sa pojedinačnim pravom glasa.

Za nove oblasti postoje razumljivo objašnjenje, primer i granice zaštite na svih osam jezika. Zabrana mučenja označena je kao apsolutna; ograničive slobode, postupovna prava i postepeno ostvarivanje socijalnih prava objašnjeni su zasebno. Deklaracija nije predstavljena kao identičan sudski mehanizam kao ugovori. ECHR nije predstavljen kao samostalna garancija azila. Član 69 Ustava nije predstavljen kao izričita bezuslovna garancija besplatnog stana.

## Zvanični izvori

Odredbe su proverene 22. oktobra 2026. Objašnjenja su sažeci, ne službeni prevodi pravnih akata.

- [UN — Univerzalna deklaracija o ljudskim pravima](https://www.un.org/en/about-us/universal-declaration-of-human-rights/).
- [OHCHR — Međunarodni pakt o građanskim i političkim pravima](https://2covenants.ohchr.org/About-ICCPR.html).
- [OHCHR — Međunarodni pakt o ekonomskim, socijalnim i kulturnim pravima](https://2covenants.ohchr.org/About-ICESCR.html).
- [Evropski sud za ljudska prava — Konvencija sa protokolima](https://www.echr.coe.int/documents/d/echr/convention_ENG).
- [Ustavni sud — Ustav Republike Srbije sa izmenama](https://www.ustavni.sud.rs/ustav-rs-i-propisi/ustav-republike-srbije?lang_type=lat).

## Očuvanje i ponovljivost

Pre upisa čuva se kompletan autentifikovan izvoz, uključujući paginirane relacije. Privatni izvozi i CMS sesija ostaju u ignorisanom lokalnom direktorijumu i ne ulaze u Git.

`apps/cms/scripts/import-human-rights.cjs` radi isključivo add-only upis: proverava stabilni slug i prevedene naslove protiv postojećih zapisa, odbija neusklađeni postojeći sadržaj, izvozi pre promene, proverava hash plana i izvoza i serijski obrađuje najviše tri zapisa po seriji. Produkcioni import koristi dve stavke po seriji. POST se posle nepoznatog ishoda ne ponavlja slepo. Dnevnik beleži nameru, potvrđeni ID i objavu; naredni dry-run pronalazi već unete zapise.

Novi zapisi se prvo čuvaju kao nacrti, očitavaju i proveravaju, pa tek onda objavljuju uz eksplicitno `--publish`. Import ne objavljuje nepovezane postojeće nacrte. Postojećih pet zapisa mora zadržati sve tekstove, prevode, stanje objave, medije i relacije. Novim pravima dodaje se samo relacija sa već objavljenim resursom Ustav Republike Srbije, pronađenim po postojećem slugu; postojeći resurs se ne prepisuje.

Validacija sadržaja bez mreže: `node apps/cms/scripts/import-human-rights.cjs --validate`.

Dry-run zahteva lokalni privatni fajl sesije, argument `--credentials`, i direktorijum dokaza `--out`. Upis zahteva `--apply --plan <prethodni-dry-run.json> --batch-size 2`; objava dodatno zahteva `--publish`. Lozinke i tokeni ne idu u komandni red ni ovaj dokument.

## Funkcionalne provere

- `apps/cms/tests/human-rights-import.cjs`: svih 22 × 8 × 9 polja; dry-run bez CMS mutacija; ponovljen import bez duplikata; očuvanje postojećih tekstova i relacija; zabrana objave nepovezanih nacrta.
- `apps/web/tests/human-rights-catalogue.cjs`: stvarni loader kroz ograničene stranice po sedam zapisa, svih 27 zapisa na svih osam jezika, stabilni redosled, dokaz iscrpljenosti i odbijanje duplih ili nepotpunih stranica. Prekid CMS veze pri prvoj stranici zadržava postojeće prazno stanje.
- Postojeća provera `apps/web/tests/legal-catalogue.cjs` ostaje uspešna (173 resursa i postojeća filtriranja).

## Produkcioni rezultat

Stvarni unos završen je 22. oktobra 2026: **22 nova zapisa, 22 novoobjavljena, 0 prepisanih postojećih zapisa**. Katalog sada sadrži **27 objavljenih prava i 0 nacrta**. Kompletan kontrolni izvoz posle unosa potvrdio je očuvanje svih pet prethodnih zapisa, uključujući tekstove, prevode, stanje objave i relacije.

Javna provera je potvrdila 27 jedinstvenih zapisa kroz stranice 10 + 10 + 7 + 0 i 1650 tačnih vrednosti novih zapisa (72 lokalizovana tekstualna polja i tri osnovna polja po zapisu). Provereno je 37 stvarnih javnih stranica: katalog na svih osam jezika, po jedan novi detalj na svih osam jezika i svih 22 novih detalja na srpskom. Lokalizovani naslovi, canonical, osam hreflang veza i arapski RTL bili su ispravni. Provera je izvršena 2026-10-22T18:17:05.435Z.

Ponovljeni autentifikovani dry-run posle unosa: **0 za kreiranje, 22 već objavljena za preskakanje, 0 nacrta**, čime je potvrđena ponovljivost bez dupliranja.

| Novi zapis | Stabilni ID / slug | Tačne odredbe | Prevodi | Javni link |
|---|---|---|---|---|
| Dostojanstvo i pravna ličnost | 6 / `dostojanstvo-i-pravna-licnost` | UDHR 1, 6; ICCPR 16; USTAV 23, 37 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/dostojanstvo-i-pravna-licnost) |
| Zabrana mučenja i nečovečnog postupanja | 7 / `zabrana-mucenja-i-necovecnog-postupanja` | UDHR 5; ICCPR 7, 10; ECHR 3; USTAV 25, 28 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/zabrana-mucenja-i-necovecnog-postupanja) |
| Zabrana ropstva, trgovine ljudima i prinudnog rada | 8 / `zabrana-ropstva-trgovine-ljudima-i-prinudnog-rada` | UDHR 4; ICCPR 8; ECHR 4; USTAV 26 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/zabrana-ropstva-trgovine-ljudima-i-prinudnog-rada) |
| Pravo na ličnu slobodu i bezbednost | 9 / `pravo-na-licnu-slobodu-i-bezbednost` | UDHR 3, 9; ICCPR 9, 11; ECHR 5; Protocol 4, 1; USTAV 27–31 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-licnu-slobodu-i-bezbednost) |
| Pravo na privatnost i zaštitu podataka | 10 / `pravo-na-privatnost-i-zastitu-podataka` | UDHR 12; ICCPR 17; ECHR 8; USTAV 40–42 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-privatnost-i-zastitu-podataka) |
| Sloboda kretanja i izbora prebivališta | 11 / `sloboda-kretanja-i-izbora-prebivalista` | UDHR 13; ICCPR 12; ECHR Protocol 4, 2–3; USTAV 39 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/sloboda-kretanja-i-izbora-prebivalista) |
| Pravo na utočište i zaštitu od progona | 12 / `pravo-na-utociste` | UDHR 14; ICCPR 7, 13; ECHR 3; Protocol 4, 4; USTAV 39, 57 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-utociste) |
| Pravo na državljanstvo | 13 / `pravo-na-drzavljanstvo` | UDHR 15; ICCPR 24(3); USTAV 38 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-drzavljanstvo) |
| Sloboda misli, savesti i veroispovesti | 14 / `sloboda-misli-savesti-i-veroispovesti` | UDHR 18; ICCPR 18; ECHR 9; USTAV 43–45 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/sloboda-misli-savesti-i-veroispovesti) |
| Sloboda mirnog okupljanja | 15 / `sloboda-mirnog-okupljanja` | UDHR 20(1); ICCPR 21; ECHR 11; USTAV 54 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/sloboda-mirnog-okupljanja) |
| Sloboda udruživanja, sindikata i štrajka | 16 / `sloboda-udruzivanja-sindikata-i-strajka` | UDHR 20, 23(4); ICCPR 22; ICESCR 8; ECHR 11; USTAV 55, 61 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/sloboda-udruzivanja-sindikata-i-strajka) |
| Pravo na demokratsko učešće | 17 / `pravo-na-demokratsko-ucesce` | UDHR 21; ICCPR 25; ECHR Protocol 1, 3; USTAV 52, 53, 56 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-demokratsko-ucesce) |
| Pravo na imovinu i nasleđivanje | 18 / `pravo-na-imovinu-i-nasledjivanje` | UDHR 17; ECHR Protocol 1, 1; USTAV 58, 59 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-imovinu-i-nasledjivanje) |
| Pravo na brak i zaštitu porodice | 19 / `pravo-na-brak-i-zastitu-porodice` | UDHR 16; ICCPR 23; ICESCR 10; ECHR 8, 12; USTAV 62, 63, 66 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-brak-i-zastitu-porodice) |
| Prava deteta | 20 / `prava-deteta` | UDHR 25(2); ICCPR 24; ICESCR 10; ECHR 8; USTAV 64–66 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/prava-deteta) |
| Pravo na obrazovanje | 21 / `pravo-na-obrazovanje` | UDHR 26; ICESCR 13, 14; ECHR Protocol 1, 2; USTAV 71 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-obrazovanje) |
| Pravo na rad, pravične uslove i odmor | 22 / `pravo-na-rad-pravicne-uslove-i-odmor` | UDHR 23(1–3), 24; ICESCR 6, 7; USTAV 60 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-rad-pravicne-uslove-i-odmor) |
| Pravo na socijalnu sigurnost | 23 / `pravo-na-socijalnu-sigurnost` | UDHR 22, 25; ICESCR 9; USTAV 69, 70 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-socijalnu-sigurnost) |
| Pravo na zdravlje i zdravstvenu zaštitu | 24 / `pravo-na-zdravlje-i-zdravstvenu-zastitu` | UDHR 25; ICESCR 12; USTAV 68 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-zdravlje-i-zdravstvenu-zastitu) |
| Pravo na primeren životni standard | 25 / `pravo-na-primeren-zivotni-standard` | UDHR 25; ICESCR 11; USTAV 69 (povezana socijalna zaštita) | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-primeren-zivotni-standard) |
| Pravo na kulturu i naučni napredak | 26 / `pravo-na-kulturu-i-naucni-napredak` | UDHR 27; ICESCR 15; USTAV 72, 73 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/pravo-na-kulturu-i-naucni-napredak) |
| Prava nacionalnih i jezičkih manjina | 27 / `prava-nacionalnih-i-jezickih-manjina` | UDHR 2, 27; ICCPR 27; USTAV 75–81 | 8 × 9/9 | [Otvori](https://avangarda.media/sr/ljudska-prava/prava-nacionalnih-i-jezickih-manjina) |

Svaka navedena stranica ima i javne putanje sa prefiksima `/en`, `/tr`, `/fr`, `/de`, `/es`, `/el` i `/ar`, uz isti stabilni slug. Pun spisak svih 176 lokalizovanih URL-ova sačuvan je u `production-verification.json`. Primer: [arapski prikaz dostojanstva](https://avangarda.media/ar/ljudska-prava/dostojanstvo-i-pravna-licnost).

Nisu stvarani testni sadržaji, nisu menjane postojeće uloge, dozvole, tajne, članci, propisi ili mediji. Relacija sa Ustavom dodata je samo novim pravima.
