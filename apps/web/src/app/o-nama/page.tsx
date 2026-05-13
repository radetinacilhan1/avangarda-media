import type { Metadata } from "next";

import { AboutTeamCarousel } from "@/components/about-team-carousel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchAboutPageData, getPeopleChrome } from "@/lib/about";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const about = await fetchAboutPageData(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/o-nama",
    title: buildPageTitle(about.label),
    description: about.intro,
  });
}

export default async function ONamaPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const about = await fetchAboutPageData(lang);
  const peopleChrome = getPeopleChrome(lang);
  const legalCopyByLang = {
    sr: "Pravni i izdavački podaci platforme ostaju dostupni kroz Impresum.",
    en: "Legal and publisher information remains available through the Imprint.",
    tr: "Platformun hukuki ve yayımcı bilgileri Künyede erişilebilir durumda kalır.",
    fr: "Les informations juridiques et éditoriales restent disponibles via les Mentions légales.",
    de: "Rechtliche und verlegerische Angaben bleiben über das Impressum zugänglich.",
  } as const;

  return (
    <>
      <SiteHeader lang={lang} currentPath="/o-nama" activeNav="about" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero about-hero">
            <span className="eyebrow">{about.label}</span>
            <h1 className="subpage-hero__title">{about.title}</h1>
            <p className="subpage-hero__copy">{about.intro}</p>
          </section>

          <section id="ko-smo-mi" className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{about.label}</span>
                <h2 className="section-title">{about.whoWeAreTitle}</h2>
              </div>
            </div>

            <article className="panel info-card about-story-card">
              <p>{about.whoWeAreText}</p>
            </article>
          </section>

          <section id="urednicki-princip" className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{about.label}</span>
                <h2 className="section-title">{about.editorialPrincipleTitle}</h2>
              </div>
            </div>

            <div className="about-directions-grid">
              {about.directions.map((direction) => (
                <a
                  key={direction.slug}
                  href={withLang(direction.href, lang)}
                  className="panel about-direction-card"
                >
                  <span className="eyebrow">{direction.title}</span>
                  <h3>{direction.title}</h3>
                  <p>{direction.description}</p>
                </a>
              ))}
            </div>
          </section>

          <section id="ljudi" className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{about.label}</span>
                <h2 className="section-title">{about.peopleSectionTitle}</h2>
              </div>
            </div>

            <AboutTeamCarousel
              lang={lang}
              members={about.people}
              portfolioLabel={about.portfolioCtaLabel}
              previousLabel={peopleChrome.previous}
              nextLabel={peopleChrome.next}
            />
          </section>

          <section className="panel about-legal-link">
            <span className="eyebrow">{about.label}</span>
            <h3>{about.impressumLinkLabel}</h3>
            <p>{legalCopyByLang[lang]}</p>
            <a className="button-secondary" href={withLang("/impresum", lang)}>
              {about.impressumLinkLabel}
            </a>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
