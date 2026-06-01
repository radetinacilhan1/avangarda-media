import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

const copy: Record<Lang, { label: string; title: string; intro: string; blocks: Array<{ title: string; copy: string }> }> = {
  sr: {
    label: "Uslovi korišćenja",
    title: "Pravila korišćenja štite sadržaj, autore i poverenje.",
    intro:
      "Tekstovi, fotografije, video materijali, ilustracije i drugi vizuelni elementi objavljeni na Avangardi zaštićeni su autorskim pravima, osim ako nije drugačije naznačeno.",
    blocks: [
      {
        title: "Citiranje i deljenje",
        copy:
          "Sadržaj Avangarde može se citirati i deliti uz jasan izvor, aktivan link kada je moguć i bez izvrtanja konteksta ili uređivačke namere.",
      },
      {
        title: "Fotografije i vizuelni materijali",
        copy:
          "Sve fotografije, video materijali, ilustracije i vizuelni elementi objavljeni na Avangardi zaštićeni su autorskim pravima, osim ako nije drugačije naznačeno. Preuzimanje, kopiranje, ponovno objavljivanje ili komercijalna upotreba nije dozvoljena bez prethodne saglasnosti redakcije ili autora.",
      },
      {
        title: "Dozvole i spoljašnji izvori",
        copy:
          "Kod fotografija i materijala preuzetih iz spoljašnjih izvora, Avangarda navodi izvor i autora kada su ti podaci dostupni. Za dozvole, ponovnu objavu ili prijavu povrede prava kontaktirajte redakciju.",
      },
    ],
  },
  en: {
    label: "Terms of use",
    title: "Usage rules protect the work, the authors and the trust around it.",
    intro:
      "Texts, photographs, videos, illustrations and other visual materials published by Avangarda are protected by copyright unless stated otherwise.",
    blocks: [
      {
        title: "Quoting and sharing",
        copy:
          "Avangarda content may be quoted and shared with clear attribution, an active link when possible, and without distorting the context or editorial intent.",
      },
      {
        title: "Photographs and visual materials",
        copy:
          "All photographs, video materials, illustrations and visual elements published by Avangarda are protected by copyright unless stated otherwise. Downloading, copying, republishing or commercial use is not permitted without prior permission from the editorial team or the author.",
      },
      {
        title: "Permissions and external sources",
        copy:
          "When a photograph or other material comes from an external source, Avangarda identifies the source and the author whenever that information is available. For permissions, republication or copyright concerns, please contact the editorial team.",
      },
    ],
  },
  tr: {
    label: "Kullanım koşulları",
    title: "Kullanım kuralları içeriği, yazarları ve etrafındaki güveni korur.",
    intro:
      "Avangarda'da yayımlanan metinler, fotoğraflar, videolar, illüstrasyonlar ve diğer görsel materyaller aksi belirtilmedikçe telif hakkı ile korunur.",
    blocks: [
      {
        title: "Alıntılama ve paylaşım",
        copy:
          "Avangarda içeriği, kaynak açıkça belirtilerek, mümkün olduğunda aktif bağlantı verilerek ve bağlam ya da editoryal niyet bozulmadan alıntılanabilir ve paylaşılabilir.",
      },
      {
        title: "Fotoğraflar ve görsel materyaller",
        copy:
          "Avangarda'da yayımlanan tüm fotoğraflar, video materyalleri, illüstrasyonlar ve görsel öğeler aksi belirtilmedikçe telif hakkı ile korunur. İndirme, kopyalama, yeniden yayımlama veya ticari kullanım, editoryal ekip ya da yazarın önceden verdiği izin olmadan yasaktır.",
      },
      {
        title: "İzinler ve dış kaynaklar",
        copy:
          "Bir fotoğraf ya da materyal dış bir kaynaktan geldiğinde, Avangarda mümkün olduğu ölçüde kaynağı ve yazarı belirtir. İzin, yeniden yayımlama ya da hak ihlali bildirimleri için editoryal ekiple iletişime geçin.",
      },
    ],
  },
  fr: {
    label: "Conditions d'utilisation",
    title: "Les règles d'usage protègent le travail, les auteurs et la confiance autour de lui.",
    intro:
      "Les textes, photographies, vidéos, illustrations et autres éléments visuels publiés par Avangarda sont protégés par le droit d'auteur sauf indication contraire.",
    blocks: [
      {
        title: "Citation et partage",
        copy:
          "Le contenu d'Avangarda peut être cité et partagé avec une attribution claire, un lien actif lorsque c'est possible, et sans déformer le contexte ni l'intention éditoriale.",
      },
      {
        title: "Photographies et éléments visuels",
        copy:
          "Toutes les photographies, vidéos, illustrations et éléments visuels publiés par Avangarda sont protégés par le droit d'auteur, sauf indication contraire. Le téléchargement, la copie, la republication ou l'usage commercial ne sont pas autorisés sans l'accord préalable de la rédaction ou de l'auteur.",
      },
      {
        title: "Autorisations et sources externes",
        copy:
          "Lorsqu'une photographie ou un matériau provient d'une source externe, Avangarda indique la source et l'auteur lorsque ces informations sont disponibles. Pour les autorisations, la republication ou les questions de droits, contactez la rédaction.",
      },
    ],
  },
  de: {
    label: "Nutzungsbedingungen",
    title: "Nutzungsregeln schützen die Arbeit, die Autorinnen und Autoren und das Vertrauen darum herum.",
    intro:
      "Texte, Fotografien, Videos, Illustrationen und andere visuelle Materialien, die auf Avangarda veröffentlicht werden, sind urheberrechtlich geschützt, sofern nicht anders angegeben.",
    blocks: [
      {
        title: "Zitieren und Teilen",
        copy:
          "Inhalte von Avangarda dürfen mit klarer Quellenangabe, einem aktiven Link wenn möglich und ohne Verfälschung von Kontext oder redaktioneller Absicht zitiert und geteilt werden.",
      },
      {
        title: "Fotografien und visuelle Materialien",
        copy:
          "Alle auf Avangarda veröffentlichten Fotografien, Videomaterialien, Illustrationen und visuellen Elemente sind urheberrechtlich geschützt, sofern nicht anders angegeben. Herunterladen, Kopieren, erneute Veröffentlichung oder kommerzielle Nutzung sind ohne vorherige Zustimmung der Redaktion oder der Autorin beziehungsweise des Autors nicht erlaubt.",
      },
      {
        title: "Genehmigungen und externe Quellen",
        copy:
          "Wenn ein Foto oder anderes Material aus einer externen Quelle stammt, nennt Avangarda die Quelle und die Autorin oder den Autor, sofern diese Informationen verfügbar sind. Für Genehmigungen, Nachveröffentlichungen oder Hinweise zu Rechtsverletzungen wenden Sie sich bitte an die Redaktion.",
      },
    ],
  },
  es: {
    label: "Términos de uso",
    title: "Las reglas de uso protegen el trabajo, a sus autoras y autores, y la confianza que lo rodea.",
    intro:
      "Los textos, fotografías, videos, ilustraciones y demás materiales visuales publicados por Avangarda están protegidos por derechos de autor salvo que se indique lo contrario.",
    blocks: [
      {
        title: "Citas y difusión",
        copy:
          "El contenido de Avangarda puede citarse y compartirse con atribución clara, enlace activo cuando sea posible y sin distorsionar el contexto ni la intención editorial.",
      },
      {
        title: "Fotografías y materiales visuales",
        copy:
          "Todas las fotografías, materiales de video, ilustraciones y elementos visuales publicados por Avangarda están protegidos por derechos de autor, salvo que se indique lo contrario. La descarga, copia, republicación o uso comercial no están permitidos sin autorización previa de la redacción o de la autora o el autor.",
      },
      {
        title: "Permisos y fuentes externas",
        copy:
          "Cuando una fotografía o material procede de una fuente externa, Avangarda indica la fuente y la autoría siempre que esa información esté disponible. Para permisos, republicación o consultas sobre derechos, ponte en contacto con la redacción.",
      },
    ],
  },
  el: {
    label: "Όροι χρήσης",
    title: "Οι κανόνες χρήσης προστατεύουν το έργο, τους δημιουργούς και την εμπιστοσύνη γύρω από αυτό.",
    intro:
      "Τα κείμενα, οι φωτογραφίες, τα βίντεο, οι εικονογραφήσεις και τα λοιπά οπτικά υλικά που δημοσιεύονται στην Avangarda προστατεύονται από πνευματικά δικαιώματα, εκτός αν αναφέρεται διαφορετικά.",
    blocks: [
      {
        title: "Παράθεση και κοινοποίηση",
        copy:
          "Το περιεχόμενο της Avangarda μπορεί να παρατίθεται και να κοινοποιείται με σαφή αναφορά της πηγής, ενεργό σύνδεσμο όπου είναι δυνατόν και χωρίς παραμόρφωση του πλαισίου ή της συντακτικής πρόθεσης.",
      },
      {
        title: "Φωτογραφίες και οπτικό υλικό",
        copy:
          "Όλες οι φωτογραφίες, τα βίντεο, οι εικονογραφήσεις και τα οπτικά στοιχεία που δημοσιεύονται στην Avangarda προστατεύονται από πνευματικά δικαιώματα, εκτός αν αναφέρεται διαφορετικά. Η λήψη, η αντιγραφή, η αναδημοσίευση ή η εμπορική χρήση δεν επιτρέπονται χωρίς προηγούμενη άδεια από τη σύνταξη ή τον δημιουργό.",
      },
      {
        title: "Άδειες και εξωτερικές πηγές",
        copy:
          "Όταν μια φωτογραφία ή άλλο υλικό προέρχεται από εξωτερική πηγή, η Avangarda αναφέρει την πηγή και τον δημιουργό όταν αυτές οι πληροφορίες είναι διαθέσιμες. Για άδειες, αναδημοσίευση ή ζητήματα δικαιωμάτων, επικοινωνήστε με τη σύνταξη.",
      },
    ],
  },
  ar: {
    label: "شروط الاستخدام",
    title: "تحمي قواعد الاستخدام العمل وأصحابه والثقة المحيطة به.",
    intro:
      "النصوص والصور والمواد المصورة والرسومات والعناصر البصرية الأخرى المنشورة على أفانغاردا محمية بحقوق النشر ما لم يُذكر خلاف ذلك.",
    blocks: [
      {
        title: "الاقتباس والمشاركة",
        copy:
          "يمكن اقتباس محتوى أفانغاردا ومشاركته مع إسناد واضح للمصدر ورابط فعال متى كان ذلك ممكنًا، ومن دون تشويه السياق أو المقصد التحريري.",
      },
      {
        title: "الصور والمواد البصرية",
        copy:
          "جميع الصور والمواد المصورة والرسومات والعناصر البصرية المنشورة على أفانغاردا محمية بحقوق النشر ما لم يُذكر خلاف ذلك. ولا يُسمح بالتنزيل أو النسخ أو إعادة النشر أو الاستخدام التجاري من دون موافقة مسبقة من هيئة التحرير أو صاحب الحق.",
      },
      {
        title: "الأذونات والمصادر الخارجية",
        copy:
          "عندما تكون الصورة أو المادة مأخوذة من مصدر خارجي، تذكر أفانغاردا المصدر واسم صاحب العمل متى كانت هذه المعلومات متاحة. ولطلبات الإذن أو إعادة النشر أو الاستفسار بشأن الحقوق، يرجى التواصل مع هيئة التحرير.",
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
    pathname: "/terms-of-use",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function TermsOfUsePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/terms-of-use" copy={copy[lang]} />;
}
