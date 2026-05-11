import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchTeamMemberBySlug, getPeopleChrome, type PortfolioEntry } from "@/lib/about";
import { getAuthorLabel } from "@/lib/content";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

function renderEntryCards(entries: PortfolioEntry[]) {
  return entries.map((entry) => (
    <article key={`${entry.title}-${entry.period || entry.organisation || ""}`} className="panel info-card profile-entry-card">
      <h3>{entry.title}</h3>
      {entry.subtitle ? <p className="profile-entry-card__subhead">{entry.subtitle}</p> : null}
      {entry.organisation || entry.location || entry.period ? (
        <p className="profile-entry-card__meta">
          {[entry.organisation, entry.location, entry.period].filter(Boolean).join(" • ")}
        </p>
      ) : null}
      {entry.description ? <p>{entry.description}</p> : null}
      {entry.url ? (
        <a className="button-secondary profile-entry-card__link" href={entry.url} target="_blank" rel="noreferrer">
          {entry.url}
        </a>
      ) : null}
    </article>
  ));
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
  const member = await fetchTeamMemberBySlug(params.slug, lang);

  if (!member || !member.portfolioEnabled) {
    notFound();
  }

  const sections = [
    { title: chrome.education, entries: member.education },
    { title: chrome.experience, entries: member.experience },
    { title: chrome.projects, entries: member.projects },
    { title: chrome.publications, entries: member.publications },
    { title: chrome.certifications, entries: member.certifications },
    { title: chrome.trainings, entries: member.trainings },
    { title: chrome.awards, entries: member.awards },
  ].filter((section) => section.entries.length);

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/people/${params.slug}`} activeNav="about" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero profile-hero">
            <a className="button-secondary profile-hero__back" href={withLang("/o-nama", lang)}>
              {chrome.backToAbout}
            </a>

            <div className="profile-hero__grid">
              <div className="profile-hero__visual">
                {member.portraitUrl ? (
                  <img src={member.portraitUrl} alt={member.fullName} className="profile-hero__portrait" />
                ) : (
                  <div className="profile-hero__placeholder" aria-hidden="true">
                    <span>
                      {member.fullName
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() || "")
                        .join("")}
                    </span>
                  </div>
                )}
              </div>

              <div className="profile-hero__copy">
                <span className="eyebrow">{member.role}</span>
                <h1 className="subpage-hero__title">{member.fullName}</h1>
                <p className="subpage-hero__copy">{member.longBio || member.shortBio}</p>

                <div className="topic-list profile-hero__meta">
                  {member.email ? <a className="topic-pill" href={`mailto:${member.email}`}>{chrome.email}</a> : null}
                  {member.website ? (
                    <a className="topic-pill" href={member.website} target="_blank" rel="noreferrer">
                      {chrome.website}
                    </a>
                  ) : null}
                  {member.location ? <span className="topic-pill">{member.location}</span> : null}
                  {member.cvUrl ? (
                    <a className="topic-pill" href={member.cvUrl} target="_blank" rel="noreferrer">
                      {chrome.downloadCv}
                    </a>
                  ) : null}
                </div>

                {member.socialLinks.length ? (
                  <div className="topic-list profile-hero__socials">
                    {member.socialLinks.map((social) => (
                      <a key={`${social.platform}-${social.url}`} className="topic-pill" href={social.url} target="_blank" rel="noreferrer">
                        {social.platform}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {member.languages.length || member.skills.length ? (
            <section className="page-grid profile-pill-grid">
              {member.languages.length ? (
                <article className="panel info-card profile-pill-card">
                  <span className="eyebrow">{chrome.languages}</span>
                  <div className="topic-list">
                    {member.languages.map((item) => (
                      <span key={item.label} className="topic-pill">{item.label}</span>
                    ))}
                  </div>
                </article>
              ) : null}

              {member.skills.length ? (
                <article className="panel info-card profile-pill-card">
                  <span className="eyebrow">{chrome.skills}</span>
                  <div className="topic-list">
                    {member.skills.map((item) => (
                      <span key={item.label} className="topic-pill">{item.label}</span>
                    ))}
                  </div>
                </article>
              ) : null}
            </section>
          ) : null}

          {sections.map((section) => (
            <section key={section.title} className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{member.fullName}</span>
                  <h2 className="section-title">{section.title}</h2>
                </div>
              </div>

              <div className="page-grid profile-section-grid">
                {renderEntryCards(section.entries)}
              </div>
            </section>
          ))}

          {member.customSections.length ? (
            <section className="page-grid profile-custom-grid">
              {member.customSections.map((section) => (
                <article key={section.title} className="panel info-card profile-custom-card">
                  <span className="eyebrow">{member.fullName}</span>
                  <h3>{section.title}</h3>
                  {section.body ? <p>{section.body}</p> : null}
                </article>
              ))}
            </section>
          ) : null}

          {member.relatedArticles.length ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{member.fullName}</span>
                  <h2 className="section-title">{chrome.relatedArticles}</h2>
                </div>
              </div>

              <div className="page-grid">
                {member.relatedArticles.map((article) => (
                  <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card">
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
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
