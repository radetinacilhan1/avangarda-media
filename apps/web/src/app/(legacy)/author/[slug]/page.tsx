import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewspaperSheet, ProfileMasthead } from "@/components/profile-newspaper";
import styles from "@/components/profile-newspaper.module.css";
import { getPeopleChrome } from "@/lib/about";
import { getAuthorLabel, localizeArticle, localizeAuthor } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getFallbackAuthorBySlug } from "@/lib/fallback-content";
import { getDictionary, getSectionLabel, resolveLang, withLang, withLangPrefix } from "@/lib/i18n";
import { buildLocalizedUrl, buildPageTitle, buildSeoMetadata } from "@/lib/seo";
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

export async function generateMetadata({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const authors = await strapiGet<{ data: unknown[] }>(
    `/api/authors?filters[slug][$eq]=${encodeURIComponent(params.slug)}&populate=socials,photo`
  );
  const author = unwrapStrapiCollection<Author>(authors?.data)[0] || getFallbackAuthorBySlug(params.slug);

  if (!author) {
    if (!Array.isArray(authors?.data)) throw new Error("Author directory temporarily unavailable");
    notFound();
  }

  const localizedAuthor = localizeAuthor(author, lang);

  return buildSeoMetadata({
    lang,
    pathname: `/author/${params.slug}`,
    title: buildPageTitle(author.name),
    description: localizedAuthor.bio?.trim() || undefined
  });
}

export default async function AuthorPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const chrome = getPeopleChrome(lang);
  const authors = await strapiGet<{ data: unknown[] }>(
    `/api/authors?filters[slug][$eq]=${encodeURIComponent(params.slug)}&populate=socials,photo`
  );
  const author = unwrapStrapiCollection<Author>(authors?.data)[0] || getFallbackAuthorBySlug(params.slug);

  if (!author) {
    if (!Array.isArray(authors?.data)) throw new Error("Author directory temporarily unavailable");
    notFound();
  }

  const publishedArticles = await fetchPublishedArticles(lang, 240);
  const articlesRes = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[authors][slug][$eq]=${encodeURIComponent(params.slug)}&populate=authors&sort=publishedAt:desc&pagination[pageSize]=30`
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
  const hasContacts = Boolean(author.email || socials.length);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "ProfilePage",
        url: buildLocalizedUrl(`/author/${author.slug}`, lang),
        mainEntity: { "@type": "Person", name: author.name.trim(), url: buildLocalizedUrl(`/author/${author.slug}`, lang) },
      }).replace(/</g, "\\u003c") }} />
      <SiteHeader lang={lang} currentPath={`/author/${params.slug}`} eyebrow={t.authorLabel} />

      <main className="site-main">
        <NewspaperSheet lang={lang}>
          <ProfileMasthead name={author.name} portraitUrl={photoUrl || undefined} label={t.authorLabel}>
            {localizedAuthor.bio ? <div className={styles.authorBio}><p>{localizedAuthor.bio}</p></div> : null}
            <nav className={styles.authorLinks} aria-label={t.authorLabel}>
              <a href="#author-stories">{t.authorPosts}</a>
              {hasContacts ? <a href="#author-contact">{t.contact}</a> : null}
              <a href={withLangPrefix("/o-nama#ljudi", lang)}>{chrome.backToAbout}</a>
            </nav>
          </ProfileMasthead>

          <section id="author-stories" className={styles.authorArchive} aria-labelledby="author-stories-title">
            <h2 id="author-stories-title" className={styles.sectionHeading}>{t.authorPosts}</h2>

            {articles.length ? (
              <div>
                {articles.map((article) => (
                  <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className={styles.articleRow}>
                    <div>
                      <div className={styles.articleRowMeta}>
                        <span>{getSectionLabel(article.section, lang)}</span>
                        <span>{formatDisplayDate(article.publishedAt, lang)}</span>
                        {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                      </div>
                      <h3 className={styles.articleRowTitle}>{article.title}</h3>
                      {article.subtitle ? <p className={styles.articleRowCopy}>{article.subtitle}</p> : null}
                    </div>
                    <span className={styles.articleRowRead}>{t.readStory} <span aria-hidden="true">↗</span></span>
                  </a>
                ))}
              </div>
            ) : (
              <div className={styles.authorEmpty}>
                <h3>{t.authorEmptyTitle}</h3>
                <p>{t.authorEmptyCopy}</p>
              </div>
            )}
          </section>

          {hasContacts ? (
            <section id="author-contact" className={styles.authorArchive} aria-labelledby="author-contact-title">
              <h2 id="author-contact-title" className={styles.sectionHeading}>{t.contact}</h2>
              <div className={styles.authorLinks}>
                {author.email ? <a href={`mailto:${author.email}`}>{author.email}</a> : null}
                {socials.map((social, index) => (
                  <a key={`${social.platform}-${index}`} href={social.url} target="_blank" rel="noreferrer">
                    {social.platform} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </NewspaperSheet>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
