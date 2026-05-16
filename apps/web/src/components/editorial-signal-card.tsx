import { withLang, type Lang } from "@/lib/i18n";

type EditorialSignalType = "quote" | "statement" | "question" | "manifesto";
type EditorialSignalBackground = "yellow" | "dark" | "outline";

export type EditorialSignalCardData = {
  label: string;
  text: string;
  author?: string;
  source?: string;
  type: EditorialSignalType;
  ctaLabel?: string;
  href?: string;
  backgroundMode?: EditorialSignalBackground;
};

type EditorialSignalCardProps = {
  signal: EditorialSignalCardData;
  lang: Lang;
};

function getDefaultLabel(type: EditorialSignalType, lang: Lang) {
  if (type === "question") {
    return lang === "en"
      ? "Question of the day"
      : lang === "es"
        ? "Pregunta del día"
        : lang === "el"
          ? "Ερώτηση της ημέρας"
          : lang === "ar"
            ? "سؤال اليوم"
      : lang === "tr"
        ? "Gun'un sorusu"
        : lang === "fr"
          ? "Question du jour"
          : lang === "de"
            ? "Frage des Tages"
            : "Pitanje dana";
  }

  if (type === "quote") {
    return lang === "en"
      ? "Editorial quote"
      : lang === "es"
        ? "Cita editorial"
        : lang === "el"
          ? "Δημοσιογραφικό απόσπασμα"
          : lang === "ar"
            ? "اقتباس تحريري"
      : lang === "tr"
        ? "Editor alintisi"
        : lang === "fr"
          ? "Citation editoriale"
          : lang === "de"
            ? "Redaktionelles Zitat"
            : "Urednički citat";
  }

  if (type === "manifesto") {
    return lang === "en"
      ? "Manifest"
      : lang === "es"
        ? "Manifiesto"
        : lang === "el"
          ? "Μανιφέστο"
          : lang === "ar"
            ? "بيان"
      : lang === "tr"
        ? "Manifesto"
        : lang === "fr"
          ? "Manifeste"
          : lang === "de"
            ? "Manifest"
            : "Manifest";
  }

  return lang === "en"
    ? "Editorial signal"
    : lang === "es"
      ? "Señal editorial"
      : lang === "el"
        ? "Συντακτικό σήμα"
        : lang === "ar"
          ? "إشارة تحريرية"
    : lang === "tr"
      ? "Editor sinyali"
      : lang === "fr"
        ? "Signal editorial"
        : lang === "de"
          ? "Redaktionelles Signal"
          : "Urednički signal";
}

function getDefaultCta(lang: Lang) {
  return lang === "en"
    ? "Read context"
    : lang === "es"
      ? "Leer contexto"
      : lang === "el"
        ? "Διάβασε το πλαίσιο"
        : lang === "ar"
          ? "اقرأ السياق"
    : lang === "tr"
      ? "Baglami oku"
      : lang === "fr"
        ? "Lire le contexte"
        : lang === "de"
          ? "Kontext lesen"
          : "Pročitaj kontekst";
}

function getSignalGlyph(type: EditorialSignalType) {
  if (type === "question") return "?";
  if (type === "quote") return "“";
  return "";
}

export function EditorialSignalCard({ signal, lang }: EditorialSignalCardProps) {
  const label = signal.label?.trim() || getDefaultLabel(signal.type, lang);
  const ctaLabel = signal.ctaLabel?.trim() || getDefaultCta(lang);
  const glyph = getSignalGlyph(signal.type);
  const hasMeta = Boolean(signal.author?.trim() || signal.source?.trim());
  const meta = [signal.author?.trim(), signal.source?.trim()].filter(Boolean).join(" / ");
  const href = signal.href ? withLang(signal.href, lang) : "";
  const className = [
    "editorial-signal-card",
    `editorial-signal-card--${signal.backgroundMode || "yellow"}`,
    `editorial-signal-card--${signal.type}`
  ].join(" ");

  if (href) {
    return (
      <a className={className} href={href}>
        <div className="editorial-signal-card__heading">
          <span className="eyebrow">{label}</span>
          {glyph ? <span className="editorial-signal-card__glyph" aria-hidden="true">{glyph}</span> : null}
        </div>
        <p className="editorial-signal-card__text">{signal.text}</p>
        {hasMeta ? <p className="editorial-signal-card__meta">{meta}</p> : null}
        <span className="editorial-signal-card__cta">{ctaLabel}</span>
      </a>
    );
  }

  return (
    <div className={className}>
      <div className="editorial-signal-card__heading">
        <span className="eyebrow">{label}</span>
        {glyph ? <span className="editorial-signal-card__glyph" aria-hidden="true">{glyph}</span> : null}
      </div>
      <p className="editorial-signal-card__text">{signal.text}</p>
      {hasMeta ? <p className="editorial-signal-card__meta">{meta}</p> : null}
    </div>
  );
}
