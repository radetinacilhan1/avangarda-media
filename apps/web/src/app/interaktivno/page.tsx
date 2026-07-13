import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import listingStyles from "@/components/interactive-listing.module.css";
import powerStyles from "@/components/power-game.module.css";
import rogoznaStyles from "@/components/rogozna-game.module.css";
import waitingStyles from "@/components/waiting-room-game.module.css";
import { getInteractiveCopy } from "@/lib/interactive";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { getRogoznaCopy } from "@/lib/rogozna-interactive";
import { buildSeoMetadata } from "@/lib/seo";
import { getWaitingRoomCopy } from "@/lib/waiting-room-interactive";

type SearchParamValue = string | string[] | undefined;

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
  const rogoznaCopy = getRogoznaCopy(lang);
  const waitingCopy = getWaitingRoomCopy(lang);
  const levelLabels = copy.levels.map((level) => level.title);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno" activeNav="news" />

      <main className="site-main">
        <div className="page-shell">
          <section className={`panel subpage-hero ${listingStyles.listingHero}`}>
            <span className="eyebrow">{copy.sectionLabel}</span>
            <h1 className="subpage-hero__title">{copy.listingTitle}</h1>
            <p className="subpage-hero__copy">{copy.listingIntro}</p>
          </section>

          {copy.languageNotice ? <p className={listingStyles.languageNotice}>{copy.languageNotice}</p> : null}

          <section className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.sectionLabel}</span>
                <h2 className="section-title">{waitingCopy.collectionTitle}</h2>
                <p className={listingStyles.collectionIntro}>{waitingCopy.collectionIntro}</p>
              </div>
            </div>

            <div className={listingStyles.formatStack}>
              <a
                href={withLang("/interaktivno/moc", lang)}
                className={`panel ${powerStyles.listingCard}`}
                aria-label={`${copy.openLabel}: ${copy.gameTitle}`}
              >
                <div className={powerStyles.listingCardBody}>
                  <span className="eyebrow">{copy.typeLabel}</span>
                  <h2>{copy.gameTitle}</h2>
                  <p>{copy.gameSubtitle}</p>
                  <div className={powerStyles.listingMeta}>
                    <span>{copy.typeLabel}</span>
                    <span>{copy.durationLabel}: {copy.durationValue}</span>
                  </div>
                  <span className={powerStyles.listingCta}>{copy.openLabel}</span>
                </div>

                <div className={powerStyles.listingVisual} aria-hidden="true">
                  {levelLabels.map((label, index) => (
                    <span key={label}>{String(index + 1).padStart(2, "0")} {label}</span>
                  ))}
                </div>
              </a>

              <a
                href={withLang("/interaktivno/rogozna", lang)}
                className={`panel ${rogoznaStyles.listingCard}`}
                aria-label={`${rogoznaCopy.openLabel}: ${rogoznaCopy.gameTitle}`}
              >
                <div className={rogoznaStyles.listingCardBody}>
                  <span className="eyebrow">{rogoznaCopy.typeLabel}</span>
                  <h2>{rogoznaCopy.gameTitle}</h2>
                  <p>{rogoznaCopy.gameSubtitle}</p>
                  <div className={rogoznaStyles.listingMeta}>
                    <span>{rogoznaCopy.typeLabel}</span>
                    <span>{rogoznaCopy.durationLabel}: {rogoznaCopy.durationValue}</span>
                  </div>
                  <span className={rogoznaStyles.listingCta}>{rogoznaCopy.openLabel}</span>
                </div>

                <div className={rogoznaStyles.listingVisual} aria-hidden="true">
                  <div className={rogoznaStyles.listingPhaseIndex}>
                    {rogoznaCopy.phases.map((phase) => (
                      <span key={phase.id}>0{phase.id} / {phase.title}</span>
                    ))}
                  </div>
                  <svg viewBox="0 0 520 360" role="presentation">
                    <path className={rogoznaStyles.listingTopo} d="M24 79c65-31 101 29 159-2s110-18 151 12 96 20 161-7M17 104c58-24 113 25 174-1s103-15 152 14 91 14 158-2M21 132c63-20 112 22 171 1s107-11 151 15 94 14 153 0" />
                    <path className={rogoznaStyles.listingMountainBack} d="M13 283 96 187l62 45 78-133 78 98 62-54 131 140v65H13z" />
                    <path className={rogoznaStyles.listingMountainFront} d="M13 313 118 218l75 72 96-104 71 70 81-48 66 88v52H13z" />
                    <g className={rogoznaStyles.listingForestZone}>
                      <path d="M47 285v-76m17 76v-98m18 98v-67m18 67v-111m20 111v-84m18 84v-104m20 104v-73m20 73v-92" />
                      <path d="m38 217 9-18 9 18m-2-27 10-21 11 21m-2 21 10-23 11 23m-3-32 10-22 12 22m-2 20 11-24 11 24m-3-28 11-24 12 24m-2 21 11-22 11 22m-2-28 11-23 12 23" />
                    </g>
                    <path className={rogoznaStyles.listingCreekShadow} d="M29 314c74-33 131 19 202-8 64-25 111 21 170-5 43-19 75-13 103-3" />
                    <path className={rogoznaStyles.listingCreek} d="M29 307c74-33 131 19 202-8 64-25 111 21 170-5 43-19 75-13 103-3" />
                    <path className={rogoznaStyles.listingRoadBase} d="M402 338c-9-57-27-90-67-119-34-24-48-58-42-102" />
                    <path className={rogoznaStyles.listingRoad} d="M402 338c-9-57-27-90-67-119-34-24-48-58-42-102" />
                    <g className={rogoznaStyles.listingVillage}>
                      <path d="M205 255h20v19h-20zM231 245h25v29h-25zM262 253h19v21h-19z" />
                      <path d="m202 255 13-11 13 11m0-10 15-13 16 13m0 8 12-10 13 10" />
                    </g>
                    <g className={rogoznaStyles.listingInstitution}>
                      <rect x="381" y="49" width="101" height="57" rx="2" />
                      <path d="M393 92h77M399 81V65m19 16V65m19 16V65m19 16V65M390 62h83l-41-15z" />
                    </g>
                    <g className={rogoznaStyles.listingArchive}>
                      <path d="M428 133h59v43h-59zM421 126h59v43M414 119h59v43" />
                      <path d="M429 143h36M429 153h28M429 163h39" />
                    </g>
                    <g className={rogoznaStyles.listingTracePoints}>
                      <path d="m93 187 6 6-6 6-6-6zM229 300l6 6-6 6-6-6zM334 216l6 6-6 6-6-6z" />
                    </g>
                    <path className={rogoznaStyles.listingDisappearance} d="M322 18h182v330H366l-28-42 31-56-35-50 29-54-37-50 25-44z" />
                  </svg>
                  <span className={`${rogoznaStyles.listingMarker} ${rogoznaStyles.listingForest}`}>{rogoznaCopy.locationLabels.forest}</span>
                  <span className={`${rogoznaStyles.listingMarker} ${rogoznaStyles.listingCreekLabel}`}>{rogoznaCopy.locationLabels.creek}</span>
                  <span className={`${rogoznaStyles.listingMarker} ${rogoznaStyles.listingVillageLabel}`}>{rogoznaCopy.locationLabels.village}</span>
                  <span className={`${rogoznaStyles.listingMarker} ${rogoznaStyles.listingRoadLabel}`}>{rogoznaCopy.locationLabels.road}</span>
                  <span className={`${rogoznaStyles.listingMarker} ${rogoznaStyles.listingInstitutionLabel}`}>{rogoznaCopy.locationLabels.institution}</span>
                  <span className={`${rogoznaStyles.listingMarker} ${rogoznaStyles.listingArchiveLabel}`}>{rogoznaCopy.locationLabels.archive}</span>
                </div>
              </a>

              <a
                href={withLang("/interaktivno/cekaonica", lang)}
                className={`panel ${waitingStyles.listingCard}`}
                aria-label={`${waitingCopy.openLabel}: ${waitingCopy.gameTitle}`}
              >
                <div className={waitingStyles.listingCardBody}>
                  <span className="eyebrow">{waitingCopy.typeLabel}</span>
                  <h2>{waitingCopy.gameTitle}</h2>
                  <p>{waitingCopy.gameSubtitle}</p>
                  <div className={waitingStyles.listingMeta}>
                    <span>{waitingCopy.typeLabel}</span>
                    <span>{waitingCopy.durationLabel}: {waitingCopy.durationValue}</span>
                  </div>
                  <span className={waitingStyles.listingCta}>{waitingCopy.openLabel}</span>
                </div>

                <div className={waitingStyles.listingVisual} aria-hidden="true">
                  <div className={waitingStyles.fluorescent} />
                  <div className={waitingStyles.clock}>
                    <span className={waitingStyles.hourHand} />
                    <span className={waitingStyles.minuteHand} />
                    <i />
                  </div>
                  <div className={waitingStyles.queueDisplay}>
                    <small>{waitingCopy.queueServingLabel}</small>
                    <strong>12</strong>
                    <span>{waitingCopy.monitorMessages[0]}</span>
                  </div>
                  <div className={waitingStyles.door}><span>13</span></div>
                  <div className={waitingStyles.counter}>
                    <div className={waitingStyles.frostedGlass}><span>{waitingCopy.queueWaitingLabel}</span></div>
                    <div className={waitingStyles.counterBase} />
                  </div>
                  <div className={waitingStyles.chairs}>
                    {[31, 38, 42, 45, 53].map((person) => (
                      <div className={waitingStyles.chair} key={person}>
                        <span className={waitingStyles.person} />
                        <strong>{person}</strong>
                      </div>
                    ))}
                  </div>
                  <div className={waitingStyles.ticket}>
                    <small>{waitingCopy.queueYourNumberLabel}</small>
                    <strong>47</strong>
                  </div>
                </div>
              </a>
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
