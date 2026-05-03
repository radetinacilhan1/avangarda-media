import { normalizeSectionSlug } from "@/lib/sections";

export const languages = [
  { code: "sr", label: "Srpski", flag: "\uD83C\uDDF7\uD83C\uDDF8" },
  { code: "en", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "tr", label: "Turkce", flag: "\uD83C\uDDF9\uD83C\uDDF7" },
  { code: "fr", label: "Francais", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA" }
] as const;

export type Lang = (typeof languages)[number]["code"];

const defaultLang: Lang = "sr";

export function resolveLang(value?: string | string[]): Lang {
  const lang = Array.isArray(value) ? value[0] : value;
  if (languages.some((entry) => entry.code === lang)) return lang as Lang;
  return defaultLang;
}

export function withLang(path: string, lang: Lang) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${lang}`;
}

export function getLanguageMeta(lang: Lang) {
  return languages.find((entry) => entry.code === lang) ?? languages[0];
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
  latestEyebrow: "Najnovije",
  latestTitle: "Novo na naslovnoj",
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
  sectionsLabel: "Sekcije",
  sectionsTitle: "Prostor za brutalnije sekcije",
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
  authorPostsCopy: "Profil autora sada ima istu ozbiljnost i preglednost kao ostatak uređivačkog iskustva.",
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
  editorialStatementLink: "Idi na glavnu priču"
};

const dictionaries: Record<Lang, Dictionary> = {
  sr,
  en: {
    ...sr,
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
    latestEyebrow: "Latest",
    latestTitle: "Fresh on the front page",
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
    sectionsLabel: "Sections",
    sectionsTitle: "Room for more brutal sections",
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
    authorPostsCopy: "The author page now has the same clarity and seriousness as the rest of the editorial experience.",
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
    editorialStatementLink: "Go to the lead story"
  },
  tr: {
    ...sr,
    brandEyebrow: "Keskin hikayeler",
    navHome: "Ana sayfa",
    navNews: "Front",
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
    heroNext: "Next",
    heroPrevious: "Prev",
    heroVolumeUp: "Ses +",
    heroVolumeDown: "Ses -",
    heroMute: "Kapat",
    heroUnmute: "Ac",
    latestEyebrow: "Son",
    latestTitle: "Ana sayfada yeni",
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
    contact: "Iletisim",
    allSections: "Tum bolumler",
    sectionNews: "Front",
    sectionAnalysis: "Analizler",
    sectionInterview: "R\u00f6portajlar",
    sectionColumn: "K\u00f6\u015fe",
    editorialStatementEyebrow: "Neden bunu yayimliyoruz",
    editorialStatementCopy: "Bu hikayeyi boslugu doldurmak icin degil, dikkat, baglam ve sorumluluk gerektiren bir konuyu one cikarmak icin yayimliyoruz. Ana hikaye gucluyse, ana sayfa neden onemli oldugunu, kime hitap ettigini ve sonraki adimda neyi harekete gecirdigini gostermelidir. Bu, moduller arasina serpilmis sus metni degil, sitenin editoral sesidir.",
    editorialStatementLink: "Ana hikayeye git"
  },
  fr: {
    ...sr,
    brandEyebrow: "Recits forts",
    navHome: "Accueil",
    navNews: "Front",
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
    heroNext: "Next",
    heroPrevious: "Prev",
    heroVolumeUp: "Son +",
    heroVolumeDown: "Son -",
    heroMute: "Muet",
    heroUnmute: "Activer",
    latestEyebrow: "Dernier",
    latestTitle: "Nouveau en une",
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
    contact: "Contact",
    allSections: "Toutes les sections",
    sectionNews: "Front",
    sectionAnalysis: "Analyses",
    sectionInterview: "Interviews",
    sectionColumn: "Chroniques",
    editorialStatementEyebrow: "Pourquoi nous publions cela",
    editorialStatementCopy: "Nous ne publions pas cette histoire pour remplir un espace, mais pour ouvrir un sujet qui exige attention, contexte et responsabilite. Si le texte principal est fort, la une doit montrer pourquoi il compte, a qui il parle et ce qu'il met en mouvement ensuite. C'est la voix editoriale du site, pas un texte decoratif entre des modules.",
    editorialStatementLink: "Aller au texte principal"
  },
  de: {
    ...sr,
    brandEyebrow: "Scharfe stories",
    navHome: "Startseite",
    navNews: "Front",
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
    heroNext: "Next",
    heroPrevious: "Prev",
    heroVolumeUp: "Ton +",
    heroVolumeDown: "Ton -",
    heroMute: "Stumm",
    heroUnmute: "An",
    latestEyebrow: "Neu",
    latestTitle: "Neu auf der Front",
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
    contact: "Kontakt",
    allSections: "Alle Sektionen",
    sectionNews: "Front",
    sectionAnalysis: "Analysen",
    sectionInterview: "Interviews",
    sectionColumn: "Kolumnen",
    editorialStatementEyebrow: "Warum wir das veroffentlichen",
    editorialStatementCopy: "Wir veroffentlichen diese Geschichte nicht, um eine Flache zu fullen, sondern um ein Thema zu offnen, das Aufmerksamkeit, Kontext und Verantwortung verlangt. Wenn die Hauptgeschichte stark ist, muss die Startseite zeigen, warum sie wichtig ist, wen sie anspricht und was sie als Nächstes auslost. Das ist die editoriale Stimme der Seite und kein dekorativer Text zwischen Modulen.",
    editorialStatementLink: "Zur Hauptgeschichte"
  }
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
