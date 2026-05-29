import { fetchAboutPageData, fetchTeamMembers, type TeamMember } from "@/lib/about";
import { localizeTopic, getAuthorNames } from "@/lib/content";
import { fetchDocumentaryArchive, type DocumentaryItem } from "@/lib/documentaries";
import { fetchPublishedArticles, type PublishedArticle } from "@/lib/editorial";
import { fallbackTopics } from "@/lib/fallback-content";
import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import {
  buildStoryMapData,
  findStoryMapLocationQuery,
  getStoryMapLabel,
  getStoryMapLocationLink,
  type StoryMapEntry,
} from "@/lib/story-map";
import { unwrapStrapiCollection } from "@/lib/strapi";

export type SignalAssistantLink = {
  href: string;
  title: string;
  type: string;
  cta: string;
  label?: string;
};

export type SignalAssistantReply = {
  answer: string;
  links?: SignalAssistantLink[];
};

export const SIGNAL_MAX_MESSAGE_LENGTH = 280;

type TopicRecord = {
  id: number | string;
  name: string;
  slug: string;
  count: number;
};

type AssistantCopy = {
  aboutTitle: string;
  aboutFallback: string;
  authorsAnswer: string;
  documentariesAnswer: string;
  archiveAnswer: string;
  topicsAnswer: string;
  latestAnswer: string;
  impressumAnswer: string;
  contactAnswer: string;
  contributeAnswer: string;
  foundResults: string;
  siteOnly: string;
  noResults: string;
  tooLong: string;
  open: string;
  viewArchive: string;
  articleType: string;
  topicType: string;
  authorType: string;
  documentaryType: string;
  pageType: string;
  searchType: string;
  moreTopicsLabel: string;
  storyMapAnswer: string;
  storyMapLocationAnswer: string;
};

const assistantCopyByLang: Record<Lang, AssistantCopy> = {
  sr: {
    aboutTitle: "Avangarda je dokumentarno-istraživačka platforma za društvo, ljudska prava, kulturu i političke procese.",
    aboutFallback: "Avangarda je urednički vođen prostor za tekstove, intervjue, analize i dokumentarne formate.",
    authorsAnswer: "Za Avangardu pišu autorke i autori iz uredničke mreže. Kreni od ovih profila i tekstova.",
    documentariesAnswer: "Da, Avangarda ima dokumentarce i video priče. Evo najboljeg mesta da kreneš.",
    archiveAnswer: "Arhiva je najbrži ulaz u starije tekstove, teme, autore i godine.",
    topicsAnswer: "Avangarda pokriva teme koje povezuju društvo, ekologiju, identitet, rad, ljudska prava i margine.",
    latestAnswer: "Ovo su najnoviji objavljeni tekstovi koje sada možeš da otvoriš.",
    impressumAnswer: "Impresum okuplja podatke o platformi, izdavaču i uredničkoj odgovornosti.",
    contactAnswer: "Na kontakt stranici su osnovne informacije za javljanje i urednički kontakt.",
    contributeAnswer: "Ako želiš da pošalješ priču ili predlog, ovde su doprinos i kontakt redakcije.",
    foundResults: "Našao sam nekoliko relevantnih rezultata na Avangardi.",
    siteOnly: "Kompas najbolje radi kada tražiš sadržaj, autore, teme i dokumentarce na Avangardi.",
    noResults: "Trenutno ne vidim objavljen sadržaj direktno vezan za to. Probaj kroz arhivu, teme ili pretragu.",
    tooLong: "Pitanje je predugačko. Probaj sa kraćim upitom o temi, autoru, tekstu ili stranici sajta.",
    open: "Otvori",
    viewArchive: "Pogledaj više u arhivi",
    articleType: "Tekst",
    topicType: "Tema",
    authorType: "Autor",
    documentaryType: "Dokumentarac",
    pageType: "Stranica",
    searchType: "Pretraga",
    moreTopicsLabel: "Sve teme",
    storyMapAnswer: "Mapa priča okuplja tekstove i dokumentarce po lokaciji. Otvori mapu ili kreni od ovih priča.",
    storyMapLocationAnswer: "Na mapi priča imam sadržaj vezan za ovu lokaciju.",
  },
  en: {
    aboutTitle: "Avangarda is a documentary and investigative platform focused on society, human rights, culture and political processes.",
    aboutFallback: "Avangarda is an editorially guided space for stories, interviews, analysis and documentary formats.",
    authorsAnswer: "Avangarda is written by authors from the editorial network. Start with these profiles and stories.",
    documentariesAnswer: "Yes, Avangarda has documentaries and video stories. Start here.",
    archiveAnswer: "The archive is the fastest way into older stories, topics, authors and years.",
    topicsAnswer: "Avangarda covers topics that connect society, ecology, identity, labour, human rights and the margins.",
    latestAnswer: "These are the newest published stories you can open right now.",
    impressumAnswer: "The imprint gathers the platform details, publisher information and editorial responsibility.",
    contactAnswer: "The contact page gathers the basic ways to reach the editorial desk.",
    contributeAnswer: "If you want to submit a story or idea, start from the contribution and contact pages.",
    foundResults: "I found a few relevant results on Avangarda.",
    siteOnly: "Compass works best when you ask about Avangarda stories, authors, topics, documentaries and site pages.",
    noResults: "I cannot see published content directly tied to that yet. Try the archive, topics or site search.",
    tooLong: "That question is too long. Try a shorter query about a topic, author, story or page.",
    open: "Open",
    viewArchive: "View more in archive",
    articleType: "Article",
    topicType: "Topic",
    authorType: "Author",
    documentaryType: "Documentary",
    pageType: "Page",
    searchType: "Search",
    moreTopicsLabel: "All topics",
    storyMapAnswer: "The story map groups stories and documentaries by location. Open the map or start with these stories.",
    storyMapLocationAnswer: "I found story map results tied to this location.",
  },
  tr: {
    aboutTitle: "Avangarda toplum, insan hakları, kültür ve siyasal süreçlere odaklanan belgesel ve araştırmacı bir platformdur.",
    aboutFallback: "Avangarda metinler, röportajlar, analizler ve belgesel formatlar için editoryal bir alandır.",
    authorsAnswer: "Avangarda için yazan yazarlar editoryal ağın parçasıdır. Bu profillerle başlayabilirsin.",
    documentariesAnswer: "Evet, Avangarda'da belgeseller ve video hikâyeleri var. Buradan başlayabilirsin.",
    archiveAnswer: "Arşiv eski yazılara, konulara, yazarlara ve yıllara giden en hızlı yoldur.",
    topicsAnswer: "Avangarda toplum, ekoloji, kimlik, emek, insan hakları ve marjinler etrafında temalar işler.",
    latestAnswer: "Şu anda açabileceğin en yeni yayımlanmış metinler bunlar.",
    impressumAnswer: "Künye sayfası platform bilgilerini, yayıncıyı ve editoryal sorumluluğu toplar.",
    contactAnswer: "İletişim sayfasında editör ekibine ulaşmanın temel yolları var.",
    contributeAnswer: "Bir hikâye ya da fikir göndermek istiyorsan katkı ve iletişim sayfalarından başlayabilirsin.",
    foundResults: "Avangarda'da birkaç ilgili sonuç buldum.",
    siteOnly: "Pusula en iyi Avangarda'daki içerik, yazar, tema, belgesel ve sayfaları aradığında çalışır.",
    noResults: "Bununla doğrudan ilişkili yayımlanmış bir içerik şu anda görünmüyor. Arşiv, temalar veya aramayı dene.",
    tooLong: "Soru çok uzun. Tema, yazar, metin ya da sayfa hakkında daha kısa sor.",
    open: "Aç",
    viewArchive: "Arşivde daha fazlası",
    articleType: "Yazı",
    topicType: "Tema",
    authorType: "Yazar",
    documentaryType: "Belgesel",
    pageType: "Sayfa",
    searchType: "Arama",
    moreTopicsLabel: "Tüm temalar",
    storyMapAnswer: "Hikâye haritası içerikleri konuma göre toplar. Haritayı açabilir ya da bu hikâyelerle başlayabilirsin.",
    storyMapLocationAnswer: "Bu konuma bağlı hikâye haritası içerikleri buldum.",
  },
  fr: {
    aboutTitle: "Avangarda est une plateforme documentaire et d'enquête centrée sur la société, les droits humains, la culture et les processus politiques.",
    aboutFallback: "Avangarda est un espace éditorial pour des textes, entretiens, analyses et formats documentaires.",
    authorsAnswer: "Avangarda est portée par un réseau d'autrices et d'auteurs. Commence par ces profils et ces textes.",
    documentariesAnswer: "Oui, Avangarda propose des documentaires et des récits vidéo. Commence ici.",
    archiveAnswer: "Les archives sont l'entrée la plus rapide vers les anciens textes, thèmes, auteurs et années.",
    topicsAnswer: "Avangarda couvre des thèmes qui relient société, écologie, identité, travail, droits humains et marges.",
    latestAnswer: "Voici les textes les plus récents que tu peux ouvrir maintenant.",
    impressumAnswer: "L'impressum rassemble les informations sur la plateforme, l'éditeur et la responsabilité éditoriale.",
    contactAnswer: "La page contact réunit les principales voies pour joindre la rédaction.",
    contributeAnswer: "Si tu veux envoyer un récit ou une proposition, commence par les pages contribution et contact.",
    foundResults: "J'ai trouvé quelques résultats pertinents sur Avangarda.",
    siteOnly: "Boussole fonctionne le mieux quand tu cherches des contenus, auteurs, thèmes, documentaires et pages d'Avangarda.",
    noResults: "Je ne vois pas encore de contenu publié directement lié à cela. Essaie les archives, les thèmes ou la recherche.",
    tooLong: "La question est trop longue. Essaie une requête plus courte sur un thème, un auteur, un texte ou une page.",
    open: "Ouvrir",
    viewArchive: "Voir plus dans les archives",
    articleType: "Texte",
    topicType: "Thème",
    authorType: "Auteur",
    documentaryType: "Documentaire",
    pageType: "Page",
    searchType: "Recherche",
    moreTopicsLabel: "Tous les thèmes",
    storyMapAnswer: "La carte des récits rassemble textes et documentaires par lieu. Ouvre la carte ou commence par ces récits.",
    storyMapLocationAnswer: "J'ai trouvé des résultats de la carte des récits liés à ce lieu.",
  },
  de: {
    aboutTitle: "Avangarda ist eine dokumentarische und investigative Plattform zu Gesellschaft, Menschenrechten, Kultur und politischen Prozessen.",
    aboutFallback: "Avangarda ist ein redaktioneller Raum für Texte, Interviews, Analysen und dokumentarische Formate.",
    authorsAnswer: "Für Avangarda schreiben Autorinnen und Autoren aus dem redaktionellen Netzwerk. Beginne mit diesen Profilen.",
    documentariesAnswer: "Ja, Avangarda hat Dokumentarfilme und Video-Geschichten. Starte hier.",
    archiveAnswer: "Das Archiv ist der schnellste Weg zu älteren Texten, Themen, Autorinnen und Autoren sowie Jahren.",
    topicsAnswer: "Avangarda behandelt Themen rund um Gesellschaft, Ökologie, Identität, Arbeit, Menschenrechte und Marginalisierung.",
    latestAnswer: "Das sind die neuesten veröffentlichten Texte, die du jetzt öffnen kannst.",
    impressumAnswer: "Das Impressum bündelt Informationen zur Plattform, zum Herausgeber und zur redaktionellen Verantwortung.",
    contactAnswer: "Auf der Kontaktseite findest du die wichtigsten Wege zur Redaktion.",
    contributeAnswer: "Wenn du eine Geschichte oder Idee einreichen willst, starte bei Beitrag und Kontakt.",
    foundResults: "Ich habe einige passende Ergebnisse auf Avangarda gefunden.",
    siteOnly: "Kompass funktioniert am besten, wenn du nach Avangarda-Inhalten, Autorinnen und Autoren, Themen, Dokumentarfilmen und Seiten fragst.",
    noResults: "Dazu sehe ich derzeit keinen direkt passenden veröffentlichten Inhalt. Probiere Archiv, Themen oder Suche.",
    tooLong: "Die Frage ist zu lang. Versuche eine kürzere Anfrage zu Thema, Autor, Text oder Seite.",
    open: "Öffnen",
    viewArchive: "Mehr im Archiv",
    articleType: "Text",
    topicType: "Thema",
    authorType: "Autor",
    documentaryType: "Dokumentation",
    pageType: "Seite",
    searchType: "Suche",
    moreTopicsLabel: "Alle Themen",
    storyMapAnswer: "Die Karte der Geschichten bündelt Texte und Dokumentarfilme nach Ort. Öffne die Karte oder starte mit diesen Geschichten.",
    storyMapLocationAnswer: "Ich habe Story-Map-Ergebnisse zu diesem Ort gefunden.",
  },
  es: {
    aboutTitle: "Avangarda es una plataforma documental y de investigación sobre sociedad, derechos humanos, cultura y procesos políticos.",
    aboutFallback: "Avangarda es un espacio editorial para textos, entrevistas, análisis y formatos documentales.",
    authorsAnswer: "Avangarda reúne a autoras y autores de su red editorial. Empieza por estos perfiles y textos.",
    documentariesAnswer: "Sí, Avangarda tiene documentales e historias en video. Empieza aquí.",
    archiveAnswer: "El archivo es la vía más rápida hacia textos anteriores, temas, autores y años.",
    topicsAnswer: "Avangarda cubre temas que conectan sociedad, ecología, identidad, trabajo, derechos humanos y márgenes.",
    latestAnswer: "Estos son los textos más recientes que puedes abrir ahora.",
    impressumAnswer: "El impresum reúne la información de la plataforma, el editor y la responsabilidad editorial.",
    contactAnswer: "La página de contacto reúne las formas principales de escribir a la redacción.",
    contributeAnswer: "Si quieres enviar una historia o propuesta, empieza por contribución y contacto.",
    foundResults: "Encontré algunos resultados relevantes en Avangarda.",
    siteOnly: "Brújula funciona mejor cuando buscas contenidos, autores, temas, documentales y páginas de Avangarda.",
    noResults: "Todavía no veo contenido publicado directamente relacionado con eso. Prueba el archivo, los temas o la búsqueda.",
    tooLong: "La pregunta es demasiado larga. Prueba con una consulta más corta sobre un tema, autor, texto o página.",
    open: "Abrir",
    viewArchive: "Ver más en el archivo",
    articleType: "Texto",
    topicType: "Tema",
    authorType: "Autor",
    documentaryType: "Documental",
    pageType: "Página",
    searchType: "Búsqueda",
    moreTopicsLabel: "Todos los temas",
    storyMapAnswer: "El mapa de historias reúne textos y documentales por ubicación. Abre el mapa o empieza por estas historias.",
    storyMapLocationAnswer: "Encontré resultados del mapa de historias vinculados con este lugar.",
  },
  el: {
    aboutTitle: "Η Avangarda είναι μια ντοκιμαντερίστικη και ερευνητική πλατφόρμα για την κοινωνία, τα ανθρώπινα δικαιώματα, τον πολιτισμό και τις πολιτικές διαδικασίες.",
    aboutFallback: "Η Avangarda είναι ένας επιμελημένος χώρος για κείμενα, συνεντεύξεις, αναλύσεις και ντοκιμαντερίστικες μορφές.",
    authorsAnswer: "Για την Avangarda γράφουν μέλη του συντακτικού της δικτύου. Ξεκίνα από αυτά τα προφίλ και κείμενα.",
    documentariesAnswer: "Ναι, η Avangarda έχει ντοκιμαντέρ και video stories. Ξεκίνα από εδώ.",
    archiveAnswer: "Το αρχείο είναι ο γρηγορότερος δρόμος προς παλαιότερα κείμενα, θέματα, συγγραφείς και έτη.",
    topicsAnswer: "Η Avangarda καλύπτει θέματα που συνδέουν κοινωνία, οικολογία, ταυτότητα, εργασία, ανθρώπινα δικαιώματα και περιθώρια.",
    latestAnswer: "Αυτά είναι τα πιο πρόσφατα δημοσιευμένα κείμενα που μπορείς να ανοίξεις τώρα.",
    impressumAnswer: "Το impressum συγκεντρώνει τα στοιχεία της πλατφόρμας, του εκδότη και της συντακτικής ευθύνης.",
    contactAnswer: "Στη σελίδα επικοινωνίας θα βρεις τους βασικούς τρόπους να επικοινωνήσεις με τη σύνταξη.",
    contributeAnswer: "Αν θέλεις να στείλεις ιστορία ή πρόταση, ξεκίνα από τη σελίδα συνεισφοράς και επικοινωνίας.",
    foundResults: "Βρήκα μερικά σχετικά αποτελέσματα στην Avangarda.",
    siteOnly: "Η Πυξίδα λειτουργεί καλύτερα όταν ζητάς περιεχόμενο, συγγραφείς, θέματα, ντοκιμαντέρ και σελίδες της Avangarda.",
    noResults: "Δεν βλέπω ακόμη δημοσιευμένο περιεχόμενο που να συνδέεται άμεσα με αυτό. Δοκίμασε αρχείο, θέματα ή αναζήτηση.",
    tooLong: "Η ερώτηση είναι πολύ μεγάλη. Δοκίμασε ένα πιο σύντομο ερώτημα για θέμα, συγγραφέα, κείμενο ή σελίδα.",
    open: "Άνοιγμα",
    viewArchive: "Δες περισσότερα στο αρχείο",
    articleType: "Κείμενο",
    topicType: "Θέμα",
    authorType: "Συγγραφέας",
    documentaryType: "Ντοκιμαντέρ",
    pageType: "Σελίδα",
    searchType: "Αναζήτηση",
    moreTopicsLabel: "Όλα τα θέματα",
    storyMapAnswer: "Ο χάρτης ιστοριών συγκεντρώνει κείμενα και ντοκιμαντέρ ανά τοποθεσία. Άνοιξε τον χάρτη ή ξεκίνα από αυτές τις ιστορίες.",
    storyMapLocationAnswer: "Βρήκα αποτελέσματα του χάρτη ιστοριών που συνδέονται με αυτή την τοποθεσία.",
  },
  ar: {
    aboutTitle: "أفانغاردا منصة وثائقية وتحقيقية تركّز على المجتمع وحقوق الإنسان والثقافة والعمليات السياسية.",
    aboutFallback: "أفانغاردا مساحة تحريرية للنصوص والمقابلات والتحليلات والأشكال الوثائقية.",
    authorsAnswer: "يكتب لأفانغاردا كتّاب وكاتبات من الشبكة التحريرية. ابدأ بهذه الصفحات والنصوص.",
    documentariesAnswer: "نعم، لدى أفانغاردا وثائقيات وقصص فيديو. ابدأ من هنا.",
    archiveAnswer: "الأرشيف هو أسرع مدخل إلى النصوص الأقدم والموضوعات والكتّاب والسنوات.",
    topicsAnswer: "تغطي أفانغاردا موضوعات تربط المجتمع والبيئة والهوية والعمل وحقوق الإنسان والهوامش.",
    latestAnswer: "هذه أحدث النصوص المنشورة التي يمكنك فتحها الآن.",
    impressumAnswer: "تجمع صفحة بيانات النشر معلومات المنصة والناشر والمسؤولية التحريرية.",
    contactAnswer: "في صفحة الاتصال ستجد الطرق الأساسية للوصول إلى هيئة التحرير.",
    contributeAnswer: "إذا أردت إرسال قصة أو مقترح، ابدأ من صفحة المساهمة والاتصال.",
    foundResults: "وجدت بعض النتائج ذات الصلة على أفانغاردا.",
    siteOnly: "تعمل البوصلة بأفضل شكل عندما تبحث عن محتوى أفانغاردا وكتّابها وموضوعاتها ووثائقياتها وصفحاتها.",
    noResults: "لا أرى حالياً محتوى منشوراً مرتبطاً بهذا بشكل مباشر. جرّب الأرشيف أو الموضوعات أو البحث.",
    tooLong: "السؤال طويل جداً. جرّب سؤالاً أقصر عن موضوع أو كاتب أو نص أو صفحة.",
    open: "افتح",
    viewArchive: "شاهد المزيد في الأرشيف",
    articleType: "نص",
    topicType: "موضوع",
    authorType: "كاتب",
    documentaryType: "وثائقي",
    pageType: "صفحة",
    searchType: "بحث",
    moreTopicsLabel: "كل الموضوعات",
    storyMapAnswer: "تجمع خريطة القصص النصوص والوثائقيات حسب الموقع. افتح الخريطة أو ابدأ بهذه القصص.",
    storyMapLocationAnswer: "وجدت نتائج في خريطة القصص مرتبطة بهذا المكان.",
  },
};

const stopwordsByLang: Record<Lang, Set<string>> = {
  sr: new Set(["sta", "šta", "je", "su", "ima", "li", "prikazi", "prikaži", "pronadi", "pronađi", "nadji", "nađi", "tekst", "tekstove", "mi", "o", "ko", "koji", "koje", "gde", "gdje", "kako", "da", "za", "u", "na", "sa", "od", "imate", "avangarda"]),
  en: new Set(["what", "is", "are", "find", "show", "me", "stories", "story", "articles", "article", "about", "who", "writes", "where", "how", "can", "i", "the", "site", "content", "do", "you", "have", "avangarda"]),
  tr: new Set(["nedir", "ne", "var", "goster", "göster", "bana", "hikaye", "hikâye", "yazi", "yazı", "yazilar", "yazılar", "kim", "nerede", "nasil", "nasıl", "ve", "ile", "icin", "için", "avangarda"]),
  fr: new Set(["quoi", "quest", "que", "qui", "ou", "où", "comment", "trouve", "montre", "moi", "histoire", "histoires", "texte", "textes", "sur", "site", "contenu", "avangarda"]),
  de: new Set(["was", "ist", "gibt", "zeige", "mir", "texte", "text", "artikel", "zu", "wer", "wie", "wo", "der", "die", "das", "und", "avangarda"]),
  es: new Set(["que", "qué", "hay", "muestrame", "muéstrame", "busca", "encuentra", "texto", "textos", "articulo", "artículo", "articulos", "artículos", "sobre", "quien", "quién", "como", "cómo", "donde", "dónde", "sitio", "contenido", "avangarda"]),
  el: new Set(["τι", "ειναι", "είναι", "βρες", "δείξε", "μου", "κείμενα", "κειμενα", "άρθρα", "αρθρα", "ποιος", "ποιοι", "πού", "που", "πως", "πώς", "για", "στην", "στο", "avangarda"]),
  ar: new Set(["ما", "ماذا", "هل", "هناك", "اعرض", "أعرض", "ابحث", "أبحث", "عن", "من", "اين", "أين", "كيف", "الى", "إلى", "في", "على", "لدى", "لديكم", "ماذا", "افانغاردا"]),
};

const pageIntentKeywords: Record<
  Lang,
  {
    about: string[];
    impressum: string[];
    contact: string[];
    authors: string[];
    contribute: string[];
    documentaries: string[];
    archive: string[];
    latest: string[];
    topics: string[];
    storyMap: string[];
  }
> = {
  sr: {
    about: ["sta je avangarda", "šta je avangarda", "o avangardi", "sta je signal"],
    impressum: ["impresum"],
    contact: ["kontakt", "javi", "email", "imejl"],
    authors: ["ko pise", "ko piše", "autori", "pisu za avangardu", "piše za avangardu"],
    contribute: ["posaljem pricu", "pošaljem priču", "posaljem tekst", "pošaljem tekst", "kako da posaljem", "kako da pošaljem"],
    documentaries: ["dokumentarac", "dokumentarci", "film", "video prica", "video priča"],
    archive: ["arhiva", "stari tekstovi", "stariji tekstovi"],
    latest: ["najnoviji", "najnovije", "poslednji tekstovi", "novi tekstovi"],
    topics: ["koje teme", "teme pokrivate", "tema pokrivate", "sta pokrivate", "šta pokrivate"],
    storyMap: ["mapa priča", "mapa prica", "mapa tekstova", "mapa lokacija", "mapu priča", "mapu prica", "pokaži mi mapu priča", "prikazi mi mapu priča", "prikaži mi mapu priča"],
  },
  en: {
    about: ["what is avangarda", "about avangarda"],
    impressum: ["imprint", "impressum"],
    contact: ["contact", "email", "reach you"],
    authors: ["who writes", "authors", "writers"],
    contribute: ["submit a story", "send a story", "contribute"],
    documentaries: ["documentary", "documentaries", "video story", "video stories"],
    archive: ["archive", "older stories"],
    latest: ["latest", "newest", "recent stories"],
    topics: ["what topics", "which topics", "topics do you cover"],
    storyMap: ["story map", "map of stories", "stories by place"],
  },
  tr: {
    about: ["avangarda nedir", "avangarda hakkinda", "avangarda hakkında"],
    impressum: ["kunye", "künye", "impressum"],
    contact: ["iletisim", "iletişim", "eposta", "mail"],
    authors: ["kim yaziyor", "kim yazıyor", "yazarlar"],
    contribute: ["hikaye gonder", "hikâye gönder", "katki", "katkı", "yazi gonder", "yazı gönder"],
    documentaries: ["belgesel", "belgeseller", "video hikaye", "video hikâye"],
    archive: ["arsiv", "arşiv"],
    latest: ["en yeni", "son yazilar", "son yazılar"],
    topics: ["hangi temalar", "neleri kapsiyorsunuz", "neleri kapsıyorsunuz"],
    storyMap: ["hikâye haritası", "hikaye haritasi", "konuma göre hikâyeler"],
  },
  fr: {
    about: ["quest ce qu avangarda", "qu est ce qu avangarda", "a propos d avangarda", "à propos d avangarda"],
    impressum: ["impressum"],
    contact: ["contact", "email", "ecrire", "écrire"],
    authors: ["qui ecrit", "qui écrit", "auteurs"],
    contribute: ["envoyer une histoire", "proposer une histoire", "soumettre une histoire"],
    documentaries: ["documentaire", "documentaires", "video", "vidéo"],
    archive: ["archives"],
    latest: ["les plus recents", "les plus récents", "derniers textes"],
    topics: ["quels themes", "quels thèmes", "themes couvrez", "thèmes couvrez"],
    storyMap: ["carte des récits", "carte des recits", "récits par lieu"],
  },
  de: {
    about: ["was ist avangarda", "uber avangarda", "über avangarda"],
    impressum: ["impressum"],
    contact: ["kontakt", "email", "erreichen"],
    authors: ["wer schreibt", "autorinnen", "autoren"],
    contribute: ["geschichte einreichen", "beitrag senden", "story senden"],
    documentaries: ["dokumentarfilm", "dokumentarfilme", "video"],
    archive: ["archiv"],
    latest: ["neueste", "aktuellste", "neuste texte"],
    topics: ["welche themen", "themen deckt ihr ab"],
    storyMap: ["karte der geschichten", "geschichten nach ort"],
  },
  es: {
    about: ["que es avangarda", "qué es avangarda", "sobre avangarda"],
    impressum: ["impresum", "impressum"],
    contact: ["contacto", "correo", "email"],
    authors: ["quien escribe", "quién escribe", "autores"],
    contribute: ["enviar una historia", "mandar una historia", "colaborar"],
    documentaries: ["documental", "documentales", "video"],
    archive: ["archivo"],
    latest: ["mas recientes", "más recientes", "ultimos textos", "últimos textos"],
    topics: ["que temas", "qué temas", "temas cubren"],
    storyMap: ["mapa de historias", "historias por lugar", "historias por ubicación"],
  },
  el: {
    about: ["τι ειναι avangarda", "τι είναι avangarda", "σχετικα με avangarda", "σχετικά με avangarda"],
    impressum: ["impressum"],
    contact: ["επικοινωνια", "επικοινωνία", "email"],
    authors: ["ποιος γραφει", "ποιος γράφει", "συγγραφεις", "συγγραφείς"],
    contribute: ["στειλω ιστορια", "στείλω ιστορία", "υποβαλω ιστορια", "υποβάλω ιστορία"],
    documentaries: ["ντοκιμαντερ", "ντοκιμαντέρ", "βιντεο", "βίντεο"],
    archive: ["αρχειο", "αρχείο"],
    latest: ["τελευταια", "τελευταία", "νεοτερα", "νεότερα"],
    topics: ["ποια θεματα", "ποια θέματα", "θεματα καλυπτετε", "θέματα καλύπτετε"],
    storyMap: ["χάρτης ιστοριών", "ιστορίες ανά τοποθεσία"],
  },
  ar: {
    about: ["ما هي افانغاردا", "ما هي أفانغاردا", "عن افانغاردا", "عن أفانغاردا"],
    impressum: ["بيانات النشر", "الامبريسوم", "الإمبريسوم", "impressum"],
    contact: ["اتصال", "تواصل", "راسل", "بريد"],
    authors: ["من يكتب", "الكتاب", "الكتّاب"],
    contribute: ["ارسل قصة", "أرسل قصة", "كيف ارسل", "كيف أرسل", "مساهمة"],
    documentaries: ["وثائقي", "وثائقيات", "فيلم", "فيديو"],
    archive: ["الارشيف", "الأرشيف"],
    latest: ["الاحدث", "الأحدث", "احدث النصوص", "أحدث النصوص"],
    topics: ["ما الموضوعات", "ما المواضيع", "ما القضايا", "ما الذي تغطونه"],
    storyMap: ["خريطة القصص", "القصص حسب المكان"],
  },
};

function getAssistantCopy(lang: Lang) {
  return assistantCopyByLang[lang];
}

function normalizeMessage(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clampMessage(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, SIGNAL_MAX_MESSAGE_LENGTH * 2);
}

function extractTokens(value: string, lang: Lang) {
  const stopwords = stopwordsByLang[lang];
  return Array.from(
    new Set(
      normalizeMessage(value)
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length > 2 && !stopwords.has(token))
    )
  );
}

function hasAny(text: string, candidates: string[]) {
  return candidates.some((candidate) => text.includes(normalizeMessage(candidate)));
}

function wantsStoryMap(text: string, lang: Lang, candidates: string[]) {
  if (hasAny(text, candidates)) {
    return true;
  }

  const labelTokens = normalizeMessage(getStoryMapLabel(lang))
    .split(" ")
    .filter((token) => token.length > 2);

  return labelTokens.length > 0 && labelTokens.every((token) => text.includes(token));
}

function getRelationRecords(value: unknown) {
  return unwrapStrapiCollection<{ name?: string; slug?: string }>(value)
    .map((item) => ({
      name: typeof item.name === "string" ? item.name.trim() : "",
      slug: typeof item.slug === "string" ? item.slug.trim() : "",
    }))
    .filter((item) => item.name || item.slug);
}

function buildArticleHaystack(article: PublishedArticle) {
  const authors = getAuthorNames(article.authors);
  const topics = getRelationRecords(article.topics).map((topic) => topic.name);
  const locations = getRelationRecords(article.locations).map((location) => location.name);

  return normalizeMessage(
    [
      article.title,
      article.subtitle,
      article.content,
      article.focus,
      article.style,
      article.section,
      ...authors,
      ...topics,
      ...locations,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getTopicSignature(topic: TopicRecord, lang: Lang) {
  const localized = localizeTopic(topic, lang);
  const aliases = new Set<string>();
  for (const value of [topic.slug, topic.name, localized.name, topic.slug.replace(/-/g, " ")]) {
    if (typeof value === "string" && value.trim()) {
      aliases.add(normalizeMessage(value));
    }
  }

  return {
    ...localized,
    slug: topic.slug,
    count: topic.count,
    aliases: Array.from(aliases),
  };
}

function findMatchingTopic(message: string, lang: Lang, topics: TopicRecord[]) {
  const normalized = normalizeMessage(message);
  const tokens = extractTokens(message, lang);
  let best:
    | (ReturnType<typeof getTopicSignature> & {
        score: number;
      })
    | null = null;

  for (const topic of topics) {
    const signature = getTopicSignature(topic, lang);
    let score = 0;

    for (const alias of signature.aliases) {
      if (!alias) continue;
      if (normalized.includes(alias)) {
        score = Math.max(score, 10 + Math.min(alias.length, 6));
      }

      for (const token of tokens) {
        if (token === alias) {
          score = Math.max(score, 9);
        } else {
          const shared = longestSharedPrefix(token, alias);
          if (shared >= 5) {
            score = Math.max(score, 5 + shared);
          }
        }
      }
    }

    if (!best || score > best.score) {
      best = { ...signature, score };
    }
  }

  return best && best.score >= 6 ? best : null;
}

function longestSharedPrefix(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let count = 0;
  for (let index = 0; index < limit; index += 1) {
    if (left[index] !== right[index]) break;
    count += 1;
  }
  return count;
}

function scoreArticle(article: PublishedArticle, query: string, tokens: string[]) {
  const haystack = buildArticleHaystack(article);
  const title = normalizeMessage(article.title);
  const subtitle = normalizeMessage(article.subtitle || "");
  const topics = getRelationRecords(article.topics).map((topic) => normalizeMessage(`${topic.name} ${topic.slug}`));
  const authors = getAuthorNames(article.authors).map((name) => normalizeMessage(name));

  let score = 0;
  if (query && title.includes(query)) score += 24;
  if (query && subtitle.includes(query)) score += 16;
  if (query && haystack.includes(query)) score += 10;

  for (const token of tokens) {
    if (title.includes(token)) score += 8;
    else if (subtitle.includes(token)) score += 6;
    else if (topics.some((topic) => topic.includes(token))) score += 7;
    else if (authors.some((author) => author.includes(token))) score += 6;
    else if (haystack.includes(token)) score += 2;
  }

  return score;
}

function comparePublishedDates(left?: string, right?: string) {
  const leftTime = left ? Date.parse(left) : 0;
  const rightTime = right ? Date.parse(right) : 0;
  return rightTime - leftTime;
}

function buildTopicsIndex(articles: PublishedArticle[], lang: Lang): TopicRecord[] {
  const seen = new Map<string, TopicRecord>();

  for (const fallbackTopic of fallbackTopics) {
    if (!fallbackTopic.slug || !fallbackTopic.name) continue;
    seen.set(fallbackTopic.slug, {
      id: String(fallbackTopic.id ?? fallbackTopic.slug),
      name: localizeTopic(fallbackTopic, lang).name || fallbackTopic.name,
      slug: fallbackTopic.slug,
      count: 0,
    });
  }

  for (const article of articles) {
    for (const topic of getRelationRecords(article.topics)) {
      const slug = topic.slug || normalizeMessage(topic.name).replace(/\s+/g, "-");
      if (!slug) continue;

      const existing = seen.get(slug);
      if (existing) {
        existing.count += 1;
        if (!existing.name && topic.name) existing.name = topic.name;
      } else {
        seen.set(slug, {
          id: slug,
          name: topic.name || slug,
          slug,
          count: 1,
        });
      }
    }
  }

  return Array.from(seen.values())
    .filter((topic) => topic.slug && topic.name)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function makeLink(copy: AssistantCopy, title: string, href: string, type: string): SignalAssistantLink {
  return {
    href,
    title,
    type,
    cta: copy.open,
    label: title,
  };
}

function withQueryLang(path: string, lang: Lang, query?: Record<string, string>) {
  const url = new URL(`https://avangarda.media${withLang(path, lang)}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value.trim()) url.searchParams.set(key, value);
  }
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function limitLinks(links: SignalAssistantLink[], max = 4) {
  return links.slice(0, max);
}

function trimAnswer(value: string, max = 220) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function mapAuthorLink(member: TeamMember, lang: Lang, copy: AssistantCopy): SignalAssistantLink {
  return makeLink(copy, member.fullName, withLang(`/people/${member.slug}`, lang), copy.authorType);
}

function mapArticleLink(article: PublishedArticle, lang: Lang, copy: AssistantCopy): SignalAssistantLink {
  return makeLink(copy, article.title, withLang(`/a/${article.slug}`, lang), copy.articleType);
}

function mapTopicLink(topic: { name: string; slug: string }, lang: Lang, copy: AssistantCopy): SignalAssistantLink {
  return makeLink(copy, topic.name, withLang(`/topic/${topic.slug}`, lang), copy.topicType);
}

function mapDocumentaryLink(documentary: DocumentaryItem, lang: Lang, copy: AssistantCopy): SignalAssistantLink {
  return makeLink(copy, documentary.title, withLang("/dokumentarci", lang), copy.documentaryType);
}

function mapStoryMapEntryLink(entry: StoryMapEntry, copy: AssistantCopy): SignalAssistantLink {
  return makeLink(
    copy,
    entry.title,
    entry.href,
    entry.type === "documentary" ? copy.documentaryType : copy.articleType
  );
}

function findAuthorMatches(message: string, authors: TeamMember[], lang: Lang) {
  const normalized = normalizeMessage(message);
  const tokens = extractTokens(message, lang);

  return authors
    .map((author) => {
      const name = normalizeMessage(author.fullName);
      let score = 0;
      if (normalized.includes(name)) score += 14;
      for (const token of tokens) {
        if (name.includes(token)) score += token.length > 4 ? 7 : 3;
      }

      return { author, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

function findDocumentaryMatches(message: string, documentaries: DocumentaryItem[], lang: Lang) {
  const query = normalizeMessage(message);
  const tokens = extractTokens(message, lang);

  return documentaries
    .map((documentary) => {
      const haystack = normalizeMessage(
        [documentary.title, documentary.description, documentary.location, documentary.director].filter(Boolean).join(" ")
      );

      let score = 0;
      if (query && haystack.includes(query)) score += 12;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 4;
      }

      return { documentary, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

function buildSearchFallback(message: string, lang: Lang, copy: AssistantCopy): SignalAssistantReply {
  return {
    answer: copy.siteOnly,
    links: [
      makeLink(copy, copy.viewArchive, withLang("/archive", lang), copy.pageType),
      makeLink(copy, copy.moreTopicsLabel, withLang("/topics", lang), copy.topicType),
      makeLink(copy, copy.searchType, withQueryLang("/search", lang, { q: message }), copy.searchType),
    ],
  };
}

export async function getSignalAssistantReply(input: {
  message: string;
  lang: Lang;
  currentPath?: string;
}): Promise<SignalAssistantReply> {
  const lang = input.lang;
  const copy = getAssistantCopy(lang);
  const message = clampMessage(input.message);
  const normalizedMessage = normalizeMessage(message);

  if (!normalizedMessage) {
    return { answer: copy.siteOnly };
  }

  if (message.length > SIGNAL_MAX_MESSAGE_LENGTH) {
    return { answer: copy.tooLong };
  }

  const [articlesResult, authorsResult, documentariesResult] = await Promise.allSettled([
    fetchPublishedArticles(lang, 160),
    fetchTeamMembers(lang),
    fetchDocumentaryArchive(lang),
  ]);
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const authors = authorsResult.status === "fulfilled" ? authorsResult.value : [];
  const documentaries = documentariesResult.status === "fulfilled" ? documentariesResult.value : [];

  const topics = buildTopicsIndex(articles, lang);
  const storyMap = (() => {
    try {
      return buildStoryMapData({ articles, documentaries, lang });
    } catch {
      return buildStoryMapData({ articles: [], documentaries: [], lang });
    }
  })();
  const pageIntents = pageIntentKeywords[lang];

  if (hasAny(normalizedMessage, pageIntents.impressum)) {
    return {
      answer: copy.impressumAnswer,
      links: [makeLink(copy, copy.impressumAnswer, withLang("/impresum", lang), copy.pageType)],
    };
  }

  if (hasAny(normalizedMessage, pageIntents.contact)) {
    return {
      answer: copy.contactAnswer,
      links: [makeLink(copy, copy.contactAnswer, withLang("/contact", lang), copy.pageType)],
    };
  }

  if (hasAny(normalizedMessage, pageIntents.contribute)) {
    return {
      answer: copy.contributeAnswer,
      links: [
        makeLink(copy, copy.contributeAnswer, withLang("/contribute", lang), copy.pageType),
        makeLink(copy, copy.contactAnswer, withLang("/contact", lang), copy.pageType),
      ],
    };
  }

  if (hasAny(normalizedMessage, pageIntents.about)) {
    const aboutPage = await fetchAboutPageData(lang);
    const aboutAnswer = trimAnswer(aboutPage.intro || aboutPage.whoWeAreText || copy.aboutTitle);
    return {
      answer: aboutAnswer || copy.aboutTitle,
      links: [makeLink(copy, aboutPage.title || copy.aboutFallback, withLang("/o-nama", lang), copy.pageType)],
    };
  }

  if (hasAny(normalizedMessage, pageIntents.authors)) {
    const topAuthors = authors.slice(0, 3);
    return {
      answer:
        topAuthors.length > 0
          ? `${copy.authorsAnswer} ${topAuthors.map((author) => author.fullName).join(", ")}.`
          : copy.authorsAnswer,
      links: limitLinks([
        ...topAuthors.map((author) => mapAuthorLink(author, lang, copy)),
        makeLink(copy, copy.authorsAnswer, withLang("/o-nama#ljudi", lang), copy.pageType),
      ]),
    };
  }

  if (hasAny(normalizedMessage, pageIntents.documentaries)) {
    const topDocumentaries = documentaries.slice(0, 3);
    return {
      answer: copy.documentariesAnswer,
      links: limitLinks([
        ...topDocumentaries.map((documentary) => mapDocumentaryLink(documentary, lang, copy)),
        makeLink(copy, copy.documentariesAnswer, withLang("/dokumentarci", lang), copy.pageType),
      ]),
    };
  }

  if (hasAny(normalizedMessage, pageIntents.archive)) {
    return {
      answer: copy.archiveAnswer,
      links: [
        makeLink(copy, copy.viewArchive, withLang("/archive", lang), copy.pageType),
        makeLink(copy, copy.searchType, withQueryLang("/search", lang, { q: message }), copy.searchType),
      ],
    };
  }

  if (hasAny(normalizedMessage, pageIntents.latest)) {
    const latestArticles = articles.slice(0, 3);
    return {
      answer: copy.latestAnswer,
      links: limitLinks([
        ...latestArticles.map((article) => mapArticleLink(article, lang, copy)),
        makeLink(copy, copy.viewArchive, withLang("/archive", lang), copy.pageType),
      ]),
    };
  }

  if (hasAny(normalizedMessage, pageIntents.topics)) {
    const topTopics = topics.slice(0, 4);
    return {
      answer: copy.topicsAnswer,
      links: limitLinks([
        ...topTopics.map((topic) => mapTopicLink(topic, lang, copy)),
        makeLink(copy, copy.moreTopicsLabel, withLang("/topics", lang), copy.pageType),
      ]),
    };
  }

  const matchedLocation = findStoryMapLocationQuery(message, lang);
  if (matchedLocation) {
    const locationGroup = storyMap.groups.find((group) => group.slug === matchedLocation.slug);

    if (locationGroup) {
      return {
        answer: `${copy.storyMapLocationAnswer} ${locationGroup.name}.`,
        links: limitLinks([
          makeLink(
            copy,
            `${getStoryMapLabel(lang)}: ${locationGroup.name}`,
            getStoryMapLocationLink(locationGroup.slug, lang),
            copy.pageType
          ),
          ...locationGroup.entries.slice(0, 3).map((entry) => mapStoryMapEntryLink(entry, copy)),
          makeLink(copy, copy.searchType, locationGroup.searchHref, copy.searchType),
        ]),
      };
    }

    return {
      answer: `${copy.storyMapLocationAnswer} ${matchedLocation.name}.`,
      links: limitLinks([
        makeLink(
          copy,
          `${getStoryMapLabel(lang)}: ${matchedLocation.name}`,
          getStoryMapLocationLink(matchedLocation.slug, lang),
          copy.pageType
        ),
        makeLink(copy, copy.searchType, withQueryLang("/search", lang, { q: matchedLocation.canonicalName }), copy.searchType),
      ]),
    };
  }

  if (wantsStoryMap(normalizedMessage, lang, pageIntents.storyMap)) {
    const featuredMapLinks = storyMap.groups
      .slice(0, 3)
      .flatMap((group) => group.entries.slice(0, 1))
      .slice(0, 3)
      .map((entry) => mapStoryMapEntryLink(entry, copy));

    return {
      answer: copy.storyMapAnswer,
      links: limitLinks([
        makeLink(copy, getStoryMapLabel(lang), withLang("/mapa", lang), copy.pageType),
        ...featuredMapLinks,
      ]),
    };
  }

  const matchedTopic = findMatchingTopic(message, lang, topics);
  if (matchedTopic) {
    const relatedArticles = articles
      .filter((article) =>
        getRelationRecords(article.topics).some(
          (topic) => topic.slug === matchedTopic.slug || normalizeMessage(topic.name) === normalizeMessage(matchedTopic.name)
        )
      )
      .sort((left, right) => comparePublishedDates(left.publishedAt, right.publishedAt))
      .slice(0, 4);

    if (relatedArticles.length) {
      return {
        answer: `${copy.foundResults} ${matchedTopic.name}.`,
        links: limitLinks([
          mapTopicLink(matchedTopic, lang, copy),
          ...relatedArticles.map((article) => mapArticleLink(article, lang, copy)),
        ]),
      };
    }
  }

  const authorMatches = findAuthorMatches(message, authors, lang);
  if (authorMatches.length) {
    const bestAuthor = authorMatches[0]?.author;
    const authorArticles = bestAuthor?.relatedArticles?.slice(0, 2) ?? [];

    return {
      answer: `${copy.foundResults} ${bestAuthor.fullName}.`,
      links: limitLinks([
        mapAuthorLink(bestAuthor, lang, copy),
        ...authorArticles
          .filter((article) => article.slug && article.title)
          .map((article) => makeLink(copy, article.title, withLang(`/a/${article.slug}`, lang), copy.articleType)),
      ]),
    };
  }

  const documentaryMatches = findDocumentaryMatches(message, documentaries, lang);
  if (documentaryMatches.length) {
    return {
      answer: copy.documentariesAnswer,
      links: limitLinks([
        ...documentaryMatches.slice(0, 3).map((item) => mapDocumentaryLink(item.documentary, lang, copy)),
        makeLink(copy, copy.documentariesAnswer, withLang("/dokumentarci", lang), copy.pageType),
      ]),
    };
  }

  const normalizedQuery = normalizeMessage(message);
  const tokens = extractTokens(message, lang);
  const scoredArticles = articles
    .map((article) => ({
      article,
      score: scoreArticle(article, normalizedQuery, tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || comparePublishedDates(left.article.publishedAt, right.article.publishedAt));

  if (scoredArticles.length) {
    const topArticles = scoredArticles.slice(0, 4).map((item) => item.article);
    return {
      answer: copy.foundResults,
      links: limitLinks([
        ...topArticles.map((article) => mapArticleLink(article, lang, copy)),
        makeLink(copy, copy.searchType, withQueryLang("/search", lang, { q: message }), copy.searchType),
      ]),
    };
  }

  const searchPrompt = trimAnswer(message, 80);
  return {
    answer: copy.noResults,
    links: [
      makeLink(copy, copy.viewArchive, withLang("/archive", lang), copy.pageType),
      makeLink(copy, copy.moreTopicsLabel, withLang("/topics", lang), copy.pageType),
      makeLink(copy, `${copy.searchType}: ${searchPrompt}`, withQueryLang("/search", lang, { q: message }), copy.searchType),
    ],
  };
}
