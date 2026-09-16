import type { Lang } from "@/lib/i18n";

const styles: Record<Lang, string[]> = {
  sr: ["Analiza", "Intervju", "Kolumna", "Reportaža", "Vest", "Esej"],
  en: ["Analysis", "Interview", "Column", "Reportage", "News", "Essay"],
  tr: ["Analiz", "Röportaj", "Köşe yazısı", "Saha haberi", "Haber", "Deneme"],
  fr: ["Analyse", "Entretien", "Chronique", "Reportage", "Actualité", "Essai"],
  de: ["Analyse", "Interview", "Kolumne", "Reportage", "Nachricht", "Essay"],
  es: ["Análisis", "Entrevista", "Columna", "Reportaje", "Noticia", "Ensayo"],
  el: ["Ανάλυση", "Συνέντευξη", "Στήλη", "Ρεπορτάζ", "Είδηση", "Δοκίμιο"],
  ar: ["تحليل", "مقابلة", "عمود", "تقرير ميداني", "خبر", "مقالة"]
};
const aliases = [ ["analiza", "analysis", "analize"], ["intervju", "interview", "intervjui"], ["kolumna", "column", "kolumne"], ["reportaža", "reportaza", "reportage"], ["vest", "news"], ["esej", "essay"] ];

export function localizeArticleStyle(value: string | undefined, lang: Lang) {
  const key = value?.trim().toLowerCase() || "";
  const index = aliases.findIndex((entries) => entries.includes(key));
  return index < 0 ? value || "" : styles[lang][index];
}
