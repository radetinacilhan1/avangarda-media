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
  const cleanSectionEyebrowsByLang = {
    sr: { who: "Ko smo mi", principle: "Princip", people: "Ljudi", legal: "Impresum" },
    en: { who: "Who we are", principle: "Principle", people: "People", legal: "Imprint" },
    tr: { who: "Biz kimiz", principle: "\u0130lke", people: "\u0130nsanlar", legal: "K\u00fcnye" },
    fr: { who: "\u00c9quipe", principle: "Principe", people: "Personnes", legal: "Mentions" },
    de: { who: "Wer wir sind", principle: "Prinzip", people: "Menschen", legal: "Impressum" },
    es: { who: "Qui\u00e9nes somos", principle: "Principio", people: "Personas", legal: "Aviso legal" },
    el: {
      who: "\u03a0\u03bf\u03b9\u03bf\u03b9 \u03b5\u03af\u03bc\u03b1\u03c3\u03c4\u03b5",
      principle: "\u0391\u03c1\u03c7\u03ae",
      people: "\u0386\u03bd\u03b8\u03c1\u03c9\u03c0\u03bf\u03b9",
      legal: "\u03a3\u03c4\u03bf\u03b9\u03c7\u03b5\u03af\u03b1",
    },
    ar: {
      who: "\u0645\u0646 \u0646\u062d\u0646",
      principle: "\u0627\u0644\u0645\u0628\u062f\u0623",
      people: "\u0627\u0644\u0623\u0634\u062e\u0627\u0635",
      legal: "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0631",
    },
  } as const;
  const sectionEyebrows = cleanSectionEyebrowsByLang[lang];
  const sectionEyebrowsByLang = {
    sr: { who: "Ko smo mi", principle: "Princip", people: "Ljudi", legal: "Impresum" },
    en: { who: "Who we are", principle: "Principle", people: "People", legal: "Imprint" },
    tr: { who: "Biz kimiz", principle: "Ä°lke", people: "Ä°nsanlar", legal: "KÃ¼nye" },
    fr: { who: "Ã‰quipe", principle: "Principe", people: "Personnes", legal: "Mentions" },
    de: { who: "Wer wir sind", principle: "Prinzip", people: "Menschen", legal: "Impressum" },
    es: { who: "QuiÃ©nes somos", principle: "Principio", people: "Personas", legal: "Aviso legal" },
    el: { who: "Î Î¿Î¹Î¿Î¹ ÎµÎ¯Î¼Î±ÏƒÏ„Îµ", principle: "Î‘ÏÏ‡Î®", people: "Î†Î½Î¸ÏÏ‰Ï€Î¿Î¹", legal: "Î£Ï„Î¿Î¹Ï‡ÎµÎ¯Î±" },
    ar: { who: "Ù…Ù† Ù†Ø­Ù†", principle: "Ø§Ù„Ù…Ø¨Ø¯Ø£", people: "Ø§Ù„Ø£Ø´Ø®Ø§Øµ", legal: "Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø´Ø±" },
  } as const;
  void sectionEyebrowsByLang;
  const legalCopyByLang = {
    sr: "Pravni i izdavački podaci platforme ostaju dostupni kroz Impresum.",
    en: "Legal and publisher information remains available through the Imprint.",
    es: "La informaci\u00f3n legal y editorial de la plataforma sigue disponible en el Aviso legal.",
    el: "\u03a4\u03b1 \u03bd\u03bf\u03bc\u03b9\u03ba\u03ac \u03ba\u03b1\u03b9 \u03b5\u03ba\u03b4\u03bf\u03c4\u03b9\u03ba\u03ac \u03c3\u03c4\u03bf\u03b9\u03c7\u03b5\u03af\u03b1 \u03c4\u03b7\u03c2 \u03c0\u03bb\u03b1\u03c4\u03c6\u03cc\u03c1\u03bc\u03b1\u03c2 \u03c0\u03b1\u03c1\u03b1\u03bc\u03ad\u03bd\u03bf\u03c5\u03bd \u03b4\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b1 \u03c3\u03c4\u03b1 \u03a3\u03c4\u03bf\u03b9\u03c7\u03b5\u03af\u03b1 \u03ad\u03ba\u03b4\u03bf\u03c3\u03b7\u03c2.",
    ar: "\u062a\u0638\u0644 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a\u0629 \u0648\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0627\u0634\u0631 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u062a\u0627\u062d\u0629 \u0639\u0628\u0631 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0631.",
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
                <span className="eyebrow">{sectionEyebrows.who}</span>
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
                <span className="eyebrow">{sectionEyebrows.principle}</span>
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
                <span className="eyebrow">{sectionEyebrows.people}</span>
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
            <span className="eyebrow">{sectionEyebrows.legal}</span>
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
