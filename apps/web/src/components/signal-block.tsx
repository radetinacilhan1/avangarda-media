import type { Lang } from "@/lib/i18n";
import type { SignalItem } from "@/lib/signals";

import { SignalCard } from "@/components/signal-card";

type SignalBlockProps = {
  lang: Lang;
  label: string;
  title: string;
  intro?: string;
  signals: SignalItem[];
  ctaLabel: string;
  variant?: "homepage" | "section" | "article";
  currentAnalysisSlug?: string;
};

export function SignalBlock({
  lang,
  label,
  title,
  intro,
  signals,
  ctaLabel,
  variant = "section",
  currentAnalysisSlug
}: SignalBlockProps) {
  if (!signals.length) {
    return null;
  }

  return (
    <section className={`section-block signal-block signal-block--${variant}`}>
      <div className="section-header signal-block__header">
        <div>
          <span className="eyebrow">{label}</span>
          <h2 className="section-title">{title}</h2>
        </div>
        {intro ? <p className="section-kicker signal-block__intro">{intro}</p> : null}
      </div>

      <div className={`signal-grid signal-grid--${variant}`}>
        {signals.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            lang={lang}
            ctaLabel={ctaLabel}
            currentAnalysisSlug={currentAnalysisSlug}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}

