import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Saradnja",
    title: "Pošalji priču samo ako nosi više od naslova.",
    intro: "Saradnja sa Avangardom nije slanje nasumične informacije. Traži se ideja sa tezom, kontekstom i uredničkim razlogom da uopšte bude objavljena.",
    blocks: [
      { title: "Šta tražimo", copy: "Traže se priče koje imaju dokument, sagovornika, rizik ili posledicu. Sam impuls nije dovoljan." },
      { title: "Kako mislimo saradnju", copy: "Saradnja može biti autorska, istraživačka ili produkcijska, ali mora imati jasan urednički okvir." },
      { title: "Sledeća faza", copy: "Ovde će biti dodat pravi submission tok. Za sada je ovo stabilan placeholder koji čuva rutu i stil sajta." }
    ]
  },
  en: {
    label: "Collaborate",
    title: "Send a story only if it carries more than a headline.",
    intro: "Working with Avangarda is not about dropping random information. We look for an idea with an argument, context and an editorial reason to exist.",
    blocks: [
      { title: "What we look for", copy: "We are interested in stories with documents, sources, risk or consequence. Impulse alone is not enough." },
      { title: "How we understand collaboration", copy: "Collaboration can be authorial, research-based or production-driven, but it must have a clear editorial frame." },
      { title: "Next phase", copy: "A proper submission flow will be added here later. For now, this is a stable placeholder that keeps the route and the design system intact." }
    ]
  },
  es: {
    label: "Colaborar",
    title: "Envía una historia solo si lleva algo más que un titular.",
    intro: "Colaborar con Avangarda no significa soltar información al azar. Buscamos una idea con tesis, contexto y una razón editorial para existir.",
    blocks: [
      { title: "Qué buscamos", copy: "Buscamos historias con documentos, fuentes, riesgo o consecuencia. El impulso por sí solo no basta." },
      { title: "Cómo entendemos la colaboración", copy: "La colaboración puede ser autoral, de investigación o de producción, pero debe tener un marco editorial claro." },
      { title: "Siguiente fase", copy: "Más adelante se añadirá aquí un flujo real de envío. Por ahora, este es un placeholder estable que mantiene la ruta y el sistema visual intactos." }
    ]
  },
  el: {
    label: "Συνεργασία",
    title: "Στείλε μια ιστορία μόνο αν κουβαλά κάτι περισσότερο από έναν τίτλο.",
    intro: "Η συνεργασία με την Avangarda δεν σημαίνει να αφήνεις τυχαίες πληροφορίες. Αναζητούμε μια ιδέα με θέση, πλαίσιο και σαφή δημοσιογραφικό λόγο ύπαρξης.",
    blocks: [
      { title: "Τι αναζητούμε", copy: "Μας ενδιαφέρουν ιστορίες με έγγραφα, πηγές, ρίσκο ή συνέπεια. Η αρχική παρόρμηση από μόνη της δεν αρκεί." },
      { title: "Πώς αντιλαμβανόμαστε τη συνεργασία", copy: "Η συνεργασία μπορεί να είναι συγγραφική, ερευνητική ή παραγωγική, αλλά πρέπει να έχει καθαρό δημοσιογραφικό πλαίσιο." },
      { title: "Επόμενη φάση", copy: "Αργότερα θα προστεθεί εδώ μια κανονική ροή υποβολής. Προς το παρόν, αυτή η σελίδα λειτουργεί ως σταθερό placeholder που κρατά τη διαδρομή και το οπτικό σύστημα." }
    ]
  },
  ar: {
    label: "تعاون",
    title: "أرسل قصة فقط إذا كانت تحمل أكثر من عنوان.",
    intro: "العمل مع Avangarda لا يعني إسقاط معلومات عشوائية. نحن نبحث عن فكرة لها أطروحة وسياق وسبب تحريري واضح لوجودها.",
    blocks: [
      { title: "ما الذي نبحث عنه", copy: "نبحث عن قصص تحتوي على وثائق أو مصادر أو مخاطرة أو أثر. الاندفاع وحده لا يكفي." },
      { title: "كيف نفهم التعاون", copy: "يمكن أن يكون التعاون كتابيًا أو بحثيًا أو إنتاجيًا، لكنه يجب أن يحمل إطارًا تحريريًا واضحًا." },
      { title: "المرحلة التالية", copy: "سيُضاف هنا لاحقًا مسار إرسال فعلي. في الوقت الحالي، هذه صفحة placeholder مستقرة تحفظ المسار وهوية التصميم." }
    ]
  },
  de: {
    label: "Zusammenarbeit",
    title: "Schick eine Geschichte nur, wenn sie mehr traegt als eine Ueberschrift.",
    intro: "Mit Avangarda zu arbeiten bedeutet nicht, zufaellige Information abzuladen. Gesucht ist eine Idee mit These, Kontext und einem redaktionellen Grund zu existieren.",
    blocks: [
      { title: "Wonach wir suchen", copy: "Gesucht sind Geschichten mit Dokumenten, Quellen, Risiko oder Konsequenz. Ein blosses Signal reicht nicht." },
      { title: "Wie wir Zusammenarbeit verstehen", copy: "Zusammenarbeit kann autorisch, recherchierend oder produktionell sein, braucht aber immer einen klaren redaktionellen Rahmen." },
      { title: "Naechste Phase", copy: "Hier kommt spaeter ein richtiger Submission-Flow hin. Im Moment ist dies ein stabiler Placeholder, der Route und Design zusammenhaelt." }
    ]
  },
  fr: {
    label: "Collaborer",
    title: "N'envoie une histoire que si elle porte plus qu'un titre.",
    intro: "Collaborer avec Avangarda ne consiste pas a deposer une information brute. Il faut une idee avec une these, du contexte et une raison editoriale d'exister.",
    blocks: [
      { title: "Ce que nous cherchons", copy: "Nous cherchons des histoires avec des documents, des sources, un risque ou une consequence. L'impulsion seule ne suffit pas." },
      { title: "Notre idee de la collaboration", copy: "La collaboration peut etre d'auteur, de recherche ou de production, mais elle doit toujours avoir un cadre editorial clair." },
      { title: "Et ensuite", copy: "Un vrai flux de soumission sera ajoute ici plus tard. Pour l'instant, cette page garde la route et le style du site." }
    ]
  },
  tr: {
    label: "Is birligi",
    title: "Bir hikaye, basliktan fazlasini tasiyorsa gonder.",
    intro: "Avangarda ile is birligi, rastgele bilgi birakmak degildir. Burada savi, baglami ve editoral nedeni olan fikirler aranir.",
    blocks: [
      { title: "Ne ariyoruz", copy: "Belgeye, kaynaga, riske ya da sonuca dayanan hikayeler ariyoruz. Tek basina anlik refleks yeterli degildir." },
      { title: "Is birligini nasil anliyoruz", copy: "Is birligi yazarlik, arastirma ya da prodüksiyon odakli olabilir; ama mutlaka net bir editoral cerceve tasimalidir." },
      { title: "Sonraki asama", copy: "Ileride burada gercek bir gonderim akisi olacak. Simdilik bu sayfa rota ve tasarim butunlugunu koruyan saglam bir placeholder." }
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
    pathname: "/contribute",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function ContributePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/contribute" copy={copy[lang]} />;
}
