import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Uslovi korišćenja",
    title: "Uslovi korišćenja postoje da zaštite i sadržaj i poverenje.",
    intro: "Ovo je placeholder za detaljnije uslove korišćenja koji će kasnije biti prošireni pravnim tekstom.",
    blocks: [
      { title: "Citiranje i deljenje", copy: "Sadržaj Avangarde može biti citiran i deljen uz jasan izvor i bez izvrtanja konteksta." },
      { title: "Sledeća verzija", copy: "Na ovoj ruti će biti objavljen pun tekst uslova korišćenja, uključujući smernice za deljenje, prenošenje i odgovornost korisnika." }
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
  es: {
    label: "Términos de uso",
    title: "Los términos de uso existen para proteger tanto el trabajo como la confianza que lo rodea.",
    intro: "Esta página es un marcador provisional para un documento más completo de términos de uso que más adelante incluirá lenguaje jurídico adecuado.",
    blocks: [
      { title: "Citas y difusión", copy: "El contenido de Avangarda puede citarse y compartirse con atribución clara y sin distorsionar el contexto." },
      { title: "Próxima versión", copy: "Aquí se publicará un texto completo sobre términos de uso, incluidas reglas para compartir, reutilización y responsabilidad del usuario." }
    ]
  },
  el: {
    label: "Όροι χρήσης",
    title: "Οι όροι χρήσης υπάρχουν για να προστατεύουν τόσο το έργο όσο και την εμπιστοσύνη γύρω από αυτό.",
    intro: "Αυτή η σελίδα είναι ένα προσωρινό placeholder για ένα πληρέστερο έγγραφο όρων χρήσης που αργότερα θα περιλαμβάνει σωστή νομική διατύπωση.",
    blocks: [
      { title: "Παράθεση και διαμοιρασμός", copy: "Το περιεχόμενο της Avangarda μπορεί να παρατίθεται και να διαμοιράζεται με σαφή αναφορά της πηγής και χωρίς παραμόρφωση του πλαισίου." },
      { title: "Επόμενη έκδοση", copy: "Εδώ θα δημοσιευτεί αργότερα ένα πλήρες κείμενο όρων χρήσης, με κανόνες διαμοιρασμού, επαναχρήσης και ευθύνης χρήστη." }
    ]
  },
  ar: {
    label: "شروط الاستخدام",
    title: "توجد شروط الاستخدام لحماية العمل والثقة المحيطة به معًا.",
    intro: "هذه الصفحة placeholder لوثيقة شروط استخدام أكثر اكتمالًا ستتضمن لاحقًا صياغة قانونية مناسبة.",
    blocks: [
      { title: "الاقتباس والمشاركة", copy: "يمكن اقتباس محتوى Avangarda ومشاركته مع إسناد واضح للمصدر ومن دون تشويه السياق." },
      { title: "النسخة التالية", copy: "سيُنشر هنا لاحقًا نص كامل لشروط الاستخدام، بما في ذلك قواعد المشاركة وإرشادات إعادة الاستخدام ومسؤولية المستخدم." }
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

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const page = copy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/terms-of-use",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function TermsOfUsePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/terms-of-use" copy={copy[lang]} />;
}
