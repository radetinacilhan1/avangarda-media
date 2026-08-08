import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";

export type AssistantLink = {
  label: string;
  href: string;
};

export type AssistantReply = {
  answer: string;
  links?: AssistantLink[];
};

export type AssistantUiCopy = {
  title: string;
  description: string;
  inputPlaceholder: string;
  send: string;
  close: string;
  askLabel: string;
  emptyState: string;
  thinking: string;
  unknownAnswer: string;
  errorAnswer: string;
  disclaimer?: string;
  sourcesLabel?: string;
  suggestions: string[];
};

type IntentConfig = {
  about: string[];
  impressum: string[];
  contact: string[];
  authors: string[];
  rogozna: string[];
  ecology: string[];
  archive: string[];
  documentaries: string[];
  contribute: string[];
};

const assistantUiCopy: Record<Lang, AssistantUiCopy> = {
  sr: {
    title: "Kompas",
    description: "Pronađi tekstove, teme, autore i dokumentarce.",
    inputPlaceholder: "Postavi pitanje o sajtu ili sadržaju...",
    send: "Pošalji",
    close: "Zatvori",
    askLabel: "Predlozi pitanja",
    emptyState: "Tu sam da te provedem kroz tekstove, teme, autore, arhivu i informacije o Avangardi.",
    thinking: "Pretražujem Avangardu...",
    unknownAnswer:
      "Još učim da pretražujem celu Avangardu. Za sada možeš pokušati kroz arhivu, teme ili pretragu.",
    errorAnswer:
      "Trenutno ne mogu da odgovorim. Probaj ponovo za trenutak ili idi kroz arhivu, teme i pretragu.",
    suggestions: [
      "Šta je Avangarda?",
      "Pronađi tekstove o Rogozni",
      "Prikaži mi tekstove o ekologiji",
      "Ko piše za Avangardu?",
      "Gde je impresum?",
      "Kako da pošaljem priču?",
    ],
  },
  en: {
    title: "Compass",
    description: "Find stories, topics, authors and documentaries.",
    inputPlaceholder: "Ask about the site or its stories...",
    send: "Send",
    close: "Close",
    askLabel: "Suggested prompts",
    emptyState: "I can guide you through stories, topics, authors, the archive and key Avangarda pages.",
    thinking: "Searching Avangarda...",
    unknownAnswer:
      "I am still learning how to search all of Avangarda. For now, try the archive, topics or site search.",
    errorAnswer:
      "I cannot answer right now. Try again in a moment or use the archive, topics and search.",
    suggestions: [
      "What is Avangarda?",
      "Find stories about Rogozna",
      "Show me ecology articles",
      "Who writes for Avangarda?",
      "Where is the imprint?",
      "How can I submit a story?",
    ],
  },
  tr: {
    title: "Pusula",
    description: "Metinleri, temaları, yazarları ve belgeselleri bul.",
    inputPlaceholder: "Site veya içerik hakkında sor...",
    send: "Gönder",
    close: "Kapat",
    askLabel: "Önerilen sorular",
    emptyState: "Seni Avangarda'daki metinler, temalar, yazarlar, arşiv ve temel sayfalar arasında gezdirebilirim.",
    thinking: "Avangarda aranıyor...",
    unknownAnswer:
      "Avangarda'nın tamamını aramayı hâlâ öğreniyorum. Şimdilik arşiv, temalar veya site içi aramayı deneyebilirsin.",
    errorAnswer:
      "Şu anda yanıt veremiyorum. Birazdan tekrar dene ya da arşiv, temalar ve aramayı kullan.",
    suggestions: [
      "Avangarda nedir?",
      "Rogozna hakkında metinleri bul",
      "Ekoloji yazılarını göster",
      "Avangarda için kimler yazıyor?",
      "Künye nerede?",
      "Bir hikâye nasıl gönderebilirim?",
    ],
  },
  fr: {
    title: "Boussole",
    description: "Trouve des textes, des thèmes, des auteurs et des documentaires.",
    inputPlaceholder: "Pose une question sur le site ou son contenu...",
    send: "Envoyer",
    close: "Fermer",
    askLabel: "Questions suggérées",
    emptyState:
      "Je peux te guider vers les textes, les thèmes, les auteurs, l'archive et les pages clés d'Avangarda.",
    thinking: "Recherche dans Avangarda...",
    unknownAnswer:
      "J'apprends encore à parcourir toute Avangarda. Pour l'instant, essaie l'archive, les thèmes ou la recherche du site.",
    errorAnswer:
      "Je ne peux pas répondre pour le moment. Réessaie dans un instant ou utilise l'archive, les thèmes et la recherche.",
    suggestions: [
      "Qu'est-ce qu'Avangarda ?",
      "Trouve des textes sur Rogozna",
      "Montre-moi les articles sur l'écologie",
      "Qui écrit pour Avangarda ?",
      "Où est l'impressum ?",
      "Comment envoyer une histoire ?",
    ],
  },
  de: {
    title: "Kompass",
    description: "Finde Texte, Themen, Autorinnen und Autoren sowie Dokumentarfilme.",
    inputPlaceholder: "Stelle eine Frage zur Seite oder zu Inhalten...",
    send: "Senden",
    close: "Schließen",
    askLabel: "Vorschläge",
    emptyState:
      "Ich kann dich durch Texte, Themen, Autorinnen und Autoren, das Archiv und die wichtigsten Avangarda-Seiten führen.",
    thinking: "Avangarda wird durchsucht...",
    unknownAnswer:
      "Ich lerne noch, ganz Avangarda zu durchsuchen. Versuche vorerst das Archiv, die Themen oder die Seitensuche.",
    errorAnswer:
      "Ich kann gerade nicht antworten. Versuche es gleich noch einmal oder nutze Archiv, Themen und Suche.",
    suggestions: [
      "Was ist Avangarda?",
      "Finde Texte über Rogozna",
      "Zeig mir Artikel über Ökologie",
      "Wer schreibt für Avangarda?",
      "Wo ist das Impressum?",
      "Wie kann ich eine Geschichte einreichen?",
    ],
  },
  es: {
    title: "Brújula",
    description: "Encuentra textos, temas, autores y documentales.",
    inputPlaceholder: "Haz una pregunta sobre el sitio o el contenido...",
    send: "Enviar",
    close: "Cerrar",
    askLabel: "Preguntas sugeridas",
    emptyState:
      "Puedo ayudarte a encontrar textos, temas, autores, el archivo y páginas clave de Avangarda.",
    thinking: "Buscando en Avangarda...",
    unknownAnswer:
      "Todavía estoy aprendiendo a recorrer toda Avangarda. Por ahora, prueba con el archivo, los temas o la búsqueda.",
    errorAnswer:
      "No puedo responder en este momento. Inténtalo de nuevo en un momento o usa archivo, temas y búsqueda.",
    suggestions: [
      "¿Qué es Avangarda?",
      "Encuentra textos sobre Rogozna",
      "Muéstrame artículos sobre ecología",
      "¿Quién escribe para Avangarda?",
      "¿Dónde está el impresum?",
      "¿Cómo puedo enviar una historia?",
    ],
  },
  el: {
    title: "Πυξίδα",
    description: "Βρες κείμενα, θέματα, συντάκτες και ντοκιμαντέρ.",
    inputPlaceholder: "Ρώτησε κάτι για τον ιστότοπο ή το περιεχόμενο...",
    send: "Αποστολή",
    close: "Κλείσιμο",
    askLabel: "Προτεινόμενες ερωτήσεις",
    emptyState:
      "Μπορώ να σε καθοδηγήσω σε κείμενα, θέματα, συντάκτες, στο αρχείο και στις βασικές σελίδες της Avangarda.",
    thinking: "Αναζήτηση στην Avangarda...",
    unknownAnswer:
      "Ακόμη μαθαίνω να αναζητώ ολόκληρη την Avangarda. Προς το παρόν δοκίμασε το αρχείο, τα θέματα ή την αναζήτηση.",
    errorAnswer:
      "Δεν μπορώ να απαντήσω αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο ή χρησιμοποίησε αρχείο, θέματα και αναζήτηση.",
    suggestions: [
      "Τι είναι η Avangarda;",
      "Βρες κείμενα για τη Rogozna",
      "Δείξε μου άρθρα για την οικολογία",
      "Ποιοι γράφουν για την Avangarda;",
      "Πού είναι το impressum;",
      "Πώς μπορώ να στείλω μια ιστορία;",
    ],
  },
  ar: {
    title: "البوصلة",
    description: "اعثر على النصوص والموضوعات والكتّاب والأفلام الوثائقية.",
    inputPlaceholder: "اسأل عن الموقع أو عن المحتوى...",
    send: "إرسال",
    close: "إغلاق",
    askLabel: "أسئلة مقترحة",
    emptyState: "يمكنني مساعدتك في الوصول إلى النصوص والموضوعات والكتّاب والأرشيف وصفحات أفانغاردا الأساسية.",
    thinking: "أبحث في أفانغاردا...",
    unknownAnswer:
      "ما زلت أتعلم كيف أبحث في كل أفانغاردا. حالياً يمكنك المحاولة عبر الأرشيف أو الموضوعات أو البحث.",
    errorAnswer:
      "لا أستطيع الإجابة الآن. حاول بعد قليل أو استخدم الأرشيف والموضوعات والبحث.",
    suggestions: [
      "ما هي أفانغاردا؟",
      "اعثر على نصوص عن روغوزنا",
      "اعرض لي مقالات عن البيئة",
      "من يكتب لأفانغاردا؟",
      "أين بيانات النشر؟",
      "كيف أرسل قصة؟",
    ],
  },
};

const assistantUiOverrides: Record<Lang, AssistantUiCopy> = {
  sr: {
    title: "Kompas",
    description: "Pronađi tekstove, teme, autore i dokumentarce.",
    inputPlaceholder: "Postavi pitanje o sajtu ili sadržaju",
    send: "Pošalji",
    close: "Zatvori",
    askLabel: "Predlozi pitanja",
    emptyState: "Tu sam da te provedem kroz tekstove, teme, autore, arhivu i informacije o Avangardi.",
    thinking: "Pretražujem Avangardu...",
    unknownAnswer:
      "Još učim da pretražujem celu Avangardu. Za sada možeš pokušati kroz arhivu, teme ili pretragu.",
    errorAnswer:
      "Trenutno ne mogu da odgovorim. Probaj ponovo za trenutak ili idi kroz arhivu, teme i pretragu.",
    suggestions: [
      "Šta je Avangarda?",
      "Pronađi tekstove o Rogozni",
      "Prikaži mi tekstove o ekologiji",
      "Ko piše za Avangardu?",
      "Gde je impresum?",
      "Kako da pošaljem priču?",
    ],
  },
  en: {
    title: "Compass",
    description: "Find stories, topics, authors and documentaries.",
    inputPlaceholder: "Ask about the site or content",
    send: "Send",
    close: "Close",
    askLabel: "Suggested questions",
    emptyState: "I can guide you through stories, topics, authors, the archive and key Avangarda pages.",
    thinking: "Searching Avangarda...",
    unknownAnswer:
      "I am still learning how to search all of Avangarda. For now, try the archive, topics or site search.",
    errorAnswer:
      "I cannot answer right now. Try again in a moment or use the archive, topics and search.",
    suggestions: [
      "What is Avangarda?",
      "Find stories about Rogozna",
      "Show me ecology articles",
      "Who writes for Avangarda?",
      "Where is the imprint?",
      "How can I submit a story?",
    ],
  },
  tr: {
    title: "Pusula",
    description: 'Metinleri, temaları, yazarları ve belgeselleri bul.',
    inputPlaceholder: "Site veya içerik hakkında soru sor",
    send: "Gönder",
    close: "Kapat",
    askLabel: "Önerilen sorular",
    emptyState: "Seni Avangarda'daki metinler, temalar, yazarlar, arşiv ve temel sayfalar arasında gezdirebilirim.",
    thinking: "Avangarda aranıyor...",
    unknownAnswer:
      "Avangarda'nın tamamını aramayı hâlâ öğreniyorum. Şimdilik arşiv, temalar veya site içi aramayı deneyebilirsin.",
    errorAnswer:
      "Şu anda yanıt veremiyorum. Birazdan tekrar dene ya da arşiv, temalar ve aramayı kullan.",
    suggestions: [
      "Avangarda nedir?",
      "Rogozna hakkında metinleri bul",
      "Ekoloji yazılarını göster",
      "Avangarda için kimler yazıyor?",
      "Künye nerede?",
      "Bir hikâye nasıl gönderebilirim?",
    ],
  },
  fr: {
    title: "Boussole",
    description: "Trouvez des textes, des thèmes, des auteurs et des documentaires.",
    inputPlaceholder: "Posez une question sur le site ou son contenu",
    send: "Envoyer",
    close: "Fermer",
    askLabel: "Questions suggérées",
    emptyState:
      "Je peux te guider vers les textes, les thèmes, les auteurs, l'archive et les pages clés d'Avangarda.",
    thinking: "Recherche dans Avangarda...",
    unknownAnswer:
      "J'apprends encore à parcourir toute Avangarda. Pour l'instant, essaie l'archive, les thèmes ou la recherche du site.",
    errorAnswer:
      "Je ne peux pas répondre pour le moment. Réessaie dans un instant ou utilise l'archive, les thèmes et la recherche.",
    suggestions: [
      "Qu'est-ce qu'Avangarda ?",
      "Trouve des textes sur Rogozna",
      "Montre-moi les articles sur l'écologie",
      "Qui écrit pour Avangarda ?",
      "Où est l'impressum ?",
      "Comment envoyer une histoire ?",
    ],
  },
  de: {
    title: "Kompass",
    description: "Finde Texte, Themen, Autorinnen und Autoren sowie Dokumentarfilme.",
    inputPlaceholder: "Stelle eine Frage zur Seite oder zu Inhalten",
    send: "Senden",
    close: "Schließen",
    askLabel: "Fragenvorschläge",
    emptyState:
      "Ich kann dich durch Texte, Themen, Autorinnen und Autoren, das Archiv und die wichtigsten Avangarda-Seiten führen.",
    thinking: "Avangarda wird durchsucht...",
    unknownAnswer:
      "Ich lerne noch, ganz Avangarda zu durchsuchen. Versuche vorerst das Archiv, die Themen oder die Seitensuche.",
    errorAnswer:
      "Ich kann gerade nicht antworten. Versuche es gleich noch einmal oder nutze Archiv, Themen und Suche.",
    suggestions: [
      "Was ist Avangarda?",
      "Finde Texte über Rogozna",
      "Zeig mir Artikel über Ökologie",
      "Wer schreibt für Avangarda?",
      "Wo ist das Impressum?",
      "Wie kann ich eine Geschichte einreichen?",
    ],
  },
  es: {
    title: "Brújula",
    description: "Encuentra textos, temas, autores y documentales.",
    inputPlaceholder: "Haz una pregunta sobre el sitio o el contenido",
    send: "Enviar",
    close: "Cerrar",
    askLabel: "Preguntas sugeridas",
    emptyState:
      "Puedo ayudarte a encontrar textos, temas, autores, el archivo y páginas clave de Avangarda.",
    thinking: "Buscando en Avangarda...",
    unknownAnswer:
      "Todavía estoy aprendiendo a recorrer toda Avangarda. Por ahora, prueba con el archivo, los temas o la búsqueda.",
    errorAnswer:
      "No puedo responder en este momento. Inténtalo de nuevo en un momento o usa archivo, temas y búsqueda.",
    suggestions: [
      "¿Qué es Avangarda?",
      "Encuentra textos sobre Rogozna",
      "Muéstrame artículos sobre ecología",
      "¿Quién escribe para Avangarda?",
      "¿Dónde está el impresum?",
      "¿Cómo puedo enviar una historia?",
    ],
  },
  el: {
    title: "Πυξίδα",
    description: "Βρες κείμενα, θέματα, συντάκτες και ντοκιμαντέρ.",
    inputPlaceholder: "Ρώτησε κάτι για τον ιστότοπο ή το περιεχόμενο",
    send: "Αποστολή",
    close: "Κλείσιμο",
    askLabel: "Προτεινόμενες ερωτήσεις",
    emptyState:
      "Μπορώ να σε καθοδηγήσω σε κείμενα, θέματα, συντάκτες, στο αρχείο και στις βασικές σελίδες της Avangarda.",
    thinking: "Αναζήτηση στην Avangarda...",
    unknownAnswer:
      "Ακόμη μαθαίνω να αναζητώ ολόκληρη την Avangarda. Προς το παρόν δοκίμασε το αρχείο, τα θέματα ή την αναζήτηση.",
    errorAnswer:
      "Δεν μπορώ να απαντήσω αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο ή χρησιμοποίησε αρχείο, θέματα και αναζήτηση.",
    suggestions: [
      "Τι είναι η Avangarda;",
      "Βρες κείμενα για τη Rogozna",
      "Δείξε μου άρθρα για την οικολογία",
      "Ποιοι γράφουν για την Avangarda;",
      "Πού είναι το impressum;",
      "Πώς μπορώ να στείλω μια ιστορία;",
    ],
  },
  ar: {
    title: "البوصلة",
    description: "اعثر على النصوص والموضوعات والكتّاب والأفلام الوثائقية.",
    inputPlaceholder: "اسأل عن الموقع أو المحتوى",
    send: "إرسال",
    close: "إغلاق",
    askLabel: "أسئلة مقترحة",
    emptyState: "يمكنني مساعدتك في الوصول إلى النصوص والموضوعات والكتّاب والأرشيف وصفحات أفانغاردا الأساسية.",
    thinking: "أبحث في أفانغاردا...",
    unknownAnswer:
      "ما زلت أتعلم كيف أبحث في كل أفانغاردا. حالياً يمكنك المحاولة عبر الأرشيف أو الموضوعات أو البحث.",
    errorAnswer:
      "لا أستطيع الإجابة الآن. حاول بعد قليل أو استخدم الأرشيف والموضوعات والبحث.",
    suggestions: [
      "ما هي أفانغاردا؟",
      "اعثر على نصوص عن روغوزنا",
      "اعرض لي مقالات عن البيئة",
      "من يكتب لأفانغاردا؟",
      "أين بيانات النشر؟",
      "كيف أرسل قصة؟",
    ],
  },
};

const intentKeywords: Record<Lang, IntentConfig> = {
  sr: {
    about: ["sta je avangarda", "šta je avangarda", "o avangardi", "ko je avangarda"],
    impressum: ["impresum"],
    contact: ["kontakt", "kako da kontaktiram", "javi", "email"],
    authors: ["ko pise", "ko piše", "autori", "ljudi iza avangarde", "pisu za avangardu", "piše za avangardu"],
    rogozna: ["rogozna"],
    ecology: ["ekologija", "ekolos", "eko"],
    archive: ["arhiva", "arhivu"],
    documentaries: ["dokumentarci", "dokumentarac", "film", "video price", "video priče"],
    contribute: ["posaljem pricu", "pošaljem priču", "posaljem tekst", "pošaljem tekst", "doprinesem", "submit"],
  },
  en: {
    about: ["what is avangarda", "about avangarda", "who is avangarda"],
    impressum: ["imprint", "impressum"],
    contact: ["contact", "email", "reach you"],
    authors: ["who writes", "authors", "writers", "people behind avangarda"],
    rogozna: ["rogozna"],
    ecology: ["ecology", "environment"],
    archive: ["archive"],
    documentaries: ["documentaries", "documentary", "film", "video stories"],
    contribute: ["submit a story", "submit story", "send a story", "contribute"],
  },
  tr: {
    about: ["avangarda nedir", "avangarda hakkinda", "avangarda hakkında"],
    impressum: ["kunye", "künye", "impressum"],
    contact: ["iletisim", "iletişim", "eposta", "mail"],
    authors: ["kim yaziyor", "kim yazıyor", "yazarlar", "avangarda icin kim yaziyor", "avangarda için kim yazıyor"],
    rogozna: ["rogozna"],
    ecology: ["ekoloji", "cevre", "çevre"],
    archive: ["arsiv", "arşiv"],
    documentaries: ["belgesel", "belgeseller", "film", "video hikaye", "video hikâye"],
    contribute: ["hikaye gonder", "hikâye gönder", "yazi gonder", "yazı gönder", "katki", "katkı"],
  },
  fr: {
    about: ["qu est ce qu avangarda", "quest ce qu avangarda", "a propos d avangarda", "à propos d avangarda"],
    impressum: ["impressum", "mentions legales", "mentions légales"],
    contact: ["contact", "email", "ecrire", "écrire"],
    authors: ["qui ecrit", "qui écrit", "auteurs", "qui écrit pour avangarda"],
    rogozna: ["rogozna"],
    ecology: ["ecologie", "écologie", "environnement"],
    archive: ["archive", "archives"],
    documentaries: ["documentaire", "documentaires", "film", "videos", "vidéos"],
    contribute: ["envoyer une histoire", "soumettre une histoire", "proposer une histoire"],
  },
  de: {
    about: ["was ist avangarda", "uber avangarda", "über avangarda"],
    impressum: ["impressum"],
    contact: ["kontakt", "email", "erreichen"],
    authors: ["wer schreibt", "autor", "autoren", "menschen hinter avangarda"],
    rogozna: ["rogozna"],
    ecology: ["okologie", "ökologie", "umwelt"],
    archive: ["archiv"],
    documentaries: ["dokumentarfilm", "dokumentarfilme", "film"],
    contribute: ["geschichte einreichen", "beitrag senden", "story senden"],
  },
  es: {
    about: ["que es avangarda", "qué es avangarda", "sobre avangarda"],
    impressum: ["impresum", "impressum", "aviso legal"],
    contact: ["contacto", "correo", "email"],
    authors: ["quien escribe", "quién escribe", "autores", "quien escribe para avangarda", "quién escribe para avangarda"],
    rogozna: ["rogozna"],
    ecology: ["ecologia", "ecología", "medio ambiente"],
    archive: ["archivo", "archiva"],
    documentaries: ["documental", "documentales", "pelicula", "película"],
    contribute: ["enviar una historia", "mandar una historia", "colaborar"],
  },
  el: {
    about: ["τι ειναι η avangarda", "τι είναι η avangarda", "σχετικα με την avangarda", "σχετικά με την avangarda"],
    impressum: ["impressum", "στοιχεια εκδοσης", "στοιχεία έκδοσης"],
    contact: ["επικοινωνια", "επικοινωνία", "email", "mail"],
    authors: ["ποιοι γραφουν", "ποιοι γράφουν", "συντακτες", "συντάκτες"],
    rogozna: ["rogozna"],
    ecology: ["οικολογια", "οικολογία", "περιβαλλον", "περιβάλλον"],
    archive: ["αρχειο", "αρχείο"],
    documentaries: ["ντοκιμαντερ", "ντοκιμαντέρ", "ταινια", "ταινία"],
    contribute: ["στειλω ιστορια", "στείλω ιστορία", "υποβαλω ιστορια", "υποβάλω ιστορία"],
  },
  ar: {
    about: ["ما هي افانغاردا", "ما هي أفانغاردا", "عن افانغاردا", "عن أفانغاردا"],
    impressum: ["بيانات النشر", "الامبريسوم", "الإمبريسوم"],
    contact: ["اتصال", "تواصل", "راسل", "بريد"],
    authors: ["من يكتب", "الكتاب", "الكتّاب", "من يكتب لافانغاردا", "من يكتب لأفانغاردا"],
    rogozna: ["روغوزنا", "rogozna"],
    ecology: ["البيئة", "ايكولوجيا", "إيكولوجيا"],
    archive: ["الارشيف", "الأرشيف"],
    documentaries: ["وثائقي", "وثائقيات", "فيلم", "افلام وثائقية", "أفلام وثائقية"],
    contribute: ["ارسل قصة", "أرسل قصة", "ارسل حكاية", "كيف ارسل", "كيف أرسل"],
  },
};

const linkLabels: Record<Lang, Record<string, string>> = {
  sr: {
    about: "O nama",
    people: "Ljudi iza Avangarde",
    impressum: "Impresum",
    contact: "Kontakt",
    archive: "Arhiva",
    topic: "Tema",
    search: "Pretraga",
    documentaries: "Dokumentarci",
    contribute: "Pošalji priču",
  },
  en: {
    about: "About",
    people: "People behind Avangarda",
    impressum: "Imprint",
    contact: "Contact",
    archive: "Archive",
    topic: "Topic",
    search: "Search",
    documentaries: "Documentaries",
    contribute: "Submit a story",
  },
  tr: {
    about: "Hakkımızda",
    people: "Avangarda'nın insanları",
    impressum: "Künye",
    contact: "İletişim",
    archive: "Arşiv",
    topic: "Tema",
    search: "Arama",
    documentaries: "Belgeseller",
    contribute: "Hikâye gönder",
  },
  fr: {
    about: "À propos",
    people: "L'équipe Avangarda",
    impressum: "Mentions légales",
    contact: "Contact",
    archive: "Archives",
    topic: "Thème",
    search: "Recherche",
    documentaries: "Documentaires",
    contribute: "Envoyer une histoire",
  },
  de: {
    about: "Über uns",
    people: "Menschen hinter Avangarda",
    impressum: "Impressum",
    contact: "Kontakt",
    archive: "Archiv",
    topic: "Thema",
    search: "Suche",
    documentaries: "Dokumentarfilme",
    contribute: "Geschichte einreichen",
  },
  es: {
    about: "Nosotros",
    people: "La gente detrás de Avangarda",
    impressum: "Aviso legal",
    contact: "Contacto",
    archive: "Archivo",
    topic: "Tema",
    search: "Búsqueda",
    documentaries: "Documentales",
    contribute: "Enviar una historia",
  },
  el: {
    about: "Σχετικά",
    people: "Οι άνθρωποι της Avangarda",
    impressum: "Στοιχεία έκδοσης",
    contact: "Επικοινωνία",
    archive: "Αρχείο",
    topic: "Θέμα",
    search: "Αναζήτηση",
    documentaries: "Ντοκιμαντέρ",
    contribute: "Στείλε μια ιστορία",
  },
  ar: {
    about: "من نحن",
    people: "الناس وراء أفانغاردا",
    impressum: "بيانات النشر",
    contact: "اتصل بنا",
    archive: "الأرشيف",
    topic: "الموضوع",
    search: "البحث",
    documentaries: "الوثائقيات",
    contribute: "أرسل قصة",
  },
};

const answers: Record<
  Lang,
  {
    about: string;
    impressum: string;
    contact: string;
    authors: string;
    rogozna: string;
    ecology: string;
    archive: string;
    documentaries: string;
    contribute: string;
  }
> = {
  sr: {
    about: "Avangarda je urednička platforma za priče, kontekst i javni interes, sa fokusom na društvo, ljudska prava, ekologiju i politički život.",
    impressum: "Impresum okuplja osnovne podatke o platformi, izdavaču i uredničkoj odgovornosti.",
    contact: "Na kontakt stranici možeš da pronađeš osnovne kanale za javljanje Avangardi.",
    authors: "Autore i ljude iza Avangarde možeš da otvoriš kroz O nama i timsku sekciju.",
    rogozna: "Za Rogoznu ti mogu otvoriti temu i pretragu povezanu sa tekstovima o planini, rudniku, vodi i lokalnoj zajednici.",
    ecology: "Ekologija okuplja tekstove o vazduhu, vodi, zemlji i posledicama odluka koje se ne vide odmah.",
    archive: "Arhiva je najbrži ulaz u starije tekstove, godine, sekcije, autore i teme.",
    documentaries: "Dokumentarci okupljaju video priče i duže vizuelne formate Avangarde.",
    contribute: "Ako želiš da pošalješ priču ili predlog, otvori stranicu za doprinos i javljanje redakciji.",
  },
  en: {
    about: "Avangarda is an editorial platform for stories, context and public interest, with a focus on society, human rights, ecology and political life.",
    impressum: "The imprint brings together the platform's core facts, publisher details and editorial responsibility.",
    contact: "The contact page gathers the main ways to reach Avangarda.",
    authors: "You can browse Avangarda's authors and team through the About page and people section.",
    rogozna: "I can open the Rogozna topic and a related search across stories about the mountain, mining, water and local communities.",
    ecology: "The ecology topic gathers stories about air, water, land and the consequences of decisions that do not stay invisible for long.",
    archive: "The archive is the fastest way into older stories, years, sections, authors and topics.",
    documentaries: "Documentaries gather Avangarda's video stories and longer visual formats.",
    contribute: "If you want to submit a story or idea, open the contribution page and editorial contact route.",
  },
  tr: {
    about: "Avangarda; toplum, insan hakları, ekoloji ve siyasal yaşam odağında çalışan hikâye, bağlam ve kamusal yarar platformudur.",
    impressum: "Künye sayfası platformun temel bilgilerini, yayıncı verilerini ve editoryal sorumluluğu bir araya getirir.",
    contact: "İletişim sayfasında Avangarda'ya ulaşmak için temel yolları bulabilirsin.",
    authors: "Yazarları ve Avangarda'nın arkasındaki ekibi Hakkımızda ve ekip bölümünden açabilirsin.",
    rogozna: "Rogozna için seni dağ, maden, su ve yerel hayat üzerine metinlere götüren konu ve arama bağlantılarını açabilirim.",
    ecology: "Ekoloji teması hava, su, toprak ve görünmeyen kararların sonuçları üzerine yazıları toplar.",
    archive: "Arşiv; eski yazılara, yıllara, bölümlere, yazarlara ve temalara açılan en hızlı giriştir.",
    documentaries: "Belgeseller, Avangarda'nın video hikâyelerini ve daha uzun görsel formatlarını toplar.",
    contribute: "Bir hikâye ya da öneri göndermek istiyorsan katkı ve editoryal iletişim sayfasını açabilirsin.",
  },
  fr: {
    about: "Avangarda est une plateforme éditoriale dédiée aux récits, au contexte et à l'intérêt public, avec une attention particulière à la société, aux droits humains, à l'écologie et à la politique.",
    impressum: "Les mentions légales rassemblent les informations de base sur la plateforme, l'éditeur et la responsabilité éditoriale.",
    contact: "La page contact rassemble les principaux moyens d'écrire à Avangarda.",
    authors: "Tu peux parcourir les auteurs et l'équipe d'Avangarda via À propos et la section dédiée aux personnes.",
    rogozna: "Je peux t'ouvrir le thème Rogozna ainsi qu'une recherche liée aux textes sur la montagne, la mine, l'eau et les habitants.",
    ecology: "Le thème écologie rassemble des textes sur l'air, l'eau, la terre et les conséquences de décisions qui ne restent pas invisibles.",
    archive: "L'archive est l'entrée la plus rapide vers les anciens textes, les années, les sections, les auteurs et les thèmes.",
    documentaries: "Les documentaires rassemblent les récits vidéo et les formats visuels longs d'Avangarda.",
    contribute: "Si tu veux envoyer un récit ou une proposition, ouvre la page de contribution et le contact éditorial.",
  },
  de: {
    about: "Avangarda ist eine redaktionelle Plattform für Geschichten, Kontext und öffentliches Interesse mit Schwerpunkt auf Gesellschaft, Menschenrechten, Ökologie und politischem Leben.",
    impressum: "Im Impressum stehen die grundlegenden Angaben zur Plattform, zum Herausgeber und zur redaktionellen Verantwortung.",
    contact: "Auf der Kontaktseite findest du die wichtigsten Wege, Avangarda zu erreichen.",
    authors: "Autorinnen, Autoren und das Team hinter Avangarda findest du über Über uns und den People-Bereich.",
    rogozna: "Ich kann dir das Thema Rogozna und eine passende Suche zu Texten über Berg, Mine, Wasser und lokale Gemeinschaften öffnen.",
    ecology: "Das Thema Ökologie bündelt Texte über Luft, Wasser, Boden und die Folgen von Entscheidungen, die nicht lange unsichtbar bleiben.",
    archive: "Das Archiv ist der schnellste Einstieg in ältere Texte, Jahre, Rubriken, Autorinnen und Themen.",
    documentaries: "Dokumentarfilme sammeln Avangardas Video-Geschichten und längere visuelle Formate.",
    contribute: "Wenn du eine Geschichte oder einen Vorschlag schicken willst, öffne die Seite zum Einreichen und den redaktionellen Kontakt.",
  },
  es: {
    about: "Avangarda es una plataforma editorial de historias, contexto e interés público, con foco en sociedad, derechos humanos, ecología y vida política.",
    impressum: "El aviso legal reúne los datos básicos de la plataforma, del editor y de la responsabilidad editorial.",
    contact: "En la página de contacto encontrarás las vías principales para escribir a Avangarda.",
    authors: "Puedes abrir a los autores y al equipo de Avangarda desde Nosotros y la sección de personas.",
    rogozna: "Puedo abrirte el tema Rogozna y una búsqueda relacionada con textos sobre la montaña, la mina, el agua y la comunidad local.",
    ecology: "El tema de ecología reúne textos sobre aire, agua, tierra y las consecuencias de decisiones que no tardan en sentirse.",
    archive: "El archivo es la entrada más rápida a textos anteriores, años, secciones, autores y temas.",
    documentaries: "Los documentales reúnen las historias en video y los formatos visuales largos de Avangarda.",
    contribute: "Si quieres enviar una historia o propuesta, abre la página de contribución y contacto editorial.",
  },
  el: {
    about: "Η Avangarda είναι μια εκδοτική πλατφόρμα για ιστορίες, πλαίσιο και δημόσιο ενδιαφέρον, με έμφαση στην κοινωνία, τα δικαιώματα, την οικολογία και την πολιτική ζωή.",
    impressum: "Τα στοιχεία έκδοσης συγκεντρώνουν τα βασικά στοιχεία της πλατφόρμας, του εκδότη και της εκδοτικής ευθύνης.",
    contact: "Στη σελίδα επικοινωνίας θα βρεις τους βασικούς τρόπους να επικοινωνήσεις με την Avangarda.",
    authors: "Μπορείς να ανοίξεις τους συντάκτες και την ομάδα της Avangarda μέσα από το Σχετικά και την ενότητα ανθρώπων.",
    rogozna: "Μπορώ να ανοίξω το θέμα Rogozna και μια σχετική αναζήτηση για κείμενα γύρω από το βουνό, το ορυχείο, το νερό και τις τοπικές κοινότητες.",
    ecology: "Το θέμα οικολογία συγκεντρώνει κείμενα για τον αέρα, το νερό, τη γη και τις συνέπειες αποφάσεων που σύντομα γίνονται ορατές.",
    archive: "Το αρχείο είναι η πιο γρήγορη είσοδος σε παλαιότερα κείμενα, χρόνια, ενότητες, συντάκτες και θέματα.",
    documentaries: "Τα ντοκιμαντέρ συγκεντρώνουν τις βιντεοϊστορίες και τα μεγαλύτερα οπτικά format της Avangarda.",
    contribute: "Αν θέλεις να στείλεις μια ιστορία ή πρόταση, άνοιξε τη σελίδα συνεισφοράς και την εκδοτική επικοινωνία.",
  },
  ar: {
    about: "أفانغاردا منصة تحريرية للقصص والسياق والمصلحة العامة، مع تركيز على المجتمع وحقوق الإنسان والبيئة والحياة السياسية.",
    impressum: "تجمع صفحة بيانات النشر المعلومات الأساسية عن المنصة والناشر والمسؤولية التحريرية.",
    contact: "في صفحة الاتصال ستجد الطرق الأساسية للتواصل مع أفانغاردا.",
    authors: "يمكنك الوصول إلى الكتّاب والناس وراء أفانغاردا عبر صفحة من نحن وقسم الفريق.",
    rogozna: "أستطيع أن أفتح لك موضوع روغوزنا وروابط بحث مرتبطة بالنصوص عن الجبل والمنجم والماء والمجتمع المحلي.",
    ecology: "يجمع موضوع البيئة نصوصاً عن الهواء والماء والأرض ونتائج القرارات التي لا تبقى غير مرئية طويلاً.",
    archive: "الأرشيف هو أسرع مدخل إلى النصوص الأقدم والسنوات والأقسام والكتّاب والموضوعات.",
    documentaries: "تجمع الوثائقيات قصص أفانغاردا المصورة والصيغ البصرية الأطول.",
    contribute: "إذا أردت إرسال قصة أو مقترح، افتح صفحة المساهمة والتواصل التحريري.",
  },
};

function normalizeMessage(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, values: string[]) {
  return values.some((value) => text.includes(normalizeMessage(value)));
}

function createLink(label: string, href: string): AssistantLink {
  return { label, href };
}

function getLabels(lang: Lang) {
  return linkLabels[lang];
}

function getAnswers(lang: Lang) {
  return answers[lang];
}

const legalAssistantUiCopy: Record<Lang, AssistantUiCopy> = {
  sr: {
    title: "KOMPAS AI",
    description: "Pravo nije napisano da bi ostalo nečitljivo. Opiši šta ti se dogodilo, a Kompas će tvoje reči povezati sa objavljenim pravima, propisima i pouzdanim izvorima.",
    inputPlaceholder: "Opiši situaciju: šta se dogodilo, gde i kada?",
    send: "Pronađi pravni smer",
    close: "Zatvori",
    askLabel: "Možeš početi ovako",
    emptyState: "Opiši situaciju svojim rečima. Kompas pretražuje sadržaj koji je Avangarda već objavila.",
    thinking: "Tražim relevantna prava, propise i izvore...",
    unknownAnswer: "Nisam pronašao dovoljno blizak objavljeni izvor. Probaj da navedeš šta se dogodilo, gde i koja je institucija ili pravo uključeno.",
    errorAnswer: "Kompas trenutno ne može da pretraži izvore. Pokušaj ponovo malo kasnije ili otvori Pravni kompas.",
    disclaimer: "Kompas pruža informativne smernice i ne zamenjuje advokata ili zvaničnu pravnu pomoć.",
    sourcesLabel: "Relevantni izvori",
    suggestions: ["Doživeo/la sam diskriminaciju", "Institucija mi ne odgovara", "Tražim pravo na zdravu životnu sredinu"],
  },
  en: {
    title: "COMPASS AI",
    description: "Law was not written to remain unreadable. Describe what happened, and Compass will connect your words with published rights, rules and reliable sources.",
    inputPlaceholder: "Describe the situation: what happened, where and when?",
    send: "Find a legal direction",
    close: "Close",
    askLabel: "You can start here",
    emptyState: "Describe the situation in your own words. Compass searches content already published by Avangarda.",
    thinking: "Looking for relevant rights, rules and sources...",
    unknownAnswer: "I could not find a sufficiently close published source. Try adding what happened, where, and which institution or right is involved.",
    errorAnswer: "Compass cannot search the sources right now. Try again shortly or open the Legal Compass.",
    disclaimer: "Compass provides general information and does not replace a lawyer or official legal assistance.",
    sourcesLabel: "Relevant sources",
    suggestions: ["I experienced discrimination", "An institution is not responding", "I am looking for the right to a healthy environment"],
  },
  tr: {
    title: "PUSULA AI",
    description: "Hukuk anlaşılmaz kalmak için yazılmadı. Yaşadığın durumu anlat; Pusula sözlerini yayımlanmış haklar, mevzuat ve güvenilir kaynaklarla ilişkilendirsin.",
    inputPlaceholder: "Durumu anlat: ne oldu, nerede ve ne zaman?",
    send: "Hukuki yön bul",
    close: "Kapat",
    askLabel: "Şöyle başlayabilirsin",
    emptyState: "Durumu kendi sözlerinle anlat. Pusula, Avangarda'nın yayımladığı içerikte arama yapar.",
    thinking: "İlgili haklar, mevzuat ve kaynaklar aranıyor...",
    unknownAnswer: "Yeterince yakın bir yayımlanmış kaynak bulamadım. Ne olduğunu, nerede yaşandığını ve hangi kurumun ya da hakkın ilgili olduğunu eklemeyi dene.",
    errorAnswer: "Pusula şu anda kaynaklarda arama yapamıyor. Biraz sonra tekrar dene veya Hukuk Pusulası'nı aç.",
    disclaimer: "Pusula bilgilendirici yönlendirme sunar; avukatın veya resmî hukuki yardımın yerini tutmaz.",
    sourcesLabel: "İlgili kaynaklar",
    suggestions: ["Ayrımcılığa uğradım", "Bir kurum yanıt vermiyor", "Sağlıklı çevre hakkını arıyorum"],
  },
  fr: {
    title: "BOUSSOLE AI",
    description: "Le droit n'a pas été écrit pour rester illisible. Décris ce qui t'est arrivé et Boussole reliera tes mots aux droits, aux textes et aux sources fiables déjà publiés.",
    inputPlaceholder: "Décris la situation : que s'est-il passé, où et quand ?",
    send: "Trouver une orientation juridique",
    close: "Fermer",
    askLabel: "Tu peux commencer ainsi",
    emptyState: "Décris la situation avec tes propres mots. Boussole recherche uniquement dans les contenus publiés par Avangarda.",
    thinking: "Recherche des droits, textes et sources pertinents...",
    unknownAnswer: "Je n'ai pas trouvé de source publiée suffisamment proche. Précise ce qui s'est passé, le lieu et l'institution ou le droit concerné.",
    errorAnswer: "Boussole ne peut pas consulter les sources pour le moment. Réessaie bientôt ou ouvre la Boussole juridique.",
    disclaimer: "Boussole fournit des informations générales et ne remplace ni un avocat ni l'aide juridique officielle.",
    sourcesLabel: "Sources pertinentes",
    suggestions: ["J'ai subi une discrimination", "Une institution ne me répond pas", "Je cherche le droit à un environnement sain"],
  },
  de: {
    title: "KOMPASS AI",
    description: "Recht wurde nicht geschrieben, um unverständlich zu bleiben. Beschreibe, was passiert ist, und Kompass verbindet deine Worte mit veröffentlichten Rechten, Vorschriften und verlässlichen Quellen.",
    inputPlaceholder: "Beschreibe die Situation: Was ist wo und wann passiert?",
    send: "Rechtliche Orientierung finden",
    close: "Schließen",
    askLabel: "So kannst du beginnen",
    emptyState: "Beschreibe die Situation in eigenen Worten. Kompass durchsucht bereits von Avangarda veröffentlichte Inhalte.",
    thinking: "Passende Rechte, Vorschriften und Quellen werden gesucht...",
    unknownAnswer: "Ich habe keine ausreichend passende veröffentlichte Quelle gefunden. Ergänze, was passiert ist, wo und welche Institution oder welches Recht betroffen ist.",
    errorAnswer: "Kompass kann die Quellen gerade nicht durchsuchen. Versuche es später erneut oder öffne den Rechtskompass.",
    disclaimer: "Kompass bietet allgemeine Informationen und ersetzt weder einen Anwalt noch offizielle Rechtsberatung.",
    sourcesLabel: "Relevante Quellen",
    suggestions: ["Ich wurde diskriminiert", "Eine Behörde antwortet nicht", "Ich suche das Recht auf eine gesunde Umwelt"],
  },
  es: {
    title: "BRÚJULA AI",
    description: "El derecho no fue escrito para seguir siendo incomprensible. Describe lo que ocurrió y Brújula conectará tus palabras con derechos, normas y fuentes fiables ya publicadas.",
    inputPlaceholder: "Describe la situación: ¿qué ocurrió, dónde y cuándo?",
    send: "Encontrar una orientación jurídica",
    close: "Cerrar",
    askLabel: "Puedes empezar así",
    emptyState: "Describe la situación con tus propias palabras. Brújula busca en el contenido ya publicado por Avangarda.",
    thinking: "Buscando derechos, normas y fuentes pertinentes...",
    unknownAnswer: "No encontré una fuente publicada suficientemente cercana. Añade qué ocurrió, dónde y qué institución o derecho está implicado.",
    errorAnswer: "Brújula no puede consultar las fuentes ahora. Inténtalo de nuevo más tarde o abre la Brújula jurídica.",
    disclaimer: "Brújula ofrece información general y no sustituye a un abogado ni a la asistencia jurídica oficial.",
    sourcesLabel: "Fuentes pertinentes",
    suggestions: ["Sufrí discriminación", "Una institución no responde", "Busco el derecho a un medio ambiente sano"],
  },
  el: {
    title: "ΠΥΞΙΔΑ AI",
    description: "Το δίκαιο δεν γράφτηκε για να παραμένει δυσνόητο. Περιέγραψε τι συνέβη και η Πυξίδα θα συνδέσει τα λόγια σου με δημοσιευμένα δικαιώματα, κανόνες και αξιόπιστες πηγές.",
    inputPlaceholder: "Περιέγραψε την κατάσταση: τι συνέβη, πού και πότε;",
    send: "Βρες νομική κατεύθυνση",
    close: "Κλείσιμο",
    askLabel: "Μπορείς να ξεκινήσεις έτσι",
    emptyState: "Περιέγραψε την κατάσταση με δικά σου λόγια. Η Πυξίδα αναζητά μόνο στο περιεχόμενο που έχει ήδη δημοσιεύσει η Avangarda.",
    thinking: "Αναζήτηση σχετικών δικαιωμάτων, κανόνων και πηγών...",
    unknownAnswer: "Δεν βρήκα αρκετά σχετική δημοσιευμένη πηγή. Πρόσθεσε τι συνέβη, πού και ποιος θεσμός ή δικαίωμα εμπλέκεται.",
    errorAnswer: "Η Πυξίδα δεν μπορεί τώρα να αναζητήσει τις πηγές. Δοκίμασε αργότερα ή άνοιξε τη Νομική Πυξίδα.",
    disclaimer: "Η Πυξίδα παρέχει γενικές πληροφορίες και δεν αντικαθιστά δικηγόρο ή επίσημη νομική βοήθεια.",
    sourcesLabel: "Σχετικές πηγές",
    suggestions: ["Υπέστην διάκριση", "Ένας θεσμός δεν απαντά", "Αναζητώ το δικαίωμα σε υγιές περιβάλλον"],
  },
  ar: {
    title: "بوصلة AI",
    description: "لم يُكتب القانون ليبقى عصياً على الفهم. صف ما حدث، وستربط البوصلة كلماتك بالحقوق والقواعد والمصادر الموثوقة المنشورة.",
    inputPlaceholder: "صف الحالة: ماذا حدث، وأين، ومتى؟",
    send: "ابحث عن اتجاه قانوني",
    close: "إغلاق",
    askLabel: "يمكنك البدء هكذا",
    emptyState: "صف الحالة بكلماتك. تبحث البوصلة في المحتوى الذي نشرته أفانغاردا بالفعل.",
    thinking: "جارٍ البحث عن الحقوق والقواعد والمصادر ذات الصلة...",
    unknownAnswer: "لم أجد مصدراً منشوراً قريباً بما يكفي. أضف ما حدث، وأين، وما المؤسسة أو الحق المعني.",
    errorAnswer: "لا تستطيع البوصلة البحث في المصادر الآن. حاول لاحقاً أو افتح البوصلة القانونية.",
    disclaimer: "تقدم البوصلة معلومات عامة ولا تحل محل المحامي أو المساعدة القانونية الرسمية.",
    sourcesLabel: "مصادر ذات صلة",
    suggestions: ["تعرضت للتمييز", "مؤسسة لا ترد عليّ", "أبحث عن الحق في بيئة صحية"],
  },
};

export function getAssistantUiCopy(lang: Lang) {
  return legalAssistantUiCopy[lang] ?? assistantUiOverrides[lang] ?? assistantUiCopy[lang];
}

const assistantOnboardingToastByLang: Record<Lang, string> = {
  sr: "Kompas je ovde ako tra\u017ei\u0161 tekst, temu ili pravni resurs.",
  en: "Kompas is here if you need a text, topic, or legal resource.",
  tr: "Bir metin, konu veya hukuki kaynak ar\u0131yorsan Kompas burada.",
  fr: "Kompas est l\u00e0 si tu cherches un texte, un sujet ou une ressource juridique.",
  de: "Kompas hilft dir, Texte, Themen oder rechtliche Ressourcen zu finden.",
  es: "Kompas est\u00e1 aqu\u00ed si buscas un texto, un tema o un recurso legal.",
  el: "\u03a4\u03bf Kompas \u03b5\u03af\u03bd\u03b1\u03b9 \u03b5\u03b4\u03ce \u03b1\u03bd \u03c8\u03ac\u03c7\u03bd\u03b5\u03b9\u03c2 \u03ba\u03b5\u03af\u03bc\u03b5\u03bd\u03bf, \u03b8\u03ad\u03bc\u03b1 \u03ae \u03bd\u03bf\u03bc\u03b9\u03ba\u03cc \u03c0\u03cc\u03c1\u03bf.",
  ar: "\u0643\u0648\u0645\u0628\u0627\u0633 \u0647\u0646\u0627 \u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0628\u062d\u062b \u0639\u0646 \u0646\u0635 \u0623\u0648 \u0645\u0648\u0636\u0648\u0639 \u0623\u0648 \u0645\u0648\u0631\u062f \u0642\u0627\u0646\u0648\u0646\u064a.",
};

export function getAssistantOnboardingToast(lang: Lang) {
  return assistantOnboardingToastByLang[lang];
}

export function getAssistantReply(input: { message: string; lang: Lang; currentPath?: string }): AssistantReply {
  const normalized = normalizeMessage(input.message);
  const lang = input.lang;
  const labels = getLabels(lang);
  const localizedAnswers = getAnswers(lang);
  const ui = getAssistantUiCopy(lang);
  const intents = intentKeywords[lang];

  if (!normalized) {
    return { answer: ui.unknownAnswer };
  }

  if (hasAny(normalized, intents.rogozna)) {
    return {
      answer: localizedAnswers.rogozna,
      links: [
        createLink(`${labels.topic}: Rogozna`, withLang("/topic/rogozna", lang)),
        createLink(labels.search, withLang("/search?q=Rogozna", lang)),
      ],
    };
  }

  if (hasAny(normalized, intents.ecology)) {
    return {
      answer: localizedAnswers.ecology,
      links: [
        createLink(`${labels.topic}: Ekologija`, withLang("/topic/ekologija", lang)),
        createLink(labels.search, withLang("/search?q=Ekologija", lang)),
      ],
    };
  }

  if (hasAny(normalized, intents.documentaries)) {
    return {
      answer: localizedAnswers.documentaries,
      links: [createLink(labels.documentaries, withLang("/dokumentarci", lang))],
    };
  }

  if (hasAny(normalized, intents.archive)) {
    return {
      answer: localizedAnswers.archive,
      links: [createLink(labels.archive, withLang("/archive", lang))],
    };
  }

  if (hasAny(normalized, intents.impressum)) {
    return {
      answer: localizedAnswers.impressum,
      links: [createLink(labels.impressum, withLang("/impresum", lang))],
    };
  }

  if (hasAny(normalized, intents.contact)) {
    return {
      answer: localizedAnswers.contact,
      links: [createLink(labels.contact, withLang("/contact", lang))],
    };
  }

  if (hasAny(normalized, intents.authors)) {
    return {
      answer: localizedAnswers.authors,
      links: [
        createLink(labels.people, withLang("/o-nama#ljudi", lang)),
        createLink(labels.about, withLang("/o-nama", lang)),
      ],
    };
  }

  if (hasAny(normalized, intents.contribute)) {
    return {
      answer: localizedAnswers.contribute,
      links: [
        createLink(labels.contribute, withLang("/contribute", lang)),
        createLink(labels.contact, withLang("/contact", lang)),
      ],
    };
  }

  if (hasAny(normalized, intents.about) || normalized === "avangarda") {
    return {
      answer: localizedAnswers.about,
      links: [createLink(labels.about, withLang("/o-nama", lang))],
    };
  }

  return { answer: ui.unknownAnswer };
}
