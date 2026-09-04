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
    label: "Politika kolačića",
    title: "Politika kolačića treba da bude jasna, ne sakrivena u fusnoti.",
    intro:
      "Avangarda trenutno koristi samo neophodne tehničke mehanizme za rad sajta, jezik, temu i lokalne UX izbore. Ne uvodimo praćenje bez jasne potrebe i obaveštenja.",
    blocks: [
      {
        eyebrow: "KOLAČIĆI",
        title: "Šta su kolačići i lokalna memorija",
        copy:
          "Kolačići i lokalna memorija su mali zapisi u pregledaču koji pomažu sajtu da zapamti osnovne postavke. Oni ne smeju biti skriven način za praćenje korisnika."
      },
      {
        eyebrow: "TRENUTNO",
        title: "Šta Avangarda sada koristi",
        copy:
          "Sajt čuva izbor jezika kroz neophodan jezički kolačić i može koristiti localStorage za temu prikaza, lokalne UX izbore, dnevno pitanje i ograničavanje ponovnog brojanja pregleda članka."
      },
      {
        eyebrow: "NEOPHODNO",
        title: "Neophodni mehanizmi",
        copy:
          "Neophodni zapisi omogućavaju da se stranica otvori na izabranom jeziku, da tema ostane zapamćena i da osnovni interfejs radi predvidljivo. Bez njih iskustvo bi bilo lošije, ali oni nisu marketinški alat."
      },
      {
        eyebrow: "ANALITIKA",
        title: "Analitički kolačići nisu aktivirani ovde",
        copy:
          "Ne dodajemo Google Analytics, Meta Pixel ili slično praćenje. Ako analitika bude uvedena, ova stranica će navesti alat, svrhu, period čuvanja i način saglasnosti pre nego što se koristi praćenje koje nije neophodno."
      },
      {
        eyebrow: "NEWSLETTER",
        title: "Newsletter i forme",
        copy:
          "Newsletter ili forme mogu koristiti podatke koje korisnik sam pošalje. To nije isto što i skriveno praćenje. Kada newsletter bude aktivan, uslovi prijave i odjave moraju biti jasno napisani."
      },
      {
        eyebrow: "PODEŠAVANJA",
        title: "Kako korisnik kontroliše zapise",
        copy:
          "Korisnik može obrisati kolačiće i localStorage kroz podešavanja pregledača. Ako kasnije bude dodat panel za podešavanja, on mora raditi pre učitavanja neobaveznih alata."
      },
      {
        eyebrow: "SAGLASNOST",
        title: "Zašto nema agresivnog bannera",
        copy:
          "Pošto trenutno nema neobaveznih marketinških ili analitičkih kolačića, ne uvodimo veliki CMP banner koji bi samo smetao. Ako se neobavezni alati dodaju, tražiće se jasan pristanak."
      },
      {
        eyebrow: "AŽURIRANJE",
        title: "Kada se politika menja",
        copy:
          "Ova stranica će biti ažurirana ako se uvedu novi alati, analitika, newsletter tokovi ili dodatna podešavanja kolačića."
      }
    ]
  },
  en: {
    label: "Cookie policy",
    title: "A cookie policy should be clear, not hidden in a footnote.",
    intro:
      "Avangarda currently uses only necessary technical mechanisms for the site, language, theme and local UX choices. We do not add tracking without a clear need and notice.",
    blocks: [
      { eyebrow: "COOKIES", title: "What cookies and local storage are", copy: "Cookies and local storage are small browser records that help a site remember basic settings. They should not become a hidden way to track users." },
      { eyebrow: "CURRENT", title: "What Avangarda uses now", copy: "The site stores the language choice through a necessary language cookie and may use localStorage for the visual theme, local UX choices, the daily question and limiting repeated article-view counting." },
      { eyebrow: "NECESSARY", title: "Necessary mechanisms", copy: "Necessary records allow pages to open in the selected language, keep the chosen theme and make the interface behave predictably. They are not advertising tools." },
      { eyebrow: "ANALYTICS", title: "Analytics cookies are not active here", copy: "This policy does not add Google Analytics, Meta Pixel or similar tracking. If analytics are introduced, this page will state the tool, purpose, retention period and consent model before non-essential tracking is used." },
      { eyebrow: "NEWSLETTER", title: "Newsletter and forms", copy: "Newsletter and forms may use data a user sends voluntarily. That is not the same as hidden tracking. When a newsletter is active, signup and unsubscribe rules must be clear." },
      { eyebrow: "SETTINGS", title: "How users control records", copy: "Users can remove cookies and localStorage through browser settings. If a preference panel is added later, it must work before optional tools load." },
      { eyebrow: "CONSENT", title: "Why there is no aggressive banner", copy: "Because there are currently no optional marketing or analytics cookies, we do not add a large CMP banner that would only get in the way. If optional tools are added, clear consent will be required." },
      { eyebrow: "UPDATES", title: "When this policy changes", copy: "This page will be updated if new tools, analytics, newsletter flows or additional cookie preferences are introduced." }
    ]
  },
  tr: {
    label: "Cerez politikasi",
    title: "Cerez politikasi acik olmali, dipnotta saklanmamali.",
    intro:
      "Avangarda su anda yalnizca site, dil, tema ve yerel UX tercihleri icin gerekli teknik mekanizmalari kullanir. Acik gerekce ve bildirim olmadan tracking eklemeyiz.",
    blocks: [
      { eyebrow: "CEREZLER", title: "Cerez ve yerel hafiza nedir", copy: "Cerezler ve localStorage, tarayicida tutulan kucuk kayitlardir. Temel ayarlari hatirlatir; gizli takip aracina donusmemelidir." },
      { eyebrow: "MEVCUT", title: "Avangarda su anda ne kullanir", copy: "Site dil secimini gerekli language cookie ile saklar; tema, yerel UX tercihleri, gunluk soru ve makale goruntuleme tekrarini sinirlama icin localStorage kullanabilir." },
      { eyebrow: "GEREKLI", title: "Zorunlu mekanizmalar", copy: "Bu kayitlar sayfayi secilen dilde acmaya, tema tercihlerini korumaya ve arayuzu duzenli calistirmaya yarar. Reklam araci degildir." },
      { eyebrow: "ANALITIK", title: "Analitik cerezler burada aktif degil", copy: "Bu politika Google Analytics, Meta Pixel veya benzer tracking eklemez. Analitik gelirse arac, amac, saklama suresi ve onay modeli once burada yazilacaktir." },
      { eyebrow: "NEWSLETTER", title: "Newsletter ve formlar", copy: "Newsletter veya formlar kullanicinin kendi gonderdigi verileri kullanabilir. Bu gizli takip degildir. Newsletter aktif oldugunda kayit ve cikis kurallari acik olmalidir." },
      { eyebrow: "AYARLAR", title: "Kullanici nasil kontrol eder", copy: "Kullanici cerezleri ve localStorage kayitlarini tarayici ayarlarindan silebilir. Sonra tercih paneli eklenirse, opsiyonel araclar yuklenmeden once calismalidir." },
      { eyebrow: "ONAY", title: "Neden agresif banner yok", copy: "Su anda opsiyonel pazarlama veya analitik cerezleri olmadigi icin buyuk bir CMP banner eklemiyoruz. Opsiyonel arac eklenirse acik onay gerekecek." },
      { eyebrow: "GUNCELLEME", title: "Politika ne zaman degisir", copy: "Yeni araclar, analitik, newsletter akislari veya ek cerez tercihleri gelirse bu sayfa guncellenecektir." }
    ]
  },
  fr: {
    label: "Politique des cookies",
    title: "Une politique des cookies doit etre claire, pas cachee en note.",
    intro:
      "Avangarda utilise actuellement seulement des mecanismes techniques necessaires au site, a la langue, au theme et aux choix UX locaux. Pas de tracking sans besoin clair et information.",
    blocks: [
      { eyebrow: "COOKIES", title: "Ce que sont cookies et stockage local", copy: "Les cookies et le stockage local sont de petits enregistrements dans le navigateur. Ils gardent des reglages de base et ne doivent pas devenir un suivi cache." },
      { eyebrow: "ACTUEL", title: "Ce qu'Avangarda utilise maintenant", copy: "Le site stocke la langue via un cookie necessaire et peut utiliser localStorage pour le theme, certains choix UX, la question du jour et la limitation du comptage repete des vues d'article." },
      { eyebrow: "NECESSAIRE", title: "Mecanismes indispensables", copy: "Ces enregistrements ouvrent les pages dans la bonne langue, conservent le theme et stabilisent l'interface. Ce ne sont pas des outils publicitaires." },
      { eyebrow: "ANALYSE", title: "Pas de cookies analytiques actifs ici", copy: "Cette politique n'ajoute pas Google Analytics, Meta Pixel ou suivi similaire. Si une analytique est introduite, l'outil, le but, la duree et le consentement seront indiques avant usage non essentiel." },
      { eyebrow: "NEWSLETTER", title: "Newsletter et formulaires", copy: "La newsletter et les formulaires peuvent utiliser les donnees envoyees volontairement. Ce n'est pas un suivi cache. Les regles d'inscription et de desinscription devront etre claires." },
      { eyebrow: "REGLAGES", title: "Controle par l'utilisateur", copy: "L'utilisateur peut supprimer cookies et localStorage dans le navigateur. Si un panneau de preferences arrive, il devra agir avant le chargement d'outils optionnels." },
      { eyebrow: "CONSENTEMENT", title: "Pourquoi il n'y a pas de grand bandeau", copy: "Comme il n'y a pas actuellement de cookies marketing ou analytiques optionnels, nous n'ajoutons pas de grand CMP inutile. Des outils optionnels exigeraient un consentement clair." },
      { eyebrow: "MISE A JOUR", title: "Quand la politique change", copy: "Cette page sera mise a jour si de nouveaux outils, flux newsletter, analyses ou preferences cookies sont introduits." }
    ]
  },
  de: {
    label: "Cookie-Richtlinie",
    title: "Eine Cookie-Richtlinie sollte klar sein und nicht im Kleingedruckten verschwinden.",
    intro:
      "Avangarda nutzt derzeit nur notwendige technische Mechanismen fuer Website, Sprache, Theme und lokale UX-Entscheidungen. Tracking wird nicht ohne klaren Bedarf und Hinweis hinzugefuegt.",
    blocks: [
      { eyebrow: "COOKIES", title: "Was Cookies und lokale Speicherung sind", copy: "Cookies und localStorage sind kleine Eintraege im Browser. Sie merken Grundfunktionen und duerfen kein verstecktes Tracking werden." },
      { eyebrow: "AKTUELL", title: "Was Avangarda jetzt nutzt", copy: "Die Seite speichert die Sprachwahl ueber ein notwendiges Language-Cookie und kann localStorage fuer Theme, lokale UX-Auswahl, Tagesfrage und Begrenzung wiederholter Artikelaufrufe nutzen." },
      { eyebrow: "NOTWENDIG", title: "Notwendige Mechanismen", copy: "Diese Eintraege oeffnen Seiten in der gewaehlten Sprache, behalten das Theme und machen die Oberflaeche vorhersehbar. Sie sind keine Werbewerkzeuge." },
      { eyebrow: "ANALYTIK", title: "Analyse-Cookies sind hier nicht aktiv", copy: "Diese Richtlinie fuegt kein Google Analytics, Meta Pixel oder aehnliches Tracking hinzu. Falls Analytik kommt, werden Werkzeug, Zweck, Speicherfrist und Einwilligung vorher genannt." },
      { eyebrow: "NEWSLETTER", title: "Newsletter und Formulare", copy: "Newsletter und Formulare koennen Daten nutzen, die Nutzer selbst senden. Das ist kein verstecktes Tracking. Anmeldung und Abmeldung muessen klar sein." },
      { eyebrow: "EINSTELLUNG", title: "Kontrolle durch Nutzer", copy: "Cookies und localStorage koennen im Browser geloescht werden. Ein spaeteres Preference-Panel muss greifen, bevor optionale Tools laden." },
      { eyebrow: "EINWILLIGUNG", title: "Warum es kein aggressives Banner gibt", copy: "Da derzeit keine optionalen Marketing- oder Analyse-Cookies aktiv sind, gibt es kein grosses CMP-Banner. Optionale Tools wuerden klare Einwilligung brauchen." },
      { eyebrow: "UPDATE", title: "Wann sich diese Richtlinie aendert", copy: "Diese Seite wird aktualisiert, wenn neue Tools, Analytik, Newsletter-Flows oder Cookie-Praeferenzen hinzukommen." }
    ]
  },
  es: {
    label: "Politica de cookies",
    title: "Una politica de cookies debe ser clara, no esconderse en una nota al pie.",
    intro:
      "Avangarda usa actualmente solo mecanismos tecnicos necesarios para el sitio, idioma, tema y opciones locales de UX. No incorporamos tracking sin necesidad clara y aviso.",
    blocks: [
      { eyebrow: "COOKIES", title: "Que son cookies y almacenamiento local", copy: "Las cookies y localStorage son pequenos registros en el navegador que recuerdan ajustes basicos. No deben convertirse en seguimiento oculto." },
      { eyebrow: "ACTUAL", title: "Que usa Avangarda ahora", copy: "El sitio guarda el idioma mediante una cookie necesaria y puede usar localStorage para tema, opciones UX, pregunta diaria y limitar recuentos repetidos de vistas de articulos." },
      { eyebrow: "NECESARIO", title: "Mecanismos necesarios", copy: "Estos registros permiten abrir paginas en el idioma elegido, conservar el tema y hacer que la interfaz funcione de forma estable. No son herramientas publicitarias." },
      { eyebrow: "ANALITICA", title: "No hay cookies analiticas activas aqui", copy: "Esta politica no anade Google Analytics, Meta Pixel ni tracking similar. Si se introduce analitica, se indicara herramienta, finalidad, conservacion y consentimiento antes de usar seguimiento no esencial." },
      { eyebrow: "NEWSLETTER", title: "Newsletter y formularios", copy: "Newsletter y formularios pueden usar datos que la persona envia voluntariamente. No es seguimiento oculto. Las reglas de alta y baja deben ser claras." },
      { eyebrow: "AJUSTES", title: "Control del usuario", copy: "El usuario puede borrar cookies y localStorage desde el navegador. Si luego hay panel de preferencias, debe actuar antes de cargar herramientas opcionales." },
      { eyebrow: "CONSENTIMIENTO", title: "Por que no hay banner agresivo", copy: "Como no hay cookies opcionales de marketing o analitica, no anadimos un gran banner CMP inutil. Las herramientas opcionales requeriran consentimiento claro." },
      { eyebrow: "ACTUALIZACION", title: "Cuando cambia esta politica", copy: "Esta pagina se actualizara si se introducen nuevas herramientas, analitica, newsletter o preferencias de cookies." }
    ]
  },
  el: {
    label: "Πολιτική cookies",
    title: "Η πολιτική cookies πρέπει να είναι σαφής, όχι κρυμμένη σε υποσημείωση.",
    intro:
      "Η Avangarda χρησιμοποιεί τώρα μόνο απαραίτητους τεχνικούς μηχανισμούς για τον ιστότοπο, τη γλώσσα, το θέμα και τοπικές επιλογές UX. Δεν προσθέτουμε tracking χωρίς σαφή ανάγκη και ενημέρωση.",
    blocks: [
      { eyebrow: "COOKIES", title: "Τι είναι cookies και τοπική αποθήκευση", copy: "Τα cookies και το localStorage είναι μικρές εγγραφές στον browser που θυμούνται βασικές ρυθμίσεις. Δεν πρέπει να γίνονται κρυφό εργαλείο παρακολούθησης." },
      { eyebrow: "ΤΩΡΑ", title: "Τι χρησιμοποιεί η Avangarda τώρα", copy: "Ο ιστότοπος κρατά τη γλώσσα με απαραίτητο cookie και μπορεί να χρησιμοποιεί localStorage για θέμα, επιλογές UX, ημερήσια ερώτηση και περιορισμό επαναλαμβανόμενης μέτρησης προβολών άρθρου." },
      { eyebrow: "ΑΠΑΡΑΙΤΗΤΑ", title: "Απαραίτητοι μηχανισμοί", copy: "Αυτές οι εγγραφές ανοίγουν τις σελίδες στη σωστή γλώσσα, κρατούν το θέμα και κάνουν τη διεπαφή προβλέψιμη. Δεν είναι διαφημιστικά εργαλεία." },
      { eyebrow: "ΑΝΑΛΥΤΙΚΑ", title: "Δεν υπάρχουν ενεργά analytics cookies εδώ", copy: "Η πολιτική δεν προσθέτει Google Analytics, Meta Pixel ή παρόμοιο tracking. Αν εισαχθούν αναλυτικά, θα αναφερθούν εργαλείο, σκοπός, διάρκεια και συγκατάθεση." },
      { eyebrow: "NEWSLETTER", title: "Newsletter και φόρμες", copy: "Newsletter και φόρμες μπορούν να χρησιμοποιούν δεδομένα που στέλνει ο χρήστης. Αυτό δεν είναι κρυφή παρακολούθηση. Η εγγραφή και διαγραφή πρέπει να είναι σαφείς." },
      { eyebrow: "ΡΥΘΜΙΣΕΙΣ", title: "Έλεγχος από τον χρήστη", copy: "Ο χρήστης μπορεί να διαγράψει cookies και localStorage από τον browser. Αν προστεθεί panel προτιμήσεων, πρέπει να λειτουργεί πριν φορτωθούν προαιρετικά εργαλεία." },
      { eyebrow: "ΣΥΓΚΑΤΑΘΕΣΗ", title: "Γιατί δεν υπάρχει επιθετικό banner", copy: "Αφού δεν υπάρχουν τώρα προαιρετικά marketing ή analytics cookies, δεν προσθέτουμε μεγάλο CMP banner. Προαιρετικά εργαλεία θα απαιτούν σαφή συγκατάθεση." },
      { eyebrow: "ΕΝΗΜΕΡΩΣΗ", title: "Πότε αλλάζει η πολιτική", copy: "Η σελίδα θα ενημερωθεί αν προστεθούν νέα εργαλεία, αναλυτικά, newsletter ή προτιμήσεις cookies." }
    ]
  },
  ar: {
    label: "سياسة الكوكيز",
    title: "يجب أن تكون سياسة الكوكيز واضحة، لا مخفية في هامش صغير.",
    intro:
      "تستخدم أفانغاردا حاليا آليات تقنية ضرورية فقط لعمل الموقع واللغة والمظهر وخيارات تجربة الاستخدام المحلية. لا نضيف تتبعا بلا حاجة واضحة وإشعار.",
    blocks: [
      { eyebrow: "الكوكيز", title: "ما هي الكوكيز والتخزين المحلي", copy: "الكوكيز و localStorage سجلات صغيرة في المتصفح تساعد الموقع على تذكر الإعدادات الأساسية. لا يجب أن تتحول إلى طريقة مخفية لتتبع المستخدم." },
      { eyebrow: "حاليا", title: "ما الذي تستخدمه أفانغاردا الآن", copy: "يحفظ الموقع اختيار اللغة عبر cookie ضروري، وقد يستخدم localStorage للمظهر، وبعض خيارات التجربة، والسؤال اليومي، والحد من تكرار عد مشاهدات المقال." },
      { eyebrow: "ضروري", title: "الآليات الضرورية", copy: "هذه السجلات تسمح بفتح الصفحات باللغة المختارة، وحفظ المظهر، وجعل الواجهة تعمل بشكل متوقع. ليست أدوات إعلانية." },
      { eyebrow: "التحليلات", title: "كوكيز التحليلات غير مفعلة هنا", copy: "هذه السياسة لا تضيف Google Analytics أو Meta Pixel أو تتبعا مشابها. إذا أضيفت التحليلات فستذكر الصفحة الأداة والغرض ومدة الحفظ وآلية الموافقة." },
      { eyebrow: "النشرة", title: "النشرة والنماذج", copy: "قد تستخدم النشرة والنماذج البيانات التي يرسلها المستخدم طوعا. هذا ليس تتبعا مخفيا. يجب أن تكون قواعد الاشتراك والإلغاء واضحة." },
      { eyebrow: "الإعدادات", title: "تحكم المستخدم", copy: "يمكن للمستخدم حذف الكوكيز و localStorage من إعدادات المتصفح. إذا أضيفت لوحة تفضيلات لاحقا فيجب أن تعمل قبل تحميل الأدوات الاختيارية." },
      { eyebrow: "الموافقة", title: "لماذا لا يوجد banner مزعج", copy: "بما أنه لا توجد حاليا كوكيز تسويق أو تحليلات اختيارية، لا نضيف CMP كبيرا بلا حاجة. الأدوات الاختيارية ستتطلب موافقة واضحة." },
      { eyebrow: "تحديث", title: "متى تتغير السياسة", copy: "سيتم تحديث هذه الصفحة إذا أضيفت أدوات جديدة أو تحليلات أو تدفقات للنشرة أو تفضيلات إضافية للكوكيز." }
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
    pathname: "/cookie-policy",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function CookiePolicyPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/cookie-policy" copy={copy[lang]} />;
}
