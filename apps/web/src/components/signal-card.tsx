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
  const isSelfLinked = currentAnalysisSlug && signal.relatedAnalysis?.slug === currentAnalysisSlug;
  const href = !isSelfLinked && signal.href ? withLang(signal.href, lang) : "";
  const className = `panel signal-card signal-card--${variant}${href ? " signal-card--interactive" : ""}`;

  const content = (
    <>
      <div className="signal-card__topline">
        {signal.topicLabel ? <span className="signal-card__pill">{signal.topicLabel}</span> : <span className="signal-card__pill">Signal</span>}
        {signal.region ? <span className="signal-card__region">{signal.region}</span> : null}
      </div>

      <div className="signal-card__value">{signal.value}</div>
      <h3 className="signal-card__title">{signal.title}</h3>
      <p className="signal-card__description">{signal.description}</p>

      <div className="signal-card__meta">
        {signal.source ? <span>{signal.source}</span> : null}
        {signal.date ? <span>{formatDisplayDate(signal.date, lang)}</span> : null}
      </div>

      {href ? <span className="signal-card__cta">{ctaLabel}</span> : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <article className={className}>{content}</article>;
}

