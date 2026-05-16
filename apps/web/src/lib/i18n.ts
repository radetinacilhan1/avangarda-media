import { normalizeSectionSlug } from "@/lib/sections";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";

export const languages = [
  { code: "sr", label: "Srpski", flag: "\uD83C\uDDF7\uD83C\uDDF8" },
  { code: "en", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "tr", label: "Türkçe", flag: "\uD83C\uDDF9\uD83C\uDDF7" },
  { code: "fr", label: "Français", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { code: "es", label: "Español", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { code: "el", label: "Ελληνικά", flag: "\uD83C\uDDEC\uD83C\uDDF7" },
  { code: "ar", label: "العربية", flag: "\uD83C\uDF10" }
] as const;

export type Lang = (typeof languages)[number]["code"];

export const defaultLang: Lang = "sr";
export const LANGUAGE_STORAGE_KEY = "avangarda-language";
export const LANGUAGE_COOKIE_NAME = "avangarda-language";

const supportedLanguageSet = new Set<Lang>(languages.map((entry) => entry.code));
const rtlLanguages = new Set<Lang>(["ar"]);

const browserLanguageAliases: Record<string, Lang> = {
  sr: "sr",
  "sr-rs": "sr",
  bs: "sr",
  "bs-ba": "sr",
  hr: "sr",
  "hr-hr": "sr",
  me: "sr",
  "me-me": "sr",
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  tr: "tr",
  "tr-tr": "tr",
  fr: "fr",
  "fr-fr": "fr",
  de: "de",
  "de-de": "de",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  "es-ar": "es",
  "es-co": "es",
  el: "el",
  "el-gr": "el",
  ar: "ar",
  "ar-sa": "ar",
  "ar-ae": "ar",
  "ar-eg": "ar",
  "ar-ma": "ar",
  "ar-dz": "ar",
  "ar-iq": "ar",
  "ar-jo": "ar",
  "ar-lb": "ar",
  "ar-ps": "ar",
  "ar-qa": "ar",
  "ar-kw": "ar"
};

const spanishCountryFallback = new Set([
  "AR",
  "BO",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "ES",
  "GQ",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "UY",
  "VE"
]);

const greekCountryFallback = new Set(["GR", "CY"]);

const arabicCountryFallback = new Set([
  "AE",
  "BH",
  "DJ",
  "DZ",
  "EG",
  "IQ",
  "JO",
  "KM",
  "KW",
  "LB",
  "LY",
  "MA",
  "MR",
  "OM",
  "PS",
  "QA",
  "SA",
  "SD",
  "SO",
  "SY",
  "TD",
  "TN",
  "YE"
]);

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && supportedLanguageSet.has(value as Lang);
}

export function resolveLang(value?: string | string[]): Lang {
  const lang = Array.isArray(value) ? value[0] : value;
  return isLang(lang) ? lang : defaultLang;
}

export function withLang(path: string, lang: Lang) {
  const [pathWithoutHash, hash = ""] = path.split("#");
  const [pathname, query = ""] = pathWithoutHash.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", lang);
  const nextPath = `${pathname}?${params.toString()}`;
  return hash ? `${nextPath}#${hash}` : nextPath;
}

export function getLanguageMeta(lang: Lang) {
  return languages.find((entry) => entry.code === lang) ?? languages[0];
}

export function isRtlLang(lang: Lang) {
  return rtlLanguages.has(lang);
}

export function getLanguageDirection(lang: Lang): "ltr" | "rtl" {
  return isRtlLang(lang) ? "rtl" : "ltr";
}

export function mapBrowserLanguageToLang(value?: string | null): Lang | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return browserLanguageAliases[normalized] ?? browserLanguageAliases[normalized.split("-")[0]] ?? null;
}

export function resolvePreferredLanguageFromBrowser(
  preferred: Iterable<string | null | undefined> | undefined
): Lang | null {
  if (!preferred) return null;
  for (const value of preferred) {
    const mapped = mapBrowserLanguageToLang(value);
    if (mapped) return mapped;
  }
  return null;
}

export function mapCountryCodeToLang(value?: string | null): Lang | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (spanishCountryFallback.has(code)) return "es";
  if (greekCountryFallback.has(code)) return "el";
  if (arabicCountryFallback.has(code)) return "ar";
  return null;
}

export function resolveAutoLanguage(input: {
  queryLang?: string | string[];
  storedLang?: string | null;
  browserLanguages?: Iterable<string | null | undefined>;
  countryCode?: string | null;
}) {
  const rawQueryLang = Array.isArray(input.queryLang) ? input.queryLang[0] : input.queryLang;
  if (isLang(rawQueryLang)) {
    return rawQueryLang;
  }
  if (isLang(input.storedLang)) {
    return input.storedLang;
  }
  const browserLang = resolvePreferredLanguageFromBrowser(input.browserLanguages);
  if (browserLang) {
    return browserLang;
  }
  const countryLang = mapCountryCodeToLang(input.countryCode);
  if (countryLang) {
    return countryLang;
  }
  return defaultLang;
}

export type Dictionary = {
  brandEyebrow: string;
  navHome: string;
  navNews: string;
  navAnalysis: string;
  navInterview: string;
  navColumn: string;
  navArchive: string;
  navSearch: string;
  tickerNow: string;
  tickerItems: string[];
  heroEyebrow: string;
  heroFallbackTitle: string;
  heroFallbackCopy: string;
  heroPrimary: string;
  heroSecondary: string;
  heroFocus: string;
  heroDate: string;
  heroStyle: string;
  heroStyleValue: string;
  heroFallbackFocus: string;
  heroFallbackDate: string;
  heroNext: string;
  heroPrevious: string;
  heroVolumeUp: string;
  heroVolumeDown: string;
  heroMute: string;
  heroUnmute: string;
  editorialMode: string;
  manifestoTitle: string;
  manifestoCopy: string;
  manifestoOneTitle: string;
  manifestoOneCopy: string;
  manifestoTwoTitle: string;
  manifestoTwoCopy: string;
  manifestoThreeTitle: string;
  manifestoThreeCopy: string;
  latestEyebrow: string;
  latestTitle: string;
  latestCopy: string;
  readStory: string;
  emptyLeadTitle: string;
  emptyLeadCopy: string;
  strongerSiteTitle: string;
  strongerSiteCopy: string;
  impactStory: string;
  impactSupport: string;
  impactSections: string;
  impactRhythm: string;
  whatNext: string;
  whatNextTitle: string;
  whatNextCopy: string;
  utilityLabel: string;
  utilityTitle: string;
  utilityCopy: string;
  archiveLabel: string;
  archiveTitle: string;
  archiveCopy: string;
  quote: string;
  quoteCredit: string;
  themesLabel: string;
  themesTitle: string;
  themesCopy: string;
  sectionsLabel: string;
  sectionsTitle: string;
  sectionsCopy: string;
  sectionNewsCopy: string;
  sectionAnalysisCopy: string;
  sectionInterviewCopy: string;
  sectionColumnCopy: string;
  footerCopy: string;
  footerEditorialLabel: string;
  footerSectionsLabel: string;
  footerReachLabel: string;
  footerNewsletter: string;
  footerSocial: string;
  footerContactLine: string;
  articleLabel: string;
  authorLabel: string;
  archivePageLabel: string;
  searchLabel: string;
  sectionLabel: string;
  backToHome: string;
  commentsTitle: string;
  commentsCopy: string;
  commentName: string;
  commentEmail: string;
  commentPlaceholder: string;
  sendComment: string;
  readMode: string;
  readModeTitle: string;
  readModeCopy: string;
  articleNotFound: string;
  articleNotFoundCopy: string;
  archiveTitlePage: string;
  archiveCopyPage: string;
  archiveSearchPlaceholder: string;
  archiveYear: string;
  openResults: string;
  searchTitlePage: string;
  searchCopyPage: string;
  searchPlaceholder: string;
  searchYear: string;
  searchButton: string;
  searchResults: string;
  searchStart: string;
  searchNone: string;
  searchHelperActive: string;
  searchHelperIdle: string;
  openItem: string;
  searchNoHitsTitle: string;
  searchNoHitsCopy: string;
  sectionPageCopy: string;
  sectionEmptyTitle: string;
  sectionEmptyCopy: string;
  authorNotFound: string;
  authorNotFoundCopy: string;
  authorPosts: string;
  authorPostsCopy: string;
  authorEmptyTitle: string;
  authorEmptyCopy: string;
  contact: string;
  allSections: string;
  sectionNews: string;
  sectionAnalysis: string;
  sectionInterview: string;
  sectionColumn: string;
  editorialStatementEyebrow: string;
  editorialStatementCopy: string;
  editorialStatementLink: string;
  signalLabel: string;
  homepageSignalTitle: string;
  homepageSignalCopy: string;
  analysisSignalTitle: string;
  analysisSignalCopy: string;
  articleSignalTitle: string;
  articleSignalCopy: string;
  signalContextCta: string;
};

const sr: Dictionary = {
  brandEyebrow: "Oštre priče",
  navHome: "Naslovna",
  navNews: "Front",
  navAnalysis: "Analize",
  navInterview: "Intervjui",
  navColumn: "Kolumne",
  navArchive: "Arhiva",
  navSearch: "Pretraga",
  tickerNow: "Sada",
  tickerItems: [
    "Avangarda prati ritam novih objava u realnom vremenu.",
    "Naslovna sada nosi jači magazinski karakter i pokretne vesti.",
    "CMS cover slike i dalje ulaze direktno u dizajn sajta.",
    "Svaka nova priča automatski puni ticker, grid i sekcije."
  ],
  heroEyebrow: "Nova naslovna energija",
  heroFallbackTitle: "Tamniji, oštriji i brutalniji digitalni magazin.",
  heroFallbackCopy: "Naslovna je sada napravljena za jake fotografije, velike naslove i uređivački ritam koji deluje kao pravi medij, a ne kao šablon.",
  heroPrimary: "Pročitaj priču",
  heroSecondary: "Istraži teme",
  heroFocus: "Fokus",
  heroDate: "Datum",
  heroStyle: "Stil",
  heroStyleValue: "Crna baza, beli kontrast, žuti akcenat i veliki cover",
  heroFallbackFocus: "Kultura, internet, identitet i duge forme",
  heroFallbackDate: "Spremno za sledeću veliku priču",
  heroNext: "Sledeće",
  heroPrevious: "Prethodno",
  heroVolumeUp: "Ton +",
  heroVolumeDown: "Ton -",
  heroMute: "Isključi zvuk",
  heroUnmute: "Uključi zvuk",
  editorialMode: "Urednički mod",
  manifestoTitle: "Avangarda sada izgleda kao digitalni magazin sa stavom.",
  manifestoCopy: "Pravac je namerno tamniji, direktniji i napetiji. Time naslovna dobija energiju, prostor za cover fotografije i jači uređivački karakter.",
  manifestoOneTitle: "Jači vizuelni udar",
  manifestoOneCopy: "Veliki naslovi, hero cover i tvrdi kontrast odmah nose početak stranice.",
  manifestoTwoTitle: "Brzi ritam naslovne",
  manifestoTwoCopy: "Ticker, grid i sekcije sada pune ekran kao pravi newsroom front.",
  manifestoThreeTitle: "Prevod + CMS fallback",
  manifestoThreeCopy: "Interfejs i sadržaj mogu da menjaju jezik, ali i dalje ne pucaju ako neka prevedena polja nisu popunjena.",
  latestEyebrow: "FRONT",
  latestTitle: "PRVA LINIJA",
  latestCopy: "Svaki novi članak sada dobija više prostora, veći kontrast i jasniji magazinski tretman.",
  readStory: "Pročitaj",
  emptyLeadTitle: "Naslovna čeka prvi veliki tekst.",
  emptyLeadCopy: "Objavi makar jedan članak sa cover slikom i ovde će odmah izaći pun hero.",
  strongerSiteTitle: "Sajt je spreman za mnogo više sadržaja.",
  strongerSiteCopy: "Kako budeš dodavao još tekstova, Avangarda će izgledati punije, tvrđe i uređenije.",
  impactStory: "Objavljenih priča",
  impactSupport: "Aktivnih tema",
  impactSections: "Autora u mreži",
  impactRhythm: "Objava u poslednjih 7 dana",
  whatNext: "Šta dalje",
  whatNextTitle: "Naslovna sada ima kostur ozbiljnog medija.",
  whatNextCopy: "Sledeći rast dolazi kroz više priča, više sekcija i još bogatiji ritam uredničkih paketa, preporuka i specijala.",
  utilityLabel: "Alat",
  utilityTitle: "Pretraga koja deluje kao newsroom alat.",
  utilityCopy: "Pretraga nije više sporedna. Sada je deo uređivačkog toka i ulaz u arhivu.",
  archiveLabel: "Arhiva",
  archiveTitle: "Arhiva kao duboka baza čitanja.",
  archiveCopy: "Arhiva prima godine, teme, autore i sekcije bez raspada dizajna i ritma.",
  quote: "Dobar magazinski sajt mora da ima stav čim se otvori.",
  quoteCredit: "Editorial princip",
  themesLabel: "Teme",
  themesTitle: "Sekcije sa jačim karakterom.",
  themesCopy: "Sekcije više nisu samo linkovi. Svaka može da nosi svoj ton, fokus i seriju priča.",
  sectionsLabel: "Pravci",
  sectionsTitle: "Četiri urednička pravca",
  sectionsCopy: "Svaka urednička celina sada ima prostor da deluje kao poseban mikrosvet, ne kao dodatak.",
  sectionNewsCopy: "Brze objave, oštar naslov i front-page momentum.",
  sectionAnalysisCopy: "Duge forme i argumenti koji drže težinu sami za sebe.",
  sectionInterviewCopy: "Q&A format sa više karaktera i jačim ritmom čitanja.",
  sectionColumnCopy: "Lični glasovi, stav i direktniji uređivački ton.",
  footerCopy: "Avangarda spaja jači magazinski izgled, višejezični interfejs i pokretne newsroom momente.",
  footerEditorialLabel: "Editorial",
  footerSectionsLabel: "Sekcije",
  footerReachLabel: "Mreža",
  footerNewsletter: "Newsletter uskoro",
  footerSocial: "Instagram, YouTube i društveni formati",
  footerContactLine: "Kontakt i autorski profili",
  articleLabel: "Članak",
  authorLabel: "Autor",
  archivePageLabel: "Arhiva",
  searchLabel: "Pretraga",
  sectionLabel: "Sekcija",
  backToHome: "Nazad na naslovnu",
  commentsTitle: "Komentari",
  commentsCopy: "Komentar se objavljuje odmah ispod teksta. Ako nije prikladan, možeš da ga obrišeš iz CMS-a.",
  commentName: "Ime",
  commentEmail: "Email (neće biti javno)",
  commentPlaceholder: "Napiši komentar",
  sendComment: "Pošalji komentar",
  readMode: "Režim čitanja",
  readModeTitle: "Ovaj tekst sada ima jači ritam čitanja.",
  readModeCopy: "Veliki naslov, jaka naslovna fotografija i tamni kontrast drže fokus na sadržaju. Sledeći korak mogu biti povezane priče, share elementi i još više motion detalja.",
  articleNotFound: "Članak nije pronađen.",
  articleNotFoundCopy: "Proveri adresu ili se vrati na naslovnu da otvoris druge tekstove.",
  archiveTitlePage: "Pretraga kroz teme, godine i sekcije.",
  archiveCopyPage: "Arhiva sada deluje kao uređen ulaz u sav sadržaj, a ne kao gola utilitarna forma.",
  archiveSearchPlaceholder: "Traži temu, autora ili ideju",
  archiveYear: "Godina",
  openResults: "Otvori rezultate",
  searchTitlePage: "Pronađi tekstove po temi, sekciji i vremenu.",
  searchCopyPage: "Pretraga sada ima prostor da deluje kao ozbiljan alat za čitanje i uređivanje.",
  searchPlaceholder: "Traži teme, autore, mesta...",
  searchYear: "Godina",
  searchButton: "Traži",
  searchResults: "Rezultati",
  searchStart: "Pokreni pretragu",
  searchNone: "Nema rezultata",
  searchHelperActive: "Rezultati su prikazani kao čitljive editorial kartice sa dovoljno prostora za naslov i kontekst.",
  searchHelperIdle: "Upiši pojam ili izaberi sekciju da otvoriš rezultate.",
  openItem: "Otvori",
  searchNoHitsTitle: "Nema pogodaka za ovu kombinaciju filtera.",
  searchNoHitsCopy: "Probaj širi pojam, drugu sekciju ili godinu bez filtera.",
  sectionPageCopy: "Pregled tekstova iz jedne uređivačke celine prikazan je kroz istu vizuelnu logiku kao naslovna.",
  sectionEmptyTitle: "Još nema objavljenih tekstova u ovoj sekciji.",
  sectionEmptyCopy: "Kada objaviš sadržaj u ovoj kategoriji, ovde će se pojaviti uređene kartice tekstova.",
  authorNotFound: "Autor nije pronađen.",
  authorNotFoundCopy: "Vrati se na naslovnu ili pretragu da otvoriš druge profile i tekstove.",
  authorPosts: "Tekstovi autora",
  authorPostsCopy: "",
  authorEmptyTitle: "Ovaj autor još nema objavljenih tekstova.",
  authorEmptyCopy: "Kada se pojave objave povezane sa ovim profilom, biće prikazane kao uređene editorial kartice.",
  contact: "Kontakt",
  allSections: "Sve sekcije",
  sectionNews: "Front",
  sectionAnalysis: "Analize",
  sectionInterview: "Intervjui",
  sectionColumn: "Kolumne",
  editorialStatementEyebrow: "Zašto ovo objavljujemo",
  editorialStatementCopy: "Ovu priču ne objavljujemo da popuni prostor, već da otvorimo temu koja traži pažnju, kontekst i odgovornost. Ako je glavna priča jaka, ostatak naslovne mora da pokaže zašto je važna, kome se obraća i šta dalje pokreće. To je urednički glas sajta, a ne ukrasni tekst između blokova.",
  editorialStatementLink: "Idi na glavnu priču",
  signalLabel: "Signal",
  homepageSignalTitle: "Brojevi koji otvaraju priču",
  homepageSignalCopy: "Mali signal blok spaja broj, izvor i kontekst pre nego što uđeš dublje u analize.",
  analysisSignalTitle: "Signal unutar analize",
  analysisSignalCopy: "Ovde broj nije dashboard, već urednički dokaz, pritisak i širi kontekst za priče koje traže više od brzog utiska.",
  articleSignalTitle: "Signal i kontekst",
  articleSignalCopy: "Povezani signali drže temu u realnim brojkama, institucijama i ritmovima života o kojima tekst govori.",
  signalContextCta: "Otvori kontekst"
};

const normalizedSr = normalizeSerbianLatinDeep(sr);

const baseDictionaries: Record<Exclude<Lang, "es" | "el" | "ar">, Dictionary> = {
  sr: normalizedSr,
  en: {
    ...normalizedSr,
    brandEyebrow: "Sharp stories",
    navHome: "Home",
    navNews: "Front",
    navAnalysis: "Analysis",
    navInterview: "Interviews",
    navColumn: "Columns",
    navArchive: "Archive",
    navSearch: "Search",
    tickerNow: "Now",
    tickerItems: [
      "Avangarda follows the rhythm of new stories in real time.",
      "The front page now carries a harder magazine identity and moving headlines.",
      "CMS cover images feed directly into the visual system.",
      "Every new story automatically fills the ticker, grid and sections."
    ],
    heroEyebrow: "Front page energy",
    heroFallbackTitle: "A darker, sharper and more brutal digital magazine.",
    heroFallbackCopy: "The homepage is now built for strong photography, oversized headlines and an editorial rhythm that feels like a real media brand.",
    heroPrimary: "Read story",
    heroSecondary: "Explore topics",
    heroFocus: "Focus",
    heroDate: "Date",
    heroStyle: "Style",
    heroStyleValue: "Black base, white contrast, yellow accents and large covers",
    heroFallbackFocus: "Culture, internet, identity and long-form stories",
    heroFallbackDate: "Ready for the next big story",
    heroNext: "Next",
    heroPrevious: "Prev",
    heroVolumeUp: "Vol +",
    heroVolumeDown: "Vol -",
    heroMute: "Mute",
    heroUnmute: "Unmute",
    manifestoTitle: "Avangarda now feels like a digital magazine with attitude.",
    manifestoCopy: "The direction is intentionally darker, tighter and more direct. That gives the homepage stronger energy, room for cover imagery and a sharper editorial voice.",
    manifestoOneTitle: "Harder visual impact",
    manifestoOneCopy: "Large headlines, hero covers and tough contrast now carry the top of the page.",
    manifestoTwoTitle: "Faster front-page rhythm",
    manifestoTwoCopy: "Ticker, grids and sections now fill the screen like a real newsroom front.",
    manifestoThreeTitle: "Translation + CMS fallback",
    manifestoThreeCopy: "Interface and story content can switch languages while still falling back safely when translated fields are empty.",
    latestEyebrow: "FRONT",
    latestTitle: "FRONTLINE",
    latestCopy: "Every new article now gets more space, stronger contrast and a cleaner magazine treatment.",
    readStory: "Read",
    emptyLeadTitle: "The homepage is waiting for its first big story.",
    emptyLeadCopy: "Publish at least one article with a cover image and this area will immediately become a full hero.",
    strongerSiteTitle: "The site is ready for much more content.",
    strongerSiteCopy: "As you add more stories, Avangarda will feel fuller, harder and more editorial.",
    impactStory: "Published stories",
    impactSupport: "Active topics",
    impactSections: "Authors in the network",
    impactRhythm: "Stories in the last 7 days",
    whatNext: "What's next",
    whatNextTitle: "The homepage now has the structure of a serious media brand.",
    whatNextCopy: "The next leap comes from more stories, more sections and richer editorial packages, recommendations and specials.",
    utilityLabel: "Tool",
    utilityTitle: "Search that feels like a newsroom tool.",
    utilityCopy: "Search is no longer secondary. It is now part of the editorial flow and the entry point into the archive.",
    archiveLabel: "Archive",
    archiveTitle: "Archive as a deep reading base.",
    archiveCopy: "The archive can hold years, themes, authors and sections without the design falling apart.",
    quote: "A strong magazine site needs a point of view the moment it opens.",
    themesLabel: "Themes",
    themesTitle: "Sections with a stronger character.",
    themesCopy: "Sections are no longer just links. Each one can carry its own tone, focus and run of stories.",
    sectionsLabel: "Directions",
    sectionsTitle: "Four editorial directions",
    sectionsCopy: "Each editorial lane now has enough space to feel like its own micro-world, not an add-on.",
    sectionNewsCopy: "Fast updates, sharp headlines and front-page momentum.",
    sectionAnalysisCopy: "Long-form thinking and arguments with enough weight to stand alone.",
    sectionInterviewCopy: "Q&A formats with more character and a stronger reading rhythm.",
    sectionColumnCopy: "Personal voices, opinion and a more direct editorial tone.",
    footerCopy: "Avangarda blends a stronger magazine look, multilingual interface and moving newsroom moments.",
    articleLabel: "Article",
    authorLabel: "Author",
    archivePageLabel: "Archive",
    searchLabel: "Search",
    sectionLabel: "Section",
    backToHome: "Back to home",
    commentsTitle: "Comments",
    commentsCopy: "Comments appear immediately under the story. You can still remove anything inappropriate from the CMS.",
    commentName: "Name",
    commentEmail: "Email (not public)",
    commentPlaceholder: "Write a comment",
    sendComment: "Send comment",
    readModeTitle: "This story now has a stronger reading rhythm.",
    readModeCopy: "Large headlines, bold cover imagery and dark contrast keep the focus on the story. The next step can be related stories, share elements and more motion details.",
    articleNotFound: "Article not found.",
    articleNotFoundCopy: "Check the address or go back home to open other stories.",
    archiveTitlePage: "Browse themes, years and sections.",
    archiveCopyPage: "The archive now feels like a curated entry into the whole publication instead of a bare utility page.",
    archiveSearchPlaceholder: "Search a theme, author or idea",
    archiveYear: "Year",
    openResults: "Open results",
    searchTitlePage: "Find stories by theme, section and time.",
    searchCopyPage: "Search now has enough room to feel like a serious reading and editorial tool.",
    searchPlaceholder: "Search themes, authors, places...",
    searchYear: "Year",
    searchButton: "Search",
    searchResults: "Results",
    searchStart: "Start searching",
    searchNone: "No results",
    searchHelperActive: "Results are shown as readable editorial cards with room for the headline and context.",
    searchHelperIdle: "Enter a term or choose a section to open results.",
    openItem: "Open",
    searchNoHitsTitle: "No matches for this filter combination.",
    searchNoHitsCopy: "Try a broader term, another section or a year without filters.",
    sectionPageCopy: "A view of stories from one editorial lane, presented with the same visual logic as the homepage.",
    sectionEmptyTitle: "There are no published stories in this section yet.",
    sectionEmptyCopy: "When you publish content in this category, curated story cards will appear here.",
    authorNotFound: "Author not found.",
    authorNotFoundCopy: "Go back home or to search to open other profiles and stories.",
    authorPosts: "Author stories",
    authorPostsCopy: "",
    authorEmptyTitle: "This author does not have published stories yet.",
    authorEmptyCopy: "Once stories connected to this profile exist, they will appear here as editorial cards.",
    contact: "Contact",
    allSections: "All sections",
    sectionNews: "Front",
    sectionAnalysis: "Analysis",
    sectionInterview: "Interviews",
    sectionColumn: "Columns",
    editorialStatementEyebrow: "Why we are publishing this",
    editorialStatementCopy: "We are not publishing this story to fill space, but to push a subject that demands attention, context and accountability. If the lead story is strong, the homepage should show why it matters, who it speaks to and what it sets in motion next. That is the editorial voice of the site, not decorative copy between modules.",
    editorialStatementLink: "Go to the lead story",
    signalLabel: "Signal",
    homepageSignalTitle: "Numbers that open the story",
    homepageSignalCopy: "A small signal block ties a number, a source and context together before the reader goes deeper into analysis.",
    analysisSignalTitle: "Signal inside analysis",
    analysisSignalCopy: "Here the number is not a dashboard. It is editorial proof, pressure and wider context for stories that need more than a quick take.",
    articleSignalTitle: "Signal and context",
    articleSignalCopy: "Related signals keep the story grounded in real numbers, institutions and lived rhythms.",
    signalContextCta: "Open context"
  },
  tr: {
    ...normalizedSr,
    brandEyebrow: "Keskin hikayeler",
    navHome: "Ana sayfa",
    navNews: "Man\u015fet",
    navAnalysis: "Analizler",
    navInterview: "R\u00f6portajlar",
    navColumn: "K\u00f6\u015fe",
    navArchive: "Ar\u015fiv",
    navSearch: "Ara",
    tickerNow: "\u015eimdi",
    tickerItems: [
      "Yeni hikayeler gercek zamanli akiyor.",
      "Ana sayfa daha sert bir dergi ritmi tasiyor.",
      "Kapak gorselleri dogrudan tasarima giriyor.",
      "Her yeni yazi ticker ve gridi dolduruyor."
    ],
    heroEyebrow: "Ana sayfa enerjisi",
    heroFallbackTitle: "Daha karanlik, daha keskin ve daha sert bir dijital dergi.",
    heroFallbackCopy: "Ana sayfa artik guclu fotograflar, buyuk basliklar ve gercek bir medya markasi gibi hissettiren editoral ritim icin tasarlandi.",
    heroPrimary: "Haberi oku",
    heroSecondary: "Konulari kesfet",
    heroFocus: "Odak",
    heroDate: "Tarih",
    heroStyle: "Stil",
    heroStyleValue: "Siyah zemin, beyaz kontrast, sari vurgu ve buyuk coverlar",
    heroFallbackFocus: "Kultur, internet, kimlik ve uzun okumalar",
    heroFallbackDate: "Bir sonraki buyuk hikaye icin hazir",
    heroNext: "Sonraki",
    heroPrevious: "\u00d6nceki",
    heroVolumeUp: "Ses +",
    heroVolumeDown: "Ses -",
    heroMute: "Kapat",
    heroUnmute: "Ac",
    latestEyebrow: "MAN\u015eET",
    latestTitle: "İLK HAT",
    latestCopy: "Her yeni yazi artik daha fazla alan, daha guclu kontrast ve daha net dergi duygusu aliyor.",
    readStory: "Oku",
    impactStory: "Yayimlanan hikaye",
    impactSupport: "Aktif tema",
    impactSections: "Agdaki yazar",
    impactRhythm: "Son 7 gundeki yazi",
    articleLabel: "Yazi",
    authorLabel: "Yazar",
    archivePageLabel: "Arsiv",
    searchLabel: "Ara",
    sectionLabel: "Bolum",
    backToHome: "Ana sayfaya don",
    commentsTitle: "Yorumlar",
    commentsCopy: "Yorumlar hemen yazi altinda gorunur. Uygunsuz olanlari CMS icinden silebilirsin.",
    commentName: "Isim",
    commentEmail: "Email (genel degil)",
    commentPlaceholder: "Yorum yaz",
    sendComment: "Yorumu gonder",
    archiveSearchPlaceholder: "Tema, yazar...",
    archiveYear: "Yil",
    openResults: "Sonuclari ac",
    searchPlaceholder: "Tema, yazar...",
    searchYear: "Yil",
    searchButton: "Ara",
    searchResults: "Sonuclar",
    searchStart: "Aramayi baslat",
    searchNone: "Sonuc yok",
    openItem: "Ac",
    sectionsLabel: "Yonler",
    sectionsTitle: "Dort editoriyal yon",
    contact: "Iletisim",
    allSections: "Tum bolumler",
    sectionNews: "Man\u015fet",
    sectionAnalysis: "Analizler",
    sectionInterview: "R\u00f6portajlar",
    sectionColumn: "K\u00f6\u015fe",
    editorialStatementEyebrow: "Neden bunu yayimliyoruz",
    editorialStatementCopy: "Bu hikayeyi boslugu doldurmak icin degil, dikkat, baglam ve sorumluluk gerektiren bir konuyu one cikarmak icin yayimliyoruz. Ana hikaye gucluyse, ana sayfa neden onemli oldugunu, kime hitap ettigini ve sonraki adimda neyi harekete gecirdigini gostermelidir. Bu, moduller arasina serpilmis sus metni degil, sitenin editoral sesidir.",
    editorialStatementLink: "Ana hikayeye git",
    signalLabel: "Signal",
    homepageSignalTitle: "Hikayeyi acan sayilar",
    homepageSignalCopy: "Kucuk signal blogu, okuyucu analize daha derin girmeden once sayiyi, kaynagi ve baglami bir araya getirir.",
    analysisSignalTitle: "Analizin icindeki signal",
    analysisSignalCopy: "Burada sayi bir dashboard degil; daha fazlasini isteyen hikayeler icin editoral kanit, baski ve genis baglamdir.",
    articleSignalTitle: "Signal ve baglam",
    articleSignalCopy: "Bagli sinyaller hikayeyi gercek sayilar, kurumlar ve gundelik ritimler icinde tutar.",
    signalContextCta: "Baglami ac"
  },
  fr: {
    ...normalizedSr,
    brandEyebrow: "Recits forts",
    navHome: "Accueil",
    navNews: "\u00c0 la une",
    navAnalysis: "Analyses",
    navInterview: "Interviews",
    navColumn: "Chroniques",
    navArchive: "Archives",
    navSearch: "Recherche",
    tickerNow: "Direct",
    tickerItems: [
      "Les nouvelles publications avancent en temps reel.",
      "La une assume une identite magazine plus tranchee.",
      "Les couvertures du CMS entrent directement dans le design.",
      "Chaque texte alimente le ticker et la grille."
    ],
    heroEyebrow: "Energie de la une",
    heroFallbackTitle: "Un magazine numerique plus sombre, plus net et plus brutal.",
    heroFallbackCopy: "La page d'accueil est maintenant pensee pour les grandes photos, les titres massifs et un rythme editorial qui ressemble a un vrai media.",
    heroPrimary: "Lire l'article",
    heroSecondary: "Explorer les themes",
    heroFocus: "Focus",
    heroDate: "Date",
    heroStyle: "Style",
    heroStyleValue: "Base noire, contraste blanc, accent jaune et grandes couvertures",
    heroFallbackFocus: "Culture, internet, identite et formats longs",
    heroFallbackDate: "Pret pour la prochaine grande histoire",
    heroNext: "Suivant",
    heroPrevious: "Pr\u00e9c\u00e9dent",
    heroVolumeUp: "Son +",
    heroVolumeDown: "Son -",
    heroMute: "Muet",
    heroUnmute: "Activer",
    latestEyebrow: "\u00c0 LA UNE",
    latestTitle: "PREMIÈRE LIGNE",
    latestCopy: "Chaque nouvel article recoit maintenant plus d'espace et un traitement plus editorial.",
    readStory: "Lire",
    impactStory: "Articles publies",
    impactSupport: "Themes actifs",
    impactSections: "Auteurs du reseau",
    impactRhythm: "Articles des 7 derniers jours",
    articleLabel: "Article",
    authorLabel: "Auteur",
    archivePageLabel: "Archives",
    searchLabel: "Recherche",
    sectionLabel: "Section",
    backToHome: "Retour accueil",
    commentsTitle: "Commentaires",
    commentsCopy: "Les commentaires apparaissent immediatement sous l'article. Tu peux toujours supprimer ce qui n'est pas approprie dans le CMS.",
    commentName: "Nom",
    commentEmail: "Email (non public)",
    commentPlaceholder: "Ecrire un commentaire",
    sendComment: "Envoyer",
    archiveSearchPlaceholder: "Th\u00e8me, auteur...",
    archiveYear: "Annee",
    openResults: "Ouvrir les resultats",
    searchPlaceholder: "Th\u00e8me, auteur...",
    searchYear: "Annee",
    searchButton: "Chercher",
    searchResults: "Resultats",
    searchStart: "Lancer la recherche",
    searchNone: "Aucun resultat",
    openItem: "Ouvrir",
    sectionsLabel: "Directions",
    sectionsTitle: "Quatre directions editoriales",
    contact: "Contact",
    allSections: "Toutes les sections",
    sectionNews: "\u00c0 la une",
    sectionAnalysis: "Analyses",
    sectionInterview: "Interviews",
    sectionColumn: "Chroniques",
    editorialStatementEyebrow: "Pourquoi nous publions cela",
    editorialStatementCopy: "Nous ne publions pas cette histoire pour remplir un espace, mais pour ouvrir un sujet qui exige attention, contexte et responsabilite. Si le texte principal est fort, la une doit montrer pourquoi il compte, a qui il parle et ce qu'il met en mouvement ensuite. C'est la voix editoriale du site, pas un texte decoratif entre des modules.",
    editorialStatementLink: "Aller au texte principal",
    signalLabel: "Signal",
    homepageSignalTitle: "Les chiffres qui ouvrent le recit",
    homepageSignalCopy: "Ce petit bloc signal relie un chiffre, une source et un contexte avant d'entrer plus loin dans l'analyse.",
    analysisSignalTitle: "Le signal dans l'analyse",
    analysisSignalCopy: "Ici, le chiffre n'est pas un dashboard. C'est une preuve editoriale, une pression et un contexte plus large pour des textes qui demandent davantage qu'une impression rapide.",
    articleSignalTitle: "Signal et contexte",
    articleSignalCopy: "Les signaux relies gardent le texte ancre dans des nombres reels, des institutions et des rythmes de vie.",
    signalContextCta: "Ouvrir le contexte"
  },
  de: {
    ...normalizedSr,
    brandEyebrow: "Scharfe stories",
    navHome: "Startseite",
    navNews: "Auftakt",
    navAnalysis: "Analysen",
    navInterview: "Interviews",
    navColumn: "Kolumnen",
    navArchive: "Archiv",
    navSearch: "Suche",
    tickerNow: "Jetzt",
    tickerItems: [
      "Avangarda verfolgt den Rhythmus neuer Veroeffentlichungen in Echtzeit.",
      "Die Startseite traegt jetzt einen staerkeren Magazincharakter und bewegte Schlagzeilen.",
      "CMS-Coverbilder fliessen weiterhin direkt in das Design der Seite ein.",
      "Jede neue Geschichte fuellt automatisch Ticker, Grid und Sektionen."
    ],
    heroEyebrow: "Frontpage Energie",
    heroFallbackTitle: "Ein dunkleres, schaerferes und brutaleres Digitalmagazin.",
    heroFallbackCopy: "Die Startseite ist jetzt fuer starke Fotografie, grosse Headlines und einen editorialen Rhythmus gebaut, der wie eine echte Medienmarke wirkt.",
    heroPrimary: "Story lesen",
    heroSecondary: "Themen entdecken",
    heroFocus: "Fokus",
    heroDate: "Datum",
    heroStyle: "Stil",
    heroStyleValue: "Schwarze Basis, weisser Kontrast, gelber Akzent und grosse Cover",
    heroFallbackFocus: "Kultur, Internet, Identitaet und lange Texte",
    heroFallbackDate: "Bereit fuer die naechste grosse Story",
    heroNext: "Weiter",
    heroPrevious: "Zur\u00fcck",
    heroVolumeUp: "Ton +",
    heroVolumeDown: "Ton -",
    heroMute: "Stumm",
    heroUnmute: "An",
    latestEyebrow: "AUFTAKT",
    latestTitle: "ERSTE LINIE",
    latestCopy: "Jeder neue Artikel bekommt jetzt mehr Raum, mehr Kontrast und ein klareres Magazin-Gefuehl.",
    readStory: "Lesen",
    impactStory: "Veroeffentlichte Stories",
    impactSupport: "Aktive Themen",
    impactSections: "Autoren im Netzwerk",
    impactRhythm: "Stories der letzten 7 Tage",
    articleLabel: "Artikel",
    authorLabel: "Autor",
    archivePageLabel: "Archiv",
    searchLabel: "Suche",
    sectionLabel: "Sektion",
    backToHome: "Zur Startseite",
    commentsTitle: "Kommentare",
    commentsCopy: "Kommentare erscheinen sofort unter dem Artikel. Unpassende Eintraege kannst du weiter im CMS loeschen.",
    commentName: "Name",
    commentEmail: "Email (nicht oeffentlich)",
    commentPlaceholder: "Kommentar schreiben",
    sendComment: "Kommentar senden",
    archiveSearchPlaceholder: "Thema, Autor...",
    archiveYear: "Jahr",
    openResults: "Ergebnisse oeffnen",
    searchPlaceholder: "Thema, Autor...",
    searchYear: "Jahr",
    searchButton: "Suchen",
    searchResults: "Ergebnisse",
    searchStart: "Suche starten",
    searchNone: "Keine Ergebnisse",
    openItem: "Oeffnen",
    sectionsLabel: "Richtungen",
    sectionsTitle: "Vier redaktionelle Richtungen",
    contact: "Kontakt",
    allSections: "Alle Sektionen",
    sectionNews: "Auftakt",
    sectionAnalysis: "Analysen",
    sectionInterview: "Interviews",
    sectionColumn: "Kolumnen",
    editorialStatementEyebrow: "Warum wir das veroffentlichen",
    editorialStatementCopy: "Wir veroffentlichen diese Geschichte nicht, um eine Flache zu fullen, sondern um ein Thema zu offnen, das Aufmerksamkeit, Kontext und Verantwortung verlangt. Wenn die Hauptgeschichte stark ist, muss die Startseite zeigen, warum sie wichtig ist, wen sie anspricht und was sie als Nächstes auslost. Das ist die editoriale Stimme der Seite und kein dekorativer Text zwischen Modulen.",
    editorialStatementLink: "Zur Hauptgeschichte",
    signalLabel: "Signal",
    homepageSignalTitle: "Zahlen, die die Geschichte offnen",
    homepageSignalCopy: "Der kleine Signalblock verbindet Zahl, Quelle und Kontext, bevor Leserinnen und Leser tiefer in die Analyse gehen.",
    analysisSignalTitle: "Signal in der Analyse",
    analysisSignalCopy: "Hier ist die Zahl kein Dashboard, sondern ein redaktioneller Beleg, ein Druckpunkt und ein groesserer Kontext fuer Geschichten mit mehr Tiefe.",
    articleSignalTitle: "Signal und Kontext",
    articleSignalCopy: "Verknuepfte Signale halten die Geschichte in realen Zahlen, Institutionen und gelebten Rhythmen verankert.",
    signalContextCta: "Kontext offnen"
  }
};

const spanishDictionary: Dictionary = {
  ...baseDictionaries.en,
  navNews: "Portada",
  latestEyebrow: "PORTADA",
  sectionNews: "Portada",
  brandEyebrow: "Historias afiladas",
  navHome: "Inicio",
  navAnalysis: "Análisis",
  navInterview: "Entrevistas",
  navColumn: "Columnas",
  navArchive: "Archivo",
  navSearch: "Buscar",
  tickerNow: "Ahora",
  tickerItems: [
    "Avangarda sigue el ritmo de las nuevas historias en tiempo real.",
    "La portada ahora tiene una identidad de revista más dura y titulares en movimiento.",
    "Las imágenes de portada del CMS entran directamente en el sistema visual.",
    "Cada nueva historia llena automáticamente el ticker, la cuadrícula y las secciones."
  ],
  heroEyebrow: "Energía de portada",
  heroFallbackTitle: "Una revista digital más oscura, más afilada y más contundente.",
  heroFallbackCopy: "La portada ahora está pensada para fotografía fuerte, titulares grandes y un ritmo editorial que se siente como un medio real.",
  heroPrimary: "Leer historia",
  heroSecondary: "Explorar temas",
  heroFocus: "Enfoque",
  heroDate: "Fecha",
  heroStyle: "Estilo",
  heroStyleValue: "Base negra, contraste blanco, acento amarillo y portadas grandes",
  heroFallbackFocus: "Cultura, internet, identidad y formatos largos",
  heroFallbackDate: "Lista para la próxima gran historia",
  heroNext: "Siguiente",
  heroPrevious: "Anterior",
  heroVolumeUp: "Vol +",
  heroVolumeDown: "Vol -",
  heroMute: "Silencio",
  heroUnmute: "Activar sonido",
  editorialMode: "Modo editorial",
  manifestoTitle: "Avangarda ahora se siente como una revista digital con actitud.",
  manifestoCopy: "La dirección es intencionalmente más oscura, más tensa y más directa. Eso da más energía a la portada, más espacio para las imágenes y una voz editorial más marcada.",
  manifestoOneTitle: "Impacto visual más fuerte",
  manifestoOneCopy: "Titulares grandes, portadas hero y contraste duro sostienen ahora la parte superior de la página.",
  manifestoTwoTitle: "Ritmo de portada más rápido",
  manifestoTwoCopy: "Ticker, cuadrículas y secciones ahora llenan la pantalla como un frente de redacción real.",
  manifestoThreeTitle: "Traducción + fallback del CMS",
  manifestoThreeCopy: "La interfaz y el contenido cambian de idioma y aun así mantienen un fallback seguro cuando faltan campos traducidos.",
  latestTitle: "PRIMERA LÍNEA",
  latestCopy: "Cada nuevo artículo ahora recibe más espacio, más contraste y un tratamiento de revista más claro.",
  readStory: "Leer",
  emptyLeadTitle: "La portada espera su primera gran historia.",
  emptyLeadCopy: "Publica al menos un artículo con imagen de portada y este espacio se convertirá enseguida en un hero completo.",
  strongerSiteTitle: "El sitio está listo para mucho más contenido.",
  strongerSiteCopy: "A medida que agregues más historias, Avangarda se sentirá más llena, más firme y más editorial.",
  impactStory: "Historias publicadas",
  impactSupport: "Temas activos",
  impactSections: "Autores en la red",
  impactRhythm: "Historias en los últimos 7 días",
  whatNext: "Qué sigue",
  whatNextTitle: "La portada ya tiene la estructura de un medio serio.",
  whatNextCopy: "El siguiente salto llega con más historias, más secciones y paquetes editoriales, recomendaciones y especiales más ricos.",
  utilityLabel: "Herramienta",
  utilityTitle: "Una búsqueda que se siente como una herramienta de redacción.",
  utilityCopy: "La búsqueda ya no es secundaria. Ahora forma parte del flujo editorial y de la entrada al archivo.",
  archiveLabel: "Archivo",
  archiveTitle: "Archivo como base profunda de lectura.",
  archiveCopy: "El archivo puede sostener años, temas, autores y secciones sin romper el diseño ni el ritmo.",
  quote: "Un buen sitio de revista necesita una postura desde el primer momento.",
  quoteCredit: "Principio editorial",
  themesLabel: "Temas",
  themesTitle: "Secciones con más carácter.",
  themesCopy: "Las secciones ya no son solo enlaces. Cada una puede llevar su propio tono, enfoque y serie de historias.",
  sectionsLabel: "Direcciones",
  sectionsTitle: "Cuatro direcciones editoriales",
  sectionsCopy: "Cada línea editorial tiene ahora suficiente espacio para sentirse como un microcosmos propio, no como un añadido.",
  sectionNewsCopy: "Actualizaciones rápidas, titulares afilados e impulso de portada.",
  sectionAnalysisCopy: "Textos largos y argumentos con suficiente peso para sostenerse solos.",
  sectionInterviewCopy: "Formatos de preguntas y respuestas con más carácter y mejor ritmo de lectura.",
  sectionColumnCopy: "Voces personales, opinión y un tono editorial más directo.",
  footerCopy: "Avangarda combina una estética de revista más fuerte, interfaz multilingüe y movimiento de newsroom.",
  footerSectionsLabel: "Secciones",
  footerReachLabel: "Red",
  footerNewsletter: "Newsletter pronto",
  footerSocial: "Instagram, YouTube y formatos sociales",
  footerContactLine: "Contacto y perfiles de autor",
  articleLabel: "Artículo",
  archivePageLabel: "Archivo",
  searchLabel: "Buscar",
  sectionLabel: "Sección",
  backToHome: "Volver al inicio",
  commentsTitle: "Comentarios",
  commentsCopy: "Los comentarios aparecen inmediatamente debajo del texto. Puedes borrar cualquier cosa inapropiada desde el CMS.",
  commentName: "Nombre",
  commentEmail: "Correo (no público)",
  commentPlaceholder: "Escribe un comentario",
  sendComment: "Enviar comentario",
  readMode: "Modo de lectura",
  readModeTitle: "Esta historia ahora tiene un ritmo de lectura más fuerte.",
  readModeCopy: "Titulares grandes, imagen de portada potente y contraste oscuro mantienen el foco en la historia. El siguiente paso puede ser añadir historias relacionadas, elementos de compartir y más detalle de movimiento.",
  articleNotFound: "Artículo no encontrado.",
  articleNotFoundCopy: "Revisa la dirección o vuelve al inicio para abrir otras historias.",
  archiveTitlePage: "Explora temas, años y secciones.",
  archiveCopyPage: "El archivo ahora se siente como una entrada curada a toda la publicación y no como una herramienta desnuda.",
  archiveSearchPlaceholder: "Busca un tema, autor o idea",
  archiveYear: "Año",
  openResults: "Abrir resultados",
  searchTitlePage: "Encuentra historias por tema, sección y tiempo.",
  searchCopyPage: "La búsqueda ahora tiene espacio para sentirse como una herramienta seria de lectura y edición.",
  searchPlaceholder: "Busca temas, autores, lugares...",
  searchYear: "Año",
  searchButton: "Buscar",
  searchResults: "Resultados",
  searchStart: "Iniciar búsqueda",
  searchNone: "Sin resultados",
  searchHelperActive: "Los resultados se muestran como tarjetas editoriales legibles con suficiente espacio para título y contexto.",
  searchHelperIdle: "Escribe un término o elige una sección para abrir resultados.",
  openItem: "Abrir",
  searchNoHitsTitle: "No hay resultados para esta combinación de filtros.",
  searchNoHitsCopy: "Prueba un término más amplio, otra sección o un año sin filtros.",
  sectionPageCopy: "La vista de textos de una sola línea editorial sigue la misma lógica visual que la portada.",
  sectionEmptyTitle: "Todavía no hay textos publicados en esta sección.",
  sectionEmptyCopy: "Cuando publiques contenido en esta categoría, aquí aparecerán tarjetas editoriales ordenadas.",
  authorNotFound: "Autor no encontrado.",
  authorNotFoundCopy: "Vuelve al inicio o a la búsqueda para abrir otros perfiles y textos.",
  authorPosts: "Textos del autor",
  authorPostsCopy: "",
  authorEmptyTitle: "Este autor todavía no tiene textos publicados.",
  authorEmptyCopy: "Cuando aparezcan publicaciones vinculadas a este perfil, se mostrarán aquí como tarjetas editoriales ordenadas.",
  contact: "Contacto",
  allSections: "Todas las secciones",
  sectionAnalysis: "Análisis",
  sectionInterview: "Entrevistas",
  sectionColumn: "Columnas",
  editorialStatementEyebrow: "Por qué publicamos esto",
  editorialStatementCopy: "No publicamos esta historia para rellenar espacio, sino para abrir un tema que exige atención, contexto y responsabilidad. Si la historia principal es fuerte, la portada debe mostrar por qué importa, a quién interpela y qué pone en movimiento después. Esa es la voz editorial del sitio, no un texto decorativo entre módulos.",
  editorialStatementLink: "Ir a la historia principal",
  signalLabel: "Señal",
  homepageSignalTitle: "Los números que abren la historia",
  homepageSignalCopy: "El pequeño bloque de señal une cifra, fuente y contexto antes de entrar más hondo en el análisis.",
  analysisSignalTitle: "La señal dentro del análisis",
  analysisSignalCopy: "Aquí la cifra no es un dashboard sino una prueba editorial, un punto de presión y un contexto más amplio para historias que piden más que una impresión rápida.",
  articleSignalTitle: "Señal y contexto",
  articleSignalCopy: "Las señales conectadas mantienen la historia anclada en cifras reales, instituciones y ritmos de vida.",
  signalContextCta: "Abrir contexto"
};

const greekDictionary: Dictionary = {
  ...baseDictionaries.en,
  navNews: "\u03a0\u03c1\u03ce\u03c4\u03b7",
  latestEyebrow: "\u03a0\u03a1\u03a9\u03a4\u0397",
  sectionNews: "\u03a0\u03c1\u03ce\u03c4\u03b7",
  brandEyebrow: "Οξείες ιστορίες",
  navHome: "Αρχική",
  navAnalysis: "Αναλύσεις",
  navInterview: "Συνεντεύξεις",
  navColumn: "Στήλες",
  navArchive: "Αρχείο",
  navSearch: "Αναζήτηση",
  tickerNow: "Τώρα",
  tickerItems: [
    "Η Avangarda ακολουθεί τον ρυθμό των νέων ιστοριών σε πραγματικό χρόνο.",
    "Η αρχική σελίδα έχει τώρα πιο έντονη περιοδική ταυτότητα και κινούμενους τίτλους.",
    "Οι εικόνες εξωφύλλου από το CMS μπαίνουν απευθείας στο οπτικό σύστημα.",
    "Κάθε νέα ιστορία γεμίζει αυτόματα το ticker, το grid και τις ενότητες."
  ],
  heroEyebrow: "Ενέργεια πρώτης σελίδας",
  heroFallbackTitle: "Ένα πιο σκοτεινό, πιο κοφτερό και πιο έντονο ψηφιακό περιοδικό.",
  heroFallbackCopy: "Η αρχική είναι τώρα φτιαγμένη για δυνατή φωτογραφία, μεγάλους τίτλους και έναν εκδοτικό ρυθμό που μοιάζει με πραγματικό μέσο.",
  heroPrimary: "Διάβασε την ιστορία",
  heroSecondary: "Εξερεύνησε θέματα",
  heroFocus: "Εστίαση",
  heroDate: "Ημερομηνία",
  heroStyle: "Ύφος",
  heroStyleValue: "Μαύρη βάση, λευκή αντίθεση, κίτρινη έμφαση και μεγάλα covers",
  heroFallbackFocus: "Κουλτούρα, διαδίκτυο, ταυτότητα και μεγάλες φόρμες",
  heroFallbackDate: "Έτοιμο για την επόμενη μεγάλη ιστορία",
  heroNext: "Επόμενο",
  heroPrevious: "Προηγούμενο",
  heroVolumeUp: "Ήχος +",
  heroVolumeDown: "Ήχος -",
  heroMute: "Σίγαση",
  heroUnmute: "Ενεργοποίηση ήχου",
  editorialMode: "Εκδοτική λειτουργία",
  manifestoTitle: "Η Avangarda μοιάζει τώρα με ψηφιακό περιοδικό με άποψη.",
  manifestoCopy: "Η κατεύθυνση είναι σκόπιμα πιο σκοτεινή, πιο σφιχτή και πιο άμεση. Έτσι η αρχική αποκτά περισσότερη ενέργεια, χώρο για δυνατές εικόνες και πιο καθαρή εκδοτική φωνή.",
  manifestoOneTitle: "Ισχυρότερο οπτικό χτύπημα",
  manifestoOneCopy: "Μεγάλοι τίτλοι, hero covers και σκληρή αντίθεση κρατούν τώρα την κορυφή της σελίδας.",
  manifestoTwoTitle: "Γρηγορότερος ρυθμός αρχικής",
  manifestoTwoCopy: "Ticker, grids και ενότητες γεμίζουν τώρα την οθόνη σαν πραγματικό front newsroom.",
  manifestoThreeTitle: "Μετάφραση + fallback CMS",
  manifestoThreeCopy: "Η διεπαφή και το περιεχόμενο αλλάζουν γλώσσα και παραμένουν ασφαλή όταν λείπουν μεταφρασμένα πεδία.",
  latestTitle: "ΠΡΩΤΗ ΓΡΑΜΜΗ",
  latestCopy: "Κάθε νέο άρθρο έχει τώρα περισσότερο χώρο, δυνατότερη αντίθεση και καθαρότερη μεταχείριση περιοδικού.",
  readStory: "Διάβασε",
  emptyLeadTitle: "Η αρχική περιμένει την πρώτη μεγάλη ιστορία της.",
  emptyLeadCopy: "Δημοσίευσε τουλάχιστον ένα άρθρο με εικόνα εξωφύλλου και αυτό το σημείο θα γίνει αμέσως πλήρες hero.",
  strongerSiteTitle: "Το site είναι έτοιμο για πολύ περισσότερο περιεχόμενο.",
  strongerSiteCopy: "Όσο προσθέτεις περισσότερες ιστορίες, η Avangarda θα γίνεται πιο γεμάτη, πιο στιβαρή και πιο εκδοτική.",
  impactStory: "Δημοσιευμένες ιστορίες",
  impactSupport: "Ενεργά θέματα",
  impactSections: "Συγγραφείς στο δίκτυο",
  impactRhythm: "Ιστορίες τις τελευταίες 7 ημέρες",
  whatNext: "Τι ακολουθεί",
  whatNextTitle: "Η αρχική έχει τώρα τη δομή ενός σοβαρού μέσου.",
  whatNextCopy: "Το επόμενο άλμα έρχεται με περισσότερες ιστορίες, περισσότερες ενότητες και πλουσιότερα εκδοτικά πακέτα, προτάσεις και αφιερώματα.",
  utilityLabel: "Εργαλείο",
  utilityTitle: "Αναζήτηση που λειτουργεί σαν newsroom tool.",
  utilityCopy: "Η αναζήτηση δεν είναι πια δευτερεύουσα. Είναι μέρος της εκδοτικής ροής και η είσοδος στο αρχείο.",
  archiveLabel: "Αρχείο",
  archiveTitle: "Αρχείο ως βαθιά βάση ανάγνωσης.",
  archiveCopy: "Το αρχείο μπορεί να φιλοξενήσει χρόνια, θέματα, συγγραφείς και ενότητες χωρίς να σπάει ο σχεδιασμός ή ο ρυθμός.",
  quote: "Ένα δυνατό περιοδικό site χρειάζεται άποψη από την πρώτη στιγμή που ανοίγει.",
  quoteCredit: "Εκδοτική αρχή",
  themesLabel: "Θέματα",
  themesTitle: "Ενότητες με ισχυρότερο χαρακτήρα.",
  themesCopy: "Οι ενότητες δεν είναι πια απλώς σύνδεσμοι. Καθεμία μπορεί να κρατά τον δικό της τόνο, την εστίαση και τη δική της σειρά ιστοριών.",
  sectionsLabel: "Κατευθύνσεις",
  sectionsTitle: "Τέσσερις εκδοτικές κατευθύνσεις",
  sectionsCopy: "Κάθε εκδοτική λωρίδα έχει τώρα αρκετό χώρο ώστε να μοιάζει με δικό της μικρόκοσμο, όχι με προσθήκη.",
  sectionNewsCopy: "Γρήγορες ενημερώσεις, κοφτεροί τίτλοι και momentum πρώτης σελίδας.",
  sectionAnalysisCopy: "Μεγάλες φόρμες και επιχειρήματα με αρκετό βάρος ώστε να στέκονται μόνα τους.",
  sectionInterviewCopy: "Μορφές Q&A με περισσότερο χαρακτήρα και πιο δυνατό ρυθμό ανάγνωσης.",
  sectionColumnCopy: "Προσωπικές φωνές, άποψη και πιο άμεσος εκδοτικός τόνος.",
  footerCopy: "Η Avangarda συνδυάζει ισχυρότερη αισθητική περιοδικού, πολυγλωσσικό interface και κινούμενες newsroom στιγμές.",
  footerSectionsLabel: "Ενότητες",
  footerReachLabel: "Δίκτυο",
  footerNewsletter: "Newsletter σύντομα",
  footerSocial: "Instagram, YouTube και social formats",
  footerContactLine: "Επικοινωνία και προφίλ συντακτών",
  articleLabel: "Άρθρο",
  authorLabel: "Συγγραφέας",
  archivePageLabel: "Αρχείο",
  searchLabel: "Αναζήτηση",
  sectionLabel: "Ενότητα",
  backToHome: "Πίσω στην αρχική",
  commentsTitle: "Σχόλια",
  commentsCopy: "Τα σχόλια εμφανίζονται αμέσως κάτω από το κείμενο. Μπορείς πάντα να αφαιρέσεις οτιδήποτε ακατάλληλο από το CMS.",
  commentName: "Όνομα",
  commentEmail: "Email (όχι δημόσιο)",
  commentPlaceholder: "Γράψε σχόλιο",
  sendComment: "Στείλε σχόλιο",
  readMode: "Λειτουργία ανάγνωσης",
  readModeTitle: "Αυτή η ιστορία έχει τώρα ισχυρότερο ρυθμό ανάγνωσης.",
  readModeCopy: "Μεγάλοι τίτλοι, δυνατή εικόνα εξωφύλλου και σκοτεινή αντίθεση κρατούν την προσοχή στην ιστορία. Το επόμενο βήμα μπορεί να είναι σχετικές ιστορίες, στοιχεία κοινοποίησης και περισσότερες λεπτομέρειες κίνησης.",
  articleNotFound: "Το άρθρο δεν βρέθηκε.",
  articleNotFoundCopy: "Έλεγξε τη διεύθυνση ή γύρισε στην αρχική για να ανοίξεις άλλες ιστορίες.",
  archiveTitlePage: "Εξερεύνησε θέματα, χρόνια και ενότητες.",
  archiveCopyPage: "Το αρχείο μοιάζει τώρα με επιμελημένη είσοδο σε όλη τη δημοσίευση και όχι με γυμνό εργαλείο.",
  archiveSearchPlaceholder: "Αναζήτησε θέμα, συγγραφέα ή ιδέα",
  archiveYear: "Έτος",
  openResults: "Άνοιγμα αποτελεσμάτων",
  searchTitlePage: "Βρες ιστορίες ανά θέμα, ενότητα και χρόνο.",
  searchCopyPage: "Η αναζήτηση έχει πλέον αρκετό χώρο ώστε να μοιάζει με σοβαρό εργαλείο ανάγνωσης και επιμέλειας.",
  searchPlaceholder: "Αναζήτησε θέματα, συγγραφείς, μέρη...",
  searchYear: "Έτος",
  searchButton: "Αναζήτηση",
  searchResults: "Αποτελέσματα",
  searchStart: "Έναρξη αναζήτησης",
  searchNone: "Δεν υπάρχουν αποτελέσματα",
  searchHelperActive: "Τα αποτελέσματα εμφανίζονται ως αναγνώσιμες εκδοτικές κάρτες με αρκετό χώρο για τίτλο και πλαίσιο.",
  searchHelperIdle: "Πληκτρολόγησε έναν όρο ή διάλεξε ενότητα για να ανοίξεις αποτελέσματα.",
  openItem: "Άνοιγμα",
  searchNoHitsTitle: "Δεν υπάρχουν αποτελέσματα για αυτόν τον συνδυασμό φίλτρων.",
  searchNoHitsCopy: "Δοκίμασε ευρύτερο όρο, άλλη ενότητα ή έτος χωρίς φίλτρα.",
  sectionPageCopy: "Η προβολή κειμένων μιας εκδοτικής ενότητας ακολουθεί την ίδια οπτική λογική με την αρχική.",
  sectionEmptyTitle: "Δεν υπάρχουν ακόμη δημοσιευμένα κείμενα σε αυτή την ενότητα.",
  sectionEmptyCopy: "Όταν δημοσιεύσεις περιεχόμενο σε αυτή την κατηγορία, εδώ θα εμφανιστούν επιμελημένες κάρτες κειμένων.",
  authorNotFound: "Ο συγγραφέας δεν βρέθηκε.",
  authorNotFoundCopy: "Γύρισε στην αρχική ή στην αναζήτηση για να ανοίξεις άλλα προφίλ και κείμενα.",
  authorPosts: "Κείμενα συγγραφέα",
  authorPostsCopy: "",
  authorEmptyTitle: "Αυτός ο συγγραφέας δεν έχει ακόμη δημοσιευμένα κείμενα.",
  authorEmptyCopy: "Όταν εμφανιστούν δημοσιεύσεις που συνδέονται με αυτό το προφίλ, θα παρουσιαστούν εδώ ως επιμελημένες εκδοτικές κάρτες.",
  contact: "Επικοινωνία",
  allSections: "Όλες οι ενότητες",
  sectionAnalysis: "Αναλύσεις",
  sectionInterview: "Συνεντεύξεις",
  sectionColumn: "Στήλες",
  editorialStatementEyebrow: "Γιατί το δημοσιεύουμε",
  editorialStatementCopy: "Δεν δημοσιεύουμε αυτή την ιστορία για να γεμίσουμε χώρο αλλά για να ανοίξουμε ένα θέμα που απαιτεί προσοχή, πλαίσιο και ευθύνη. Αν η κεντρική ιστορία είναι ισχυρή, η αρχική πρέπει να δείχνει γιατί έχει σημασία, σε ποιον μιλά και τι θέτει σε κίνηση μετά. Αυτή είναι η εκδοτική φωνή του site, όχι διακοσμητικό κείμενο ανάμεσα σε modules.",
  editorialStatementLink: "Πήγαινε στην κεντρική ιστορία",
  signalLabel: "Σήμα",
  homepageSignalTitle: "Οι αριθμοί που ανοίγουν την ιστορία",
  homepageSignalCopy: "Το μικρό signal block συνδέει αριθμό, πηγή και πλαίσιο πριν μπεις βαθύτερα στην ανάλυση.",
  analysisSignalTitle: "Το σήμα μέσα στην ανάλυση",
  analysisSignalCopy: "Εδώ ο αριθμός δεν είναι dashboard αλλά εκδοτικό τεκμήριο, σημείο πίεσης και ευρύτερο πλαίσιο για ιστορίες που ζητούν περισσότερα από μια γρήγορη εντύπωση.",
  articleSignalTitle: "Σήμα και πλαίσιο",
  articleSignalCopy: "Τα συνδεδεμένα σήματα κρατούν την ιστορία αγκυρωμένη σε πραγματικούς αριθμούς, θεσμούς και ρυθμούς ζωής.",
  signalContextCta: "Άνοιγμα πλαισίου"
};

const arabicDictionary: Dictionary = {
  ...baseDictionaries.en,
  navNews: "\u0627\u0644\u0648\u0627\u062c\u0647\u0629",
  latestEyebrow: "\u0627\u0644\u0648\u0627\u062c\u0647\u0629",
  sectionNews: "\u0627\u0644\u0648\u0627\u062c\u0647\u0629",
  brandEyebrow: "حكايات حادة",
  navHome: "الرئيسية",
  navAnalysis: "تحليلات",
  navInterview: "مقابلات",
  navColumn: "أعمدة",
  navArchive: "الأرشيف",
  navSearch: "بحث",
  tickerNow: "الآن",
  tickerItems: [
    "تتابع أفانغاردا إيقاع القصص الجديدة في الوقت الحقيقي.",
    "تحمل الصفحة الرئيسية الآن هوية مجلّية أقوى وعناوين متحركة.",
    "تدخل صور الغلاف من CMS مباشرة في النظام البصري.",
    "كل قصة جديدة تملأ الشريط الشبكي والأقسام تلقائياً."
  ],
  heroEyebrow: "طاقة الصفحة الرئيسية",
  heroFallbackTitle: "مجلة رقمية أكثر قتامة وأكثر حدّة وأكثر قوة.",
  heroFallbackCopy: "أصبحت الصفحة الرئيسية الآن مبنية على تصوير قوي وعناوين كبيرة وإيقاع تحريري يشبه وسيلة إعلام حقيقية.",
  heroPrimary: "اقرأ القصة",
  heroSecondary: "استكشف الموضوعات",
  heroFocus: "التركيز",
  heroDate: "التاريخ",
  heroStyle: "الأسلوب",
  heroStyleValue: "قاعدة سوداء، تباين أبيض، لمسة صفراء وأغلفة كبيرة",
  heroFallbackFocus: "الثقافة والإنترنت والهوية والقصص الطويلة",
  heroFallbackDate: "جاهز للقصة الكبيرة التالية",
  heroNext: "التالي",
  heroPrevious: "السابق",
  heroVolumeUp: "الصوت +",
  heroVolumeDown: "الصوت -",
  heroMute: "كتم الصوت",
  heroUnmute: "تشغيل الصوت",
  editorialMode: "الوضع التحريري",
  manifestoTitle: "تبدو أفانغاردا الآن كمجلة رقمية ذات موقف واضح.",
  manifestoCopy: "الاتجاه أصبح أغمق وأكثر إحكاماً وأكثر مباشرة عن قصد. وهذا يمنح الصفحة الرئيسية طاقة أقوى ومساحة أكبر للصور وصوتاً تحريرياً أوضح.",
  manifestoOneTitle: "أثر بصري أقوى",
  manifestoOneCopy: "العناوين الكبيرة وصور الغلاف الرئيسية والتباين الحاد تحمل الآن أعلى الصفحة.",
  manifestoTwoTitle: "إيقاع أسرع للواجهة",
  manifestoTwoCopy: "يمتلئ الشريط والشبكات والأقسام الآن بالشاشة مثل واجهة غرفة أخبار حقيقية.",
  manifestoThreeTitle: "ترجمة + fallback من CMS",
  manifestoThreeCopy: "يمكن للواجهة والمحتوى تبديل اللغة مع الحفاظ على fallback آمن عندما تكون الحقول المترجمة فارغة.",
  latestTitle: "الخط الأول",
  latestCopy: "يحصل كل مقال جديد الآن على مساحة أكبر وتباين أقوى ومعالجة أكثر وضوحاً بطابع المجلة.",
  readStory: "اقرأ",
  emptyLeadTitle: "الصفحة الرئيسية تنتظر أول قصة كبيرة لها.",
  emptyLeadCopy: "انشر مقالاً واحداً على الأقل مع صورة غلاف وسيتحوّل هذا المكان مباشرة إلى hero كامل.",
  strongerSiteTitle: "الموقع جاهز لمحتوى أكثر بكثير.",
  strongerSiteCopy: "كلما أضفت قصصاً أكثر ستبدو أفانغاردا أكثر امتلاءً وأكثر صلابة وأكثر تحريرية.",
  impactStory: "قصص منشورة",
  impactSupport: "موضوعات نشطة",
  impactSections: "كتّاب ضمن الشبكة",
  impactRhythm: "قصص خلال آخر 7 أيام",
  whatNext: "ما التالي",
  whatNextTitle: "أصبحت الصفحة الرئيسية الآن تملك بنية وسيلة إعلام جادة.",
  whatNextCopy: "القفزة التالية تأتي من مزيد من القصص ومزيد من الأقسام وحزم تحريرية أغنى وتوصيات وملفات خاصة.",
  utilityLabel: "أداة",
  utilityTitle: "بحث يعمل كأداة غرفة أخبار.",
  utilityCopy: "لم يعد البحث أمراً ثانوياً. بل أصبح جزءاً من التدفق التحريري ونقطة الدخول إلى الأرشيف.",
  archiveLabel: "الأرشيف",
  archiveTitle: "الأرشيف كقاعدة قراءة عميقة.",
  archiveCopy: "يمكن للأرشيف أن يستوعب سنوات وموضوعات وكتّاباً وأقساماً من دون أن ينهار التصميم أو الإيقاع.",
  quote: "موقع المجلة القوي يحتاج إلى موقف واضح منذ اللحظة الأولى.",
  quoteCredit: "المبدأ التحريري",
  themesLabel: "الموضوعات",
  themesTitle: "أقسام بشخصية أقوى.",
  themesCopy: "لم تعد الأقسام مجرد روابط. يمكن لكل قسم أن يحمل نبرته الخاصة وتركيزه وسلسلة قصصه.",
  sectionsLabel: "الاتجاهات",
  sectionsTitle: "أربعة اتجاهات تحريرية",
  sectionsCopy: "أصبح لكل مسار تحريري الآن مساحة كافية ليشعر بأنه عالمه الصغير الخاص، لا مجرد إضافة.",
  sectionNewsCopy: "تحديثات سريعة وعناوين حادة وزخم يشبه الصفحة الأولى.",
  sectionAnalysisCopy: "نصوص طويلة وحجج تملك وزناً كافياً لتقف وحدها.",
  sectionInterviewCopy: "صيغة سؤال وجواب بشخصية أقوى وإيقاع قراءة أفضل.",
  sectionColumnCopy: "أصوات شخصية وموقف ونبرة تحريرية أكثر مباشرة.",
  footerCopy: "تمزج أفانغاردا بين مظهر مجلة أقوى وواجهة متعددة اللغات ولحظات newsroom متحركة.",
  footerSectionsLabel: "الأقسام",
  footerReachLabel: "الشبكة",
  footerNewsletter: "النشرة قريباً",
  footerSocial: "إنستغرام ويوتيوب وصيغ اجتماعية",
  footerContactLine: "التواصل وملفات الكتّاب",
  articleLabel: "مقال",
  authorLabel: "الكاتب",
  archivePageLabel: "الأرشيف",
  searchLabel: "بحث",
  sectionLabel: "القسم",
  backToHome: "العودة إلى الرئيسية",
  commentsTitle: "التعليقات",
  commentsCopy: "تظهر التعليقات مباشرة تحت النص. ويمكنك دائماً حذف أي شيء غير مناسب من خلال CMS.",
  commentName: "الاسم",
  commentEmail: "البريد الإلكتروني (غير عام)",
  commentPlaceholder: "اكتب تعليقاً",
  sendComment: "إرسال التعليق",
  readMode: "وضع القراءة",
  readModeTitle: "أصبحت هذه القصة الآن تملك إيقاع قراءة أقوى.",
  readModeCopy: "العناوين الكبيرة وصورة الغلاف القوية والتباين الداكن تبقي التركيز على القصة. ويمكن أن تكون الخطوة التالية قصصاً مرتبطة وعناصر مشاركة وتفاصيل حركة إضافية.",
  articleNotFound: "المقال غير موجود.",
  articleNotFoundCopy: "تحقق من العنوان أو عُد إلى الرئيسية لفتح قصص أخرى.",
  archiveTitlePage: "تصفّح الموضوعات والسنوات والأقسام.",
  archiveCopyPage: "أصبح الأرشيف الآن مدخلاً منسقاً إلى كامل المنشور بدلاً من كونه أداة جافة.",
  archiveSearchPlaceholder: "ابحث عن موضوع أو كاتب أو فكرة",
  archiveYear: "السنة",
  openResults: "فتح النتائج",
  searchTitlePage: "اعثر على القصص حسب الموضوع والقسم والزمن.",
  searchCopyPage: "أصبح للبحث الآن مساحة كافية ليشعر كأداة جدية للقراءة والتحرير.",
  searchPlaceholder: "ابحث عن موضوعات أو كتّاب أو أماكن...",
  searchYear: "السنة",
  searchButton: "بحث",
  searchResults: "النتائج",
  searchStart: "ابدأ البحث",
  searchNone: "لا توجد نتائج",
  searchHelperActive: "تُعرض النتائج كبطاقات تحريرية واضحة مع مساحة كافية للعنوان والسياق.",
  searchHelperIdle: "اكتب مصطلحاً أو اختر قسماً لفتح النتائج.",
  openItem: "فتح",
  searchNoHitsTitle: "لا توجد نتائج لهذه المجموعة من الفلاتر.",
  searchNoHitsCopy: "جرّب مصطلحاً أوسع أو قسماً آخر أو سنة من دون فلاتر.",
  sectionPageCopy: "تعرض صفحة نصوص القسم التحريري نفس المنطق البصري المستخدم في الصفحة الرئيسية.",
  sectionEmptyTitle: "لا توجد بعد نصوص منشورة في هذا القسم.",
  sectionEmptyCopy: "عندما تنشر محتوى في هذه الفئة ستظهر هنا بطاقات تحريرية مرتبة.",
  authorNotFound: "الكاتب غير موجود.",
  authorNotFoundCopy: "عُد إلى الرئيسية أو إلى البحث لفتح ملفات ونصوص أخرى.",
  authorPosts: "نصوص الكاتب",
  authorPostsCopy: "",
  authorEmptyTitle: "لا يملك هذا الكاتب نصوصاً منشورة بعد.",
  authorEmptyCopy: "عندما تظهر منشورات مرتبطة بهذا الملف الشخصي، ستعرض هنا كبطاقات تحريرية مرتبة.",
  contact: "اتصل بنا",
  allSections: "كل الأقسام",
  sectionAnalysis: "تحليلات",
  sectionInterview: "مقابلات",
  sectionColumn: "أعمدة",
  editorialStatementEyebrow: "لماذا ننشر هذا",
  editorialStatementCopy: "نحن لا ننشر هذه القصة لملء فراغ، بل لفتح موضوع يحتاج إلى انتباه وسياق ومسؤولية. إذا كانت القصة الرئيسية قوية، فيجب على الواجهة أن تُظهر لماذا تهم، ولمن تتحدث، وما الذي تحرّكه بعد ذلك. هذا هو الصوت التحريري للموقع، لا نص زخرفي بين الوحدات.",
  editorialStatementLink: "اذهب إلى القصة الرئيسية",
  signalLabel: "إشارة",
  homepageSignalTitle: "الأرقام التي تفتح القصة",
  homepageSignalCopy: "يربط بلوك الإشارة الصغير بين الرقم والمصدر والسياق قبل الدخول أعمق في التحليل.",
  analysisSignalTitle: "الإشارة داخل التحليل",
  analysisSignalCopy: "هنا لا يكون الرقم مجرد dashboard، بل دليل تحريري ونقطة ضغط وسياق أوسع لقصص تحتاج إلى أكثر من انطباع سريع.",
  articleSignalTitle: "الإشارة والسياق",
  articleSignalCopy: "تحافظ الإشارات المرتبطة على ارتباط القصة بأرقام حقيقية ومؤسسات وإيقاعات الحياة اليومية.",
  signalContextCta: "فتح السياق"
};

const dictionaries: Record<Lang, Dictionary> = {
  ...baseDictionaries,
  es: spanishDictionary,
  el: greekDictionary,
  ar: arabicDictionary
};

export function getDictionary(lang: Lang) {
  return dictionaries[lang];
}

export function getSectionLabel(section: string, lang: Lang) {
  const dict = getDictionary(lang);
  const normalizedSection = normalizeSectionSlug(section);
  const map: Record<string, string> = {
    front: dict.sectionNews,
    news: dict.sectionNews,
    vesti: dict.sectionNews,
    analysis: dict.sectionAnalysis,
    interview: dict.sectionInterview,
    column: dict.sectionColumn
  };
  return map[normalizedSection] ?? section;
}
