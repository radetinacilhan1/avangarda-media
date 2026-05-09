import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Urednički princip",
    title: "Svaka objava mora da ima razlog, ritam i odgovornost.",
    intro: "Avangarda ne juri objavu po svaku cenu. Urednički princip znači da svaka priča mora da nosi kontekst, posledicu i jasan razlog zašto je ovde.",
    blocks: [
      { title: "Kontekst pre buke", copy: "Ne guramo tekst napolje dok ne objasni šta se dešava, koga pogađa i zašto je bitno." },
      { title: "Stav bez poza", copy: "Urednički ton nije ukras. On postoji da čitaocu jasno stavi do znanja iz kog ugla se tema posmatra." },
      { title: "Arhiva kao odgovornost", copy: "Objava nije jednokratni impuls. Svaka priča ostaje deo arhive koja mora da bude čitljiva i posle prvog talasa pažnje." }
    ]
  },
  en: {
    label: "Editorial principle",
    title: "Every story needs a reason, rhythm and accountability.",
    intro: "Avangarda does not publish for speed alone. An editorial principle means each story must carry context, consequence and a clear reason to be here.",
    blocks: [
      { title: "Context before noise", copy: "We do not push a story out until it explains what is happening, who it affects and why it matters." },
      { title: "A position without posing", copy: "Editorial tone is not decoration. It exists to make clear from which angle a story is being observed." },
      { title: "Archive as responsibility", copy: "A publication is not a one-time impulse. Every story remains part of an archive that must stay readable after the first spike of attention." }
    ]
  },
  de: {
    label: "Redaktionelles Prinzip",
    title: "Jede Veroeffentlichung braucht einen Grund, einen Rhythmus und Verantwortung.",
    intro: "Avangarda publiziert nicht nur aus Tempo. Ein redaktionelles Prinzip bedeutet, dass jede Geschichte Kontext, Folgen und einen klaren Grund mitbringen muss.",
    blocks: [
      { title: "Kontext vor Larm", copy: "Wir schicken keinen Text hinaus, bevor er erklaert, was geschieht, wen es betrifft und warum es wichtig ist." },
      { title: "Haltung ohne Pose", copy: "Der Ton ist keine Dekoration. Er soll klar machen, aus welchem Blickwinkel eine Geschichte betrachtet wird." },
      { title: "Archiv als Verantwortung", copy: "Eine Veroeffentlichung ist kein einmaliger Impuls. Jede Geschichte bleibt Teil eines Archivs, das auch spaeter lesbar bleiben muss." }
    ]
  },
  fr: {
    label: "Principe editorial",
    title: "Chaque publication a besoin d'une raison, d'un rythme et d'une responsabilite.",
    intro: "Avangarda ne publie pas pour la vitesse seule. Un principe editorial signifie que chaque recit doit porter du contexte, une consequence et une raison claire d'etre la.",
    blocks: [
      { title: "Le contexte avant le bruit", copy: "Nous ne mettons pas un texte en ligne tant qu'il n'explique pas ce qui se passe, qui cela touche et pourquoi cela compte." },
      { title: "Une position sans posture", copy: "Le ton editorial n'est pas decoratif. Il sert a montrer clairement depuis quel angle l'histoire est regardee." },
      { title: "L'archive comme responsabilite", copy: "Une publication n'est pas une impulsion unique. Chaque recit reste dans une archive qui doit demeurer lisible dans le temps." }
    ]
  },
  tr: {
    label: "Editor ilkesi",
    title: "Her yayin bir neden, ritim ve sorumluluk tasimalidir.",
    intro: "Avangarda sadece hiz icin yayin yapmaz. Editor ilkesi, her hikayenin baglam, sonuc ve burada olmasi icin acik bir neden tasimasi demektir.",
    blocks: [
      { title: "Gurultuden once baglam", copy: "Ne oldugunu, kimi etkiledigini ve neden onemli oldugunu anlatmayan bir metni aceleyle yayinlamiyoruz." },
      { title: "Pozsuz tavir", copy: "Editor tonu bir sus degildir. Hikayeye hangi bakisla yaklasildigini acikca gostermek icindir." },
      { title: "Sorumluluk olarak arsiv", copy: "Bir yazi tek seferlik bir patlama degildir. Her hikaye, ilk ilgi dalgasi gectikten sonra da okunabilir kalmasi gereken bir arsivin parcasi olur." }
    ]
  }
};

export default function EditorialPrinciplePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/editorial-principle" copy={copy[lang]} />;
}
