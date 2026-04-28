import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

type StaticEditorialPageCopy = {
  label: string;
  title: string;
  intro: string;
  blocks: Array<{
    title: string;
    copy: string;
  }>;
};

type StaticEditorialPageProps = {
  lang: Lang;
  currentPath: string;
  copy: StaticEditorialPageCopy;
};

export function StaticEditorialPage({ lang, currentPath, copy }: StaticEditorialPageProps) {
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang} currentPath={currentPath} activeNav={currentPath === "/about" ? "about" : null} />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{copy.label}</span>
            <h1 className="subpage-hero__title">{copy.title}</h1>
            <p className="subpage-hero__copy">{copy.intro}</p>
          </section>

          <section className="page-grid">
            {copy.blocks.map((block) => (
              <article key={block.title} className="panel info-card">
                <span className="eyebrow">{copy.label}</span>
                <h3>{block.title}</h3>
                <p>{block.copy}</p>
              </article>
            ))}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
