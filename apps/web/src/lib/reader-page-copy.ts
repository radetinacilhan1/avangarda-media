import type { Lang } from "@/lib/i18n";

export const readerPageCopy: Record<Lang, { empty: string; archive: string; search: string }> = {
  sr: { empty: "Trenutno nema tekstova u ovoj rubrici. Istraži ostale priče u arhivi.", archive: "Otvori arhivu", search: "Pretraži tekstove" },
  en: { empty: "There are currently no stories in this section. Explore other stories in the archive.", archive: "Open archive", search: "Search stories" },
  tr: { empty: "Bu bölümde şu anda yazı bulunmuyor. Arşivdeki diğer hikâyeleri keşfedin.", archive: "Arşivi aç", search: "Yazılarda ara" },
  fr: { empty: "Cette rubrique ne contient pas encore d’articles. Découvrez d’autres récits dans les archives.", archive: "Ouvrir les archives", search: "Rechercher des articles" },
  de: { empty: "In dieser Rubrik gibt es derzeit keine Artikel. Entdecken Sie weitere Geschichten im Archiv.", archive: "Archiv öffnen", search: "Artikel suchen" },
  es: { empty: "Actualmente no hay artículos en esta sección. Explora otras historias en el archivo.", archive: "Abrir archivo", search: "Buscar artículos" },
  el: { empty: "Δεν υπάρχουν προς το παρόν άρθρα σε αυτή την ενότητα. Ανακαλύψτε άλλες ιστορίες στο αρχείο.", archive: "Άνοιγμα αρχείου", search: "Αναζήτηση άρθρων" },
  ar: { empty: "لا توجد مقالات في هذا القسم حاليًا. استكشف قصصًا أخرى في الأرشيف.", archive: "افتح الأرشيف", search: "ابحث في المقالات" },
};
