import type { Lang } from "@/lib/i18n";
import { buildLocalizedUrl } from "@/lib/seo";

export type DistributionArticle = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  content?: string;
  section?: string;
  publishedAt?: string;
  focus?: string;
  style?: string;
  signalText?: string;
  distributionNote?: string;
  authors: string[];
  topics: string[];
  coverImageUrl?: string;
};

export type DistributionDraftKey =
  | "linkedin"
  | "x"
  | "instagramThreads"
  | "newsletter"
  | "general";

export type DistributionDraft = {
  key: DistributionDraftKey;
  title: string;
  tone: string;
  text: string;
};

export type DistributionOpenLink = {
  href: string;
  label: string;
};

export type DistributionPanelCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  internalBadge: string;
  sourceCms: string;
  sourceFallback: string;
  articleListLabel: string;
  articleSearchPlaceholder: string;
  selectedArticleLabel: string;
  languageLabel: string;
  sectionLabel: string;
  topicsLabel: string;
  authorLabel: string;
  articleLinkLabel: string;
  distributionNoteLabel: string;
  distributionNoteHelper: string;
  resetNoteLabel: string;
  regenerateLabel: string;
  draftsLabel: string;
  copyLabel: string;
  copiedLabel: string;
  openStoryLabel: string;
  openLinkedInLabel: string;
  openXLabel: string;
  openInstagramLabel: string;
  openThreadsLabel: string;
  openMailLabel: string;
  emptyTitle: string;
  emptyCopy: string;
  noArticlesTitle: string;
  noArticlesCopy: string;
  manualReviewLabel: string;
  noDistributionNote: string;
  platformLabels: Record<DistributionDraftKey, string>;
  platformTones: Record<DistributionDraftKey, string>;
  sectionLabels: {
    front: string;
    analysis: string;
    interview: string;
    column: string;
  };
  authorPrefix: string;
  focusPrefix: string;
  topicsPrefix: string;
  fallbackContextLine: string;
  analysisContextLine: string;
  institutionContextLine: string;
  ecologyContextLine: string;
};

const distributionCopy: Record<Lang, DistributionPanelCopy> = {
  sr: {
    eyebrow: "Odjek",
    title: "Distribucija bez automatike",
    intro: "Predlozi copy-ja ostaju urednicki alat: povuci tekst, doradi ton, kopiraj i objavi tek kada odlucis.",
    internalBadge: "Interni panel",
    sourceCms: "CMS izvor",
    sourceFallback: "Fallback izvor",
    articleListLabel: "Skoriji tekstovi",
    articleSearchPlaceholder: "Trazi naslov, autora ili temu",
    selectedArticleLabel: "Izabrani tekst",
    languageLabel: "Jezik",
    sectionLabel: "Sekcija",
    topicsLabel: "Teme",
    authorLabel: "Autor",
    articleLinkLabel: "Link teksta",
    distributionNoteLabel: "Urednicka napomena za distribuciju",
    distributionNoteHelper: "Napomena ostaje interna. Koristi se samo za ton i naglasak predloga, bez automatske objave.",
    resetNoteLabel: "Vrati iz CMS-a",
    regenerateLabel: "Osvezi predloge",
    draftsLabel: "Platformske verzije",
    copyLabel: "Kopiraj",
    copiedLabel: "Kopirano",
    openStoryLabel: "Otvori tekst",
    openLinkedInLabel: "Otvori LinkedIn",
    openXLabel: "Otvori X",
    openInstagramLabel: "Otvori Instagram",
    openThreadsLabel: "Otvori Threads",
    openMailLabel: "Otvori e-mail",
    emptyTitle: "Izaberi tekst da bi se otvorili predlozi distribucije.",
    emptyCopy: "Panel ne objavljuje nista sam. SluzI samo za pripremu, doradu i rucnu distribuciju.",
    noArticlesTitle: "Jos nema objavljenih tekstova za distribuciju.",
    noArticlesCopy: "Kada tekst bude objavljen, ovde ce se pojaviti kao kandidat za odjek.",
    manualReviewLabel: "Rucna potvrda ostaje obavezna pre svake javne objave.",
    noDistributionNote: "Nema unete napomene. Predlozi su sastavljeni samo iz podataka clanka.",
    platformLabels: {
      linkedin: "LinkedIn verzija",
      x: "X verzija",
      instagramThreads: "Instagram / Threads verzija",
      newsletter: "Newsletter teaser",
      general: "Opsti copy",
    },
    platformTones: {
      linkedin: "Ozbiljniji, urednicki kontekst",
      x: "Kratko, direktno, spremno za jedan post",
      instagramThreads: "Vizuelnije, ostrije, emotivnije",
      newsletter: "Kratki uvod za newsletter blok",
      general: "Neutralna verzija za rucno deljenje",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Analize",
      interview: "Intervjui",
      column: "Kolumne",
    },
    authorPrefix: "Pise",
    focusPrefix: "Fokus",
    topicsPrefix: "Teme",
    fallbackContextLine: "Tekst ostaje u registru Avangarde: ljudska prava, sirovo, stvarno.",
    analysisContextLine: "Ovo se cita kao analiza, ne kao dnevna vest.",
    institutionContextLine: "U fokusu je odgovornost institucija, ne samo posledica.",
    ecologyContextLine: "Tema se cita kroz svakodnevni zivot, ne samo kroz sektor.",
  },
  en: {
    eyebrow: "Echo",
    title: "Distribution without automation",
    intro: "These drafts stay inside the editorial workflow: pull the story, adjust the tone, copy it, and publish only when you decide to.",
    internalBadge: "Internal panel",
    sourceCms: "CMS source",
    sourceFallback: "Fallback source",
    articleListLabel: "Recent stories",
    articleSearchPlaceholder: "Search title, author or topic",
    selectedArticleLabel: "Selected story",
    languageLabel: "Language",
    sectionLabel: "Section",
    topicsLabel: "Topics",
    authorLabel: "Author",
    articleLinkLabel: "Story link",
    distributionNoteLabel: "Editorial distribution note",
    distributionNoteHelper: "This note stays internal. It only shapes tone and emphasis for the draft, without auto-posting anything.",
    resetNoteLabel: "Reset from CMS",
    regenerateLabel: "Refresh drafts",
    draftsLabel: "Platform versions",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    openStoryLabel: "Open story",
    openLinkedInLabel: "Open LinkedIn",
    openXLabel: "Open X",
    openInstagramLabel: "Open Instagram",
    openThreadsLabel: "Open Threads",
    openMailLabel: "Open email",
    emptyTitle: "Pick a story to open distribution drafts.",
    emptyCopy: "Nothing is published automatically. The panel is only for preparation, revision and manual distribution.",
    noArticlesTitle: "There are no published stories ready for distribution yet.",
    noArticlesCopy: "Once a story is published, it will appear here as a candidate for editorial distribution.",
    manualReviewLabel: "Manual review remains required before anything goes public.",
    noDistributionNote: "No note has been entered. Drafts rely only on article data.",
    platformLabels: {
      linkedin: "LinkedIn version",
      x: "X version",
      instagramThreads: "Instagram / Threads version",
      newsletter: "Newsletter teaser",
      general: "General copy",
    },
    platformTones: {
      linkedin: "Editorial, steady and contextual",
      x: "Short, direct, ready for a single post",
      instagramThreads: "Sharper, more visual and more emotional",
      newsletter: "Compact intro for the newsletter block",
      general: "Neutral copy for manual sharing",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Analysis",
      interview: "Interviews",
      column: "Columns",
    },
    authorPrefix: "By",
    focusPrefix: "Focus",
    topicsPrefix: "Topics",
    fallbackContextLine: "The story stays in Avangarda's register: human rights, raw, real.",
    analysisContextLine: "This should travel as an analysis, not as a breaking update.",
    institutionContextLine: "The focus stays on institutional responsibility, not only on the aftermath.",
    ecologyContextLine: "The angle moves through everyday life, not only through the policy silo.",
  },
  tr: {
    eyebrow: "Yankı",
    title: "Otomasyonsuz dagitim",
    intro: "Taslaklar editorluk akisi icinde kalir: metni cek, tonu duzelt, kopyala ve yalnizca sen karar verdiginde yayinla.",
    internalBadge: "Dahili panel",
    sourceCms: "CMS kaynagi",
    sourceFallback: "Yedek kaynak",
    articleListLabel: "Son metinler",
    articleSearchPlaceholder: "Baslik, yazar ya da konu ara",
    selectedArticleLabel: "Secilen metin",
    languageLabel: "Dil",
    sectionLabel: "Bolum",
    topicsLabel: "Konular",
    authorLabel: "Yazar",
    articleLinkLabel: "Metin linki",
    distributionNoteLabel: "Dagitim icin editor notu",
    distributionNoteHelper: "Bu not dahili kalir. Sadece taslak tonunu ve vurgusunu etkiler; otomatik yayin yoktur.",
    resetNoteLabel: "CMS notuna don",
    regenerateLabel: "Taslaklari yenile",
    draftsLabel: "Platform versiyonlari",
    copyLabel: "Kopyala",
    copiedLabel: "Kopyalandi",
    openStoryLabel: "Metni ac",
    openLinkedInLabel: "LinkedIn'i ac",
    openXLabel: "X'i ac",
    openInstagramLabel: "Instagram'i ac",
    openThreadsLabel: "Threads'i ac",
    openMailLabel: "E-postayi ac",
    emptyTitle: "Dagitim taslaklarini gormek icin bir metin sec.",
    emptyCopy: "Panel hicbir seyi otomatik yayinlamaz. Yalnizca hazirlik, duzeltme ve manuel dagitim icindir.",
    noArticlesTitle: "Dagitim icin hazir yayinlanmis metin henuz yok.",
    noArticlesCopy: "Bir metin yayinlandiginda burada aday olarak gorunecek.",
    manualReviewLabel: "Halka aciklasmadan once manuel onay zorunlu kalir.",
    noDistributionNote: "Girilen not yok. Taslaklar yalnizca metin verilerine dayanir.",
    platformLabels: {
      linkedin: "LinkedIn versiyonu",
      x: "X versiyonu",
      instagramThreads: "Instagram / Threads versiyonu",
      newsletter: "Newsletter teaser",
      general: "Genel kopya",
    },
    platformTones: {
      linkedin: "Daha editorluk odakli ve baglamli",
      x: "Kisa ve dogrudan",
      instagramThreads: "Daha gorsel, daha keskin, daha duygulu",
      newsletter: "Bulten girisi icin kisa metin",
      general: "Elle paylasim icin tarafsiz metin",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Analiz",
      interview: "Ropörtaj",
      column: "Kolonlar",
    },
    authorPrefix: "Yazan",
    focusPrefix: "Odak",
    topicsPrefix: "Konular",
    fallbackContextLine: "Metin Avangarda tonunda kaliyor: insan haklari, ham, gercek.",
    analysisContextLine: "Bu metin haber degil, analiz olarak dolasma girmeli.",
    institutionContextLine: "Odak sonuc kadar kurumsal sorumlulukta da kaliyor.",
    ecologyContextLine: "Tema yalnizca sektor degil, gunluk hayat uzerinden okunuyor.",
  },
  fr: {
    eyebrow: "Echo",
    title: "Distribution sans automatisation",
    intro: "Les propositions restent dans le flux editorial: tirer le texte, ajuster le ton, copier puis publier seulement quand tu le decides.",
    internalBadge: "Panneau interne",
    sourceCms: "Source CMS",
    sourceFallback: "Source de secours",
    articleListLabel: "Textes recents",
    articleSearchPlaceholder: "Chercher titre, auteur ou theme",
    selectedArticleLabel: "Texte selectionne",
    languageLabel: "Langue",
    sectionLabel: "Section",
    topicsLabel: "Themes",
    authorLabel: "Auteur",
    articleLinkLabel: "Lien du texte",
    distributionNoteLabel: "Note editoriale pour la distribution",
    distributionNoteHelper: "Cette note reste interne. Elle sert seulement a guider le ton et l'accent du brouillon.",
    resetNoteLabel: "Revenir a la note CMS",
    regenerateLabel: "Rafraichir les brouillons",
    draftsLabel: "Versions par plateforme",
    copyLabel: "Copier",
    copiedLabel: "Copie",
    openStoryLabel: "Ouvrir le texte",
    openLinkedInLabel: "Ouvrir LinkedIn",
    openXLabel: "Ouvrir X",
    openInstagramLabel: "Ouvrir Instagram",
    openThreadsLabel: "Ouvrir Threads",
    openMailLabel: "Ouvrir l'e-mail",
    emptyTitle: "Choisis un texte pour ouvrir les propositions de diffusion.",
    emptyCopy: "Rien n'est publie automatiquement. Le panneau sert uniquement a preparer et ajuster la diffusion.",
    noArticlesTitle: "Aucun texte publie n'est encore disponible pour la diffusion.",
    noArticlesCopy: "Lorsqu'un texte sera publie, il apparaitra ici comme candidat.",
    manualReviewLabel: "La validation manuelle reste obligatoire avant toute publication.",
    noDistributionNote: "Aucune note n'a ete saisie. Les brouillons s'appuient seulement sur les donnees de l'article.",
    platformLabels: {
      linkedin: "Version LinkedIn",
      x: "Version X",
      instagramThreads: "Version Instagram / Threads",
      newsletter: "Accroche newsletter",
      general: "Copie generale",
    },
    platformTones: {
      linkedin: "Plus editorial, plus contextuel",
      x: "Court et direct",
      instagramThreads: "Plus visuel, plus brut, plus sensible",
      newsletter: "Introduction courte pour la newsletter",
      general: "Version neutre pour partage manuel",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Analyses",
      interview: "Entretiens",
      column: "Chroniques",
    },
    authorPrefix: "Par",
    focusPrefix: "Focus",
    topicsPrefix: "Themes",
    fallbackContextLine: "Le texte garde le registre Avangarda: droits humains, brut, reel.",
    analysisContextLine: "Ce texte doit circuler comme une analyse, pas comme une alerte.",
    institutionContextLine: "Le centre de gravite reste la responsabilite institutionnelle.",
    ecologyContextLine: "L'angle passe par la vie quotidienne, pas seulement par le secteur.",
  },
  de: {
    eyebrow: "Echo",
    title: "Distribution ohne Automatik",
    intro: "Die Entwuerfe bleiben Teil des redaktionellen Prozesses: Text ziehen, Ton schaerfen, kopieren und erst veroefentlichen, wenn du es freigibst.",
    internalBadge: "Interner Bereich",
    sourceCms: "CMS-Quelle",
    sourceFallback: "Fallback-Quelle",
    articleListLabel: "Neuere Texte",
    articleSearchPlaceholder: "Titel, Autor oder Thema suchen",
    selectedArticleLabel: "Ausgewaehlter Text",
    languageLabel: "Sprache",
    sectionLabel: "Rubrik",
    topicsLabel: "Themen",
    authorLabel: "Autor",
    articleLinkLabel: "Textlink",
    distributionNoteLabel: "Redaktionelle Distributionsnotiz",
    distributionNoteHelper: "Diese Notiz bleibt intern. Sie steuert nur Ton und Schwerpunkt des Entwurfs.",
    resetNoteLabel: "Auf CMS-Notiz zuruecksetzen",
    regenerateLabel: "Entwuerfe aktualisieren",
    draftsLabel: "Plattform-Versionen",
    copyLabel: "Kopieren",
    copiedLabel: "Kopiert",
    openStoryLabel: "Text oeffnen",
    openLinkedInLabel: "LinkedIn oeffnen",
    openXLabel: "X oeffnen",
    openInstagramLabel: "Instagram oeffnen",
    openThreadsLabel: "Threads oeffnen",
    openMailLabel: "E-Mail oeffnen",
    emptyTitle: "Waehle einen Text, um die Distributionsentwuerfe zu sehen.",
    emptyCopy: "Nichts wird automatisch veroefentlicht. Dieses Panel dient nur der Vorbereitung und manuellen Verteilung.",
    noArticlesTitle: "Noch keine veroeffentlichten Texte fuer die Distribution vorhanden.",
    noArticlesCopy: "Sobald ein Text veroeffentlicht ist, erscheint er hier als Kandidat.",
    manualReviewLabel: "Vor jeder oeffentlichen Veroeffentlichung bleibt die manuelle Freigabe Pflicht.",
    noDistributionNote: "Keine Notiz eingetragen. Die Entwuerfe beruhen nur auf den Artikeldaten.",
    platformLabels: {
      linkedin: "LinkedIn-Version",
      x: "X-Version",
      instagramThreads: "Instagram / Threads Version",
      newsletter: "Newsletter-Teaser",
      general: "Allgemeiner Copy",
    },
    platformTones: {
      linkedin: "Redaktionell, ruhig und kontextuell",
      x: "Kurz und direkt",
      instagramThreads: "Visueller, schaerfer, emotionaler",
      newsletter: "Kurzer Einstieg fuer den Newsletter",
      general: "Neutrale Version fuer manuelles Teilen",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Analysen",
      interview: "Interviews",
      column: "Kolumnen",
    },
    authorPrefix: "Von",
    focusPrefix: "Fokus",
    topicsPrefix: "Themen",
    fallbackContextLine: "Der Text bleibt im Avangarda-Register: Menschenrechte, roh, real.",
    analysisContextLine: "Dieser Text sollte als Analyse zirkulieren, nicht als Tagesmeldung.",
    institutionContextLine: "Im Zentrum steht institutionelle Verantwortung, nicht nur die Folge.",
    ecologyContextLine: "Der Zugang fuehrt ueber den Alltag, nicht nur ueber das Politikfeld.",
  },
  es: {
    eyebrow: "Eco",
    title: "Distribucion sin automatismo",
    intro: "Los borradores siguen dentro del proceso editorial: toma el texto, ajusta el tono, copialo y publicalo solo cuando lo apruebes.",
    internalBadge: "Panel interno",
    sourceCms: "Fuente CMS",
    sourceFallback: "Fuente de respaldo",
    articleListLabel: "Textos recientes",
    articleSearchPlaceholder: "Buscar titulo, autor o tema",
    selectedArticleLabel: "Texto seleccionado",
    languageLabel: "Idioma",
    sectionLabel: "Seccion",
    topicsLabel: "Temas",
    authorLabel: "Autor",
    articleLinkLabel: "Enlace del texto",
    distributionNoteLabel: "Nota editorial para distribucion",
    distributionNoteHelper: "Esta nota permanece interna. Solo orienta el tono y el acento del borrador.",
    resetNoteLabel: "Volver a la nota del CMS",
    regenerateLabel: "Actualizar borradores",
    draftsLabel: "Versiones por plataforma",
    copyLabel: "Copiar",
    copiedLabel: "Copiado",
    openStoryLabel: "Abrir texto",
    openLinkedInLabel: "Abrir LinkedIn",
    openXLabel: "Abrir X",
    openInstagramLabel: "Abrir Instagram",
    openThreadsLabel: "Abrir Threads",
    openMailLabel: "Abrir correo",
    emptyTitle: "Elige un texto para abrir los borradores de distribucion.",
    emptyCopy: "Nada se publica automaticamente. El panel solo sirve para preparar y revisar la distribucion manual.",
    noArticlesTitle: "Todavia no hay textos publicados listos para distribucion.",
    noArticlesCopy: "Cuando se publique un texto, aparecera aqui como candidato.",
    manualReviewLabel: "La revision manual sigue siendo obligatoria antes de cualquier publicacion.",
    noDistributionNote: "No hay nota cargada. Los borradores usan solo los datos del articulo.",
    platformLabels: {
      linkedin: "Version LinkedIn",
      x: "Version X",
      instagramThreads: "Version Instagram / Threads",
      newsletter: "Teaser para newsletter",
      general: "Copy general",
    },
    platformTones: {
      linkedin: "Mas editorial y con contexto",
      x: "Breve y directo",
      instagramThreads: "Mas visual, mas crudo, mas emocional",
      newsletter: "Entrada corta para el boletin",
      general: "Version neutra para compartir manualmente",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Analisis",
      interview: "Entrevistas",
      column: "Columnas",
    },
    authorPrefix: "Por",
    focusPrefix: "Enfoque",
    topicsPrefix: "Temas",
    fallbackContextLine: "El texto mantiene el registro de Avangarda: derechos humanos, crudo, real.",
    analysisContextLine: "Este texto debe circular como analisis, no como noticia.",
    institutionContextLine: "El foco queda en la responsabilidad institucional, no solo en la consecuencia.",
    ecologyContextLine: "El angulo pasa por la vida cotidiana, no solo por el sector.",
  },
  el: {
    eyebrow: "Ηχω",
    title: "Διανομή χωρίς αυτοματισμό",
    intro: "Τα προσχέδια μένουν μέσα στη συντακτική ροή: τράβα το κείμενο, δούλεψε τον τόνο, αντέγραψέ το και δημοσίευσέ το μόνο όταν το εγκρίνεις.",
    internalBadge: "Εσωτερικό πάνελ",
    sourceCms: "Πηγή CMS",
    sourceFallback: "Εφεδρική πηγή",
    articleListLabel: "Πρόσφανα κείμενα",
    articleSearchPlaceholder: "Αναζήτησε τίτλο, συντάκτη ή θέμα",
    selectedArticleLabel: "Επιλεγμένο κείμενο",
    languageLabel: "Γλώσσα",
    sectionLabel: "Ενότητα",
    topicsLabel: "Θέματα",
    authorLabel: "Συντάκτης",
    articleLinkLabel: "Σύνδεσμος κειμένου",
    distributionNoteLabel: "Συντακτική σημείωση για διανομή",
    distributionNoteHelper: "Η σημείωση παραμένει εσωτερική. Επηρεάζει μόνο τον τόνο και την έμφαση του προσχεδίου.",
    resetNoteLabel: "Επαναφορά από το CMS",
    regenerateLabel: "Ανανέωση προσχεδίων",
    draftsLabel: "Εκδοχές πλατφόρμας",
    copyLabel: "Αντιγραφή",
    copiedLabel: "Αντιγράφηκε",
    openStoryLabel: "Άνοιγμα κειμένου",
    openLinkedInLabel: "Άνοιγμα LinkedIn",
    openXLabel: "Άνοιγμα X",
    openInstagramLabel: "Άνοιγμα Instagram",
    openThreadsLabel: "Άνοιγμα Threads",
    openMailLabel: "Άνοιγμα email",
    emptyTitle: "Διάλεξε κείμενο για να ανοίξουν τα προσχέδια διανομής.",
    emptyCopy: "Τίποτα δεν δημοσιεύεται αυτόματα. Το πάνελ υπάρχει μόνο για προετοιμασία και χειροκίνητη διανομή.",
    noArticlesTitle: "Δεν υπάρχουν ακόμη δημοσιευμένα κείμενα για διανομή.",
    noArticlesCopy: "Μόλις δημοσιευτεί κείμενο, θα εμφανιστεί εδώ ως υποψήφιο.",
    manualReviewLabel: "Η χειροκίνητη έγκριση παραμένει υποχρεωτική πριν από κάθε δημόσια δημοσίευση.",
    noDistributionNote: "Δεν έχει προστεθεί σημείωση. Τα προσχέδια βασίζονται μόνο στα δεδομένα του άρθρου.",
    platformLabels: {
      linkedin: "Έκδοση LinkedIn",
      x: "Έκδοση X",
      instagramThreads: "Έκδοση Instagram / Threads",
      newsletter: "Teaser newsletter",
      general: "Γενικό copy",
    },
    platformTones: {
      linkedin: "Πιο συντακτικό και με περισσότερο πλαίσιο",
      x: "Σύντομο και άμεσο",
      instagramThreads: "Πιο οπτικό, πιο αιχμηρό, πιο συναισθηματικό",
      newsletter: "Σύντομη εισαγωγή για το newsletter",
      general: "Ουδέτερη εκδοχή για χειροκίνητο μοίρασμα",
    },
    sectionLabels: {
      front: "Front",
      analysis: "Αναλύσεις",
      interview: "Συνεντεύξεις",
      column: "Στήλες",
    },
    authorPrefix: "Από",
    focusPrefix: "Εστίαση",
    topicsPrefix: "Θέματα",
    fallbackContextLine: "Το κείμενο μένει στο μητρώο της Avangarda: ανθρώπινα δικαιώματα, ωμό, πραγματικό.",
    analysisContextLine: "Αυτό το κείμενο πρέπει να κυκλοφορήσει ως ανάλυση, όχι ως είδηση.",
    institutionContextLine: "Το βάρος μένει στην θεσμική ευθύνη, όχι μόνο στο αποτέλεσμα.",
    ecologyContextLine: "Η οπτική περνά από την καθημερινή ζωή, όχι μόνο από τον τομέα πολιτικής.",
  },
  ar: {
    eyebrow: "الصدى",
    title: "توزيع بدون أتمتة",
    intro: "تبقى المسودات داخل المسار التحريري: اسحب النص، عدل النبرة، انسخه، ولا تنشره إلا عندما تقرر ذلك بنفسك.",
    internalBadge: "لوحة داخلية",
    sourceCms: "مصدر CMS",
    sourceFallback: "مصدر احتياطي",
    articleListLabel: "النصوص الأحدث",
    articleSearchPlaceholder: "ابحث عن عنوان أو كاتب أو موضوع",
    selectedArticleLabel: "النص المختار",
    languageLabel: "اللغة",
    sectionLabel: "القسم",
    topicsLabel: "الموضوعات",
    authorLabel: "الكاتب",
    articleLinkLabel: "رابط النص",
    distributionNoteLabel: "ملاحظة تحريرية للتوزيع",
    distributionNoteHelper: "تبقى هذه الملاحظة داخلية. تُستخدم فقط لتوجيه النبرة والتركيز في المقترحات.",
    resetNoteLabel: "استعادة من CMS",
    regenerateLabel: "تحديث المقترحات",
    draftsLabel: "نسخ المنصات",
    copyLabel: "انسخ",
    copiedLabel: "تم النسخ",
    openStoryLabel: "افتح النص",
    openLinkedInLabel: "افتح LinkedIn",
    openXLabel: "افتح X",
    openInstagramLabel: "افتح Instagram",
    openThreadsLabel: "افتح Threads",
    openMailLabel: "افتح البريد",
    emptyTitle: "اختر نصاً لفتح مقترحات التوزيع.",
    emptyCopy: "لا يتم نشر أي شيء تلقائياً. هذه اللوحة مخصصة فقط للتحضير والمراجعة والتوزيع اليدوي.",
    noArticlesTitle: "لا توجد نصوص منشورة جاهزة للتوزيع بعد.",
    noArticlesCopy: "عندما يُنشر نص جديد سيظهر هنا كمرشح للتوزيع.",
    manualReviewLabel: "تظل المراجعة اليدوية إلزامية قبل أي نشر عام.",
    noDistributionNote: "لا توجد ملاحظة مدخلة. المقترحات مبنية فقط على بيانات المقال.",
    platformLabels: {
      linkedin: "نسخة LinkedIn",
      x: "نسخة X",
      instagramThreads: "نسخة Instagram / Threads",
      newsletter: "مقدمة النشرة",
      general: "نسخة عامة",
    },
    platformTones: {
      linkedin: "أكثر تحريراً وأكثر سياقاً",
      x: "أقصر وأكثر مباشرة",
      instagramThreads: "أكثر بصرياً وأكثر حدة وأكثر عاطفة",
      newsletter: "مقدمة قصيرة لفقرة النشرة",
      general: "نسخة محايدة للمشاركة اليدوية",
    },
    sectionLabels: {
      front: "الواجهة",
      analysis: "تحليلات",
      interview: "مقابلات",
      column: "أعمدة",
    },
    authorPrefix: "بقلم",
    focusPrefix: "التركيز",
    topicsPrefix: "الموضوعات",
    fallbackContextLine: "يبقى النص داخل سجل أفانغاردا: حقوق الإنسان، خام، حقيقي.",
    analysisContextLine: "يجب أن يتحرك هذا النص بوصفه تحليلاً لا خبراً عاجلاً.",
    institutionContextLine: "يبقى التركيز على مسؤولية المؤسسات لا على النتيجة فقط.",
    ecologyContextLine: "تُقرأ الزاوية من خلال الحياة اليومية لا من خلال القطاع وحده.",
  },
};

function normalizeText(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function stripMarkup(value?: string) {
  return normalizeText((value || "").replace(/<[^>]+>/g, " "));
}

function clip(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const sliced = value.slice(0, maxLength - 1);
  const trimmed = sliced.replace(/\s+\S*$/, "").trim();
  return `${trimmed || sliced.trim()}…`;
}

function normalizeMatch(value?: string) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueLines(lines: Array<string | undefined>) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const rawLine of lines) {
    const line = normalizeText(rawLine);
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(line);
  }

  return output;
}

function joinBlocks(blocks: Array<string | undefined>) {
  return blocks.filter(Boolean).join("\n\n").trim();
}

function getSectionLabel(section: string | undefined, copy: DistributionPanelCopy) {
  switch ((section || "").trim().toLowerCase()) {
    case "analysis":
      return copy.sectionLabels.analysis;
    case "interview":
      return copy.sectionLabels.interview;
    case "column":
      return copy.sectionLabels.column;
    default:
      return copy.sectionLabels.front;
  }
}

function getSummary(article: DistributionArticle) {
  const subtitle = normalizeText(article.subtitle);
  if (subtitle) return clip(subtitle, 220);

  const content = stripMarkup(article.content);
  if (!content) return "";

  const firstSentence = content.split(/(?<=[.!?])\s+/)[0] || content;
  return clip(firstSentence, 220);
}

function getTopicsLine(article: DistributionArticle, copy: DistributionPanelCopy) {
  if (!article.topics.length) return "";
  return `${copy.topicsPrefix}: ${article.topics.slice(0, 3).join(", ")}`;
}

function getMetaLine(article: DistributionArticle, copy: DistributionPanelCopy) {
  const parts = [
    article.authors.length ? `${copy.authorPrefix}: ${article.authors.join(", ")}` : "",
    getSectionLabel(article.section, copy),
    article.focus ? `${copy.focusPrefix}: ${article.focus}` : "",
  ].filter(Boolean);

  return parts.join(" · ");
}

function getContextLine(article: DistributionArticle, copy: DistributionPanelCopy, noteOverride?: string) {
  const note = normalizeMatch(noteOverride || article.distributionNote);

  if (note.includes("instituc")) return copy.institutionContextLine;
  if (note.includes("analiz") || (note.includes("vest") && note.includes("ne"))) return copy.analysisContextLine;
  if (note.includes("ekolog") && (note.includes("svakodnev") || note.includes("zivot") || note.includes("life"))) {
    return copy.ecologyContextLine;
  }

  return normalizeText(article.signalText) || copy.fallbackContextLine;
}

function buildXText(articleUrl: string, title: string, contextLine: string, summary: string) {
  return clip(
    joinBlocks([
      title,
      clip(contextLine || summary, 170),
      articleUrl,
    ]),
    275
  );
}

export function getDistributionPanelCopy(lang: Lang) {
  return distributionCopy[lang] || distributionCopy.en;
}

export function buildDistributionDrafts(
  article: DistributionArticle,
  lang: Lang,
  noteOverride?: string
): DistributionDraft[] {
  const copy = getDistributionPanelCopy(lang);
  const articleUrl = buildLocalizedUrl(`/a/${article.slug}`, lang);
  const title = normalizeText(article.title);
  const summary = getSummary(article);
  const contextLine = getContextLine(article, copy, noteOverride);
  const metaLine = getMetaLine(article, copy);
  const topicsLine = getTopicsLine(article, copy);

  return [
    {
      key: "linkedin",
      title: copy.platformLabels.linkedin,
      tone: copy.platformTones.linkedin,
      text: joinBlocks([
        title,
        summary,
        contextLine,
        uniqueLines([metaLine, topicsLine]).join("\n"),
        articleUrl,
      ]),
    },
    {
      key: "x",
      title: copy.platformLabels.x,
      tone: copy.platformTones.x,
      text: buildXText(articleUrl, title, contextLine, summary),
    },
    {
      key: "instagramThreads",
      title: copy.platformLabels.instagramThreads,
      tone: copy.platformTones.instagramThreads,
      text: joinBlocks([
        title,
        clip(contextLine || summary, 190),
        topicsLine,
        articleUrl,
      ]),
    },
    {
      key: "newsletter",
      title: copy.platformLabels.newsletter,
      tone: copy.platformTones.newsletter,
      text: joinBlocks([
        title,
        summary,
        metaLine,
        articleUrl,
      ]),
    },
    {
      key: "general",
      title: copy.platformLabels.general,
      tone: copy.platformTones.general,
      text: joinBlocks([
        title,
        summary,
        contextLine,
        articleUrl,
      ]),
    },
  ];
}

export function buildDistributionOpenLinks(input: {
  draftKey: DistributionDraftKey;
  lang: Lang;
  articleUrl: string;
  articleTitle: string;
  text: string;
}): DistributionOpenLink[] {
  const copy = getDistributionPanelCopy(input.lang);

  if (input.draftKey === "linkedin") {
    return [
      {
        label: copy.openLinkedInLabel,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(input.articleUrl)}`,
      },
    ];
  }

  if (input.draftKey === "x") {
    return [
      {
        label: copy.openXLabel,
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(input.text)}`,
      },
    ];
  }

  if (input.draftKey === "instagramThreads") {
    return [
      {
        label: copy.openInstagramLabel,
        href: "https://www.instagram.com/",
      },
      {
        label: copy.openThreadsLabel,
        href: "https://www.threads.net/",
      },
    ];
  }

  if (input.draftKey === "newsletter") {
    return [
      {
        label: copy.openMailLabel,
        href: `mailto:?subject=${encodeURIComponent(input.articleTitle)}&body=${encodeURIComponent(input.text)}`,
      },
    ];
  }

  return [
    {
      label: copy.openStoryLabel,
      href: input.articleUrl,
    },
  ];
}
