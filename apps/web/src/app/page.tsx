import { HomeHeroShowcase } from "@/components/home-hero-showcase";
import { LiveSignalStrip } from "@/components/live-signal-strip";
import { HomepageSidebar } from "@/components/homepage-sidebar";
import { AirQualityCard } from "@/components/air-quality-card";
import { DailyQuestionCard } from "@/components/daily-question-card";
import { EditorialSignalCard, type EditorialSignalCardData } from "@/components/editorial-signal-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TopicStrip } from "@/components/topic-strip";
import { getAuthorLabel, localizeArticle, localizeDailyQuestion, localizeEditorialSignal, localizeHomepageEditorialCard, localizeTopic } from "@/lib/content";
import { compareEditorialArticles, fetchHomepageImpactMetrics, getEditorialBadges, hasEditorialSignal } from "@/lib/editorial";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { formatDisplayDate, getStrapiMediaUrl, strapiGet, unwrapStrapiCollection, unwrapStrapiSingle } from "@/lib/strapi";
import { getYouTubeEmbedUrl } from "@/lib/video";

type Article = {
  id: number;
  title: string;
  subtitle?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  slug: string;
  section: string;
  publishedAt: string;
  focus?: string;
  style?: string;
  viewCount?: number;
  signalText?: string;
  signalText_en?: string;
  signalText_tr?: string;
  signalText_fr?: string;
  signalText_de?: string;
  editorialControl?: unknown;
  videoEmbedUrl?: string;
  authors?: unknown;
  topics?: unknown;
  cover?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
    };
  };
};

type AuthorRef = {
  id: number;
  name: string;
  slug: string;
};

type TopicRef = {
  id: number;
  name: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  slug: string;
};

type HomepageSidebarItem = {
  id?: number;
  title?: string;
  shortDescription?: string;
  link?: string;
  image?: unknown;
};

type HomepageEditorialCard = {
  id?: number;
  label?: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  text?: string;
  text_en?: string;
  text_tr?: string;
  text_fr?: string;
  text_de?: string;
  ctaLabel?: string;
  ctaLabel_en?: string;
  ctaLabel_tr?: string;
  ctaLabel_fr?: string;
  ctaLabel_de?: string;
  ctaHref?: string;
};

type HomepageConfig = {
  currentItems?: HomepageSidebarItem[];
  editorialCards?: HomepageEditorialCard[];
};

type EditorialSignalRecord = {
  label?: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
  text?: string;
  text_en?: string;
  text_tr?: string;
  text_fr?: string;
  text_de?: string;
  author?: string;
  author_en?: string;
  author_tr?: string;
  author_fr?: string;
  author_de?: string;
  type?: "quote" | "statement" | "question" | "manifesto";
  source?: string;
  source_en?: string;
  source_tr?: string;
  source_fr?: string;
  source_de?: string;
  ctaLabel?: string;
  ctaLabel_en?: string;
  ctaLabel_tr?: string;
  ctaLabel_fr?: string;
  ctaLabel_de?: string;
  isActive?: boolean;
  priority?: number;
  backgroundMode?: "yellow" | "dark" | "outline";
  updatedNote?: string;
  linkedArticle?: unknown;
};

type DailyQuestionRecord = {
  id?: number;
  label?: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
  question?: string;
  question_en?: string;
  question_tr?: string;
  question_fr?: string;
  question_de?: string;
  answerA?: string;
  answerA_en?: string;
  answerA_tr?: string;
  answerA_fr?: string;
  answerA_de?: string;
  answerB?: string;
  answerB_en?: string;
  answerB_tr?: string;
  answerB_fr?: string;
  answerB_de?: string;
  votesA?: number;
  votesB?: number;
  percentA?: number;
  percentB?: number;
  totalVotes?: number;
  isActive?: boolean;
  ctaLabel?: string;
  ctaLabel_en?: string;
  ctaLabel_tr?: string;
  ctaLabel_fr?: string;
  ctaLabel_de?: string;
  author?: string;
  author_en?: string;
  author_tr?: string;
  author_fr?: string;
  author_de?: string;
  source?: string;
  source_en?: string;
  source_tr?: string;
  source_fr?: string;
  source_de?: string;
  linkedArticle?: unknown;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function buildAuthorRail(articles: Article[]) {
  const authors = new Map<string, { name: string; slug: string; initials: string; posts: { id: number; title: string; slug: string }[] }>();

  for (const article of articles) {
    const articleAuthors = unwrapStrapiCollection<AuthorRef>(article.authors);

    for (const author of articleAuthors) {
      if (!author.slug || !author.name) continue;

      const existing = authors.get(author.slug) ?? {
        name: author.name,
        slug: author.slug,
        initials: getInitials(author.name),
        posts: []
      };

      if (!existing.posts.some((post) => post.id === article.id)) {
        existing.posts.push({ id: article.id, title: article.title, slug: article.slug });
      }

      authors.set(author.slug, existing);
    }
  }

  return Array.from(authors.values())
    .filter((author) => author.posts.length)
    .slice(0, 3);
}

function buildThemeRail(articles: Article[], lang: ReturnType<typeof resolveLang>) {
  const themes = new Map<string, { slug: string; title: string; href: string; posts: { id: number; title: string; slug: string }[] }>();

  for (const article of articles) {
    const articleTopics = unwrapStrapiCollection<TopicRef>(article.topics);

    for (const topic of articleTopics) {
      const localizedTopic = localizeTopic(topic, lang);
      if (!localizedTopic.slug || !localizedTopic.name) continue;

      const existing = themes.get(localizedTopic.slug) ?? {
        slug: localizedTopic.slug,
        title: localizedTopic.name,
        href: withLang(`/topic/${localizedTopic.slug}`, lang),
        posts: []
      };

      if (!existing.posts.some((post) => post.id === article.id)) {
        existing.posts.push({ id: article.id, title: article.title, slug: article.slug });
      }

      themes.set(localizedTopic.slug, existing);
    }
  }

  if (themes.size) {
    return Array.from(themes.values())
      .filter((theme) => theme.posts.length)
      .slice(0, 4);
  }

  const fallback = new Map<string, { slug: string; title: string; href: string; posts: { id: number; title: string; slug: string }[] }>();

  for (const article of articles) {
    const key = article.section || "news";
    const existing = fallback.get(key) ?? {
      slug: key,
      title: getSectionLabel(key, lang),
      href: withLang(`/section/${key}`, lang),
      posts: []
    };

    if (!existing.posts.some((post) => post.id === article.id)) {
      existing.posts.push({ id: article.id, title: article.title, slug: article.slug });
    }

    fallback.set(key, existing);
  }

  return Array.from(fallback.values())
    .filter((theme) => theme.posts.length)
    .slice(0, 4);
}

function mergeUniqueArticles(primary: Article[], fallback: Article[], limit: number) {
  const merged = new Map<number, Article>();

  for (const article of [...primary, ...fallback]) {
    if (!article?.id || merged.has(article.id)) continue;
    merged.set(article.id, article);
    if (merged.size >= limit) break;
  }

  return Array.from(merged.values());
}

function getTopicStripFallbackHeadline(lang: ReturnType<typeof resolveLang>) {
  return lang === "en"
    ? "Open the topic"
    : lang === "tr"
      ? "Temayi ac"
      : lang === "fr"
        ? "Ouvrir le theme"
        : lang === "de"
          ? "Thema oeffnen"
          : "Otvori temu";
}

function getDefaultHomepageEditorialCards(lang: ReturnType<typeof resolveLang>) {
  if (lang === "en") {
    return [
      {
        label: "WHAT WE DO NOT PUBLISH",
        title: "WE DO NOT PUBLISH EVERYTHING.",
        text: "We do not chase speed at any cost. If a story has no context, it stays off the site. Silence is sometimes better than bad information."
      },
      {
        label: "HOW TO READ",
        title: "THIS IS NOT SCROLLING. THIS IS READING.",
        text: "This site was not built for a quick pass. If you stay longer than a minute, you have already entered the story."
      },
      {
        label: "RESPONSIBILITY",
        title: "IT IS NOT ONLY ON US.",
        text: "If you see the problem and move on, you become part of it. This site does not ask only for attention, but for a position."
      }
    ];
  }

  if (lang === "tr") {
    return [
      {
        label: "NEYI YAYINLAMIYORUZ",
        title: "HER ŞEYI YAYINLAMIYORUZ.",
        text: "Her ne pahasına olursa olsun hızın peşine düşmüyoruz. Bir hikâyenin bağlamı yoksa siteye girmiyor. Bazen sessizlik kötü bilgiden iyidir."
      },
      {
        label: "NASIL OKUNUR",
        title: "BU BIR KAYDIRMA DEĞIL, OKUMADIR.",
        text: "Bu site hızlı geçişler için yapılmadı. Bir dakikadan uzun kalırsan, hikâyenin içindesin demektir."
      },
      {
        label: "SORUMLULUK",
        title: "BU SADECE BIZE BAĞLI DEĞIL.",
        text: "Sorunu görüp yoluna devam edersen onun bir parçası olursun. Bu site yalnızca dikkat değil, tavır da ister."
      }
    ];
  }

  if (lang === "fr") {
    return [
      {
        label: "CE QUE NOUS NE PUBLIIONS PAS",
        title: "NOUS NE PUBLIIONS PAS TOUT.",
        text: "Nous ne poursuivons pas la vitesse à tout prix. Si une histoire n'a pas de contexte, elle reste hors du site. Le silence vaut parfois mieux qu'une mauvaise information."
      },
      {
        label: "COMMENT LIRE",
        title: "CE N'EST PAS DU SCROLL, C'EST DE LA LECTURE.",
        text: "Ce site n'a pas été conçu pour un passage rapide. Si tu restes plus d'une minute, tu es déjà entré dans l'histoire."
      },
      {
        label: "RESPONSABILITÉ",
        title: "CE N'EST PAS QU'UNE AFFAIRE DE NOUS.",
        text: "Si tu vois le problème et que tu passes ton chemin, tu en deviens une part. Ce site ne demande pas seulement de l'attention, mais une position."
      }
    ];
  }

  if (lang === "de") {
    return [
      {
        label: "WAS WIR NICHT VERÖFFENTLICHEN",
        title: "WIR VERÖFFENTLICHEN NICHT ALLES.",
        text: "Wir jagen nicht um jeden Preis der Geschwindigkeit nach. Wenn einer Geschichte der Kontext fehlt, bleibt sie draußen. Schweigen ist manchmal besser als schlechte Information."
      },
      {
        label: "WIE MAN LIEST",
        title: "DAS IST KEIN SCROLLEN. DAS IST LESEN.",
        text: "Diese Seite ist nicht für einen schnellen Durchlauf gemacht. Wenn du länger als eine Minute bleibst, bist du schon in der Geschichte."
      },
      {
        label: "VERANTWORTUNG",
        title: "ES LIEGT NICHT NUR AN UNS.",
        text: "Wenn du das Problem siehst und weitergehst, wirst du Teil davon. Diese Seite fordert nicht nur Aufmerksamkeit, sondern Haltung."
      }
    ];
  }

  return [
    {
      label: "ŠTA NE OBJAVLJUJEMO",
      title: "NE OBJAVLJUJEMO SVE.",
      text: "Ne jurimo brzinu po svaku cenu. Ako priča nema kontekst, ostaje van sajta. Tišina je nekad bolja od loše informacije."
    },
    {
      label: "KAKO ČITATI",
      title: "OVO NIJE SCROLL, OVO JE ČITANJE.",
      text: "Ovaj sajt nije pravljen za brz prolaz. Ako ostaneš duže od jednog minuta, već si ušao u priču."
    },
    {
      label: "ODGOVORNOST",
      title: "NIJE SAMO DO NAS.",
      text: "Ako vidiš problem i nastaviš dalje, postaješ deo njega. Ovaj sajt ne traži samo pažnju, nego stav."
    }
  ];
}

function resolveEditorialCardHref(href: string | undefined, lang: ReturnType<typeof resolveLang>) {
  if (!href?.trim()) return "";
  const value = href.trim();
  return value.startsWith("/") ? withLang(value, lang) : value;
}

export default async function HomePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const topicStripFallbackHeadline = getTopicStripFallbackHeadline(lang);
  const statsLocale =
    lang === "en" ? "en-GB" :
    lang === "tr" ? "tr-TR" :
    lang === "fr" ? "fr-FR" :
    lang === "de" ? "de-DE" :
    "sr-Latn-RS";
  const formatStat = (value: number) => new Intl.NumberFormat(statsLocale, { maximumFractionDigits: 0 }).format(value);

  const [latest, topicsRes, homepageConfigRes, dailyQuestionRes, editorialSignalRes, topReadRes, impactMetrics] =
    await Promise.all([
      strapiGet<{ data: unknown[] }>(
        "/api/articles?populate=authors,cover,topics,editorialControl&sort=publishedAt:desc&pagination[pageSize]=12"
      ),
      strapiGet<{ data: unknown[] }>(
        "/api/topics?sort=name:asc&pagination[pageSize]=24"
      ),
      strapiGet<{ data: unknown }>(
        "/api/homepage-config?populate[currentItems][populate]=image"
      ),
      strapiGet<{ data: unknown }>(
        "/api/daily-question"
      ),
      strapiGet<{ data: unknown }>(
        "/api/editorial-signal"
      ),
      strapiGet<{ data: unknown[] }>(
        "/api/articles?filters[viewCount][$gt]=0&populate=authors,cover&sort[0]=viewCount:desc&sort[1]=publishedAt:desc&pagination[pageSize]=4"
      ),
      fetchHomepageImpactMetrics()
    ]);

  const homepageConfig = unwrapStrapiSingle<HomepageConfig>(homepageConfigRes);
  const rawDailyQuestion = unwrapStrapiSingle<DailyQuestionRecord>(dailyQuestionRes);
  const localizedDailyQuestion = rawDailyQuestion ? localizeDailyQuestion(rawDailyQuestion, lang) : null;
  const rawEditorialSignal = unwrapStrapiSingle<EditorialSignalRecord>(editorialSignalRes);
  const localizedEditorialSignal = rawEditorialSignal ? localizeEditorialSignal(rawEditorialSignal, lang) : null;
  const cmsTopics = unwrapStrapiCollection<TopicRef>(topicsRes?.data).map((topic) => localizeTopic(topic, lang));
  const latestItems = unwrapStrapiCollection<Article>(latest?.data).map((item) => localizeArticle(item, lang));
  const topReadArticles = unwrapStrapiCollection<Article>(topReadRes?.data).map((item) => localizeArticle(item, lang));
  const linkedSignalArticleRecord = rawEditorialSignal?.linkedArticle
    ? unwrapStrapiSingle<Article>(rawEditorialSignal.linkedArticle)
    : null;
  const linkedSignalArticle = linkedSignalArticleRecord
    ? localizeArticle(linkedSignalArticleRecord, lang)
    : null;
  const linkedDailyQuestionArticleRecord = rawDailyQuestion?.linkedArticle
    ? unwrapStrapiSingle<Article>(rawDailyQuestion.linkedArticle)
    : null;
  const linkedDailyQuestionArticle = linkedDailyQuestionArticleRecord
    ? localizeArticle(linkedDailyQuestionArticleRecord, lang)
    : null;
  const heroSourceItems = latestItems.some((item) => hasEditorialSignal(item))
    ? [...latestItems].sort(compareEditorialArticles)
    : latestItems;
  const hero = heroSourceItems[0] || null;
  const heroSlides = heroSourceItems.slice(0, 5).map((item) => ({
    id: item.id,
    href: withLang(`/a/${item.slug}`, lang),
    title: item.title,
    subtitle: item.subtitle,
    sectionLabel: getSectionLabel(item.section ?? "", lang),
    publishedLabel: formatDisplayDate(item.publishedAt, lang),
    styleLabel: item.style || t.heroStyleValue,
    focusLabel: item.focus || getSectionLabel(item.section ?? "", lang),
    imageUrl: item.cover?.url
      ? getStrapiMediaUrl(item.cover.formats?.large?.url || item.cover.formats?.medium?.url || item.cover.url)
      : "",
    videoUrl: getYouTubeEmbedUrl(item.videoEmbedUrl, "hero"),
    badges: getEditorialBadges(item, lang)
  }));
  const latestStories = latestItems.slice(0, 3);
  const latestLead = latestStories[0] || null;
  const latestLeadBadges = latestLead ? getEditorialBadges(latestLead, lang) : [];
  const latestSideStories = latestStories.slice(1, 3);
  const supportingItems = latestItems.slice(3);
  const authorRail = buildAuthorRail(latestItems);
  const themeRail = buildThemeRail(latestItems, lang);
  const sectionSet = Array.from(new Set(latestItems.map((item) => item.section).filter(Boolean))).slice(0, 4);
  const signalItems = [...latestItems]
    .sort(compareEditorialArticles)
    .slice(0, 6)
    .map((article) => {
      const badges = getEditorialBadges(article, lang);
      const primaryBadge = badges[0];
      const fallbackSignal = article.focus?.trim() || article.subtitle?.trim() || article.title;

      return {
        id: article.id,
        href: withLang(`/a/${article.slug}`, lang),
        label: primaryBadge?.label || getSectionLabel(article.section ?? "", lang),
        text: (article.signalText?.trim() || fallbackSignal).trim(),
        tone: (primaryBadge?.key || null) as "breaking" | "featured" | "trending" | null
      };
    })
    .filter((item) => item.text);
  const currentItems = homepageConfig?.currentItems?.length
    ? homepageConfig.currentItems
    : latestItems.slice(0, 3).map((article) => {
        return {
          id: article.id,
          title: article.title,
          shortDescription: article.focus || article.subtitle || getSectionLabel(article.section, lang),
          link: `/a/${article.slug}`,
        };
      });
  const mostReadSource = mergeUniqueArticles(topReadArticles, latestItems, 4);
  const mostReadItems = mostReadSource.map((article) => {
    return {
      id: article.id,
      title: article.title,
      shortDescription: article.subtitle || getAuthorLabel(article.authors) || formatDisplayDate(article.publishedAt, lang),
      link: `/a/${article.slug}`,
      image: article.cover,
    };
  });
  const hasSidebarContent = Boolean(
    currentItems.length ||
    mostReadItems.length ||
    authorRail.length
  );
  const themeLookup = new Map(themeRail.map((theme) => [theme.slug, theme]));
  const topicStripItems = cmsTopics.length
    ? cmsTopics
        .filter((topic) => topic.slug && topic.name)
        .map((topic) => ({
          id: topic.id,
          label: topic.name,
          href: withLang(`/topic/${topic.slug}`, lang),
          headline: themeLookup.get(topic.slug)?.posts[0]?.title || topicStripFallbackHeadline
        }))
    : themeRail.length
      ? themeRail.map((theme) => ({
          id: theme.slug,
          label: theme.title,
          href: theme.href,
          headline: theme.posts[0]?.title || topicStripFallbackHeadline
        }))
    : sectionSet.length
      ? sectionSet.map((section) => ({
          id: section,
          label: getSectionLabel(section, lang),
          href: withLang(`/section/${section}`, lang),
          headline: latestItems.find((item) => item.section === section)?.title || topicStripFallbackHeadline
        }))
      : ["news", "analysis", "interview", "column"].map((section) => ({
          id: section,
          label: getSectionLabel(section, lang),
          href: withLang(`/section/${section}`, lang),
          headline: latestItems.find((item) => item.section === section)?.title || topicStripFallbackHeadline
        }));

  const authorLabel =
    lang === "en" ? "Authors" :
    lang === "tr" ? "Yazarlar" :
    lang === "fr" ? "Auteurs" :
    lang === "de" ? "Autoren" :
    "Autori";

  const themesLabel =
    lang === "en" ? "Themes" :
    lang === "tr" ? "Temalar" :
    lang === "fr" ? "Themes" :
    lang === "de" ? "Themen" :
    "Teme";
  const currentLabel =
    lang === "en" ? "Now" :
    lang === "tr" ? "Simdi" :
    lang === "fr" ? "Direct" :
    lang === "de" ? "Jetzt" :
    "Sada";
  const mostReadLabel =
    lang === "en" ? "Most read" :
    lang === "tr" ? "En cok okunan" :
    lang === "fr" ? "Les plus lus" :
    lang === "de" ? "Meistgelesen" :
    "Najcitanije";
  const topicStripAriaLabel =
    lang === "en" ? "Theme navigation" :
    lang === "tr" ? "Tema gezintisi" :
    lang === "fr" ? "Navigation des themes" :
    lang === "de" ? "Themennavigation" :
    "Navigacija kroz teme";
  const topicStripControlsLabel =
    lang === "en" ? "Theme navigation controls" :
    lang === "tr" ? "Tema gezinme kontrolleri" :
    lang === "fr" ? "Controles de navigation des themes" :
    lang === "de" ? "Steuerung der Themennavigation" :
    "Kontrole za navigaciju kroz teme";
  const topicStripPreviousLabel =
    lang === "en" ? "Previous themes" :
    lang === "tr" ? "Onceki temalar" :
    lang === "fr" ? "Themes precedents" :
    lang === "de" ? "Vorherige Themen" :
    "Prethodne teme";
  const topicStripNextLabel =
    lang === "en" ? "Next themes" :
    lang === "tr" ? "Sonraki temalar" :
    lang === "fr" ? "Themes suivants" :
    lang === "de" ? "Naechste Themen" :
    "Sledece teme";
  const defaultSignalCta =
    lang === "en" ? "Read context" :
    lang === "tr" ? "Baglami oku" :
    lang === "fr" ? "Lire le contexte" :
    lang === "de" ? "Kontext lesen" :
    "Pročitaj kontekst";
  const defaultSignalLabel =
    lang === "en" ? "EDITORIAL SIGNAL" :
    lang === "tr" ? "EDITOR SINYALI" :
    lang === "fr" ? "SIGNAL EDITORIAL" :
    lang === "de" ? "REDAKTIONELLES SIGNAL" :
    "UREDNICKI SIGNAL";
  const defaultSignalText =
    lang === "en" ? "A strong magazine site needs a point of view the moment it opens." :
    lang === "tr" ? "Iyi bir dergi sitesi daha acildigi anda kendi tavrini gostermelidir." :
    lang === "fr" ? "Un bon magazine numerique doit montrer sa position des l'ouverture." :
    lang === "de" ? "Ein gutes Magazin muss vom ersten Moment an eine klare Haltung zeigen." :
    "Dobar magazinski sajt mora da ima stav cim se otvori.";
  const defaultDailyQuestionLabel =
    lang === "en" ? "QUESTION OF THE DAY" :
    lang === "tr" ? "GUNUN SORUSU" :
    lang === "fr" ? "QUESTION DU JOUR" :
    lang === "de" ? "FRAGE DES TAGES" :
    "PITANJE DANA";
  const defaultDailyQuestionText =
    lang === "en" ? "Do you think exhaustion is a political problem?" :
    lang === "tr" ? "Sence yorgunluk politik bir sorun mu?" :
    lang === "fr" ? "Penses-tu que la fatigue est un probleme politique ?" :
    lang === "de" ? "Ist Ermuedung ein politisches Problem?" :
    "Da li mislis da je umor politicki problem?";
  const defaultAnswerA =
    lang === "en" ? "YES" :
    lang === "tr" ? "EVET" :
    lang === "fr" ? "OUI" :
    lang === "de" ? "JA" :
    "DA";
  const defaultAnswerB =
    lang === "en" ? "NO" :
    lang === "tr" ? "HAYIR" :
    lang === "fr" ? "NON" :
    lang === "de" ? "NEIN" :
    "NE";
  const defaultDailyQuestionCta =
    lang === "en" ? "Read context" :
    lang === "tr" ? "Baglami oku" :
    lang === "fr" ? "Lire le contexte" :
    lang === "de" ? "Kontext lesen" :
    "Procitaj kontekst";
  const editorialSignal: EditorialSignalCardData = localizedEditorialSignal?.isActive !== false && localizedEditorialSignal?.text?.trim()
    ? {
        label: rawEditorialSignal.label?.trim() || "UREDNIČKI SIGNAL",
        text: rawEditorialSignal.text.trim(),
        author: rawEditorialSignal.author?.trim() || "",
        source: rawEditorialSignal.source?.trim() || "",
        type: rawEditorialSignal.type || "statement",
        ctaLabel: rawEditorialSignal.ctaLabel?.trim() || defaultSignalCta,
        backgroundMode: rawEditorialSignal.backgroundMode || "yellow",
        href: linkedSignalArticle?.slug ? `/a/${linkedSignalArticle.slug}` : ""
      }
    : {
        label: "UREDNIČKI SIGNAL",
        text: "Dobar magazinski sajt mora da ima stav čim se otvori.",
        author: "Avangarda",
        type: "statement",
        backgroundMode: "yellow"
      };
  const finalEditorialSignal: EditorialSignalCardData = localizedEditorialSignal?.isActive !== false && localizedEditorialSignal?.text?.trim()
    ? {
        label: localizedEditorialSignal.label?.trim() || defaultSignalLabel,
        text: localizedEditorialSignal.text.trim(),
        author: localizedEditorialSignal.author?.trim() || "",
        source: localizedEditorialSignal.source?.trim() || "",
        type: localizedEditorialSignal.type || "statement",
        ctaLabel: localizedEditorialSignal.ctaLabel?.trim() || defaultSignalCta,
        backgroundMode: localizedEditorialSignal.backgroundMode || "yellow",
        href: linkedSignalArticle?.slug ? `/a/${linkedSignalArticle.slug}` : ""
      }
    : {
        label: defaultSignalLabel,
        text: defaultSignalText,
        author: "Avangarda",
        type: "statement",
        backgroundMode: "yellow"
      };
  const finalDailyQuestion = localizedDailyQuestion?.isActive !== false && localizedDailyQuestion?.question?.trim()
    ? {
        id: localizedDailyQuestion.id,
        label: localizedDailyQuestion.label?.trim() || defaultDailyQuestionLabel,
        question: localizedDailyQuestion.question.trim(),
        answerA: localizedDailyQuestion.answerA?.trim() || defaultAnswerA,
        answerB: localizedDailyQuestion.answerB?.trim() || defaultAnswerB,
        votesA: Number(localizedDailyQuestion.votesA) || 0,
        votesB: Number(localizedDailyQuestion.votesB) || 0,
        voteRound: Number(localizedDailyQuestion.voteRound) || 1,
        totalVotes: Number(localizedDailyQuestion.totalVotes) || 0,
        percentA: Number(localizedDailyQuestion.percentA) || 0,
        percentB: Number(localizedDailyQuestion.percentB) || 0,
        author: localizedDailyQuestion.author?.trim() || "",
        source: localizedDailyQuestion.source?.trim() || "",
        ctaLabel: localizedDailyQuestion.ctaLabel?.trim() || defaultDailyQuestionCta,
        href: linkedDailyQuestionArticle?.slug ? `/a/${linkedDailyQuestionArticle.slug}` : "",
        isActive: localizedDailyQuestion.isActive !== false
      }
    : {
        label: defaultDailyQuestionLabel,
        question: defaultDailyQuestionText,
        answerA: defaultAnswerA,
        answerB: defaultAnswerB,
        votesA: 0,
        votesB: 0,
        voteRound: 1,
        totalVotes: 0,
        percentA: 0,
        percentB: 0,
        author: "Avangarda",
        ctaLabel: defaultDailyQuestionCta,
        href: "",
        isActive: true
      };
  const fallbackEditorialCards = getDefaultHomepageEditorialCards(lang);
  const homepageEditorialCards = fallbackEditorialCards.map((fallbackCard, index) => {
    const cmsCard = homepageConfig?.editorialCards?.[index]
      ? localizeHomepageEditorialCard(homepageConfig.editorialCards[index], lang)
      : null;

    return {
      label: cmsCard?.label?.trim() || fallbackCard.label,
      title: cmsCard?.title?.trim() || fallbackCard.title,
      text: cmsCard?.text?.trim() || fallbackCard.text,
      ctaLabel: cmsCard?.ctaLabel?.trim() || "",
      href: resolveEditorialCardHref(cmsCard?.ctaHref, lang)
    };
  });

  return (
    <>
      <SiteHeader lang={lang} currentPath="/" />

      <main className="site-main">
        <div className="page-shell">
          <LiveSignalStrip
            label={t.tickerNow}
            items={signalItems}
            ariaLabel={lang === "sr" ? "Sada editorial signali" : "Live editorial signals"}
          />

          <section className={hasSidebarContent ? "hero-grid" : "hero-grid hero-grid--single"}>
            <div className="hero-grid__main">
            <HomeHeroShowcase
              slides={
                heroSlides.length
                  ? heroSlides
                  : [{
                      id: 0,
                      href: withLang("/archive", lang),
                      title: t.heroFallbackTitle,
                      subtitle: t.heroFallbackCopy,
                      sectionLabel: t.heroEyebrow,
                      publishedLabel: t.heroFallbackDate,
                      styleLabel: t.heroStyleValue,
                      focusLabel: t.heroFallbackFocus,
                      imageUrl: "",
                      videoUrl: null
                    }]
              }
              labels={{
                heroEyebrow: hero ? t.latestTitle : t.heroEyebrow,
                heroPrimary: t.heroPrimary,
                heroSecondary: t.heroSecondary,
                archive: t.navArchive,
                heroFocus: t.heroFocus,
                heroDate: t.heroDate,
                heroStyle: t.heroStyle,
                next: t.heroNext,
                previous: t.heroPrevious,
                volumeUp: t.heroVolumeUp,
                volumeDown: t.heroVolumeDown,
                mute: t.heroMute,
                unmute: t.heroUnmute
              }}
              archiveHref={withLang("/archive", lang)}
              searchHref={withLang("/search", lang)}
            />

              {hero ? (
                <section className="editorial-statement">
                  <div className="editorial-statement__panel">
                    <div className="editorial-statement__heading">
                      <span className="eyebrow">{t.editorialStatementEyebrow}</span>
                      {hero.focus ? <span className="editorial-statement__focus">{hero.focus}</span> : null}
                    </div>

                    <div className="editorial-statement__body">
                      <p className="editorial-statement__copy">{t.editorialStatementCopy}</p>
                      <a className="editorial-statement__link" href={withLang(`/a/${hero.slug}`, lang)}>
                        {t.editorialStatementLink}
                      </a>
                    </div>
                  </div>
                </section>
              ) : null}

              <div className="hero-grid__topic-slot">
                <TopicStrip
                  label={themesLabel}
                  items={topicStripItems}
                  ariaLabel={topicStripAriaLabel}
                  controlsLabel={topicStripControlsLabel}
                  previousLabel={topicStripPreviousLabel}
                  nextLabel={topicStripNextLabel}
                />
              </div>

              <div className="hero-grid__poll-slot">
                <DailyQuestionCard question={finalDailyQuestion} lang={lang} />
              </div>
            </div>

            {hasSidebarContent ? (
              <HomepageSidebar
                lang={lang}
                currentLabel={currentLabel}
                currentItems={currentItems}
                mostReadLabel={mostReadLabel}
                mostReadItems={mostReadItems}
                authorLabel={authorLabel}
                authors={authorRail}
              />
            ) : null}
          </section>

          <section className="impact-grid">
            <div className="panel impact-card">
              <strong>{formatStat(impactMetrics.articlesCount)}</strong>
              <span>{t.impactStory}</span>
            </div>
            <div className="panel impact-card">
              <strong>{formatStat(impactMetrics.topicsCount)}</strong>
              <span>{t.impactSupport}</span>
            </div>
            <div className="panel impact-card">
              <strong>{formatStat(impactMetrics.authorsCount)}</strong>
              <span>{t.impactSections}</span>
            </div>
            <div className="panel impact-card">
              <strong>{formatStat(impactMetrics.recentArticlesCount)}</strong>
              <span>{t.impactRhythm}</span>
            </div>
          </section>

          <section className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{t.latestEyebrow}</span>
                <h2 className="section-title">{t.latestTitle}</h2>
              </div>
              <p className="section-kicker">{t.latestCopy}</p>
            </div>

            {latestLead ? (
              <div className="editorial-spotlight editorial-spotlight--stacked">
                <div className="editorial-spotlight__lead-stack">
                  <a href={withLang(`/a/${latestLead.slug}`, lang)} className="panel article-lead editorial-spotlight__lead">
                    <div className="article-lead__image-wrap">
                      {latestLead.videoEmbedUrl ? (
                        <div className="article-lead__video-wrap">
                          <iframe
                            className="article-lead__video"
                            src={getYouTubeEmbedUrl(latestLead.videoEmbedUrl, "hero") || ""}
                            title={latestLead.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : latestLead.cover?.url ? (
                        <img
                          className="article-lead__image"
                          src={getStrapiMediaUrl(latestLead.cover.formats?.medium?.url || latestLead.cover.formats?.small?.url || latestLead.cover.url)}
                          alt={latestLead.title}
                        />
                      ) : null}

                      <div className="article-lead__content">
                        {latestLeadBadges.length ? (
                          <div className="story-status-badges article-lead__status">
                            {latestLeadBadges.map((badge) => (
                              <span
                                key={`${latestLead.id}-${badge.key}`}
                                className={`story-status-badge story-status-badge--${badge.key}`}
                              >
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="article-lead__meta">
                          <span>{getSectionLabel(latestLead.section, lang)}</span>
                          <span>{formatDisplayDate(latestLead.publishedAt, lang)}</span>
                          {getAuthorLabel(latestLead.authors) ? <span>{getAuthorLabel(latestLead.authors)}</span> : null}
                        </div>
                        <h3 className="article-lead__title">{latestLead.title}</h3>
                        {latestLead.subtitle ? <p className="article-lead__subtitle">{latestLead.subtitle}</p> : null}
                      </div>
                    </div>
                  </a>

                  {latestSideStories.length ? (
                    <div className="editorial-spotlight__subgrid">
                      {latestSideStories.map((article) => (
                        <a
                          key={article.id}
                          href={withLang(`/a/${article.slug}`, lang)}
                          className={article.videoEmbedUrl || article.cover?.url ? "panel article-card article-card--media editorial-spotlight__card" : "panel article-card editorial-spotlight__card"}
                        >
                          {article.videoEmbedUrl ? (
                            <div className="article-card__media">
                              <iframe
                                className="article-card__video"
                                src={getYouTubeEmbedUrl(article.videoEmbedUrl, "hero") || ""}
                                title={article.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : article.cover?.url ? (
                            <div className="article-card__media">
                              <img
                                className="article-card__media-image"
                                src={getStrapiMediaUrl(article.cover.formats?.small?.url || article.cover.formats?.medium?.url || article.cover.url)}
                                alt={article.title}
                              />
                            </div>
                          ) : null}

                          <div>
                            {getEditorialBadges(article, lang).length ? (
                              <div className="story-status-badges article-card__status">
                                {getEditorialBadges(article, lang).map((badge) => (
                                  <span
                                    key={`${article.id}-${badge.key}`}
                                    className={`story-status-badge story-status-badge--${badge.key}`}
                                  >
                                    {badge.label}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            <div className="article-card__meta">
                              <span>{getSectionLabel(article.section, lang)}</span>
                              <span>{formatDisplayDate(article.publishedAt, lang)}</span>
                              {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                            </div>
                            <h3 className="article-card__title">{article.title}</h3>
                            {article.subtitle ? <p className="article-card__subtitle">{article.subtitle}</p> : null}
                          </div>
                          <span className="button-secondary">{t.readStory}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="panel empty-state">
                <h3>{t.strongerSiteTitle}</h3>
                <p>{t.strongerSiteCopy}</p>
              </div>
            )}
          </section>

          <section className="air-quality-feature">
            <AirQualityCard lang={lang} variant="feature" />
          </section>

          <section className="feature-cluster">
            <div className={`panel info-card${homepageEditorialCards[0]?.href ? " info-card--interactive" : ""}`}>
              <span className="eyebrow">{homepageEditorialCards[0].label}</span>
              <h3>{homepageEditorialCards[0].title}</h3>
              <p>{homepageEditorialCards[0].text}</p>
              {homepageEditorialCards[0].href && homepageEditorialCards[0].ctaLabel ? (
                <a className="feature-card__cta" href={homepageEditorialCards[0].href}>
                  {homepageEditorialCards[0].ctaLabel}
                </a>
              ) : null}
            </div>

            <div className="feature-stack">
              {homepageEditorialCards.slice(1, 3).map((card, index) => {
                const content = (
                  <>
                    <span className="eyebrow">{card.label}</span>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    {card.href && card.ctaLabel ? (
                      <span className="feature-card__cta">{card.ctaLabel}</span>
                    ) : null}
                  </>
                );

                return card.href ? (
                  <a key={`${card.title}-${index}`} href={card.href} className="panel feature-mini">
                    {content}
                  </a>
                ) : (
                  <div key={`${card.title}-${index}`} className="panel feature-mini">
                    {content}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="insight-strip">
            <EditorialSignalCard signal={finalEditorialSignal} lang={lang} />
          </section>

          <section className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{t.sectionsLabel}</span>
                <h2 className="section-title">{t.sectionsTitle}</h2>
              </div>
              <p className="section-kicker">{t.sectionsCopy}</p>
            </div>

            <div className="section-card-grid">
              {["news", "analysis", "interview", "column"].map((section) => (
                <a key={section} href={withLang(`/section/${section}`, lang)} className="panel section-card">
                  <span className="eyebrow">{getSectionLabel(section, lang)}</span>
                  <h3>{getSectionLabel(section, lang)}</h3>
                  <p>{section === "news" ? t.sectionNewsCopy : section === "analysis" ? t.sectionAnalysisCopy : section === "interview" ? t.sectionInterviewCopy : t.sectionColumnCopy}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
