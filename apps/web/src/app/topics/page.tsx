import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { localizeTopic } from "@/lib/content";
import { fallbackTopics } from "@/lib/fallback-content";
import type { Lang } from "@/lib/i18n";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

type Topic = {
  id: number;
  name: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  slug: string;
};

const copy: Record<Lang, { label: string; title: string; intro: string; emptyTitle: string; emptyCopy: string }> = {
  sr: {
    label: "Teme",
    title: "Teme su mapa urednickog fokusa sajta.",
    intro: "Ovde se teme ne ponasaju kao tagovi za ukras, vec kao ulazi u duze citanje, arhivu i urednicki kontinuitet.",
    emptyTitle: "Jos nema tema u CMS-u",
    emptyCopy: "Kada ih dodas u Topic content type, ovde ce automatski postati vidljive."
  },
  en: {
    label: "Topics",
    title: "Topics are the map of the publication's editorial focus.",
    intro: "Here, topics do not behave like decorative tags but as entry points into deeper reading, archives and editorial continuity.",
    emptyTitle: "There are no topics in the CMS yet",
    emptyCopy: "As soon as you add them to the Topic content type, they will appear here automatically."
  },
  de: {
    label: "Themen",
    title: "Themen sind die Landkarte des redaktionellen Fokus.",
    intro: "Hier funktionieren Themen nicht als dekorative Tags, sondern als Einstiege in tiefere Lektuere, Archiv und editoriale Kontinuitaet.",
    emptyTitle: "Noch keine Themen im CMS",
    emptyCopy: "Sobald du sie im Topic-Content-Type anlegst, erscheinen sie hier automatisch."
  },
  fr: {
    label: "Themes",
    title: "Les themes dessinent la carte du focus editorial du site.",
    intro: "Ici, les themes ne servent pas de tags decoratifs mais de portes d'entree vers une lecture plus profonde, l'archive et la continuite editoriale.",
    emptyTitle: "Aucun theme dans le CMS pour l'instant",
    emptyCopy: "Des que tu les ajoutes dans le content type Topic, ils apparaitront ici automatiquement."
  },
  tr: {
    label: "Temalar",
    title: "Temalar, sitenin editoral odak haritasidir.",
    intro: "Burada temalar sus etiketi gibi degil; daha derin okuma, arsiv ve editoral sureklilik icin giris noktasi gibi calisir.",
    emptyTitle: "CMS'te henuz tema yok",
    emptyCopy: "Topic content type icine ekledigin anda burada otomatik olarak gorunecekler."
  }
};

export default async function TopicsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const pageCopy = copy[lang];
  const res = await strapiGet<{ data: unknown[] }>("/api/topics?sort[0]=name:asc&pagination[pageSize]=100", {
    next: { revalidate: 60 }
  });
  const cmsTopics = unwrapStrapiCollection<Topic>(res).map((topic) => localizeTopic(topic, lang));
  const topics = cmsTopics.length ? cmsTopics : fallbackTopics.map((topic) => localizeTopic(topic, lang));

  return (
    <>
      <SiteHeader lang={lang} currentPath="/topics" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{pageCopy.label}</span>
            <h1 className="subpage-hero__title">{pageCopy.title}</h1>
            <p className="subpage-hero__copy">{pageCopy.intro}</p>
          </section>

          {topics.length ? (
            <section className="panel topics-directory">
              <div className="topics-directory__grid">
                {topics.map((topic) => (
                  <a key={topic.id} href={withLang(`/topic/${topic.slug}`, lang)} className="topic-pill">
                    {topic.name}
                  </a>
                ))}
              </div>
            </section>
          ) : (
            <div className="panel empty-state">
              <h3>{pageCopy.emptyTitle}</h3>
              <p>{pageCopy.emptyCopy}</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
