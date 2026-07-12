import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentaryFeatureCard } from "@/components/documentary-feature-card";
import { PortfolioIcon, type PortfolioIconName } from "@/components/portfolio-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  fetchTeamMemberBySlug,
  getPeopleChrome,
  type PortfolioCustomSection,
  type PortfolioEntry,
  type PortfolioTimelineItem,
  type TeamMember,
} from "@/lib/about";
import { getAuthorLabel, getAuthorNames } from "@/lib/content";
import { fetchDocumentaryArchive, getDocumentaryUiCopy, type DocumentaryItem } from "@/lib/documentaries";
import { fetchPublishedArticles, type PublishedArticle } from "@/lib/editorial";
import { getDictionary, getSectionLabel, resolveLang, withLang, type Lang } from "@/lib/i18n";
import { getRichTextHtml } from "@/lib/richtext";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { formatDisplayDate } from "@/lib/strapi";
import { getYouTubeEmbedUrl } from "@/lib/video";

type PortfolioArticleCard = {
  id: number | string;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
};

type PortfolioDocumentaryCard = {
  id: number | string;
  title: string;
  description?: string;
  href: string;
  slug: string;
  externalUrl?: string | null;
  embedUrl?: string | null;
  youtubeUrl?: string;
  thumbnailUrl?: string | null;
  date?: string;
  location?: string;
  director?: string;
  duration?: string;
};

function formatPortfolioLinkValue(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./i, "");
    const path = parsed.pathname.replace(/\/$/, "");
    return `${host}${path && path !== "/" ? path : ""}`;
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}

function getExternalHref(url: string) {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

type PortfolioSectionCopy = {
  label: string;
  storyLabel: string;
  founder: string;
  featured: string;
  startingPoint: string;
  work: string;
  projects: string;
  articles: string;
  documentaries: string;
  timeline: string;
  selectedWork: string;
  fieldNotes: string;
  contact: string;
  watch: string;
  readMore: string;
  openProject: string;
  viewAllArticles: string;
  viewAllDocumentaries: string;
  basedIn: string;
  selectedProjects: string;
  portfolioTimeline: string;
  contactIntro: string;
};

const portfolioCopyByLang: Record<Lang, PortfolioSectionCopy> = {
  sr: {
    label: "Portfolio",
    storyLabel: "Lična putanja",
    founder: "Osnivač",
    featured: "Istaknuto",
    startingPoint: "Polazna tačka",
    work: "Rad",
    projects: "Projekti",
    articles: "Tekstovi",
    documentaries: "Dokumentarci",
    timeline: "Vremenska linija",
    selectedWork: "Izdvojeni rad",
    fieldNotes: "Terenske beleške",
    contact: "Kontakt",
    watch: "Gledaj",
    readMore: "Pročitaj više",
    openProject: "Otvori projekat",
    viewAllArticles: "Svi tekstovi",
    viewAllDocumentaries: "Svi dokumentarci",
    basedIn: "Radi iz",
    selectedProjects: "Odabrani projekti i urednički pravci koji oblikuju rad.",
    portfolioTimeline: "Vertikalni trag kroz projekte, teren i urednički rad.",
    contactIntro: "Otvoreni kanali za saradnju, razgovor, teren i urednički kontakt.",
  },
  en: {
    label: "Portfolio",
    storyLabel: "Editorial path",
    founder: "Founder",
    featured: "Featured",
    startingPoint: "Starting point",
    work: "Work",
    projects: "Projects",
    articles: "Articles",
    documentaries: "Documentaries",
    timeline: "Timeline",
    selectedWork: "Selected work",
    fieldNotes: "Field notes",
    contact: "Contact",
    watch: "Watch",
    readMore: "Read more",
    openProject: "Open project",
    viewAllArticles: "All articles",
    viewAllDocumentaries: "All documentaries",
    basedIn: "Based in",
    selectedProjects: "Selected projects and editorial directions shaping the work.",
    portfolioTimeline: "A vertical trace through projects, fieldwork and editorial practice.",
    contactIntro: "Open channels for collaboration, field reporting, conversations and editorial contact.",
  },
  tr: {
    label: "Portfolyo",
    storyLabel: "Editoryal rota",
    founder: "Kurucu",
    featured: "Öne çıkan",
    startingPoint: "Başlangıç noktası",
    work: "Çalışma",
    projects: "Projeler",
    articles: "Yazılar",
    documentaries: "Belgeseller",
    timeline: "Zaman çizelgesi",
    selectedWork: "Seçili işler",
    fieldNotes: "Saha notları",
    contact: "İletişim",
    watch: "İzle",
    readMore: "Devamını oku",
    openProject: "Projeyi aç",
    viewAllArticles: "Tüm yazılar",
    viewAllDocumentaries: "Tüm belgeseller",
    basedIn: "Çalıştığı yer",
    selectedProjects: "Çalışmayı şekillendiren seçili projeler ve editoryal yönler.",
    portfolioTimeline: "Projeler, saha ve editoryal pratik boyunca dikey bir iz.",
    contactIntro: "İşbirliği, saha, görüşme ve editoryal temas için açık kanallar.",
  },
  fr: {
    label: "Portfolio",
    storyLabel: "Trajectoire éditoriale",
    founder: "Fondateur",
    featured: "À la une",
    startingPoint: "Point de départ",
    work: "Travail",
    projects: "Projets",
    articles: "Textes",
    documentaries: "Documentaires",
    timeline: "Chronologie",
    selectedWork: "Travaux choisis",
    fieldNotes: "Notes de terrain",
    contact: "Contact",
    watch: "Regarder",
    readMore: "Lire plus",
    openProject: "Ouvrir le projet",
    viewAllArticles: "Tous les textes",
    viewAllDocumentaries: "Tous les documentaires",
    basedIn: "Travaille depuis",
    selectedProjects: "Projets choisis et directions éditoriales qui façonnent ce travail.",
    portfolioTimeline: "Une ligne verticale à travers projets, terrain et pratique éditoriale.",
    contactIntro: "Des canaux ouverts pour collaborer, échanger, partir sur le terrain et contacter la rédaction.",
  },
  de: {
    label: "Portfolio",
    storyLabel: "Redaktioneller Weg",
    founder: "Gründer",
    featured: "Im Fokus",
    startingPoint: "Ausgangspunkt",
    work: "Arbeit",
    projects: "Projekte",
    articles: "Texte",
    documentaries: "Dokumentarfilme",
    timeline: "Timeline",
    selectedWork: "Ausgewählte Arbeiten",
    fieldNotes: "Feldnotizen",
    contact: "Kontakt",
    watch: "Ansehen",
    readMore: "Weiterlesen",
    openProject: "Projekt öffnen",
    viewAllArticles: "Alle Texte",
    viewAllDocumentaries: "Alle Dokumentarfilme",
    basedIn: "Arbeitet aus",
    selectedProjects: "Ausgewählte Projekte und redaktionelle Richtungen, die diese Arbeit prägen.",
    portfolioTimeline: "Eine vertikale Spur durch Projekte, Feldarbeit und redaktionelle Praxis.",
    contactIntro: "Offene Kanäle für Zusammenarbeit, Gespräche, Feldarbeit und redaktionellen Kontakt.",
  },
  es: {
    label: "Portafolio",
    storyLabel: "Trayectoria editorial",
    founder: "Fundador",
    featured: "Destacado",
    startingPoint: "Punto de partida",
    work: "Trabajo",
    projects: "Proyectos",
    articles: "Textos",
    documentaries: "Documentales",
    timeline: "Cronología",
    selectedWork: "Trabajo seleccionado",
    fieldNotes: "Notas de campo",
    contact: "Contacto",
    watch: "Ver",
    readMore: "Leer más",
    openProject: "Abrir proyecto",
    viewAllArticles: "Todos los textos",
    viewAllDocumentaries: "Todos los documentales",
    basedIn: "Trabaja desde",
    selectedProjects: "Proyectos y direcciones editoriales que dan forma a este trabajo.",
    portfolioTimeline: "Un rastro vertical a través de proyectos, terreno y práctica editorial.",
    contactIntro: "Canales abiertos para colaborar, conversar, trabajar en terreno y contactar la redacción.",
  },
  el: {
    label: "Portfolio",
    storyLabel: "Εκδοτική διαδρομή",
    founder: "Ιδρυτής",
    featured: "Προβεβλημένο",
    startingPoint: "Αφετηρία",
    work: "Δουλειά",
    projects: "Έργα",
    articles: "Κείμενα",
    documentaries: "Ντοκιμαντέρ",
    timeline: "Χρονογραμμή",
    selectedWork: "Επιλεγμένη δουλειά",
    fieldNotes: "Σημειώσεις πεδίου",
    contact: "Επικοινωνία",
    watch: "Δες",
    readMore: "Διάβασε περισσότερα",
    openProject: "Άνοιγμα έργου",
    viewAllArticles: "Όλα τα κείμενα",
    viewAllDocumentaries: "Όλα τα ντοκιμαντέρ",
    basedIn: "Δουλεύει από",
    selectedProjects: "Επιλεγμένα έργα και εκδοτικές κατευθύνσεις που διαμορφώνουν τη δουλειά.",
    portfolioTimeline: "Ένα κάθετο ίχνος μέσα από έργα, πεδίο και εκδοτική πρακτική.",
    contactIntro: "Ανοιχτά κανάλια για συνεργασία, συζήτηση, πεδίο και επικοινωνία με τη σύνταξη.",
  },
  ar: {
    label: "الملف المهني",
    storyLabel: "المسار التحريري",
    founder: "المؤسس",
    featured: "مميز",
    startingPoint: "نقطة البداية",
    work: "العمل",
    projects: "المشاريع",
    articles: "النصوص",
    documentaries: "الوثائقيات",
    timeline: "الخط الزمني",
    selectedWork: "أعمال مختارة",
    fieldNotes: "ملاحظات ميدانية",
    contact: "التواصل",
    watch: "شاهد",
    readMore: "اقرأ المزيد",
    openProject: "افتح المشروع",
    viewAllArticles: "كل النصوص",
    viewAllDocumentaries: "كل الوثائقيات",
    basedIn: "يعمل من",
    selectedProjects: "مشاريع واتجاهات تحريرية مختارة تشكل هذا العمل.",
    portfolioTimeline: "أثر عمودي عبر المشاريع والميدان والممارسة التحريرية.",
    contactIntro: "قنوات مفتوحة للتعاون والحوار والعمل الميداني والتواصل التحريري.",
  },
};

const portfolioSectionIds = {
  startingPoint: "starting-point",
  work: "work",
  projects: "projects",
  articles: "articles",
  documentaries: "documentaries",
  timeline: "timeline",
  selectedWork: "selected-work",
  fieldNotes: "field-notes",
  contact: "contact",
} as const;

type VisiblePortfolioSection = {
  id: string;
  label: string;
  icon: PortfolioIconName;
};

const timelineTypeLabelsByLang: Record<Lang, Record<PortfolioTimelineItem["type"], string>> = {
  sr: { education: "Obrazovanje", work: "Rad", project: "Projekat", publication: "Publikacija", award: "Priznanje", fieldwork: "Teren" },
  en: { education: "Education", work: "Work", project: "Project", publication: "Publication", award: "Award", fieldwork: "Fieldwork" },
  tr: { education: "Eğitim", work: "Çalışma", project: "Proje", publication: "Yayın", award: "Ödül", fieldwork: "Saha" },
  fr: { education: "Formation", work: "Travail", project: "Projet", publication: "Publication", award: "Distinction", fieldwork: "Terrain" },
  de: { education: "Ausbildung", work: "Arbeit", project: "Projekt", publication: "Publikation", award: "Auszeichnung", fieldwork: "Feldarbeit" },
  es: { education: "Formación", work: "Trabajo", project: "Proyecto", publication: "Publicación", award: "Reconocimiento", fieldwork: "Terreno" },
  el: { education: "Εκπαίδευση", work: "Εργασία", project: "Έργο", publication: "Δημοσίευση", award: "Διάκριση", fieldwork: "Πεδίο" },
  ar: { education: "التعليم", work: "العمل", project: "مشروع", publication: "منشور", award: "تكريم", fieldwork: "الميدان" },
};

function getTimelineIcon(type: PortfolioTimelineItem["type"]): PortfolioIconName {
  if (type === "education") return "education";
  if (type === "project") return "project";
  if (type === "publication") return "publication";
  if (type === "award") return "award";
  if (type === "fieldwork") return "fieldwork";
  return "work";
}

function getSocialChannel(platform: string, url: string) {
  const normalized = `${platform} ${url}`.toLowerCase();
  if (normalized.includes("instagram")) return "Instagram";
  if (normalized.includes("facebook")) return "Facebook";
  if (normalized.includes("linkedin")) return "LinkedIn";
  if (normalized.includes("youtube") || normalized.includes("youtu.be")) return "YouTube";
  if (normalized.includes("tiktok")) return "TikTok";
  if (platform.toLowerCase() === "x" || normalized.includes("twitter.com") || normalized.includes("x.com")) return "X";
  return platform === "website" ? "Website" : platform;
}

function getSocialIcon(platform: string, url: string): PortfolioIconName {
  const normalized = `${platform} ${url}`.toLowerCase();
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("linkedin")) return "linkedin";
  if (normalized.includes("youtube") || normalized.includes("youtu.be")) return "youtube";
  if (normalized.includes("tiktok")) return "tiktok";
  if (platform.toLowerCase() === "x" || normalized.includes("twitter.com") || normalized.includes("x.com")) return "x";
  return "website";
}

function renderPortfolioSectionTitle(label: string, icon: PortfolioIconName) {
  return (
    <h2 className="section-title portfolio-section-title">
      <span>{label}</span>
      <span className="portfolio-section-title__icon" aria-hidden="true">
        <PortfolioIcon name={icon} />
      </span>
    </h2>
  );
}

function normalizeComparableValue(value: string) {
  return normalizeSerbianLatin(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function parseEntryYear(value?: string) {
  if (!value) return Number.NaN;
  const match = value.match(/(19|20)\d{2}/);
  return match ? Number.parseInt(match[0], 10) : Number.NaN;
}

function sortByPublishedDate<T extends { publishedAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
    return rightTime - leftTime;
  });
}

function buildPortfolioArticles(member: TeamMember, articles: PublishedArticle[]): PortfolioArticleCard[] {
  const memberName = normalizeComparableValue(member.fullName);
  const manualBySlug = new Map(
    member.relatedArticles
      .filter((article) => article.slug)
      .map((article) => [article.slug, article])
  );
  const authored = articles.filter((article) =>
    getAuthorNames(article.authors).some((authorName) => normalizeComparableValue(authorName) === memberName)
  );

  const merged = new Map<string, PortfolioArticleCard>();

  for (const article of authored) {
    merged.set(article.slug, {
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      slug: article.slug,
      section: article.section,
      publishedAt: article.publishedAt,
      authors: article.authors,
    });
  }

  for (const article of member.relatedArticles) {
    const existing = article.slug ? merged.get(article.slug) : undefined;
    const nextArticle: PortfolioArticleCard = {
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      slug: article.slug,
      section: article.section,
      publishedAt: article.publishedAt,
      authors: article.authors,
    };
    if (article.slug) {
      merged.set(article.slug, existing ? { ...nextArticle, ...existing } : nextArticle);
    }
  }

  for (const [slug, manualArticle] of manualBySlug.entries()) {
    if (!merged.has(slug)) {
      merged.set(slug, manualArticle);
    }
  }

  return sortByPublishedDate(Array.from(merged.values())).slice(0, 6);
}

function buildPortfolioDocumentaries(member: TeamMember, documentaries: DocumentaryItem[], lang: Lang): PortfolioDocumentaryCard[] {
  const memberName = normalizeComparableValue(member.fullName);
  const merged = new Map<string, PortfolioDocumentaryCard>();
  const documentariesBySlug = new Map(
    documentaries.map((documentary) => [documentary.slug, documentary] as const)
  );
  const documentariesByTitle = new Map(
    documentaries.map((documentary) => [normalizeComparableValue(documentary.title), documentary] as const)
  );

  for (const documentary of documentaries) {
    if (normalizeComparableValue(documentary.director || "") !== memberName) continue;
    merged.set(documentary.slug, {
      id: documentary.id,
      title: documentary.title,
      description: documentary.description,
      href: documentary.externalUrl || withLang("/dokumentarci", lang),
      slug: documentary.slug,
      externalUrl: documentary.externalUrl,
      embedUrl: documentary.embedUrl,
      youtubeUrl: documentary.youtubeUrl,
      thumbnailUrl: documentary.thumbnailUrl,
      date: documentary.date,
      location: documentary.location,
      director: documentary.director,
      duration: documentary.duration,
    });
  }

  for (const documentary of member.relatedDocumentaries) {
    const key = documentary.slug || String(documentary.id);
    if (!key) continue;
    const matchedDocumentary =
      (documentary.slug ? documentariesBySlug.get(documentary.slug) : undefined) ||
      documentariesByTitle.get(normalizeComparableValue(documentary.title));
    const sourceYoutubeUrl = documentary.youtubeUrl || matchedDocumentary?.youtubeUrl;
    const sourceEmbedUrl =
      matchedDocumentary?.embedUrl ||
      getYouTubeEmbedUrl(sourceYoutubeUrl, "documentary", {
        autoplay: true,
      });
    const existing = merged.get(key);
    merged.set(key, {
      id: documentary.id,
      title: documentary.title,
      description: documentary.description,
      href: documentary.externalUrl || matchedDocumentary?.externalUrl || withLang("/dokumentarci", lang),
      slug: documentary.slug || matchedDocumentary?.slug || String(documentary.id),
      externalUrl: documentary.externalUrl || matchedDocumentary?.externalUrl,
      embedUrl: sourceEmbedUrl,
      youtubeUrl: sourceYoutubeUrl,
      thumbnailUrl: documentary.thumbnailUrl || matchedDocumentary?.thumbnailUrl,
      date: documentary.date || matchedDocumentary?.date,
      location: documentary.location || matchedDocumentary?.location,
      director: documentary.director || matchedDocumentary?.director,
      duration: documentary.duration || matchedDocumentary?.duration,
      ...existing,
    });
  }

  return Array.from(merged.values()).slice(0, 6);
}

function buildPortfolioTimeline(member: TeamMember): PortfolioTimelineItem[] {
  if (member.timelineItems.length) {
    return [...member.timelineItems].sort((left, right) => parseEntryYear(left.year) - parseEntryYear(right.year));
  }

  const derived: PortfolioTimelineItem[] = [];

  const pushEntries = (entries: PortfolioEntry[], type: PortfolioTimelineItem["type"]) => {
    for (const entry of entries) {
      const year = parseEntryYear(entry.period);
      if (!Number.isFinite(year)) continue;
      derived.push({
        year: String(year),
        title: entry.title,
        description: entry.description || entry.subtitle || entry.organisation,
        location: entry.location,
        type,
      });
    }
  };

  pushEntries(member.education, "education");
  pushEntries(member.experience, "work");
  pushEntries(member.projects, "project");
  pushEntries(member.publications, "publication");
  pushEntries(member.awards, "award");

  return derived.sort((left, right) => parseEntryYear(left.year) - parseEntryYear(right.year));
}

function buildSelectedWorkGroups(member: TeamMember, chrome: ReturnType<typeof getPeopleChrome>) {
  return [
    { label: chrome.publications, entries: member.publications },
    { label: chrome.certifications, entries: member.certifications },
    { label: chrome.trainings, entries: member.trainings },
    { label: chrome.awards, entries: member.awards },
  ].filter((group) => group.entries.length);
}

function renderEntryCard(
  entry: PortfolioEntry,
  ctaLabel: string,
  extraEyebrow?: string,
  variant?: "project" | "selected"
) {
  return (
    <article
      key={`${entry.title}-${entry.period || entry.organisation || entry.url || ""}`}
      className={`panel portfolio-entry-card${variant ? ` portfolio-entry-card--${variant}` : ""}`}
    >
      {extraEyebrow ? (
        <span className="eyebrow portfolio-entry-card__eyebrow">
          <PortfolioIcon name={variant === "project" ? "project" : "selected"} />
          <span>{extraEyebrow}</span>
        </span>
      ) : null}
      <h3>{entry.title}</h3>
      {entry.subtitle ? <p className="portfolio-entry-card__subhead">{entry.subtitle}</p> : null}
      {entry.organisation || entry.location || entry.period ? (
        <p className="portfolio-entry-card__meta">
          {[entry.organisation, entry.location, entry.period].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      {entry.description ? <p>{entry.description}</p> : null}
      {entry.url ? (
        <a className="button-secondary portfolio-entry-card__link" href={entry.url} target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      ) : null}
    </article>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const member = await fetchTeamMemberBySlug(params.slug, lang);

  if (!member) {
    return buildSeoMetadata({
      lang,
      pathname: `/people/${params.slug}`,
      title: buildPageTitle("Portfolio"),
    });
  }

  return buildSeoMetadata({
    lang,
    pathname: `/people/${params.slug}`,
    title: buildPageTitle(member.fullName),
    description: member.shortBio,
    image: member.portraitUrl,
  });
}

export default async function PersonPortfolioPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const chrome = getPeopleChrome(lang);
  const copy = portfolioCopyByLang[lang];
  const documentaryUiCopy = getDocumentaryUiCopy(lang);

  const [member, articles, documentaries] = await Promise.all([
    fetchTeamMemberBySlug(params.slug, lang),
    fetchPublishedArticles(lang, 200),
    fetchDocumentaryArchive(lang, true),
  ]);

  if (!member || !member.portfolioEnabled) {
    notFound();
  }

  const articleCards = buildPortfolioArticles(member, articles);
  const documentaryCards = buildPortfolioDocumentaries(member, documentaries, lang);
  const [featuredDocumentary, ...remainingDocumentaryCards] = documentaryCards;
  const timelineItems = buildPortfolioTimeline(member);
  const selectedWorkGroups = buildSelectedWorkGroups(member, chrome);
  const workCards = member.focusAreas.length
    ? member.focusAreas
    : member.skills.map((skill) => ({ title: skill.label } as PortfolioCustomSection));
  const fieldNotes = member.customSections.filter((section) => {
    return !["polazna tačka", "starting point"].includes(normalizeComparableValue(section.title));
  });
  const narrativeHtml = getRichTextHtml(member.longBio || member.shortBio, {
    lang,
    articleTitle: member.fullName,
  });
  const articleArchiveHref = withLang(`/archive?author=${encodeURIComponent(member.fullName)}`, lang);
  const hasContactSection = Boolean(
    member.email || member.phone || member.website || member.socialLinks.length || member.location || member.cvUrl
  );

  const visibleSections: VisiblePortfolioSection[] = [
    { id: portfolioSectionIds.startingPoint, label: copy.startingPoint, icon: "starting-point" },
    ...(workCards.length ? [{ id: portfolioSectionIds.work, label: copy.work, icon: "work" as const }] : []),
    ...(member.projects.length ? [{ id: portfolioSectionIds.projects, label: copy.projects, icon: "project" as const }] : []),
    ...(articleCards.length ? [{ id: portfolioSectionIds.articles, label: copy.articles, icon: "publication" as const }] : []),
    ...(documentaryCards.length ? [{ id: portfolioSectionIds.documentaries, label: copy.documentaries, icon: "documentary" as const }] : []),
    ...(timelineItems.length ? [{ id: portfolioSectionIds.timeline, label: copy.timeline, icon: "timeline" as const }] : []),
    ...(selectedWorkGroups.length ? [{ id: portfolioSectionIds.selectedWork, label: copy.selectedWork, icon: "selected" as const }] : []),
    ...(fieldNotes.length ? [{ id: portfolioSectionIds.fieldNotes, label: copy.fieldNotes, icon: "notes" as const }] : []),
    ...(hasContactSection ? [{ id: portfolioSectionIds.contact, label: copy.contact, icon: "contact" as const }] : []),
  ];

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/people/${params.slug}`} activeNav="about" />

      <main className="site-main">
        <div className="page-shell portfolio-page">
          <section className="panel portfolio-hero">
            <div className="portfolio-hero__grid">
              <aside className="portfolio-identity-card">
                <div className="portfolio-identity-card__visual">
                  {member.portraitUrl ? (
                    <img
                      src={member.portraitUrl}
                      alt={member.fullName}
                      className="portfolio-identity-card__portrait"
                      draggable="false"
                    />
                  ) : (
                    <div className="portfolio-identity-card__placeholder" aria-hidden="true">
                      <span>{buildInitials(member.fullName)}</span>
                    </div>
                  )}
                </div>

                <div className="portfolio-identity-card__body">
                  <span className="eyebrow">{copy.label}</span>
                  <h2>{member.fullName}</h2>
                  {member.location ? (
                    <p className="portfolio-identity-card__location">
                      <span>{copy.basedIn}</span>
                      <strong>{member.location}</strong>
                    </p>
                  ) : null}
                  <div className="portfolio-identity-card__stats">
                    <span className="topic-pill">{member.projects.length} {copy.projects}</span>
                    <span className="topic-pill">{articleCards.length} {copy.articles}</span>
                    {documentaryCards.length ? <span className="topic-pill">{documentaryCards.length} {copy.documentaries}</span> : null}
                  </div>
                </div>
              </aside>

              <div className="portfolio-hero__copy">
                <div className="portfolio-hero__head">
                  <span className="eyebrow">{copy.storyLabel}</span>
                  <div className="portfolio-hero__flags">
                    {member.isFounder ? <span className="topic-pill topic-pill--highlight">{copy.founder}</span> : null}
                    {member.isFeatured ? <span className="topic-pill">{copy.featured}</span> : null}
                  </div>
                </div>

                <h1 className="portfolio-hero__title">{member.fullName}</h1>
                <p className="portfolio-hero__role">{member.role}</p>
                <p className="portfolio-hero__lead">{member.quote || member.shortBio}</p>

                <div className="portfolio-hero__actions">
                  {member.cvUrl ? (
                    <a className="button-primary" href={member.cvUrl} target="_blank" rel="noopener noreferrer">
                      {chrome.downloadCv}
                    </a>
                  ) : null}
                  {hasContactSection ? (
                    <a className="button-secondary" href={`#${portfolioSectionIds.contact}`}>
                      {copy.contact}
                    </a>
                  ) : null}
                  {articleCards.length ? (
                    <a className="button-secondary" href={`#${portfolioSectionIds.articles}`}>
                      {copy.articles}
                    </a>
                  ) : null}
                  {documentaryCards.length ? (
                    <a className="button-secondary" href={`#${portfolioSectionIds.documentaries}`}>
                      {copy.documentaries}
                    </a>
                  ) : null}
                </div>

                <div className="portfolio-hero__meta">
                  {member.location ? <span className="topic-pill portfolio-hero__meta-location">{member.location}</span> : null}
                  {member.languages.map((language) => (
                    <span key={language.label} className="topic-pill">
                      {language.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="portfolio-layout">
            <aside className="panel portfolio-index" aria-label={copy.label}>
              <span className="eyebrow">{copy.label}</span>
              <nav className="portfolio-index__nav">
                {visibleSections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`} className="portfolio-index__link">
                    <span className="portfolio-index__number">{String(index + 1).padStart(2, "0")}</span>
                    <PortfolioIcon name={section.icon} className="portfolio-index__icon" />
                    <strong>{section.label}</strong>
                  </a>
                ))}
              </nav>
            </aside>

            <div className="portfolio-story">
              <section id={portfolioSectionIds.startingPoint} className="panel portfolio-section">
                <div className="portfolio-section__header">
                  <div>
                    <span className="eyebrow">{copy.storyLabel}</span>
                    {renderPortfolioSectionTitle(copy.startingPoint, "starting-point")}
                  </div>
                </div>

                <div className={`portfolio-opening${member.quote ? "" : " portfolio-opening--single"}`}>
                  {member.quote ? <blockquote className="portfolio-quote">{member.quote}</blockquote> : null}
                  <div className="article-body portfolio-richtext" dangerouslySetInnerHTML={{ __html: narrativeHtml }} />
                </div>
              </section>

              {workCards.length ? (
                <section id={portfolioSectionIds.work} className="section-block portfolio-section-block">
                  <div className="section-header portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.work}</span>
                      {renderPortfolioSectionTitle(copy.work, "work")}
                    </div>
                  </div>

                  <div className="page-grid portfolio-work-grid">
                    {workCards.map((card) => (
                      <article key={card.title} className="panel portfolio-focus-card">
                        <h3>{card.title}</h3>
                        {card.body ? <p>{card.body}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {member.projects.length ? (
                <section id={portfolioSectionIds.projects} className="section-block portfolio-section-block">
                  <div className="section-header portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.projects}</span>
                      {renderPortfolioSectionTitle(copy.projects, "project")}
                      <p className="section-copy">{copy.selectedProjects}</p>
                    </div>
                  </div>

                  <div className="page-grid portfolio-project-grid">
                    {member.projects.map((project) => renderEntryCard(project, copy.openProject, copy.projects, "project"))}
                  </div>
                </section>
              ) : null}

              {articleCards.length ? (
                <section id={portfolioSectionIds.articles} className="section-block portfolio-section-block">
                  <div className="section-header portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.articles}</span>
                      {renderPortfolioSectionTitle(copy.articles, "publication")}
                    </div>
                    <a className="button-secondary" href={articleArchiveHref}>
                      {copy.viewAllArticles}
                    </a>
                  </div>

                  <div className="page-grid portfolio-article-grid">
                    {articleCards.map((article) => (
                      <a key={`${article.slug}-${article.id}`} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card">
                        <div className="article-card__meta">
                          {article.section ? <span>{getSectionLabel(article.section, lang)}</span> : null}
                          {article.publishedAt ? <span>{formatDisplayDate(article.publishedAt, lang)}</span> : null}
                          {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                        </div>
                        <h3 className="article-card__title">{article.title}</h3>
                        {article.subtitle ? <p className="article-card__subtitle">{article.subtitle}</p> : null}
                        <span className="button-secondary">{t.readStory}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {documentaryCards.length ? (
                <section id={portfolioSectionIds.documentaries} className="section-block portfolio-section-block">
                  <div className="section-header portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.documentaries}</span>
                      {renderPortfolioSectionTitle(copy.documentaries, "documentary")}
                    </div>
                    <a className="button-secondary portfolio-section__archive-button" href={withLang("/dokumentarci", lang)}>
                      {copy.viewAllDocumentaries}
                    </a>
                  </div>

                  {featuredDocumentary ? (
                    <div className="portfolio-documentary-feature">
                      <DocumentaryFeatureCard
                        lang={lang}
                        documentary={{
                          id: featuredDocumentary.id,
                          title: featuredDocumentary.title,
                          slug: featuredDocumentary.slug,
                          description: featuredDocumentary.description || "",
                          youtubeUrl: featuredDocumentary.youtubeUrl,
                          embedUrl: featuredDocumentary.embedUrl,
                          externalUrl: featuredDocumentary.externalUrl || featuredDocumentary.href,
                          thumbnailUrl: featuredDocumentary.thumbnailUrl,
                          date: featuredDocumentary.date,
                          location: featuredDocumentary.location,
                          director: featuredDocumentary.director,
                          duration: featuredDocumentary.duration,
                          isFeatured: true,
                          order: 0,
                          isActive: true,
                        }}
                        copy={documentaryUiCopy}
                        variant="page"
                      />
                    </div>
                  ) : null}

                  {remainingDocumentaryCards.length ? (
                    <div className="documentary-archive-grid">
                      {remainingDocumentaryCards.map((documentary) => (
                      <article key={`${documentary.id}-${documentary.title}`} className="panel documentary-archive-card">
                        {documentary.thumbnailUrl ? (
                          <div className="documentary-archive-card__media">
                            <img
                              className="documentary-archive-card__image"
                              src={documentary.thumbnailUrl}
                              alt={documentary.title}
                              loading="lazy"
                              decoding="async"
                              draggable="false"
                            />
                          </div>
                        ) : (
                          <div className="documentary-archive-card__media documentary-archive-card__media--empty" />
                        )}

                        <div className="documentary-archive-card__body">
                          <h3>{documentary.title}</h3>
                          {documentary.description ? <p>{documentary.description}</p> : null}

                          <div className="documentary-archive-card__meta">
                            {documentary.date ? <span>{formatDisplayDate(documentary.date, lang)}</span> : null}
                            {documentary.location ? <span>{documentary.location}</span> : null}
                            {documentary.duration ? <span>{documentary.duration}</span> : null}
                          </div>

                          <a
                            className="button-secondary documentary-archive-card__cta"
                            href={documentary.href}
                            target={documentary.href.startsWith("http") ? "_blank" : undefined}
                            rel={documentary.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {copy.watch}
                          </a>
                        </div>
                      </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {timelineItems.length ? (
                <section id={portfolioSectionIds.timeline} className="section-block portfolio-section-block portfolio-section--timeline">
                  <div className="portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.timeline}</span>
                      {renderPortfolioSectionTitle(copy.timeline, "timeline")}
                      <p className="section-copy">{copy.portfolioTimeline}</p>
                    </div>
                  </div>

                  <ol className="portfolio-timeline">
                    {timelineItems.map((item) => (
                      <li key={`${item.year}-${item.title}`} className="portfolio-timeline__item">
                        <div className="portfolio-timeline__year">{item.year}</div>
                        <div className="portfolio-timeline__dot" aria-hidden="true" />
                        <article className="panel portfolio-timeline__card">
                          <span className="eyebrow portfolio-timeline__type">
                            <PortfolioIcon name={getTimelineIcon(item.type)} />
                            <span>{timelineTypeLabelsByLang[lang][item.type]}</span>
                          </span>
                          <h3>{item.title}</h3>
                          {item.location ? <p className="portfolio-timeline__meta">{item.location}</p> : null}
                          {item.description ? <p>{item.description}</p> : null}
                        </article>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {selectedWorkGroups.length ? (
                <section id={portfolioSectionIds.selectedWork} className="section-block portfolio-section-block">
                  <div className="section-header portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.selectedWork}</span>
                      {renderPortfolioSectionTitle(copy.selectedWork, "selected")}
                    </div>
                  </div>

                  <div className="page-grid portfolio-selected-grid">
                    {selectedWorkGroups.flatMap((group) =>
                      group.entries.map((entry) => renderEntryCard(entry, copy.readMore, group.label, "selected"))
                    )}
                  </div>
                </section>
              ) : null}

              {fieldNotes.length ? (
                <section id={portfolioSectionIds.fieldNotes} className="section-block portfolio-section-block">
                  <div className="section-header portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.fieldNotes}</span>
                      {renderPortfolioSectionTitle(copy.fieldNotes, "notes")}
                    </div>
                  </div>

                  <div className="page-grid portfolio-field-notes-grid">
                    {fieldNotes.map((note) => (
                      <article key={note.title} className="panel portfolio-field-note">
                        <h3>{note.title}</h3>
                        {note.body ? <p>{note.body}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {hasContactSection ? (
                <section id={portfolioSectionIds.contact} className="section-block portfolio-section-block portfolio-section--contact">
                  <div className="portfolio-section__header">
                    <div>
                      <span className="eyebrow">{copy.contact}</span>
                      {renderPortfolioSectionTitle(copy.contact, "contact")}
                      <p className="section-copy">{copy.contactIntro}</p>
                    </div>
                  </div>

                  <nav className="portfolio-contact-grid" aria-label={copy.contact}>
                    {member.email ? (
                      <a
                        className="portfolio-contact-link"
                        href={`mailto:${member.email}`}
                        aria-label={`${chrome.email}: ${member.email}`}
                        title={`${chrome.email}: ${member.email}`}
                      >
                        <span className="portfolio-contact-link__icon" aria-hidden="true"><PortfolioIcon name="email" /></span>
                        <span className="portfolio-contact-link__label">{chrome.email}</span>
                      </a>
                    ) : null}
                    {member.phone ? (
                      <a
                        className="portfolio-contact-link"
                        href={`tel:${member.phone}`}
                        aria-label={`${chrome.phone}: ${member.phone}`}
                        title={`${chrome.phone}: ${member.phone}`}
                      >
                        <span className="portfolio-contact-link__icon" aria-hidden="true"><PortfolioIcon name="phone" /></span>
                        <span className="portfolio-contact-link__label">{chrome.phone}</span>
                      </a>
                    ) : null}
                    {member.website ? (
                      <a
                        className="portfolio-contact-link"
                        href={getExternalHref(member.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${chrome.website}: ${formatPortfolioLinkValue(member.website)}`}
                        title={`${chrome.website}: ${formatPortfolioLinkValue(member.website)}`}
                      >
                        <span className="portfolio-contact-link__icon" aria-hidden="true"><PortfolioIcon name="website" /></span>
                        <span className="portfolio-contact-link__label">{chrome.website}</span>
                      </a>
                    ) : null}
                    {member.location && member.locationUrl ? (
                      <a
                        className="portfolio-contact-link"
                        href={getExternalHref(member.locationUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${chrome.location}: ${member.location}`}
                        title={`${chrome.location}: ${member.location}`}
                      >
                        <span className="portfolio-contact-link__icon" aria-hidden="true"><PortfolioIcon name="location" /></span>
                        <span className="portfolio-contact-link__label">{chrome.location}</span>
                      </a>
                    ) : null}
                    {member.socialLinks.map((social) => {
                      const channel = getSocialChannel(social.platform, social.url);
                      const displayValue = formatPortfolioLinkValue(social.url);

                      return (
                        <a
                          key={`${social.platform}-${social.url}`}
                          className="portfolio-contact-link"
                          href={getExternalHref(social.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${channel}: ${displayValue}`}
                          title={`${channel}: ${displayValue}`}
                        >
                          <span className="portfolio-contact-link__icon" aria-hidden="true"><PortfolioIcon name={getSocialIcon(social.platform, social.url)} /></span>
                          <span className="portfolio-contact-link__label">{channel}</span>
                        </a>
                      );
                    })}
                  </nav>

                  {member.cvUrl ? (
                    <div className="portfolio-contact__actions">
                      <a className="button-primary" href={member.cvUrl} target="_blank" rel="noopener noreferrer">
                        {chrome.downloadCv}
                      </a>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
