import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import { formatDisplayDate } from "@/lib/strapi";
import type { DocumentaryItem, DocumentaryUiCopy } from "@/lib/documentaries";

type DocumentaryFeatureCardProps = {
  lang: Lang;
  documentary: DocumentaryItem;
  copy: DocumentaryUiCopy;
  variant?: "homepage" | "page";
  archiveHref?: string;
};

function buildMetaRows(documentary: DocumentaryItem, copy: DocumentaryUiCopy, lang: Lang) {
  const rows = [];

  if (documentary.date) {
    rows.push({
      key: "date",
      label: copy.dateLabel,
      value: formatDisplayDate(documentary.date, lang),
    });
  }

  if (documentary.location) {
    rows.push({
      key: "location",
      label: copy.locationLabel,
      value: documentary.location,
    });
  }

  if (documentary.director) {
    rows.push({
      key: "director",
      label: copy.directorLabel,
      value: documentary.director,
    });
  }

  if (documentary.duration) {
    rows.push({
      key: "duration",
      label: copy.durationLabel,
      value: documentary.duration,
    });
  }

  return rows;
}

export function DocumentaryFeatureCard({
  lang,
  documentary,
  copy,
  variant = "homepage",
  archiveHref,
}: DocumentaryFeatureCardProps) {
  const metaRows = buildMetaRows(documentary, copy, lang);
  const className = `panel documentary-feature documentary-feature--${variant}`;
  const watchHref = documentary.externalUrl ?? documentary.youtubeUrl ?? documentary.embedUrl ?? undefined;

  return (
    <article className={className}>
      <div className="documentary-feature__stage">
        {documentary.embedUrl ? (
          <div className="documentary-feature__video-shell">
            <iframe
              className="documentary-feature__video"
              src={documentary.embedUrl}
              title={documentary.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : documentary.thumbnailUrl ? (
          <div className="documentary-feature__fallback">
            <img
              className="documentary-feature__fallback-image"
              src={documentary.thumbnailUrl}
              alt={documentary.title}
            />
            <div className="documentary-feature__fallback-overlay">
              <span className="documentary-feature__fallback-label">{copy.unavailableLabel}</span>
              <p>{copy.unavailableCopy}</p>
            </div>
          </div>
        ) : (
          <div className="documentary-feature__fallback documentary-feature__fallback--empty">
            <span className="documentary-feature__fallback-label">{copy.unavailableLabel}</span>
            <p>{copy.unavailableCopy}</p>
          </div>
        )}

        <div className="documentary-feature__backdrop" aria-hidden="true" />

        <div className="documentary-feature__overlay">
          <div className="documentary-feature__topline">
            <span className="eyebrow documentary-feature__eyebrow">{copy.label}</span>
            <span className="documentary-feature__cue" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M9 7.5v9l7-4.5-7-4.5Z" fill="currentColor" />
              </svg>
              <span>{copy.videoCueLabel}</span>
            </span>
          </div>

          <div className="documentary-feature__copy">
            <h2 className="documentary-feature__title">{documentary.title}</h2>
            <p className="documentary-feature__description">{documentary.description}</p>
          </div>

          <div className="documentary-feature__footer">
            {metaRows.length ? (
              <div className="documentary-feature__meta">
                {metaRows.map((row) => (
                  <div key={row.key} className="documentary-feature__meta-item">
                    <span className="documentary-feature__meta-label">{row.label}</span>
                    <span className="documentary-feature__meta-value">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="documentary-feature__actions">
              {watchHref ? (
                <a
                  className="button-primary documentary-feature__action"
                  href={watchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${copy.watchLabel}: ${documentary.title}`}
                >
                  {copy.watchLabel}
                </a>
              ) : null}

              {archiveHref ? (
                <a
                  className="button-secondary documentary-feature__action documentary-feature__action--secondary"
                  href={withLang(archiveHref, lang)}
                >
                  {copy.archiveLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
