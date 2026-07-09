import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import type { Lang } from "@/lib/i18n";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type StaticPageBlock = {
  eyebrow: string;
  title: string;
  copy: string | string[];
};

type StaticPageCopy = {
  label: string;
  title: string;
  intro: string;
  blocks: StaticPageBlock[];
};

const copy: Record<Lang, StaticPageCopy> = {
  sr: {
    label: "Uslovi koriscenja",
    title: "Pravila koriscenja stite sadrzaj, autore i poverenje.",
    intro:
      "Avangarda objavljuje sadrzaj u javnom interesu. Citaj, deli i citiraj odgovorno: sa izvorom, linkom i bez izvrtanja konteksta.",
    blocks: [
      {
        eyebrow: "KORISCENJE",
        title: "Citanje, deljenje i javni interes",
        copy:
          "Tekstovi Avangarde mogu se citati, deliti i preporucivati. Deljenje ne sme brisati autora, izvor, datum, kontekst ili cinjenicu da je tekst objavljen u urednickom okviru Avangarde."
      },
      {
        eyebrow: "CITIRANJE",
        title: "Kratki citati uz jasan izvor",
        copy:
          "Dozvoljeno je kratko citiranje uz navodenje autora kada je naveden, imena Avangarda i linka ka originalu. Citat ne sme menjati smisao teksta niti stvarati pogresan utisak o stavu autora ili redakcije."
      },
      {
        eyebrow: "VIZUELNO",
        title: "Fotografije, video i ilustracije",
        copy:
          "Fotografije, video materijali, ilustracije i drugi vizuelni elementi ne smeju se preuzimati, ponovo objavljivati ili komercijalno koristiti bez dozvole, osim ako je drugacije jasno naznaceno."
      },
      {
        eyebrow: "IZVORI",
        title: "Spoljasnji izvori i prava drugih",
        copy:
          "Ako je materijal povezan sa spoljasnjim izvorom, korisnik mora postovati prava originalnog izvora. Kada su podaci dostupni, Avangarda navodi izvor i autora."
      },
      {
        eyebrow: "ZABRANA",
        title: "Bez manipulacije i zloupotrebe",
        copy:
          "Sadrzaj se ne sme koristiti za manipulaciju, izvrtanje konteksta, govor mrznje, targetiranje ljudi, lazno predstavljanje ili komercijalnu eksploataciju bez dozvole."
      },
      {
        eyebrow: "ODGOVORNOST",
        title: "Kako koristis informacije",
        copy:
          "Avangarda objavljuje informacije, analize i dokumentarne materijale u javnom interesu, ali korisnik sam odgovara za nacin na koji ih tumaci, prenosi i koristi."
      },
      {
        eyebrow: "AUTORSKA PRAVA",
        title: "Dozvole, izmene i povrede prava",
        copy:
          "Uslovi se mogu azurirati kako se sajt razvija. Za dozvole, ponovnu objavu, komercijalnu upotrebu ili prijavu povrede prava koristi kontakt stranicu."
      }
    ]
  },
  en: {
    label: "Terms of use",
    title: "Usage rules protect the work, the authors and the trust around it.",
    intro:
      "Avangarda publishes in the public interest. Read, share and quote responsibly: with attribution, a link and without distorting context.",
    blocks: [
      { eyebrow: "USE", title: "Reading, sharing and public interest", copy: "Avangarda texts may be read, shared and recommended. Sharing must not remove the author, source, date, context or the fact that the work appeared within Avangarda's editorial frame." },
      { eyebrow: "QUOTING", title: "Short quotes with clear source", copy: "Short quotation is allowed with the author when named, Avangarda as the source and a link to the original. A quote must not change the meaning or misrepresent the author or the newsroom." },
      { eyebrow: "VISUALS", title: "Photographs, video and illustrations", copy: "Photographs, video, illustrations and other visual elements may not be downloaded, republished or used commercially without permission unless clearly stated otherwise." },
      { eyebrow: "SOURCES", title: "External sources and third-party rights", copy: "If material is connected to an external source, users must respect the rights of the original source. Where available, Avangarda names the source and author." },
      { eyebrow: "PROHIBITED", title: "No manipulation or misuse", copy: "Content may not be used for manipulation, distortion of context, hate speech, targeting people, false presentation or commercial exploitation without permission." },
      { eyebrow: "RESPONSIBILITY", title: "How information is used", copy: "Avangarda publishes information, analysis and documentary material in the public interest, but users are responsible for how they interpret, transfer and use it." },
      { eyebrow: "RIGHTS", title: "Permissions and updates", copy: "These terms may be updated as the site develops. For permissions, republication, commercial use or copyright concerns, use the contact page." }
    ]
  },
  tr: {
    label: "Kullanim kosullari",
    title: "Kullanim kurallari icerigi, yazarları ve guveni korur.",
    intro:
      "Avangarda kamu yarari icin yayin yapar. Oku, paylas ve alinti yap; ama kaynak, baglanti ve baglam acik kalsin.",
    blocks: [
      { eyebrow: "KULLANIM", title: "Okuma, paylasma ve kamu yarari", copy: "Avangarda metinleri okunabilir, paylasilabilir ve onerilebilir. Paylasim yazar, kaynak, tarih, baglam veya Avangarda'nin editoral cercevesini silmemelidir." },
      { eyebrow: "ALINTI", title: "Kisa alinti ve acik kaynak", copy: "Kisa alinti, yazar belirtilmis ise yazar adi, Avangarda kaynagi ve orijinal baglanti ile yapilabilir. Alinti anlami degistirmemeli veya redaksiyonu yanlis gostermemelidir." },
      { eyebrow: "GORSEL", title: "Fotograf, video ve illustrasyon", copy: "Fotograf, video, illustrasyon ve diger gorsel ogeler izin olmadan indirilemez, yeniden yayinlanamaz veya ticari kullanilamaz; aksi acikca belirtilmedikce." },
      { eyebrow: "KAYNAKLAR", title: "Dis kaynaklar ve haklar", copy: "Malzeme dis kaynaga bagliysa, kullanici orijinal kaynagin haklarina uymalidir. Bilgi varsa Avangarda kaynak ve yazari belirtir." },
      { eyebrow: "YASAK", title: "Manipulasyon yok", copy: "Icerik manipulasyon, baglami bozma, nefret soylemi, kisileri hedef alma, yanlis temsil veya izinsiz ticari kullanim icin kullanilamaz." },
      { eyebrow: "SORUMLULUK", title: "Bilginin kullanimi", copy: "Avangarda bilgi, analiz ve belgesel materyali kamu yarari icin yayinlar; kullanici bunlari nasil yorumladigindan ve kullandigindan sorumludur." },
      { eyebrow: "HAKLAR", title: "Izinler ve guncelleme", copy: "Bu kosullar site gelistikce guncellenebilir. Izin, yeniden yayin, ticari kullanim veya hak ihlali sorulari icin iletisim sayfasini kullan." }
    ]
  },
  fr: {
    label: "Conditions d'utilisation",
    title: "Les regles d'usage protegent le travail, les auteurs et la confiance.",
    intro:
      "Avangarda publie dans l'interet public. Lis, partage et cite avec responsabilite: source, lien et contexte doivent rester visibles.",
    blocks: [
      { eyebrow: "USAGE", title: "Lecture, partage et interet public", copy: "Les textes d'Avangarda peuvent etre lus, partages et recommandes. Le partage ne doit pas supprimer l'auteur, la source, la date, le contexte ou le cadre editorial." },
      { eyebrow: "CITATION", title: "Courtes citations avec source", copy: "Une courte citation est autorisee avec l'auteur lorsqu'il est indique, le nom Avangarda et un lien vers l'original. Elle ne doit pas changer le sens du texte." },
      { eyebrow: "VISUELS", title: "Photographies, video et illustrations", copy: "Les photographies, videos, illustrations et autres elements visuels ne peuvent pas etre repris, republies ou utilises commercialement sans autorisation, sauf mention contraire." },
      { eyebrow: "SOURCES", title: "Sources externes", copy: "Si un materiel vient d'une source externe, l'utilisateur doit respecter les droits de cette source. Lorsque possible, Avangarda indique source et auteur." },
      { eyebrow: "INTERDIT", title: "Pas de manipulation", copy: "Le contenu ne peut pas servir a manipuler, deformer le contexte, produire de la haine, cibler des personnes, tromper ou exploiter commercialement sans accord." },
      { eyebrow: "RESPONSABILITE", title: "Usage des informations", copy: "Avangarda publie informations, analyses et documents dans l'interet public; l'utilisateur reste responsable de leur interpretation et de leur usage." },
      { eyebrow: "DROITS", title: "Autorisations et mises a jour", copy: "Ces conditions peuvent etre mises a jour. Pour autorisation, republication, usage commercial ou question de droits, utilise la page contact." }
    ]
  },
  de: {
    label: "Nutzungsbedingungen",
    title: "Nutzungsregeln schuetzen Inhalte, Autorinnen und Autoren und Vertrauen.",
    intro:
      "Avangarda veroeffentlicht im oeffentlichen Interesse. Lies, teile und zitiere verantwortungsvoll: mit Quelle, Link und ohne Kontextbruch.",
    blocks: [
      { eyebrow: "NUTZUNG", title: "Lesen, Teilen und oeffentliches Interesse", copy: "Texte von Avangarda duerfen gelesen, geteilt und empfohlen werden. Beim Teilen duerfen Autor, Quelle, Datum, Kontext und redaktioneller Rahmen nicht entfernt werden." },
      { eyebrow: "ZITATE", title: "Kurze Zitate mit klarer Quelle", copy: "Kurze Zitate sind erlaubt, mit Autor falls genannt, Avangarda als Quelle und Link zum Original. Das Zitat darf Sinn und Haltung nicht verfälschen." },
      { eyebrow: "VISUELL", title: "Fotos, Video und Illustrationen", copy: "Fotos, Videos, Illustrationen und andere visuelle Elemente duerfen ohne Erlaubnis nicht uebernommen, neu veroeffentlicht oder kommerziell genutzt werden, sofern nichts anderes angegeben ist." },
      { eyebrow: "QUELLEN", title: "Externe Quellen", copy: "Bei Material aus externen Quellen muessen die Rechte der Originalquelle beachtet werden. Wenn verfuegbar, nennt Avangarda Quelle und Autor." },
      { eyebrow: "VERBOTEN", title: "Keine Manipulation", copy: "Inhalte duerfen nicht fuer Manipulation, Kontextverzerrung, Hassrede, gezieltes Angreifen, falsche Darstellung oder kommerzielle Ausbeutung ohne Erlaubnis genutzt werden." },
      { eyebrow: "VERANTWORTUNG", title: "Nutzung von Informationen", copy: "Avangarda veroeffentlicht Informationen, Analysen und dokumentarisches Material im oeffentlichen Interesse; Nutzer bleiben fuer Interpretation und Nutzung verantwortlich." },
      { eyebrow: "RECHTE", title: "Genehmigungen und Updates", copy: "Diese Bedingungen koennen aktualisiert werden. Fuer Genehmigungen, Nachveroeffentlichung, kommerzielle Nutzung oder Rechtsfragen nutze die Kontaktseite." }
    ]
  },
  es: {
    label: "Terminos de uso",
    title: "Las reglas de uso protegen el contenido, las autorias y la confianza.",
    intro:
      "Avangarda publica en interes publico. Lee, comparte y cita con responsabilidad: con fuente, enlace y sin distorsionar el contexto.",
    blocks: [
      { eyebrow: "USO", title: "Lectura, difusion e interes publico", copy: "Los textos de Avangarda pueden leerse, compartirse y recomendarse. Al compartir, no se debe borrar autoria, fuente, fecha, contexto ni el marco editorial." },
      { eyebrow: "CITAS", title: "Citas breves con fuente clara", copy: "Se permiten citas breves con autora o autor cuando conste, Avangarda como fuente y enlace al original. La cita no debe cambiar el sentido ni tergiversar la posicion editorial." },
      { eyebrow: "VISUALES", title: "Fotografias, video e ilustraciones", copy: "Fotografias, videos, ilustraciones y otros elementos visuales no pueden descargarse, republicarse ni usarse comercialmente sin permiso, salvo indicacion contraria." },
      { eyebrow: "FUENTES", title: "Fuentes externas", copy: "Si el material se vincula con una fuente externa, deben respetarse sus derechos. Cuando es posible, Avangarda indica fuente y autoria." },
      { eyebrow: "PROHIBIDO", title: "Sin manipulacion ni abuso", copy: "El contenido no puede usarse para manipular, sacar de contexto, incitar odio, atacar personas, simular otra autoria o explotar comercialmente sin permiso." },
      { eyebrow: "RESPONSABILIDAD", title: "Uso de la informacion", copy: "Avangarda publica informacion, analisis y materiales documentales en interes publico; cada usuario responde por su interpretacion y uso." },
      { eyebrow: "DERECHOS", title: "Permisos y cambios", copy: "Estos terminos pueden actualizarse. Para permisos, republicacion, uso comercial o dudas de derechos, usa la pagina de contacto." }
    ]
  },
  el: {
    label: "Όροι χρήσης",
    title: "Οι κανόνες χρήσης προστατεύουν το περιεχόμενο, τους δημιουργούς και την εμπιστοσύνη.",
    intro:
      "Η Avangarda δημοσιεύει για το δημόσιο συμφέρον. Διάβασε, μοιράσου και παράθεσε υπεύθυνα: με πηγή, σύνδεσμο και χωρίς παραμόρφωση του πλαισίου.",
    blocks: [
      { eyebrow: "ΧΡΗΣΗ", title: "Ανάγνωση, κοινοποίηση και δημόσιο συμφέρον", copy: "Τα κείμενα της Avangarda μπορούν να διαβάζονται, να κοινοποιούνται και να προτείνονται. Η κοινοποίηση δεν πρέπει να αφαιρεί συγγραφέα, πηγή, ημερομηνία, πλαίσιο ή συντακτικό χαρακτήρα." },
      { eyebrow: "ΠΑΡΑΘΕΣΗ", title: "Σύντομες παραθέσεις με πηγή", copy: "Επιτρέπεται σύντομη παράθεση με συγγραφέα όπου υπάρχει, την Avangarda ως πηγή και σύνδεσμο στο πρωτότυπο. Η παράθεση δεν πρέπει να αλλάζει το νόημα." },
      { eyebrow: "ΟΠΤΙΚΑ", title: "Φωτογραφίες, βίντεο και εικόνες", copy: "Φωτογραφίες, βίντεο, εικονογραφήσεις και άλλα οπτικά στοιχεία δεν μπορούν να αναδημοσιευθούν ή να χρησιμοποιηθούν εμπορικά χωρίς άδεια, εκτός αν αναφέρεται αλλιώς." },
      { eyebrow: "ΠΗΓΕΣ", title: "Εξωτερικές πηγές", copy: "Αν υλικό συνδέεται με εξωτερική πηγή, πρέπει να τηρούνται τα δικαιώματα της αρχικής πηγής. Όπου είναι διαθέσιμο, η Avangarda αναφέρει πηγή και δημιουργό." },
      { eyebrow: "ΑΠΑΓΟΡΕΥΣΗ", title: "Όχι χειραγώγηση", copy: "Το περιεχόμενο δεν μπορεί να χρησιμοποιηθεί για παραποίηση πλαισίου, μίσος, στοχοποίηση, ψευδή παρουσίαση ή εμπορική εκμετάλλευση χωρίς άδεια." },
      { eyebrow: "ΕΥΘΥΝΗ", title: "Χρήση πληροφοριών", copy: "Η Avangarda δημοσιεύει πληροφορίες, αναλύσεις και τεκμήρια για το δημόσιο συμφέρον· ο χρήστης ευθύνεται για την ερμηνεία και χρήση τους." },
      { eyebrow: "ΔΙΚΑΙΩΜΑΤΑ", title: "Άδειες και αλλαγές", copy: "Οι όροι μπορούν να ενημερώνονται. Για άδειες, αναδημοσίευση, εμπορική χρήση ή ζητήματα δικαιωμάτων χρησιμοποίησε τη σελίδα επικοινωνίας." }
    ]
  },
  ar: {
    label: "شروط الاستخدام",
    title: "قواعد الاستخدام تحمي المحتوى والكتاب والثقة.",
    intro:
      "تنشر أفانغاردا في المصلحة العامة. اقرأ وشارك واقتبس بمسؤولية: مع المصدر والرابط ومن دون تشويه السياق.",
    blocks: [
      { eyebrow: "الاستخدام", title: "القراءة والمشاركة والمصلحة العامة", copy: "يمكن قراءة نصوص أفانغاردا ومشاركتها والتوصية بها. لا يجوز أن تزيل المشاركة اسم الكاتب أو المصدر أو التاريخ أو السياق أو الإطار التحريري." },
      { eyebrow: "الاقتباس", title: "اقتباس قصير مع مصدر واضح", copy: "يسمح بالاقتباس القصير مع ذكر الكاتب عندما يكون مذكورا، واسم أفانغاردا، ورابط النص الأصلي. لا يجوز للاقتباس أن يغير المعنى أو يسيء تمثيل موقف التحرير." },
      { eyebrow: "المرئي", title: "الصور والفيديو والرسوم", copy: "لا يجوز تحميل الصور والفيديو والرسوم والعناصر المرئية أو إعادة نشرها أو استخدامها تجاريا من دون إذن، ما لم يذكر خلاف ذلك بوضوح." },
      { eyebrow: "المصادر", title: "مصادر خارجية وحقوق أخرى", copy: "إذا ارتبطت المادة بمصدر خارجي، يجب احترام حقوق المصدر الأصلي. عندما تتوفر المعلومات تذكر أفانغاردا المصدر والكاتب." },
      { eyebrow: "محظور", title: "لا للتلاعب أو الإساءة", copy: "لا يجوز استخدام المحتوى للتلاعب أو إخراج الكلام من سياقه أو خطاب الكراهية أو استهداف الأشخاص أو التمثيل الكاذب أو الاستغلال التجاري بلا إذن." },
      { eyebrow: "المسؤولية", title: "استخدام المعلومات", copy: "تنشر أفانغاردا معلومات وتحليلات ومواد وثائقية في المصلحة العامة، لكن المستخدم مسؤول عن طريقة تفسيرها ونقلها واستخدامها." },
      { eyebrow: "الحقوق", title: "الأذونات والتحديثات", copy: "يمكن تحديث هذه الشروط مع تطور الموقع. للأذونات أو إعادة النشر أو الاستخدام التجاري أو مسائل الحقوق استخدم صفحة الاتصال." }
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
    pathname: "/terms-of-use",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function TermsOfUsePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/terms-of-use" copy={copy[lang]} />;
}
