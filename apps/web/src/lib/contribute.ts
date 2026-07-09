import type { Lang } from "@/lib/i18n";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";
import { strapiGet, unwrapStrapiSingle } from "@/lib/strapi";

type ContributePageRecord = {
  submissionEnabled?: boolean;
  submissionFormReady?: boolean;
  submissionFormTitle?: string;
  submissionFormTitle_en?: string;
  submissionFormTitle_tr?: string;
  submissionFormTitle_fr?: string;
  submissionFormTitle_de?: string;
  submissionFormTitle_es?: string;
  submissionFormTitle_el?: string;
  submissionFormTitle_ar?: string;
  submissionFormIntro?: string;
  submissionFormIntro_en?: string;
  submissionFormIntro_tr?: string;
  submissionFormIntro_fr?: string;
  submissionFormIntro_de?: string;
  submissionFormIntro_es?: string;
  submissionFormIntro_el?: string;
  submissionFormIntro_ar?: string;
  submissionClosedTitle?: string;
  submissionClosedTitle_en?: string;
  submissionClosedTitle_tr?: string;
  submissionClosedTitle_fr?: string;
  submissionClosedTitle_de?: string;
  submissionClosedTitle_es?: string;
  submissionClosedTitle_el?: string;
  submissionClosedTitle_ar?: string;
  submissionClosedText?: string;
  submissionClosedText_en?: string;
  submissionClosedText_tr?: string;
  submissionClosedText_fr?: string;
  submissionClosedText_de?: string;
  submissionClosedText_es?: string;
  submissionClosedText_el?: string;
  submissionClosedText_ar?: string;
};

type FormOption = {
  value: string;
  label: string;
};

export type ContributeSubmissionFormCopy = {
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  storyTitleLabel: string;
  storyTitlePlaceholder: string;
  storySummaryLabel: string;
  storySummaryPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  collaborationTypeLabel: string;
  collaborationTypePlaceholder: string;
  collaborationTypeOptions: FormOption[];
  linksLabel: string;
  linksPlaceholder: string;
  acknowledgedLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successText: string;
  genericError: string;
  invalidError: string;
  unavailableError: string;
  closedError: string;
  rateLimitError: string;
};

export type ContributeSubmissionConfig = {
  submissionEnabled: boolean;
  submissionFormReady: boolean;
  formEyebrow: string;
  formTitle: string;
  formIntro: string;
  closedTitle: string;
  closedText: string;
  unavailableTitle: string;
  unavailableText: string;
  form: ContributeSubmissionFormCopy;
};

const fallbackSubmissionCopy: Record<Lang, ContributeSubmissionConfig> = {
  sr: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Prijava",
    formTitle: "Pošalji priču / Saradnja",
    formIntro:
      "Ako tvoja priča nosi dokument, sagovornika, teren ili posledicu, ovde možeš poslati urednički sažetak pre nego što uđe u dalji razgovor.",
    closedTitle: "Sledeća faza još nije otvorena",
    closedText:
      "Prijave za saradnju trenutno nisu otvorene. Kada ih redakcija aktivira, ovde će se pojaviti forma za slanje priče bez javnog izlaganja privatnih kontakata.",
    unavailableTitle: "Slanje trenutno nije konfigurisano",
    unavailableText:
      "Urednički okvir je otvoren, ali sigurni kanal za slanje još nije spreman. Forma će se pojaviti kada ga redakcija aktivira.",
    form: {
      fullNameLabel: "Ime i prezime",
      fullNamePlaceholder: "Kako da te potpišemo u komunikaciji",
      emailLabel: "Email",
      emailPlaceholder: "adresa za odgovor redakcije",
      storyTitleLabel: "Naslov priče",
      storyTitlePlaceholder: "Radni naslov ili tema",
      storySummaryLabel: "Kratak opis",
      storySummaryPlaceholder: "Šta se dogodilo, zašto je važno i koji trag već postoji?",
      locationLabel: "Lokacija",
      locationPlaceholder: "Grad, mesto, institucija ili zajednica",
      collaborationTypeLabel: "Tip saradnje",
      collaborationTypePlaceholder: "Izaberi okvir",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Predlog priče" },
        { value: "research", label: "Istraživačka saradnja" },
        { value: "fieldwork", label: "Terenski rad" },
        { value: "production", label: "Produkcija" },
      ],
      linksLabel: "Linkovi",
      linksPlaceholder: "Dokumenti, fotografije, javni izvori ili prethodni tragovi",
      acknowledgedLabel: "Razumem da slanje priče ne znači automatsku objavu.",
      submitLabel: "Pošalji urednički sažetak",
      submittingLabel: "Slanje...",
      successTitle: "Prijava je primljena.",
      successText: "Ako priča ima urednički trag za dalji razgovor, redakcija će se javiti.",
      genericError: "Slanje trenutno nije uspelo. Pokušaj kasnije.",
      invalidError: "Proveri obavezna polja i potvrdu pre slanja.",
      unavailableError: "Slanje nije konfigurisano na serveru.",
      closedError: "Prijave trenutno nisu otvorene.",
      rateLimitError: "Previše pokušaja u kratkom vremenu. Pokušaj malo kasnije.",
    },
  },
  en: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Submission",
    formTitle: "Pitch a story / Collaborate",
    formIntro:
      "If your story carries documents, sources, fieldwork or consequence, you can send an editorial summary here before it moves into a deeper conversation.",
    closedTitle: "The next phase is not open yet",
    closedText:
      "Submissions are currently closed. When the editorial team opens them, the submission form will appear here without exposing private contact details publicly.",
    unavailableTitle: "Submission is not configured yet",
    unavailableText:
      "The editorial frame is open, but the secure submission channel is not ready yet. The form appears when the newsroom activates it.",
    form: {
      fullNameLabel: "Full name",
      fullNamePlaceholder: "How should we address you?",
      emailLabel: "Email",
      emailPlaceholder: "address for the editorial reply",
      storyTitleLabel: "Story title",
      storyTitlePlaceholder: "Working title or topic",
      storySummaryLabel: "Short summary",
      storySummaryPlaceholder: "What happened, why does it matter, and what trace already exists?",
      locationLabel: "Location",
      locationPlaceholder: "City, place, institution or community",
      collaborationTypeLabel: "Collaboration type",
      collaborationTypePlaceholder: "Choose a frame",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Story pitch" },
        { value: "research", label: "Research collaboration" },
        { value: "fieldwork", label: "Fieldwork" },
        { value: "production", label: "Production" },
      ],
      linksLabel: "Links",
      linksPlaceholder: "Documents, photos, public sources or previous traces",
      acknowledgedLabel: "I understand that submitting a story does not mean automatic publication.",
      submitLabel: "Send editorial summary",
      submittingLabel: "Sending...",
      successTitle: "Submission received.",
      successText: "If the story has an editorial trail for a deeper conversation, the newsroom will get back to you.",
      genericError: "Submission failed for now. Try again later.",
      invalidError: "Check the required fields and confirmation before sending.",
      unavailableError: "Submission is not configured on the server.",
      closedError: "Submissions are currently closed.",
      rateLimitError: "Too many attempts in a short time. Try again a little later.",
    },
  },
  tr: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Gönderim",
    formTitle: "Hikaye gönder / İş birliği",
    formIntro:
      "Hikayen belge, kaynak, saha çalışması ya da sonuç taşıyorsa, daha ileri bir görüşmeye geçmeden önce burada editoryal bir özet gönderebilirsin.",
    closedTitle: "Bir sonraki aşama henüz açık değil",
    closedText:
      "Başvurular şu anda kapalı. Editoryal ekip açtığında, özel iletişim bilgileri kamusal olarak görünmeden gönderim formu burada açılacak.",
    unavailableTitle: "Gönderim henüz yapılandırılmadı",
    unavailableText:
      "Editoryal çerçeve açık, ama güvenli gönderim kanalı henüz hazır değil. Editoryal ekip etkinleştirdiğinde form açılır.",
    form: {
      fullNameLabel: "Ad ve soyad",
      fullNamePlaceholder: "Sana nasıl hitap edelim?",
      emailLabel: "Email",
      emailPlaceholder: "editoryal yanıt için adres",
      storyTitleLabel: "Hikaye başlığı",
      storyTitlePlaceholder: "Çalışma başlığı veya konu",
      storySummaryLabel: "Kısa özet",
      storySummaryPlaceholder: "Ne oldu, neden önemli ve elde hangi iz var?",
      locationLabel: "Konum",
      locationPlaceholder: "Şehir, yer, kurum veya topluluk",
      collaborationTypeLabel: "İş birliği tipi",
      collaborationTypePlaceholder: "Bir çerçeve seç",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Hikaye önerisi" },
        { value: "research", label: "Araştırma iş birliği" },
        { value: "fieldwork", label: "Saha çalışması" },
        { value: "production", label: "Prodüksiyon" },
      ],
      linksLabel: "Linkler",
      linksPlaceholder: "Belgeler, fotoğraflar, açık kaynaklar veya önceki izler",
      acknowledgedLabel: "Hikaye göndermenin otomatik yayın anlamına gelmediğini anlıyorum.",
      submitLabel: "Editoryal özeti gönder",
      submittingLabel: "Gönderiliyor...",
      successTitle: "Başvuru alındı.",
      successText: "Hikaye daha ileri bir editoryal konuşma gerektirirse ekip sana dönecek.",
      genericError: "Gönderim şu an başarısız oldu. Daha sonra tekrar dene.",
      invalidError: "Göndermeden önce zorunlu alanları ve onayı kontrol et.",
      unavailableError: "Gönderim sunucuda yapılandırılmadı.",
      closedError: "Başvurular şu anda kapalı.",
      rateLimitError: "Kısa sürede çok fazla deneme yapıldı. Biraz sonra tekrar dene.",
    },
  },
  fr: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Soumission",
    formTitle: "Envoyer une histoire / Collaborer",
    formIntro:
      "Si ton histoire repose sur des documents, des sources, du terrain ou une conséquence claire, tu peux envoyer ici un résumé éditorial avant d'aller plus loin.",
    closedTitle: "La prochaine phase n'est pas encore ouverte",
    closedText:
      "Les soumissions sont actuellement fermées. Quand la rédaction les ouvrira, le formulaire apparaîtra ici sans exposer publiquement des contacts privés.",
    unavailableTitle: "La soumission n'est pas encore configurée",
    unavailableText:
      "Le cadre éditorial est ouvert, mais le canal sécurisé n'est pas encore prêt. Le formulaire apparaîtra quand la rédaction l'activera.",
    form: {
      fullNameLabel: "Nom complet",
      fullNamePlaceholder: "Comment devons-nous nous adresser à toi ?",
      emailLabel: "Email",
      emailPlaceholder: "adresse pour la réponse de la rédaction",
      storyTitleLabel: "Titre de l'histoire",
      storyTitlePlaceholder: "Titre de travail ou sujet",
      storySummaryLabel: "Résumé court",
      storySummaryPlaceholder: "Que s'est-il passé, pourquoi est-ce important et quelles traces existent déjà ?",
      locationLabel: "Lieu",
      locationPlaceholder: "Ville, lieu, institution ou communauté",
      collaborationTypeLabel: "Type de collaboration",
      collaborationTypePlaceholder: "Choisir un cadre",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Proposition d'histoire" },
        { value: "research", label: "Collaboration de recherche" },
        { value: "fieldwork", label: "Terrain" },
        { value: "production", label: "Production" },
      ],
      linksLabel: "Liens",
      linksPlaceholder: "Documents, photos, sources publiques ou traces précédentes",
      acknowledgedLabel: "Je comprends qu'envoyer une histoire ne signifie pas une publication automatique.",
      submitLabel: "Envoyer le résumé éditorial",
      submittingLabel: "Envoi...",
      successTitle: "Soumission reçue.",
      successText: "Si l'histoire ouvre une piste éditoriale, la rédaction te recontactera.",
      genericError: "L'envoi n'a pas abouti pour le moment. Réessaie plus tard.",
      invalidError: "Vérifie les champs obligatoires et la confirmation avant l'envoi.",
      unavailableError: "La soumission n'est pas configurée côté serveur.",
      closedError: "Les soumissions sont actuellement fermées.",
      rateLimitError: "Trop de tentatives en peu de temps. Réessaie un peu plus tard.",
    },
  },
  de: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Einreichung",
    formTitle: "Geschichte senden / Zusammenarbeit",
    formIntro:
      "Wenn deine Geschichte Dokumente, Quellen, Feldarbeit oder eine klare Konsequenz hat, kannst du hier zuerst eine redaktionelle Zusammenfassung schicken.",
    closedTitle: "Die nächste Phase ist noch nicht geöffnet",
    closedText:
      "Einreichungen sind derzeit geschlossen. Wenn die Redaktion sie öffnet, erscheint hier das Formular, ohne private Kontaktangaben öffentlich zu machen.",
    unavailableTitle: "Einreichung ist noch nicht konfiguriert",
    unavailableText:
      "Der redaktionelle Rahmen ist offen, aber der sichere Sendekanal ist noch nicht bereit. Das Formular erscheint, wenn die Redaktion ihn aktiviert.",
    form: {
      fullNameLabel: "Name",
      fullNamePlaceholder: "Wie sollen wir dich ansprechen?",
      emailLabel: "Email",
      emailPlaceholder: "Adresse für die Antwort der Redaktion",
      storyTitleLabel: "Titel der Geschichte",
      storyTitlePlaceholder: "Arbeitstitel oder Thema",
      storySummaryLabel: "Kurze Zusammenfassung",
      storySummaryPlaceholder: "Was ist passiert, warum ist es wichtig und welche Spur gibt es bereits?",
      locationLabel: "Ort",
      locationPlaceholder: "Stadt, Ort, Institution oder Community",
      collaborationTypeLabel: "Art der Zusammenarbeit",
      collaborationTypePlaceholder: "Rahmen wählen",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Geschichtenvorschlag" },
        { value: "research", label: "Recherche-Zusammenarbeit" },
        { value: "fieldwork", label: "Feldarbeit" },
        { value: "production", label: "Produktion" },
      ],
      linksLabel: "Links",
      linksPlaceholder: "Dokumente, Fotos, öffentliche Quellen oder frühere Spuren",
      acknowledgedLabel: "Ich verstehe, dass das Senden einer Geschichte keine automatische Veröffentlichung bedeutet.",
      submitLabel: "Redaktionelle Zusammenfassung senden",
      submittingLabel: "Wird gesendet...",
      successTitle: "Einreichung erhalten.",
      successText: "Wenn die Geschichte eine redaktionelle Spur hat, meldet sich die Redaktion.",
      genericError: "Das Senden ist gerade fehlgeschlagen. Versuche es später erneut.",
      invalidError: "Prüfe Pflichtfelder und Bestätigung vor dem Senden.",
      unavailableError: "Die Einreichung ist serverseitig nicht konfiguriert.",
      closedError: "Einreichungen sind derzeit geschlossen.",
      rateLimitError: "Zu viele Versuche in kurzer Zeit. Versuche es etwas später erneut.",
    },
  },
  es: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Envío",
    formTitle: "Enviar una historia / Colaborar",
    formIntro:
      "Si tu historia tiene documentos, fuentes, trabajo de campo o una consecuencia clara, aquí puedes enviar un resumen editorial antes de seguir adelante.",
    closedTitle: "La siguiente fase aún no está abierta",
    closedText:
      "Las postulaciones están cerradas por ahora. Cuando la redacción las abra, el formulario aparecerá aquí sin exponer públicamente contactos privados.",
    unavailableTitle: "El envío todavía no está configurado",
    unavailableText:
      "El marco editorial está abierto, pero el canal seguro aún no está listo. El formulario aparecerá cuando la redacción lo active.",
    form: {
      fullNameLabel: "Nombre completo",
      fullNamePlaceholder: "Cómo debemos dirigirnos a ti",
      emailLabel: "Email",
      emailPlaceholder: "dirección para la respuesta editorial",
      storyTitleLabel: "Título de la historia",
      storyTitlePlaceholder: "Título de trabajo o tema",
      storySummaryLabel: "Resumen breve",
      storySummaryPlaceholder: "Qué ocurrió, por qué importa y qué rastro existe ya?",
      locationLabel: "Ubicación",
      locationPlaceholder: "Ciudad, lugar, institución o comunidad",
      collaborationTypeLabel: "Tipo de colaboración",
      collaborationTypePlaceholder: "Elige un marco",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Propuesta de historia" },
        { value: "research", label: "Colaboración de investigación" },
        { value: "fieldwork", label: "Trabajo de campo" },
        { value: "production", label: "Producción" },
      ],
      linksLabel: "Enlaces",
      linksPlaceholder: "Documentos, fotos, fuentes públicas o rastros previos",
      acknowledgedLabel: "Entiendo que enviar una historia no significa publicación automática.",
      submitLabel: "Enviar resumen editorial",
      submittingLabel: "Enviando...",
      successTitle: "Postulación recibida.",
      successText: "Si la historia abre una pista editorial, la redacción responderá.",
      genericError: "El envío falló por ahora. Intenta más tarde.",
      invalidError: "Revisa los campos obligatorios y la confirmación antes de enviar.",
      unavailableError: "El envío no está configurado en el servidor.",
      closedError: "Las postulaciones están cerradas por ahora.",
      rateLimitError: "Demasiados intentos en poco tiempo. Intenta un poco más tarde.",
    },
  },
  el: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "Υποβολή",
    formTitle: "Στείλε ιστορία / Συνεργασία",
    formIntro:
      "Αν η ιστορία σου στηρίζεται σε έγγραφα, πηγές, πεδίο ή συνέπεια, εδώ μπορείς να στείλεις μια σύντομη συντακτική σύνοψη πριν προχωρήσει η συζήτηση.",
    closedTitle: "Η επόμενη φάση δεν έχει ανοίξει ακόμη",
    closedText:
      "Οι υποβολές είναι προς το παρόν κλειστές. Όταν η σύνταξη τις ανοίξει, η φόρμα θα εμφανιστεί εδώ χωρίς να εκτεθούν δημόσια ιδιωτικά στοιχεία επικοινωνίας.",
    unavailableTitle: "Η υποβολή δεν έχει ρυθμιστεί ακόμη",
    unavailableText:
      "Το συντακτικό πλαίσιο είναι ανοιχτό, αλλά το ασφαλές κανάλι υποβολής δεν είναι ακόμη έτοιμο. Η φόρμα θα εμφανιστεί όταν το ενεργοποιήσει η σύνταξη.",
    form: {
      fullNameLabel: "Ονοματεπώνυμο",
      fullNamePlaceholder: "Πώς να απευθυνθούμε σε εσένα;",
      emailLabel: "Email",
      emailPlaceholder: "διεύθυνση για απάντηση της σύνταξης",
      storyTitleLabel: "Τίτλος ιστορίας",
      storyTitlePlaceholder: "Προσωρινός τίτλος ή θέμα",
      storySummaryLabel: "Σύντομη σύνοψη",
      storySummaryPlaceholder: "Τι συνέβη, γιατί έχει σημασία και ποιο ίχνος υπάρχει ήδη;",
      locationLabel: "Τοποθεσία",
      locationPlaceholder: "Πόλη, μέρος, θεσμός ή κοινότητα",
      collaborationTypeLabel: "Τύπος συνεργασίας",
      collaborationTypePlaceholder: "Επίλεξε πλαίσιο",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "Πρόταση ιστορίας" },
        { value: "research", label: "Ερευνητική συνεργασία" },
        { value: "fieldwork", label: "Πεδίο" },
        { value: "production", label: "Παραγωγή" },
      ],
      linksLabel: "Σύνδεσμοι",
      linksPlaceholder: "Έγγραφα, φωτογραφίες, δημόσιες πηγές ή προηγούμενα ίχνη",
      acknowledgedLabel: "Καταλαβαίνω ότι η υποβολή ιστορίας δεν σημαίνει αυτόματη δημοσίευση.",
      submitLabel: "Στείλε συντακτική σύνοψη",
      submittingLabel: "Αποστολή...",
      successTitle: "Η υποβολή ελήφθη.",
      successText: "Αν η ιστορία έχει συντακτικό ίχνος για συνέχεια, η σύνταξη θα απαντήσει.",
      genericError: "Η αποστολή απέτυχε προς το παρόν. Προσπάθησε αργότερα.",
      invalidError: "Έλεγξε τα υποχρεωτικά πεδία και την επιβεβαίωση πριν την αποστολή.",
      unavailableError: "Η υποβολή δεν έχει ρυθμιστεί στον server.",
      closedError: "Οι υποβολές είναι προς το παρόν κλειστές.",
      rateLimitError: "Πάρα πολλές προσπάθειες σε λίγο χρόνο. Προσπάθησε λίγο αργότερα.",
    },
  },
  ar: {
    submissionEnabled: false,
    submissionFormReady: false,
    formEyebrow: "إرسال",
    formTitle: "أرسل قصة / تعاون",
    formIntro:
      "إذا كانت قصتك تستند إلى وثائق أو مصادر أو عمل ميداني أو تحمل تبعة واضحة، يمكنك هنا إرسال ملخص تحريري قبل الانتقال إلى المرحلة التالية.",
    closedTitle: "المرحلة التالية لم تُفتح بعد",
    closedText:
      "الإرساليات مغلقة حاليًا. عندما تفتحها هيئة التحرير، سيظهر النموذج هنا من دون كشف بيانات الاتصال الخاصة على الواجهة العامة.",
    unavailableTitle: "الإرسال غير مهيأ بعد",
    unavailableText:
      "الإطار التحريري مفتوح، لكن قناة الإرسال الآمنة ليست جاهزة بعد. سيظهر النموذج عندما تفعّله هيئة التحرير.",
    form: {
      fullNameLabel: "الاسم الكامل",
      fullNamePlaceholder: "كيف نخاطبك؟",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "عنوان لرد هيئة التحرير",
      storyTitleLabel: "عنوان القصة",
      storyTitlePlaceholder: "عنوان مؤقت أو موضوع",
      storySummaryLabel: "ملخص قصير",
      storySummaryPlaceholder: "ماذا حدث، ولماذا يهم، وما الدليل الموجود؟",
      locationLabel: "الموقع",
      locationPlaceholder: "مدينة، مكان، مؤسسة أو مجتمع",
      collaborationTypeLabel: "نوع التعاون",
      collaborationTypePlaceholder: "اختر الإطار",
      collaborationTypeOptions: [
        { value: "story-pitch", label: "اقتراح قصة" },
        { value: "research", label: "تعاون بحثي" },
        { value: "fieldwork", label: "عمل ميداني" },
        { value: "production", label: "إنتاج" },
      ],
      linksLabel: "روابط",
      linksPlaceholder: "وثائق، صور، مصادر عامة أو آثار سابقة",
      acknowledgedLabel: "أفهم أن إرسال القصة لا يعني النشر التلقائي.",
      submitLabel: "إرسال الملخص التحريري",
      submittingLabel: "جار الإرسال...",
      successTitle: "تم استلام الإرسال.",
      successText: "إذا فتحت القصة مسارًا تحريريًا للمتابعة، ستتواصل هيئة التحرير معك.",
      genericError: "تعذر الإرسال الآن. حاول لاحقًا.",
      invalidError: "راجع الحقول المطلوبة والتأكيد قبل الإرسال.",
      unavailableError: "الإرسال غير مهيأ على الخادم.",
      closedError: "الإرساليات مغلقة حاليًا.",
      rateLimitError: "محاولات كثيرة في وقت قصير. حاول بعد قليل.",
    },
  },
};

function readLocalizedField(
  record: ContributePageRecord | null,
  baseField: keyof ContributePageRecord,
  lang: Lang,
  fallbackValue: string
) {
  const localizedField = lang === "sr" ? baseField : (`${String(baseField)}_${lang}` as keyof ContributePageRecord);
  const localized = record?.[localizedField];
  const base = record?.[baseField];

  if (typeof localized === "string" && localized.trim()) return localized.trim();
  if (typeof base === "string" && base.trim()) return base.trim();
  return fallbackValue;
}

export function getFallbackContributeSubmissionConfig(lang: Lang) {
  const copy = fallbackSubmissionCopy[lang] ?? fallbackSubmissionCopy.en;
  return lang === "sr" ? normalizeSerbianLatinDeep(copy) : copy;
}

export async function fetchContributeSubmissionConfig(lang: Lang): Promise<ContributeSubmissionConfig> {
  const fallback = getFallbackContributeSubmissionConfig(lang);
  const response = await strapiGet<{ data?: unknown }>("/api/contribute-page");
  const record = unwrapStrapiSingle<ContributePageRecord>(response);

  if (!record) {
    return fallback;
  }

  return {
    ...fallback,
    submissionEnabled: record.submissionEnabled === true,
    submissionFormReady: record.submissionFormReady === true,
    formTitle: readLocalizedField(record, "submissionFormTitle", lang, fallback.formTitle),
    formIntro: readLocalizedField(record, "submissionFormIntro", lang, fallback.formIntro),
    closedTitle: readLocalizedField(record, "submissionClosedTitle", lang, fallback.closedTitle),
    closedText: readLocalizedField(record, "submissionClosedText", lang, fallback.closedText),
  };
}
