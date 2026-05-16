import type { SignalItem } from "@/lib/signals";
import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import { formatDisplayDate } from "@/lib/strapi";

type SignalCardProps = {
  signal: SignalItem;
  lang: Lang;
  ctaLabel: string;
  currentAnalysisSlug?: string;
  variant?: "homepage" | "section" | "article";
};

export function SignalCard({
  signal,
  lang,
  ctaLabel,
  currentAnalysisSlug,
  variant = "section"
}: SignalCardProps) {
  const labels = {
    sr: {
      signal: "Signal",
      source: "Izvor",
      date: "Datum",
      link: "Link",
      processing: "Obrada",
      note: "Napomena",
      sourceLinkText: "Otvori izvor"
    },
    en: {
      signal: "Signal",
      source: "Source",
      date: "Date",
      link: "Link",
      processing: "Processing",
      note: "Note",
      sourceLinkText: "Open source"
    },
    tr: {
      signal: "Sinyal",
      source: "Kaynak",
      date: "Tarih",
      link: "Baglanti",
      processing: "Isleme",
      note: "Not",
      sourceLinkText: "Kaynagi ac"
    },
    fr: {
      signal: "Signal",
      source: "Source",
      date: "Date",
      link: "Lien",
      processing: "Traitement",
      note: "Note",
      sourceLinkText: "Ouvrir la source"
    },
    de: {
      signal: "Signal",
      source: "Quelle",
      date: "Datum",
      link: "Link",
      processing: "Bearbeitung",
      note: "Hinweis",
      sourceLinkText: "Quelle oeffnen"
    },
    es: {
      signal: "Signal",
      source: "Fuente",
      date: "Fecha",
      link: "Enlace",
      processing: "Procesamiento",
      note: "Nota",
      sourceLinkText: "Abrir fuente"
    },
    el: {
      signal: "Σήμα",
      source: "Πηγή",
      date: "Ημερομηνία",
      link: "Σύνδεσμος",
      processing: "Επεξεργασία",
      note: "Σημείωση",
      sourceLinkText: "Άνοιγμα πηγής"
    },
    ar: {
      signal: "إشارة",
      source: "المصدر",
      date: "التاريخ",
      link: "الرابط",
      processing: "المعالجة",
      note: "ملاحظة",
      sourceLinkText: "افتح المصدر"
    }
  }[lang];
  const isSelfLinked = currentAnalysisSlug && signal.relatedAnalysis?.slug === currentAnalysisSlug;
  const href = variant !== "article" && !isSelfLinked && signal.href ? withLang(signal.href, lang) : "";
  const hasSourceLink = Boolean(signal.sourceUrl && (variant === "homepage" || variant === "article"));
  const usesInlineContextLink = variant === "homepage" && Boolean(href);
  const className = `panel signal-card signal-card--${variant}${href || hasSourceLink ? " signal-card--interactive" : ""}`;
  const formattedDate = signal.date ? formatDisplayDate(signal.date, lang) : "";
  const hasExtendedDetails = variant === "article" && Boolean(signal.sourceUrl || signal.methodNote || signal.editorialNote);

  const content = (
    <>
      <div className="signal-card__topline">
        {signal.topicLabel ? <span className="signal-card__pill">{signal.topicLabel}</span> : <span className="signal-card__pill">{labels.signal}</span>}
        {signal.region ? <span className="signal-card__region">{signal.region}</span> : null}
      </div>

      <div className="signal-card__value">{signal.value}</div>
      <h3 className="signal-card__title">{signal.title}</h3>
      <p className="signal-card__description">{signal.description}</p>

      <div className={`signal-card__meta${hasExtendedDetails ? " signal-card__meta--expanded" : ""}`}>
        {signal.source ? (
          <span className="signal-card__meta-item">
            <span className="signal-card__meta-label">{labels.source}:</span>
            <span className="signal-card__meta-value">{signal.source}</span>
          </span>
        ) : null}
        {formattedDate ? (
          <span className="signal-card__meta-item">
            <span className="signal-card__meta-label">{labels.date}:</span>
            <span className="signal-card__meta-value">{formattedDate}</span>
          </span>
        ) : null}
        {hasSourceLink ? (
          <span className="signal-card__meta-item">
            <span className="signal-card__meta-label">{labels.link}:</span>
            <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" className="signal-card__meta-link">
              {labels.sourceLinkText}
            </a>
          </span>
        ) : null}
        {hasExtendedDetails && signal.methodNote ? (
          <span className="signal-card__meta-item signal-card__meta-item--detail">
            <span className="signal-card__meta-label">{labels.processing}:</span>
            <span className="signal-card__meta-value">{signal.methodNote}</span>
          </span>
        ) : null}
        {hasExtendedDetails && signal.editorialNote ? (
          <span className="signal-card__meta-item signal-card__meta-item--detail">
            <span className="signal-card__meta-label">{labels.note}:</span>
            <span className="signal-card__meta-value">{signal.editorialNote}</span>
          </span>
        ) : null}
      </div>

      {usesInlineContextLink ? (
        <a href={href} className="signal-card__cta">
          {ctaLabel}
        </a>
      ) : href ? (
        <span className="signal-card__cta">{ctaLabel}</span>
      ) : null}
    </>
  );

  if (href && !usesInlineContextLink) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <article className={className}>{content}</article>;
}
