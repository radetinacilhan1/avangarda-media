import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { localizeTopic } from "@/lib/content";
import { fetchPublishedArticles, type PublishedArticle } from "@/lib/editorial";
import { fallbackTopics } from "@/lib/fallback-content";
import type { Lang } from "@/lib/i18n";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

type Topic = {
  id: number;
  name: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  name_el?: string;
  name_ar?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  description_es?: string;
  description_el?: string;
  description_ar?: string;
  slug: string;
};

type TopicsPageCopy = {
  label: string;
  title: string;
  intro: string;
  focusLabel: string;
  openTopic: string;
  noStories: string;
  emptyTitle: string;
  emptyCopy: string;
};

const copy: Record<Lang, TopicsPageCopy> = {
  sr: {
    label: "Teme",
    title: "Teme su mapa uredničkog fokusa sajta.",
    intro: "Ovde se teme ne ponašaju kao ukrasni tagovi, već kao uređeni ulazi u duže čitanje, arhivu i kontinuitet uredničkog rada.",
    focusLabel: "Urednički fokus",
    openTopic: "Otvori temu",
    noStories: "Nema tekstova",
    emptyTitle: "Još nema tema u CMS-u",
    emptyCopy: "Kada ih dodaš u Topic content type, ovde će automatski postati vidljive.",
  },
  en: {
    label: "Topics",
    title: "Topics are the map of the publication's editorial focus.",
    intro: "Here, topics do not behave like decorative tags but as structured entry points into deeper reading, archives and editorial continuity.",
    focusLabel: "Editorial focus",
    openTopic: "Open topic",
    noStories: "No stories",
    emptyTitle: "There are no topics in the CMS yet",
    emptyCopy: "As soon as you add them to the Topic content type, they will appear here automatically.",
  },
  tr: {
    label: "Temalar",
    title: "Temalar, sitenin editoryal odak haritasıdır.",
    intro: "Burada temalar süs etiketi gibi değil; daha derin okuma, arşiv ve editoryal süreklilik için düzenli giriş noktaları gibi çalışır.",
    focusLabel: "Editoryal odak",
    openTopic: "Temayı aç",
    noStories: "Henüz yazı yok",
    emptyTitle: "CMS'te henüz tema yok",
    emptyCopy: "Topic content type içine eklediğin anda burada otomatik olarak görünecekler.",
  },
  fr: {
    label: "Thèmes",
    title: "Les thèmes dessinent la carte du focus éditorial du site.",
    intro: "Ici, les thèmes ne servent pas de tags décoratifs mais de portes d'entrée vers une lecture plus profonde, l'archive et la continuité éditoriale.",
    focusLabel: "Focus éditorial",
    openTopic: "Ouvrir le thème",
    noStories: "Aucun texte",
    emptyTitle: "Aucun thème dans le CMS pour l'instant",
    emptyCopy: "Dès que tu les ajoutes dans le content type Topic, ils apparaîtront ici automatiquement.",
  },
  de: {
    label: "Themen",
    title: "Themen sind die Landkarte des redaktionellen Fokus.",
    intro: "Hier funktionieren Themen nicht als dekorative Tags, sondern als geordnete Einstiege in tiefere Lektüre, Archiv und redaktionelle Kontinuität.",
    focusLabel: "Redaktioneller Fokus",
    openTopic: "Thema öffnen",
    noStories: "Keine Texte",
    emptyTitle: "Noch keine Themen im CMS",
    emptyCopy: "Sobald du sie im Topic-Content-Type anlegst, erscheinen sie hier automatisch.",
  },
  es: {
    label: "Temas",
    title: "Los temas son el mapa del enfoque editorial del sitio.",
    intro: "Aquí los temas no funcionan como etiquetas decorativas, sino como entradas a lecturas más profundas, al archivo y a la continuidad editorial.",
    focusLabel: "Enfoque editorial",
    openTopic: "Abrir tema",
    noStories: "Sin textos",
    emptyTitle: "Todavía no hay temas en el CMS",
    emptyCopy: "En cuanto los añadas al content type Topic, aparecerán aquí automáticamente.",
  },
  el: {
    label: "Θέματα",
    title: "Τα θέματα είναι ο χάρτης της δημοσιογραφικής εστίασης του ιστότοπου.",
    intro: "Εδώ τα θέματα δεν λειτουργούν ως διακοσμητικές ετικέτες, αλλά ως είσοδοι σε βαθύτερη ανάγνωση, στο αρχείο και στη δημοσιογραφική συνέχεια.",
    focusLabel: "Δημοσιογραφική εστίαση",
    openTopic: "Άνοιγμα θέματος",
    noStories: "Χωρίς κείμενα",
    emptyTitle: "Δεν υπάρχουν ακόμη θέματα στο CMS",
    emptyCopy: "Μόλις τα προσθέσεις στο content type Topic, θα εμφανιστούν εδώ αυτόματα.",
  },
  ar: {
    label: "الموضوعات",
    title: "الموضوعات هي خريطة التركيز التحريري للموقع.",
    intro: "هنا لا تعمل الموضوعات كوسوم للزينة، بل كمداخل مرتبة إلى قراءة أعمق وإلى الأرشيف واستمرارية العمل التحريري.",
    focusLabel: "التركيز التحريري",
    openTopic: "افتح الموضوع",
    noStories: "لا نصوص بعد",
    emptyTitle: "لا توجد موضوعات في CMS بعد",
    emptyCopy: "بمجرد إضافتها إلى content type الخاص بـ Topic ستظهر هنا تلقائياً.",
  },
};

const fallbackTopicDescriptions: Record<string, Record<Lang, string>> = {
  drustvo: {
    sr: "Priče o svakodnevici, institucijama i odnosima koji oblikuju javni život.",
    en: "Stories about everyday life, institutions and the relations that shape public life.",
    tr: "Gündelik hayatı, kurumları ve kamusal yaşamı şekillendiren ilişkileri izleyen hikâyeler.",
    fr: "Des récits sur le quotidien, les institutions et les relations qui façonnent la vie publique.",
    de: "Geschichten über Alltag, Institutionen und Beziehungen, die das öffentliche Leben prägen.",
    es: "Historias sobre la vida cotidiana, las instituciones y las relaciones que moldean la vida pública.",
    el: "Ιστορίες για την καθημερινότητα, τους θεσμούς και τις σχέσεις που διαμορφώνουν τη δημόσια ζωή.",
    ar: "قصص عن الحياة اليومية والمؤسسات والعلاقات التي تشكّل المجال العام.",
  },
  ekologija: {
    sr: "Teren, vazduh, voda, zemlja i posledice odluka koje se ne vide odmah.",
    en: "Terrain, air, water, land and the consequences of decisions that are not immediately visible.",
    tr: "Arazi, hava, su, toprak ve sonuçları hemen görünmeyen kararların izi.",
    fr: "Le terrain, l'air, l'eau, la terre et les conséquences de décisions qui ne se voient pas tout de suite.",
    de: "Gelände, Luft, Wasser, Boden und die Folgen von Entscheidungen, die nicht sofort sichtbar sind.",
    es: "Territorio, aire, agua, tierra y las consecuencias de decisiones que no se ven de inmediato.",
    el: "Το πεδίο, ο αέρας, το νερό, η γη και οι συνέπειες αποφάσεων που δεν φαίνονται αμέσως.",
    ar: "الميدان والهواء والماء والأرض وعواقب القرارات التي لا تظهر فوراً.",
  },
  politika: {
    sr: "Moć, odgovornost, institucije i javni prostor bez dekorativnog jezika.",
    en: "Power, responsibility, institutions and public space without decorative language.",
    tr: "Güç, sorumluluk, kurumlar ve süslü bir dil olmadan kamusal alan.",
    fr: "Pouvoir, responsabilité, institutions et espace public sans langage décoratif.",
    de: "Macht, Verantwortung, Institutionen und öffentlicher Raum ohne dekorative Sprache.",
    es: "Poder, responsabilidad, instituciones y espacio público sin lenguaje decorativo.",
    el: "Εξουσία, ευθύνη, θεσμοί και δημόσιος χώρος χωρίς διακοσμητική γλώσσα.",
    ar: "السلطة والمسؤولية والمؤسسات والفضاء العام من دون لغة تجميلية.",
  },
  kultura: {
    sr: "Prostor gde društvo govori o sebi, često iskrenije nego kroz politiku.",
    en: "A space where society speaks about itself, often more honestly than through politics.",
    tr: "Toplumun kendisi hakkında konuştuğu, çoğu zaman siyasetten daha dürüst bir alan.",
    fr: "Un espace où la société parle d'elle-même, souvent plus honnêtement qu'à travers la politique.",
    de: "Ein Raum, in dem die Gesellschaft über sich selbst spricht, oft ehrlicher als über Politik.",
    es: "Un espacio donde la sociedad habla de sí misma, a menudo con más honestidad que en la política.",
    el: "Ένας χώρος όπου η κοινωνία μιλά για τον εαυτό της, συχνά πιο ειλικρινά απ’ ό,τι μέσω της πολιτικής.",
    ar: "مساحة يتحدث فيها المجتمع عن نفسه، وغالباً بصدق أكبر مما يفعل عبر السياسة.",
  },
  psihologija: {
    sr: "Lične i kolektivne posledice sistema, tišine, pritiska i preživljavanja.",
    en: "Personal and collective consequences of systems, silence, pressure and survival.",
    tr: "Sistemin, sessizliğin, baskının ve hayatta kalma halinin kişisel ve kolektif sonuçları.",
    fr: "Les conséquences personnelles et collectives du système, du silence, de la pression et de la survie.",
    de: "Persönliche und kollektive Folgen von Systemen, Schweigen, Druck und Überleben.",
    es: "Consecuencias personales y colectivas del sistema, el silencio, la presión y la supervivencia.",
    el: "Προσωπικές και συλλογικές συνέπειες του συστήματος, της σιωπής, της πίεσης και της επιβίωσης.",
    ar: "النتائج الفردية والجماعية للنظام والصمت والضغط ومحاولات النجاة.",
  },
  "rad-i-ekonomija": {
    sr: "Rad, dostojanstvo, nejednakost i cena života koja se stalno prebacuje na ljude.",
    en: "Work, dignity, inequality and the cost of living that is constantly shifted onto people.",
    tr: "Emek, onur, eşitsizlik ve yaşam maliyetinin sürekli insanlara yıkılması.",
    fr: "Le travail, la dignité, les inégalités et le coût de la vie sans cesse reporté sur les gens.",
    de: "Arbeit, Würde, Ungleichheit und die Lebenshaltungskosten, die ständig auf die Menschen abgewälzt werden.",
    es: "Trabajo, dignidad, desigualdad y el costo de vida que se traslada constantemente a la gente.",
    el: "Η εργασία, η αξιοπρέπεια, η ανισότητα και το κόστος ζωής που μεταφέρεται διαρκώς στους ανθρώπους.",
    ar: "العمل والكرامة واللامساواة وكلفة العيش التي تُحمَّل للناس باستمرار.",
  },
  "secanje-i-istorija": {
    sr: "Ono što društvo pamti, prećutkuje ili koristi kao politički alat.",
    en: "What society remembers, suppresses or uses as a political tool.",
    tr: "Toplumun hatırladığı, susturduğu ya da siyasi araç olarak kullandığı şeyler.",
    fr: "Ce que la société retient, tait ou utilise comme outil politique.",
    de: "Was eine Gesellschaft erinnert, verschweigt oder als politisches Werkzeug benutzt.",
    es: "Lo que la sociedad recuerda, calla o utiliza como herramienta política.",
    el: "Όσα η κοινωνία θυμάται, αποσιωπά ή χρησιμοποιεί ως πολιτικό εργαλείο.",
    ar: "ما يتذكره المجتمع أو يسكت عنه أو يستخدمه كأداة سياسية.",
  },
  margine: {
    sr: "Priče koje obično ostaju van centra, ali objašnjavaju centar bolje od njega.",
    en: "Stories that usually remain outside the center, yet explain the center better than it explains itself.",
    tr: "Genellikle merkezin dışında kalan ama merkezi ondan daha iyi açıklayan hikâyeler.",
    fr: "Des récits qui restent d'ordinaire hors du centre, mais qui expliquent le centre mieux que lui-même.",
    de: "Geschichten, die gewöhnlich außerhalb des Zentrums bleiben und das Zentrum besser erklären als es sich selbst.",
    es: "Historias que suelen quedar fuera del centro, pero que explican mejor el centro que él mismo.",
    el: "Ιστορίες που μένουν συνήθως έξω από το κέντρο, αλλά εξηγούν το κέντρο καλύτερα από το ίδιο.",
    ar: "قصص تبقى عادة خارج المركز، لكنها تشرح المركز أفضل مما يشرح نفسه.",
  },
  "ljudska-prava": {
    sr: "Dostojanstvo, sloboda i pravda tamo gde prestaju da budu samo deklaracija.",
    en: "Dignity, freedom and justice where they stop being mere declarations.",
    tr: "Sadece beyan olmaktan çıkıp gerçek hayata değen onur, özgürlük ve adalet.",
    fr: "La dignité, la liberté et la justice là où elles cessent d'être de simples déclarations.",
    de: "Würde, Freiheit und Gerechtigkeit dort, wo sie aufhören, bloße Deklarationen zu sein.",
    es: "Dignidad, libertad y justicia allí donde dejan de ser solo una declaración.",
    el: "Αξιοπρέπεια, ελευθερία και δικαιοσύνη εκεί όπου παύουν να είναι απλές διακηρύξεις.",
    ar: "الكرامة والحرية والعدالة حيث تكفّ عن أن تكون مجرد إعلان.",
  },
  palestina: {
    sr: "Geopolitika, svakodnevni život i odgovornost prema nasilju koje nije daleko.",
    en: "Geopolitics, everyday life and responsibility toward violence that is not far away.",
    tr: "Jeopolitik, gündelik hayat ve aslında uzak olmayan şiddete karşı sorumluluk.",
    fr: "Géopolitique, vie quotidienne et responsabilité face à une violence qui n'est pas lointaine.",
    de: "Geopolitik, Alltag und Verantwortung gegenüber einer Gewalt, die nicht weit weg ist.",
    es: "Geopolítica, vida cotidiana y responsabilidad frente a una violencia que no está lejos.",
    el: "Γεωπολιτική, καθημερινή ζωή και ευθύνη απέναντι στη βία που δεν είναι μακριά.",
    ar: "الجغرافيا السياسية والحياة اليومية والمسؤولية تجاه عنف ليس بعيداً.",
  },
  rogozna: {
    sr: "Planina, ljudi, rudnik, voda i pitanje šta ostaje posle velikih obećanja.",
    en: "Mountain, people, mine, water and the question of what remains after big promises.",
    tr: "Dağ, insanlar, maden, su ve büyük vaatlerden sonra geriye ne kaldığı sorusu.",
    fr: "La montagne, les habitants, la mine, l'eau et la question de ce qu'il reste après les grandes promesses.",
    de: "Berg, Menschen, Mine, Wasser und die Frage, was nach großen Versprechen übrig bleibt.",
    es: "La montaña, la gente, la mina, el agua y la pregunta de qué queda tras las grandes promesas.",
    el: "Το βουνό, οι άνθρωποι, το ορυχείο, το νερό και το ερώτημα τι μένει μετά τις μεγάλες υποσχέσεις.",
    ar: "الجبل والناس والمنجم والماء وسؤال ما الذي يبقى بعد الوعود الكبيرة.",
  },
  identitet: {
    sr: "Pripadnost, jezik, telo, poreklo i granice koje društvo upisuje u čoveka.",
    en: "Belonging, language, body, origin and the borders society inscribes into a person.",
    tr: "Aidiyet, dil, beden, köken ve toplumun insanın içine yazdığı sınırlar.",
    fr: "L'appartenance, la langue, le corps, l'origine et les frontières que la société inscrit dans chacun.",
    de: "Zugehörigkeit, Sprache, Körper, Herkunft und die Grenzen, die eine Gesellschaft in Menschen einschreibt.",
    es: "Pertenencia, lengua, cuerpo, origen y los límites que la sociedad inscribe en una persona.",
    el: "Η ένταξη, η γλώσσα, το σώμα, η καταγωγή και τα όρια που εγγράφει η κοινωνία στο άτομο.",
    ar: "الانتماء واللغة والجسد والأصل والحدود التي يكتبها المجتمع داخل الإنسان.",
  },
};

function pickLocalizedTopicField(topic: Topic, field: "description", lang: Lang) {
  const baseValue = topic[field];
  if (lang === "sr") {
    return typeof baseValue === "string" ? baseValue : "";
  }

  const translatedValue = topic[`${field}_${lang}` as keyof Topic];
  if (typeof translatedValue === "string" && translatedValue.trim()) {
    return translatedValue;
  }

  return typeof baseValue === "string" ? baseValue : "";
}

function getTopicDescription(topic: Topic, lang: Lang) {
  const localizedDescription = pickLocalizedTopicField(topic, "description", lang);
  if (localizedDescription.trim()) {
    return lang === "sr" ? normalizeSerbianLatinDeep(localizedDescription) : localizedDescription;
  }

  const fallbackKey = resolveTopicFallbackKey(topic, lang);
  if (!fallbackKey) {
    return "";
  }

  return fallbackTopicDescriptions[fallbackKey]?.[lang] || fallbackTopicDescriptions[fallbackKey]?.sr || "";
}

function normalizeTopicLookup(value: string) {
  return normalizeSerbianLatinDeep(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function resolveTopicFallbackKey(topic: Topic, lang: Lang) {
  if (fallbackTopicDescriptions[topic.slug]) {
    return topic.slug;
  }

  const currentName = normalizeTopicLookup(topic.name);
  if (!currentName) {
    return null;
  }

  for (const fallbackTopic of fallbackTopics) {
    const localizedFallback = localizeTopic(fallbackTopic, lang);
    const srFallback = localizeTopic(fallbackTopic, "sr");
    const fallbackNames = [fallbackTopic.name, localizedFallback.name, srFallback.name]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => normalizeTopicLookup(value));

    if (fallbackNames.includes(currentName)) {
      return fallbackTopic.slug;
    }
  }

  return null;
}

function extractTopicSlugs(value: unknown) {
  return Array.from(
    new Set(
      unwrapStrapiCollection<{ slug?: string }>(value)
        .map((item) => item.slug?.trim() || "")
        .filter(Boolean),
    ),
  );
}

function getTopicCounts(articles: PublishedArticle[]) {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const slug of extractTopicSlugs(article.topics)) {
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
  }

  return counts;
}

function getStoryCountLabel(count: number, lang: Lang, noStoriesLabel: string) {
  if (count <= 0) return noStoriesLabel;

  switch (lang) {
    case "sr":
      if (count === 1) return "1 tekst";
      if (count >= 2 && count <= 4) return `${count} teksta`;
      return `${count} tekstova`;
    case "en":
      return count === 1 ? "1 story" : `${count} stories`;
    case "tr":
      return `${count} yazı`;
    case "fr":
      return count === 1 ? "1 texte" : `${count} textes`;
    case "de":
      return count === 1 ? "1 Text" : `${count} Texte`;
    case "es":
      return count === 1 ? "1 texto" : `${count} textos`;
    case "el":
      return count === 1 ? "1 κείμενο" : `${count} κείμενα`;
    case "ar":
      return count === 1 ? "نص واحد" : `${count} نصوص`;
    default:
      return `${count}`;
  }
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const pageCopy = lang === "sr" ? normalizeSerbianLatinDeep(copy[lang]) : copy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/topics",
    title: buildPageTitle(pageCopy.label),
    description: pageCopy.intro,
  });
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const pageCopy = lang === "sr" ? normalizeSerbianLatinDeep(copy[lang]) : copy[lang];

  const [res, articles] = await Promise.all([
    strapiGet<{ data: unknown[] }>("/api/topics?sort[0]=name:asc&pagination[pageSize]=100", {
      next: { revalidate: 60 },
    }),
    fetchPublishedArticles(lang, 240),
  ]);

  const cmsTopics = unwrapStrapiCollection<Topic>(res).map((topic) => localizeTopic(topic, lang));
  const topics = cmsTopics.length ? cmsTopics : fallbackTopics.map((topic) => localizeTopic(topic, lang));
  const topicCounts = getTopicCounts(articles);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/topics" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{pageCopy.label}</span>
            <h1 className="subpage-hero__title">{pageCopy.title}</h1>
            <p className="subpage-hero__copy">{pageCopy.intro}</p>
          </section>

          {topics.length ? (
            <section className="topics-directory">
              <div className="topics-directory__grid">
                {topics.map((topic) => {
                  const count = topicCounts.get(topic.slug) || 0;
                  const description = getTopicDescription(topic, lang);

                  return (
                    <a key={topic.id} href={withLang(`/topic/${topic.slug}`, lang)} className="panel topic-directory-card">
                      <div className="topic-directory-card__topline">
                        <span className="topic-directory-card__count">
                          {getStoryCountLabel(count, lang, pageCopy.noStories)}
                        </span>
                        <span className="topic-directory-card__arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>

                      <h2 className="topic-directory-card__title">{topic.name}</h2>
                      <p className="topic-directory-card__description">{description}</p>

                      <div className="topic-directory-card__footer">
                        <span className="topic-directory-card__focus">{pageCopy.focusLabel}</span>
                        <span className="topic-directory-card__cta">{pageCopy.openTopic}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="panel empty-state">
              <h3>{pageCopy.emptyTitle}</h3>
              <p>{pageCopy.emptyCopy}</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
