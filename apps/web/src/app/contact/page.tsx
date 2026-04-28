import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Kontakt",
    title: "Kontakt postoji da prica dodje do pravog urednickog stola.",
    intro: "Ako imas pitanje, dokument, predlog ili zelis da otvoris temu koja zasluzuje vise prostora, ovde je ulazna tacka.",
    blocks: [
      { title: "Redakcija", copy: "Kontakt forma i direktne adrese bice dodate u sledecoj fazi. Za sada ova stranica cuva prostor za urednicki kontakt i javne informacije." },
      { title: "Teme i dokumenta", copy: "Ako zelis da podelis materijal, ideja je da svaki trag ide ka kontekstu, ne ka buci." },
      { title: "Mreze", copy: "YouTube, Instagram, TikTok i X ostaju najbrzi javni ulaz dok se direktna kontakt infrastruktura ne poveze." }
    ]
  },
  en: {
    label: "Contact",
    title: "Contact exists so a story can reach the right editorial desk.",
    intro: "If you have a question, a document, a lead or a topic that deserves more room, this is the entry point.",
    blocks: [
      { title: "Editorial desk", copy: "A direct contact form and public addresses will be added in the next phase. For now, this page keeps the place for newsroom contact and public information." },
      { title: "Themes and documents", copy: "If you want to share material, the idea is that every lead should move toward context, not noise." },
      { title: "Network", copy: "YouTube, Instagram, TikTok and X remain the fastest public entry points until direct contact infrastructure is connected." }
    ]
  },
  de: {
    label: "Kontakt",
    title: "Kontakt ist da, damit eine Geschichte den richtigen Redaktionstisch erreicht.",
    intro: "Wenn du eine Frage, ein Dokument, einen Hinweis oder ein Thema hast, das mehr Raum verdient, ist dies der Einstieg.",
    blocks: [
      { title: "Redaktion", copy: "Ein direktes Kontaktformular und oeffentliche Adressen folgen in der naechsten Phase. Bis dahin haelt diese Seite den Platz fuer redaktionellen Kontakt frei." },
      { title: "Themen und Dokumente", copy: "Wenn du Material teilst, soll jede Spur in Richtung Kontext gehen, nicht in Richtung Laerm." },
      { title: "Netzwerk", copy: "YouTube, Instagram, TikTok und X bleiben die schnellsten oeffentlichen Einstiege, bis die direkte Kontaktstruktur angeschlossen ist." }
    ]
  },
  fr: {
    label: "Contact",
    title: "Le contact existe pour qu'une histoire atteigne le bon bureau editorial.",
    intro: "Si tu as une question, un document, une piste ou un sujet qui merite plus d'espace, voici le point d'entree.",
    blocks: [
      { title: "Redaction", copy: "Un formulaire de contact direct et des adresses publiques seront ajoutes dans la prochaine phase. Pour l'instant, cette page garde la place du contact editorial." },
      { title: "Themes et documents", copy: "Si tu partages du materiel, l'idee est que chaque piste aille vers le contexte, pas vers le bruit." },
      { title: "Reseau", copy: "YouTube, Instagram, TikTok et X restent les points d'entree publics les plus rapides tant que le contact direct n'est pas branche." }
    ]
  },
  tr: {
    label: "Iletisim",
    title: "Iletisim, bir hikayenin dogru editoryal masaya ulasmasi icin vardir.",
    intro: "Bir sorunuz, belgeniz, ipucunuz ya da daha fazla alan hak eden bir konunuz varsa, giris noktasi burasidir.",
    blocks: [
      { title: "Redaksiyon", copy: "Dogrudan iletisim formu ve acik adresler sonraki asamada eklenecek. Simdilik bu sayfa editoral iletisim icin ayrilan yeri koruyor." },
      { title: "Temalar ve belgeler", copy: "Malzeme paylasirken amac, her izin gurultuye degil baglama cikmasidir." },
      { title: "Ag", copy: "YouTube, Instagram, TikTok ve X; dogrudan iletisim altyapisi baglanana kadar en hizli kamusal girisler olarak kalir." }
    ]
  }
};

export default function ContactPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/contact" copy={copy[lang]} />;
}
