import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Politika privatnosti",
    title: "Privatnost nije fusnota, već deo poverenja između sajta i čitaoca.",
    intro: "Ova stranica je placeholder za detaljnu politiku privatnosti koja će kasnije biti dopunjena pravnim i tehničkim detaljima.",
    blocks: [
      { title: "Šta trenutno važi", copy: "Ne prikupljamo više nego što je potrebno za osnovno funkcionisanje interfejsa i buduće newsletter prijave." },
      { title: "Sledeći korak", copy: "Ovde će biti dodat pun pravni tekst o čuvanju podataka, analitici i komunikacionim kanalima." }
    ]
  },
  en: {
    label: "Privacy policy",
    title: "Privacy is not a footnote but part of the trust between the site and the reader.",
    intro: "This page is a placeholder for a fuller privacy policy that will later include legal and technical details.",
    blocks: [
      { title: "What applies for now", copy: "We do not collect more than what is needed for the basic interface and future newsletter signup." },
      { title: "Next step", copy: "A complete legal text about data storage, analytics and communication channels will be added here." }
    ]
  },
  es: {
    label: "Política de privacidad",
    title: "La privacidad no es una nota al pie, sino parte de la confianza entre el sitio y la persona lectora.",
    intro: "Esta página es un marcador provisional para una política de privacidad más completa que más adelante incluirá detalles legales y técnicos.",
    blocks: [
      { title: "Qué aplica por ahora", copy: "No recopilamos más de lo necesario para el funcionamiento básico de la interfaz y una futura suscripción al newsletter." },
      { title: "Siguiente paso", copy: "Aquí se añadirá más adelante un texto legal completo sobre almacenamiento de datos, analítica y canales de comunicación." }
    ]
  },
  el: {
    label: "Πολιτική απορρήτου",
    title: "Η ιδιωτικότητα δεν είναι υποσημείωση αλλά μέρος της εμπιστοσύνης ανάμεσα στον ιστότοπο και τον αναγνώστη.",
    intro: "Αυτή η σελίδα είναι ένα προσωρινό placeholder για μια πληρέστερη πολιτική απορρήτου που αργότερα θα περιλαμβάνει νομικές και τεχνικές λεπτομέρειες.",
    blocks: [
      { title: "Τι ισχύει προς το παρόν", copy: "Δεν συλλέγουμε περισσότερα από όσα χρειάζονται για τη βασική λειτουργία του περιβάλλοντος και για μελλοντική εγγραφή στο newsletter." },
      { title: "Επόμενο βήμα", copy: "Αργότερα θα προστεθεί εδώ πλήρες νομικό κείμενο για την αποθήκευση δεδομένων, τα αναλυτικά και τα κανάλια επικοινωνίας." }
    ]
  },
  ar: {
    label: "سياسة الخصوصية",
    title: "الخصوصية ليست هامشًا صغيرًا، بل جزء من الثقة بين الموقع والقارئ.",
    intro: "هذه الصفحة placeholder لسياسة خصوصية أشمل ستتضمن لاحقًا تفاصيل قانونية وتقنية.",
    blocks: [
      { title: "ما الذي يسري الآن", copy: "نحن لا نجمع أكثر مما يلزم لتشغيل الواجهة الأساسية وللاشتراك المستقبلي في النشرة البريدية." },
      { title: "الخطوة التالية", copy: "سيُضاف هنا لاحقًا نص قانوني كامل حول تخزين البيانات والتحليلات وقنوات التواصل." }
    ]
  },
  de: {
    label: "Datenschutz",
    title: "Datenschutz ist keine Fussnote, sondern Teil des Vertrauens zwischen Seite und Leserschaft.",
    intro: "Diese Seite ist ein Placeholder fuer eine spaetere, ausfuehrliche Datenschutzerklaerung mit rechtlichen und technischen Details.",
    blocks: [
      { title: "Was derzeit gilt", copy: "Wir sammeln derzeit nicht mehr Daten als fuer die Grundfunktionen der Oberflaeche und eine spaetere Newsletter-Anmeldung noetig sind." },
      { title: "Naechster Schritt", copy: "Hier wird spaeter ein vollstaendiger Rechtstext zu Speicherung, Analyse und Kommunikationswegen erscheinen." }
    ]
  },
  fr: {
    label: "Politique de confidentialite",
    title: "La confidentialite n'est pas une note de bas de page, mais une part du lien entre le site et le lecteur.",
    intro: "Cette page est un placeholder pour une politique plus complete qui sera enrichie plus tard avec des details juridiques et techniques.",
    blocks: [
      { title: "Ce qui vaut pour l'instant", copy: "Nous ne collectons pas plus que ce qui est necessaire au fonctionnement de base de l'interface et a une future inscription newsletter." },
      { title: "Et ensuite", copy: "Un texte juridique complet sur le stockage des donnees, l'analyse et les canaux de communication sera ajoute ici." }
    ]
  },
  tr: {
    label: "Gizlilik politikasi",
    title: "Gizlilik dipnot degil, site ile okur arasindaki guvenin parcasi.",
    intro: "Bu sayfa, ileride hukuki ve teknik ayrintilarla genisletilecek daha kapsamli bir gizlilik metni icin placeholder gorevi gorur.",
    blocks: [
      { title: "Su an icin gecerli olan", copy: "Temel arayuz isleyisi ve ilerideki newsletter kaydi icin gerekli olandan fazla veri toplamiyoruz." },
      { title: "Sonraki adim", copy: "Veri saklama, analiz ve iletisim kanallariyla ilgili tam hukuki metin daha sonra burada yer alacak." }
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
    pathname: "/privacy-policy",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function PrivacyPolicyPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/privacy-policy" copy={copy[lang]} />;
}
