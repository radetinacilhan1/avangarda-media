import { localizeArticle } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import {
  fetchShowcaseSections,
  getShowcaseSections,
  normalizeShowcaseSectionSlug,
  type ShowcaseSection,
} from "@/lib/showcase-sections";
import { getStrapiMediaUrl, strapiGet, unwrapStrapiCollection, unwrapStrapiSingle } from "@/lib/strapi";

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar",
};

export type AboutNavigationLink = {
  key: string;
  label: string;
  href: string;
};

export type AboutNavigationGroup = {
  label: string;
  href: string;
  children: AboutNavigationLink[];
};

export type PortfolioTag = {
  label: string;
};

export type PortfolioEntry = {
  title: string;
  subtitle?: string;
  organisation?: string;
  location?: string;
  period?: string;
  description?: string;
  url?: string;
};

export type PortfolioCustomSection = {
  title: string;
  body?: string;
};

export type TeamSocialLink = {
  platform: string;
  url: string;
};

export type TeamRelatedArticle = {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
};

export type TeamMember = {
  id: number;
  fullName: string;
  slug: string;
  role: string;
  shortBio: string;
  longBio?: string;
  portraitUrl?: string;
  email?: string;
  website?: string;
  socialLinks: TeamSocialLink[];
  location?: string;
  languages: PortfolioTag[];
  skills: PortfolioTag[];
  education: PortfolioEntry[];
  experience: PortfolioEntry[];
  projects: PortfolioEntry[];
  publications: PortfolioEntry[];
  certifications: PortfolioEntry[];
  trainings: PortfolioEntry[];
  awards: PortfolioEntry[];
  customSections: PortfolioCustomSection[];
  relatedArticles: TeamRelatedArticle[];
  cvUrl?: string;
  portfolioEnabled: boolean;
  order: number;
  isActive: boolean;
};

export type AboutPageData = {
  label: string;
  title: string;
  intro: string;
  whoWeAreTitle: string;
  whoWeAreText: string;
  editorialPrincipleTitle: string;
  editorialPrincipleText: string;
  peopleSectionTitle: string;
  peopleSectionIntro: string;
  portfolioCtaLabel: string;
  impressumLinkLabel: string;
  directions: ShowcaseSection[];
  people: TeamMember[];
};

export type PeopleChrome = {
  previous: string;
  next: string;
  portfolio: string;
  relatedArticles: string;
  email: string;
  website: string;
  location: string;
  languages: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  publications: string;
  certifications: string;
  trainings: string;
  awards: string;
  downloadCv: string;
  backToAbout: string;
};

type AboutPageRecord = Record<string, unknown> & {
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  intro?: string;
  intro_en?: string;
  intro_tr?: string;
  intro_fr?: string;
  intro_de?: string;
  intro_es?: string;
  intro_el?: string;
  intro_ar?: string;
  whoWeAreTitle?: string;
  whoWeAreTitle_en?: string;
  whoWeAreTitle_tr?: string;
  whoWeAreTitle_fr?: string;
  whoWeAreTitle_de?: string;
  whoWeAreTitle_es?: string;
  whoWeAreTitle_el?: string;
  whoWeAreTitle_ar?: string;
  whoWeAreText?: string;
  whoWeAreText_en?: string;
  whoWeAreText_tr?: string;
  whoWeAreText_fr?: string;
  whoWeAreText_de?: string;
  whoWeAreText_es?: string;
  whoWeAreText_el?: string;
  whoWeAreText_ar?: string;
  editorialPrincipleTitle?: string;
  editorialPrincipleTitle_en?: string;
  editorialPrincipleTitle_tr?: string;
  editorialPrincipleTitle_fr?: string;
  editorialPrincipleTitle_de?: string;
  editorialPrincipleTitle_es?: string;
  editorialPrincipleTitle_el?: string;
  editorialPrincipleTitle_ar?: string;
  editorialPrincipleText?: string;
  editorialPrincipleText_en?: string;
  editorialPrincipleText_tr?: string;
  editorialPrincipleText_fr?: string;
  editorialPrincipleText_de?: string;
  editorialPrincipleText_es?: string;
  editorialPrincipleText_el?: string;
  editorialPrincipleText_ar?: string;
  peopleSectionTitle?: string;
  peopleSectionTitle_en?: string;
  peopleSectionTitle_tr?: string;
  peopleSectionTitle_fr?: string;
  peopleSectionTitle_de?: string;
  peopleSectionTitle_es?: string;
  peopleSectionTitle_el?: string;
  peopleSectionTitle_ar?: string;
  peopleSectionIntro?: string;
  peopleSectionIntro_en?: string;
  peopleSectionIntro_tr?: string;
  peopleSectionIntro_fr?: string;
  peopleSectionIntro_de?: string;
  peopleSectionIntro_es?: string;
  peopleSectionIntro_el?: string;
  peopleSectionIntro_ar?: string;
  portfolioCtaLabel?: string;
  portfolioCtaLabel_en?: string;
  portfolioCtaLabel_tr?: string;
  portfolioCtaLabel_fr?: string;
  portfolioCtaLabel_de?: string;
  portfolioCtaLabel_es?: string;
  portfolioCtaLabel_el?: string;
  portfolioCtaLabel_ar?: string;
  impressumLinkLabel?: string;
  impressumLinkLabel_en?: string;
  impressumLinkLabel_tr?: string;
  impressumLinkLabel_fr?: string;
  impressumLinkLabel_de?: string;
  impressumLinkLabel_es?: string;
  impressumLinkLabel_el?: string;
  impressumLinkLabel_ar?: string;
  directions?: unknown;
};

type LocalizedEntryRecord = Record<string, unknown> & {
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  organisation?: string;
  organisation_en?: string;
  organisation_tr?: string;
  organisation_fr?: string;
  organisation_de?: string;
  location?: string;
  location_en?: string;
  location_tr?: string;
  location_fr?: string;
  location_de?: string;
  period?: string;
  period_en?: string;
  period_tr?: string;
  period_fr?: string;
  period_de?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  url?: string;
};

type LocalizedTagRecord = Record<string, unknown> & {
  label?: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
};

type LocalizedSectionRecord = Record<string, unknown> & {
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  body?: string;
  body_en?: string;
  body_tr?: string;
  body_fr?: string;
  body_de?: string;
};

type TeamMemberRecord = Record<string, unknown> & {
  id?: number;
  fullName?: string;
  slug?: string;
  role?: string;
  role_en?: string;
  role_tr?: string;
  role_fr?: string;
  role_de?: string;
  shortBio?: string;
  shortBio_en?: string;
  shortBio_tr?: string;
  shortBio_fr?: string;
  shortBio_de?: string;
  longBio?: string;
  longBio_en?: string;
  longBio_tr?: string;
  longBio_fr?: string;
  longBio_de?: string;
  portrait?: unknown;
  email?: string;
  website?: string;
  socialLinks?: unknown;
  location?: string;
  location_en?: string;
  location_tr?: string;
  location_fr?: string;
  location_de?: string;
  languages?: unknown;
  skills?: unknown;
  education?: unknown;
  experience?: unknown;
  projects?: unknown;
  publications?: unknown;
  certifications?: unknown;
  trainings?: unknown;
  awards?: unknown;
  customSections?: unknown;
  relatedArticles?: unknown;
  cvFile?: unknown;
  portfolioEnabled?: boolean;
  order?: number;
  isActive?: boolean;
};

type AboutDirectionRecord = Record<string, unknown> & {
  slug?: string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  ordinal?: number;
  displayOrder?: number;
  isActive?: boolean;
};

const aboutPageFallbackByLang: Record<
  Lang,
  Omit<AboutPageData, "directions" | "people">
> = {
  sr: {
    label: "O nama",
    title: "Avangarda je urednička platforma za priče, kontekst i javni interes.",
    intro:
      "Avangarda nije klasičan portal za brz promet sadržaja, već medijska platforma koja spaja ljudska prava, društvo, ekologiju, sećanje, rad, manjine i politički život Balkana i šireg prostora.",
    whoWeAreTitle: "Ko smo mi",
    whoWeAreText:
      "Avangarda je prostor za tekstove, intervjue, analize, teren i dokumentarne forme koje traže vreme, odgovornost i jasan urednički stav. Umesto hiperprodukcije, platforma bira ritam koji ostavlja mesto za kontekst, argument i posledicu.",
    editorialPrincipleTitle: "Urednički princip",
    editorialPrincipleText: "",
    peopleSectionTitle: "Ljudi iza Avangarde",
    peopleSectionIntro: "",
    portfolioCtaLabel: "Pogledaj portfolio",
    impressumLinkLabel: "Impresum",
  },
  en: {
    label: "About",
    title: "Avangarda is an editorial platform for stories, context and public interest.",
    intro:
      "Avangarda is not a classic portal built for fast content turnover, but a media platform connecting human rights, society, environment, memory, labour, minorities and political life in the Balkans and beyond.",
    whoWeAreTitle: "Who we are",
    whoWeAreText:
      "Avangarda is a space for stories, interviews, analysis, field reporting and documentary forms that need time, responsibility and a clear editorial position. Instead of hyper-production, the platform chooses a rhythm that leaves room for context, argument and consequence.",
    editorialPrincipleTitle: "Editorial principle",
    editorialPrincipleText: "",
    peopleSectionTitle: "People behind Avangarda",
    peopleSectionIntro: "",
    portfolioCtaLabel: "View portfolio",
    impressumLinkLabel: "Imprint",
  },
  tr: {
    label: "Hakkımızda",
    title: "Avangarda, hikaye, bağlam ve kamusal yarar için kurulan editoryal bir platformdur.",
    intro:
      "Avangarda, hızlı içerik sirkülasyonu için kurulmuş klasik bir portal değil; insan hakları, toplum, ekoloji, hafıza, emek, azınlıklar ve Balkanlar ile ötesindeki politik hayatı bir araya getiren bir medya platformudur.",
    whoWeAreTitle: "Biz kimiz",
    whoWeAreText:
      "Avangarda; zaman, sorumluluk ve net bir editoryal çizgi isteyen metinler, röportajlar, analizler, saha çalışmaları ve belgesel formlar için bir alandır. Platform, aşırı üretim yerine bağlam, argüman ve sonuç için yer açan bir ritim seçer.",
    editorialPrincipleTitle: "Editoryal ilke",
    editorialPrincipleText: "",
    peopleSectionTitle: "Avangarda'nın arkasındaki insanlar",
    peopleSectionIntro: "",
    portfolioCtaLabel: "Portfolyoyu gör",
    impressumLinkLabel: "Künye",
  },
  fr: {
    label: "À propos",
    title: "Avangarda est une plateforme éditoriale pour les récits, le contexte et l'intérêt public.",
    intro:
      "Avangarda n'est pas un portail classique pensé pour la rotation rapide du contenu, mais une plateforme médiatique qui relie les droits humains, la société, l'écologie, la mémoire, le travail, les minorités et la vie politique des Balkans et d'ailleurs.",
    whoWeAreTitle: "Qui sommes-nous",
    whoWeAreText:
      "Avangarda est un espace pour des récits, des entretiens, des analyses, du terrain et des formes documentaires qui demandent du temps, de la responsabilité et une ligne éditoriale claire. Au lieu de l'hyperproduction, la plateforme choisit un rythme qui laisse place au contexte, à l'argument et à la conséquence.",
    editorialPrincipleTitle: "Principe éditorial",
    editorialPrincipleText: "",
    peopleSectionTitle: "Les personnes derrière Avangarda",
    peopleSectionIntro: "",
    portfolioCtaLabel: "Voir le portfolio",
    impressumLinkLabel: "Mentions légales",
  },
  de: {
    label: "Über uns",
    title: "Avangarda ist eine redaktionelle Plattform für Geschichten, Kontext und öffentliches Interesse.",
    intro:
      "Avangarda ist kein klassisches Portal für schnellen Content-Umschlag, sondern eine Medienplattform, die Menschenrechte, Gesellschaft, Umwelt, Erinnerung, Arbeit, Minderheiten und politisches Leben auf dem Balkan und darüber hinaus verbindet.",
    whoWeAreTitle: "Wer wir sind",
    whoWeAreText:
      "Avangarda ist ein Raum für Geschichten, Interviews, Analysen, Terrain und dokumentarische Formen, die Zeit, Verantwortung und eine klare redaktionelle Linie brauchen. Statt Hyperproduktion wählt die Plattform einen Rhythmus, der Kontext, Argument und Konsequenz Raum gibt.",
    editorialPrincipleTitle: "Redaktionelles Prinzip",
    editorialPrincipleText: "",
    peopleSectionTitle: "Die Menschen hinter Avangarda",
    peopleSectionIntro: "",
    portfolioCtaLabel: "Portfolio ansehen",
    impressumLinkLabel: "Impressum",
  },
  es: {
    label: "Sobre nosotros",
    title: "Avangarda es una plataforma editorial para historias, contexto e interés público.",
    intro:
      "Avangarda no es un portal clásico pensado para el consumo rápido de contenido, sino una plataforma mediática que conecta derechos humanos, sociedad, medio ambiente, memoria, trabajo, minorías y vida política en los Balcanes y más allá.",
    whoWeAreTitle: "Quiénes somos",
    whoWeAreText:
      "Avangarda es un espacio para historias, entrevistas, análisis, trabajo de campo y formas documentales que necesitan tiempo, responsabilidad y una posición editorial clara. En vez de hiperproducción, la plataforma elige un ritmo que deja espacio para contexto, argumento y consecuencia.",
    editorialPrincipleTitle: "Principio editorial",
    editorialPrincipleText: "",
    peopleSectionTitle: "La gente detrás de Avangarda",
    peopleSectionIntro: "",
    portfolioCtaLabel: "Ver portafolio",
    impressumLinkLabel: "Aviso legal",
  },
  el: {
    label: "Σχετικά",
    title: "Η Avangarda είναι μια εκδοτική πλατφόρμα για ιστορίες, πλαίσιο και δημόσιο ενδιαφέρον.",
    intro:
      "Η Avangarda δεν είναι ένα κλασικό portal γρήγορης κατανάλωσης περιεχομένου, αλλά μια πλατφόρμα μέσων που συνδέει ανθρώπινα δικαιώματα, κοινωνία, περιβάλλον, μνήμη, εργασία, μειονότητες και πολιτική ζωή στα Βαλκάνια και πέρα από αυτά.",
    whoWeAreTitle: "Ποιοι είμαστε",
    whoWeAreText:
      "Η Avangarda είναι χώρος για ιστορίες, συνεντεύξεις, αναλύσεις, επιτόπιο ρεπορτάζ και ντοκιμαντερίστικες μορφές που χρειάζονται χρόνο, ευθύνη και καθαρή εκδοτική θέση. Αντί για υπερπαραγωγή, η πλατφόρμα επιλέγει έναν ρυθμό που αφήνει χώρο για πλαίσιο, επιχείρημα και συνέπεια.",
    editorialPrincipleTitle: "Εκδοτική αρχή",
    editorialPrincipleText: "",
    peopleSectionTitle: "Οι άνθρωποι πίσω από την Avangarda",
    peopleSectionIntro: "",
    portfolioCtaLabel: "Δες το portfolio",
    impressumLinkLabel: "Στοιχεία έκδοσης",
  },
  ar: {
    label: "من نحن",
    title: "أفانغاردا منصة تحريرية للقصص والسياق والمصلحة العامة.",
    intro:
      "ليست أفانغاردا بوابة كلاسيكية مبنية على تدوير المحتوى بسرعة، بل منصة إعلامية تربط بين حقوق الإنسان والمجتمع والبيئة والذاكرة والعمل والأقليات والحياة السياسية في البلقان وما بعدها.",
    whoWeAreTitle: "من نحن",
    whoWeAreText:
      "أفانغاردا مساحة للقصص والمقابلات والتحليلات والعمل الميداني والأشكال الوثائقية التي تحتاج إلى وقت ومسؤولية وموقف تحريري واضح. وبدلاً من فرط الإنتاج تختار المنصة إيقاعاً يترك مساحة للسياق والحجة والنتيجة.",
    editorialPrincipleTitle: "المبدأ التحريري",
    editorialPrincipleText: "",
    peopleSectionTitle: "الأشخاص وراء أفانغاردا",
    peopleSectionIntro: "",
    portfolioCtaLabel: "شاهد المعرض المهني",
    impressumLinkLabel: "بيانات النشر",
  },
};

const aboutNavigationByLang: Record<
  Lang,
  { label: string; who: string; principle: string; people: string; impressum: string; contact: string }
> = {
  sr: {
    label: "O nama",
    who: "Ko smo mi",
    principle: "Urednički princip",
    people: "Ljudi iza Avangarde",
    impressum: "Impresum",
    contact: "Kontakt",
  },
  en: {
    label: "About",
    who: "Who we are",
    principle: "Editorial principle",
    people: "People behind Avangarda",
    impressum: "Imprint",
    contact: "Contact",
  },
  tr: {
    label: "Hakkımızda",
    who: "Biz kimiz",
    principle: "Editoryal ilke",
    people: "Avangarda'nın arkasındaki insanlar",
    impressum: "Künye",
    contact: "İletişim",
  },
  fr: {
    label: "À propos",
    who: "Qui sommes-nous",
    principle: "Principe éditorial",
    people: "Les personnes derrière Avangarda",
    impressum: "Mentions légales",
    contact: "Contact",
  },
  de: {
    label: "Über uns",
    who: "Wer wir sind",
    principle: "Redaktionelles Prinzip",
    people: "Die Menschen hinter Avangarda",
    impressum: "Impressum",
    contact: "Kontakt",
  },
  es: {
    label: "Sobre nosotros",
    who: "Quiénes somos",
    principle: "Principio editorial",
    people: "La gente detrás de Avangarda",
    impressum: "Aviso legal",
    contact: "Contacto",
  },
  el: {
    label: "Σχετικά",
    who: "Ποιοι είμαστε",
    principle: "Εκδοτική αρχή",
    people: "Οι άνθρωποι πίσω από την Avangarda",
    impressum: "Στοιχεία έκδοσης",
    contact: "Επικοινωνία",
  },
  ar: {
    label: "من نحن",
    who: "من نحن",
    principle: "المبدأ التحريري",
    people: "الأشخاص وراء أفانغاردا",
    impressum: "بيانات النشر",
    contact: "اتصل بنا",
  },
};

const peopleChromeByLang: Record<Lang, PeopleChrome> = {
  sr: {
    previous: "Prethodno",
    next: "Sledeće",
    portfolio: "Pogledaj portfolio",
    relatedArticles: "Povezani tekstovi",
    email: "Email",
    website: "Website",
    location: "Lokacija",
    languages: "Jezici",
    skills: "Veštine",
    education: "Obrazovanje",
    experience: "Iskustvo",
    projects: "Projekti",
    publications: "Publikacije i tekstovi",
    certifications: "Sertifikati",
    trainings: "Obuke",
    awards: "Priznanja",
    downloadCv: "Preuzmi CV",
    backToAbout: "Nazad na O nama",
  },
  en: {
    previous: "Previous",
    next: "Next",
    portfolio: "View portfolio",
    relatedArticles: "Related stories",
    email: "Email",
    website: "Website",
    location: "Location",
    languages: "Languages",
    skills: "Skills",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    publications: "Publications and stories",
    certifications: "Certifications",
    trainings: "Trainings",
    awards: "Awards",
    downloadCv: "Download CV",
    backToAbout: "Back to About",
  },
  tr: {
    previous: "Onceki",
    next: "Sonraki",
    portfolio: "Portfolyoyu gör",
    relatedArticles: "İlgili yazılar",
    email: "E-posta",
    website: "Website",
    location: "Konum",
    languages: "Diller",
    skills: "Yetenekler",
    education: "Eğitim",
    experience: "Deneyim",
    projects: "Projeler",
    publications: "Yayınlar ve yazılar",
    certifications: "Sertifikalar",
    trainings: "Eğitimler",
    awards: "Ödüller",
    downloadCv: "CV indir",
    backToAbout: "Hakkımızda'ya dön",
  },
  fr: {
    previous: "Précédent",
    next: "Suivant",
    portfolio: "Voir le portfolio",
    relatedArticles: "Articles liés",
    email: "Email",
    website: "Site web",
    location: "Lieu",
    languages: "Langues",
    skills: "Compétences",
    education: "Formation",
    experience: "Expérience",
    projects: "Projets",
    publications: "Publications et textes",
    certifications: "Certifications",
    trainings: "Formations",
    awards: "Distinctions",
    downloadCv: "Télécharger le CV",
    backToAbout: "Retour à À propos",
  },
  de: {
    previous: "Zurück",
    next: "Weiter",
    portfolio: "Portfolio ansehen",
    relatedArticles: "Verwandte Texte",
    email: "E-Mail",
    website: "Website",
    location: "Ort",
    languages: "Sprachen",
    skills: "Kompetenzen",
    education: "Ausbildung",
    experience: "Erfahrung",
    projects: "Projekte",
    publications: "Publikationen und Texte",
    certifications: "Zertifikate",
    trainings: "Trainings",
    awards: "Auszeichnungen",
    downloadCv: "CV herunterladen",
    backToAbout: "Zurück zu Über uns",
  },
  es: {
    previous: "Anterior",
    next: "Siguiente",
    portfolio: "Ver portafolio",
    relatedArticles: "Textos relacionados",
    email: "Correo",
    website: "Sitio web",
    location: "Ubicación",
    languages: "Idiomas",
    skills: "Habilidades",
    education: "Educación",
    experience: "Experiencia",
    projects: "Proyectos",
    publications: "Publicaciones y textos",
    certifications: "Certificaciones",
    trainings: "Formaciones",
    awards: "Reconocimientos",
    downloadCv: "Descargar CV",
    backToAbout: "Volver a Sobre nosotros",
  },
  el: {
    previous: "Προηγούμενο",
    next: "Επόμενο",
    portfolio: "Δες το portfolio",
    relatedArticles: "Σχετικά κείμενα",
    email: "Email",
    website: "Ιστότοπος",
    location: "Τοποθεσία",
    languages: "Γλώσσες",
    skills: "Δεξιότητες",
    education: "Εκπαίδευση",
    experience: "Εμπειρία",
    projects: "Έργα",
    publications: "Δημοσιεύσεις και κείμενα",
    certifications: "Πιστοποιήσεις",
    trainings: "Εκπαιδεύσεις",
    awards: "Διακρίσεις",
    downloadCv: "Λήψη CV",
    backToAbout: "Πίσω στο Σχετικά",
  },
  ar: {
    previous: "السابق",
    next: "التالي",
    portfolio: "شاهد المعرض المهني",
    relatedArticles: "نصوص مرتبطة",
    email: "البريد الإلكتروني",
    website: "الموقع",
    location: "الموقع",
    languages: "اللغات",
    skills: "المهارات",
    education: "التعليم",
    experience: "الخبرة",
    projects: "المشاريع",
    publications: "المنشورات والنصوص",
    certifications: "الشهادات",
    trainings: "التدريبات",
    awards: "الجوائز",
    downloadCv: "تنزيل السيرة الذاتية",
    backToAbout: "العودة إلى من نحن",
  },
};

const fallbackTeamMembers: TeamMemberRecord[] = [
  {
    id: 1,
    fullName: "Ilhan Radetinac",
    slug: "ilhan-radetinac",
    role: "Founder / Editor, Avangarda",
    role_es: "Fundador / Editor, Avangarda",
    role_el: "Ιδρυτής / Editor, Avangarda",
    role_ar: "المؤسس / المحرر، أفانغاردا",
    role_tr: "Kurucu / Editor, Avangarda",
    role_fr: "Fondateur / Editeur, Avangarda",
    role_de: "Gründer / Editor, Avangarda",
    shortBio:
      "Ilhan Radetinac vodi razvoj Avangarde kao uredničke, dokumentarne i društveno-političke platforme usmerene na ljudska prava, javni interes i dugu formu.",
    shortBio_en:
      "Ilhan Radetinac leads the development of Avangarda as an editorial, documentary and socio-political platform focused on human rights, public interest and long-form work.",
    shortBio_es:
      "Ilhan Radetinac dirige el desarrollo de Avangarda como una plataforma editorial, documental y sociopolítica centrada en derechos humanos, interés público y formatos largos.",
    shortBio_el:
      "Ο Ilhan Radetinac καθοδηγεί την ανάπτυξη της Avangarda ως εκδοτικής, ντοκιμαντερίστικης και κοινωνικοπολιτικής πλατφόρμας με έμφαση στα ανθρώπινα δικαιώματα, το δημόσιο συμφέρον και τις μεγάλες φόρμες.",
    shortBio_ar:
      "يقود إلهان راديتيناتس تطوير أفانغاردا كمنصة تحريرية ووثائقية واجتماعية سياسية تركّز على حقوق الإنسان والمصلحة العامة والصيغ الطويلة.",
    shortBio_tr:
      "Ilhan Radetinac, Avangarda'nın insan hakları, kamusal yarar ve uzun form etrafında kurulan editoryal, belgesel ve toplumsal-politik platform olarak gelişimini yürütür.",
    shortBio_fr:
      "Ilhan Radetinac dirige le développement d'Avangarda en tant que plateforme éditoriale, documentaire et socio-politique consacrée aux droits humains, à l'intérêt public et au long format.",
    shortBio_de:
      "Ilhan Radetinac leitet die Entwicklung von Avangarda als redaktionelle, dokumentarische und gesellschaftspolitische Plattform mit Fokus auf Menschenrechte, öffentliches Interesse und lange Formate.",
    longBio:
      "Kao osnivač i urednik, radi na oblikovanju uredničke linije, formata i saradnji oko priča koje traže više konteksta, više terena i veću odgovornost prema javnosti.",
    longBio_en:
      "As founder and editor, he works on shaping the editorial line, formats and collaborations around stories that need more context, more field work and greater accountability to the public.",
    longBio_es:
      "Como fundador y editor, trabaja en dar forma a la línea editorial, los formatos y las colaboraciones alrededor de historias que necesitan más contexto, más trabajo de campo y mayor responsabilidad ante el público.",
    longBio_el:
      "Ως ιδρυτής και editor εργάζεται πάνω στη διαμόρφωση της εκδοτικής γραμμής, των format και των συνεργασιών γύρω από ιστορίες που χρειάζονται περισσότερο πλαίσιο, περισσότερο πεδίο και μεγαλύτερη λογοδοσία προς το κοινό.",
    longBio_ar:
      "بوصفه المؤسس والمحرر، يعمل على تشكيل الخط التحريري والصيغ والتعاونات حول القصص التي تحتاج إلى مزيد من السياق والعمل الميداني ومسؤولية أكبر تجاه الجمهور.",
    longBio_tr:
      "Kurucu ve editor olarak; daha fazla bağlam, daha fazla saha çalışması ve kamuya daha yüksek sorumluluk gerektiren hikayeler etrafında editoryal çizgiyi, formatları ve iş birliklerini şekillendirir.",
    longBio_fr:
      "En tant que fondateur et éditeur, il travaille à la ligne éditoriale, aux formats et aux collaborations autour de récits qui demandent davantage de contexte, de terrain et de responsabilité envers le public.",
    longBio_de:
      "Als Gründer und Editor arbeitet er an redaktioneller Linie, Formaten und Kooperationen rund um Geschichten, die mehr Kontext, mehr Terrain und größere Verantwortung gegenüber der Öffentlichkeit brauchen.",
    location: "Beograd, Srbija",
    location_en: "Belgrade, Serbia",
    location_es: "Belgrado, Serbia",
    location_el: "Βελιγράδι, Σερβία",
    location_ar: "بلغراد، صربيا",
    location_tr: "Belgrad, Sırbistan",
    location_fr: "Belgrade, Serbie",
    location_de: "Belgrad, Serbien",
    email: "info@avangarda.media",
    portfolioEnabled: true,
    order: 1,
    isActive: true,
    languages: [
      { label: "Srpski", label_en: "Serbian", label_es: "Serbio", label_el: "Σερβικά", label_ar: "الصربية", label_tr: "Sırpça", label_fr: "Serbe", label_de: "Serbisch" },
      { label: "English", label_es: "Inglés", label_el: "Αγγλικά", label_ar: "الإنجليزية", label_tr: "İngilizce", label_fr: "Anglais", label_de: "Englisch" },
    ],
    skills: [
      {
        label: "Urednička strategija",
        label_en: "Editorial strategy",
        label_es: "Estrategia editorial",
        label_el: "Εκδοτική στρατηγική",
        label_ar: "الاستراتيجية التحريرية",
        label_tr: "Editoryal strateji",
        label_fr: "Strategie éditoriale",
        label_de: "Redaktionelle Strategie",
      },
      {
        label: "Istraživanje i long-form",
        label_en: "Research and long-form",
        label_es: "Investigación y formato largo",
        label_el: "Έρευνα και long-form",
        label_ar: "البحث والصيغة الطويلة",
        label_tr: "Araştırma ve long-form",
        label_fr: "Recherche et long format",
        label_de: "Recherche und Longform",
      },
    ],
    experience: [
      {
        title: "Avangarda",
        title_en: "Avangarda",
        title_tr: "Avangarda",
        title_fr: "Avangarda",
        title_de: "Avangarda",
        subtitle: "Founder / Editor",
        subtitle_tr: "Kurucu / Editor",
        subtitle_fr: "Fondateur / Editeur",
        subtitle_de: "Gründer / Editor",
        period: "2026 - ",
        description:
          "Razvoj uredničke linije, narativnih formata i dugoročnog identiteta platforme.",
        description_en:
          "Development of the editorial line, narrative formats and long-term identity of the platform.",
        description_tr:
          "Platformun editoryal çizgisinin, anlatı formatlarının ve uzun vadeli kimliğinin geliştirilmesi.",
        description_fr:
          "Développement de la ligne éditoriale, des formats narratifs et de l'identité de long terme de la plateforme.",
        description_de:
          "Entwicklung der redaktionellen Linie, narrativer Formate und der langfristigen Identität der Plattform.",
      },
    ],
    projects: [
      {
        title: "Avangarda",
        title_en: "Avangarda",
        title_tr: "Avangarda",
        title_fr: "Avangarda",
        title_de: "Avangarda",
        subtitle:
          "Editorial and platform development",
        subtitle_tr: "Editoryal ve platform geliştirme",
        subtitle_fr: "Développement éditorial et plateforme",
        subtitle_de: "Redaktionelle und Plattform-Entwicklung",
        description:
          "Urednički i produkcioni okvir za medijsku platformu koja povezuje priče, kontekst i javni interes.",
        description_en:
          "Editorial and production framework for a media platform connecting stories, context and public interest.",
        description_tr:
          "Hikayeleri, bağlamı ve kamusal yararı bir araya getiren bir medya platformu için editoryal ve prodüksiyon çerçevesi.",
        description_fr:
          "Cadre éditorial et de production pour une plateforme médiatique qui relie les récits, le contexte et l'intérêt public.",
        description_de:
          "Redaktioneller und produktioneller Rahmen für eine Medienplattform, die Geschichten, Kontext und öffentliches Interesse verbindet.",
      },
    ],
  },
];

function normalizeForLang(value: string, lang: Lang) {
  return lang === "sr" ? normalizeSerbianLatin(value) : value;
}

function trimString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pickLocalizedValue(record: Record<string, unknown>, field: string, lang: Lang) {
  const baseValue = record[field];
  if (lang === "sr") {
    return typeof baseValue === "string" ? normalizeSerbianLatin(baseValue).trim() : "";
  }

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  if (typeof translatedValue === "string" && translatedValue.trim()) {
    return translatedValue.trim();
  }

  return typeof baseValue === "string" ? baseValue.trim() : "";
}

function pickLocalizedTranslation(record: Record<string, unknown>, field: string, lang: Lang) {
  if (lang === "sr") {
    return pickLocalizedValue(record, field, lang);
  }

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  return typeof translatedValue === "string" && translatedValue.trim() ? translatedValue.trim() : "";
}

function withLangHash(path: string, hash: string, lang: Lang) {
  return `${withLang(path, lang)}#${hash}`;
}

function normalizeTagList(value: unknown, lang: Lang): PortfolioTag[] {
  return unwrapStrapiCollection<LocalizedTagRecord>(value).flatMap((item) => {
    const label = pickLocalizedValue(item, "label", lang);
    return label ? [{ label }] : [];
  });
}

function normalizeEntryList(value: unknown, lang: Lang): PortfolioEntry[] {
  return unwrapStrapiCollection<LocalizedEntryRecord>(value).flatMap((entry) => {
    const title = pickLocalizedValue(entry, "title", lang);
    if (!title) return [];

    return [{
      title,
      subtitle: pickLocalizedValue(entry, "subtitle", lang) || undefined,
      organisation: pickLocalizedValue(entry, "organisation", lang) || undefined,
      location: pickLocalizedValue(entry, "location", lang) || undefined,
      period: pickLocalizedValue(entry, "period", lang) || undefined,
      description: pickLocalizedValue(entry, "description", lang) || undefined,
      url: trimString(entry.url),
    }];
  });
}

function normalizeCustomSectionList(value: unknown, lang: Lang): PortfolioCustomSection[] {
  return unwrapStrapiCollection<LocalizedSectionRecord>(value).flatMap((section) => {
    const title = pickLocalizedValue(section, "title", lang);
    if (!title) return [];

    return [{
      title,
      body: pickLocalizedValue(section, "body", lang) || undefined,
    }];
  });
}

function normalizeSocialLinks(value: unknown): TeamSocialLink[] {
  return unwrapStrapiCollection<{ platform?: string; url?: string }>(value).flatMap((item) => {
    const platform = trimString(item.platform);
    const url = trimString(item.url);
    if (!platform || !url) return [];
    return [{ platform, url }];
  });
}

function extractMediaUrl(value: unknown) {
  const media = unwrapStrapiSingle<{
    url?: string;
    formats?: {
      medium?: { url?: string };
      small?: { url?: string };
      thumbnail?: { url?: string };
    };
  }>(value);

  const url =
    media?.formats?.medium?.url ||
    media?.formats?.small?.url ||
    media?.formats?.thumbnail?.url ||
    media?.url;

  return url ? getStrapiMediaUrl(url) : "";
}

function extractFileUrl(value: unknown) {
  const media = unwrapStrapiSingle<{ url?: string }>(value);
  return media?.url ? getStrapiMediaUrl(media.url) : "";
}

function normalizeRelatedArticles(value: unknown, lang: Lang): TeamRelatedArticle[] {
  return unwrapStrapiCollection<Record<string, unknown> & {
    id?: number;
    title?: string;
    slug?: string;
    section?: string;
    publishedAt?: string;
    subtitle?: string;
    authors?: unknown;
  }>(value)
    .map((article) => localizeArticle(article, lang))
    .flatMap((article) => {
      if (
        typeof article.id !== "number" ||
        typeof article.title !== "string" ||
        !article.title.trim() ||
        typeof article.slug !== "string" ||
        !article.slug.trim()
      ) {
        return [];
      }

      return [{
        id: article.id,
        title: article.title.trim(),
        subtitle: typeof article.subtitle === "string" && article.subtitle.trim() ? article.subtitle.trim() : undefined,
        slug: article.slug.trim(),
        section: typeof article.section === "string" ? article.section : undefined,
        publishedAt: typeof article.publishedAt === "string" ? article.publishedAt : undefined,
        authors: article.authors,
      }];
    });
}

function toInteger(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function mapTeamMember(record: TeamMemberRecord, lang: Lang): TeamMember | null {
  const fullName = trimString(record.fullName);
  const slug = trimString(record.slug);
  const role = pickLocalizedValue(record, "role", lang);
  const shortBio = pickLocalizedValue(record, "shortBio", lang);

  if (!fullName || !slug || !role || !shortBio) {
    return null;
  }

  return {
    id: toInteger(record.id, 0),
    fullName,
    slug,
    role,
    shortBio,
    longBio: pickLocalizedValue(record, "longBio", lang) || undefined,
    portraitUrl: extractMediaUrl(record.portrait) || undefined,
    email: trimString(record.email),
    website: trimString(record.website),
    socialLinks: normalizeSocialLinks(record.socialLinks),
    location: pickLocalizedValue(record, "location", lang) || undefined,
    languages: normalizeTagList(record.languages, lang),
    skills: normalizeTagList(record.skills, lang),
    education: normalizeEntryList(record.education, lang),
    experience: normalizeEntryList(record.experience, lang),
    projects: normalizeEntryList(record.projects, lang),
    publications: normalizeEntryList(record.publications, lang),
    certifications: normalizeEntryList(record.certifications, lang),
    trainings: normalizeEntryList(record.trainings, lang),
    awards: normalizeEntryList(record.awards, lang),
    customSections: normalizeCustomSectionList(record.customSections, lang),
    relatedArticles: normalizeRelatedArticles(record.relatedArticles, lang),
    cvUrl: extractFileUrl(record.cvFile) || undefined,
    portfolioEnabled: record.portfolioEnabled !== false,
    order: toInteger(record.order, 0),
    isActive: record.isActive !== false,
  };
}

function mapDirections(value: unknown, lang: Lang): ShowcaseSection[] {
  const fallbackDirections = getShowcaseSections(lang);

  return unwrapStrapiCollection<AboutDirectionRecord>(value)
    .flatMap((item) => {
      const slug = normalizeShowcaseSectionSlug(trimString(item.slug));
      if (!slug) return [];
      const fallbackDirection = fallbackDirections.find((direction) => direction.slug === slug);

      return [{
        slug,
        href: `/${slug}`,
        title: pickLocalizedTranslation(item, "title", lang) || fallbackDirection?.title || slug.toUpperCase(),
        description: pickLocalizedTranslation(item, "description", lang) || fallbackDirection?.description || "",
        ordinal: toInteger(item.ordinal, 0),
        displayOrder: toInteger(item.displayOrder, 0),
        isActive: item.isActive !== false,
        relatedArticles: [],
      }];
    })
    .filter((item) => item.isActive)
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }
      return left.ordinal - right.ordinal;
    });
}

export function getAboutNavigationGroup(lang: Lang): AboutNavigationGroup {
  const copy = aboutNavigationByLang[lang];

  return {
    label: copy.label,
    href: withLang("/o-nama", lang),
    children: [
      { key: "who", label: copy.who, href: withLangHash("/o-nama", "ko-smo-mi", lang) },
      { key: "principle", label: copy.principle, href: withLangHash("/o-nama", "urednicki-princip", lang) },
      { key: "people", label: copy.people, href: withLangHash("/o-nama", "ljudi", lang) },
      { key: "impressum", label: copy.impressum, href: withLang("/impresum", lang) },
      { key: "contact", label: copy.contact, href: withLang("/contact", lang) },
    ],
  };
}

export function getPeopleChrome(lang: Lang) {
  return peopleChromeByLang[lang];
}

export function getFallbackTeamMembers(lang: Lang): TeamMember[] {
  return fallbackTeamMembers
    .map((member) => mapTeamMember(member, lang))
    .filter((member): member is TeamMember => !!member)
    .sort((left, right) => left.order - right.order);
}

export function getFallbackTeamMemberBySlug(slug: string, lang: Lang) {
  return getFallbackTeamMembers(lang).find((member) => member.slug === slug) ?? null;
}

export async function fetchTeamMembers(lang: Lang): Promise<TeamMember[]> {
  const response = await strapiGet<{ data: unknown[] }>(
    "/api/team-members?filters[isActive][$eq]=true&sort[0]=order:asc&sort[1]=fullName:asc&populate[0]=portrait&populate[1]=socialLinks&populate[2]=languages&populate[3]=skills&populate[4]=education&populate[5]=experience&populate[6]=projects&populate[7]=publications&populate[8]=certifications&populate[9]=trainings&populate[10]=awards&populate[11]=customSections&populate[12]=relatedArticles&populate[13]=cvFile"
  );

  const cmsMembers = unwrapStrapiCollection<TeamMemberRecord>(response?.data)
    .map((member) => mapTeamMember(member, lang))
    .filter((member): member is TeamMember => !!member && member.isActive)
    .sort((left, right) => left.order - right.order);

  return cmsMembers.length ? cmsMembers : getFallbackTeamMembers(lang);
}

export async function fetchTeamMemberBySlug(slug: string, lang: Lang): Promise<TeamMember | null> {
  const response = await strapiGet<{ data: unknown[] }>(
    `/api/team-members?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&populate[0]=portrait&populate[1]=socialLinks&populate[2]=languages&populate[3]=skills&populate[4]=education&populate[5]=experience&populate[6]=projects&populate[7]=publications&populate[8]=certifications&populate[9]=trainings&populate[10]=awards&populate[11]=customSections&populate[12]=relatedArticles&populate[13]=cvFile`
  );

  const cmsMember = unwrapStrapiCollection<TeamMemberRecord>(response?.data)
    .map((member) => mapTeamMember(member, lang))
    .find((member): member is TeamMember => !!member && member.isActive);

  if (cmsMember) return cmsMember;
  return getFallbackTeamMemberBySlug(slug, lang);
}

function getFallbackAboutCopy(lang: Lang) {
  return aboutPageFallbackByLang[lang];
}

export async function fetchAboutPageData(lang: Lang): Promise<AboutPageData> {
  const [aboutResponse, people, fallbackDirections] = await Promise.all([
    strapiGet<{ data: unknown }>("/api/about-page?populate[0]=directions"),
    fetchTeamMembers(lang),
    fetchShowcaseSections(lang),
  ]);

  const fallback = getFallbackAboutCopy(lang);
  const aboutRecord = unwrapStrapiSingle<AboutPageRecord>(aboutResponse);

  if (!aboutRecord) {
    return {
      ...fallback,
      directions: fallbackDirections.length ? fallbackDirections : getShowcaseSections(lang),
      people,
    };
  }

  const directions = mapDirections(aboutRecord.directions, lang);

  return {
    label: fallback.label,
    title: pickLocalizedTranslation(aboutRecord, "title", lang) || fallback.title,
    intro: pickLocalizedTranslation(aboutRecord, "intro", lang) || fallback.intro,
    whoWeAreTitle: pickLocalizedTranslation(aboutRecord, "whoWeAreTitle", lang) || fallback.whoWeAreTitle,
    whoWeAreText: pickLocalizedTranslation(aboutRecord, "whoWeAreText", lang) || fallback.whoWeAreText,
    editorialPrincipleTitle:
      pickLocalizedTranslation(aboutRecord, "editorialPrincipleTitle", lang) || fallback.editorialPrincipleTitle,
    editorialPrincipleText:
      pickLocalizedTranslation(aboutRecord, "editorialPrincipleText", lang) || fallback.editorialPrincipleText,
    peopleSectionTitle: pickLocalizedTranslation(aboutRecord, "peopleSectionTitle", lang) || fallback.peopleSectionTitle,
    peopleSectionIntro: pickLocalizedTranslation(aboutRecord, "peopleSectionIntro", lang) || fallback.peopleSectionIntro,
    portfolioCtaLabel: pickLocalizedTranslation(aboutRecord, "portfolioCtaLabel", lang) || fallback.portfolioCtaLabel,
    impressumLinkLabel: pickLocalizedTranslation(aboutRecord, "impressumLinkLabel", lang) || fallback.impressumLinkLabel,
    directions: directions.length ? directions : fallbackDirections.length ? fallbackDirections : getShowcaseSections(lang),
    people,
  };
}
