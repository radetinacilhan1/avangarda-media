import type { Lang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { unwrapStrapiCollection } from "@/lib/strapi";

type LocalizedRecord = Record<string, unknown>;

type TopicTranslationFallback = Record<Exclude<Lang, "sr">, string>;
type EditorialSignalTranslationFallback = Record<Exclude<Lang, "sr">, string>;
type DailyQuestionTranslationFallback = Record<Exclude<Lang, "sr">, string>;

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar"
};

function pickLocalizedValue(record: LocalizedRecord, field: string, lang: Lang) {
  const baseValue = record[field];
  if (lang === "sr") return typeof baseValue === "string" ? normalizeSerbianLatin(baseValue) : "";

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  if (typeof translatedValue === "string" && translatedValue.trim()) return translatedValue;
  return typeof baseValue === "string" ? baseValue : "";
}

function normalizeTranslationKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const topicTranslationFallbacks: Record<string, TopicTranslationFallback> = {
  drustvo: {
    en: "Society",
    tr: "Toplum",
    fr: "Societe",
    de: "Gesellschaft",
    es: "Sociedad",
    el: "Κοινωνία",
    ar: "المجتمع"
  },
  ekologija: {
    en: "Ecology",
    tr: "Ekoloji",
    fr: "Ecologie",
    de: "Oekologie",
    es: "Ecologia",
    el: "Οικολογία",
    ar: "البيئة"
  },
  identitet: {
    en: "Identity",
    tr: "Kimlik",
    fr: "Identite",
    de: "Identitaet",
    es: "Identidad",
    el: "Ταυτότητα",
    ar: "الهوية"
  },
  kultura: {
    en: "Culture",
    tr: "Kultur",
    fr: "Culture",
    de: "Kultur",
    es: "Cultura",
    el: "Πολιτισμός",
    ar: "الثقافة"
  },
  "ljudska prava": {
    en: "Human Rights",
    tr: "Insan Haklari",
    fr: "Droits humains",
    de: "Menschenrechte",
    es: "Derechos humanos",
    el: "Ανθρώπινα δικαιώματα",
    ar: "حقوق الإنسان"
  },
  margine: {
    en: "Margins",
    tr: "Marjinler",
    fr: "Marges",
    de: "Raender",
    es: "Margenes",
    el: "Περιθώρια",
    ar: "الهوامش"
  },
  palestina: {
    en: "Palestine",
    tr: "Filistin",
    fr: "Palestine",
    de: "Palaestina",
    es: "Palestina",
    el: "Παλαιστίνη",
    ar: "فلسطين"
  },
  politika: {
    en: "Politics",
    tr: "Politika",
    fr: "Politique",
    de: "Politik",
    es: "Politica",
    el: "Πολιτική",
    ar: "السياسة"
  },
  psihologija: {
    en: "Psychology",
    tr: "Psikoloji",
    fr: "Psychologie",
    de: "Psychologie",
    es: "Psicologia",
    el: "Ψυχολογία",
    ar: "علم النفس"
  },
  "rad i ekonomija": {
    en: "Work and Economy",
    tr: "Emek ve Ekonomi",
    fr: "Travail et economie",
    de: "Arbeit und Wirtschaft",
    es: "Trabajo y economia",
    el: "Εργασία και οικονομία",
    ar: "العمل والاقتصاد"
  },
  rogozna: {
    en: "Rogozna",
    tr: "Rogozna",
    fr: "Rogozna",
    de: "Rogozna",
    es: "Rogozna",
    el: "Rogozna",
    ar: "روجوزنا"
  },
  "secanje i istorija": {
    en: "Memory and History",
    tr: "Hafiza ve Tarih",
    fr: "Memoire et histoire",
    de: "Erinnerung und Geschichte",
    es: "Memoria e historia",
    el: "Μνήμη και ιστορία",
    ar: "الذاكرة والتاريخ"
  }
};

const editorialSignalTranslationFallbacks: Record<string, EditorialSignalTranslationFallback> = {
  "urednicki signal": {
    en: "Editorial signal",
    tr: "Editor sinyali",
    fr: "Signal editorial",
    de: "Redaktionelles Signal",
    es: "Señal editorial",
    el: "Συντακτικό σήμα",
    ar: "إشارة تحريرية"
  },
  "dobar magazinski sajt mora da ima stav cim se otvori": {
    en: "A strong magazine site needs a point of view the moment it opens.",
    tr: "Iyi bir dergi sitesi daha acildigi anda kendi tavrini gostermelidir.",
    fr: "Un bon magazine numerique doit montrer sa position des l'ouverture.",
    de: "Ein gutes Magazin muss vom ersten Moment an eine klare Haltung zeigen.",
    es: "Un buen sitio de revista necesita una postura clara desde el primer momento.",
    el: "Ένα δυνατό περιοδικό site χρειάζεται ξεκάθαρη στάση από την πρώτη στιγμή.",
    ar: "يحتاج موقع المجلة القوي إلى موقف واضح منذ اللحظة الأولى."
  },
  "ljudi nisu apaticni samo su umorni od prica koje nikad nemaju kraj": {
    en: "People are not apathetic. They are just exhausted by stories that never seem to end.",
    tr: "Insanlar apatik degil. Sadece hic bitmiyormus gibi gelen hikayelerden yorulmus durumdalar.",
    fr: "Les gens ne sont pas apathiques. Ils sont simplement epuises par des histoires qui ne semblent jamais finir.",
    de: "Die Menschen sind nicht apathisch. Sie sind nur muede von Geschichten, die niemals zu enden scheinen.",
    es: "La gente no es apática. Solo está cansada de historias que nunca parecen terminar.",
    el: "Οι άνθρωποι δεν είναι απαθείς. Είναι απλώς εξαντλημένοι από ιστορίες που δεν τελειώνουν ποτέ.",
    ar: "الناس ليسوا لا مبالين. إنهم فقط مرهقون من القصص التي لا يبدو أنها تنتهي."
  },
  "procitaj kontekst": {
    en: "Read context",
    tr: "Baglami oku",
    fr: "Lire le contexte",
    de: "Kontext lesen",
    es: "Leer contexto",
    el: "Διάβασε το πλαίσιο",
    ar: "اقرأ السياق"
  }
};

const dailyQuestionTranslationFallbacks: Record<string, DailyQuestionTranslationFallback> = {
  "pitanje dana": {
    en: "Question of the day",
    tr: "Gunun sorusu",
    fr: "Question du jour",
    de: "Frage des Tages",
    es: "Pregunta del dia",
    el: "Ερώτηση της ημέρας",
    ar: "سؤال اليوم"
  },
  "da li mislis da je umor politicki problem": {
    en: "Do you think exhaustion is a political problem?",
    tr: "Sence yorgunluk politik bir sorun mu?",
    fr: "Penses-tu que la fatigue est un probleme politique ?",
    de: "Ist Ermuedung ein politisches Problem?",
    es: "¿Crees que el agotamiento es un problema politico?",
    el: "Πιστεύεις ότι η εξάντληση είναι πολιτικό πρόβλημα;",
    ar: "هل تعتقد أن الإرهاق مشكلة سياسية؟"
  },
  da: {
    en: "YES",
    tr: "EVET",
    fr: "OUI",
    de: "JA",
    es: "SI",
    el: "ΝΑΙ",
    ar: "نعم"
  },
  ne: {
    en: "NO",
    tr: "HAYIR",
    fr: "NON",
    de: "NEIN",
    es: "NO",
    el: "ΟΧΙ",
    ar: "لا"
  },
  "procitaj kontekst": {
    en: "Read context",
    tr: "Baglami oku",
    fr: "Lire le contexte",
    de: "Kontext lesen",
    es: "Leer contexto",
    el: "Διάβασε το πλαίσιο",
    ar: "اقرأ السياق"
  }
};

function getTopicTranslationFallback(record: LocalizedRecord, lang: Exclude<Lang, "sr">) {
  const baseName = typeof record.name === "string" ? record.name : "";
  const fallback = topicTranslationFallbacks[normalizeTranslationKey(baseName)];
  return fallback?.[lang] || baseName;
}

function getEditorialSignalTranslationFallback(value: string, lang: Exclude<Lang, "sr">) {
  const normalizedValue = normalizeTranslationKey(value)
    .replace(/[“”„"'.!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const fallback = editorialSignalTranslationFallbacks[normalizedValue];
  return fallback?.[lang] || value;
}

function getDailyQuestionTranslationFallback(value: string, lang: Exclude<Lang, "sr">) {
  const normalizedValue = normalizeTranslationKey(value)
    .replace(/[â€œâ€â€ž"'.!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const fallback = dailyQuestionTranslationFallbacks[normalizedValue];
  return fallback?.[lang] || value;
}

export function localizeArticle<T extends LocalizedRecord>(article: T, lang: Lang) {
  return {
    ...article,
    title: pickLocalizedValue(article, "title", lang),
    subtitle: pickLocalizedValue(article, "subtitle", lang),
    content: pickLocalizedValue(article, "content", lang),
    signalText: pickLocalizedValue(article, "signalText", lang),
    distributionNote: pickLocalizedValue(article, "distributionNote", lang)
  };
}

export function localizeAuthor<T extends LocalizedRecord>(author: T, lang: Lang) {
  return {
    ...author,
    name: typeof author.name === "string" ? normalizeSerbianLatin(author.name) : author.name,
    bio: pickLocalizedValue(author, "bio", lang)
  };
}

export function localizeTopic<T extends LocalizedRecord>(topic: T, lang: Lang) {
  if (lang === "sr") {
    return {
      ...topic,
      name: pickLocalizedValue(topic, "name", lang)
    };
  }

  const translatedName = pickLocalizedValue(topic, "name", lang);
  const baseName = typeof topic.name === "string" ? topic.name : "";

  return {
    ...topic,
    name: translatedName !== baseName ? translatedName : getTopicTranslationFallback(topic, lang)
  };
}

export function localizeSearchHit<T extends LocalizedRecord>(hit: T, lang: Lang) {
  return {
    ...hit,
    title: pickLocalizedValue(hit, "title", lang),
    subtitle: pickLocalizedValue(hit, "subtitle", lang),
    content: pickLocalizedValue(hit, "content", lang),
    signalText: pickLocalizedValue(hit, "signalText", lang)
  };
}

export function localizeEditorialSignal<T extends LocalizedRecord>(signal: T, lang: Lang) {
  const localizedLabel = pickLocalizedValue(signal, "label", lang);
  const localizedText = pickLocalizedValue(signal, "text", lang);
  const localizedAuthor = pickLocalizedValue(signal, "author", lang);
  const localizedSource = pickLocalizedValue(signal, "source", lang);
  const localizedCta = pickLocalizedValue(signal, "ctaLabel", lang);
  const baseLabel = typeof signal.label === "string" ? signal.label : "";
  const baseText = typeof signal.text === "string" ? signal.text : "";
  const baseAuthor = typeof signal.author === "string" ? signal.author : "";
  const baseSource = typeof signal.source === "string" ? signal.source : "";
  const baseCta = typeof signal.ctaLabel === "string" ? signal.ctaLabel : "";

  if (lang === "sr") {
    return {
      ...signal,
      label: localizedLabel,
      text: localizedText,
      author: localizedAuthor,
      source: localizedSource,
      ctaLabel: localizedCta
    };
  }

  return {
    ...signal,
    label: localizedLabel !== baseLabel ? localizedLabel : getEditorialSignalTranslationFallback(baseLabel, lang),
    text: localizedText !== baseText ? localizedText : getEditorialSignalTranslationFallback(baseText, lang),
    author: localizedAuthor !== baseAuthor ? localizedAuthor : baseAuthor,
    source: localizedSource !== baseSource ? localizedSource : getEditorialSignalTranslationFallback(baseSource, lang),
    ctaLabel: localizedCta !== baseCta ? localizedCta : getEditorialSignalTranslationFallback(baseCta, lang)
  };
}

export function localizeHomepageEditorialCard<T extends LocalizedRecord>(card: T, lang: Lang) {
  return {
    ...card,
    label: pickLocalizedValue(card, "label", lang),
    title: pickLocalizedValue(card, "title", lang),
    text: pickLocalizedValue(card, "text", lang),
    ctaLabel: pickLocalizedValue(card, "ctaLabel", lang)
  };
}

export function localizeHomepageSidebarItem<T extends LocalizedRecord>(item: T, lang: Lang) {
  return {
    ...item,
    title: pickLocalizedValue(item, "title", lang),
    shortDescription: pickLocalizedValue(item, "shortDescription", lang)
  };
}

export function localizeDailyQuestion<T extends LocalizedRecord>(question: T, lang: Lang) {
  const localizedLabel = pickLocalizedValue(question, "label", lang);
  const localizedQuestion = pickLocalizedValue(question, "question", lang);
  const localizedAnswerA = pickLocalizedValue(question, "answerA", lang);
  const localizedAnswerB = pickLocalizedValue(question, "answerB", lang);
  const localizedAuthor = pickLocalizedValue(question, "author", lang);
  const localizedSource = pickLocalizedValue(question, "source", lang);
  const localizedCta = pickLocalizedValue(question, "ctaLabel", lang);
  const baseLabel = typeof question.label === "string" ? question.label : "";
  const baseQuestion = typeof question.question === "string" ? question.question : "";
  const baseAnswerA = typeof question.answerA === "string" ? question.answerA : "";
  const baseAnswerB = typeof question.answerB === "string" ? question.answerB : "";
  const baseAuthor = typeof question.author === "string" ? question.author : "";
  const baseSource = typeof question.source === "string" ? question.source : "";
  const baseCta = typeof question.ctaLabel === "string" ? question.ctaLabel : "";

  if (lang === "sr") {
    return {
      ...question,
      label: localizedLabel,
      question: localizedQuestion,
      answerA: localizedAnswerA,
      answerB: localizedAnswerB,
      author: localizedAuthor,
      source: localizedSource,
      ctaLabel: localizedCta
    };
  }

  return {
    ...question,
    label: localizedLabel !== baseLabel ? localizedLabel : getDailyQuestionTranslationFallback(baseLabel, lang),
    question: localizedQuestion !== baseQuestion ? localizedQuestion : getDailyQuestionTranslationFallback(baseQuestion, lang),
    answerA: localizedAnswerA !== baseAnswerA ? localizedAnswerA : getDailyQuestionTranslationFallback(baseAnswerA, lang),
    answerB: localizedAnswerB !== baseAnswerB ? localizedAnswerB : getDailyQuestionTranslationFallback(baseAnswerB, lang),
    author: localizedAuthor !== baseAuthor ? localizedAuthor : baseAuthor,
    source: localizedSource !== baseSource ? localizedSource : getDailyQuestionTranslationFallback(baseSource, lang),
    ctaLabel: localizedCta !== baseCta ? localizedCta : getDailyQuestionTranslationFallback(baseCta, lang)
  };
}

export function getAuthorNames(authors: unknown) {
  if (Array.isArray(authors)) {
    return authors
      .filter((author): author is string => typeof author === "string" && author.trim().length > 0)
      .map((author) => normalizeSerbianLatin(author));
  }

  return unwrapStrapiCollection<{ name?: string }>(authors)
    .map((author) => normalizeSerbianLatin(author.name?.trim() || ""))
    .filter(Boolean);
}

export function getAuthorLabel(authors: unknown) {
  return getAuthorNames(authors).join(", ");
}
