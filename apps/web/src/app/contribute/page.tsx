import type { Metadata } from "next";

import { ContributeSubmissionForm } from "@/components/contribute-submission-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchContributeSubmissionConfig } from "@/lib/contribute";
import type { Lang } from "@/lib/i18n";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type ContributeBlock = {
  eyebrow?: string;
  title: string;
  copy: string;
};

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: ContributeBlock[] }> = {
  sr: {
    label: "Saradnja",
    title: "Pošalji priču samo ako nosi više od naslova.",
    intro:
      "Saradnja sa Avangardom nije slanje nasumične informacije. Traži se ideja sa tezom, kontekstom i uredničkim razlogom da uopšte bude objavljena.",
    blocks: [
      {
        eyebrow: "Kriterijumi",
        title: "Šta tražimo",
        copy: "Traže se priče koje imaju dokument, sagovornika, rizik ili posledicu. Sam impuls nije dovoljan.",
      },
      {
        eyebrow: "Urednički okvir",
        title: "Kako mislimo saradnju",
        copy: "Saradnja može biti autorska, istraživačka ili produkcijska, ali mora imati jasan urednički okvir.",
      },
      {
        eyebrow: "Prijava",
        title: "Sledeća faza",
        copy: "Status prijava i forma nalaze se ispod. Ako kanal nije spreman, stranica jasno kaže da slanje trenutno nije dostupno.",
      },
    ],
  },
  en: {
    label: "Collaborate",
    title: "Send a story only if it carries more than a headline.",
    intro:
      "Working with Avangarda is not about dropping random information. We look for an idea with an argument, context and an editorial reason to exist.",
    blocks: [
      {
        eyebrow: "Criteria",
        title: "What we look for",
        copy: "We are interested in stories with documents, sources, risk or consequence. Impulse alone is not enough.",
      },
      {
        eyebrow: "Editorial frame",
        title: "How we understand collaboration",
        copy: "Collaboration can be authorial, research-based or production-driven, but it must have a clear editorial frame.",
      },
      {
        eyebrow: "Submission",
        title: "Next phase",
        copy: "Submission status and the form live below. If the channel is not ready, the page clearly says that sending is currently unavailable.",
      },
    ],
  },
  es: {
    label: "Colaborar",
    title: "Envía una historia solo si lleva algo más que un titular.",
    intro:
      "Colaborar con Avangarda no significa soltar información al azar. Buscamos una idea con tesis, contexto y una razón editorial para existir.",
    blocks: [
      {
        eyebrow: "Criterios",
        title: "Qué buscamos",
        copy: "Buscamos historias con documentos, fuentes, riesgo o consecuencia. El impulso por sí solo no basta.",
      },
      {
        eyebrow: "Marco editorial",
        title: "Cómo entendemos la colaboración",
        copy: "La colaboración puede ser autoral, de investigación o de producción, pero debe tener un marco editorial claro.",
      },
      {
        eyebrow: "Envío",
        title: "Siguiente fase",
        copy: "El estado de envío y el formulario están abajo. Si el canal no está listo, la página indica claramente que el envío no está disponible.",
      },
    ],
  },
  el: {
    label: "Συνεργασία",
    title: "Στείλε μια ιστορία μόνο αν κουβαλά κάτι περισσότερο από έναν τίτλο.",
    intro:
      "Η συνεργασία με την Avangarda δεν σημαίνει να αφήνεις τυχαίες πληροφορίες. Αναζητούμε μια ιδέα με θέση, πλαίσιο και σαφή δημοσιογραφικό λόγο ύπαρξης.",
    blocks: [
      {
        eyebrow: "Κριτήρια",
        title: "Τι αναζητούμε",
        copy: "Μας ενδιαφέρουν ιστορίες με έγγραφα, πηγές, ρίσκο ή συνέπεια. Η αρχική παρόρμηση από μόνη της δεν αρκεί.",
      },
      {
        eyebrow: "Συντακτικό πλαίσιο",
        title: "Πώς αντιλαμβανόμαστε τη συνεργασία",
        copy: "Η συνεργασία μπορεί να είναι συγγραφική, ερευνητική ή παραγωγική, αλλά πρέπει να έχει καθαρό δημοσιογραφικό πλαίσιο.",
      },
      {
        eyebrow: "Υποβολή",
        title: "Επόμενη φάση",
        copy: "Η κατάσταση υποβολής και η φόρμα βρίσκονται παρακάτω. Αν το κανάλι δεν είναι έτοιμο, η σελίδα το λέει καθαρά.",
      },
    ],
  },
  ar: {
    label: "تعاون",
    title: "أرسل قصة فقط إذا كانت تحمل أكثر من عنوان.",
    intro:
      "العمل مع Avangarda لا يعني إسقاط معلومات عشوائية. نحن نبحث عن فكرة لها أطروحة وسياق وسبب تحريري واضح لوجودها.",
    blocks: [
      {
        eyebrow: "معايير",
        title: "ما الذي نبحث عنه",
        copy: "نبحث عن قصص تحتوي على وثائق أو مصادر أو مخاطرة أو أثر. الاندفاع وحده لا يكفي.",
      },
      {
        eyebrow: "إطار تحريري",
        title: "كيف نفهم التعاون",
        copy: "يمكن أن يكون التعاون كتابيًا أو بحثيًا أو إنتاجيًا، لكنه يجب أن يحمل إطارًا تحريريًا واضحًا.",
      },
      {
        eyebrow: "إرسال",
        title: "المرحلة التالية",
        copy: "حالة الإرسال والنموذج موجودان أدناه. إذا لم تكن القناة جاهزة، توضّح الصفحة أن الإرسال غير متاح حاليًا.",
      },
    ],
  },
  de: {
    label: "Zusammenarbeit",
    title: "Schick eine Geschichte nur, wenn sie mehr trägt als eine Überschrift.",
    intro:
      "Mit Avangarda zu arbeiten bedeutet nicht, zufällige Information abzuladen. Gesucht ist eine Idee mit These, Kontext und einem redaktionellen Grund zu existieren.",
    blocks: [
      {
        eyebrow: "Kriterien",
        title: "Wonach wir suchen",
        copy: "Gesucht sind Geschichten mit Dokumenten, Quellen, Risiko oder Konsequenz. Ein bloßes Signal reicht nicht.",
      },
      {
        eyebrow: "Redaktioneller Rahmen",
        title: "Wie wir Zusammenarbeit verstehen",
        copy: "Zusammenarbeit kann autorisch, recherchierend oder produktionell sein, braucht aber immer einen klaren redaktionellen Rahmen.",
      },
      {
        eyebrow: "Einreichung",
        title: "Nächste Phase",
        copy: "Einreichungsstatus und Formular stehen unten. Wenn der Kanal nicht bereit ist, sagt die Seite klar, dass Senden derzeit nicht verfügbar ist.",
      },
    ],
  },
  fr: {
    label: "Collaborer",
    title: "N'envoie une histoire que si elle porte plus qu'un titre.",
    intro:
      "Collaborer avec Avangarda ne consiste pas à déposer une information brute. Il faut une idée avec une thèse, du contexte et une raison éditoriale d'exister.",
    blocks: [
      {
        eyebrow: "Critères",
        title: "Ce que nous cherchons",
        copy: "Nous cherchons des histoires avec des documents, des sources, un risque ou une conséquence. L'impulsion seule ne suffit pas.",
      },
      {
        eyebrow: "Cadre éditorial",
        title: "Notre idée de la collaboration",
        copy: "La collaboration peut être d'auteur, de recherche ou de production, mais elle doit toujours avoir un cadre éditorial clair.",
      },
      {
        eyebrow: "Soumission",
        title: "Et ensuite",
        copy: "L'état des soumissions et le formulaire se trouvent ci-dessous. Si le canal n'est pas prêt, la page indique clairement que l'envoi est indisponible.",
      },
    ],
  },
  tr: {
    label: "Is birligi",
    title: "Bir hikaye, basliktan fazlasini tasiyorsa gonder.",
    intro:
      "Avangarda ile is birligi, rastgele bilgi birakmak degildir. Burada savi, baglami ve editoral nedeni olan fikirler aranir.",
    blocks: [
      {
        eyebrow: "Kriterler",
        title: "Ne ariyoruz",
        copy: "Belgeye, kaynaga, riske ya da sonuca dayanan hikayeler ariyoruz. Tek basina anlik refleks yeterli degildir.",
      },
      {
        eyebrow: "Editoral cerceve",
        title: "Is birligini nasil anliyoruz",
        copy: "Is birligi yazarlik, arastirma ya da prodüksiyon odakli olabilir; ama mutlaka net bir editoral cerceve tasimalidir.",
      },
      {
        eyebrow: "Gonderim",
        title: "Sonraki asama",
        copy: "Gonderim durumu ve form asagida yer alir. Kanal hazir degilse sayfa gonderimin su anda kullanilamadigini acikca soyler.",
      },
    ],
  },
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

export default async function ContributePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const pageCopy = lang === "sr" ? normalizeSerbianLatinDeep(copy[lang]) : copy[lang];
  const submission = await fetchContributeSubmissionConfig(lang);
  const showForm = submission.submissionEnabled && submission.submissionFormReady;
  const statusTitle = submission.submissionEnabled ? submission.unavailableTitle : submission.closedTitle;
  const statusText = submission.submissionEnabled ? submission.unavailableText : submission.closedText;

  return (
    <>
      <SiteHeader lang={lang} currentPath="/contribute" activeNav={null} />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{pageCopy.label}</span>
            <h1 className="subpage-hero__title">{pageCopy.title}</h1>
            <p className="subpage-hero__copy">{pageCopy.intro}</p>
          </section>

          <section className="page-grid">
            {pageCopy.blocks.map((block) => (
              <article key={block.title} className="panel info-card">
                <span className="eyebrow">{block.eyebrow || pageCopy.label}</span>
                <h3>{block.title}</h3>
                <p>{block.copy}</p>
              </article>
            ))}
          </section>

          <section className="panel contribute-submission-panel" aria-labelledby="contribute-submission-title">
            <div className="contribute-submission-panel__header">
              <span className="eyebrow">{submission.formEyebrow}</span>
              <h2 id="contribute-submission-title">{submission.formTitle}</h2>
              <p>{submission.formIntro}</p>
            </div>

            {showForm ? (
              <ContributeSubmissionForm lang={lang} copy={submission.form} />
            ) : (
              <div className="contribute-submission-panel__closed" role="status">
                <h3>{statusTitle}</h3>
                <p>{statusText}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
