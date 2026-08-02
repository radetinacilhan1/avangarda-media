import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SupportPaymentCard } from "@/components/support-payment-card";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { SUPPORT_EMAIL, supportPageCopy } from "@/lib/support";

type PageSearchParams = Record<string, string | string[] | undefined>;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }): Metadata {
  const lang = resolveLang(searchParams.lang);
  const copy = supportPageCopy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/podrzi",
    title: buildPageTitle(copy.title),
    description: copy.intro,
  });
}

export default function SupportPage({ searchParams }: { searchParams: PageSearchParams }) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = supportPageCopy[lang];

  return (
    <>
      <SiteHeader lang={lang} currentPath="/podrzi" />

      <main className="site-main support-page">
        <div className="page-shell support-page__shell">
          <section className="panel subpage-hero support-page__hero">
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1 className="subpage-hero__title">{copy.title}</h1>
            <p className="subpage-hero__copy">{copy.intro}</p>
          </section>

          <SupportPaymentCard copy={copy} />

          <section className="panel info-card support-page__contact" aria-labelledby="support-contact-title">
            <span className="eyebrow">NOVA SPONA</span>
            <h2 id="support-contact-title">{copy.contactTitle}</h2>
            <p>
              {copy.contactText}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
