import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Cookie policy",
    title: "Cookie politika treba da bude jasna, ne sakrivena u fusnoti.",
    intro: "Ovo je placeholder stranica za punu cookie politiku koja ce biti dopunjena kada budu definisani svi analiticki i newsletter tokovi.",
    blocks: [
      { title: "Trenutno stanje", copy: "Sajt trenutno koristi minimum klijentske memorije za jezike, temu i lokalne UX izbore." },
      { title: "Sta dolazi", copy: "Kasnije ce ovde biti precizno navedeni svi tehnicki kolačići, analitika i korisnicke dozvole." }
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

export default function CookiePolicyPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/cookie-policy" copy={copy[lang]} />;
}
