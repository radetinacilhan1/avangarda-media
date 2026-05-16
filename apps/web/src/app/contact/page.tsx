import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Kontakt",
    title: "Kontakt postoji da priča dođe do pravog uredničkog stola.",
    intro: "Ako imaš pitanje, dokument, predlog ili želiš da otvoriš temu koja zaslužuje više prostora, ovde je ulazna tačka.",
    blocks: [
      { title: "Redakcija", copy: "Kontakt forma i direktne adrese biće dodate u sledećoj fazi. Za sada ova stranica čuva prostor za urednički kontakt i javne informacije." },
      { title: "Teme i dokumenta", copy: "Ako želiš da podeliš materijal, ideja je da svaki trag ide ka kontekstu, ne ka buci." },
      { title: "Mreže", copy: "YouTube, Instagram, TikTok i X ostaju najbrži javni ulaz dok se direktna kontakt infrastruktura ne poveže." }
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
  es: {
    label: "Contacto",
    title: "El contacto existe para que una historia llegue a la mesa editorial adecuada.",
    intro: "Si tienes una pregunta, un documento, una pista o un tema que merece más espacio, este es el punto de entrada.",
    blocks: [
      { title: "Redacción", copy: "El formulario de contacto directo y las direcciones públicas se añadirán en la siguiente fase. Por ahora, esta página conserva el espacio para el contacto editorial y la información pública." },
      { title: "Temas y documentos", copy: "Si quieres compartir material, la idea es que cada pista conduzca al contexto, no al ruido." },
      { title: "Red", copy: "YouTube, Instagram, TikTok y X siguen siendo los accesos públicos más rápidos hasta que se conecte la infraestructura de contacto directo." }
    ]
  },
  el: {
    label: "Επικοινωνία",
    title: "Η επικοινωνία υπάρχει ώστε μια ιστορία να φτάσει στο σωστό δημοσιογραφικό γραφείο.",
    intro: "Αν έχεις μια ερώτηση, ένα έγγραφο, μια πληροφορία ή ένα θέμα που αξίζει περισσότερο χώρο, αυτό είναι το σημείο εισόδου.",
    blocks: [
      { title: "Σύνταξη", copy: "Μια άμεση φόρμα επικοινωνίας και δημόσιες διευθύνσεις θα προστεθούν στην επόμενη φάση. Προς το παρόν, αυτή η σελίδα κρατά τον χώρο για δημοσιογραφική επικοινωνία και δημόσιες πληροφορίες." },
      { title: "Θέματα και έγγραφα", copy: "Αν θέλεις να μοιραστείς υλικό, η ιδέα είναι κάθε στοιχείο να οδηγεί στο πλαίσιο και όχι στον θόρυβο." },
      { title: "Δίκτυο", copy: "Το YouTube, το Instagram, το TikTok και το X παραμένουν τα ταχύτερα δημόσια σημεία εισόδου μέχρι να συνδεθεί η άμεση υποδομή επικοινωνίας." }
    ]
  },
  ar: {
    label: "اتصال",
    title: "وُجدت صفحة الاتصال لكي تصل القصة إلى المكتب التحريري المناسب.",
    intro: "إذا كان لديك سؤال أو وثيقة أو معلومة أو موضوع يستحق مساحة أكبر، فهذه هي نقطة الدخول.",
    blocks: [
      { title: "هيئة التحرير", copy: "سيُضاف نموذج اتصال مباشر وعناوين عامة في المرحلة التالية. في الوقت الحالي، تحفظ هذه الصفحة مكان التواصل التحريري والمعلومات العامة." },
      { title: "الموضوعات والوثائق", copy: "إذا أردت مشاركة مواد، فالفكرة أن يقود كل خيط إلى السياق لا إلى الضجيج." },
      { title: "الشبكات", copy: "يبقى YouTube وInstagram وTikTok وX أسرع نقاط الدخول العامة إلى أن تكتمل بنية الاتصال المباشر." }
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

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const page = copy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/contact",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function ContactPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/contact" copy={copy[lang]} />;
}
