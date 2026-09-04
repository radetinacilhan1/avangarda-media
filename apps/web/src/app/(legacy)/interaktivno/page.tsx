import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";

import listingStyles from "@/components/interactive-listing.module.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAlgorithmCopy } from "@/lib/algorithm-interactive-copy";
import { getDictionary, resolveLang, withLang, type Lang } from "@/lib/i18n";
import { getInteractiveCopy } from "@/lib/interactive";
import {
  getInteractiveCover,
  getInteractiveListingCopy,
  type InteractiveSlug,
} from "@/lib/interactive-listing";
import { getNeutralManCopy } from "@/lib/neutral-man-interactive-copy";
import { getRogoznaCopy } from "@/lib/rogozna-interactive";
import { buildSeoMetadata } from "@/lib/seo";
import { getWaitingRoomCopy } from "@/lib/waiting-room-interactive";

type SearchParamValue = string | string[] | undefined;

type ListingGame = {
  slug: InteractiveSlug;
  title: string;
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const copy = getInteractiveCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/interaktivno",
    title: `${copy.sectionLabel} | Avangarda`,
    description: copy.listingSeoDescription,
  });
}

export default function InteractiveListingPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getInteractiveCopy(lang);
  const algorithmCopy = getAlgorithmCopy(lang);
  const neutralCopy = getNeutralManCopy(lang);
  const rogoznaCopy = getRogoznaCopy(lang);
  const waitingCopy = getWaitingRoomCopy(lang);

  const games: ListingGame[] = [
    {
      slug: "moc",
      title: copy.gameTitle,
    },
    {
      slug: "neutralni-covek",
      title: neutralCopy.gameTitle,
    },
    {
      slug: "cekaonica",
      title: waitingCopy.gameTitle,
    },
    {
      slug: "algoritam",
      title: algorithmCopy.gameTitle,
    },
    {
      slug: "rogozna",
      title: rogoznaCopy.gameTitle,
    },
  ];

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno" activeNav="news" />

      <main className="site-main">
        <div className={`page-shell ${listingStyles.listingShell}`}>
          <section className={`panel subpage-hero ${listingStyles.listingHero}`}>
            <span className="eyebrow">{copy.sectionLabel}</span>
            <h1 className="subpage-hero__title">{copy.listingTitle}</h1>
            <p className="subpage-hero__copy">{copy.listingIntro}</p>
          </section>

          {copy.languageNotice ? <p className={listingStyles.languageNotice}>{copy.languageNotice}</p> : null}

          <section className={`section-block ${listingStyles.collection}`}>
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.sectionLabel}</span>
                <h2 className="section-title">{waitingCopy.collectionTitle}</h2>
                <p className={listingStyles.collectionIntro}>{waitingCopy.collectionIntro}</p>
              </div>
            </div>

            <div className={listingStyles.formatStack}>
              {games.map((game, index) => {
                const listing = getInteractiveListingCopy(lang, game.slug);
                const cover = getInteractiveCover(lang, game.slug);
                const coverImageStyle = {
                  objectFit: cover.objectFit,
                  "--cover-position-desktop": cover.objectPositionDesktop,
                  "--cover-position-mobile": cover.objectPositionMobile,
                } as CSSProperties;

                return (
                  <a
                    href={withLang(`/interaktivno/${game.slug}`, lang)}
                    className={`panel ${listingStyles.coverCard}`}
                    aria-label={`${listing.ctaLabel}: ${game.title}`}
                    key={game.slug}
                  >
                    <div className={listingStyles.coverCardBody}>
                      <span className={listingStyles.cardNumber}>{listing.number}</span>
                      <span className={listingStyles.cardFormat}>{listing.formatLabel}</span>
                      <h2 className={listingStyles.cardTitle}>{game.title}</h2>
                      <p>{listing.description}</p>
                      <div className={listingStyles.listingMeta}>
                        {listing.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                      <span className={listingStyles.listingCta}>{listing.ctaLabel}</span>
                    </div>

                    <div className={listingStyles.coverFrame}>
                      <Image
                        className={`${listingStyles.coverImage} ${cover.objectFit === "contain" ? listingStyles.coverImageContained : ""}`}
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        priority={index < 2}
                        sizes="(max-width: 980px) 100vw, (max-width: 1440px) 58vw, 820px"
                        style={coverImageStyle}
                      />
                      <span
                        className={listingStyles.coverShade}
                        aria-hidden="true"
                        style={{ opacity: cover.overlayStrength }}
                      />
                    </div>
                  </a>
                );
              })}
            </div>

            {rogoznaCopy.languageNotice ? (
              <p className={listingStyles.languageNotice}>{rogoznaCopy.languageNotice}</p>
            ) : null}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
