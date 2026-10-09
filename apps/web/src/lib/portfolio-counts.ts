import type { Lang } from "@/lib/i18n";

export type PortfolioCountKind = "projects" | "articles" | "documentaries";
type Forms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
const nouns: Record<Lang, Record<PortfolioCountKind, Forms>> = {
  sr: {
    projects: { one: "projekat", few: "projekta", other: "projekata" },
    articles: { one: "tekst", few: "teksta", other: "tekstova" },
    documentaries: { one: "dokumentarac", few: "dokumentarca", other: "dokumentaraca" },
  },
  en: { projects: { one: "project", other: "projects" }, articles: { one: "article", other: "articles" }, documentaries: { one: "documentary", other: "documentaries" } },
  tr: { projects: { other: "proje" }, articles: { other: "yazı" }, documentaries: { other: "belgesel" } },
  fr: { projects: { one: "projet", other: "projets" }, articles: { one: "texte", other: "textes" }, documentaries: { one: "documentaire", other: "documentaires" } },
  de: { projects: { one: "Projekt", other: "Projekte" }, articles: { one: "Text", other: "Texte" }, documentaries: { one: "Dokumentarfilm", other: "Dokumentarfilme" } },
  es: { projects: { one: "proyecto", other: "proyectos" }, articles: { one: "texto", other: "textos" }, documentaries: { one: "documental", other: "documentales" } },
  el: { projects: { one: "έργο", other: "έργα" }, articles: { one: "κείμενο", other: "κείμενα" }, documentaries: { one: "ντοκιμαντέρ", other: "ντοκιμαντέρ" } },
  ar: {
    projects: { zero: "مشاريع", one: "مشروع", two: "مشروعان", few: "مشاريع", many: "مشروعًا", other: "مشروع" },
    articles: { zero: "نصوص", one: "نص", two: "نصان", few: "نصوص", many: "نصًا", other: "نص" },
    documentaries: { zero: "أفلام وثائقية", one: "فيلم وثائقي", two: "فيلمان وثائقيان", few: "أفلام وثائقية", many: "فيلمًا وثائقيًا", other: "فيلم وثائقي" },
  },
};
const rules = new Map<Lang, Intl.PluralRules>();
const numbers = new Map<Lang, Intl.NumberFormat>();

export function formatPortfolioCount(count: number, kind: PortfolioCountKind, lang: Lang): string {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid portfolio count");
  if (!rules.has(lang)) rules.set(lang, new Intl.PluralRules(lang));
  if (!numbers.has(lang)) numbers.set(lang, new Intl.NumberFormat(lang));
  const forms = nouns[lang][kind];
  return `${numbers.get(lang)!.format(count)} ${forms[rules.get(lang)!.select(count)] || forms.other}`;
}
