import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAuthorLabel, localizeArticle, localizeTopic } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getFallbackTopicBySlug } from "@/lib/fallback-content";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";
import { formatDisplayDate, unwrapStrapiCollection } from "@/lib/strapi";

type Topic = {
  id: number;
  name: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  slug: string;
};

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
  authors?: unknown;
  topics?: unknown;
};

function getTopicPageCopy(lang: ReturnType<typeof resolveLang>) {
  return lang === "en"
    ? {
        eyebrow: "Topic",
        copy: "A focused landing page that gathers reporting, analysis, interviews, and editorial context around one issue.",
        emptyTitle: "No stories in this topic yet",
        emptyCopy: "As soon as the newsroom ties articles to this topic, they will appear here."
      }
    : lang === "es"
      ? {
          eyebrow: "Tema",
          copy: "Una página temática que reúne reportajes, análisis, entrevistas y contexto editorial alrededor de una misma cuestión.",
          emptyTitle: "Todavía no hay textos en este tema",
          emptyCopy: "En cuanto la redacción vincule artículos a este tema, aparecerán aquí."
        }
    : lang === "el"
      ? {
          eyebrow: "Θέμα",
          copy: "Μια εστιασμένη θεματική σελίδα που συγκεντρώνει ρεπορτάζ, αναλύσεις, συνεντεύξεις και δημοσιογραφικό πλαίσιο γύρω από ένα ζήτημα.",
          emptyTitle: "Δεν υπάρχουν ακόμη κείμενα σε αυτό το θέμα",
          emptyCopy: "Μόλις η σύνταξη συνδέσει άρθρα με αυτό το θέμα, θα εμφανιστούν εδώ."
        }
    : lang === "ar"
      ? {
          eyebrow: "موضوع",
          copy: "صفحة موضوع مركزة تجمع التقارير والتحليلات والمقابلات والسياق التحريري حول قضية واحدة.",
          emptyTitle: "لا توجد مواد في هذا الموضوع بعد",
          emptyCopy: "بمجرد أن تربط هيئة التحرير المقالات بهذا الموضوع ستظهر هنا."
        }
      : lang === "tr"
      ? {
          eyebrow: "Tema",
          copy: "Bir konu etrafinda toplanan haberler, analizler, soylesiler ve editoryal baglam.",
          emptyTitle: "Bu temada henuz yazi yok",
          emptyCopy: "Redaksiyon bu temaya yazi bagladiginda burada gorunecek."
        }
      : lang === "fr"
        ? {
            eyebrow: "Theme",
            copy: "Une page thematique qui rassemble reportages, analyses, entretiens et contexte editorial autour d'un sujet.",
            emptyTitle: "Aucun article dans ce theme pour le moment",
            emptyCopy: "Les textes apparaitront ici des qu'ils seront lies a ce theme."
          }
        : lang === "de"
          ? {
              eyebrow: "Thema",
              copy: "Eine Themenseite, die Reportagen, Analysen, Interviews und redaktionellen Kontext rund um ein Thema sammelt.",
              emptyTitle: "Zu diesem Thema gibt es noch keine Texte",
              emptyCopy: "Sobald die Redaktion Artikel mit diesem Thema verknupft, erscheinen sie hier."
            }
          : {
              eyebrow: "Tema",
              copy: "Tematska stranica koja na jednom mestu okuplja reportaze, analize, intervjue i urednicki kontekst oko iste price.",
              emptyTitle: "Jos nema tekstova u ovoj temi",
              emptyCopy: "Cim redakcija veze clanke za ovu temu, pojavljivace se ovde."
            };
}

export default async function TopicPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const topicCopy = lang === "sr" ? normalizeSerbianLatinDeep(getTopicPageCopy(lang)) : getTopicPageCopy(lang);
  const articles = (await fetchPublishedArticles(lang, 240))
    .filter((article) =>
      unwrapStrapiCollection<Topic>(article.topics).some((entry) => entry.slug === params.slug)
    )
    .map((article) => localizeArticle(article as Article, lang));
  const topic = articles
    .flatMap((article) => unwrapStrapiCollection<Topic>(article.topics))
    .find((entry) => entry.slug === params.slug) || getFallbackTopicBySlug(params.slug);
  const localizedTopic = topic ? localizeTopic(topic, lang) : null;

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/topic/${params.slug}`} />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{topicCopy.eyebrow}</span>
            <h1 className="subpage-hero__title">{localizedTopic?.name || params.slug}</h1>
            <p className="subpage-hero__copy">{topicCopy.copy}</p>
          </section>

          {articles.length ? (
            <div className="page-grid">
              {articles.map((article) => (
                <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card">
                  <div>
                    <div className="article-card__meta">
                      <span>{formatDisplayDate(article.publishedAt, lang)}</span>
                      <span>{getSectionLabel(article.section, lang)}</span>
                      {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                    </div>
                    <h3 className="article-card__title">{article.title}</h3>
                    {article.subtitle ? <p className="article-card__subtitle">{article.subtitle}</p> : null}
                  </div>
                  <span className="button-secondary">{t.readStory}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <h3>{topicCopy.emptyTitle}</h3>
              <p>{topicCopy.emptyCopy}</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
