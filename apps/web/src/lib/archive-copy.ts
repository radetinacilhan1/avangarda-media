import type { Lang } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getLegalCatalogueCopy } from "@/lib/legal-catalogue-copy";

export function getArchiveCopy(lang: Lang) {
  const t = getDictionary(lang);
  const archiveLabel =
    lang === "en" ? "Archive" :
    lang === "tr" ? "Arsiv" :
    lang === "fr" ? "Archives" :
    lang === "de" ? "Archiv" :
    lang === "es" ? "Archivo" :
    lang === "el" ? "Αρχείο" :
    lang === "ar" ? "الأرشيف" :
    "Arhiva";
  const archiveIntro =
    lang === "en" ? "This is where the publication becomes a record: every published story stays searchable, filterable and editorially legible." :
    lang === "tr" ? "Yayimlanan her hikaye burada bir kayda donusur: aranabilir, filtrelenebilir ve editoral olarak okunabilir kalir." :
    lang === "fr" ? "C'est ici que la publication devient archive: chaque recit publie reste consultable, filtrable et lisible editorialement." :
    lang === "de" ? "Hier wird die Publikation zum Archiv: Jede veroeffentlichte Geschichte bleibt durchsuchbar, filterbar und editorial lesbar." :
    lang === "es" ? "Aquí la publicación se convierte en archivo: cada historia publicada sigue siendo buscable, filtrable y legible editorialmente." :
    lang === "el" ? "Εδώ η δημοσίευση γίνεται αρχείο: κάθε δημοσιευμένη ιστορία παραμένει αναζητήσιμη, φιλτραρίσιμη και εκδοτικά ευανάγνωστη." :
    lang === "ar" ? "هنا تتحول المنصة إلى أرشيف: كل قصة منشورة تبقى قابلة للبحث والتصفية والقراءة التحريرية." :
    "Ovde publikacija postaje arhiva: svaki objavljen tekst ostaje pretraživ, filtriran i urednički čitljiv.";
  const highlightedLabel =
    lang === "en" ? "From the archive" :
    lang === "tr" ? "Arsivden secilen" :
    lang === "fr" ? "Depuis les archives" :
    lang === "de" ? "Aus dem Archiv" :
    lang === "es" ? "Desde el archivo" :
    lang === "el" ? "Από το αρχείο" :
    lang === "ar" ? "من الأرشيف" :
    "Iz arhive izdvajamo";
  const themesLabel =
    lang === "en" ? "Themes we follow" :
    lang === "tr" ? "Takip ettigimiz temalar" :
    lang === "fr" ? "Themes suivis" :
    lang === "de" ? "Themen im Fokus" :
    lang === "es" ? "Temas que seguimos" :
    lang === "el" ? "Θέματα που παρακολουθούμε" :
    lang === "ar" ? "الموضوعات التي نتابعها" :
    "Teme koje pratimo";
  const filtersLabel =
    lang === "en" ? "Filters" :
    lang === "tr" ? "Filtreler" :
    lang === "fr" ? "Filtres" :
    lang === "de" ? "Filter" :
    lang === "es" ? "Filtros" :
    lang === "el" ? "Φίλτρα" :
    lang === "ar" ? "الفلاتر" :
    "Filteri";
  const resetLabel =
    lang === "en" ? "Reset" :
    lang === "tr" ? "Sifirla" :
    lang === "fr" ? "Reinitialiser" :
    lang === "de" ? "Zurucksetzen" :
    lang === "es" ? "Restablecer" :
    lang === "el" ? "Επαναφορά" :
    lang === "ar" ? "إعادة ضبط" :
    "Resetuj";
  const authorFilterLabel =
    lang === "en" ? "Author" :
    lang === "tr" ? "Yazar" :
    lang === "fr" ? "Auteur" :
    lang === "de" ? "Autor" :
    lang === "es" ? "Autor" :
    lang === "el" ? "Συντάκτης" :
    lang === "ar" ? "الكاتب" :
    "Autor";
  const topicFilterLabel =
    lang === "en" ? "Topic" :
    lang === "tr" ? "Tema" :
    lang === "fr" ? "Theme" :
    lang === "de" ? "Thema" :
    lang === "es" ? "Tema" :
    lang === "el" ? "Θέμα" :
    lang === "ar" ? "الموضوع" :
    "Tema";
  const locationFilterLabel =
    lang === "en" ? "Location" :
    lang === "tr" ? "Konum" :
    lang === "fr" ? "Lieu" :
    lang === "de" ? "Ort" :
    lang === "es" ? "Ubicación" :
    lang === "el" ? "Τοποθεσία" :
    lang === "ar" ? "الموقع" :
    "Lokacija";
  const styleFilterLabel =
    lang === "en" ? "Style" :
    lang === "tr" ? "Stil" :
    lang === "fr" ? "Style" :
    lang === "de" ? "Stil" :
    lang === "es" ? "Estilo" :
    lang === "el" ? "Ύφος" :
    lang === "ar" ? "الأسلوب" :
    "Stil";
  const sortLabel =
    lang === "en" ? "Sort" :
    lang === "tr" ? "Sirala" :
    lang === "fr" ? "Tri" :
    lang === "de" ? "Sortierung" :
    lang === "es" ? "Orden" :
    lang === "el" ? "Ταξινόμηση" :
    lang === "ar" ? "الترتيب" :
    "Sortiraj";
  const newestLabel =
    lang === "en" ? "Newest first" :
    lang === "tr" ? "Once en yeni" :
    lang === "fr" ? "Plus recent d'abord" :
    lang === "de" ? "Neueste zuerst" :
    lang === "es" ? "Más recientes primero" :
    lang === "el" ? "Πρώτα τα νεότερα" :
    lang === "ar" ? "الأحدث أولاً" :
    "Najnovije prvo";
  const oldestLabel =
    lang === "en" ? "Oldest first" :
    lang === "tr" ? "Once en eski" :
    lang === "fr" ? "Plus ancien d'abord" :
    lang === "de" ? "Aelteste zuerst" :
    lang === "es" ? "Más antiguos primero" :
    lang === "el" ? "Πρώτα τα παλαιότερα" :
    lang === "ar" ? "الأقدم أولاً" :
    "Najstarije prvo";
  const applyLabel =
    lang === "en" ? "Apply filters" :
    lang === "tr" ? "Filtreleri uygula" :
    lang === "fr" ? "Appliquer" :
    lang === "de" ? "Filter anwenden" :
    lang === "es" ? "Aplicar filtros" :
    lang === "el" ? "Εφαρμογή φίλτρων" :
    lang === "ar" ? "تطبيق الفلاتر" :
    "Primeni filtere";
  const pageLabel =
    lang === "en" ? "Page" :
    lang === "tr" ? "Sayfa" :
    lang === "fr" ? "Page" :
    lang === "de" ? "Seite" :
    lang === "es" ? "Página" :
    lang === "el" ? "Σελίδα" :
    lang === "ar" ? "الصفحة" :
    "Strana";
  const prevLabel =
    lang === "en" ? "Previous" :
    lang === "tr" ? "Onceki" :
    lang === "fr" ? "Precedent" :
    lang === "de" ? "Zuruck" :
    lang === "es" ? "Anterior" :
    lang === "el" ? "Προηγούμενη" :
    lang === "ar" ? "السابق" :
    "Prethodna";
  const nextLabel =
    lang === "en" ? "Next" :
    lang === "tr" ? "Sonraki" :
    lang === "fr" ? "Suivant" :
    lang === "de" ? "Weiter" :
    lang === "es" ? "Siguiente" :
    lang === "el" ? "Επόμενη" :
    lang === "ar" ? "التالي" :
    "Sledeća";
  const emptyTitle =
    lang === "en" ? "No archive results for this combination." :
    lang === "tr" ? "Bu filtre kombinasyonu icin sonuc yok." :
    lang === "fr" ? "Aucun resultat pour cette combinaison." :
    lang === "de" ? "Keine Treffer fuer diese Kombination." :
    lang === "es" ? "No hay resultados para esta combinación." :
    lang === "el" ? "Δεν υπάρχουν αποτελέσματα για αυτόν τον συνδυασμό." :
    lang === "ar" ? "لا توجد نتائج لهذا المزيج من الفلاتر." :
    "Nema rezultata za ovu kombinaciju filtera.";
  const emptyCopy =
    lang === "en" ? "Try a broader search, remove a filter or go back to the full archive." :
    lang === "tr" ? "Daha genis bir arama deneyin, bir filtreyi kaldirin ya da tum arsive donun." :
    lang === "fr" ? "Essayez une recherche plus large, retirez un filtre ou revenez a toute l'archive." :
    lang === "de" ? "Versuche eine breitere Suche, entferne einen Filter oder gehe zum gesamten Archiv zurueck." :
    lang === "es" ? "Prueba una búsqueda más amplia, quita un filtro o vuelve al archivo completo." :
    lang === "el" ? "Δοκίμασε ευρύτερη αναζήτηση, αφαίρεσε ένα φίλτρο ή γύρισε σε όλο το αρχείο." :
    lang === "ar" ? "جرّب بحثاً أوسع أو أزل أحد الفلاتر أو ارجع إلى الأرشيف الكامل." :
    "Probaj širi pojam, skloni neki filter ili se vrati na celu arhivu.";


  const common = getLegalCatalogueCopy(lang);
  const clearFilters = {sr:"Obriši filtere",en:"Clear filters",tr:"Filtreleri temizle",fr:"Effacer les filtres",de:"Filter löschen",es:"Borrar filtros",el:"Εκκαθάριση φίλτρων",ar:"مسح عوامل التصفية"}[lang];
  return { ...common, archiveLabel, archiveIntro, highlightedLabel, themesLabel, filtersLabel, resetLabel, authorFilterLabel, topicFilterLabel, locationFilterLabel, styleFilterLabel, sortLabel, newestLabel, oldestLabel, applyLabel, pageLabel, prevLabel, nextLabel, emptyTitle, emptyCopy, clearFilters, searchPlaceholder:t.archiveSearchPlaceholder, searchLabel:({sr:"Pretraga",en:"Search",tr:"Arama",fr:"Recherche",de:"Suche",es:"Búsqueda",el:"Αναζήτηση",ar:"البحث"}[lang]), searchResults:t.searchResults, readStory:t.readStory, themesCopy:t.themesCopy, yearLabel:t.archiveYear, sectionLabel:t.allSections, pagination:archiveLabel, filterTitle:{sr:"Pretraži tekstove",en:"Search stories",tr:"Yazıları ara",fr:"Rechercher des articles",de:"Artikel suchen",es:"Buscar artículos",el:"Αναζήτηση άρθρων",ar:"البحث في المقالات"}[lang] };
}
export type ArchiveCopy = ReturnType<typeof getArchiveCopy>;
