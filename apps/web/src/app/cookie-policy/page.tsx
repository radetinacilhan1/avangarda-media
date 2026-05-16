import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Cookie policy",
    title: "Cookie politika treba da bude jasna, ne sakrivena u fusnoti.",
    intro: "Ovo je placeholder stranica za punu cookie politiku koja će biti dopunjena kada budu definisani svi analitički i newsletter tokovi.",
    blocks: [
      { title: "Trenutno stanje", copy: "Sajt trenutno koristi minimum klijentske memorije za jezike, temu i lokalne UX izbore." },
      { title: "Šta dolazi", copy: "Kasnije će ovde biti precizno navedeni svi tehnički kolačići, analitika i korisničke dozvole." }
    ]
  },
  en: {
    label: "Cookie policy",
    title: "A cookie policy should be clear, not hidden in a footnote.",
    intro: "This is a placeholder page for a fuller cookie policy that will be expanded once analytics and newsletter flows are finalized.",
    blocks: [
      { title: "Current state", copy: "The site currently uses a minimal amount of client-side memory for language, theme and local UX choices." },
      { title: "What comes next", copy: "Later, this page will list technical cookies, analytics flows and user consent details." }
    ]
  },
  es: {
    label: "Política de cookies",
    title: "Una política de cookies debe ser clara, no esconderse en una nota al pie.",
    intro: "Esta es una página provisional para una política de cookies más completa que se ampliará cuando queden definidos los flujos de analítica y newsletter.",
    blocks: [
      { title: "Estado actual", copy: "Por ahora, el sitio usa una cantidad mínima de memoria del lado del cliente para idioma, tema y elecciones locales de UX." },
      { title: "Lo que viene", copy: "Más adelante, esta página detallará las cookies técnicas, los flujos de analítica y los datos sobre el consentimiento del usuario." }
    ]
  },
  el: {
    label: "Πολιτική cookies",
    title: "Μια πολιτική cookies πρέπει να είναι σαφής και όχι κρυμμένη σε υποσημείωση.",
    intro: "Αυτή είναι μια προσωρινή σελίδα για μια πληρέστερη πολιτική cookies, η οποία θα επεκταθεί όταν οριστικοποιηθούν οι ροές αναλυτικών και newsletter.",
    blocks: [
      { title: "Τρέχουσα κατάσταση", copy: "Ο ιστότοπος χρησιμοποιεί προς το παρόν ελάχιστη μνήμη στην πλευρά του πελάτη για τη γλώσσα, το θέμα και τοπικές επιλογές UX." },
      { title: "Τι ακολουθεί", copy: "Αργότερα, αυτή η σελίδα θα αναφέρει τα τεχνικά cookies, τις ροές αναλυτικών και τις λεπτομέρειες συγκατάθεσης του χρήστη." }
    ]
  },
  ar: {
    label: "سياسة ملفات تعريف الارتباط",
    title: "يجب أن تكون سياسة ملفات تعريف الارتباط واضحة، لا مخفية في هامش صغير.",
    intro: "هذه صفحة مؤقتة لسياسة ملفات تعريف ارتباط أكثر اكتمالًا، وستُوسَّع عندما تُحسم تدفقات التحليلات والنشرة البريدية.",
    blocks: [
      { title: "الوضع الحالي", copy: "يستخدم الموقع حاليًا حدًا أدنى من الذاكرة على جهة العميل من أجل اللغة والمظهر وبعض اختيارات تجربة الاستخدام المحلية." },
      { title: "ما القادم", copy: "لاحقًا ستعرض هذه الصفحة ملفات تعريف الارتباط التقنية وتدفقات التحليلات وتفاصيل موافقة المستخدم." }
    ]
  },
  de: {
    label: "Cookie-Richtlinie",
    title: "Eine Cookie-Richtlinie sollte klar sein und nicht im Kleingedruckten verschwinden.",
    intro: "Dies ist eine Placeholder-Seite fuer eine spaetere, ausfuehrlichere Cookie-Richtlinie, sobald Analyse- und Newsletter-Flows finalisiert sind.",
    blocks: [
      { title: "Aktueller Stand", copy: "Die Seite nutzt derzeit nur minimale clientseitige Speicherung fuer Sprache, Theme und lokale UX-Entscheidungen." },
      { title: "Was folgt", copy: "Spaeter werden hier technische Cookies, Analysewege und Einwilligungsdetails aufgelistet." }
    ]
  },
  fr: {
    label: "Politique des cookies",
    title: "Une politique des cookies doit etre claire et non cachee dans une note.",
    intro: "Cette page sert de placeholder pour une politique plus complete qui sera enrichie lorsque les flux d'analyse et de newsletter seront finalises.",
    blocks: [
      { title: "Etat actuel", copy: "Le site utilise actuellement un minimum de memoire locale pour la langue, le theme et quelques choix UX." },
      { title: "La suite", copy: "Plus tard, cette page listera les cookies techniques, les flux analytiques et les details de consentement." }
    ]
  },
  tr: {
    label: "Cerez politikasi",
    title: "Cerez politikasi dipnotta saklanmamali, acik olmali.",
    intro: "Bu sayfa, analiz ve newsletter akislarinin netlesmesinden sonra genisletilecek daha kapsamli bir cerez politikasi icin placeholder gorevi gorur.",
    blocks: [
      { title: "Mevcut durum", copy: "Site simdilik dil, tema ve yerel UX tercihleri icin minimum duzeyde istemci tarafi hafiza kullanir." },
      { title: "Siradaki adim", copy: "Daha sonra teknik cerezler, analiz akisleri ve kullanici onayi ayrintilari burada listelenecek." }
    ]
  }
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const page = copy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/cookie-policy",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function CookiePolicyPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/cookie-policy" copy={copy[lang]} />;
}
