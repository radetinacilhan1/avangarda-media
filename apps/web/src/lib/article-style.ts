import type { Lang } from "@/lib/i18n";

const styles: Record<Lang, string[]> = {
  sr: ["Analiza", "Intervju", "Kolumna", "Reportaža", "Vest", "Esej", "Komentar"],
  en: ["Analysis", "Interview", "Column", "Reportage", "News", "Essay", "Commentary"],
  tr: ["Analiz", "Röportaj", "Köşe yazısı", "Saha haberi", "Haber", "Deneme", "Yorum"],
  fr: ["Analyse", "Entretien", "Chronique", "Reportage", "Actualité", "Essai", "Commentaire"],
  de: ["Analyse", "Interview", "Kolumne", "Reportage", "Nachricht", "Essay", "Kommentar"],
  es: ["Análisis", "Entrevista", "Columna", "Reportaje", "Noticia", "Ensayo", "Comentario"],
  el: ["Ανάλυση", "Συνέντευξη", "Στήλη", "Ρεπορτάζ", "Είδηση", "Δοκίμιο", "Σχόλιο"],
  ar: ["تحليل", "مقابلة", "عمود", "تقرير ميداني", "خبر", "مقالة", "تعليق"]
};
const aliases = [ ["analiza", "analysis", "analize"], ["intervju", "interview", "intervjui"], ["kolumna", "column", "kolumne"], ["reportaža", "reportaza", "reportage"], ["vest", "news"], ["esej", "essay"], ["komentar", "commentary", "comment"] ];

export function localizeArticleStyle(value: string | undefined, lang: Lang) {
  const key = value?.trim().toLowerCase() || "";
  const index = aliases.findIndex((entries) => entries.includes(key));
  return index < 0 ? value || "" : styles[lang][index];
}
