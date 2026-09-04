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
    label: "Politika privatnosti",
    title: "Privatnost nije fusnota, već deo poverenja između sajta i čitaoca.",
    intro:
      "Ova stranica objašnjava koje podatke Avangarda može da obrađuje, zašto ih čuva i kako korisnik može da traži pristup, ispravku ili brisanje.",
    blocks: [
      {
        eyebrow: "PODACI",
        title: "Ko smo mi i koje podatke vidimo",
        copy:
          "Avangarda je urednička platforma za tekstove, analize, ljudska prava, dokumentarne sadržaje i javni interes. Sajt može obrađivati tehničke podatke potrebne za rad stranice, jezik i temu prikaza, podatke koje korisnik sam pošalje kroz kontakt formu ili formu za Saradnju, email za newsletter ako se korisnik prijavi, kao i komunikaciju poslatu redakciji."
      },
      {
        eyebrow: "SVRHA",
        title: "Zašto obrada postoji",
        copy:
          "Podaci se koriste za funkcionisanje sajta, komunikaciju sa čitaocima, obradu predloga priča i saradnje, bezbednost sistema, newsletter samo uz pristanak i razumevanje posete sajtu ako analitika bude uključena."
      },
      {
        eyebrow: "NEWSLETTER",
        title: "Email i prijava",
        copy:
          "Ako se prijaviš na newsletter, email se koristi za slanje izdanja i uredničkih obaveštenja za koja si dao saglasnost. Odjava mora ostati moguća i jasna kada newsletter bude aktivan."
      },
      {
        eyebrow: "FORME",
        title: "Kontakt i saradnja",
        copy:
          "Slanje poruke, dokumenta ili predloga kroz kontakt formu ili formu za Saradnju ne znači automatsku objavu. Redakcija može koristiti poslati materijal samo za procenu, proveru i komunikaciju sa pošiljaocem."
      },
      {
        eyebrow: "ANALITIKA",
        title: "Merenje posete",
        copy:
          "Ne tvrdimo da koristimo analitički alat koji nije uključen. Ako analitika bude aktivirana, ova stranica će navesti koji alat se koristi, koje podatke prima i kako se poštuje saglasnost korisnika."
      },
      {
        eyebrow: "KOLAČIĆI",
        title: "Kolačići i lokalna podešavanja",
        copy:
          "Sajt koristi neophodne tehničke mehanizme za jezik, temu i osnovno funkcionisanje. Detalji o tome šta se čuva u pregledaču nalaze se na stranici Politika kolačića."
      },
      {
        eyebrow: "PRAVA",
        title: "Prava korisnika i čuvanje",
        copy:
          "Podaci se ne prodaju oglašivačima i ne dele nepotrebno. Čuvaju se onoliko koliko je potrebno za svrhu za koju su poslati. Gde je primenljivo, korisnik može tražiti pristup, ispravku, brisanje ili povlačenje saglasnosti."
      },
      {
        eyebrow: "KONTAKT",
        title: "Ažuriranje ove politike",
        copy:
          "Ova stranica će biti ažurirana u skladu sa razvojem sajta, newslettera, analitike i komunikacionih kanala. Za pitanja o privatnosti koristi kontakt stranicu."
      }
    ]
  },
  en: {
    label: "Privacy policy",
    title: "Privacy is not a footnote. It is part of the trust between the site and the reader.",
    intro:
      "This page explains what data Avangarda may process, why it is kept, and how a user may request access, correction or deletion.",
    blocks: [
      {
        eyebrow: "DATA",
        title: "Who we are and what we may see",
        copy:
          "Avangarda is an editorial platform for reporting, analysis, human rights, documentary work and public-interest material. The site may process technical data needed for the interface, language and theme choices, data a user sends through contact or contribution forms, an email address for newsletter signup, and messages sent to the editorial team."
      },
      {
        eyebrow: "PURPOSE",
        title: "Why processing exists",
        copy:
          "Data is used to run the site, communicate with readers, review story and collaboration proposals, keep the system secure, send a newsletter only after consent, and understand site visits if analytics are enabled."
      },
      {
        eyebrow: "NEWSLETTER",
        title: "Email and consent",
        copy:
          "If you subscribe to a newsletter, your email is used for the editions and editorial notices you agreed to receive. Unsubscribing must remain clear and available when the newsletter is active."
      },
      {
        eyebrow: "FORMS",
        title: "Contact and contribution",
        copy:
          "Sending a message, document or proposal through a form does not mean automatic publication. The newsroom may use submitted material only for review, verification and communication with the sender."
      },
      {
        eyebrow: "ANALYTICS",
        title: "Measuring visits",
        copy:
          "We do not claim to use an analytics tool that is not active. If analytics are enabled, this page will state which tool is used, what data it receives and how consent is handled."
      },
      {
        eyebrow: "COOKIES",
        title: "Cookies and local settings",
        copy:
          "The site uses necessary technical mechanisms for language, theme and basic operation. Details about what is stored in the browser are listed on the Cookie policy page."
      },
      {
        eyebrow: "RIGHTS",
        title: "User rights and retention",
        copy:
          "Data is not sold to advertisers and is not shared unnecessarily. It is kept only as long as needed for the purpose for which it was sent. Where applicable, users may request access, correction, deletion or withdrawal of consent."
      },
      {
        eyebrow: "CONTACT",
        title: "Updates to this policy",
        copy:
          "This page will be updated as the site, newsletter, analytics and communication channels develop. For privacy questions, use the contact page."
      }
    ]
  },
  tr: {
    label: "Gizlilik politikasi",
    title: "Gizlilik dipnot degildir; site ile okur arasindaki guvenin parcasidir.",
    intro:
      "Bu sayfa Avangarda'nin hangi verileri isleyebilecegini, neden tuttugunu ve kullanicinin erisim, duzeltme veya silme talebini nasil iletebilecegini aciklar.",
    blocks: [
      { eyebrow: "VERI", title: "Biz kimiz ve ne gorebiliriz", copy: "Avangarda haber, analiz, insan haklari, belgesel icerik ve kamu yarari icin calisan editoryal bir platformdur. Site arayuzun calismasi, dil ve tema secimi, kullanicinin iletisim veya katki formlarina yazdigi bilgiler, newsletter icin email ve redaksiyona gonderilen mesajlari isleyebilir." },
      { eyebrow: "AMAC", title: "Isleme nedenleri", copy: "Veriler siteyi calistirmak, okurlarla iletisim kurmak, hikaye ve is birligi onerilerini incelemek, guvenligi saglamak, yalnizca izinle newsletter gondermek ve analitik acilirsa site ziyaretlerini anlamak icin kullanilir." },
      { eyebrow: "NEWSLETTER", title: "Email ve onay", copy: "Newsletter'a kaydolursan email adresin yalnizca kabul ettigin bultenler ve editoryal bildirimler icin kullanilir. Newsletter aktif oldugunda abonelikten cikis acik olmalidir." },
      { eyebrow: "FORMLAR", title: "Iletisim ve katki", copy: "Formla mesaj, belge veya oneri gondermek otomatik yayin anlamina gelmez. Redaksiyon gonderilen materyali degerlendirme, dogrulama ve gonderenle iletisim icin kullanabilir." },
      { eyebrow: "ANALITIK", title: "Ziyaret olcumu", copy: "Aktif olmayan bir analiz aracini kullandigimizi soylemeyiz. Analitik acilirsa hangi aracin kullanildigi, hangi verileri aldigi ve onayin nasil isledigi burada yazilacaktir." },
      { eyebrow: "CEREZLER", title: "Cerezler ve yerel ayarlar", copy: "Site dil, tema ve temel isleyis icin gerekli teknik mekanizmalari kullanir. Tarayicida ne saklandigi Cookie policy sayfasinda aciklanir." },
      { eyebrow: "HAKLAR", title: "Kullanici haklari", copy: "Veriler reklamcilara satilmaz ve gereksiz yere paylasilmaz. Gonderilme amaci icin gerekli oldugu surece saklanir. Uygun durumlarda kullanici erisim, duzeltme, silme veya onayi geri cekme talep edebilir." },
      { eyebrow: "ILETISIM", title: "Guncellemeler", copy: "Bu sayfa site, newsletter, analitik ve iletisim kanallari gelistikce guncellenecektir. Gizlilik sorulari icin iletisim sayfasini kullan." }
    ]
  },
  fr: {
    label: "Politique de confidentialite",
    title: "La confidentialite n'est pas une note. Elle fait partie de la confiance avec le lecteur.",
    intro:
      "Cette page explique quelles donnees Avangarda peut traiter, pourquoi elles sont conservees et comment demander acces, correction ou suppression.",
    blocks: [
      { eyebrow: "DONNEES", title: "Qui nous sommes", copy: "Avangarda est une plateforme editoriale pour les textes, analyses, droits humains, documentaires et contenus d'interet public. Le site peut traiter les donnees techniques necessaires, les choix de langue et de theme, les donnees envoyees par formulaire, une adresse email pour la newsletter et les messages transmis a la redaction." },
      { eyebrow: "FINALITE", title: "Pourquoi ces traitements existent", copy: "Les donnees servent au fonctionnement du site, a la communication, a l'examen des propositions de recits ou de collaboration, a la securite, a la newsletter avec consentement et a la comprehension des visites si une analytique est activee." },
      { eyebrow: "NEWSLETTER", title: "Email et accord", copy: "Si tu t'inscris a une newsletter, l'email sert uniquement aux editions et informations editoriales acceptees. Le desabonnement devra rester clair lorsque ce flux sera actif." },
      { eyebrow: "FORMULAIRES", title: "Contact et contribution", copy: "Envoyer un message, un document ou une proposition ne signifie pas publication automatique. La redaction peut utiliser le contenu pour examen, verification et contact avec l'expediteur." },
      { eyebrow: "ANALYSE", title: "Mesure de visite", copy: "Nous ne declarons pas utiliser un outil analytique qui n'est pas actif. Si une analyse est activee, cette page indiquera l'outil, les donnees recues et la gestion du consentement." },
      { eyebrow: "COOKIES", title: "Cookies et reglages", copy: "Le site utilise les mecanismes techniques necessaires pour la langue, le theme et le fonctionnement de base. La page Cookie policy explique ce qui est stocke dans le navigateur." },
      { eyebrow: "DROITS", title: "Droits et conservation", copy: "Les donnees ne sont pas vendues aux annonceurs ni partagees inutilement. Elles sont conservees aussi longtemps que necessaire. Selon le cas, l'utilisateur peut demander acces, correction, suppression ou retrait du consentement." },
      { eyebrow: "CONTACT", title: "Mises a jour", copy: "Cette page sera mise a jour avec l'evolution du site, de la newsletter, de l'analyse et des canaux de communication. Pour une question de confidentialite, utilise la page contact." }
    ]
  },
  de: {
    label: "Datenschutz",
    title: "Datenschutz ist keine Fussnote, sondern Teil des Vertrauens zwischen Seite und Leserschaft.",
    intro:
      "Diese Seite erklaert, welche Daten Avangarda verarbeiten kann, warum sie aufbewahrt werden und wie Zugang, Korrektur oder Loeschung angefragt werden koennen.",
    blocks: [
      { eyebrow: "DATEN", title: "Wer wir sind und was wir sehen", copy: "Avangarda ist eine redaktionelle Plattform fuer Texte, Analysen, Menschenrechte, dokumentarische Inhalte und oeffentliches Interesse. Die Seite kann technische Daten fuer den Betrieb, Sprach- und Theme-Auswahl, Angaben aus Kontakt- oder Beitragsformularen, Newsletter-E-Mail und Nachrichten an die Redaktion verarbeiten." },
      { eyebrow: "ZWECK", title: "Warum Verarbeitung noetig ist", copy: "Daten dienen dem Betrieb der Seite, der Kommunikation, der Pruefung von Themen- und Kooperationsvorschlaegen, der Sicherheit, dem Newsletter nur mit Einwilligung und dem Verstaendnis von Besuchen, falls Analytik aktiviert wird." },
      { eyebrow: "NEWSLETTER", title: "E-Mail und Einwilligung", copy: "Wenn du dich fuer einen Newsletter anmeldest, wird die E-Mail nur fuer die akzeptierten Ausgaben und redaktionellen Hinweise genutzt. Eine Abmeldung muss klar moeglich bleiben, sobald der Newsletter aktiv ist." },
      { eyebrow: "FORMULARE", title: "Kontakt und Zusammenarbeit", copy: "Eine Nachricht, ein Dokument oder ein Vorschlag ueber ein Formular bedeutet keine automatische Veroeffentlichung. Die Redaktion kann Material zur Pruefung, Verifikation und Rueckfrage nutzen." },
      { eyebrow: "ANALYTIK", title: "Besuche messen", copy: "Wir behaupten nicht, ein nicht aktives Analysewerkzeug zu verwenden. Wenn Analytik aktiviert wird, nennt diese Seite Werkzeug, Datenumfang und Umgang mit Einwilligung." },
      { eyebrow: "COOKIES", title: "Cookies und lokale Einstellungen", copy: "Die Seite nutzt notwendige technische Mechanismen fuer Sprache, Theme und Grundfunktionen. Details zur Speicherung im Browser stehen auf der Cookie-policy-Seite." },
      { eyebrow: "RECHTE", title: "Nutzerrechte und Aufbewahrung", copy: "Daten werden nicht an Werbetreibende verkauft und nicht unnoetig geteilt. Sie werden nur so lange aufbewahrt, wie ihr Zweck es erfordert. Soweit anwendbar, koennen Zugang, Korrektur, Loeschung oder Widerruf verlangt werden." },
      { eyebrow: "KONTAKT", title: "Aktualisierung", copy: "Diese Seite wird mit Site, Newsletter, Analytik und Kommunikationskanaelen aktualisiert. Fuer Datenschutzfragen nutze die Kontaktseite." }
    ]
  },
  es: {
    label: "Politica de privacidad",
    title: "La privacidad no es una nota al pie: forma parte de la confianza con quien lee.",
    intro:
      "Esta pagina explica que datos puede tratar Avangarda, por que se conservan y como solicitar acceso, correccion o eliminacion.",
    blocks: [
      { eyebrow: "DATOS", title: "Quienes somos y que podemos ver", copy: "Avangarda es una plataforma editorial para textos, analisis, derechos humanos, documentales y contenidos de interes publico. El sitio puede tratar datos tecnicos necesarios, idioma y tema, datos enviados por formularios de contacto o colaboracion, email para newsletter y mensajes dirigidos a la redaccion." },
      { eyebrow: "FINALIDAD", title: "Por que tratamos datos", copy: "Los datos sirven para que el sitio funcione, para comunicacion, revision de propuestas, seguridad, newsletter solo con consentimiento y comprension de visitas si se activa analitica." },
      { eyebrow: "NEWSLETTER", title: "Email y consentimiento", copy: "Si te suscribes a una newsletter, el email se usa para los envios y avisos editoriales aceptados. La baja debe ser clara cuando ese flujo este activo." },
      { eyebrow: "FORMULARIOS", title: "Contacto y colaboracion", copy: "Enviar un mensaje, documento o propuesta por formulario no implica publicacion automatica. La redaccion puede usar el material para revisar, verificar y comunicarse con quien lo envio." },
      { eyebrow: "ANALITICA", title: "Medicion de visitas", copy: "No afirmamos usar una herramienta analitica que no este activa. Si se activa, esta pagina indicara que herramienta se usa, que datos recibe y como se gestiona el consentimiento." },
      { eyebrow: "COOKIES", title: "Cookies y ajustes locales", copy: "El sitio usa mecanismos tecnicos necesarios para idioma, tema y funcionamiento basico. La Cookie policy explica que se almacena en el navegador." },
      { eyebrow: "DERECHOS", title: "Derechos y conservacion", copy: "Los datos no se venden a anunciantes ni se comparten sin necesidad. Se conservan solo mientras sea necesario. Cuando corresponda, se puede solicitar acceso, correccion, eliminacion o retirada del consentimiento." },
      { eyebrow: "CONTACTO", title: "Actualizaciones", copy: "Esta pagina se actualizara con el desarrollo del sitio, la newsletter, la analitica y los canales de comunicacion. Para privacidad, usa la pagina de contacto." }
    ]
  },
  el: {
    label: "Πολιτική απορρήτου",
    title: "Η ιδιωτικότητα δεν είναι υποσημείωση, αλλά μέρος της εμπιστοσύνης με τον αναγνώστη.",
    intro:
      "Αυτή η σελίδα εξηγεί ποια δεδομένα μπορεί να επεξεργάζεται η Avangarda, γιατί τα κρατά και πώς μπορεί να ζητηθεί πρόσβαση, διόρθωση ή διαγραφή.",
    blocks: [
      { eyebrow: "ΔΕΔΟΜΕΝΑ", title: "Ποιοι είμαστε", copy: "Η Avangarda είναι συντακτική πλατφόρμα για κείμενα, αναλύσεις, ανθρώπινα δικαιώματα, ντοκιμαντέρ και δημόσιο ενδιαφέρον. Ο ιστότοπος μπορεί να επεξεργάζεται τεχνικά δεδομένα, επιλογές γλώσσας και θέματος, στοιχεία που στέλνονται μέσω φορμών, email newsletter και μηνύματα προς τη σύνταξη." },
      { eyebrow: "ΣΚΟΠΟΣ", title: "Γιατί γίνεται επεξεργασία", copy: "Τα δεδομένα χρησιμοποιούνται για λειτουργία του ιστότοπου, επικοινωνία, εξέταση προτάσεων, ασφάλεια, newsletter μόνο με συγκατάθεση και κατανόηση επισκέψεων αν ενεργοποιηθεί αναλυτική μέτρηση." },
      { eyebrow: "NEWSLETTER", title: "Email και συγκατάθεση", copy: "Αν εγγραφείς σε newsletter, το email χρησιμοποιείται για τα τεύχη και τις συντακτικές ενημερώσεις που αποδέχθηκες. Η διαγραφή πρέπει να είναι σαφής όταν η υπηρεσία ενεργοποιηθεί." },
      { eyebrow: "ΦΟΡΜΕΣ", title: "Επικοινωνία και συνεργασία", copy: "Η αποστολή μηνύματος, εγγράφου ή πρότασης δεν σημαίνει αυτόματη δημοσίευση. Η σύνταξη μπορεί να χρησιμοποιήσει το υλικό για αξιολόγηση, επαλήθευση και επικοινωνία με τον αποστολέα." },
      { eyebrow: "ΑΝΑΛΥΤΙΚΑ", title: "Μέτρηση επισκέψεων", copy: "Δεν δηλώνουμε χρήση εργαλείου αναλυτικών που δεν είναι ενεργό. Αν ενεργοποιηθεί, εδώ θα αναφέρεται το εργαλείο, τα δεδομένα και η συγκατάθεση." },
      { eyebrow: "COOKIES", title: "Cookies και ρυθμίσεις", copy: "Ο ιστότοπος χρησιμοποιεί απαραίτητους τεχνικούς μηχανισμούς για γλώσσα, θέμα και βασική λειτουργία. Η Cookie policy εξηγεί τι αποθηκεύεται στον browser." },
      { eyebrow: "ΔΙΚΑΙΩΜΑΤΑ", title: "Δικαιώματα χρήστη", copy: "Τα δεδομένα δεν πωλούνται σε διαφημιστές και δεν κοινοποιούνται άσκοπα. Κρατούνται όσο χρειάζεται. Όπου εφαρμόζεται, μπορεί να ζητηθεί πρόσβαση, διόρθωση, διαγραφή ή ανάκληση συγκατάθεσης." },
      { eyebrow: "ΕΠΑΦΗ", title: "Ενημερώσεις", copy: "Η σελίδα θα ενημερώνεται καθώς εξελίσσονται ο ιστότοπος, το newsletter, τα αναλυτικά και τα κανάλια επικοινωνίας. Για απορίες χρησιμοποίησε τη σελίδα επικοινωνίας." }
    ]
  },
  ar: {
    label: "سياسة الخصوصية",
    title: "الخصوصية ليست هامشا صغيرا، بل جزء من الثقة بين الموقع والقارئ.",
    intro:
      "تشرح هذه الصفحة البيانات التي قد تعالجها أفانغاردا، ولماذا تحفظ، وكيف يمكن طلب الوصول إليها أو تصحيحها أو حذفها.",
    blocks: [
      { eyebrow: "البيانات", title: "من نحن وما الذي قد نراه", copy: "أفانغاردا منصة تحريرية للنصوص والتحليلات وحقوق الإنسان والعمل الوثائقي والمصلحة العامة. قد يعالج الموقع بيانات تقنية لازمة للتشغيل، واختيارات اللغة والمظهر، وما يرسله المستخدم عبر نماذج الاتصال أو التعاون، والبريد الإلكتروني للنشرة، والرسائل الموجهة إلى التحرير." },
      { eyebrow: "الغرض", title: "لماذا نعالج البيانات", copy: "تستخدم البيانات لتشغيل الموقع، والتواصل مع القراء، ومراجعة مقترحات القصص والتعاون، وحماية النظام، وإرسال النشرة فقط بعد الموافقة، وفهم الزيارات إذا فُعلت التحليلات." },
      { eyebrow: "النشرة", title: "البريد والموافقة", copy: "إذا اشتركت في النشرة، يستخدم بريدك للإصدارات والتنبيهات التحريرية التي وافقت عليها. يجب أن يبقى إلغاء الاشتراك واضحا عندما تصبح النشرة فعالة." },
      { eyebrow: "النماذج", title: "الاتصال والتعاون", copy: "إرسال رسالة أو وثيقة أو اقتراح عبر نموذج لا يعني النشر التلقائي. يمكن للتحرير استخدام المادة للتقييم والتحقق والتواصل مع المرسل." },
      { eyebrow: "التحليلات", title: "قياس الزيارات", copy: "لا نعلن استخدام أداة تحليل غير مفعلة. إذا فُعلت التحليلات فستذكر هذه الصفحة الأداة والبيانات وآلية الموافقة." },
      { eyebrow: "الكوكيز", title: "الكوكيز والإعدادات المحلية", copy: "يستخدم الموقع آليات تقنية ضرورية للغة والمظهر والتشغيل الأساسي. تشرح صفحة Cookie policy ما يخزن في المتصفح." },
      { eyebrow: "الحقوق", title: "حقوق المستخدم والحفظ", copy: "لا تباع البيانات للمعلنين ولا تشارك بلا ضرورة. تحفظ فقط بقدر ما يلزم للغرض الذي أرسلت من أجله. حيث ينطبق ذلك، يمكن طلب الوصول أو التصحيح أو الحذف أو سحب الموافقة." },
      { eyebrow: "تواصل", title: "تحديث هذه السياسة", copy: "سيتم تحديث هذه الصفحة مع تطور الموقع والنشرة والتحليلات وقنوات التواصل. لأسئلة الخصوصية استخدم صفحة الاتصال." }
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
    pathname: "/privacy-policy",
    title: buildPageTitle(page.label),
    description: page.intro,
  });
}

export default function PrivacyPolicyPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/privacy-policy" copy={copy[lang]} />;
}
