import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortfolioIcon, type PortfolioIconName } from "@/components/portfolio-icon";
import { PortfolioTimeline } from "@/components/portfolio-timeline";
import { NewspaperSheet, ProfileMasthead, EditorialSelection, NewspaperFilm, type EditorialWork } from "@/components/profile-newspaper";
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
import { getAuthorLabel } from "@/lib/content";
import { fetchDocumentaryArchive, getDocumentaryUiCopy, type DocumentaryItem } from "@/lib/documentaries";
import { getDictionary, getSectionLabel, resolveLang, withLang, withLangPrefix, type Lang } from "@/lib/i18n";
import { getPeopleShareImage } from "@/lib/people-share-image";
import { formatPortfolioCount } from "@/lib/portfolio-counts";
import { getCanonicalPortfolioDocumentaries } from "@/lib/portfolio-documentaries";
import { getRichTextHtml } from "@/lib/richtext";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { formatDisplayDate } from "@/lib/strapi";
import { getYouTubeEmbedUrl } from "@/lib/video";
import styles from "@/components/profile-newspaper.module.css";

type PortfolioArticleCard = {
  id: number | string;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
  coverUrl?: string;
  coverAlt?: string;
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
  if (/^(?:\/(?!\/)|#|\?|mailto:|tel:)/i.test(trimmed)) return trimmed;
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

function buildPortfolioArticles(member: TeamMember): PortfolioArticleCard[] {
  return sortByPublishedDate(
    member.relatedArticles.map((article) => ({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      slug: article.slug,
      section: article.section,
      publishedAt: article.publishedAt,
      authors: article.authors,
      coverUrl: article.coverUrl,
      coverAlt: article.coverAlt,
    }))
  );
}

function buildPortfolioDocumentaries(member: TeamMember, documentaries: DocumentaryItem[], lang: Lang): PortfolioDocumentaryCard[] {
  return getCanonicalPortfolioDocumentaries(member.relatedDocumentaries, documentaries).map((documentary) => ({
    ...documentary,
    href: documentary.externalUrl || withLang("/dokumentarci", lang),
    embedUrl: documentary.embedUrl || getYouTubeEmbedUrl(documentary.youtubeUrl, "documentary", { autoplay: true }),
  }));
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

function renderEntryCard(entry: PortfolioEntry, ctaLabel: string, label?: string) {
  return <article key={`${entry.title}-${entry.period || entry.organisation || entry.url || ""}`} className={styles.entry}>
    {label ? <span className={styles.sectionKicker}>{label}</span> : null}
    <h3>{entry.title}</h3>
    {entry.subtitle ? <p>{entry.subtitle}</p> : null}
    {entry.organisation || entry.location || entry.period ? <p className={styles.entryMeta}>{[entry.organisation, entry.location, entry.period].filter(Boolean).join(" · ")}</p> : null}
    {entry.description ? <p>{entry.description}</p> : null}
    {entry.url ? <a className={styles.entryLink} href={getExternalHref(entry.url)} target="_blank" rel="noopener noreferrer">{ctaLabel} <span aria-hidden="true">↗</span></a> : null}
  </article>;
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

  const shareImage = getPeopleShareImage(member.portraitUrl, member.fullName, lang);

  return buildSeoMetadata({
    lang,
    pathname: `/people/${params.slug}`,
    title: buildPageTitle(member.fullName),
    description: member.shortBio,
    image: shareImage.url,
    imageDetails: shareImage,
  });
}

export default async function PersonPortfolioPage({ params, searchParams }: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const chrome = getPeopleChrome(lang);
  const copy = portfolioCopyByLang[lang];
  const documentaryUiCopy = getDocumentaryUiCopy(lang);
  const [member, documentaries] = await Promise.all([fetchTeamMemberBySlug(params.slug, lang), fetchDocumentaryArchive(lang, true)]);
  if (!member || !member.portfolioEnabled || !member.isActive) notFound();

  const articleCards = buildPortfolioArticles(member);
  const documentaryCards = buildPortfolioDocumentaries(member, documentaries, lang);
  const timelineItems = buildPortfolioTimeline(member);
  const selectedWorkGroups = buildSelectedWorkGroups(member, chrome);
  const narrativeHtml = member.longBio ? getRichTextHtml(member.longBio, { lang, articleTitle: member.fullName }) : "";
  const hasBiography = Boolean(narrativeHtml || member.quote);
  const hasContactSection = Boolean(member.email || member.phone || member.website || member.socialLinks.length || member.cvUrl || (member.location && member.locationUrl));
  const hasWork = Boolean(member.focusAreas.length || member.skills.length);
  const historyGroups = [{ label: chrome.education, entries: member.education }, { label: chrome.experience, entries: member.experience }].filter(group => group.entries.length);
  const sections = [
    ...(hasBiography ? [{ id: "starting-point", label: copy.startingPoint }] : []),
    ...(hasWork ? [{ id: "work", label: copy.work }] : []),
    ...(member.projects.length ? [{ id: "projects", label: copy.projects }] : []),
    ...(articleCards.length ? [{ id: "articles", label: copy.articles }] : []),
    ...(documentaryCards.length ? [{ id: "documentaries", label: copy.documentaries }] : []),
    ...(timelineItems.length || historyGroups.length ? [{ id: "timeline", label: copy.timeline }] : []),
    ...(selectedWorkGroups.length ? [{ id: "selected-work", label: copy.selectedWork }] : []),
    ...(member.customSections.length ? [{ id: "field-notes", label: copy.fieldNotes }] : []),
    ...(hasContactSection ? [{ id: "contact", label: copy.contact }] : []),
  ];
  const selectionSources: EditorialWork[][] = [
    [
    ...documentaryCards.map((item) => ({ id: `documentary-${item.id}`, title: item.title, kind: copy.documentaries, href: "#documentaries", image: item.thumbnailUrl || undefined, description: item.description })),
    ], [
    ...member.projects.map((item, index) => ({ id: `project-${index}`, title: item.title, kind: copy.projects, href: item.url ? getExternalHref(item.url) : "#projects", description: item.description || item.subtitle, external: Boolean(item.url) })),
    ], [
    ...articleCards.slice(0, 4).map((item) => ({ id: `article-${item.id}`, title: item.title, kind: copy.articles, href: withLang(`/a/${item.slug}`, lang), image: item.coverUrl, imageAlt: item.coverAlt, description: item.subtitle })),
    ],
  ];
  const selection = Array.from({ length: Math.max(...selectionSources.map(group => group.length)) }, (_, index) => selectionSources.flatMap(group => group[index] ? [group[index]] : [])).flat();
  const heading = (label: string) => <h2 className={styles.sectionHeading}>{label}</h2>;
  const contacts = [
    ...(member.email ? [{ label: chrome.email, value: member.email, href: `mailto:${member.email}`, external: false }] : []),
    ...(member.phone ? [{ label: chrome.phone, value: member.phone, href: `tel:${member.phone}`, external: false }] : []),
    ...(member.website ? [{ label: chrome.website, value: formatPortfolioLinkValue(member.website), href: getExternalHref(member.website), external: true }] : []),
    ...(member.location && member.locationUrl ? [{ label: chrome.location, value: member.location, href: getExternalHref(member.locationUrl), external: true }] : []),
    ...member.socialLinks.map(social => ({ label: getSocialChannel(social.platform, social.url), value: formatPortfolioLinkValue(social.url), href: getExternalHref(social.url), external: true })),
  ];

  return <>
    <SiteHeader lang={lang} currentPath={`/people/${params.slug}`} activeNav="about" />
    <main className="site-main">
      <NewspaperSheet lang={lang}>
        <a className={styles.backLink} href={withLangPrefix("/o-nama#ljudi", lang)}>{chrome.backToAbout}</a>
        <ProfileMasthead name={member.fullName} role={member.role} portraitUrl={member.portraitUrl} label={copy.label}>
          <p className={styles.lead}>{member.shortBio}</p>
          {member.isFounder || member.isFeatured || member.location || member.languages.length ? <div className={styles.metadata}>
            {member.isFounder ? <span>{copy.founder}</span> : null}
            {member.isFeatured ? <span>{copy.featured}</span> : null}
            {member.location ? <span>{copy.basedIn} · {member.location}</span> : null}
            {member.languages.length ? <span>{chrome.languages} · {member.languages.map(item => item.label).join(" / ")}</span> : null}
          </div> : null}
          <div className={styles.stats}>
            {member.projects.length ? <a href="#projects">{formatPortfolioCount(member.projects.length, "projects", lang)}</a> : null}
            {articleCards.length ? <a href="#articles">{member.publishedArticleCount === null ? copy.articles : formatPortfolioCount(member.publishedArticleCount, "articles", lang)}</a> : member.publishedArticleCount !== null ? <span>{formatPortfolioCount(member.publishedArticleCount, "articles", lang)}</span> : null}
            {documentaryCards.length ? <a href="#documentaries">{formatPortfolioCount(documentaryCards.length, "documentaries", lang)}</a> : null}
          </div>
          {(member.cvUrl || hasContactSection) ? <div className={styles.actions}>
            {member.cvUrl ? <a href={member.cvUrl} target="_blank" rel="noopener noreferrer">{chrome.downloadCv} <span aria-hidden="true">↗</span></a> : null}
            {hasContactSection ? <a href="#contact">{copy.contact} <span aria-hidden="true">↙</span></a> : null}
          </div> : null}
        </ProfileMasthead>
        <EditorialSelection items={selection} label={copy.selectedWork} previous={chrome.previous} next={chrome.next} lang={lang} />
        {sections.length ? <nav className={styles.localNav} aria-label={copy.label}>{sections.map((section,index) => <a className={styles.navLink} key={section.id} href={`#${section.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> {section.label}</a>)}</nav> : null}

        {hasBiography ? <section id="starting-point" className={styles.section} data-paper-reveal>
          {heading(copy.startingPoint)}
          {member.quote ? <blockquote className={styles.quote}>{member.quote}</blockquote> : null}
          {narrativeHtml ? <div className={styles.biography} dangerouslySetInnerHTML={{ __html: narrativeHtml }} /> : null}
        </section> : null}

        {hasWork ? <section id="work" className={styles.section} data-paper-reveal>
          {heading(copy.work)}
          {member.focusAreas.length ? <div className={styles.focusGrid}>{member.focusAreas.map((item,index) => <article key={`${item.title}-${index}`} className={styles.focusItem}><h3>{item.title}</h3>{item.body ? <p>{item.body}</p> : null}</article>)}</div> : null}
          {member.skills.length ? <div className={styles.skills}><h3>{chrome.skills}</h3><ul>{member.skills.map((item,index) => <li key={`${item.label}-${index}`}>{item.label}</li>)}</ul></div> : null}
        </section> : null}

        {member.projects.length ? <section id="projects" className={styles.section} data-paper-reveal>{heading(copy.projects)}<div className={styles.entryGrid}>{member.projects.map(entry => renderEntryCard(entry,copy.openProject))}</div></section> : null}

        {articleCards.length ? <section id="articles" className={styles.section} data-paper-reveal>
          {heading(copy.articles)}
          <div className={styles.articleList}>{articleCards.map((article,index) => <a key={article.id} href={withLang(`/a/${article.slug}`,lang)} className={styles.articleRow}>
            {article.coverUrl ? <img className={styles.articleImage} src={article.coverUrl} alt={article.coverAlt || ""} loading="lazy" decoding="async" /> : null}
            <div><div className={styles.articleMeta}><span>{String(index+1).padStart(2,"0")}</span>{article.section ? <span>{getSectionLabel(article.section,lang)}</span> : null}{article.publishedAt ? <time dateTime={article.publishedAt}>{formatDisplayDate(article.publishedAt,lang)}</time> : null}{getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}</div>
              <h3 className={styles.articleTitle}>{article.title}</h3>{article.subtitle ? <p className={styles.articleSubtitle}>{article.subtitle}</p> : null}<span className={styles.entryLink}>{copy.readMore} <span aria-hidden="true">↗</span></span>
            </div>
          </a>)}</div>
          {member.confirmedAuthorSlugs.length ? <nav className={styles.actions} aria-label={copy.viewAllArticles}>{member.confirmedAuthorSlugs.map(slug => <a key={slug} href={withLang(`/archive?author=${encodeURIComponent(slug)}`,lang)}>{copy.viewAllArticles}{member.confirmedAuthorSlugs.length > 1 ? ` · ${slug}` : ""} ↗</a>)}</nav> : null}
        </section> : null}

        {documentaryCards.length ? <section id="documentaries" className={`${styles.section} ${styles.documentary}`} data-paper-reveal>
          {heading(copy.documentaries)}
          <div className={styles.documentaryGrid}>{documentaryCards.map(documentary => <NewspaperFilm key={documentary.id} title={documentary.title} description={documentary.description} embedUrl={documentary.embedUrl} image={documentary.thumbnailUrl} watchHref={documentary.externalUrl || documentary.youtubeUrl || documentary.embedUrl} watchLabel={documentaryUiCopy.watchLabel} archiveHref={withLang("/dokumentarci",lang)} archiveLabel={documentaryUiCopy.archiveLabel} details={[
            ...(documentary.date ? [{label:documentaryUiCopy.dateLabel,value:formatDisplayDate(documentary.date,lang)}] : []),
            ...(documentary.location ? [{label:documentaryUiCopy.locationLabel,value:documentary.location}] : []),
            ...(documentary.director ? [{label:documentaryUiCopy.directorLabel,value:documentary.director}] : []),
            ...(documentary.duration ? [{label:documentaryUiCopy.durationLabel,value:documentary.duration}] : []),
          ]} />)}</div>
        </section> : null}

        {timelineItems.length || historyGroups.length ? <section id="timeline" className={styles.section} data-paper-reveal>
          {heading(copy.timeline)}
          {timelineItems.length ? <PortfolioTimeline>{timelineItems.map((item,index) => <li key={`${item.year}-${item.title}-${index}`} data-category={item.type} className={`portfolio-timeline__item portfolio-timeline__item--${item.type}`}>
            <div className="portfolio-timeline__marker"><span className="portfolio-timeline__dot" aria-hidden="true"><PortfolioIcon name={getTimelineIcon(item.type)} /></span><span className="portfolio-timeline__year">{item.year}</span></div>
            <article className="portfolio-timeline__card"><span className="portfolio-timeline__type"><PortfolioIcon name={getTimelineIcon(item.type)} /> {timelineTypeLabelsByLang[lang][item.type]}</span><h3>{item.title}</h3>{item.location ? <p className="portfolio-timeline__location">{item.location}</p> : null}{item.description ? <p>{item.description}</p> : null}</article>
          </li>)}</PortfolioTimeline> : null}
          {historyGroups.map(group => <div key={group.label} className={styles.section}><h3>{group.label}</h3><div className={styles.entryGrid}>{group.entries.map(entry => renderEntryCard(entry,copy.readMore))}</div></div>)}
        </section> : null}

        {selectedWorkGroups.length ? <section id="selected-work" className={styles.section} data-paper-reveal>{heading(copy.selectedWork)}<div className={styles.selectedGrid}>{selectedWorkGroups.flatMap(group => group.entries.map(entry => renderEntryCard(entry,copy.readMore,group.label)))}</div></section> : null}
        {member.customSections.length ? <section id="field-notes" className={styles.section} data-paper-reveal>{heading(copy.fieldNotes)}<div className={styles.notesGrid}>{member.customSections.map((note,index) => <article key={`${note.title}-${index}`} className={styles.note}><h3>{note.title}</h3>{note.body ? <p>{note.body}</p> : null}</article>)}</div></section> : null}

        {hasContactSection ? <section id="contact" className={`${styles.section} ${styles.contact}`}>
          {heading(copy.contact)}
          <nav className={styles.contactGrid} aria-label={copy.contact}>{contacts.map((contact,index) => <a key={`${contact.href}-${index}`} className={styles.contactLink} href={contact.href} {...(contact.external ? {target:"_blank",rel:"noopener noreferrer"} : {})}><span>{contact.label} <span aria-hidden="true">↗</span></span><span className={styles.contactValue}>{contact.value}</span></a>)}</nav>
          {member.cvUrl ? <div className={styles.actions}><a href={member.cvUrl} target="_blank" rel="noopener noreferrer">{chrome.downloadCv} <span aria-hidden="true">↗</span></a></div> : null}
        </section> : null}
        <div className={styles.footerRule}><span>AVANGARDA</span><a href={withLangPrefix("/o-nama#ljudi",lang)}>{chrome.backToAbout}</a></div>
      </NewspaperSheet>
    </main>
    <SiteFooter lang={lang} t={t} />
  </>;
}
