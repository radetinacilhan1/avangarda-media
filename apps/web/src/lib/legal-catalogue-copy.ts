import type { Lang } from "@/lib/i18n";
import { getFrameworkLabel, getLegalResourceTypeLabel, type LegalResourceFramework, type LegalResourceType } from "@/lib/human-rights";

export const legalCatalogueTypes: LegalResourceType[] = ["law", "guide", "template", "explainer", "international_document", "official_source", "other"];
export const legalCatalogueFrameworks: LegalResourceFramework[] = ["serbia", "regional", "international", "eu", "council_of_europe", "un", "other"];

export function getLegalCatalogueLabels(lang: Lang) {
  return {
    types: Object.fromEntries(legalCatalogueTypes.map((value) => [value, getLegalResourceTypeLabel(value, lang)])),
    frameworks: Object.fromEntries(legalCatalogueFrameworks.map((value) => [value, getFrameworkLabel(value, lang)])),
  };
}

const copy = {
  sr: { results: "Pronađeno: {total}", range: "Prikazano {from}–{to} od {total}", page: "Strana {page} od {pages}", previous: "Prethodna", next: "Sledeća", pagination: "Strane pravnih resursa", active: "Aktivni filteri", remove: "Ukloni filter", cleared: "Poništeni nekompatibilni ili nevažeći filteri:", loading: "Osvežavanje rezultata…", error: "Rezultati trenutno nisu dostupni. Pokušajte ponovo.", retry: "Pokušaj ponovo" },
  en: { results: "Results: {total}", range: "Showing {from}–{to} of {total}", page: "Page {page} of {pages}", previous: "Previous", next: "Next", pagination: "Legal resource pages", active: "Active filters", remove: "Remove filter", cleared: "Incompatible or invalid filters cleared:", loading: "Updating results…", error: "Results are temporarily unavailable. Please try again.", retry: "Try again" },
  tr: { results: "Sonuç: {total}", range: "{total} sonuçtan {from}–{to} arası", page: "Sayfa {page} / {pages}", previous: "Önceki", next: "Sonraki", pagination: "Hukuki kaynak sayfaları", active: "Etkin filtreler", remove: "Filtreyi kaldır", cleared: "Uyumsuz veya geçersiz filtreler temizlendi:", loading: "Sonuçlar güncelleniyor…", error: "Sonuçlara şu anda ulaşılamıyor. Lütfen tekrar deneyin.", retry: "Tekrar dene" },
  fr: { results: "Résultats : {total}", range: "Affichage de {from} à {to} sur {total}", page: "Page {page} sur {pages}", previous: "Précédente", next: "Suivante", pagination: "Pages des ressources juridiques", active: "Filtres actifs", remove: "Supprimer le filtre", cleared: "Filtres incompatibles ou non valides supprimés :", loading: "Actualisation des résultats…", error: "Les résultats sont temporairement indisponibles. Veuillez réessayer.", retry: "Réessayer" },
  de: { results: "Ergebnisse: {total}", range: "{from}–{to} von {total}", page: "Seite {page} von {pages}", previous: "Zurück", next: "Weiter", pagination: "Seiten der Rechtsressourcen", active: "Aktive Filter", remove: "Filter entfernen", cleared: "Unvereinbare oder ungültige Filter entfernt:", loading: "Ergebnisse werden aktualisiert…", error: "Die Ergebnisse sind vorübergehend nicht verfügbar. Bitte erneut versuchen.", retry: "Erneut versuchen" },
  es: { results: "Resultados: {total}", range: "Mostrando {from}–{to} de {total}", page: "Página {page} de {pages}", previous: "Anterior", next: "Siguiente", pagination: "Páginas de recursos jurídicos", active: "Filtros activos", remove: "Eliminar filtro", cleared: "Filtros incompatibles o no válidos eliminados:", loading: "Actualizando resultados…", error: "Los resultados no están disponibles temporalmente. Inténtalo de nuevo.", retry: "Reintentar" },
  el: { results: "Αποτελέσματα: {total}", range: "Εμφάνιση {from}–{to} από {total}", page: "Σελίδα {page} από {pages}", previous: "Προηγούμενη", next: "Επόμενη", pagination: "Σελίδες νομικών πόρων", active: "Ενεργά φίλτρα", remove: "Αφαίρεση φίλτρου", cleared: "Καταργήθηκαν ασύμβατα ή μη έγκυρα φίλτρα:", loading: "Ενημέρωση αποτελεσμάτων…", error: "Τα αποτελέσματα δεν είναι προσωρινά διαθέσιμα. Δοκιμάστε ξανά.", retry: "Δοκιμή ξανά" },
  ar: { results: "النتائج: {total}", range: "عرض {from}–{to} من {total}", page: "الصفحة {page} من {pages}", previous: "السابقة", next: "التالية", pagination: "صفحات الموارد القانونية", active: "عوامل التصفية النشطة", remove: "إزالة عامل التصفية", cleared: "أُزيلت عوامل التصفية غير المتوافقة أو غير الصالحة:", loading: "جارٍ تحديث النتائج…", error: "النتائج غير متاحة مؤقتًا. يُرجى المحاولة مجددًا.", retry: "المحاولة مجددًا" },
};

export type LegalCatalogueCopy = (typeof copy)["en"];
export function getLegalCatalogueCopy(lang: Lang): LegalCatalogueCopy { return copy[lang]; }
