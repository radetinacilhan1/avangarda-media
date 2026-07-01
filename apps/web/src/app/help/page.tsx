import type { Metadata } from "next";

import { HelpCompassTrigger } from "@/components/help-compass-trigger";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Lang } from "@/lib/i18n";
import { resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type HelpPageCopy = {
  label: string;
  title: string;
  intro: string;
  cards: Array<{
    title: string;
    copy: string;
  }>;
  faqLabel: string;
  faqTitle: string;
  faqItems: Array<{
    title: string;
    copy: string;
  }>;
  compass: {
    label: string;
    title: string;
    copy: string;
    button: string;
  };
  actions: {
    label: string;
    title: string;
    copy: string;
    contribute: string;
    contact: string;
  };
};

const helpCardEyebrows: Record<Lang, string[]> = {
  sr: ["Avangarda", "Pretraga", "Sekcije", "Arhiva"],
  en: ["Avangarda", "Search", "Sections", "Archive"],
  tr: ["Avangarda", "Arama", "B\u00f6l\u00fcmler", "Ar\u015fiv"],
  fr: ["Avangarda", "Recherche", "Sections", "Archives"],
  de: ["Avangarda", "Suche", "Sektionen", "Archiv"],
  es: ["Avangarda", "B\u00fasqueda", "Secciones", "Archivo"],
  el: ["Avangarda", "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7", "\u0395\u03bd\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2", "\u0391\u03c1\u03c7\u03b5\u03af\u03bf"],
  ar: ["\u0623\u0641\u0627\u0646\u063a\u0627\u0631\u062f\u0627", "\u0628\u062d\u062b", "\u0627\u0644\u0623\u0642\u0633\u0627\u0645", "\u0627\u0644\u0623\u0631\u0634\u064a\u0641"],
};

const helpCopy: Record<Lang, HelpPageCopy> = {
  sr: {
    label: "Pomoć",
    title: "Pomoć",
    intro: "Kako da koristiš Avangardu, pronađeš sadržaj, razumeš sekcije i otvoriš ono što ti treba.",
    cards: [
      {
        title: "Šta je Avangarda?",
        copy:
          "Avangarda je prostor za priče, analize, ljudska prava, teren, dokumentarne materijale i javni interes. Tekstovi ovde ne staju na naslovu, nego idu ka kontekstu.",
      },
      {
        title: "Kako da pronađem tekst?",
        copy:
          "Koristi pretragu, autore, teme i sekcije. Ako tražiš verziju na drugom jeziku, promeni jezik sajta i proveri odgovarajuću rutu.",
      },
      {
        title: "Šta su sekcije?",
        copy:
          "Front prati ritam dana. Analize šire kontekst. Intervjui otvaraju glasove. Kolumne donose stav i uredničku oštrinu.",
      },
      {
        title: "Šta je Arhiva?",
        copy:
          "Arhiva nije samo lista objava. To je uređeni ulaz u sadržaj, sa filterima koji pomažu da pronađeš temu, period ili ugao koji tražiš.",
      },
    ],
    faqLabel: "Vodič kroz sajt",
    faqTitle: "Gde se šta nalazi",
    faqItems: [
      {
        title: "Šta je Mapa priča?",
        copy:
          "Mapa priča povezuje tekstove i dokumentarce sa mestima o kojima govore. Ako želiš da istražuješ sadržaj po lokaciji, kreni od mape.",
      },
      {
        title: "Šta je Pravni kompas?",
        copy:
          "Pravni kompas okuplja zakone, prava, vodiče, obrasce i dokumente koje Avangarda veže uz teme i analize, tako da praktične informacije ostanu dostupne.",
      },
      {
        title: "Šta je Galerija?",
        copy:
          "Galerija okuplja vizuelne zapise sa terena, događaja, radionica, zajednica i dokumentarnih priča. Tu fotografije dobijaju sopstveni urednički okvir.",
      },
      {
        title: "Šta je Kompas AI?",
        copy:
          "Kompas AI pomaže da pronađeš tekst, temu, autora, mapu, pravni dokument ili objašnjenje kroz sadržaj koji Avangarda već ima na sajtu.",
      },
      {
        title: "Kako da pošaljem priču ili predlog?",
        copy:
          "Ako imaš priču, dokument ili ideju za saradnju, koristi stranicu Pošalji priču / Saradnja ili kontakt stranicu. Tako urednički trag ostaje jasan i pregledan.",
      },
      {
        title: "Autorska prava i fotografije",
        copy:
          "Avangarda poštuje autore, izvore i kredite fotografija. Materijali i slike ne preuzimaju se bez dozvole ako nije drugačije naznačeno uz samu objavu.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "Pitaj Kompas",
      copy:
        "Ako ne znaš gde da kreneš, Kompas može da ti pomogne da pronađeš tekst, temu, autora, mapu, pravni dokument ili objašnjenje.",
      button: "Otvori Kompas",
    },
    actions: {
      label: "Dalje",
      title: "Treba ti kontakt ili urednički ulaz?",
      copy: "Ako pomoć vodi ka priči, dokumentu ili saradnji, ovde su najbrži putevi do redakcije.",
      contribute: "Pošalji priču / Saradnja",
      contact: "Kontakt",
    },
  },
  en: {
    label: "Help",
    title: "Help",
    intro: "How to use Avangarda, find content, understand the sections and open what you need.",
    cards: [
      {
        title: "What is Avangarda?",
        copy:
          "Avangarda is a space for stories, analysis, human rights reporting, fieldwork, documentary material and the public interest. A text does not stop at the headline here.",
      },
      {
        title: "How do I find a story?",
        copy:
          "Use search, browse authors, topics and sections, or switch the site language if you need the same content in another language.",
      },
      {
        title: "What are the sections?",
        copy:
          "Front follows the daily pulse. Analysis expands context. Interviews open up voices. Columns bring a sharper editorial position.",
      },
      {
        title: "What is the Archive?",
        copy:
          "The Archive is not just a list of posts. It is an edited entry point into the site, with filters that help you locate a topic, period or angle.",
      },
    ],
    faqLabel: "Site guide",
    faqTitle: "Where everything lives",
    faqItems: [
      {
        title: "What is the Story Map?",
        copy:
          "The Story Map connects stories and documentaries to the places they speak about. If you want to explore content by location, start there.",
      },
      {
        title: "What is Legal Compass?",
        copy:
          "Legal Compass gathers laws, rights, guides, forms and documents linked to Avangarda topics and analysis, so practical information stays within reach.",
      },
      {
        title: "What are Galleries?",
        copy:
          "Galleries are visual field notes from events, workshops, communities and documentary work. They give photography its own editorial frame.",
      },
      {
        title: "What is Compass AI?",
        copy:
          "Compass AI helps you find a story, topic, author, map, legal document or explanation through the content Avangarda already publishes.",
      },
      {
        title: "How do I send a story or proposal?",
        copy:
          "If you have a story, document or collaboration idea, use the Pitch a story / Collaborate page or the contact page so the editorial trail stays clear.",
      },
      {
        title: "Copyright and photography",
        copy:
          "Avangarda credits authors, sources and photographers. Images and other materials should not be reused without permission unless clearly marked otherwise.",
      },
    ],
    compass: {
      label: "Compass AI",
      title: "Ask Compass",
      copy:
        "If you do not know where to begin, Compass can help you find a story, topic, author, map, legal document or explanation.",
      button: "Open Compass",
    },
    actions: {
      label: "Next",
      title: "Need contact or an editorial entry point?",
      copy: "If help leads to a story, a document or a collaboration, these are the fastest routes into the newsroom.",
      contribute: "Pitch a story / Collaborate",
      contact: "Contact",
    },
  },
  tr: {
    label: "Yardım",
    title: "Yardım",
    intro: "Avangarda'yı nasıl kullanacağınızı, içeriği nasıl bulacağınızı, bölümleri nasıl okuyacağınızı ve ihtiyacınız olan şeye nasıl ulaşacağınızı anlatır.",
    cards: [
      {
        title: "Avangarda nedir?",
        copy:
          "Avangarda; hikâyeler, analizler, insan hakları, saha çalışmaları, belgesel materyaller ve kamusal yarar için kurulmuş editoryal bir alandır.",
      },
      {
        title: "Bir metni nasıl bulurum?",
        copy:
          "Aramayı kullanın, yazarları, temaları ve bölümleri gezinin. Aynı içeriğin başka dilde sürümünü arıyorsanız site dilini değiştirin.",
      },
      {
        title: "Bölümler neyi ifade eder?",
        copy:
          "Front günün ritmini izler. Analizler bağlamı genişletir. Röportajlar sesleri açar. Kolumneler daha keskin bir editoryal duruş taşır.",
      },
      {
        title: "Arşiv nedir?",
        copy:
          "Arşiv yalnızca içerik listesi değildir. Konuyu, dönemi ya da bakış açısını bulmayı kolaylaştıran düzenlenmiş bir giriş noktasıdır.",
      },
    ],
    faqLabel: "Site rehberi",
    faqTitle: "Nerede ne var",
    faqItems: [
      {
        title: "Hikâye Haritası nedir?",
        copy:
          "Hikâye Haritası, metinleri ve belgeselleri söz ettikleri yerlerle ilişkilendirir. Konuma göre keşfetmek istiyorsanız oradan başlayın.",
      },
      {
        title: "Hukuk Pusulası nedir?",
        copy:
          "Hukuk Pusulası; yasaları, hakları, rehberleri, formları ve belgeleri Avangarda temalarıyla bir araya getirir, böylece pratik bilgi erişilebilir kalır.",
      },
      {
        title: "Galeri nedir?",
        copy:
          "Galeri; sahadan, etkinliklerden, atölyelerden, topluluklardan ve belgesel hikâyelerden gelen görsel kayıtları toplar. Fotoğraf burada kendi editoryal çerçevesini alır.",
      },
      {
        title: "Kompas AI nedir?",
        copy:
          "Kompas AI, Avangarda'daki içerik üzerinden metin, tema, yazar, harita, hukuki belge veya açıklama bulmanıza yardım eder.",
      },
      {
        title: "Bir hikâye ya da öneri nasıl yollarım?",
        copy:
          "Bir hikâyeniz, belgeniz ya da iş birliği fikriniz varsa Hikâye gönder / İş birliği sayfasını veya iletişim sayfasını kullanın.",
      },
      {
        title: "Telif hakları ve fotoğraflar",
        copy:
          "Avangarda yazarları, kaynakları ve fotoğraf kredilerini korur. Aksi açıkça belirtilmedikçe görseller ve materyaller izinsiz yeniden kullanılmamalıdır.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "Kompas'a sor",
      copy:
        "Nereden başlayacağınızı bilmiyorsanız Kompas; metin, tema, yazar, harita, hukuki belge veya açıklama bulmanıza yardım eder.",
      button: "Kompas'ı aç",
    },
    actions: {
      label: "Sonraki adım",
      title: "İletişim ya da editoryal giriş mi gerekiyor?",
      copy: "Yardım sizi bir hikâyeye, belgeye veya iş birliğine götürüyorsa, editoryal masa için en kısa yollar burada.",
      contribute: "Hikâye gönder / İş birliği",
      contact: "İletişim",
    },
  },
  fr: {
    label: "Aide",
    title: "Aide",
    intro: "Comment utiliser Avangarda, trouver un contenu, comprendre les sections et ouvrir ce dont vous avez besoin.",
    cards: [
      {
        title: "Qu'est-ce qu'Avangarda ?",
        copy:
          "Avangarda est un espace éditorial pour les récits, les analyses, les droits humains, le terrain, les matériaux documentaires et l'intérêt public.",
      },
      {
        title: "Comment trouver un texte ?",
        copy:
          "Utilisez la recherche, parcourez les auteurs, les thèmes et les sections, ou changez la langue du site si vous cherchez une autre version.",
      },
      {
        title: "Que sont les sections ?",
        copy:
          "Front suit le rythme du jour. Analyses élargit le contexte. Interviews ouvre les voix. Chroniques apporte une position éditoriale plus nette.",
      },
      {
        title: "Qu'est-ce que les Archives ?",
        copy:
          "Les Archives ne sont pas une simple liste. C'est une entrée éditée dans le contenu, avec des filtres pour retrouver un sujet, une période ou un angle.",
      },
    ],
    faqLabel: "Guide du site",
    faqTitle: "Où se trouve chaque chose",
    faqItems: [
      {
        title: "Qu'est-ce que la Carte des récits ?",
        copy:
          "La Carte des récits relie les textes et les documentaires aux lieux dont ils parlent. Pour explorer par emplacement, commencez par là.",
      },
      {
        title: "Qu'est-ce que la Boussole juridique ?",
        copy:
          "La Boussole juridique rassemble lois, droits, guides, formulaires et documents liés aux thèmes d'Avangarda pour garder l'information pratique accessible.",
      },
      {
        title: "Qu'est-ce que les Galeries ?",
        copy:
          "Les Galeries sont des traces visuelles du terrain, des événements, des ateliers, des communautés et des récits documentaires. La photographie y trouve son cadre éditorial.",
      },
      {
        title: "Qu'est-ce que Kompas AI ?",
        copy:
          "Kompas AI vous aide à trouver un texte, un thème, un auteur, une carte, un document juridique ou une explication dans le contenu déjà publié.",
      },
      {
        title: "Comment envoyer une histoire ou une proposition ?",
        copy:
          "Si vous avez une histoire, un document ou une idée de collaboration, utilisez la page Envoyer une histoire / Collaborer ou la page de contact.",
      },
      {
        title: "Droits d'auteur et photographies",
        copy:
          "Avangarda respecte les auteurs, les sources et les crédits photo. Les images et matériaux ne doivent pas être repris sans autorisation, sauf indication contraire.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "Demander à Kompas",
      copy:
        "Si vous ne savez pas par où commencer, Kompas peut vous aider à trouver un texte, un thème, un auteur, une carte, un document juridique ou une explication.",
      button: "Ouvrir Kompas",
    },
    actions: {
      label: "Suite",
      title: "Besoin d'un contact ou d'une entrée éditoriale ?",
      copy: "Si l'aide mène à une histoire, un document ou une collaboration, voici les chemins les plus rapides vers la rédaction.",
      contribute: "Envoyer une histoire / Collaborer",
      contact: "Contact",
    },
  },
  de: {
    label: "Hilfe",
    title: "Hilfe",
    intro: "Wie du Avangarda nutzt, Inhalte findest, die Bereiche verstehst und schnell dorthin gelangst, wo du hinwillst.",
    cards: [
      {
        title: "Was ist Avangarda?",
        copy:
          "Avangarda ist ein redaktioneller Raum für Geschichten, Analysen, Menschenrechte, Feldarbeit, dokumentarisches Material und öffentliches Interesse.",
      },
      {
        title: "Wie finde ich einen Text?",
        copy:
          "Nutze die Suche, stöbere durch Autorinnen und Autoren, Themen und Bereiche oder wechsle die Sprache, wenn du eine andere Version brauchst.",
      },
      {
        title: "Was sind die Sektionen?",
        copy:
          "Front folgt dem Takt des Tages. Analysen erweitern den Kontext. Interviews öffnen Stimmen. Kolumnen bringen eine schärfere redaktionelle Haltung.",
      },
      {
        title: "Was ist das Archiv?",
        copy:
          "Das Archiv ist keine bloße Liste. Es ist ein geordneter Zugang zum Inhalt, mit Filtern für Thema, Zeitraum und Blickwinkel.",
      },
    ],
    faqLabel: "Seitenführer",
    faqTitle: "Wo du was findest",
    faqItems: [
      {
        title: "Was ist die Karte der Geschichten?",
        copy:
          "Die Karte der Geschichten verbindet Texte und Dokumentarfilme mit den Orten, von denen sie handeln. Für die Suche nach Ort ist sie der richtige Einstieg.",
      },
      {
        title: "Was ist der Rechtskompass?",
        copy:
          "Der Rechtskompass bündelt Gesetze, Rechte, Leitfäden, Formulare und Dokumente, die Avangarda mit Themen und Analysen verknüpft.",
      },
      {
        title: "Was ist die Galerie?",
        copy:
          "Die Galerie versammelt visuelle Aufzeichnungen vom Terrain, aus Gemeinschaften, von Ereignissen und dokumentarischen Geschichten. Fotografie bekommt dort ihren eigenen Rahmen.",
      },
      {
        title: "Was ist Kompas AI?",
        copy:
          "Kompas AI hilft dir, Texte, Themen, Autorinnen und Autoren, Karten, Rechtsdokumente oder Erklärungen im bereits veröffentlichten Material zu finden.",
      },
      {
        title: "Wie sende ich eine Geschichte oder einen Vorschlag?",
        copy:
          "Wenn du eine Geschichte, ein Dokument oder eine Idee für Zusammenarbeit hast, nutze die Seite Geschichte senden / Zusammenarbeit oder die Kontaktseite.",
      },
      {
        title: "Urheberrechte und Fotografie",
        copy:
          "Avangarda respektiert Autorinnen und Autoren, Quellen und Fotocredits. Bilder und Materialien dürfen ohne Genehmigung nicht übernommen werden, sofern nichts anderes vermerkt ist.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "Frag Kompas",
      copy:
        "Wenn du nicht weißt, wo du anfangen sollst, hilft dir Kompas dabei, einen Text, ein Thema, eine Autorin, eine Karte, ein Rechtsdokument oder eine Erklärung zu finden.",
      button: "Kompas öffnen",
    },
    actions: {
      label: "Weiter",
      title: "Brauchst du Kontakt oder einen redaktionellen Einstieg?",
      copy: "Wenn Hilfe zu einer Geschichte, einem Dokument oder einer Zusammenarbeit führt, findest du hier die schnellsten Wege in die Redaktion.",
      contribute: "Geschichte senden / Zusammenarbeit",
      contact: "Kontakt",
    },
  },
  es: {
    label: "Ayuda",
    title: "Ayuda",
    intro: "Cómo usar Avangarda, encontrar contenido, entender las secciones y abrir lo que necesitas.",
    cards: [
      {
        title: "¿Qué es Avangarda?",
        copy:
          "Avangarda es un espacio editorial para historias, análisis, derechos humanos, trabajo de campo, materiales documentales e interés público.",
      },
      {
        title: "¿Cómo encuentro un texto?",
        copy:
          "Usa la búsqueda, recorre autores, temas y secciones, o cambia el idioma del sitio si necesitas otra versión del mismo contenido.",
      },
      {
        title: "¿Qué son las secciones?",
        copy:
          "Front sigue el pulso del día. Análisis amplía el contexto. Entrevistas abre voces. Columnas aporta una posición editorial más filosa.",
      },
      {
        title: "¿Qué es el Archivo?",
        copy:
          "El Archivo no es solo una lista de publicaciones. Es una entrada editada al contenido, con filtros para encontrar un tema, un periodo o un ángulo.",
      },
    ],
    faqLabel: "Guía del sitio",
    faqTitle: "Dónde está cada cosa",
    faqItems: [
      {
        title: "¿Qué es el Mapa de historias?",
        copy:
          "El Mapa de historias conecta textos y documentales con los lugares de los que hablan. Si quieres explorar por ubicación, empieza allí.",
      },
      {
        title: "¿Qué es el Compás legal?",
        copy:
          "El Compás legal reúne leyes, derechos, guías, formularios y documentos vinculados a los temas y análisis de Avangarda.",
      },
      {
        title: "¿Qué son las Galerías?",
        copy:
          "Las Galerías son registros visuales del terreno, de eventos, talleres, comunidades e historias documentales. Allí la fotografía obtiene su propio marco editorial.",
      },
      {
        title: "¿Qué es Kompas AI?",
        copy:
          "Kompas AI te ayuda a encontrar un texto, tema, autor, mapa, documento legal o explicación dentro del contenido ya publicado por Avangarda.",
      },
      {
        title: "¿Cómo envío una historia o propuesta?",
        copy:
          "Si tienes una historia, un documento o una idea de colaboración, usa la página Envía una historia / Colabora o la página de contacto.",
      },
      {
        title: "Derechos de autor y fotografías",
        copy:
          "Avangarda respeta a autores, fuentes y créditos fotográficos. Las imágenes y materiales no deben reutilizarse sin permiso salvo que se indique lo contrario.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "Pregunta a Kompas",
      copy:
        "Si no sabes por dónde empezar, Kompas puede ayudarte a encontrar un texto, tema, autor, mapa, documento legal o explicación.",
      button: "Abrir Kompas",
    },
    actions: {
      label: "Siguiente paso",
      title: "¿Necesitas contacto o una entrada editorial?",
      copy: "Si la ayuda conduce a una historia, un documento o una colaboración, aquí están las rutas más rápidas hacia la redacción.",
      contribute: "Envía una historia / Colabora",
      contact: "Contacto",
    },
  },
  el: {
    label: "Βοήθεια",
    title: "Βοήθεια",
    intro: "Πώς να χρησιμοποιήσεις την Avangarda, να βρεις περιεχόμενο, να καταλάβεις τις ενότητες και να ανοίξεις αυτό που χρειάζεσαι.",
    cards: [
      {
        title: "Τι είναι η Avangarda;",
        copy:
          "Η Avangarda είναι ένας εκδοτικός χώρος για ιστορίες, αναλύσεις, ανθρώπινα δικαιώματα, πεδίο, ντοκιμαντερίστικο υλικό και δημόσιο ενδιαφέρον.",
      },
      {
        title: "Πώς βρίσκω ένα κείμενο;",
        copy:
          "Χρησιμοποίησε την αναζήτηση, δες συγγραφείς, θέματα και ενότητες ή άλλαξε γλώσσα αν χρειάζεσαι άλλη έκδοση του ίδιου περιεχομένου.",
      },
      {
        title: "Τι είναι οι ενότητες;",
        copy:
          "Το Front ακολουθεί τον ρυθμό της ημέρας. Οι Αναλύσεις ανοίγουν το πλαίσιο. Οι Συνεντεύξεις φέρνουν φωνές. Οι Στήλες δίνουν πιο κοφτερή εκδοτική θέση.",
      },
      {
        title: "Τι είναι το Αρχείο;",
        copy:
          "Το Αρχείο δεν είναι απλή λίστα. Είναι μια επιμελημένη είσοδος στο περιεχόμενο, με φίλτρα για θέμα, περίοδο και οπτική.",
      },
    ],
    faqLabel: "Οδηγός ιστότοπου",
    faqTitle: "Πού βρίσκεται τι",
    faqItems: [
      {
        title: "Τι είναι ο Χάρτης ιστοριών;",
        copy:
          "Ο Χάρτης ιστοριών συνδέει κείμενα και ντοκιμαντέρ με τους τόπους για τους οποίους μιλούν. Αν θέλεις να ψάξεις ανά τοποθεσία, ξεκίνα από εκεί.",
      },
      {
        title: "Τι είναι η Νομική Πυξίδα;",
        copy:
          "Η Νομική Πυξίδα συγκεντρώνει νόμους, δικαιώματα, οδηγούς, φόρμες και έγγραφα που η Avangarda συνδέει με τα θέματα και τις αναλύσεις της.",
      },
      {
        title: "Τι είναι οι Συλλογές;",
        copy:
          "Οι Συλλογές είναι οπτικά ίχνη από το πεδίο, γεγονότα, εργαστήρια, κοινότητες και ντοκιμαντερίστικες ιστορίες. Εκεί η φωτογραφία αποκτά δικό της εκδοτικό πλαίσιο.",
      },
      {
        title: "Τι είναι το Kompas AI;",
        copy:
          "Το Kompas AI σε βοηθά να βρεις κείμενο, θέμα, συγγραφέα, χάρτη, νομικό έγγραφο ή εξήγηση μέσα από το περιεχόμενο που έχει ήδη δημοσιεύσει η Avangarda.",
      },
      {
        title: "Πώς στέλνω ιστορία ή πρόταση;",
        copy:
          "Αν έχεις ιστορία, έγγραφο ή ιδέα συνεργασίας, χρησιμοποίησε τη σελίδα Στείλε ιστορία / Συνεργασία ή τη σελίδα επικοινωνίας.",
      },
      {
        title: "Πνευματικά δικαιώματα και φωτογραφίες",
        copy:
          "Η Avangarda σέβεται δημιουργούς, πηγές και φωτογραφικά credits. Οι εικόνες και τα υλικά δεν επαναχρησιμοποιούνται χωρίς άδεια εκτός αν σημειώνεται καθαρά το αντίθετο.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "Ρώτησε το Kompas",
      copy:
        "Αν δεν ξέρεις από πού να ξεκινήσεις, το Kompas μπορεί να σε βοηθήσει να βρεις κείμενο, θέμα, συγγραφέα, χάρτη, νομικό έγγραφο ή εξήγηση.",
      button: "Άνοιγμα Kompas",
    },
    actions: {
      label: "Επόμενο",
      title: "Χρειάζεσαι επικοινωνία ή εκδοτική είσοδο;",
      copy: "Αν η βοήθεια οδηγεί σε ιστορία, έγγραφο ή συνεργασία, εδώ είναι οι πιο γρήγοροι δρόμοι προς τη σύνταξη.",
      contribute: "Στείλε ιστορία / Συνεργασία",
      contact: "Επικοινωνία",
    },
  },
  ar: {
    label: "المساعدة",
    title: "المساعدة",
    intro: "كيف تستخدم أفانغاردا، وتجد المحتوى، وتفهم الأقسام، وتصل إلى ما تحتاجه بسرعة.",
    cards: [
      {
        title: "ما هي أفانغاردا؟",
        copy:
          "أفانغاردا مساحة تحريرية للقصص والتحليلات وحقوق الإنسان والعمل الميداني والمواد الوثائقية وكل ما يخدم المصلحة العامة.",
      },
      {
        title: "كيف أجد نصاً؟",
        copy:
          "استخدم البحث، وتصفّح الكتّاب والموضوعات والأقسام، أو غيّر لغة الموقع إذا كنت تبحث عن نسخة أخرى من المحتوى نفسه.",
      },
      {
        title: "ما هي الأقسام؟",
        copy:
          "الواجهة تتابع نبض اليوم. التحليلات توسّع السياق. المقابلات تفتح المجال للأصوات. الأعمدة تقدّم موقفاً تحريرياً أكثر حدّة.",
      },
      {
        title: "ما هو الأرشيف؟",
        copy:
          "الأرشيف ليس مجرد قائمة منشورات. إنه مدخل محرّر إلى المحتوى، مع فلاتر تساعدك على إيجاد الموضوع أو الفترة أو الزاوية التي تبحث عنها.",
      },
    ],
    faqLabel: "دليل الموقع",
    faqTitle: "أين يوجد كل شيء",
    faqItems: [
      {
        title: "ما هي خريطة القصص؟",
        copy:
          "خريطة القصص تربط النصوص والأفلام الوثائقية بالأماكن التي تتناولها. إذا أردت الاستكشاف حسب الموقع فابدأ من هناك.",
      },
      {
        title: "ما هو البوصلة القانونية؟",
        copy:
          "البوصلة القانونية تجمع القوانين والحقوق والأدلة والنماذج والوثائق التي تربطها أفانغاردا بالموضوعات والتحليلات حتى تبقى المعلومات العملية في المتناول.",
      },
      {
        title: "ما هي المعارض؟",
        copy:
          "المعارض هي سجلات بصرية من الميدان والأحداث وورش العمل والمجتمعات والقصص الوثائقية. هنا تحصل الصورة على إطارها التحريري الخاص.",
      },
      {
        title: "ما هو Kompas AI؟",
        copy:
          "يساعدك Kompas AI في العثور على نص أو موضوع أو كاتب أو خريطة أو وثيقة قانونية أو شرح داخل المحتوى الذي تنشره أفانغاردا بالفعل.",
      },
      {
        title: "كيف أرسل قصة أو اقتراحاً؟",
        copy:
          "إذا كانت لديك قصة أو وثيقة أو فكرة تعاون، فاستخدم صفحة أرسل قصة / تعاون أو صفحة الاتصال حتى يبقى المسار التحريري واضحاً.",
      },
      {
        title: "حقوق النشر والصور",
        copy:
          "تحترم أفانغاردا المؤلفين والمصادر واعتمادات الصور. لا يجوز إعادة استخدام الصور والمواد من دون إذن إلا إذا ذُكر خلاف ذلك بوضوح.",
      },
    ],
    compass: {
      label: "Kompas AI",
      title: "اسأل Kompas",
      copy:
        "إذا لم تكن تعرف من أين تبدأ، يمكن لـ Kompas أن يساعدك في العثور على نص أو موضوع أو كاتب أو خريطة أو وثيقة قانونية أو شرح.",
      button: "افتح Kompas",
    },
    actions: {
      label: "الخطوة التالية",
      title: "هل تحتاج إلى تواصل أو مدخل تحريري؟",
      copy: "إذا قادتك المساعدة إلى قصة أو وثيقة أو تعاون، فهذه أسرع الطرق إلى هيئة التحرير.",
      contribute: "أرسل قصة / تعاون",
      contact: "اتصل بنا",
    },
  },
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const page = helpCopy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/help",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function HelpPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const copy = helpCopy[lang];
  const cardEyebrows = helpCardEyebrows[lang];

  return (
    <>
      <SiteHeader lang={lang} currentPath="/help" activeNav={null} />

      <main className="site-main">
        <div className="page-shell help-page-shell">
          <section className="panel subpage-hero help-page__hero">
            <span className="eyebrow">{copy.label}</span>
            <h1 className="subpage-hero__title">{copy.title}</h1>
            <p className="subpage-hero__copy">{copy.intro}</p>
          </section>

          <section className="help-page__cards" aria-label={copy.label}>
            {copy.cards.map((card, index) => (
              <article key={card.title} className="panel info-card help-page__card">
                <span className="eyebrow">{cardEyebrows[index] ?? copy.label}</span>
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
              </article>
            ))}
          </section>

          <section className="panel help-page__faq">
            <div className="section-header help-page__section-header">
              <div>
                <span className="eyebrow">{copy.faqLabel}</span>
                <h2 className="section-title">{copy.faqTitle}</h2>
              </div>
            </div>

            <div className="help-page__faq-list">
              {copy.faqItems.map((item, index) => (
                <details key={item.title} className="help-page__faq-item" open={index === 0}>
                  <summary className="help-page__faq-summary">
                    <span>{item.title}</span>
                  </summary>
                  <div className="help-page__faq-body">
                    <p>{item.copy}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="panel help-page__cta">
            <div className="help-page__cta-copy">
              <span className="eyebrow">{copy.compass.label}</span>
              <h2>{copy.compass.title}</h2>
              <p>{copy.compass.copy}</p>
            </div>

            <div className="help-page__cta-actions">
              <HelpCompassTrigger label={copy.compass.button} />
            </div>
          </section>

          <section className="help-page__action-grid">
            <article className="panel help-page__action-card">
              <span className="eyebrow">{copy.actions.label}</span>
              <h2>{copy.actions.title}</h2>
              <p>{copy.actions.copy}</p>
              <div className="help-page__action-links">
                <a href={withLang("/contribute", lang)} className="button-primary">
                  {copy.actions.contribute}
                </a>
                <a href={withLang("/contact", lang)} className="button-secondary">
                  {copy.actions.contact}
                </a>
              </div>
            </article>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
