import { getAuthorNames, localizeArticle, localizeTopic } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import {
  type ImageCreditDisplay,
  type ResolvedImageCredit,
  getImageCreditDisplay,
  normalizeImageCredits,
  resolveImageAlt,
  resolveImageCaption,
} from "@/lib/image-credits";
import { getStrapiMediaUrl, strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar",
};

type LocalizedRecord = Record<string, unknown>;
type LocalizedGalleryText = Record<Lang, string>;

type GalleryLocationRecord = {
  name?: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  name_el?: string;
  name_ar?: string;
  slug?: string;
  country?: string;
  region?: string;
};

type GalleryTopicRecord = {
  name?: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  name_el?: string;
  name_ar?: string;
  slug?: string;
};

type GalleryAuthorRecord = {
  id?: number | string;
  name?: string;
  slug?: string;
};

type GalleryRelatedArticleRecord = {
  id?: number | string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  subtitle_es?: string;
  subtitle_el?: string;
  subtitle_ar?: string;
  slug?: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
  cover?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
    };
  };
};

type GallerySeoRecord = {
  seoTitle?: string;
  seoTitle_en?: string;
  seoTitle_tr?: string;
  seoTitle_fr?: string;
  seoTitle_de?: string;
  seoTitle_es?: string;
  seoTitle_el?: string;
  seoTitle_ar?: string;
  seoDescription?: string;
  seoDescription_en?: string;
  seoDescription_tr?: string;
  seoDescription_fr?: string;
  seoDescription_de?: string;
  seoDescription_es?: string;
  seoDescription_el?: string;
  seoDescription_ar?: string;
};

type GalleryRecord = {
  id?: number | string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  slug?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  description_es?: string;
  description_el?: string;
  description_ar?: string;
  galleryDate?: string;
  publishedAt?: string;
  locationSummary?: string;
  locationSummary_en?: string;
  locationSummary_tr?: string;
  locationSummary_fr?: string;
  locationSummary_de?: string;
  locationSummary_es?: string;
  locationSummary_el?: string;
  locationSummary_ar?: string;
  photographerName?: string;
  authors?: unknown;
  topics?: unknown;
  tags?: unknown;
  locations?: unknown;
  relatedArticles?: unknown;
  images?: unknown;
  shareImage?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
      small?: { url?: string };
    };
  };
  isFeatured?: boolean;
  order?: number;
  seo?: unknown;
};

export type GalleryUiCopy = {
  label: string;
  title: string;
  intro: string;
  featuredLabel: string;
  openGallery: string;
  openImage: string;
  relatedArticlesLabel: string;
  relatedGalleryLabel: string;
  allGalleriesLabel: string;
  backToArchive: string;
  locationLabel: string;
  dateLabel: string;
  photographerLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  emptyTitle: string;
  emptyCopy: string;
  copyrightLabel: string;
  imagesSingular: string;
  imagesFew: string;
  imagesPlural: string;
};

export type GalleryImageItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  downloadable: boolean;
  watermark: boolean;
  credit: ResolvedImageCredit | null;
  creditDisplay: ImageCreditDisplay | null;
};

export type GalleryRelatedArticle = {
  id: number | string;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  author?: string;
  coverUrl?: string;
};

export type GalleryTopic = {
  name: string;
  slug: string;
};

export type GalleryItem = {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  galleryDate?: string;
  publishedAt?: string;
  locationSummary?: string;
  photographerLine?: string;
  isFeatured: boolean;
  order: number;
  images: GalleryImageItem[];
  coverImage: GalleryImageItem | null;
  shareImageUrl?: string;
  relatedArticles: GalleryRelatedArticle[];
  topics: GalleryTopic[];
  seoTitle?: string;
  seoDescription?: string;
};

const galleryCopyByLang: Record<Lang, GalleryUiCopy> = {
  sr: {
    label: "Galerija",
    title: "GALERIJA",
    intro: "Fotografske sekvence, terenski tragovi i urednicki okviri koji ostaju i kada tekst stane.",
    featuredLabel: "Istaknuto",
    openGallery: "Otvori galeriju",
    openImage: "Otvori fotografiju",
    relatedArticlesLabel: "Povezani tekstovi",
    relatedGalleryLabel: "Povezana galerija",
    allGalleriesLabel: "Iz arhive",
    backToArchive: "Nazad na galeriju",
    locationLabel: "Lokacija",
    dateLabel: "Datum",
    photographerLabel: "Fotograf",
    closeLabel: "Zatvori",
    previousLabel: "Prethodna",
    nextLabel: "Sledeca",
    emptyTitle: "Galerija se priprema.",
    emptyCopy: "Prve foto-sekvence bice vidljive uskoro.",
    copyrightLabel: "Napomena o koriscenju",
    imagesSingular: "fotografija",
    imagesFew: "fotografije",
    imagesPlural: "fotografija",
  },
  en: {
    label: "Galleries",
    title: "GALLERIES",
    intro: "Photo sequences, field traces and editorial frames that keep speaking after the story ends.",
    featuredLabel: "Featured",
    openGallery: "Open gallery",
    openImage: "Open image",
    relatedArticlesLabel: "Related stories",
    relatedGalleryLabel: "Related gallery",
    allGalleriesLabel: "All galleries",
    backToArchive: "Back to galleries",
    locationLabel: "Location",
    dateLabel: "Date",
    photographerLabel: "Photographer",
    closeLabel: "Close",
    previousLabel: "Previous",
    nextLabel: "Next",
    emptyTitle: "Galleries are on the way.",
    emptyCopy: "The first photo essays will appear here soon.",
    copyrightLabel: "Usage note",
    imagesSingular: "image",
    imagesFew: "images",
    imagesPlural: "images",
  },
  tr: {
    label: "Galeriler",
    title: "GALERILER",
    intro: "Metin durduktan sonra da konusan fotograflar, saha izleri ve editoryal sekanslar.",
    featuredLabel: "One cikan",
    openGallery: "Galeriyi ac",
    openImage: "Fotografi ac",
    relatedArticlesLabel: "Baglantili metinler",
    relatedGalleryLabel: "Baglantili galeri",
    allGalleriesLabel: "Tum galeriler",
    backToArchive: "Galerilere don",
    locationLabel: "Konum",
    dateLabel: "Tarih",
    photographerLabel: "Fotograf",
    closeLabel: "Kapat",
    previousLabel: "Onceki",
    nextLabel: "Sonraki",
    emptyTitle: "Galeriler hazirlaniyor.",
    emptyCopy: "Ilk fotografik sekanslar yakinda burada olacak.",
    copyrightLabel: "Kullanim notu",
    imagesSingular: "fotograf",
    imagesFew: "fotograf",
    imagesPlural: "fotograf",
  },
  fr: {
    label: "Galeries",
    title: "GALERIES",
    intro: "Sequences photographiques, traces de terrain et cadres editoriaux qui continuent apres le texte.",
    featuredLabel: "A la une",
    openGallery: "Ouvrir la galerie",
    openImage: "Ouvrir l'image",
    relatedArticlesLabel: "Recits lies",
    relatedGalleryLabel: "Galerie liee",
    allGalleriesLabel: "Toutes les galeries",
    backToArchive: "Retour aux galeries",
    locationLabel: "Lieu",
    dateLabel: "Date",
    photographerLabel: "Photographe",
    closeLabel: "Fermer",
    previousLabel: "Precedente",
    nextLabel: "Suivante",
    emptyTitle: "Les galeries arrivent.",
    emptyCopy: "Les premieres sequences photo apparaitront bientot.",
    copyrightLabel: "Note d'usage",
    imagesSingular: "image",
    imagesFew: "images",
    imagesPlural: "images",
  },
  de: {
    label: "Galerien",
    title: "GALERIEN",
    intro: "Fotosequenzen, Feldspuren und redaktionelle Frames, die bleiben, wenn der Text endet.",
    featuredLabel: "Im Fokus",
    openGallery: "Galerie offnen",
    openImage: "Bild offnen",
    relatedArticlesLabel: "Verwandte Texte",
    relatedGalleryLabel: "Verwandte Galerie",
    allGalleriesLabel: "Alle Galerien",
    backToArchive: "Zuruck zu den Galerien",
    locationLabel: "Ort",
    dateLabel: "Datum",
    photographerLabel: "Fotograf",
    closeLabel: "Schliessen",
    previousLabel: "Zuruck",
    nextLabel: "Weiter",
    emptyTitle: "Galerien folgen.",
    emptyCopy: "Die ersten Fotostrecken erscheinen bald.",
    copyrightLabel: "Nutzungshinweis",
    imagesSingular: "Bild",
    imagesFew: "Bilder",
    imagesPlural: "Bilder",
  },
  es: {
    label: "Galerias",
    title: "GALERIAS",
    intro: "Secuencias fotograficas, huellas de campo y marcos editoriales que siguen hablando despues del texto.",
    featuredLabel: "Destacado",
    openGallery: "Abrir galeria",
    openImage: "Abrir imagen",
    relatedArticlesLabel: "Textos relacionados",
    relatedGalleryLabel: "Galeria relacionada",
    allGalleriesLabel: "Todas las galerias",
    backToArchive: "Volver a galerias",
    locationLabel: "Ubicacion",
    dateLabel: "Fecha",
    photographerLabel: "Fotografo",
    closeLabel: "Cerrar",
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
    emptyTitle: "Las galerias llegan pronto.",
    emptyCopy: "Las primeras secuencias fotograficas apareceran aqui pronto.",
    copyrightLabel: "Nota de uso",
    imagesSingular: "imagen",
    imagesFew: "imagenes",
    imagesPlural: "imagenes",
  },
  el: {
    label: "Συλλογές φωτογραφιών",
    title: "ΣΥΛΛΟΓΕΣ",
    intro: "Φωτογραφικές ακολουθίες, ίχνη πεδίου και εκδοτικά κάδρα που μένουν όταν σταματά το κείμενο.",
    featuredLabel: "Προτεινόμενο",
    openGallery: "Άνοιγμα συλλογής",
    openImage: "Άνοιγμα εικόνας",
    relatedArticlesLabel: "Σχετικά κείμενα",
    relatedGalleryLabel: "Σχετική συλλογή",
    allGalleriesLabel: "Όλες οι συλλογές",
    backToArchive: "Επιστροφή στις συλλογές",
    locationLabel: "Τοποθεσία",
    dateLabel: "Ημερομηνία",
    photographerLabel: "Φωτογράφος",
    closeLabel: "Κλείσιμο",
    previousLabel: "Προηγούμενη",
    nextLabel: "Επόμενη",
    emptyTitle: "Οι συλλογές ετοιμάζονται.",
    emptyCopy: "Οι πρώτες φωτογραφικές ακολουθίες θα εμφανιστούν σύντομα εδώ.",
    copyrightLabel: "Σημείωση χρήσης",
    imagesSingular: "εικόνα",
    imagesFew: "εικόνες",
    imagesPlural: "εικόνες",
  },
  ar: {
    label: "المعارض",
    title: "المعارض",
    intro: "تسلسلات بصرية وملاحظات ميدانية واطارات تحريرية تبقى حية بعد توقف النص.",
    featuredLabel: "مميز",
    openGallery: "افتح المعرض",
    openImage: "افتح الصورة",
    relatedArticlesLabel: "نصوص مرتبطة",
    relatedGalleryLabel: "معرض مرتبط",
    allGalleriesLabel: "كل المعارض",
    backToArchive: "العودة الى المعارض",
    locationLabel: "الموقع",
    dateLabel: "التاريخ",
    photographerLabel: "المصور",
    closeLabel: "اغلاق",
    previousLabel: "السابق",
    nextLabel: "التالي",
    emptyTitle: "المعارض قيد التحضير.",
    emptyCopy: "ستظهر اولى السلاسل الفوتوغرافية هنا قريبا.",
    copyrightLabel: "ملاحظة الاستخدام",
    imagesSingular: "صورة",
    imagesFew: "صورتان",
    imagesPlural: "صور",
  },
};

const GALLERY_POPULATE_QUERY = [
  "populate[authors]=*",
  "populate[topics]=*",
  "populate[tags]=*",
  "populate[locations]=*",
  "populate[relatedArticles][populate][authors]=*",
  "populate[relatedArticles][populate][cover]=*",
  "populate[images][populate][0]=image",
  "populate[shareImage]=*",
  "populate[seo]=*",
].join("&");

const fallbackGalleryTitle: LocalizedGalleryText = {
  sr: "Priroda u nama: Rogozna između šume, tragova seče i tišine",
  en: "Nature Within Us: Rogozna Between Forest, Logging Traces and Silence",
  tr: "İçimizdeki Doğa: Rogozna, Orman, Kesim İzleri ve Sessizlik Arasında",
  fr: "La nature en nous : Rogozna entre forêt, traces de coupe et silence",
  de: "Natur in uns: Rogozna zwischen Wald, Spuren der Abholzung und Stille",
  es: "La naturaleza en nosotros: Rogozna entre el bosque, las huellas de tala y el silencio",
  el: "Η φύση μέσα μας: Η Rogozna ανάμεσα στο δάσος, τα ίχνη υλοτομίας και τη σιωπή",
  ar: "الطبيعة في داخلنا: روغوزنا بين الغابة وآثار القطع والصمت",
};

const fallbackGalleryDescription: LocalizedGalleryText = {
  sr: [
    "Ova galerija nastala je tokom radionice „Priroda u nama”, održane u okviru aktivnosti posvećenih odnosu čoveka, prirode i lokalne zajednice. Fotografije su snimljene na Rogozni, prostoru koji za ljude ovog kraja nije samo planina, već mesto sećanja, svakodnevnog života, vode, šume i tišine.",
    "Kadrovi ne prikazuju prirodu kao razglednicu. Ovde se vidi ono što često ostaje van zvaničnih narativa: panjevi, slomljena stabla, ogoljena zemlja, otpad i tragovi ljudskog prisustva u prostoru koji bi trebalo da bude zaštićen pažnjom, a ne potrošen nemarom.",
    "Galerija je deo šireg rada Avangarde na dokumentovanju ekoloških pitanja u Sandžaku, posebno na Rogozni, gde se pitanja šuma, vode, rudarenja, lokalne zajednice i prava na zdravu životnu sredinu ne mogu posmatrati odvojeno.",
  ].join("\n\n"),
  en: [
    "This gallery was created during the “Nature Within Us” workshop, held within a wider set of activities about the relationship between people, nature and the local community. The photographs were taken on Rogozna, a space that for the people of this region is not only a mountain, but also a place of memory, everyday life, water, forest and silence.",
    "These frames do not present nature as a postcard. They show what often remains outside official narratives: tree stumps, broken trees, bare soil, waste and traces of human presence in a space that should be protected with care, not consumed by neglect.",
    "The gallery is part of Avangarda's broader work documenting environmental issues in Sandzak, especially on Rogozna, where questions of forests, water, mining, local community and the right to a healthy environment cannot be viewed separately.",
  ].join("\n\n"),
  tr: [
    "Bu galeri, insan, doğa ve yerel topluluk arasındaki ilişkiye odaklanan “İçimizdeki Doğa” atölyesi sırasında oluştu. Fotoğraflar Rogozna’da çekildi; bu bölgenin insanları için Rogozna yalnızca bir dağ değil, aynı zamanda hafızanın, gündelik yaşamın, suyun, ormanın ve sessizliğin mekânıdır.",
    "Bu kareler doğayı bir kartpostal gibi göstermiyor. Burada, resmî anlatıların dışında kalan şeyler görülüyor: ağaç kütükleri, kırılmış ağaçlar, çıplak toprak, atıklar ve özenle korunması gereken bir alandaki insan varlığının izleri.",
    "Galeri, Avangarda’nın Sandžak’taki çevre meselelerini belgeleme yönündeki daha geniş çalışmasının bir parçasıdır. Özellikle Rogozna’da orman, su, madencilik, yerel topluluk ve sağlıklı bir çevrede yaşama hakkı birbirinden ayrı düşünülemez.",
  ].join("\n\n"),
  fr: [
    "Cette galerie a été réalisée pendant l’atelier « La nature en nous », organisé autour de la relation entre l’être humain, la nature et la communauté locale. Les photographies ont été prises sur la Rogozna, un espace qui, pour les habitants de cette région, n’est pas seulement une montagne, mais aussi un lieu de mémoire, de vie quotidienne, d’eau, de forêt et de silence.",
    "Ces images ne présentent pas la nature comme une carte postale. Elles montrent ce qui reste souvent en dehors des récits officiels : des souches, des arbres brisés, un sol mis à nu, des déchets et les traces de la présence humaine dans un espace qui devrait être protégé avec attention.",
    "La galerie fait partie du travail plus large d’Avangarda consacré à la documentation des questions environnementales au Sandžak, en particulier sur la Rogozna, où les questions liées aux forêts, à l’eau, à l’exploitation minière, à la communauté locale et au droit à un environnement sain ne peuvent pas être envisagées séparément.",
  ].join("\n\n"),
  de: [
    "Diese Galerie entstand während des Workshops „Natur in uns“, der die Beziehung zwischen Mensch, Natur und lokaler Gemeinschaft in den Mittelpunkt stellte. Die Fotografien wurden auf der Rogozna aufgenommen, einem Ort, der für die Menschen dieser Region nicht nur ein Berg ist, sondern auch ein Raum der Erinnerung, des Alltags, des Wassers, des Waldes und der Stille.",
    "Die Aufnahmen zeigen Natur nicht als Postkarte. Sie zeigen das, was oft außerhalb offizieller Erzählungen bleibt: Baumstümpfe, gebrochene Bäume, freigelegten Boden, Abfall und Spuren menschlicher Präsenz in einem Raum, der mit Sorgfalt geschützt werden sollte.",
    "Die Galerie ist Teil der breiteren Arbeit von Avangarda zur Dokumentation ökologischer Fragen im Sandžak, insbesondere auf der Rogozna, wo Fragen von Wald, Wasser, Bergbau, lokaler Gemeinschaft und dem Recht auf eine gesunde Umwelt nicht getrennt voneinander betrachtet werden können.",
  ].join("\n\n"),
  es: [
    "Esta galería fue creada durante el taller «La naturaleza en nosotros», centrado en la relación entre las personas, la naturaleza y la comunidad local. Las fotografías fueron tomadas en Rogozna, un espacio que para la gente de esta región no es solo una montaña, sino también un lugar de memoria, vida cotidiana, agua, bosque y silencio.",
    "Estas imágenes no presentan la naturaleza como una postal. Muestran aquello que a menudo queda fuera de los relatos oficiales: tocones, árboles quebrados, suelo desnudo, residuos y huellas de presencia humana en un espacio que debería protegerse con cuidado.",
    "La galería forma parte del trabajo más amplio de Avangarda para documentar cuestiones ambientales en Sandžak, especialmente en Rogozna, donde las preguntas sobre los bosques, el agua, la minería, la comunidad local y el derecho a un medio ambiente saludable no pueden observarse por separado.",
  ].join("\n\n"),
  el: [
    "Αυτή η γκαλερί δημιουργήθηκε κατά τη διάρκεια του εργαστηρίου «Η φύση μέσα μας», που ήταν αφιερωμένο στη σχέση του ανθρώπου, της φύσης και της τοπικής κοινότητας. Οι φωτογραφίες τραβήχτηκαν στη Rogozna, έναν χώρο που για τους ανθρώπους αυτής της περιοχής δεν είναι μόνο βουνό, αλλά και τόπος μνήμης, καθημερινής ζωής, νερού, δάσους και σιωπής.",
    "Τα καρέ αυτά δεν παρουσιάζουν τη φύση σαν καρτ ποστάλ. Δείχνουν όσα συχνά μένουν έξω από τις επίσημες αφηγήσεις: κούτσουρα, σπασμένα δέντρα, γυμνό έδαφος, απορρίμματα και ίχνη ανθρώπινης παρουσίας σε έναν χώρο που θα έπρεπε να προστατεύεται με φροντίδα.",
    "Η γκαλερί αποτελεί μέρος της ευρύτερης δουλειάς της Avangarda για την τεκμηρίωση περιβαλλοντικών ζητημάτων στο Sandzak, ιδιαίτερα στη Rogozna, όπου τα ζητήματα των δασών, του νερού, της εξόρυξης, της τοπικής κοινότητας και του δικαιώματος σε ένα υγιές περιβάλλον δεν μπορούν να εξετάζονται ξεχωριστά.",
  ].join("\n\n"),
  ar: [
    "نشأت هذه المعرض خلال ورشة «الطبيعة في داخلنا» المخصصة للعلاقة بين الإنسان والطبيعة والمجتمع المحلي. التُقطت الصور في روغوزنا، وهي مساحة لا تمثل لسكان هذه المنطقة جبلاً فقط، بل أيضاً مكاناً للذاكرة والحياة اليومية والماء والغابة والصمت.",
    "هذه اللقطات لا تعرض الطبيعة كبطاقة بريدية. إنها تُظهر ما يبقى غالباً خارج السرديات الرسمية: جذوع الأشجار المقطوعة، الأشجار المكسورة، الأرض المكشوفة، النفايات وآثار الحضور البشري في مساحة كان ينبغي أن تُحمى بعناية.",
    "هذا المعرض جزء من العمل الأوسع الذي تقوم به Avangarda في توثيق القضايا البيئية في Sandzak، وخاصة في روغوزنا، حيث لا يمكن النظر إلى قضايا الغابات والمياه والتعدين والمجتمع المحلي والحق في بيئة صحية كقضايا منفصلة.",
  ].join("\n\n"),
};

const fallbackGalleryLocationSummary: LocalizedGalleryText = {
  sr: "Rogozna, planinski prostor između Novog Pazara i severa Kosova, važan je za lokalne zajednice zbog šuma, vode, sećanja i svakodnevnog života. Fotografije su nastale tokom terenskog dela radionice „Priroda u nama”.",
  en: "Rogozna, a mountain area between Novi Pazar and northern Kosovo, matters to local communities because of its forests, water, memory and everyday life. The photographs were taken during the field part of the “Nature Within Us” workshop.",
  tr: "Novi Pazar ile kuzey Kosova arasında yer alan dağlık Rogozna bölgesi; ormanları, su kaynakları, hafızası ve gündelik yaşamla bağı nedeniyle yerel topluluklar için önemlidir. Fotoğraflar “İçimizdeki Doğa” atölyesinin saha bölümünde çekildi.",
  fr: "La Rogozna, zone montagneuse située entre Novi Pazar et le nord du Kosovo, est importante pour les communautés locales en raison de ses forêts, de son eau, de sa mémoire et de la vie quotidienne qui s’y attache. Les photographies ont été prises pendant la partie de terrain de l’atelier « La nature en nous ».",
  de: "Die Rogozna, ein Berggebiet zwischen Novi Pazar und dem Norden Kosovos, ist für lokale Gemeinschaften wegen ihrer Wälder, ihres Wassers, ihrer Erinnerungen und des Alltagslebens wichtig. Die Fotografien entstanden während des praktischen Teils des Workshops „Natur in uns“.",
  es: "Rogozna, una zona montañosa entre Novi Pazar y el norte de Kosovo, es importante para las comunidades locales por sus bosques, su agua, su memoria y la vida cotidiana vinculada a este espacio. Las fotografías fueron tomadas durante la parte de campo del taller «La naturaleza en nosotros».",
  el: "Η Rogozna, μια ορεινή περιοχή ανάμεσα στο Novi Pazar και το βόρειο Κόσοβο, είναι σημαντική για τις τοπικές κοινότητες λόγω των δασών, των νερών, της μνήμης και της καθημερινής ζωής που συνδέονται με αυτήν. Οι φωτογραφίες τραβήχτηκαν κατά τη διάρκεια του πεδίου του εργαστηρίου «Η φύση μέσα μας».",
  ar: "روغوزنا، وهي منطقة جبلية بين نوفي بازار وشمال كوسوفو، مهمة للمجتمعات المحلية بسبب غاباتها ومياهها وذاكرتها والحياة اليومية المرتبطة بها. التُقطت الصور خلال الجزء الميداني من ورشة «الطبيعة في داخلنا».",
};

const fallbackGallerySeoTitle: LocalizedGalleryText = {
  sr: "Priroda u nama: tragovi seče na Rogozni | Avangarda",
  en: "Nature Within Us: Logging Traces on Rogozna | Avangarda",
  tr: "İçimizdeki Doğa: Rogozna’da Kesim İzleri | Avangarda",
  fr: "La nature en nous : traces de coupe sur la Rogozna | Avangarda",
  de: "Natur in uns: Spuren der Abholzung auf der Rogozna | Avangarda",
  es: "La naturaleza en nosotros: huellas de tala en Rogozna | Avangarda",
  el: "Η φύση μέσα μας: ίχνη υλοτομίας στη Rogozna | Avangarda",
  ar: "الطبيعة في داخلنا: آثار القطع في روغوزنا | Avangarda",
};

const fallbackGallerySeoDescription: LocalizedGalleryText = {
  sr: "Fotogalerija sa Rogozne nastala tokom radionice „Priroda u nama”, sa dokumentarnim kadrovima šume, panjeva, oštećenih stabala, otpada i tragova seče.",
  en: "A photo gallery from Rogozna created during the “Nature Within Us” workshop, with documentary frames of forest, tree stumps, damaged trees, waste and logging traces.",
  tr: "“İçimizdeki Doğa” atölyesi sırasında Rogozna’da nastala foto-galerija, ormanı, kütükleri, oštećena stabla, otpad i tragove seče beleži dokumentarno.",
  fr: "Une galerie photo de la Rogozna réalisée pendant l’atelier « La nature en nous », avec des images documentaires de forêt, de souches, d’arbres endommagés, de déchets et de traces de coupe.",
  de: "Eine Fotogalerie von der Rogozna, entstanden während des Workshops „Natur in uns“, mit dokumentarischen Aufnahmen von Wald, Baumstümpfen, beschädigten Bäumen, Abfall und Spuren von Holzeinschlag.",
  es: "Una galería fotográfica de Rogozna creada durante el taller «La naturaleza en nosotros», con imágenes documentales del bosque, tocones, árboles dañados, residuos y huellas de tala.",
  el: "Μια φωτογραφική γκαλερί από τη Rogozna, δημιουργημένη κατά τη διάρκεια του εργαστηρίου «Η φύση μέσα μας», με τεκμηριωτικές εικόνες δάσους, κούτσουρων, τραυματισμένων δέντρων, απορριμμάτων και ιχνών υλοτομίας.",
  ar: "معرض صور من روغوزنا أُنجز خلال ورشة «الطبيعة في داخلنا»، يضم لقطات توثيقية للغابة وجذوع الأشجار والأشجار المتضررة والنفايات وآثار القطع.",
};

const fallbackGalleryImages = [
  {
    id: "fallback-rogozna-1",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    alt: {
      sr: "Gusta šuma na Rogozni tokom terenskog dela radionice „Priroda u nama”.",
      en: "Dense forest on Rogozna during the field part of the “Nature Within Us” workshop.",
    },
    caption: {
      sr: "Šuma na Rogozni, prostor koji još uvek deluje mirno, ali već nosi tragove ljudskog pritiska.",
      en: "The forest on Rogozna, a landscape that still appears calm while already carrying traces of human pressure.",
    },
  },
  {
    id: "fallback-rogozna-2",
    src: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    alt: {
      sr: "Pogled ka krošnjama drveća na Rogozni.",
      en: "A view toward the treetops on Rogozna.",
    },
    caption: {
      sr: "Pogled ka krošnjama Rogozne, pre nego što se pažnja spusti na tragove koji ostaju na zemlji.",
      en: "A view toward Rogozna’s treetops, before the attention moves down to the traces left on the ground.",
    },
  },
  {
    id: "fallback-rogozna-3",
    src: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    alt: {
      sr: "Šumsko tlo sa granama i tragovima ljudskog prisustva.",
      en: "Forest ground with branches and traces of human presence.",
    },
    caption: {
      sr: "Kadrovi ne prikazuju prirodu kao razglednicu, već beleže ono što zvanični narativi najčešće preskoče.",
      en: "These frames do not present nature as a postcard, but document what official narratives usually skip.",
    },
  },
  {
    id: "fallback-rogozna-4",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    alt: {
      sr: "Ogoljen prostor i linije terena koje odaju pritisak na pejzaž.",
      en: "Bare terrain lines revealing pressure on the landscape.",
    },
    caption: {
      sr: "Rogozna se ovde vidi kao prostor svakodnevnog života, vode, šume i tihih tragova potrošnje.",
      en: "Rogozna appears here as a space of everyday life, water, forest and quiet traces of extraction.",
    },
  },
  {
    id: "fallback-rogozna-5",
    src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    alt: {
      sr: "Detalj šumskog prostora koji pokazuje koliko brzo nemar postaje deo pejzaža.",
      en: "A forest detail showing how quickly neglect becomes part of the landscape.",
    },
    caption: {
      sr: "Otpad, panjevi i slomljena stabla ne stoje odvojeno od šire priče o zajednici i pravu na zdravu sredinu.",
      en: "Waste, tree stumps and broken trunks cannot be separated from the wider story of community and the right to a healthy environment.",
    },
  },
  {
    id: "fallback-rogozna-6",
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    alt: {
      sr: "Tamniji završni kadar šumskog prostora na Rogozni.",
      en: "A darker closing frame of the forest landscape on Rogozna.",
    },
    caption: {
      sr: "Galerija se zatvara kao tiho pitanje o tome šta ostaje kada prirodu primetimo tek pošto je već povređena.",
      en: "The gallery closes as a quiet question about what remains when nature is noticed only after it has already been harmed.",
    },
  },
] as const;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getLocalizedGalleryText(source: Partial<LocalizedGalleryText>, lang: Lang) {
  return asText(source[lang]) || asText(source.sr) || asText(source.en);
}

function getLocalizedValue(record: LocalizedRecord, field: string, lang: Lang) {
  const baseValue = asText(record[field]);
  if (lang === "sr") return baseValue;

  const localizedValue = asText(record[`${field}${localizedSuffix[lang]}`]);
  return localizedValue || baseValue;
}

function getLocalizedLocationName(record: GalleryLocationRecord, lang: Lang) {
  if (lang === "sr") return asText(record.name);

  const keyByLang: Record<Exclude<Lang, "sr">, keyof GalleryLocationRecord> = {
    en: "name_en",
    tr: "name_tr",
    fr: "name_fr",
    de: "name_de",
    es: "name_es",
    el: "name_el",
    ar: "name_ar",
  };

  return asText(record[keyByLang[lang]]) || asText(record.name);
}

function resolveLocationSummary(record: GalleryRecord, lang: Lang) {
  const explicit = getLocalizedValue(record as LocalizedRecord, "locationSummary", lang);
  if (explicit) return explicit;

  const locations = unwrapStrapiCollection<GalleryLocationRecord>(record.locations);
  if (!locations.length) return "";

  const primary = locations[0];
  const locationName = getLocalizedLocationName(primary, lang);
  const region = asText(primary.region);
  const country = asText(primary.country);

  return [locationName, region || country].filter(Boolean).join(" / ");
}

function normalizeGalleryImages(value: unknown, lang: Lang, galleryTitle: string) {
  return normalizeImageCredits(value, lang)
    .map((credit, index): GalleryImageItem | null => {
      if (!credit.imageUrl) return null;

      return {
        id: `${galleryTitle}-${index + 1}`,
        src: credit.imageUrl,
        alt: resolveImageAlt({ credit, articleTitle: galleryTitle }),
        caption: resolveImageCaption(credit) || undefined,
        width: credit.mediaWidth,
        height: credit.mediaHeight,
        downloadable: credit.downloadable,
        watermark: credit.watermark,
        credit,
        creditDisplay: getImageCreditDisplay(credit, lang),
      };
    })
    .filter((image): image is GalleryImageItem => Boolean(image));
}

function normalizeGalleryRelatedArticles(value: unknown, lang: Lang) {
  return unwrapStrapiCollection<GalleryRelatedArticleRecord>(value)
    .map((article) => localizeArticle(article, lang))
    .filter((article) => Boolean(article.id && article.slug && article.title))
    .map((article) => ({
      id: article.id as number | string,
      title: asText(article.title),
      subtitle: asText(article.subtitle) || undefined,
      slug: asText(article.slug),
      section: asText(article.section) || undefined,
      publishedAt: asText(article.publishedAt) || undefined,
      author: getAuthorNames(article.authors).join(", ") || undefined,
      coverUrl: article.cover?.url
        ? getStrapiMediaUrl(
            article.cover.formats?.medium?.url ||
            article.cover.formats?.small?.url ||
            article.cover.url
          )
        : undefined,
    }));
}

function normalizeGalleryTopics(value: unknown, lang: Lang) {
  return unwrapStrapiCollection<GalleryTopicRecord>(value)
    .map((topic) => localizeTopic(topic, lang))
    .filter((topic) => Boolean(topic.name && topic.slug))
    .map((topic) => ({
      name: asText(topic.name),
      slug: asText(topic.slug),
    }));
}

function normalizeGallerySeo(value: unknown, lang: Lang) {
  const seo = unwrapStrapiCollection<GallerySeoRecord>(value)[0];
  if (!seo) {
    return {
      seoTitle: "",
      seoDescription: "",
    };
  }

  return {
    seoTitle: getLocalizedValue(seo as LocalizedRecord, "seoTitle", lang),
    seoDescription: getLocalizedValue(seo as LocalizedRecord, "seoDescription", lang),
  };
}

function normalizeGalleryRecord(record: GalleryRecord, lang: Lang): GalleryItem | null {
  const title = getLocalizedValue(record as LocalizedRecord, "title", lang);
  const slug = asText(record.slug);
  if (!record.id || !title || !slug) return null;

  const images = normalizeGalleryImages(record.images, lang, title);
  const coverImage = images[0] || null;
  const authorsLine = getAuthorNames(record.authors).join(", ");
  const seo = normalizeGallerySeo(record.seo, lang);
  const shareImageUrl = record.shareImage?.url
    ? getStrapiMediaUrl(
        record.shareImage.formats?.large?.url ||
        record.shareImage.formats?.medium?.url ||
        record.shareImage.formats?.small?.url ||
        record.shareImage.url
      )
    : undefined;

  return {
    id: record.id,
    title,
    slug,
    description: getLocalizedValue(record as LocalizedRecord, "description", lang),
    galleryDate: asText(record.galleryDate) || undefined,
    publishedAt: asText(record.publishedAt) || undefined,
    locationSummary: resolveLocationSummary(record, lang) || undefined,
    photographerLine: asText(record.photographerName) || authorsLine || undefined,
    isFeatured: record.isFeatured === true,
    order: typeof record.order === "number" ? record.order : 0,
    images,
    coverImage,
    shareImageUrl,
    relatedArticles: normalizeGalleryRelatedArticles(record.relatedArticles, lang),
    topics: normalizeGalleryTopics(record.topics, lang),
    seoTitle: seo.seoTitle || undefined,
    seoDescription: seo.seoDescription || undefined,
  };
}

export function normalizeGalleryCollection(value: unknown, lang: Lang) {
  return unwrapStrapiCollection<GalleryRecord>(value)
    .map((record) => normalizeGalleryRecord(record, lang))
    .filter((gallery): gallery is GalleryItem => Boolean(gallery));
}

export function getGalleryLabel(lang: Lang) {
  return galleryCopyByLang[lang].label;
}

export function getGalleryCopy(lang: Lang) {
  return galleryCopyByLang[lang];
}

export function formatGalleryImageCount(count: number, lang: Lang) {
  if (lang === "sr") {
    const mod10 = count % 10;
    const mod100 = count % 100;
    const suffix =
      count === 1 ? galleryCopyByLang[lang].imagesSingular :
      mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? galleryCopyByLang[lang].imagesFew
        : galleryCopyByLang[lang].imagesPlural;
    return `${count} ${suffix}`;
  }

  if (lang === "ar") {
    const suffix =
      count === 1
        ? galleryCopyByLang[lang].imagesSingular
        : count === 2
          ? galleryCopyByLang[lang].imagesFew
          : galleryCopyByLang[lang].imagesPlural;
    return `${count} ${suffix}`;
  }

  const suffix = count === 1 ? galleryCopyByLang[lang].imagesSingular : galleryCopyByLang[lang].imagesPlural;
  return `${count} ${suffix}`;
}

export function getGalleryHref(slug: string) {
  return `/galerije/${slug}`;
}

function buildFallbackGalleryImage(
  image: (typeof fallbackGalleryImages)[number],
  lang: Lang
): GalleryImageItem {
  return {
    id: image.id,
    src: image.src,
    alt: getLocalizedGalleryText(image.alt, lang),
    caption: getLocalizedGalleryText(image.caption, lang) || undefined,
    width: image.width,
    height: image.height,
    downloadable: false,
    watermark: true,
    credit: null,
    creditDisplay: null,
  };
}

function buildFallbackGallery(lang: Lang): GalleryItem {
  const images = fallbackGalleryImages.map((image) => buildFallbackGalleryImage(image, lang));

  return {
    id: "fallback-rogozna-gallery",
    title: getLocalizedGalleryText(fallbackGalleryTitle, lang),
    slug: "priroda-u-nama-rogozna-ilegalna-seca",
    description: getLocalizedGalleryText(fallbackGalleryDescription, lang),
    galleryDate: "2026-06-05",
    publishedAt: "2026-06-21T10:57:38.529Z",
    locationSummary: getLocalizedGalleryText(fallbackGalleryLocationSummary, lang) || undefined,
    photographerLine: "Ilhan Radetinac",
    isFeatured: true,
    order: 0,
    images,
    coverImage: images[0] || null,
    shareImageUrl: images[0]?.src,
    relatedArticles: [],
    topics: [
      {
        name: lang === "en" ? "Ecology" : "Ekologija",
        slug: "topic-1",
      },
    ],
    seoTitle: getLocalizedGalleryText(fallbackGallerySeoTitle, lang) || undefined,
    seoDescription: getLocalizedGalleryText(fallbackGallerySeoDescription, lang) || undefined,
  };
}

export async function fetchGalleryArchive(lang: Lang) {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/galleries?${GALLERY_POPULATE_QUERY}&sort[0]=isFeatured:desc&sort[1]=order:asc&sort[2]=galleryDate:desc&sort[3]=publishedAt:desc&pagination[pageSize]=100&filters[publishedAt][$notNull]=true`
  );

  const galleries = normalizeGalleryCollection(response, lang);
  if (galleries.length > 0) return galleries;

  return [buildFallbackGallery(lang)];
}

export async function fetchGalleryBySlug(slug: string, lang: Lang) {
  const response = await strapiGet<{ data?: unknown }>(
    `/api/galleries?filters[slug][$eq]=${encodeURIComponent(slug)}&${GALLERY_POPULATE_QUERY}&pagination[pageSize]=1`
  );

  const record = unwrapStrapiCollection<GalleryRecord>(response)[0];
  if (!record) {
    return slug === "priroda-u-nama-rogozna-ilegalna-seca" ? buildFallbackGallery(lang) : null;
  }

  return normalizeGalleryRecord(record, lang);
}

export function getGalleryMetaItems(gallery: GalleryItem, lang: Lang) {
  const copy = getGalleryCopy(lang);
  const meta: Array<{ label: string; value: string }> = [];

  if (gallery.galleryDate || gallery.publishedAt) {
    meta.push({
      label: copy.dateLabel,
      value: gallery.galleryDate || gallery.publishedAt || "",
    });
  }

  if (gallery.locationSummary) {
    meta.push({
      label: copy.locationLabel,
      value: gallery.locationSummary,
    });
  }

  if (gallery.photographerLine) {
    meta.push({
      label: copy.photographerLabel,
      value: gallery.photographerLine,
    });
  }

  if (gallery.images.length) {
    meta.push({
      label: copy.label,
      value: formatGalleryImageCount(gallery.images.length, lang),
    });
  }

  return meta;
}

export function getGalleryCardSectionLabel(lang: Lang) {
  return getGalleryCopy(lang).label;
}

export function getGalleryCardTopicLabel(topic: GalleryTopic) {
  return topic.name;
}

export function getGalleryCoverImage(gallery: GalleryItem) {
  return gallery.coverImage;
}

export function getGallerySeoTitle(gallery: GalleryItem) {
  return gallery.seoTitle || gallery.title;
}

export function getGallerySeoDescription(gallery: GalleryItem) {
  return gallery.seoDescription || gallery.description;
}

export function getGallerySeoImage(gallery: GalleryItem) {
  return gallery.shareImageUrl || gallery.coverImage?.src;
}
