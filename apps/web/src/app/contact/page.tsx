import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import { fetchImpressumPageCopy, type ImpressumPageCopy } from "@/lib/impressum";
import type { Lang } from "@/lib/i18n";
import { resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type StaticPageLink = {
  label: string;
  href: string;
};

type ContactBlockTemplate = {
  eyebrow: string;
  title: string;
  copy: string | string[];
  linkKind?: "email" | "contribute" | "socials" | "impressum";
};

type ContactPageCopy = {
  label: string;
  title: string;
  intro: string;
  emailLabel: string;
  contributeLabel: string;
  impressumLabel: string;
  blocks: ContactBlockTemplate[];
};

const copy: Record<Lang, ContactPageCopy> = {
  sr: {
    label: "Kontakt",
    title: "Kontakt postoji da prica dode do pravog urednickog stola.",
    intro:
      "Ako imas pitanje, dokument, predlog ili temu koja zasluzuje vise prostora, ovde su javni ulazi. Privatni recipient email za forme nije deo ove stranice.",
    emailLabel: "Javni email",
    contributeLabel: "Posalji predlog",
    impressumLabel: "Impresum",
    blocks: [
      {
        eyebrow: "REDAKCIJA",
        title: "Javni kontakt redakcije",
        copy:
          "Za opsta pitanja i javnu komunikaciju koristi javni kontakt kanal iz impresuma. Ako je kontakt promenjen u Strapi adminu, ova kartica prati taj javni podatak.",
        linkKind: "email"
      },
      {
        eyebrow: "MATERIJALI",
        title: "Teme i dokumenta",
        copy:
          "Ako saljes dokument, trag, predlog teme ili ispravku, cilj je da materijal dode do konteksta, ne do buke. Za urednicke predloge koristi Saradnja tok.",
        linkKind: "contribute"
      },
      {
        eyebrow: "SARADNJA",
        title: "Predlozi pricu ili saradnju",
        copy:
          "Saradnja forma je odvojena od javnog kontakt email-a. Ona moze biti otvorena ili zatvorena kroz CMS i server-side spremnost slanja.",
        linkKind: "contribute"
      },
      {
        eyebrow: "MREZE",
        title: "Javni kanali",
        copy:
          "YouTube, Instagram, TikTok, X i drugi javni kanali prikazuju se kada su upisani u Impressum/CMS. Mreze su dobar ulaz za javni trag, ali nisu zamena za urednicku proveru.",
        linkKind: "socials"
      },
      {
        eyebrow: "DIREKTNO",
        title: "Pravni i izdavacki podaci",
        copy:
          "Za formalne podatke o izdavacu, javnom kontaktu i odgovornosti koristi Impressum. Interni email za slanje formulara ostaje server-side i nije javni kontakt.",
        linkKind: "impressum"
      }
    ]
  },
  en: {
    label: "Contact",
    title: "Contact exists so a story can reach the right editorial desk.",
    intro:
      "If you have a question, document, lead or topic that deserves more room, these are the public entry points. The private form recipient email is not exposed here.",
    emailLabel: "Public email",
    contributeLabel: "Submit a lead",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "NEWSROOM", title: "Public editorial contact", copy: "For general questions and public communication, use the public contact channel from the impressum. If that contact is changed in Strapi admin, this card follows the public value.", linkKind: "email" },
      { eyebrow: "MATERIAL", title: "Topics and documents", copy: "If you send a document, lead, topic proposal or correction, the point is to move material toward context, not noise. For editorial proposals, use the contribution flow.", linkKind: "contribute" },
      { eyebrow: "COLLAB", title: "Pitch a story or collaboration", copy: "The contribution form is separate from the public contact email. It can be open or closed through CMS content and server-side submission readiness.", linkKind: "contribute" },
      { eyebrow: "NETWORKS", title: "Public channels", copy: "YouTube, Instagram, TikTok, X and other public channels appear when they are entered in Impressum/CMS. Social networks are useful for public signals, but not a replacement for editorial verification.", linkKind: "socials" },
      { eyebrow: "DIRECT", title: "Legal and publisher details", copy: "For formal publisher, public contact and responsibility details, use the Impressum page. The internal form recipient email remains server-side and is not a public contact.", linkKind: "impressum" }
    ]
  },
  tr: {
    label: "Iletisim",
    title: "Iletisim, bir hikayenin dogru editoryal masaya ulasmasi icin vardir.",
    intro:
      "Sorun, belgen, ipucun veya daha fazla alan hak eden konun varsa kamusal giris noktasi burasi. Formlarin ozel alici email'i burada aciklanmaz.",
    emailLabel: "Acik email",
    contributeLabel: "Oneri gonder",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "REDAKSIYON", title: "Kamusal editoryal kontakt", copy: "Genel sorular ve kamusal iletisim icin impressum'daki acik kontakt kanalini kullan. Strapi admin'de degisirse bu kart ayni acik veriyi izler.", linkKind: "email" },
      { eyebrow: "MALZEME", title: "Temalar ve belgeler", copy: "Belge, ipucu, konu onerisi veya duzeltme gonderiyorsan amac materyali baglama tasimaktir. Editoryal oneriler icin katki akisini kullan.", linkKind: "contribute" },
      { eyebrow: "IS BIRLIGI", title: "Hikaye veya is birligi oner", copy: "Katki formu kamusal email'den ayridir. CMS icerigi ve server-side gonderim hazirligina gore acik veya kapali olabilir.", linkKind: "contribute" },
      { eyebrow: "AGLAR", title: "Kamusal kanallar", copy: "YouTube, Instagram, TikTok, X ve diger kanallar Impressum/CMS'e girildiginde gorunur. Sosyal aglar kamusal isaret icindir, editoryal dogrulamanin yerine gecmez.", linkKind: "socials" },
      { eyebrow: "DOGRUDAN", title: "Hukuki ve yayinci bilgileri", copy: "Yayinci, kamusal kontakt ve sorumluluk bilgileri icin Impressum sayfasini kullan. Form alici email'i server-side kalir ve kamusal kontakt degildir.", linkKind: "impressum" }
    ]
  },
  fr: {
    label: "Contact",
    title: "Le contact existe pour qu'une histoire atteigne le bon bureau editorial.",
    intro:
      "Si tu as une question, un document, une piste ou un sujet qui merite plus d'espace, voici les points d'entree publics. L'email interne des formulaires n'est pas expose ici.",
    emailLabel: "Email public",
    contributeLabel: "Proposer une piste",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "REDACTION", title: "Contact editorial public", copy: "Pour les questions generales et la communication publique, utilise le contact public de l'impressum. S'il change dans Strapi admin, cette carte suit cette valeur publique.", linkKind: "email" },
      { eyebrow: "MATERIEL", title: "Sujets et documents", copy: "Si tu envoies un document, une piste, une proposition ou une correction, l'objectif est de mener vers le contexte, pas vers le bruit. Pour les propositions editoriales, utilise la page contribution.", linkKind: "contribute" },
      { eyebrow: "COLLAB", title: "Proposer une histoire ou collaboration", copy: "Le formulaire de contribution est separe de l'email public. Il peut etre ouvert ou ferme selon le CMS et la disponibilite server-side de l'envoi.", linkKind: "contribute" },
      { eyebrow: "RESEAUX", title: "Canaux publics", copy: "YouTube, Instagram, TikTok, X et autres canaux apparaissent lorsqu'ils sont renseignes dans Impressum/CMS. Les reseaux sont utiles pour un signal public, pas pour remplacer la verification editoriale.", linkKind: "socials" },
      { eyebrow: "DIRECT", title: "Donnees legales et editeur", copy: "Pour les informations formelles sur l'editeur, le contact public et la responsabilite, utilise l'Impressum. L'email interne des formulaires reste cote serveur.", linkKind: "impressum" }
    ]
  },
  de: {
    label: "Kontakt",
    title: "Kontakt ist da, damit eine Geschichte den richtigen Redaktionstisch erreicht.",
    intro:
      "Wenn du eine Frage, ein Dokument, einen Hinweis oder ein Thema hast, sind dies die oeffentlichen Einstiege. Die interne Empfaengeradresse fuer Formulare wird hier nicht gezeigt.",
    emailLabel: "Oeffentliche E-Mail",
    contributeLabel: "Hinweis senden",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "REDAKTION", title: "Oeffentlicher Redaktionskontakt", copy: "Fuer allgemeine Fragen und oeffentliche Kommunikation nutze den Kontakt aus dem Impressum. Wenn er in Strapi admin geaendert wird, folgt diese Karte dem oeffentlichen Wert.", linkKind: "email" },
      { eyebrow: "MATERIAL", title: "Themen und Dokumente", copy: "Wenn du Dokumente, Hinweise, Themenvorschlaege oder Korrekturen sendest, soll Material in Richtung Kontext gehen. Fuer redaktionelle Vorschlaege nutze den Beitragsfluss.", linkKind: "contribute" },
      { eyebrow: "KOOPERATION", title: "Geschichte oder Zusammenarbeit vorschlagen", copy: "Das Beitragsformular ist von der oeffentlichen E-Mail getrennt. Es kann ueber CMS-Inhalt und serverseitige Sendebereitschaft offen oder geschlossen sein.", linkKind: "contribute" },
      { eyebrow: "NETZWERKE", title: "Oeffentliche Kanaele", copy: "YouTube, Instagram, TikTok, X und andere Kanaele erscheinen, wenn sie im Impressum/CMS eingetragen sind. Netzwerke sind ein oeffentlicher Eingang, ersetzen aber keine redaktionelle Pruefung.", linkKind: "socials" },
      { eyebrow: "DIREKT", title: "Rechts- und Herausgeberdaten", copy: "Fuer formale Angaben zu Herausgeber, oeffentlichem Kontakt und Verantwortung nutze das Impressum. Die interne Formularadresse bleibt serverseitig.", linkKind: "impressum" }
    ]
  },
  es: {
    label: "Contacto",
    title: "El contacto existe para que una historia llegue a la mesa editorial adecuada.",
    intro:
      "Si tienes una pregunta, documento, pista o tema que merece mas espacio, estos son los puntos publicos de entrada. El email interno de formularios no se expone aqui.",
    emailLabel: "Email publico",
    contributeLabel: "Enviar propuesta",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "REDACCION", title: "Contacto editorial publico", copy: "Para preguntas generales y comunicacion publica, usa el contacto publico del impressum. Si cambia en Strapi admin, esta tarjeta sigue ese valor publico.", linkKind: "email" },
      { eyebrow: "MATERIAL", title: "Temas y documentos", copy: "Si envias un documento, pista, propuesta o correccion, el objetivo es llevar el material al contexto, no al ruido. Para propuestas editoriales usa el flujo de colaboracion.", linkKind: "contribute" },
      { eyebrow: "COLAB", title: "Proponer historia o colaboracion", copy: "El formulario de colaboracion esta separado del email publico. Puede abrirse o cerrarse mediante CMS y disponibilidad server-side del envio.", linkKind: "contribute" },
      { eyebrow: "REDES", title: "Canales publicos", copy: "YouTube, Instagram, TikTok, X y otros canales aparecen cuando estan en Impressum/CMS. Las redes sirven como senal publica, no sustituyen la verificacion editorial.", linkKind: "socials" },
      { eyebrow: "DIRECTO", title: "Datos legales y editoriales", copy: "Para datos formales del editor, contacto publico y responsabilidad, usa Impressum. El email interno de formularios queda server-side.", linkKind: "impressum" }
    ]
  },
  el: {
    label: "Επικοινωνία",
    title: "Η επικοινωνία υπάρχει για να φτάσει μια ιστορία στο σωστό συντακτικό γραφείο.",
    intro:
      "Αν έχεις ερώτηση, έγγραφο, πληροφορία ή θέμα που αξίζει χώρο, αυτά είναι τα δημόσια σημεία εισόδου. Το εσωτερικό email των φορμών δεν εμφανίζεται εδώ.",
    emailLabel: "Δημόσιο email",
    contributeLabel: "Στείλε πρόταση",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "ΣΥΝΤΑΞΗ", title: "Δημόσια συντακτική επαφή", copy: "Για γενικές ερωτήσεις και δημόσια επικοινωνία χρησιμοποίησε το δημόσιο contact του Impressum. Αν αλλάξει στο Strapi admin, αυτή η κάρτα ακολουθεί τη δημόσια τιμή.", linkKind: "email" },
      { eyebrow: "ΥΛΙΚΟ", title: "Θέματα και έγγραφα", copy: "Αν στέλνεις έγγραφο, πληροφορία, πρόταση ή διόρθωση, ο στόχος είναι το υλικό να πάει προς το πλαίσιο. Για συντακτικές προτάσεις χρησιμοποίησε τη συνεργασία.", linkKind: "contribute" },
      { eyebrow: "ΣΥΝΕΡΓΑΣΙΑ", title: "Πρότεινε ιστορία ή συνεργασία", copy: "Η φόρμα συνεργασίας είναι χωριστή από το δημόσιο email. Μπορεί να ανοίγει ή να κλείνει από CMS και server-side ετοιμότητα αποστολής.", linkKind: "contribute" },
      { eyebrow: "ΔΙΚΤΥΑ", title: "Δημόσια κανάλια", copy: "YouTube, Instagram, TikTok, X και άλλα κανάλια εμφανίζονται όταν έχουν καταχωριστεί στο Impressum/CMS. Τα δίκτυα είναι δημόσιο σήμα, όχι υποκατάστατο συντακτικής επαλήθευσης.", linkKind: "socials" },
      { eyebrow: "ΑΜΕΣΑ", title: "Νομικά και εκδοτικά στοιχεία", copy: "Για επίσημα στοιχεία εκδότη, δημόσιο contact και ευθύνη χρησιμοποίησε το Impressum. Το εσωτερικό email φόρμας μένει server-side.", linkKind: "impressum" }
    ]
  },
  ar: {
    label: "اتصل بنا",
    title: "الاتصال موجود كي تصل القصة إلى المكتب التحريري المناسب.",
    intro:
      "إذا كان لديك سؤال أو وثيقة أو معلومة أو موضوع يستحق مساحة، فهذه هي المداخل العامة. بريد الاستقبال الداخلي للنماذج لا يظهر هنا.",
    emailLabel: "البريد العام",
    contributeLabel: "أرسل اقتراحا",
    impressumLabel: "Impressum",
    blocks: [
      { eyebrow: "التحرير", title: "تواصل تحريري عام", copy: "للأسئلة العامة والتواصل العلني استخدم قناة الاتصال العامة من Impressum. إذا تغيرت في Strapi admin فهذه البطاقة تتبع القيمة العامة.", linkKind: "email" },
      { eyebrow: "مواد", title: "موضوعات ووثائق", copy: "إذا أرسلت وثيقة أو معلومة أو اقتراحا أو تصحيحا، فالهدف أن تصل المادة إلى السياق لا إلى الضجيج. للاقتراحات التحريرية استخدم مسار التعاون.", linkKind: "contribute" },
      { eyebrow: "تعاون", title: "اقترح قصة أو تعاونا", copy: "نموذج التعاون منفصل عن البريد العام. يمكن فتحه أو إغلاقه عبر CMS وجاهزية الإرسال على الخادم.", linkKind: "contribute" },
      { eyebrow: "الشبكات", title: "قنوات عامة", copy: "تظهر YouTube وInstagram وTikTok وX وقنوات أخرى عندما تسجل في Impressum/CMS. الشبكات إشارة عامة، لكنها لا تستبدل التحقق التحريري.", linkKind: "socials" },
      { eyebrow: "مباشر", title: "بيانات قانونية وناشر", copy: "للبيانات الرسمية عن الناشر والتواصل العام والمسؤولية استخدم Impressum. بريد استقبال النماذج الداخلي يبقى على الخادم.", linkKind: "impressum" }
    ]
  }
};

function extractPublicEmail(pageCopy: ImpressumPageCopy): StaticPageLink | null {
  const entry = pageCopy.details.find((detail) => detail.href?.startsWith("mailto:"));
  if (!entry?.href || !entry.value) return null;
  return { label: entry.value, href: entry.href };
}

function extractSocialLinks(pageCopy: ImpressumPageCopy) {
  const entry = pageCopy.details.find((detail) => detail.links?.length);
  return entry?.links || [];
}

function buildContactCopy(lang: Lang, impressum: ImpressumPageCopy) {
  const page = copy[lang];
  const publicEmail = extractPublicEmail(impressum);
  const socialLinks = extractSocialLinks(impressum);

  return {
    label: page.label,
    title: page.title,
    intro: page.intro,
    blocks: page.blocks.map((block) => {
      let links: StaticPageLink[] = [];

      if (block.linkKind === "email" && publicEmail) {
        links = [{ label: `${page.emailLabel}: ${publicEmail.label}`, href: publicEmail.href }];
      } else if (block.linkKind === "contribute") {
        links = [{ label: page.contributeLabel, href: withLang("/contribute", lang) }];
      } else if (block.linkKind === "socials") {
        links = socialLinks;
      } else if (block.linkKind === "impressum") {
        links = [{ label: page.impressumLabel, href: withLang("/impresum", lang) }];
      }

      return {
        eyebrow: block.eyebrow,
        title: block.title,
        copy: block.copy,
        links
      };
    })
  };
}

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

export default async function ContactPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  const impressum = await fetchImpressumPageCopy(lang);
  return <StaticEditorialPage lang={lang} currentPath="/contact" copy={buildContactCopy(lang, impressum)} />;
}
