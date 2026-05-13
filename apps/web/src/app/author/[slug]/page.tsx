import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAuthorLabel, localizeArticle, localizeAuthor } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getFallbackAuthorBySlug } from "@/lib/fallback-content";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { formatDisplayDate, getStrapiMediaUrl, strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

type Social = {
  platform: string;
  url: string;
};

type Author = {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  bio_en?: string;
  bio_tr?: string;
  bio_fr?: string;
  bio_de?: string;
  email?: string;
  socials?: unknown;
  photo?: {
    url?: string;
    formats?: {
      small?: { url?: string };
      thumbnail?: { url?: string };
    };
  };
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
};

export default async function AuthorPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const authors = await strapiGet<{ data: unknown[] }>(
    `/api/authors?filters[slug][$eq]=${params.slug}&populate=socials,photo`
  );
  const author = unwrapStrapiCollection<Author>(authors?.data)[0] || getFallbackAuthorBySlug(params.slug);

  if (!author) {
    return (
      <main className="site-main">
        <div className="page-shell">
          <div className="panel empty-state">
            <h3>{t.authorNotFound}</h3>
            <p>{t.authorNotFoundCopy}</p>
          </div>
        </div>
      </main>
    );
  }

  const publishedArticles = await fetchPublishedArticles(lang, 240);
  const articlesRes = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[authors][slug][$eq]=${params.slug}&populate=authors&sort=publishedAt:desc&pagination[pageSize]=30`
  );
  const cmsArticles = unwrapStrapiCollection<Article>(articlesRes?.data).map((article) => localizeArticle(article, lang));
  const articles = cmsArticles.length
    ? cmsArticles
    : publishedArticles
        .filter((article) =>
          unwrapStrapiCollection<Author>(article.authors).some((entry) => entry.slug === params.slug)
        )
        .map((article) => localizeArticle(article as Article, lang));
  const socials = unwrapStrapiCollection<Social>(author.socials);
  const localizedAuthor = localizeAuthor(author, lang);
  const photoUrl = author.photo?.url
    ? getStrapiMediaUrl(author.photo.formats?.small?.url || author.photo.formats?.thumbnail?.url || author.photo.url)
    : "";

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/author/${params.slug}`} eyebrow={t.authorLabel} />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{t.authorLabel}</span>
            {photoUrl ? <img src={photoUrl} alt={author.name} className="subpage-hero__avatar" /> : null}
            <h1 className="subpage-hero__title">{author.name}</h1>
            {localizedAuthor.bio ? <p className="subpage-hero__copy">{localizedAuthor.bio}</p> : null}

            <div className="topic-list">
              {author.email ? <a href={`mailto:${author.email}`} className="topic-pill">{t.contact}</a> : null}
              {socials.map((social, index) => (
                <a key={`${social.platform}-${index}`} href={social.url} target="_blank" rel="noreferrer" className="topic-pill">
                  {social.platform}
                </a>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{t.authorLabel}</span>
                <h2 className="section-title">{t.authorPosts}</h2>
              </div>
            </div>

            {articles.length ? (
              <div className="page-grid">
                {articles.map((article) => (
                  <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card">
                    <div>
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
            ) : (
              <div className="panel empty-state">
                <h3>{t.authorEmptyTitle}</h3>
                <p>{t.authorEmptyCopy}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
