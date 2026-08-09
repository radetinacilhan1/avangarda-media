import React from "react";

import aboutPage from "../../../api/about-page/content-types/about-page/schema.json";
import article from "../../../api/article/content-types/article/schema.json";
import author from "../../../api/author/content-types/author/schema.json";
import comment from "../../../api/comment/content-types/comment/schema.json";
import contributePage from "../../../api/contribute-page/content-types/contribute-page/schema.json";
import dailyQuestion from "../../../api/daily-question/content-types/daily-question/schema.json";
import documentary from "../../../api/documentary/content-types/documentary/schema.json";
import editorialDirection from "../../../api/editorial-direction/content-types/editorial-direction/schema.json";
import editorialSignal from "../../../api/editorial-signal/content-types/editorial-signal/schema.json";
import gallery from "../../../api/gallery/content-types/gallery/schema.json";
import homepageConfig from "../../../api/homepage-config/content-types/homepage-config/schema.json";
import humanRight from "../../../api/human-right/content-types/human-right/schema.json";
import humanRightsPage from "../../../api/human-rights-page/content-types/human-rights-page/schema.json";
import impressum from "../../../api/impressum/content-types/impressum/schema.json";
import legalResource from "../../../api/legal-resource/content-types/legal-resource/schema.json";
import location from "../../../api/location/content-types/location/schema.json";
import signal from "../../../api/signal/content-types/signal/schema.json";
import tag from "../../../api/tag/content-types/tag/schema.json";
import teamMember from "../../../api/team-member/content-types/team-member/schema.json";
import topic from "../../../api/topic/content-types/topic/schema.json";

const languageNames = {
  en: "engleski",
  tr: "turski",
  fr: "francuski",
  de: "nemački",
  es: "španski",
  el: "grčki",
  ar: "arapski",
};

const fieldHelp = {
  title: ["Glavni naslov", "Kratak i jasan naslov bez tačke na kraju.", "Pravo na zdravu životnu sredinu", "Kartice, stranica zapisa i SEO fallback"],
  subtitle: ["Dopunski naslov", "Jedna rečenica koja proširuje naslov, ali ga ne ponavlja.", "Šta zakon garantuje i kako se pravo štiti", "Ispod naslova i na karticama"],
  shortDescription: ["Kratak opis", "Sažetak od jedne do tri rečenice; ne unositi ceo tekst.", "Vodič kroz osnovna prava i dostupne izvore.", "Liste, pretraga i uvod zapisa"],
  body: ["Glavni sadržaj", "Potpun, strukturiran tekst sa smislenim pasusima i podnaslovima.", "Uvod, objašnjenje, primeri i izvori.", "Glavni deo javne stranice"],
  slug: ["Adresa stranice", "Automatski se pravi iz naslova. Menjati samo pre prve objave.", "pravo-na-zdravu-zivotnu-sredinu", "Javni URL; promena može pokvariti stare linkove"],
  seoTitle: ["SEO naslov", "Naslov za pretraživače; ostaviti prazno kada je glavni naslov dovoljno jasan.", "Pravo na zdravu životnu sredinu | Avangarda", "Google i deljenje linka"],
  seoDescription: ["SEO opis", "Sažetak za pretraživače, približno 140–160 znakova.", "Saznaj šta pravo garantuje i gde možeš tražiti zaštitu.", "Google i društvene mreže"],
  priority: ["Urednički prioritet", "Veći broj znači veći urednički značaj samo gde je to navedeno u modelu.", "10", "Redosled i isticanje"],
  order: ["Ručni redosled", "Manji broj se prikazuje ranije. Koristiti razmake 10, 20, 30.", "10", "Liste i istaknute sekcije"],
  isFeatured: ["Istakni sadržaj", "Uključiti samo za mali broj najvažnijih zapisa.", "Uključeno", "Istaknute kartice i naslovna"],
  isTrending: ["U trendu", "Ručno uredničko isticanje; nije automatska analitika.", "Isključeno", "Oznaka i rangiranje na sajtu"],
  isBreaking: ["Važna vest", "Koristiti samo za vremenski osetljivu i proverenu informaciju.", "Isključeno", "Hitno isticanje na sajtu"],
  cover: ["Naslovna fotografija", "Izabrati jednu fotografiju koja tačno predstavlja zapis.", "Horizontalna fotografija visoke rezolucije", "Kartice, hero i deljenje"],
  shareImage: ["Slika za deljenje", "Posebna horizontalna slika; ako je nema koristi se naslovna.", "1200 × 630 px", "Društvene mreže i SEO"],
  images: ["Fotografije galerije", "Svaku fotografiju dodati jednom i proveriti redosled, opis i autora.", "Jedna component stavka po media fajlu", "Galerija i lightbox"],
  authors: ["Autori", "Povezati postojeći profil autora; ne praviti duplikat osobe.", "Ilhan Radetinac", "Potpis, profil i filtriranje"],
  topics: ["Teme", "Birati stabilne šire teme koje pomažu navigaciji.", "Ljudska prava", "Tematske stranice i pretraga"],
  tags: ["Oznake", "Uže ključne reči. Izbegavati sinonime i duplikate.", "diskriminacija", "Pretraga i interno grupisanje"],
  locations: ["Lokacije", "Povezati postojeću lokaciju kada je geografski relevantna.", "Novi Pazar", "Mapa i filteri"],
  officialSourceUrl: ["Zvanični izvor", "Pun HTTPS link ka instituciji ili originalnom dokumentu.", "https://www.parlament.gov.rs/", "Dugme „Otvori zvanični izvor“"],
  pdfFile: ["PDF za otvaranje", "Povezati provereni PDF; nakon čuvanja testirati javni link.", "ustav-republike-srbije.pdf", "Dugme za otvaranje dokumenta"],
  downloadableFile: ["Fajl za preuzimanje", "Fajl koji korisnik sme da preuzme; može biti isti kao PDF.", "ustav-republike-srbije.pdf", "Dugme za preuzimanje"],
  publishedAt: ["Status objave", "Sistem ga postavlja pri objavljivanju. Draft nije javno vidljiv.", "Published", "Javna dostupnost"],
  content: ["Sadržaj komentara", "Tekst koji je posetilac poslao. Pre odobravanja proveriti da ne sadrži lične podatke, uvrede ili spam.", "Komentar čitaoca", "Javno samo kada je status approved"],
  status: ["Status moderacije", "Pending čeka pregled, approved je javno vidljiv, rejected ostaje skriven.", "pending", "Kontroliše javnu vidljivost komentara"],
  article: ["Povezani članak", "Članak na koji se komentar odnosi. Ne menjati bez jasnog razloga.", "Izabrani objavljeni članak", "Stranica komentara uz članak"],
  authorName: ["Ime pošiljaoca", "Ime koje je posetilac uneo; proveriti pre objave.", "Ime ili pseudonim", "Potpis uz odobren komentar"],
  authorEmail: ["E-mail pošiljaoca", "Privatan podatak za moderaciju. Ne objavljivati i ne kopirati u javna polja.", "ime@example.com", "Samo u CMS-u"],
  ipHash: ["Zaštitni IP otisak", "Automatski tehnički podatak za zaštitu od zloupotrebe. Ne menjati ručno.", "Automatski generisano", "Samo u CMS-u"],
};

const models = [
  ["Article", article, true, "Tekstovi, naslovna fotografija, autori, teme i uredničke kontrole."],
  ["Legal Resource", legalResource, true, "Pravni dokumenti, zvanični izvori, PDF fajlovi i povezana prava."],
  ["Human Right", humanRight, true, "Objašnjenja prava, pravni osnov i veze ka resursima."],
  ["Gallery", gallery, true, "Foto-priče; paziti da svaki media fajl bude dodat samo jednom."],
  ["Team Member", teamMember, true, "Portfolio, biografija, kontakt, društvene mreže i povezani radovi."],
  ["Homepage Config", homepageConfig, true, "Naslovna strana i izbor istaknutih sadržaja."],
  ["Author", author, false, "Autorski profili koji se povezuju sa člancima."],
  ["Comment", comment, false, "Moderacija komentara; privatne podatke nikada ne prepisivati u javna polja."],
  ["Topic", topic, false, "Stabilne tematske kategorije."],
  ["Tag", tag, false, "Uže oznake za interno grupisanje i pretragu."],
  ["Editorial Direction", editorialDirection, false, "Urednički pravci i povezani sadržaji."],
  ["Location", location, false, "Geografske lokacije, koordinate i opisi."],
  ["Human Rights Page", humanRightsPage, false, "Uvodna stranica sekcije ljudskih prava."],
  ["Daily Question", dailyQuestion, false, "Jedno aktuelno pitanje sa višejezičnim verzijama."],
  ["Documentary", documentary, false, "Dokumentarni projekti, video i prateći sadržaj."],
  ["About Page", aboutPage, false, "Uvod, urednički principi i tim."],
  ["Contribute Page", contributePage, false, "Uputstva i forma za saradnju."],
  ["Impressum", impressum, false, "Pravni i organizacioni podaci platforme."],
  ["Signal", signal, false, "Kratki urednički signali i povezana analiza."],
  ["Editorial Signal", editorialSignal, false, "Konfiguracija signala na javnom sajtu."],
];

function splitFieldName(name) {
  const match = name.match(/_(en|tr|fr|de|es|el|ar)$/);
  return { base: match ? name.slice(0, -3) : name, language: match ? match[1] : null };
}

function readableName(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

const languageOrder = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const editorialFields = new Set([
  "status",
  "priority",
  "order",
  "publishedAt",
  "dateUpdated",
  "isFeatured",
  "isTrending",
  "isBreaking",
]);
const privateFields = new Set(["authorEmail", "ipHash"]);

function groupFields(attributes) {
  const entries = Object.entries(attributes || {});
  const indexByName = new Map(entries.map(([name], index) => [name, index]));
  const localizedBases = new Set(
    entries
      .map(([name]) => splitFieldName(name))
      .filter(({ language }) => language)
      .map(({ base }) => base)
  );

  const groups = [
    ["Osnovni sadržaj", []],
    ["Lokalizacije · sr, en, tr, fr, de, es, el, ar", []],
    ["Mediji", []],
    ["Relacije", []],
    ["Uredničke kontrole", []],
    ["SEO i deljenje", []],
    ["Privatna i sistemska polja", []],
  ];

  for (const entry of entries) {
    const [name, config] = entry;
    const { base } = splitFieldName(name);
    let groupIndex = 0;

    if (privateFields.has(name) || config.private) groupIndex = 6;
    else if (localizedBases.has(base)) groupIndex = 1;
    else if (name === "seo" || /^seo[A-Z]/.test(name) || name === "shareImage") groupIndex = 5;
    else if (config.type === "media" || /(?:image|cover|logo|photo|video)/i.test(name)) groupIndex = 2;
    else if (config.type === "relation") groupIndex = 3;
    else if (editorialFields.has(name) || /^is[A-Z]/.test(name)) groupIndex = 4;

    groups[groupIndex][1].push(entry);
  }

  const localized = groups[1][1];
  localized.sort(([left], [right]) => {
    const leftParts = splitFieldName(left);
    const rightParts = splitFieldName(right);
    const leftBaseIndex = indexByName.get(leftParts.base) ?? indexByName.get(left) ?? 0;
    const rightBaseIndex = indexByName.get(rightParts.base) ?? indexByName.get(right) ?? 0;
    if (leftBaseIndex !== rightBaseIndex) return leftBaseIndex - rightBaseIndex;
    return languageOrder.indexOf(leftParts.language || "sr") - languageOrder.indexOf(rightParts.language || "sr");
  });

  return groups.filter(([, fields]) => fields.length);
}

function describeField(name, config) {
  const { base, language } = splitFieldName(name);
  const known = fieldHelp[base];
  const type = config.type || config.component || config.target || "polje";
  const required = config.required ? "Obavezno" : "Opciono";
  const languageNote = language ? ` Verzija na jeziku: ${languageNames[language]}.` : " Osnovna verzija je na srpskom.";

  if (known) {
    return {
      label: known[0],
      purpose: `${known[1]}${languageNote}`,
      example: known[2],
      placement: known[3],
      meta: `${required} · ${type}`,
    };
  }

  return {
    label: readableName(base),
    purpose: `Polje tipa „${type}“. Unos mora odgovarati značenju naziva polja.${languageNote}`,
    example: config.default !== undefined ? String(config.default) : "Proveri postojeće objavljene zapise za dosledan primer.",
    placement: config.private ? "Samo interno" : "Koristi ga odgovarajuća javna stranica ili CMS relacija.",
    meta: `${required} · ${type}`,
  };
}

const styles = {
  page: { minHeight: "100%", padding: "32px", background: "#121013", color: "#f6f2f3" },
  shell: { maxWidth: 1180, margin: "0 auto" },
  eyebrow: { color: "#c97589", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" },
  title: { margin: "8px 0 12px", fontSize: 36, lineHeight: 1.1 },
  intro: { maxWidth: 780, color: "#cfc6c9", fontSize: 16, lineHeight: 1.65 },
  note: { margin: "24px 0", padding: 18, border: "1px solid #5e2938", borderRadius: 12, background: "#21171b", lineHeight: 1.55 },
  searchLabel: { display: "block", margin: "22px 0 8px", color: "#f6f2f3", fontSize: 13, fontWeight: 800 },
  search: { width: "100%", boxSizing: "border-box", padding: "13px 15px", border: "1px solid #5e4a51", borderRadius: 10, background: "#171317", color: "#fff", fontSize: 15 },
  quickTitle: { margin: "30px 0 12px", fontSize: 24 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 28 },
  quickCard: { padding: 16, border: "1px solid #4c343d", borderRadius: 12, background: "#1c1619" },
  details: { margin: "12px 0", border: "1px solid #3a3034", borderRadius: 12, background: "#191619", overflow: "hidden" },
  summary: { cursor: "pointer", padding: "18px 20px", fontSize: 17, fontWeight: 800 },
  modelIntro: { margin: "0 20px 18px", color: "#cfc6c9", lineHeight: 1.55 },
  group: { padding: "0 20px 20px" },
  groupTitle: { margin: "8px 0 12px", color: "#e3b2be", fontSize: 14, letterSpacing: ".04em" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, padding: "0 20px 20px" },
  card: { padding: 15, border: "1px solid #332a2e", borderRadius: 10, background: "#141214" },
  key: { color: "#d58da0", fontFamily: "monospace", fontSize: 12 },
  fieldTitle: { margin: "6px 0", fontSize: 15 },
  text: { margin: "5px 0", color: "#cfc6c9", fontSize: 13, lineHeight: 1.5 },
  meta: { color: "#9d9296", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" },
};

export default function AvangardaGuide() {
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("sr");
  const visibleModels = React.useMemo(() => models.map(([name, schema, frequent, intro]) => {
    if (!normalizedQuery || `${name} ${schema.info?.displayName || ""} ${intro}`.toLocaleLowerCase("sr").includes(normalizedQuery)) {
      return [name, schema, frequent, intro];
    }

    const attributes = Object.fromEntries(Object.entries(schema.attributes || {}).filter(([field, config]) => {
      const help = describeField(field, config);
      return `${field} ${help.label} ${help.purpose} ${help.placement}`.toLocaleLowerCase("sr").includes(normalizedQuery);
    }));

    return Object.keys(attributes).length
      ? [name, { ...schema, attributes }, frequent, intro]
      : null;
  }).filter(Boolean), [normalizedQuery]);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <span style={styles.eyebrow}>Avangarda CMS</span>
        <h1 style={styles.title}>Avangarda vodič</h1>
        <p style={styles.intro}>
          Praktičan vodič za svakodnevni unos višejezičnog sadržaja. Otvori model, pronađi tehnički naziv polja i proveri šta se unosi, primer i gde se podatak prikazuje.
        </p>
        <div style={styles.note}>
          <strong>Redosled jezika:</strong> sr, en, tr, fr, de, es, el, ar. Ne menjaj slug nakon objave. Ne pravi novi Author, Topic, Tag ili Location ako odgovarajući zapis već postoji. Pre objave proveri naslov, cover, relacije, SEO i sve javne linkove.
        </div>

        <h2 style={styles.quickTitle}>Brzi početak</h2>
        <div style={styles.quickGrid}>
          {[
            ["1. Napravi članak", "Otvori Članci, izaberi Create new entry i prvo unesi naslov, podnaslov i glavni sadržaj. Slug proveri pre prve objave."],
            ["2. Poveži cover", "U polju cover izaberi postojeću fotografiju ili dodaj novu jednom. Proveri autora, opis i pravo korišćenja."],
            ["3. Unesi osam jezika", "Srpska polja su osnova; zatim popuni en, tr, fr, de, es, el i ar istim redosledom. Ne mešaj jezike u jednom polju."],
            ["4. Objavi sadržaj", "Sačuvaj draft, proveri preview, relacije, SEO i javne linkove, pa tek onda izaberi Publish."],
            ["5. Dodaj pravni dokument", "U Pravni kompas poveži pdfFile i downloadableFile, unesi potvrđen HTTPS officialSourceUrl i naziv zvanične institucije."],
            ["6. Testiraj dokument", "Posle čuvanja na javnoj stranici proveri Otvori i Preuzmi. Ako Cloudinary vrati 401, ne menjaj URL već prijavi problem sa PDF delivery podešavanjem."],
            ["7. Uredi galeriju", "U images proveri redosled i dodaj svaki media fajl samo jednom. Ne pravi duplikat iste fotografije radi drugačijeg mesta u nizu."],
          ].map(([title, text]) => (
            <article key={title} style={styles.quickCard}>
              <h3 style={styles.fieldTitle}>{title}</h3>
              <p style={styles.text}>{text}</p>
            </article>
          ))}
        </div>

        <label htmlFor="avangarda-guide-search" style={styles.searchLabel}>Pretraži model, tehničko polje ili opis</label>
        <input
          id="avangarda-guide-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Na primer: Article, cover, officialSourceUrl, lokacija..."
          style={styles.search}
        />

        {visibleModels.map(([name, schema, frequent, intro]) => (
          <details key={name} style={styles.details} open={normalizedQuery ? true : frequent || undefined}>
            <summary style={styles.summary}>{name}{frequent ? " · često korišćen" : ""}</summary>
            <p style={styles.modelIntro}>{intro}</p>
            {groupFields(schema.attributes).map(([groupName, fields]) => (
              <section key={groupName} style={styles.group}>
                <h2 style={styles.groupTitle}>{groupName}</h2>
                <div style={{ ...styles.grid, padding: 0 }}>
                  {fields.map(([field, config]) => {
                    const help = describeField(field, config);
                    return (
                      <article key={field} style={styles.card}>
                        <span style={styles.key}>{field}</span>
                        <h3 style={styles.fieldTitle}>{help.label}</h3>
                        <p style={styles.text}>{help.purpose}</p>
                        <p style={styles.text}><strong>Primer:</strong> {help.example}</p>
                        <p style={styles.text}><strong>Na sajtu:</strong> {help.placement}</p>
                        <span style={styles.meta}>{help.meta}</span>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </details>
        ))}
        {!visibleModels.length ? <p style={styles.note}>Nema modela ili polja koja odgovaraju ovoj pretrazi.</p> : null}
      </div>
    </main>
  );
}
