import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Politika privatnosti",
    title: "Privatnost nije fusnota, vec deo poverenja izmedju sajta i citaoca.",
    intro: "Ova stranica je placeholder za detaljnu politiku privatnosti koja ce kasnije biti dopunjena pravnim i tehnickim detaljima.",
    blocks: [
      { title: "Sta trenutno vazi", copy: "Ne prikupljamo vise nego sto je potrebno za osnovno funkcionisanje interfejsa i buduce newsletter prijave." },
      { title: "Sledeci korak", copy: "Ovde ce biti dodat pun pravni tekst o cuvanju podataka, analitici i komunikacionim kanalima." }
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

export default function PrivacyPolicyPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/privacy-policy" copy={copy[lang]} />;
}
