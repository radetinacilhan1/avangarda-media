import { FooterNewsletterForm } from "@/components/footer-newsletter-form";
import { SocialLinks } from "@/components/social-links";
import { getGalleryLabel } from "@/lib/galleries";
import { getHumanRightsLabel, getLegalCompassLabel } from "@/lib/human-rights";
import { getInteractiveLabel } from "@/lib/interactive";
import type { Dictionary, Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";

type SiteFooterProps = {
  lang: Lang;
  t?: Dictionary;
};

type FooterCopy = {
  brandCopy: string;
  editorialLabel: string;
  editorialLinks: {
    home: string;
    about: string;
    principle: string;
    contact: string;
    contribute: string;
    help: string;
  };
  sectionsLabel: string;
  sectionsLinks: {
    news: string;
    analysis: string;
    interview: string;
    column: string;
    archive: string;
    galleries: string;
    storyMap: string;
    topics: string;
  };
  networkLabel: string;
  networkLinks: {
    youtube: string;
    instagram: string;
    tiktok: string;
    x: string;
    linkedin: string;
    newsletter: string;
  };
  support: {
    label: string;
    title: string;
    description: string;
    button: string;
    note: string;
  };
  newsletterTitle: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
  newsletterNote: string;
  newsletterLabel: string;
  slogan: string;
  copyright: string;
  privacy: string;
  terms: string;
  impressum: string;
  cookies: string;
};

const footerCopy: Record<Lang, FooterCopy> = {
  sr: {
    brandCopy: "Avangarda je prostor za pri\u010de koje tra\u017ee vreme, kontekst i stav.",
    editorialLabel: "Uredni\u0161tvo",
    editorialLinks: {
      home: "Naslovna",
      about: "O nama",
      principle: "Uredni\u010dki princip",
      contact: "Kontakt",
      contribute: "Po\u0161alji pri\u010du / Saradnja",
      help: "Pomo\u0107"
    },
    sectionsLabel: "Sekcije",
    sectionsLinks: {
      news: "Front",
      analysis: "Analize",
      interview: "Intervjui",
      column: "Kolumne",
      archive: "Arhiva",
      galleries: "Galerija",
      storyMap: "Mapa pri\u010da",
      topics: "Teme"
    },
    networkLabel: "Mre\u017ea",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "Newsletter"
    },
    support: {
      label: "NEZAVISNI RAD",
      title: "Podr\u017ei Avangardu",
      description: "Ako ti ovakav rad zna\u010di, pomozi nam da slede\u0107a pri\u010da stigne do kraja.",
      button: "Podr\u017ei rad",
      note: "Iznos bira\u0161 ti."
    },
    newsletterTitle: "Ne \u0161aljemo sve. Samo ono \u0161to ostaje.",
    newsletterPlaceholder: "Email adresa",
    newsletterButton: "Prijavi se",
    newsletterNote: "Newsletter forma je placeholder i bi\u0107e povezana sa API-jem kada backend bude spreman.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Politika privatnosti",
    terms: "Uslovi kori\u0161\u0107enja",
    impressum: "Impresum",
    cookies: "Politika kolačića"
  },
  en: {
    brandCopy: "Avangarda is a space for stories that need time, context and a position.",
    editorialLabel: "Editorial",
    editorialLinks: {
      home: "Home",
      about: "About",
      principle: "Editorial principle",
      contact: "Contact",
      contribute: "Pitch a story / Collaborate",
      help: "Help"
    },
    sectionsLabel: "Sections",
    sectionsLinks: {
      news: "Front",
      analysis: "Analysis",
      interview: "Interviews",
      column: "Columns",
      archive: "Archive",
      galleries: "Galleries",
      storyMap: "Story Map",
      topics: "Topics"
    },
    networkLabel: "Network",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "Newsletter"
    },
    support: {
      label: "INDEPENDENT WORK",
      title: "Support Avangarda",
      description: "If work like this matters to you, help us carry the next story through to the end.",
      button: "Support our work",
      note: "You choose the amount."
    },
    newsletterTitle: "We don't send everything. Only what stays.",
    newsletterPlaceholder: "Email address",
    newsletterButton: "Subscribe",
    newsletterNote: "This newsletter form is a frontend placeholder and will be connected to an API later.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Privacy policy",
    terms: "Terms of use",
    impressum: "Imprint",
    cookies: "Cookie policy"
  },
  de: {
    brandCopy: "Avangarda ist ein Raum f\u00fcr Geschichten, die Zeit, Kontext und Haltung brauchen.",
    editorialLabel: "Editorial",
    editorialLinks: {
      home: "Startseite",
      about: "\u00dcber uns",
      principle: "Redaktionelles Prinzip",
      contact: "Kontakt",
      contribute: "Geschichte senden / Zusammenarbeit",
      help: "Hilfe"
    },
    sectionsLabel: "Sektionen",
    sectionsLinks: {
      news: "Auftakt",
      analysis: "Analysen",
      interview: "Interviews",
      column: "Kolumnen",
      archive: "Archiv",
      galleries: "Galerien",
      storyMap: "Karte der Geschichten",
      topics: "Themen"
    },
    networkLabel: "Netzwerk",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "Newsletter"
    },
    support: {
      label: "UNABH\u00c4NGIGE ARBEIT",
      title: "Unterst\u00fctze Avangarda",
      description: "Wenn dir diese Arbeit etwas bedeutet, hilf uns, die n\u00e4chste Geschichte bis zum Ende zu erz\u00e4hlen.",
      button: "Arbeit unterst\u00fctzen",
      note: "Du bestimmst den Betrag."
    },
    newsletterTitle: "Wir schicken nicht alles. Nur das, was bleibt.",
    newsletterPlaceholder: "E-Mail-Adresse",
    newsletterButton: "Anmelden",
    newsletterNote: "Dieses Newsletter-Feld ist vorerst ein Frontend-Placeholder und wird sp\u00e4ter mit einer API verbunden.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    impressum: "Impressum",
    cookies: "Cookie-Richtlinie"
  },
  fr: {
    brandCopy: "Avangarda est un espace pour les r\u00e9cits qui demandent du temps, du contexte et une position.",
    editorialLabel: "\u00c9ditorial",
    editorialLinks: {
      home: "Accueil",
      about: "\u00c0 propos",
      principle: "Principe \u00e9ditorial",
      contact: "Contact",
      contribute: "Envoyer une histoire / Collaborer",
      help: "Aide"
    },
    sectionsLabel: "Sections",
    sectionsLinks: {
      news: "\u00c0 la une",
      analysis: "Analyses",
      interview: "Interviews",
      column: "Chroniques",
      archive: "Archives",
      galleries: "Galeries",
      storyMap: "Carte des r\u00e9cits",
      topics: "Th\u00e8mes"
    },
    networkLabel: "R\u00e9seau",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "Newsletter"
    },
    support: {
      label: "TRAVAIL IND\u00c9PENDANT",
      title: "Soutenez Avangarda",
      description: "Si ce travail compte pour vous, aidez-nous \u00e0 mener la prochaine histoire jusqu'au bout.",
      button: "Soutenir notre travail",
      note: "Vous choisissez le montant."
    },
    newsletterTitle: "Nous n'envoyons pas tout. Seulement ce qui reste.",
    newsletterPlaceholder: "Adresse e-mail",
    newsletterButton: "S'inscrire",
    newsletterNote: "Ce formulaire newsletter est un placeholder frontend et sera reli\u00e9 \u00e0 une API plus tard.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Politique de confidentialit\u00e9",
    terms: "Conditions d'utilisation",
    impressum: "Mentions legales",
    cookies: "Politique des cookies"
  },
  tr: {
    brandCopy: "Avangarda; zaman, ba\u011flam ve tav\u0131r isteyen hik\u00e2yeler i\u00e7in bir aland\u0131r.",
    editorialLabel: "Editoryal",
    editorialLinks: {
      home: "Ana sayfa",
      about: "Hakk\u0131m\u0131zda",
      principle: "Editoryal ilke",
      contact: "\u0130leti\u015fim",
      contribute: "Hik\u00e2ye g\u00f6nder / \u0130\u015f birli\u011fi",
      help: "Yard\u0131m"
    },
    sectionsLabel: "B\u00f6l\u00fcmler",
    sectionsLinks: {
      news: "Man\u015fet",
      analysis: "Analizler",
      interview: "R\u00f6portajlar",
      column: "K\u00f6\u015fe",
      archive: "Ar\u015fiv",
      galleries: "Galeriler",
      storyMap: "Hik\u00e2ye Haritas\u0131",
      topics: "Temalar"
    },
    networkLabel: "A\u011f",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "B\u00fclten"
    },
    support: {
      label: "BA\u011eIMSIZ \u00c7ALI\u015eMA",
      title: "Avangarda'y\u0131 destekle",
      description: "Bu t\u00fcr \u00e7al\u0131\u015fmalar sizin i\u00e7in \u00f6nemliyse, bir sonraki hik\u00e2yeyi sonuna kadar ula\u015ft\u0131rmam\u0131za yard\u0131mc\u0131 olun.",
      button: "\u00c7al\u0131\u015fmam\u0131z\u0131 destekle",
      note: "Tutar\u0131 siz belirlersiniz."
    },
    newsletterTitle: "Her \u015feyi g\u00f6ndermiyoruz. Sadece kalan\u0131.",
    newsletterPlaceholder: "E-posta adresi",
    newsletterButton: "Kaydol",
    newsletterNote: "Bu b\u00fclten formu \u015fimdilik bir frontend placeholder'\u0131d\u0131r; backend haz\u0131r oldu\u011funda API ile ba\u011flanacakt\u0131r.",
    newsletterLabel: "B\u00fclten",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Gizlilik politikas\u0131",
    terms: "Kullan\u0131m ko\u015fullar\u0131",
    impressum: "Kunye",
    cookies: "\u00c7erez politikas\u0131"
  },
  es: {
    brandCopy: "Avangarda es un espacio para historias que necesitan tiempo, contexto y postura.",
    editorialLabel: "Editorial",
    editorialLinks: {
      home: "Inicio",
      about: "Sobre nosotros",
      principle: "Principio editorial",
      contact: "Contacto",
      contribute: "Env\u00eda una historia / Colabora",
      help: "Ayuda"
    },
    sectionsLabel: "Secciones",
    sectionsLinks: {
      news: "Portada",
      analysis: "An\u00e1lisis",
      interview: "Entrevistas",
      column: "Columnas",
      archive: "Archivo",
      galleries: "Galer\u00edas",
      storyMap: "Mapa de historias",
      topics: "Temas"
    },
    networkLabel: "Red",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "Bolet\u00edn"
    },
    support: {
      label: "TRABAJO INDEPENDIENTE",
      title: "Apoya a Avangarda",
      description: "Si este trabajo significa algo para ti, ay\u00fadanos a llevar la pr\u00f3xima historia hasta el final.",
      button: "Apoya nuestro trabajo",
      note: "T\u00fa eliges el importe."
    },
    newsletterTitle: "No enviamos todo. Solo lo que permanece.",
    newsletterPlaceholder: "Correo electr\u00f3nico",
    newsletterButton: "Suscribirse",
    newsletterNote: "Este formulario del bolet\u00edn es por ahora un marcador temporal del frontend y se conectar\u00e1 a una API m\u00e1s adelante.",
    newsletterLabel: "Bolet\u00edn",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Pol\u00edtica de privacidad",
    terms: "T\u00e9rminos de uso",
    impressum: "Aviso legal",
    cookies: "Pol\u00edtica de cookies"
  },
  el: {
    brandCopy: "\u0397 Avangarda \u03b5\u03af\u03bd\u03b1\u03b9 \u03c7\u03ce\u03c1\u03bf\u03c2 \u03b3\u03b9\u03b1 \u03b9\u03c3\u03c4\u03bf\u03c1\u03af\u03b5\u03c2 \u03c0\u03bf\u03c5 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c7\u03c1\u03cc\u03bd\u03bf, \u03c0\u03bb\u03b1\u03af\u03c3\u03b9\u03bf \u03ba\u03b1\u03b9 \u03b8\u03ad\u03c3\u03b7.",
    editorialLabel: "Editorial",
    editorialLinks: {
      home: "\u0391\u03c1\u03c7\u03b9\u03ba\u03ae",
      about: "\u03a3\u03c7\u03b5\u03c4\u03b9\u03ba\u03ac",
      principle: "\u0395\u03ba\u03b4\u03bf\u03c4\u03b9\u03ba\u03ae \u03b1\u03c1\u03c7\u03ae",
      contact: "\u0395\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1",
      contribute: "\u03a3\u03c4\u03b5\u03af\u03bb\u03b5 \u03b9\u03c3\u03c4\u03bf\u03c1\u03af\u03b1 / \u03a3\u03c5\u03bd\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1",
      help: "\u0392\u03bf\u03ae\u03b8\u03b5\u03b9\u03b1"
    },
    sectionsLabel: "\u0395\u03bd\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2",
    sectionsLinks: {
      news: "\u03a0\u03c1\u03ce\u03c4\u03b7",
      analysis: "\u0391\u03bd\u03b1\u03bb\u03cd\u03c3\u03b5\u03b9\u03c2",
      interview: "\u03a3\u03c5\u03bd\u03b5\u03bd\u03c4\u03b5\u03cd\u03be\u03b5\u03b9\u03c2",
      column: "\u03a3\u03c4\u03ae\u03bb\u03b5\u03c2",
      archive: "\u0391\u03c1\u03c7\u03b5\u03af\u03bf",
      galleries: "\u03a3\u03c5\u03bb\u03bb\u03bf\u03b3\u03ad\u03c2",
      storyMap: "\u03a7\u03ac\u03c1\u03c4\u03b7\u03c2 \u03b9\u03c3\u03c4\u03bf\u03c1\u03b9\u03ce\u03bd",
      topics: "\u0398\u03ad\u03bc\u03b1\u03c4\u03b1"
    },
    networkLabel: "\u0394\u03af\u03ba\u03c4\u03c5\u03bf",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "\u0395\u03bd\u03b7\u03bc\u03b5\u03c1\u03c9\u03c4\u03b9\u03ba\u03cc"
    },
    support: {
      label: "\u0391\u039d\u0395\u039e\u0391\u03a1\u03a4\u0397\u03a4\u0397 \u0395\u03a1\u0393\u0391\u03a3\u0399\u0391",
      title: "\u03a3\u03c4\u03ae\u03c1\u03b9\u03be\u03b5 \u03c4\u03b7\u03bd Avangarda",
      description: "\u0391\u03bd \u03b1\u03c5\u03c4\u03ae \u03b7 \u03b4\u03bf\u03c5\u03bb\u03b5\u03b9\u03ac \u03ad\u03c7\u03b5\u03b9 \u03c3\u03b7\u03bc\u03b1\u03c3\u03af\u03b1 \u03b3\u03b9\u03b1 \u03c3\u03ad\u03bd\u03b1, \u03b2\u03bf\u03ae\u03b8\u03b7\u03c3\u03ad \u03bc\u03b1\u03c2 \u03bd\u03b1 \u03c6\u03c4\u03ac\u03c3\u03bf\u03c5\u03bc\u03b5 \u03c4\u03b7\u03bd \u03b5\u03c0\u03cc\u03bc\u03b5\u03bd\u03b7 \u03b9\u03c3\u03c4\u03bf\u03c1\u03af\u03b1 \u03bc\u03ad\u03c7\u03c1\u03b9 \u03c4\u03bf \u03c4\u03ad\u03bb\u03bf\u03c2.",
      button: "\u03a3\u03c4\u03ae\u03c1\u03b9\u03be\u03b5 \u03c4\u03b7 \u03b4\u03bf\u03c5\u03bb\u03b5\u03b9\u03ac \u03bc\u03b1\u03c2",
      note: "\u0395\u03c3\u03cd \u03b5\u03c0\u03b9\u03bb\u03ad\u03b3\u03b5\u03b9\u03c2 \u03c4\u03bf \u03c0\u03bf\u03c3\u03cc."
    },
    newsletterTitle: "\u0394\u03b5\u03bd \u03c3\u03c4\u03ad\u03bb\u03bd\u03bf\u03c5\u03bc\u03b5 \u03c4\u03b1 \u03c0\u03ac\u03bd\u03c4\u03b1. \u039c\u03cc\u03bd\u03bf \u03cc,\u03c4\u03b9 \u03bc\u03ad\u03bd\u03b5\u03b9.",
    newsletterPlaceholder: "\u0394\u03b9\u03b5\u03cd\u03b8\u03c5\u03bd\u03c3\u03b7 email",
    newsletterButton: "\u0395\u03b3\u03b3\u03c1\u03b1\u03c6\u03ae",
    newsletterNote: "\u0391\u03c5\u03c4\u03ae \u03b7 \u03c6\u03cc\u03c1\u03bc\u03b1 \u03b5\u03bd\u03b7\u03bc\u03b5\u03c1\u03c9\u03c4\u03b9\u03ba\u03bf\u03cd \u03b4\u03b5\u03bb\u03c4\u03af\u03bf\u03c5 \u03b5\u03af\u03bd\u03b1\u03b9 \u03c0\u03c1\u03bf\u03c2 \u03c4\u03bf \u03c0\u03b1\u03c1\u03cc\u03bd \u03c0\u03c1\u03bf\u03c3\u03c9\u03c1\u03b9\u03bd\u03ae \u03bb\u03cd\u03c3\u03b7 frontend \u03ba\u03b1\u03b9 \u03b8\u03b1 \u03c3\u03c5\u03bd\u03b4\u03b5\u03b8\u03b5\u03af \u03b1\u03c1\u03b3\u03cc\u03c4\u03b5\u03c1\u03b1 \u03bc\u03b5 API.",
    newsletterLabel: "\u0395\u03bd\u03b7\u03bc\u03b5\u03c1\u03c9\u03c4\u03b9\u03ba\u03cc",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "\u03a0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae \u03b1\u03c0\u03bf\u03c1\u03c1\u03ae\u03c4\u03bf\u03c5",
    terms: "\u038c\u03c1\u03bf\u03b9 \u03c7\u03c1\u03ae\u03c3\u03b7\u03c2",
    impressum: "\u03a3\u03c4\u03bf\u03b9\u03c7\u03b5\u03af\u03b1 \u03ad\u03ba\u03b4\u03bf\u03c3\u03b7\u03c2",
    cookies: "\u03a0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae cookies"
  },
  ar: {
    brandCopy: "\u0623\u0641\u0627\u0646\u063a\u0627\u0631\u062f\u0627 \u0645\u0633\u0627\u062d\u0629 \u0644\u0644\u0642\u0635\u0635 \u0627\u0644\u062a\u064a \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0648\u0642\u062a \u0648\u0633\u064a\u0627\u0642 \u0648\u0645\u0648\u0642\u0641 \u0648\u0627\u0636\u062d.",
    editorialLabel: "\u0627\u0644\u062a\u062d\u0631\u064a\u0631",
    editorialLinks: {
      home: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
      about: "\u0645\u0646 \u0646\u062d\u0646",
      principle: "\u0627\u0644\u0645\u0628\u062f\u0623 \u0627\u0644\u062a\u062d\u0631\u064a\u0631\u064a",
      contact: "\u0627\u062a\u0635\u0644 \u0628\u0646\u0627",
      contribute: "\u0623\u0631\u0633\u0644 \u0642\u0635\u0629 / \u062a\u0639\u0627\u0648\u0646",
      help: "\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629"
    },
    sectionsLabel: "\u0627\u0644\u0623\u0642\u0633\u0627\u0645",
    sectionsLinks: {
      news: "\u0627\u0644\u0648\u0627\u062c\u0647\u0629",
      analysis: "\u062a\u062d\u0644\u064a\u0644\u0627\u062a",
      interview: "\u0645\u0642\u0627\u0628\u0644\u0627\u062a",
      column: "\u0623\u0639\u0645\u062f\u0629",
      archive: "\u0627\u0644\u0623\u0631\u0634\u064a\u0641",
      galleries: "\u0627\u0644\u0645\u0639\u0627\u0631\u0636",
      storyMap: "\u062e\u0631\u064a\u0637\u0629 \u0627\u0644\u0642\u0635\u0635",
      topics: "\u0627\u0644\u0645\u0648\u0636\u0648\u0639\u0627\u062a"
    },
    networkLabel: "\u0627\u0644\u0634\u0628\u0643\u0629",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      linkedin: "LinkedIn",
      newsletter: "\u0627\u0644\u0646\u0634\u0631\u0629"
    },
    support: {
      label: "\u0639\u0645\u0644 \u0645\u0633\u062a\u0642\u0644",
      title: "\u0627\u062f\u0639\u0645 \u0623\u0641\u0627\u0646\u063a\u0627\u0631\u062f\u0627",
      description: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u0639\u0645\u0644 \u064a\u0639\u0646\u064a \u0644\u0643 \u0634\u064a\u0626\u064b\u0627\u060c \u0641\u0633\u0627\u0639\u062f\u0646\u0627 \u0639\u0644\u0649 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u0642\u0635\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629 \u0625\u0644\u0649 \u0646\u0647\u0627\u064a\u062a\u0647\u0627.",
      button: "\u0627\u062f\u0639\u0645 \u0639\u0645\u0644\u0646\u0627",
      note: "\u0623\u0646\u062a \u062a\u062e\u062a\u0627\u0631 \u0627\u0644\u0645\u0628\u0644\u063a."
    },
    newsletterTitle: "\u0646\u062d\u0646 \u0644\u0627 \u0646\u0631\u0633\u0644 \u0643\u0644 \u0634\u064a\u0621. \u0641\u0642\u0637 \u0645\u0627 \u064a\u0628\u0642\u0649.",
    newsletterPlaceholder: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    newsletterButton: "\u0627\u0634\u062a\u0631\u0643",
    newsletterNote: "\u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0646\u0634\u0631\u0629 \u0647\u0630\u0627 placeholder \u0641\u064a \u0627\u0644\u0648\u0627\u062c\u0647\u0629 \u062d\u0627\u0644\u064a\u0627\u064b \u0648\u0633\u064a\u062a\u0645 \u0631\u0628\u0637\u0647 \u0644\u0627\u062d\u0642\u0627\u064b \u0645\u0639 API.",
    newsletterLabel: "\u0627\u0644\u0646\u0634\u0631\u0629",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
    terms: "\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645",
    impressum: "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0631",
    cookies: "\u0633\u064a\u0627\u0633\u0629 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637"
  }
};

export function SiteFooter({ lang }: SiteFooterProps) {
  const copy = footerCopy[lang];
  const galleryLabel = getGalleryLabel(lang);
  const humanRightsLabel = getHumanRightsLabel(lang);
  const legalCompassLabel = getLegalCompassLabel(lang);
  const interactiveLabel = getInteractiveLabel(lang);

  return (
    <>
      <section className="site-prefooter" aria-label={`${copy.support.title} / ${copy.newsletterLabel}`}>
        <div className="site-prefooter__inner">
          <section className="site-footer__support" aria-labelledby="footer-support-title">
            <div className="site-footer__support-copy">
              <span className="site-footer__label">{copy.support.label}</span>
              <h3 id="footer-support-title">{copy.support.title}</h3>
              <p>{copy.support.description}</p>
            </div>
            <div className="site-footer__support-actions">
              <a
                className="site-footer__support-cta"
                href={withLang("/podrzi", lang)}
                title={copy.support.button}
              >
                {copy.support.button}
              </a>
              <p className="site-footer__support-note">{copy.support.note}</p>
            </div>
          </section>

          <section id="footer-newsletter" className="site-footer__newsletter">
            <div className="site-footer__newsletter-copy">
              <span className="site-footer__label">{copy.newsletterLabel}</span>
              <h3>{copy.newsletterTitle}</h3>
            </div>
            <FooterNewsletterForm
              placeholder={copy.newsletterPlaceholder}
              buttonLabel={copy.newsletterButton}
              note={copy.newsletterNote}
            />
          </section>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <img className="site-footer__logo" src="/avangarda-logo.png" alt="Avangarda logo" />
            <div className="site-footer__brand-copy">
              <strong className="site-footer__brand-title">Avangarda</strong>
              <p className="site-footer__brand-text">{copy.brandCopy}</p>
              <SocialLinks lang={lang} />
            </div>
          </div>

          <div className="site-footer__grid">
            <div className="site-footer__column">
              <span className="site-footer__label">{copy.editorialLabel}</span>
              <a href={withLang("/", lang)}>{copy.editorialLinks.home}</a>
              <a href={withLang("/o-nama", lang)}>{copy.editorialLinks.about}</a>
              <a href={withLang("/editorial-principle", lang)}>{copy.editorialLinks.principle}</a>
              <a href={withLang("/contact", lang)}>{copy.editorialLinks.contact}</a>
              <a href={withLang("/help", lang)}>{copy.editorialLinks.help}</a>
              <a href={withLang("/contribute", lang)}>{copy.editorialLinks.contribute}</a>
            </div>

            <div className="site-footer__column site-footer__column--sections">
              <span className="site-footer__label">{copy.sectionsLabel}</span>
              <div className="site-footer__section-links">
                <a href={withLang("/section/front", lang)}>{copy.sectionsLinks.news}</a>
                <a href={withLang("/section/analysis", lang)}>{copy.sectionsLinks.analysis}</a>
                <a href={withLang("/section/interview", lang)}>{copy.sectionsLinks.interview}</a>
                <a href={withLang("/section/column", lang)}>{copy.sectionsLinks.column}</a>
                <a href={withLang("/ljudska-prava", lang)}>{humanRightsLabel}</a>
                <a href={withLang("/interaktivno", lang)}>{interactiveLabel}</a>
                <a href={withLang("/archive", lang)}>{copy.sectionsLinks.archive}</a>
                <a href={withLang("/galerije", lang)}>{galleryLabel || copy.sectionsLinks.galleries}</a>
                <a href={withLang("/mapa", lang)}>{copy.sectionsLinks.storyMap}</a>
                <a href={withLang("/pravni-kompas", lang)}>{legalCompassLabel}</a>
                <a href={withLang("/topics", lang)}>{copy.sectionsLinks.topics}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span className="site-footer__bottomline">{copy.copyright}</span>
          <span className="site-footer__bottomline">{copy.slogan}</span>
          <div className="site-footer__legal">
            <a href={withLang("/privacy-policy", lang)}>{copy.privacy}</a>
            <a href={withLang("/terms-of-use", lang)}>{copy.terms}</a>
            <a href={withLang("/impresum", lang)}>{copy.impressum}</a>
            <a href={withLang("/cookie-policy", lang)}>{copy.cookies}</a>
          </div>
        </div>
        </div>
      </footer>
    </>
  );
}
