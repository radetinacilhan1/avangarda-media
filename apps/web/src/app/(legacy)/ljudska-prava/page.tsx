import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import {
  fetchHumanRightsCatalog,
  fetchHumanRightsPage,
  fetchLegalResources,
  getFrameworkLabel,
  getHumanRightsCopy,
  getHumanRightsSeo,
  getLegalResourceTypeLabel,
  type HumanRightCategoryKey,
} from "@/lib/human-rights";
import { getRichTextHtml } from "@/lib/richtext";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

type SearchParamValue = string | string[] | undefined;

function renderRichText(value: string, lang: ReturnType<typeof resolveLang>) {
  return {
    __html: getRichTextHtml(value, {
      lang,
      imageCredits: [],
      bodyImages: [],
    }),
  };
}

type HumanRightsEyebrowCopy = {
  hero: string;
  compass: string;
  foundation: string;
  everyday: string;
  guide: string;
  catalog: string;
  resources: string;
  featuredRight: string;
  right: string;
  cards: Record<HumanRightCategoryKey, string>;
};

type EverydayRightsWidgetCopy = {
  title: string;
  items: string[];
  copy: string;
};

const humanRightsEyebrowsByLang: Record<Lang, HumanRightsEyebrowCopy> = {
  sr: {
    hero: "Ljudska prava",
    compass: "Pravni kompas",
    foundation: "Osnova",
    everyday: "Svakodnevica",
    guide: "Vodič",
    catalog: "Katalog",
    resources: "Resursi",
    featuredRight: "Istaknuto pravo",
    right: "Pravo",
    cards: {
      whatAreRights: "Objašnjenje",
      everydayLife: "Život",
      catalog: "Katalog",
      rightsInSerbia: "Srbija",
      legalCompass: "Resursi",
      internationalFramework: "Međunarodno",
    },
  },
  en: {
    hero: "Human Rights",
    compass: "Legal Compass",
    foundation: "Basics",
    everyday: "Everyday life",
    guide: "Guide",
    catalog: "Catalog",
    resources: "Resources",
    featuredRight: "Featured right",
    right: "Right",
    cards: {
      whatAreRights: "Explainer",
      everydayLife: "Everyday",
      catalog: "Catalog",
      rightsInSerbia: "Serbia",
      legalCompass: "Resources",
      internationalFramework: "International",
    },
  },
  tr: {
    hero: "İnsan hakları",
    compass: "Hukuk Pusulası",
    foundation: "Temel",
    everyday: "Gündelik yaşam",
    guide: "Rehber",
    catalog: "Katalog",
    resources: "Kaynaklar",
    featuredRight: "Öne çıkan hak",
    right: "Hak",
    cards: {
      whatAreRights: "Açıklama",
      everydayLife: "Yaşam",
      catalog: "Katalog",
      rightsInSerbia: "Sırbistan",
      legalCompass: "Kaynaklar",
      internationalFramework: "Uluslararası",
    },
  },
  fr: {
    hero: "Droits humains",
    compass: "Boussole juridique",
    foundation: "Repères",
    everyday: "Quotidien",
    guide: "Guide",
    catalog: "Catalogue",
    resources: "Ressources",
    featuredRight: "Droit clé",
    right: "Droit",
    cards: {
      whatAreRights: "Explication",
      everydayLife: "Quotidien",
      catalog: "Catalogue",
      rightsInSerbia: "Serbie",
      legalCompass: "Ressources",
      internationalFramework: "International",
    },
  },
  de: {
    hero: "Menschenrechte",
    compass: "Rechtskompass",
    foundation: "Grundlage",
    everyday: "Alltag",
    guide: "Wegweiser",
    catalog: "Katalog",
    resources: "Ressourcen",
    featuredRight: "Im Fokus",
    right: "Recht",
    cards: {
      whatAreRights: "Erklärung",
      everydayLife: "Alltag",
      catalog: "Katalog",
      rightsInSerbia: "Serbien",
      legalCompass: "Ressourcen",
      internationalFramework: "International",
    },
  },
  es: {
    hero: "Derechos humanos",
    compass: "Brújula legal",
    foundation: "Base",
    everyday: "Vida cotidiana",
    guide: "Guía",
    catalog: "Catálogo",
    resources: "Recursos",
    featuredRight: "Derecho clave",
    right: "Derecho",
    cards: {
      whatAreRights: "Explicación",
      everydayLife: "Vida diaria",
      catalog: "Catálogo",
      rightsInSerbia: "Serbia",
      legalCompass: "Recursos",
      internationalFramework: "Internacional",
    },
  },
  el: {
    hero: "Ανθρώπινα δικαιώματα",
    compass: "Νομική πυξίδα",
    foundation: "Βάση",
    everyday: "Καθημερινότητα",
    guide: "Οδηγός",
    catalog: "Κατάλογος",
    resources: "Πόροι",
    featuredRight: "Σε εστίαση",
    right: "Δικαίωμα",
    cards: {
      whatAreRights: "Εξήγηση",
      everydayLife: "Ζωή",
      catalog: "Κατάλογος",
      rightsInSerbia: "Σερβία",
      legalCompass: "Πόροι",
      internationalFramework: "Διεθνές",
    },
  },
  ar: {
    hero: "حقوق الإنسان",
    compass: "البوصلة القانونية",
    foundation: "الأساس",
    everyday: "الحياة اليومية",
    guide: "دليل",
    catalog: "الدليل",
    resources: "موارد",
    featuredRight: "حق أساسي",
    right: "حق",
    cards: {
      whatAreRights: "شرح",
      everydayLife: "حياة",
      catalog: "الدليل",
      rightsInSerbia: "صربيا",
      legalCompass: "موارد",
      internationalFramework: "دولي",
    },
  },
};

const everydayRightsWidgetByLang: Record<Lang, EverydayRightsWidgetCopy> = {
  sr: {
    title: "Gde se prava vide?",
    items: ["Na poslu", "U školi", "U bolnici", "U opštini", "Na ulici", "U prirodi"],
    copy: "Prava nisu samo u zakonima. Vide se tamo gde čovek radi, uči, diše, govori, leči se i traži da ga institucije čuju.",
  },
  en: {
    title: "Where do rights show up?",
    items: ["At work", "At school", "In hospital", "At city hall", "On the street", "In nature"],
    copy: "Rights are not only in laws. They show up where people work, learn, breathe, speak, heal and ask institutions to hear them.",
  },
  tr: {
    title: "Haklar nerede görünür?",
    items: ["İşte", "Okulda", "Hastanede", "Belediyede", "Sokakta", "Doğada"],
    copy: "Haklar yalnızca kanunlarda değildir. İnsanların çalıştığı, öğrendiği, nefes aldığı, konuştuğu, iyileştiği ve kurumlar tarafından duyulmak istediği yerde görünür.",
  },
  fr: {
    title: "Où voit-on les droits ?",
    items: ["Au travail", "À l'école", "À l'hôpital", "À la mairie", "Dans la rue", "Dans la nature"],
    copy: "Les droits ne vivent pas seulement dans les lois. Ils se voient là où l'on travaille, apprend, respire, parle, se soigne et demande aux institutions d'écouter.",
  },
  de: {
    title: "Wo werden Rechte sichtbar?",
    items: ["Bei der Arbeit", "In der Schule", "Im Krankenhaus", "In der Gemeinde", "Auf der Straße", "In der Natur"],
    copy: "Rechte stehen nicht nur in Gesetzen. Sie zeigen sich dort, wo Menschen arbeiten, lernen, atmen, sprechen, gesund werden und von Institutionen gehört werden wollen.",
  },
  es: {
    title: "¿Dónde se ven los derechos?",
    items: ["En el trabajo", "En la escuela", "En el hospital", "En el municipio", "En la calle", "En la naturaleza"],
    copy: "Los derechos no están solo en las leyes. Se ven donde una persona trabaja, aprende, respira, habla, se cura y exige que las instituciones la escuchen.",
  },
  el: {
    title: "Πού φαίνονται τα δικαιώματα;",
    items: ["Στην εργασία", "Στο σχολείο", "Στο νοσοκομείο", "Στον δήμο", "Στον δρόμο", "Στη φύση"],
    copy: "Τα δικαιώματα δεν υπάρχουν μόνο στους νόμους. Φαίνονται εκεί όπου ο άνθρωπος εργάζεται, μαθαίνει, αναπνέει, μιλά, θεραπεύεται και ζητά από τους θεσμούς να τον ακούσουν.",
  },
  ar: {
    title: "أين تظهر الحقوق؟",
    items: ["في العمل", "في المدرسة", "في المستشفى", "في البلدية", "في الشارع", "في الطبيعة"],
    copy: "الحقوق ليست في القوانين فقط. تظهر حيث يعمل الإنسان ويتعلم ويتنفس ويتكلم ويتعالج ويطلب من المؤسسات أن تسمعه.",
  },
};

function resolveHumanRightsCardKey(card: { key?: string; href?: string }): HumanRightCategoryKey | null {
  if (card.key) {
    const directKey = card.key as HumanRightCategoryKey;
    if (directKey === "whatAreRights" || directKey === "everydayLife" || directKey === "catalog" || directKey === "rightsInSerbia" || directKey === "legalCompass" || directKey === "internationalFramework") {
      return directKey;
    }
  }

  const href = (card.href || "").toLowerCase();
  if (href.includes("#sta-su-ljudska-prava")) return "whatAreRights";
  if (href.includes("#prava-u-svakodnevnom-zivotu")) return "everydayLife";
  if (href.includes("#katalog-prava")) return "catalog";
  if (href.includes("framework=serbia")) return "rightsInSerbia";
  if (href.includes("/pravni-kompas") && href.includes("type=international_document")) return "internationalFramework";
  if (href.includes("/pravni-kompas")) return "legalCompass";
  return null;
}

function getHumanRightsCardEyebrow(card: { key?: string; href?: string }, copy: HumanRightsEyebrowCopy) {
  const key = resolveHumanRightsCardKey(card);
  return key ? copy.cards[key] : copy.guide;
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const seo = getHumanRightsSeo(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/ljudska-prava",
    title: buildPageTitle(seo.title.replace(" | Avangarda", "")),
    description: seo.description,
  });
}

export default async function HumanRightsPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getHumanRightsCopy(lang);
  const eyebrowCopy = humanRightsEyebrowsByLang[lang];
  const everydayWidget = everydayRightsWidgetByLang[lang];

  const [pageData, rights, legalResources] = await Promise.all([
    fetchHumanRightsPage(lang),
    fetchHumanRightsCatalog(lang),
    fetchLegalResources(lang),
  ]);
  const heroFeatureCards = pageData.cards
    .filter((card) => !card.href.includes("#katalog-prava"))
    .slice(0, 3);

  const featuredResources = (legalResources.filter((entry) => entry.isFeatured).length
    ? legalResources.filter((entry) => entry.isFeatured)
    : legalResources
  ).slice(0, 3);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/ljudska-prava" activeNav="news" />

      <main className="site-main">
        <div className="page-shell page-shell--resource-hub">
          <section className="panel subpage-hero resource-hub__hero">
            <div className="resource-hub__hero-grid">
              <div className="resource-hub__hero-main">
                <span className="eyebrow">{eyebrowCopy.hero}</span>
                <h1 className="subpage-hero__title">{pageData.title}</h1>
                <p className="resource-hub__hero-statement">{pageData.heroText || copy.heroTitle}</p>
                <p className="subpage-hero__copy">{pageData.introText || copy.introText}</p>
              </div>

              <aside className="resource-hub__hero-side">
                <span className="eyebrow">{eyebrowCopy.compass}</span>
                <h2 className="resource-hub__hero-side-title">{copy.legalCompassSectionTitle}</h2>
                <p className="resource-hub__hero-side-copy">{copy.disclaimerCompact}</p>

                {heroFeatureCards.length ? (
                  <div className="resource-hub__hero-pills">
                    {heroFeatureCards.map((card) => (
                      <a key={card.href} href={card.href} className="topic-pill">
                        {card.title}
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="resource-hub__hero-actions">
                  <a href="#katalog-prava" className="button-secondary">
                    {copy.rightsCatalogLabel}
                  </a>
                  <a href={withLang("/pravni-kompas", lang)} className="button-secondary">
                    {copy.browseResourcesLabel}
                  </a>
                </div>
              </aside>
            </div>
          </section>

          <section className="resource-hub__story-grid">
            <article id="sta-su-ljudska-prava" className="panel resource-hub__text-panel">
              <span className="eyebrow">{eyebrowCopy.foundation}</span>
              <h2 className="resource-hub__section-title">{copy.introSectionLabel}</h2>
              {pageData.body ? (
                <div
                  className="resource-hub__richtext"
                  dangerouslySetInnerHTML={renderRichText(pageData.body, lang)}
                />
              ) : (
                <p className="resource-hub__body-copy">{copy.fallbackExplain}</p>
              )}
            </article>

            <article id="prava-u-svakodnevnom-zivotu" className="panel resource-hub__text-panel">
              <span className="eyebrow">{eyebrowCopy.everyday}</span>
              <h2 className="resource-hub__section-title">{copy.everydaySectionLabel}</h2>
              <p className="resource-hub__body-copy">{copy.fallbackEverydayLife}</p>
              <div className="everyday-rights-widget">
                <h3 className="everyday-rights-widget__title">{everydayWidget.title}</h3>
                <div className="everyday-rights-widget__grid">
                  {everydayWidget.items.map((item) => (
                    <span key={item} className="everyday-rights-widget__pill">
                      {item}
                    </span>
                  ))}
                </div>
                <p>{everydayWidget.copy}</p>
              </div>
            </article>
          </section>

          <section className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{eyebrowCopy.guide}</span>
                <h2 className="section-title">{copy.openSectionLabel}</h2>
              </div>
            </div>

            <div className="resource-hub__card-grid">
              {pageData.cards.map((card) => (
                <a key={`${card.key || card.title}-${card.href}`} href={card.href} className="panel resource-hub__link-card">
                  <div>
                    <span className="resource-hub__card-kicker">{getHumanRightsCardEyebrow(card, eyebrowCopy)}</span>
                    <h3 className="resource-hub__card-title">{card.title}</h3>
                    <p className="resource-hub__card-copy">{card.description}</p>
                  </div>
                  <span className="button-secondary">{card.linkLabel || copy.openSectionLabel}</span>
                </a>
              ))}
            </div>
          </section>

          <section id="katalog-prava" className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{eyebrowCopy.catalog}</span>
                <h2 className="section-title">{copy.rightsCatalogTitle}</h2>
                <p className="section-copy">{copy.rightsCatalogCopy}</p>
              </div>
            </div>

            {rights.length ? (
              <div className="resource-hub__rights-grid">
                {rights.map((right) => (
                  <a key={right.slug} href={withLang(`/ljudska-prava/${right.slug}`, lang)} className="panel resource-hub__right-card">
                    <div>
                      <span className="resource-hub__card-kicker">{right.isFeatured ? eyebrowCopy.featuredRight : eyebrowCopy.right}</span>
                      <h3 className="resource-hub__card-title">{right.title}</h3>
                      {right.shortDescription ? <p className="resource-hub__card-copy">{right.shortDescription}</p> : null}
                    </div>
                    <span className="button-secondary">{copy.openRightLabel}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="panel empty-state resource-hub__empty">
                <h3>{copy.noRightsTitle}</h3>
                <p>{copy.noRightsCopy}</p>
              </div>
            )}
          </section>

          <section id="pravni-kompas" className="resource-hub__section">
            <div className="section-header resource-hub__section-header--compass">
              <div>
                <span className="eyebrow">{eyebrowCopy.resources}</span>
                <h2 className="section-title">{copy.legalCompassSectionTitle}</h2>
                <p className="section-copy">{copy.legalCompassSectionCopy}</p>
              </div>
              <a href={withLang("/pravni-kompas", lang)} className="button-secondary">
                {copy.browseResourcesLabel}
              </a>
            </div>

            {featuredResources.length ? (
              <div className="resource-hub__resource-grid">
                {featuredResources.map((resource) => (
                  <article key={resource.slug} className="panel resource-hub__resource-card">
                    <div className="resource-hub__resource-meta">
                      <span className="topic-pill">{getLegalResourceTypeLabel(resource.type, lang)}</span>
                      <span className="topic-pill">{getFrameworkLabel(resource.countryOrFramework, lang)}</span>
                    </div>
                    <h3 className="resource-hub__card-title">{resource.title}</h3>
                    {resource.legalArea ? (
                      <p className="resource-hub__resource-area">
                        <strong>{copy.legalAreaLabel}:</strong> {resource.legalArea}
                      </p>
                    ) : null}
                    {resource.shortDescription ? <p className="resource-hub__card-copy">{resource.shortDescription}</p> : null}
                    <div className="resource-hub__resource-actions">
                      <a href={withLang(`/pravni-kompas/${resource.slug}`, lang)} className="button-secondary">
                        {copy.openResourceLabel}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel empty-state resource-hub__empty">
                <h3>{copy.noResourcesTitle}</h3>
                <p>{copy.noResourcesCopy}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
