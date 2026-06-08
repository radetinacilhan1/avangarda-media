import { fetchAboutPageData, fetchTeamMembers, getFallbackTeamMembers, getPeopleChrome, type TeamMember } from "@/lib/about";
import { localizeTopic, getAuthorNames } from "@/lib/content";
import { fetchDocumentaryArchive, type DocumentaryItem } from "@/lib/documentaries";
import { fetchPublishedArticles, type PublishedArticle } from "@/lib/editorial";
import { fallbackTopics } from "@/lib/fallback-content";
import {
  fetchHumanRightsCatalog,
  fetchLegalResources,
  getHumanRightsLabel,
  getLegalCompassLabel,
  type HumanRightItem,
  type LegalResourceItem,
} from "@/lib/human-rights";
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

const imageRightsAnswerByLang: Record<Lang, string> = {
  sr: "Fotografije i druge slike na Avangardi su zaštićene. Pogledaj kredit ispod slike, a za preuzimanje, ponovnu objavu ili dozvolu kontaktiraj redakciju.",
  en: "Photographs and other images on Avangarda are protected. Check the credit below the image, and contact the editorial team if you need permission to download or republish it.",
  tr: "Avangarda'daki fotoğraflar ve diğer görseller korunmaktadır. Görselin altındaki kredi bilgisine bakın; indirme veya yeniden kullanım izni için editoryal ekiple iletişime geçin.",
  fr: "Les photographies et autres visuels publiés sur Avangarda sont protégés. Consulte le crédit sous l'image et contacte la rédaction pour toute autorisation de téléchargement ou de republication.",
  de: "Fotos und andere Bilder auf Avangarda sind geschützt. Prüfe den Bildnachweis unter dem Bild und kontaktiere die Redaktion, wenn du eine Erlaubnis zum Herunterladen oder zur Wiederveröffentlichung brauchst.",
  es: "Las fotografías y demás imágenes publicadas en Avangarda están protegidas. Revisa el crédito debajo de la imagen y contacta con la redacción si necesitas permiso para descargarla o reutilizarla.",
  el: "Οι φωτογραφίες και οι λοιπές εικόνες στην Avangarda προστατεύονται. Δες την πίστωση κάτω από την εικόνα και επικοινώνησε με τη σύνταξη αν χρειάζεσαι άδεια για λήψη ή αναδημοσίευση.",
  ar: "الصور والعناصر البصرية المنشورة على أفانغاردا محمية. راجع سطر الاعتماد أسفل الصورة، ولأي إذن بالتحميل أو إعادة النشر تواصل مع هيئة التحرير.",
};

const imageRightsLinkLabelByLang: Record<Lang, { terms: string; contact: string }> = {
  sr: { terms: "Uslovi korišćenja", contact: "Kontakt" },
  en: { terms: "Terms of use", contact: "Contact" },
  tr: { terms: "Kullanım koşulları", contact: "İletişim" },
  fr: { terms: "Conditions d'utilisation", contact: "Contact" },
  de: { terms: "Nutzungsbedingungen", contact: "Kontakt" },
  es: { terms: "Términos de uso", contact: "Contacto" },
  el: { terms: "Όροι χρήσης", contact: "Επικοινωνία" },
  ar: { terms: "شروط الاستخدام", contact: "اتصل بنا" },
};

const imageRightsKeywordsByLang: Record<Lang, string[]> = {
  sr: [
    "mogu li da preuzmem fotografiju",
    "mogu li da preuzmem sliku",
    "mogu li da skinem sliku",
    "mogu li da skinem fotografiju",
    "čija je slika",
    "cija je slika",
    "čija je fotografija",
    "cija je fotografija",
    "ko je autor fotografije",
    "ko je autor slike",
    "autorska prava za sliku",
  ],
  en: [
    "can i download the photo",
    "can i download the image",
    "who owns this image",
    "who owns this photo",
    "who took this photo",
    "image rights",
    "photo rights",
  ],
  tr: [
    "fotografi indirebilir miyim",
    "gorseli indirebilir miyim",
    "bu fotograf kime ait",
    "bu gorsel kime ait",
    "fotografin sahibi kim",
  ],
  fr: [
    "puis je telecharger la photo",
    "puis je telecharger l image",
    "a qui appartient cette photo",
    "qui est l auteur de cette image",
  ],
  de: [
    "kann ich das foto herunterladen",
    "kann ich das bild herunterladen",
    "wem gehoert dieses bild",
    "wer hat dieses foto gemacht",
  ],
  es: [
    "puedo descargar la foto",
    "puedo descargar la imagen",
    "de quien es esta foto",
    "quien hizo esta imagen",
  ],
  el: [
    "μπορω να κατεβασω τη φωτογραφια",
    "μπορω να κατεβασω την εικονα",
    "σε ποιον ανηκει αυτη η φωτογραφια",
    "ποιος τραβηξε αυτη τη φωτογραφια",
  ],
  ar: [
    "هل يمكنني تنزيل الصورة",
    "هل يمكنني تحميل الصورة",
    "لمن تعود هذه الصورة",
    "من صاحب هذه الصورة",
  ],
};

const imageAssetWordsByLang: Record<Lang, string[]> = {
  sr: ["slika", "sliku", "slike", "fotografija", "fotografiju", "fotografije"],
  en: ["image", "images", "photo", "photos", "photograph"],
  tr: ["gorsel", "gorseli", "fotograf", "fotografi", "fotografi"],
  fr: ["image", "photo", "photos", "photographie"],
  de: ["bild", "bilder", "foto", "fotos", "fotografie"],
  es: ["imagen", "imagenes", "foto", "fotos", "fotografia"],
  el: ["εικονα", "εικονες", "φωτογραφια", "φωτο", "φωτογραφιες"],
  ar: ["صورة", "صور", "صوره", "فوتوغراف", "فوتوغرافية"],
};

const imageRightsActionWordsByLang: Record<Lang, string[]> = {
  sr: ["preuzmem", "skinem", "download", "autorska prava", "autor", "cija", "čija", "vlasnik", "dozvola"],
  en: ["download", "owner", "owns", "author", "rights", "permission", "reuse"],
  tr: ["indir", "sahibi", "hak", "izin", "yeniden kullan"],
  fr: ["telecharger", "proprietaire", "droits", "autorisation", "auteur"],
  de: ["herunterladen", "inhaber", "rechte", "erlaubnis", "autor"],
  es: ["descargar", "autor", "derechos", "permiso", "propietario"],
  el: ["κατεβασω", "δικαιωματα", "αδεια", "ποιος", "ανηκει"],
  ar: ["تنزيل", "تحميل", "حقوق", "اذن", "إذن", "صاحب", "تعود"],
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

type AuthorIntent = "founder" | "cv" | "contact" | "articles" | "projects" | "documentaries" | "profile" | "default";

const authorIntentKeywordsByLang: Record<
  Lang,
  {
    founder: string[];
    cv: string[];
    contact: string[];
    articles: string[];
    projects: string[];
    documentaries: string[];
    profile: string[];
  }
> = {
  sr: {
    founder: ["osnivac", "osnivač", "ko je osnivac", "ko je osnivač"],
    cv: ["cv", "biografija", "rezime", "resume"],
    contact: ["kontakt", "email", "imejl", "javi", "telefon"],
    articles: ["tekstovi", "tekst", "clanci", "članci", "pisao", "piše", "pise"],
    projects: ["projekti", "projekat", "radovi"],
    documentaries: ["dokumentarci", "dokumentarac", "filmovi", "video"],
    profile: ["ko je", "profil", "portfolio", "biografija autora"],
  },
  en: {
    founder: ["founder", "who founded", "who is the founder"],
    cv: ["cv", "resume", "curriculum vitae"],
    contact: ["contact", "email", "reach", "phone"],
    articles: ["articles", "stories", "texts", "written by"],
    projects: ["projects", "project work"],
    documentaries: ["documentaries", "documentary", "videos"],
    profile: ["who is", "profile", "portfolio", "about the author"],
  },
  tr: {
    founder: ["kurucu", "kim kurdu", "kurucusu"],
    cv: ["cv", "ozgecmis", "özgeçmiş", "resume"],
    contact: ["iletisim", "iletişim", "email", "telefon"],
    articles: ["yazilar", "yazılar", "metinler", "yazdigi", "yazdığı"],
    projects: ["projeler", "proje"],
    documentaries: ["belgeseller", "belgesel", "videolar"],
    profile: ["kimdir", "profil", "portfolyo"],
  },
  fr: {
    founder: ["fondateur", "qui a fonde", "qui a fondé"],
    cv: ["cv", "curriculum vitae", "resume", "résumé"],
    contact: ["contact", "email", "telephone", "téléphone"],
    articles: ["articles", "textes", "ecrits", "écrits"],
    projects: ["projets", "projet"],
    documentaries: ["documentaires", "documentaire", "videos", "vidéos"],
    profile: ["qui est", "profil", "portfolio"],
  },
  de: {
    founder: ["grunder", "gründer", "wer ist der gründer", "wer ist der grunder"],
    cv: ["cv", "lebenslauf", "resume"],
    contact: ["kontakt", "email", "telefon", "erreichen"],
    articles: ["texte", "artikel", "geschrieben von"],
    projects: ["projekte", "projekt"],
    documentaries: ["dokumentarfilme", "dokumentarfilm", "videos"],
    profile: ["wer ist", "profil", "portfolio"],
  },
  es: {
    founder: ["fundador", "quien es el fundador", "quién es el fundador"],
    cv: ["cv", "curriculum", "resume", "curriculum vitae"],
    contact: ["contacto", "correo", "telefono", "teléfono"],
    articles: ["textos", "articulos", "artículos", "escritos por"],
    projects: ["proyectos", "proyecto"],
    documentaries: ["documentales", "documental", "videos"],
    profile: ["quien es", "quién es", "perfil", "portafolio"],
  },
  el: {
    founder: ["ιδρυτης", "ιδρυτής", "ποιος ειναι ο ιδρυτης", "ποιος είναι ο ιδρυτής"],
    cv: ["cv", "βιογραφικο", "βιογραφικό", "resume"],
    contact: ["επικοινωνια", "επικοινωνία", "email", "τηλεφωνο", "τηλέφωνο"],
    articles: ["κειμενα", "κείμενα", "αρθρα", "άρθρα", "εγραψε", "έγραψε"],
    projects: ["εργα", "έργα", "προτζεκτ"],
    documentaries: ["ντοκιμαντερ", "ντοκιμαντέρ", "βιντεο", "βίντεο"],
    profile: ["ποιος ειναι", "ποιος είναι", "προφιλ", "προφίλ", "portfolio"],
  },
  ar: {
    founder: ["المؤسس", "من هو المؤسس", "من أسس"],
    cv: ["cv", "السيرة الذاتية", "الـ cv"],
    contact: ["اتصال", "تواصل", "بريد", "هاتف"],
    articles: ["النصوص", "المقالات", "كتب", "كتبه"],
    projects: ["المشاريع", "المشروع"],
    documentaries: ["الوثائقيات", "الوثائقي", "الفيديو"],
    profile: ["من هو", "الملف", "الملف المهني", "البورتفوليو"],
  },
};

function getAssistantCopy(lang: Lang) {
  return assistantCopyByLang[lang];
}

function wantsImageRightsInfo(text: string, lang: Lang) {
  return (
    hasAny(text, imageRightsKeywordsByLang[lang]) ||
    (hasAny(text, imageAssetWordsByLang[lang]) && hasAny(text, imageRightsActionWordsByLang[lang]))
  );
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

const humanRightsIntentKeywordsByLang: Record<Lang, string[]> = {
  sr: ["ljudska prava", "pravo na", "prava u srbiji"],
  en: ["human rights", "right to", "rights in serbia"],
  tr: ["insan haklari", "insan hakları", "hakki", "hakkı"],
  fr: ["droits humains", "droits de l homme", "droits de l'homme"],
  de: ["menschenrechte", "recht auf"],
  es: ["derechos humanos", "derecho a"],
  el: ["ανθρωπινα δικαιωματα", "ανθρώπινα δικαιώματα", "δικαιωμα", "δικαίωμα"],
  ar: ["حقوق الانسان", "حقوق الإنسان", "الحق في"],
};

const legalCompassIntentKeywordsByLang: Record<Lang, string[]> = {
  sr: ["pravni kompas", "pravni resursi", "zakon", "zakoni", "pravni vodič", "pravni vodic"],
  en: ["legal compass", "legal resources", "law", "legal guide", "official source"],
  tr: ["hukuk pusulasi", "hukuk pusulası", "hukuk rehberi", "yasa", "resmi kaynak"],
  fr: ["boussole juridique", "ressources juridiques", "loi", "source officielle"],
  de: ["rechtskompass", "rechtliche ressourcen", "gesetz", "offizielle quelle"],
  es: ["brujula legal", "brújula legal", "recursos legales", "ley", "fuente oficial"],
  el: ["νομικη πυξιδα", "νομική πυξίδα", "νομικοι ποροι", "νομικοί πόροι", "νομος", "νόμος"],
  ar: ["البوصلة القانونية", "موارد قانونية", "قانون", "مصدر رسمي"],
};

function wantsHumanRightsPage(text: string, lang: Lang) {
  if (hasAny(text, humanRightsIntentKeywordsByLang[lang])) {
    return true;
  }

  const labelTokens = normalizeMessage(getHumanRightsLabel(lang))
    .split(" ")
    .filter((token) => token.length > 2);

  return labelTokens.length > 0 && labelTokens.every((token) => text.includes(token));
}

function wantsLegalCompassPage(text: string, lang: Lang) {
  if (hasAny(text, legalCompassIntentKeywordsByLang[lang])) {
    return true;
  }

  const labelTokens = normalizeMessage(getLegalCompassLabel(lang))
    .split(" ")
    .filter((token) => token.length > 2);

  return labelTokens.length > 0 && labelTokens.every((token) => text.includes(token));
}

function getHumanRightsAssistantAnswer(lang: Lang) {
  switch (lang) {
    case "en":
      return "The human rights section explains rights through everyday life, institutions and social context.";
    case "tr":
      return "İnsan hakları bölümü, hakları gündelik yaşam, kurumlar ve toplumsal bağlam üzerinden açıklar.";
    case "fr":
      return "La section droits humains explique les droits à travers la vie quotidienne, les institutions et le contexte social.";
    case "de":
      return "Der Bereich Menschenrechte erklärt Rechte über Alltag, Institutionen und gesellschaftlichen Kontext.";
    case "es":
      return "La sección de derechos humanos explica los derechos a través de la vida cotidiana, las instituciones y el contexto social.";
    case "el":
      return "Η ενότητα ανθρώπινα δικαιώματα εξηγεί τα δικαιώματα μέσα από την καθημερινή ζωή, τους θεσμούς και το κοινωνικό πλαίσιο.";
    case "ar":
      return "قسم حقوق الإنسان يشرح الحقوق من خلال الحياة اليومية والمؤسسات والسياق الاجتماعي.";
    default:
      return "Sekcija Ljudska prava objašnjava prava kroz svakodnevni život, institucije i društveni kontekst.";
  }
}

function getLegalCompassAssistantAnswer(lang: Lang) {
  switch (lang) {
    case "en":
      return "Legal Compass gathers laws, guides, templates and official sources tied to rights and public life.";
    case "tr":
      return "Hukuk Pusulası, haklar ve kamusal yaşamla ilgili yasaları, rehberleri, şablonları ve resmi kaynakları bir araya getirir.";
    case "fr":
      return "La boussole juridique rassemble lois, guides, modèles et sources officielles liés aux droits et à la vie publique.";
    case "de":
      return "Der Rechtskompass bündelt Gesetze, Leitfäden, Vorlagen und offizielle Quellen zu Rechten und öffentlichem Leben.";
    case "es":
      return "La brújula legal reúne leyes, guías, plantillas y fuentes oficiales relacionadas con los derechos y la vida pública.";
    case "el":
      return "Η νομική πυξίδα συγκεντρώνει νόμους, οδηγούς, πρότυπα και επίσημες πηγές που συνδέονται με τα δικαιώματα και τη δημόσια ζωή.";
    case "ar":
      return "تجمع البوصلة القانونية القوانين والأدلة والنماذج والمصادر الرسمية المرتبطة بالحقوق والحياة العامة.";
    default:
      return "Pravni kompas okuplja zakone, vodiče, obrasce i zvanične izvore povezane sa pravima i javnim životom.";
  }
}

function getLegalCompassDisclaimer(lang: Lang) {
  switch (lang) {
    case "en":
      return "It is informational, not legal representation.";
    case "tr":
      return "Bu bölüm bilgilendirme içindir; hukuki temsil değildir.";
    case "fr":
      return "Il s'agit d'un outil d'information, pas d'une représentation juridique.";
    case "de":
      return "Das ist ein Informationswerkzeug, keine rechtliche Vertretung.";
    case "es":
      return "Es una herramienta informativa, no representación legal.";
    case "el":
      return "Πρόκειται για ενημερωτικό εργαλείο, όχι για νομική εκπροσώπηση.";
    case "ar":
      return "هذه أداة معلوماتية وليست تمثيلاً قانونياً.";
    default:
      return "Ovo je informativan alat, ne pravno zastupanje.";
  }
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

function withHashLang(path: string, hash: string, lang: Lang) {
  return `${withLang(path, lang)}#${hash}`;
}

function limitLinks(links: SignalAssistantLink[], max = 4) {
  return links.slice(0, max);
}

function trimAnswer(value: string, max = 220) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function detectAuthorIntent(text: string, lang: Lang): AuthorIntent {
  const keywords = authorIntentKeywordsByLang[lang];
  if (hasAny(text, keywords.founder)) return "founder";
  if (hasAny(text, keywords.cv)) return "cv";
  if (hasAny(text, keywords.contact)) return "contact";
  if (hasAny(text, keywords.projects)) return "projects";
  if (hasAny(text, keywords.articles)) return "articles";
  if (hasAny(text, keywords.documentaries)) return "documentaries";
  if (hasAny(text, keywords.profile)) return "profile";
  return "default";
}

function getAuthorProfileHref(member: TeamMember, lang: Lang, section?: string) {
  const basePath = `/people/${member.slug}`;
  return section ? withHashLang(basePath, section, lang) : withLang(basePath, lang);
}

function getAuthorIntentAnswer(intent: AuthorIntent, member: TeamMember, lang: Lang) {
  switch (intent) {
    case "founder":
      switch (lang) {
        case "en":
          return `${member.fullName} is one of the founders behind Avangarda.`;
        case "tr":
          return `${member.fullName}, Avangarda'nın kurucu isimlerinden biridir.`;
        case "fr":
          return `${member.fullName} fait partie des personnes qui ont fondé Avangarda.`;
        case "de":
          return `${member.fullName} gehört zu den Gründungspersonen von Avangarda.`;
        case "es":
          return `${member.fullName} forma parte de quienes fundaron Avangarda.`;
        case "el":
          return `${member.fullName} είναι ένα από τα πρόσωπα που ίδρυσαν την Avangarda.`;
        case "ar":
          return `${member.fullName} من الشخصيات المؤسسة لأفانغاردا.`;
        default:
          return `${member.fullName} je među ljudima koji su pokrenuli Avangardu.`;
      }
    case "cv":
      switch (lang) {
        case "en":
          return member.cvUrl
            ? `The CV for ${member.fullName} is available through the portfolio page.`
            : `The portfolio page for ${member.fullName} is live, but a public CV file is not available yet.`;
        case "tr":
          return member.cvUrl
            ? `${member.fullName} için CV dosyası portfolyo sayfasında hazır.`
            : `${member.fullName} için portfolyo sayfası açık, ancak herkese açık bir CV dosyası henüz yok.`;
        case "fr":
          return member.cvUrl
            ? `Le CV de ${member.fullName} est disponible depuis la page portfolio.`
            : `La page portfolio de ${member.fullName} est disponible, mais aucun CV public n'est encore joint.`;
        case "de":
          return member.cvUrl
            ? `Der CV von ${member.fullName} ist über die Portfolio-Seite verfügbar.`
            : `Die Portfolio-Seite von ${member.fullName} ist online, aber ein öffentlicher CV ist noch nicht hinterlegt.`;
        case "es":
          return member.cvUrl
            ? `El CV de ${member.fullName} está disponible desde la página de portafolio.`
            : `La página de portafolio de ${member.fullName} está disponible, pero todavía no hay un CV público adjunto.`;
        case "el":
          return member.cvUrl
            ? `Το CV του/της ${member.fullName} είναι διαθέσιμο από τη σελίδα portfolio.`
            : `Η σελίδα portfolio του/της ${member.fullName} είναι διαθέσιμη, αλλά δεν υπάρχει ακόμη δημόσιο CV.`;
        case "ar":
          return member.cvUrl
            ? `السيرة الذاتية الخاصة بـ ${member.fullName} متاحة عبر صفحة الملف المهني.`
            : `صفحة الملف المهني الخاصة بـ ${member.fullName} متاحة، لكن لا يوجد ملف سيرة ذاتية عام حتى الآن.`;
        default:
          return member.cvUrl
            ? `CV za ${member.fullName} je dostupan kroz portfolio stranicu.`
            : `Portfolio stranica za ${member.fullName} postoji, ali javni CV fajl još nije dodat.`;
      }
    case "contact":
      switch (lang) {
        case "en":
          return `Contact channels for ${member.fullName} are listed on the portfolio page.`;
        case "tr":
          return `${member.fullName} için iletişim kanalları portfolyo sayfasında listeleniyor.`;
        case "fr":
          return `Les canaux de contact de ${member.fullName} sont réunis sur la page portfolio.`;
        case "de":
          return `Die Kontaktkanäle von ${member.fullName} stehen auf der Portfolio-Seite.`;
        case "es":
          return `Los canales de contacto de ${member.fullName} están en la página de portafolio.`;
        case "el":
          return `Τα στοιχεία επικοινωνίας του/της ${member.fullName} βρίσκονται στη σελίδα portfolio.`;
        case "ar":
          return `قنوات التواصل الخاصة بـ ${member.fullName} موجودة في صفحة الملف المهني.`;
        default:
          return `Kontakt kanali za ${member.fullName} nalaze se na portfolio stranici.`;
      }
    case "articles":
      switch (lang) {
        case "en":
          return `These are the texts tied to ${member.fullName}.`;
        case "tr":
          return `Bunlar ${member.fullName} ile ilişkili yazılar.`;
        case "fr":
          return `Voici les textes liés à ${member.fullName}.`;
        case "de":
          return `Das sind die Texte, die mit ${member.fullName} verbunden sind.`;
        case "es":
          return `Estos son los textos vinculados con ${member.fullName}.`;
        case "el":
          return `Αυτά είναι τα κείμενα που συνδέονται με τον/την ${member.fullName}.`;
        case "ar":
          return `هذه هي النصوص المرتبطة بـ ${member.fullName}.`;
        default:
          return `Ovo su tekstovi povezani sa ${member.fullName}.`;
      }
    case "projects":
      switch (lang) {
        case "en":
          return `These are the projects connected to ${member.fullName}.`;
        case "tr":
          return `Bunlar ${member.fullName} ile bağlantılı projeler.`;
        case "fr":
          return `Voici les projets liés à ${member.fullName}.`;
        case "de":
          return `Das sind die Projekte, die mit ${member.fullName} verbunden sind.`;
        case "es":
          return `Estos son los proyectos vinculados con ${member.fullName}.`;
        case "el":
          return `Αυτά είναι τα έργα που συνδέονται με τον/την ${member.fullName}.`;
        case "ar":
          return `هذه هي المشاريع المرتبطة بـ ${member.fullName}.`;
        default:
          return `Ovo su projekti povezani sa ${member.fullName}.`;
      }
    case "documentaries":
      switch (lang) {
        case "en":
          return `These are the documentaries and video works tied to ${member.fullName}.`;
        case "tr":
          return `Bunlar ${member.fullName} ile ilişkili belgesel ve video işleri.`;
        case "fr":
          return `Voici les documentaires et travaux vidéo liés à ${member.fullName}.`;
        case "de":
          return `Das sind die dokumentarischen und Video-Arbeiten von ${member.fullName}.`;
        case "es":
          return `Estos son los documentales y trabajos en video vinculados con ${member.fullName}.`;
        case "el":
          return `Αυτά είναι τα ντοκιμαντέρ και τα βίντεο που συνδέονται με τον/την ${member.fullName}.`;
        case "ar":
          return `هذه هي الأعمال الوثائقية والفيديو المرتبطة بـ ${member.fullName}.`;
        default:
          return `Ovo su dokumentarni i video radovi povezani sa ${member.fullName}.`;
      }
    default:
      return trimAnswer(member.quote || member.shortBio);
  }
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
      const nameParts = name.split(" ").filter(Boolean);
      let score = 0;
      if (normalized.includes(name)) score += 14;
      for (const token of tokens) {
        if (name.includes(token)) score += token.length > 4 ? 7 : 3;
        else if (nameParts.some((part) => token.startsWith(part) || part.startsWith(token))) score += token.length > 4 ? 6 : 3;
        else if (nameParts.some((part) => longestSharedPrefix(token, part) >= 5)) score += 4;
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

function findHumanRightMatches(message: string, rights: HumanRightItem[], lang: Lang) {
  const query = normalizeMessage(message);
  const tokens = extractTokens(message, lang);

  return rights
    .map((right) => {
      const haystack = normalizeMessage(
        [right.title, right.shortDescription, right.whatItMeans, right.whyItMatters, right.legalBasis].filter(Boolean).join(" ")
      );
      let score = 0;
      if (query && haystack.includes(query)) score += 12;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 4;
      }
      return { right, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

function findLegalResourceMatches(message: string, resources: LegalResourceItem[], lang: Lang) {
  const query = normalizeMessage(message);
  const tokens = extractTokens(message, lang);

  return resources
    .map((resource) => {
      const haystack = normalizeMessage(
        [
          resource.title,
          resource.shortDescription,
          resource.legalArea,
          resource.body,
          resource.whatIsThisFor,
          resource.whoCanUseIt,
          resource.whenToUseIt,
          resource.sourceName,
        ]
          .filter(Boolean)
          .join(" ")
      );
      let score = 0;
      if (query && haystack.includes(query)) score += 12;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 4;
      }
      return { resource, score };
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
  const peopleChrome = getPeopleChrome(lang);
  const message = clampMessage(input.message);
  const normalizedMessage = normalizeMessage(message);

  if (!normalizedMessage) {
    return { answer: copy.siteOnly };
  }

  if (message.length > SIGNAL_MAX_MESSAGE_LENGTH) {
    return { answer: copy.tooLong };
  }

  if (wantsImageRightsInfo(normalizedMessage, lang)) {
    const linkLabels = imageRightsLinkLabelByLang[lang];
    return {
      answer: imageRightsAnswerByLang[lang],
      links: [
        makeLink(copy, linkLabels.terms, withLang("/terms-of-use", lang), copy.pageType),
        makeLink(copy, linkLabels.contact, withLang("/contact", lang), copy.pageType),
      ],
    };
  }

  const [articlesResult, authorsResult, documentariesResult, rightsResult, legalResourcesResult] = await Promise.allSettled([
    fetchPublishedArticles(lang, 160),
    fetchTeamMembers(lang),
    fetchDocumentaryArchive(lang),
    fetchHumanRightsCatalog(lang),
    fetchLegalResources(lang),
  ]);
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const authors = authorsResult.status === "fulfilled" ? authorsResult.value : getFallbackTeamMembers(lang);
  const documentaries = documentariesResult.status === "fulfilled" ? documentariesResult.value : [];
  const humanRights = rightsResult.status === "fulfilled" ? rightsResult.value : [];
  const legalResources = legalResourcesResult.status === "fulfilled" ? legalResourcesResult.value : [];

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

  if (wantsHumanRightsPage(normalizedMessage, lang)) {
    return {
      answer: getHumanRightsAssistantAnswer(lang),
      links: limitLinks([
        makeLink(copy, getHumanRightsLabel(lang), withLang("/ljudska-prava", lang), copy.pageType),
        ...humanRights.slice(0, 3).map((entry) =>
          makeLink(copy, entry.title, withLang(`/ljudska-prava/${entry.slug}`, lang), copy.pageType)
        ),
      ]),
    };
  }

  const founderIntent =
    detectAuthorIntent(normalizedMessage, lang) === "founder" ||
    normalizedMessage.includes("osniv") ||
    normalizedMessage.includes("founder") ||
    normalizedMessage.includes("kuruc") ||
    normalizedMessage.includes("fundador") ||
    normalizedMessage.includes("ιδρυτ") ||
    normalizedMessage.includes("مؤسس");
  if (founderIntent) {
    const founder = authors.find((author) => author.isFounder) || authors[0];
    if (founder) {
      return {
        answer: getAuthorIntentAnswer("founder", founder, lang),
        links: limitLinks([
          mapAuthorLink(founder, lang, copy),
          founder.cvUrl
            ? makeLink(copy, `${founder.fullName} · ${peopleChrome.downloadCv}`, founder.cvUrl, copy.pageType)
            : makeLink(copy, `${founder.fullName} · ${peopleChrome.relatedArticles}`, getAuthorProfileHref(founder, lang, "articles"), copy.pageType),
          makeLink(copy, `${founder.fullName} · ${peopleChrome.projects}`, getAuthorProfileHref(founder, lang, "projects"), copy.pageType),
        ]),
      };
    }
  }

  if (wantsLegalCompassPage(normalizedMessage, lang)) {
    return {
      answer: `${getLegalCompassAssistantAnswer(lang)} ${getLegalCompassDisclaimer(lang)}`,
      links: limitLinks([
        makeLink(copy, getLegalCompassLabel(lang), withLang("/pravni-kompas", lang), copy.pageType),
        ...legalResources.slice(0, 3).map((entry) =>
          makeLink(copy, entry.title, withLang(`/pravni-kompas/${entry.slug}`, lang), copy.pageType)
        ),
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

  const matchedHumanRights = findHumanRightMatches(message, humanRights, lang);
  if (matchedHumanRights.length) {
    const bestRight = matchedHumanRights[0]?.right;
    return {
      answer: `${copy.foundResults} ${bestRight.title}.`,
      links: limitLinks([
        makeLink(copy, bestRight.title, withLang(`/ljudska-prava/${bestRight.slug}`, lang), copy.pageType),
        ...bestRight.relatedLegalResources
          .slice(0, 2)
          .map((entry) => makeLink(copy, entry.title, withLang(`/pravni-kompas/${entry.slug}`, lang), copy.pageType)),
      ]),
    };
  }

  const matchedLegalResources = findLegalResourceMatches(message, legalResources, lang);
  if (matchedLegalResources.length) {
    const bestResource = matchedLegalResources[0]?.resource;
    return {
      answer: `${getLegalCompassDisclaimer(lang)} ${copy.foundResults} ${bestResource.title}.`,
      links: limitLinks([
        makeLink(copy, bestResource.title, withLang(`/pravni-kompas/${bestResource.slug}`, lang), copy.pageType),
        ...bestResource.relatedHumanRights
          .slice(0, 2)
          .map((entry) => makeLink(copy, entry.title, withLang(`/ljudska-prava/${entry.slug}`, lang), copy.pageType)),
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
    const bestAuthor = authorMatches[0]!.author;
    const authorIntent = detectAuthorIntent(normalizedMessage, lang);
    const authorArticles = (bestAuthor?.relatedArticles || [])
      .filter((article) => article.slug && article.title)
      .slice(0, 2);
    const articleArchiveLink = makeLink(
      copy,
      copy.viewArchive,
      withQueryLang("/archive", lang, { author: bestAuthor.fullName }),
      copy.searchType
    );
    const profileLink = mapAuthorLink(bestAuthor, lang, copy);
    const projectLinks = bestAuthor.projects.slice(0, 2).map((project) =>
      makeLink(
        copy,
        project.title,
        project.url || getAuthorProfileHref(bestAuthor, lang, "projects"),
        copy.pageType
      )
    );
    const documentaryLinks = bestAuthor.relatedDocumentaries.slice(0, 2).map((documentary) =>
      makeLink(
        copy,
        documentary.title,
        documentary.externalUrl || getAuthorProfileHref(bestAuthor, lang, "documentaries"),
        copy.documentaryType
      )
    );
    const contactLinks: SignalAssistantLink[] = [
      makeLink(copy, copy.contactAnswer, getAuthorProfileHref(bestAuthor, lang, "contact"), copy.pageType),
    ];
    if (bestAuthor.website) {
      contactLinks.push(makeLink(copy, bestAuthor.website.replace(/^https?:\/\//, ""), bestAuthor.website, copy.pageType));
    }

    const intentLinks = (() => {
      switch (authorIntent) {
        case "founder":
          return [
            profileLink,
            bestAuthor.cvUrl
              ? makeLink(copy, `${bestAuthor.fullName} · ${peopleChrome.downloadCv}`, bestAuthor.cvUrl, copy.pageType)
              : makeLink(copy, `${bestAuthor.fullName} · ${peopleChrome.projects}`, getAuthorProfileHref(bestAuthor, lang, "projects"), copy.pageType),
            ...projectLinks,
          ];
        case "cv":
          return [
            profileLink,
            ...(bestAuthor.cvUrl
              ? [makeLink(copy, `${bestAuthor.fullName} · ${peopleChrome.downloadCv}`, bestAuthor.cvUrl, copy.pageType)]
              : [makeLink(copy, copy.contactAnswer, getAuthorProfileHref(bestAuthor, lang, "contact"), copy.pageType)]),
            articleArchiveLink,
          ];
        case "contact":
          return [profileLink, ...contactLinks];
        case "articles":
          return [
            profileLink,
            articleArchiveLink,
            ...authorArticles.map((article) => makeLink(copy, article.title, withLang(`/a/${article.slug}`, lang), copy.articleType)),
          ];
        case "projects":
          return [
            profileLink,
            makeLink(copy, `${bestAuthor.fullName} · ${peopleChrome.projects}`, getAuthorProfileHref(bestAuthor, lang, "projects"), copy.pageType),
            ...projectLinks,
          ];
        case "documentaries":
          return [
            profileLink,
            makeLink(copy, `${bestAuthor.fullName} · ${copy.documentaryType}`, getAuthorProfileHref(bestAuthor, lang, "documentaries"), copy.pageType),
            ...documentaryLinks,
          ];
        case "profile":
          return [
            profileLink,
            ...(bestAuthor.cvUrl
              ? [makeLink(copy, `${bestAuthor.fullName} · ${peopleChrome.downloadCv}`, bestAuthor.cvUrl, copy.pageType)]
              : []),
            ...(authorArticles.length
              ? [makeLink(copy, `${bestAuthor.fullName} · ${peopleChrome.relatedArticles}`, getAuthorProfileHref(bestAuthor, lang, "articles"), copy.pageType)]
              : []),
          ];
        default:
          return [
            profileLink,
            ...authorArticles.map((article) => makeLink(copy, article.title, withLang(`/a/${article.slug}`, lang), copy.articleType)),
            ...(bestAuthor.relatedDocumentaries.length
              ? [makeLink(copy, `${bestAuthor.fullName} · ${copy.documentaryType}`, getAuthorProfileHref(bestAuthor, lang, "documentaries"), copy.pageType)]
              : []),
          ];
      }
    })();

    return {
      answer: getAuthorIntentAnswer(authorIntent, bestAuthor, lang),
      links: limitLinks(intentLinks),
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
