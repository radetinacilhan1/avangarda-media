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
    sr: ["Pravni i izdavački podaci Avangarde.", "Pogledaj podatke"],
    en: ["Avangarda’s legal and publisher information.", "View details"],
    tr: ["Avangarda’nın hukuki ve yayıncı bilgileri.", "Bilgileri görüntüle"],
    fr: ["Informations juridiques et éditoriales d’Avangarda.", "Voir les informations"],
    de: ["Rechtliche Angaben und Herausgeberinformationen zu Avangarda.", "Angaben ansehen"],
    es: ["Información legal y editorial de Avangarda.", "Ver los datos"],
    el: ["Νομικά και εκδοτικά στοιχεία της Avangarda.", "Δείτε τα στοιχεία"],
    ar: ["المعلومات القانونية وبيانات ناشر أفانغاردا.", "عرض البيانات"]
  } as const;

  return (
    <>
      <SiteHeader lang={lang} currentPath="/o-nama" activeNav="about" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero about-hero reader-page-intro">
            <h1 className="subpage-hero__title">{about.title}</h1>
            <p className="subpage-hero__copy">{about.intro}</p>
          </section>

          <section id="ko-smo-mi" className="section-block about-anchor-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">{about.whoWeAreTitle}</h2>
              </div>
            </div>

            <article className="panel info-card about-story-card">
              <p>{about.whoWeAreText}</p>
            </article>
          </section>

          <section id="urednicki-princip" className="section-block about-anchor-section">
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

          <section id="ljudi" className="section-block about-anchor-section">
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
            <h3>{about.impressumLinkLabel}</h3>
            <p>{legalCopyByLang[lang][0]}</p>
            <a className="button-secondary" href={withLang("/impresum", lang)}>
              {legalCopyByLang[lang][1]}
            </a>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
