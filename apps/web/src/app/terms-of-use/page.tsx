import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Uslovi koriscenja",
    title: "Uslovi koriscenja postoje da zastite i sadrzaj i poverenje.",
    intro: "Ovo je placeholder za detaljnije uslove koriscenja koji ce kasnije biti prosireni pravnim tekstom.",
    blocks: [
      { title: "Citiranje i deljenje", copy: "Sadrzaj Avangarde moze biti citiran i deljen uz jasan izvor i bez izvrtanja konteksta." },
      { title: "Sledeca verzija", copy: "Na ovoj ruti ce biti objavljen pun tekst uslova koriscenja, ukljucujuci smernice za deljenje, prenosenje i odgovornost korisnika." }
    ]
  },
  en: {
    label: "Terms of use",
    title: "Terms of use exist to protect both the work and the trust around it.",
    intro: "This page is a placeholder for a fuller terms-of-use document that will later include proper legal language.",
    blocks: [
      { title: "Quoting and sharing", copy: "Avangarda content may be quoted and shared with clear attribution and without distorting the context." },
      { title: "Next version", copy: "A full terms document will be published here, including sharing rules, reuse guidance and user responsibility." }
    ]
  },
  de: {
    label: "Nutzungsbedingungen",
    title: "Nutzungsbedingungen schuetzen sowohl die Arbeit als auch das Vertrauen darum herum.",
    intro: "Diese Seite ist ein Placeholder fuer ausfuehrlichere Nutzungsbedingungen, die spaeter mit rechtlichem Text ergaenzt werden.",
    blocks: [
      { title: "Zitieren und teilen", copy: "Inhalte von Avangarda duerfen mit klarer Quellenangabe und ohne Verfaelschung des Kontexts zitiert oder geteilt werden." },
      { title: "Naechste Version", copy: "Hier wird spaeter ein vollstaendiger Text zu Nutzung, Weitergabe und Verantwortung erscheinen." }
    ]
  },
  fr: {
    label: "Conditions d'utilisation",
    title: "Les conditions d'utilisation protegent a la fois le travail et la confiance qui l'entoure.",
    intro: "Cette page est un placeholder pour une version plus complete des conditions d'utilisation, qui sera enrichie plus tard avec un vrai cadre juridique.",
    blocks: [
      { title: "Citation et partage", copy: "Le contenu d'Avangarda peut etre cite et partage avec une source claire et sans deformation du contexte." },
      { title: "Version suivante", copy: "Un texte complet sur l'usage, le partage et la responsabilite des utilisateurs sera publie ici." }
    ]
  },
  tr: {
    label: "Kullanim kosullari",
    title: "Kullanim kosullari hem icerigi hem de onun etrafindaki guveni korur.",
    intro: "Bu sayfa, ileride hukuki dille genisletilecek daha ayrintili bir kullanim kosullari metni icin placeholder olarak durur.",
    blocks: [
      { title: "Alintilama ve paylasim", copy: "Avangarda icerigi, kaynak acikca belirtilerek ve baglam bozulmadan alintilanabilir ya da paylasilabilir." },
      { title: "Sonraki surum", copy: "Burada daha sonra kullanim, yeniden paylasim ve kullanici sorumlulugu icin tam metin yer alacak." }
    ]
  }
};

export default function TermsOfUsePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/terms-of-use" copy={copy[lang]} />;
}
