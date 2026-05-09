import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Lang } from "@/lib/i18n";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const aboutCopy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "O nama",
    title: "Avangarda je uređivačka platforma za priče koje imaju težinu.",
    intro:
      "Ovde ulaze tekstovi, analize, intervjui i dokumentarne priče koje traže vreme, fokus i jasan stav. Platforma je zamišljena kao digitalni magazin, a ne kao generički news šablon.",
    blocks: [
      {
        title: "Human Rights, Raw, and Real.",
        copy: "To je okosnica celog projekta: ljudska prava, sirova istina i priče koje ne beže od stvarnosti."
      },
      {
        title: "Vizuelno tvrd, urednički jasan.",
        copy: "Avangarda je namerno tamna, kontrastna i direktna, kako bi svaki tekst nosio više karaktera i ozbiljnosti."
      },
      {
        title: "Arhiva koja ostaje živa.",
        copy: "Svaka objavljena priča ostaje dostupna kroz arhivu, pretragu i tematske ulaze, da sadržaj ne nestane posle jednog dana."
      }
    ]
  },
  en: {
    label: "About",
    title: "Avangarda is an editorial platform for stories that carry weight.",
    intro:
      "This is where long-form writing, analysis, interviews and documentary storytelling live when they need time, focus and a clear point of view.",
    blocks: [
      {
        title: "Human Rights, Raw, and Real.",
        copy: "That line anchors the whole project: human rights, raw truth and stories that do not step away from reality."
      },
      {
        title: "Visually hard, editorially clear.",
        copy: "Avangarda stays dark, high-contrast and direct so every story feels intentional and serious."
      },
      {
        title: "An archive that stays alive.",
        copy: "Every published story remains reachable through the archive, search and thematic entry points."
      }
    ]
  },
  tr: {
    label: "Hakkında",
    title: "Avangarda, ağırlığı olan hikayeler için bir editoryal platformdur.",
    intro:
      "Uzun okumalar, analizler, röportajlar ve belgesel hikaye anlatımı burada, zaman ve net bir bakış açısı gerektirdiğinde yer bulur.",
    blocks: [
      {
        title: "Human Rights, Raw, and Real.",
        copy: "Bu çizgi projenin omurgasıdır: insan hakları, ham gerçeklik ve gerçek hayattan kaçmayan hikayeler."
      },
      {
        title: "Görsel olarak sert, editoryal olarak net.",
        copy: "Avangarda karanlık, yüksek kontrastlı ve doğrudan kalır; böylece her hikaye daha bilinçli görünür."
      },
      {
        title: "Canlı kalan bir arşiv.",
        copy: "Her yayımlanan hikaye arşiv, arama ve tematik girişlerle erişilebilir kalır."
      }
    ]
  },
  fr: {
    label: "A propos",
    title: "Avangarda est une plateforme éditoriale pour des récits qui comptent.",
    intro:
      "C'est ici que vivent les longs formats, les analyses, les entretiens et les récits documentaires lorsqu'ils demandent du temps, de l'attention et un point de vue clair.",
    blocks: [
      {
        title: "Human Rights, Raw, and Real.",
        copy: "Cette ligne structure tout le projet: les droits humains, la vérité brute et des récits qui ne fuient pas le réel."
      },
      {
        title: "Visuellement dur, éditorialement net.",
        copy: "Avangarda reste sombre, contrasté et direct pour que chaque texte porte davantage de caractère."
      },
      {
        title: "Une archive qui reste vivante.",
        copy: "Chaque récit publié reste accessible via l'archive, la recherche et les entrées thématiques."
      }
    ]
  },
  de: {
    label: "Über uns",
    title: "Avangarda ist eine redaktionelle Plattform für Geschichten mit Gewicht.",
    intro:
      "Hier leben Longform-Texte, Analysen, Interviews und dokumentarisches Storytelling, wenn sie Zeit, Fokus und einen klaren Standpunkt brauchen.",
    blocks: [
      {
        title: "Human Rights, Raw, and Real.",
        copy: "Dieser Satz trägt das ganze Projekt: Menschenrechte, rohe Wahrheit und Geschichten, die der Realität nicht ausweichen."
      },
      {
        title: "Visuell hart, redaktionell klar.",
        copy: "Avangarda bleibt dunkel, kontrastreich und direkt, damit jede Geschichte bewusster und stärker wirkt."
      },
      {
        title: "Ein Archiv, das lebendig bleibt.",
        copy: "Jede veröffentlichte Geschichte bleibt über Archiv, Suche und thematische Einstiege erreichbar."
      }
    ]
  }
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const pageCopy = aboutCopy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/about",
    title: buildPageTitle(pageCopy.label),
    description: pageCopy.intro,
  });
}

export default function AboutPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = aboutCopy[lang];

  return (
    <>
      <SiteHeader lang={lang} currentPath="/about" activeNav="about" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{copy.label}</span>
            <h1 className="subpage-hero__title">{copy.title}</h1>
            <p className="subpage-hero__copy">{copy.intro}</p>
          </section>

          <section className="page-grid">
            {copy.blocks.map((block) => (
              <article key={block.title} className="panel info-card">
                <span className="eyebrow">{copy.label}</span>
                <h3>{block.title}</h3>
                <p>{block.copy}</p>
              </article>
            ))}

            <article className="panel info-card">
              <span className="eyebrow">{t.contact}</span>
              <h3>AVANGARDA</h3>
              <p>Instagram: @avangarda.raw</p>
              <p>YouTube: @Avangarda-s3i</p>
            </article>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
