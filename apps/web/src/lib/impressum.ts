import type { Lang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { formatDisplayDate, strapiGet, unwrapStrapiSingle } from "@/lib/strapi";

export type ImpressumLink = {
  label: string;
  href: string;
};

export type ImpressumEntry = {
  label: string;
  value?: string;
  href?: string;
  links?: ImpressumLink[];
};

export type ImpressumPageCopy = {
  label: string;
  title: string;
  intro: string;
  summary: string;
  detailsLabel: string;
  detailsTitle: string;
  details: ImpressumEntry[];
  noteLabel: string;
  noteTitle: string;
  noteCopy: string;
  rightsLabel: string;
  rightsTitle: string;
  rightsCopy: string;
  responsibilityLabel: string;
  responsibilityTitle: string;
  responsibilityCopy: string;
};

type SocialPlatform = "instagram" | "tiktok" | "x" | "facebook" | "youtube" | "linkedin" | "website";

type SocialLinkRecord = {
  platform: SocialPlatform;
  url: string;
};

type ImpressumContent = {
  heroTitle: string;
  editorialPolicyShort: string;
  pageSummary: string;
  statusNote: string;
  copyrightNotice: string;
  responsibilityNote: string;
  siteName: string;
  publisherName: string;
  publisherFullLegalName?: string;
  organisationName?: string;
  publisherLegalForm?: string;
  registeredAddress?: string;
  municipality?: string;
  country?: string;
  registrationNumber?: string;
  taxNumber?: string;
  legalRepresentative?: string;
  editorInChief?: string;
  contactEmail?: string;
  phone?: string;
  websiteUrl?: string;
  socialLinks: SocialLinkRecord[];
  mediaProjectName?: string;
  projectOwner?: string;
  privacyContactEmail?: string;
  mediaRegistryNumber?: string | null;
  lastUpdatedLabel?: string;
  lastUpdated?: string | null;
};

type ImpressumChrome = {
  label: string;
  detailsLabel: string;
  detailsTitle: string;
  noteLabel: string;
  noteTitle: string;
  rightsLabel: string;
  rightsTitle: string;
  responsibilityLabel: string;
  responsibilityTitle: string;
  fields: {
    siteName: string;
    mediaProjectName: string;
    websiteUrl: string;
    publisherName: string;
    publisherFullLegalName: string;
    organisationName: string;
    projectOwner: string;
    publisherLegalForm: string;
    registeredAddress: string;
    registrationNumber: string;
    taxNumber: string;
    legalRepresentative: string;
    editorInChief: string;
    contactEmail: string;
    privacyContactEmail: string;
    phone: string;
    socialLinks: string;
    mediaRegistryNumber: string;
    lastUpdated: string;
  };
};

type CmsImpressumRecord = Record<string, unknown> & {
  heroTitle?: string;
  heroTitle_en?: string;
  heroTitle_tr?: string;
  heroTitle_fr?: string;
  heroTitle_de?: string;
  heroTitle_es?: string;
  heroTitle_el?: string;
  heroTitle_ar?: string;
  editorialPolicyShort?: string;
  editorialPolicyShort_en?: string;
  editorialPolicyShort_tr?: string;
  editorialPolicyShort_fr?: string;
  editorialPolicyShort_de?: string;
  editorialPolicyShort_es?: string;
  editorialPolicyShort_el?: string;
  editorialPolicyShort_ar?: string;
  pageSummary?: string;
  pageSummary_en?: string;
  pageSummary_tr?: string;
  pageSummary_fr?: string;
  pageSummary_de?: string;
  pageSummary_es?: string;
  pageSummary_el?: string;
  pageSummary_ar?: string;
  statusNote?: string;
  statusNote_en?: string;
  statusNote_tr?: string;
  statusNote_fr?: string;
  statusNote_de?: string;
  statusNote_es?: string;
  statusNote_el?: string;
  statusNote_ar?: string;
  copyrightNotice?: string;
  copyrightNotice_en?: string;
  copyrightNotice_tr?: string;
  copyrightNotice_fr?: string;
  copyrightNotice_de?: string;
  copyrightNotice_es?: string;
  copyrightNotice_el?: string;
  copyrightNotice_ar?: string;
  responsibilityNote?: string;
  responsibilityNote_en?: string;
  responsibilityNote_tr?: string;
  responsibilityNote_fr?: string;
  responsibilityNote_de?: string;
  responsibilityNote_es?: string;
  responsibilityNote_el?: string;
  responsibilityNote_ar?: string;
  siteName?: string;
  siteName_en?: string;
  siteName_tr?: string;
  siteName_fr?: string;
  siteName_de?: string;
  siteName_es?: string;
  siteName_el?: string;
  siteName_ar?: string;
  publisherName?: string;
  publisherName_en?: string;
  publisherName_tr?: string;
  publisherName_fr?: string;
  publisherName_de?: string;
  publisherName_es?: string;
  publisherName_el?: string;
  publisherName_ar?: string;
  publisherFullLegalName?: string;
  publisherFullLegalName_en?: string;
  publisherFullLegalName_tr?: string;
  publisherFullLegalName_fr?: string;
  publisherFullLegalName_de?: string;
  organisationName?: string;
  organisationName_en?: string;
  organisationName_tr?: string;
  organisationName_fr?: string;
  organisationName_de?: string;
  publisherLegalForm?: string;
  publisherLegalForm_en?: string;
  publisherLegalForm_tr?: string;
  publisherLegalForm_fr?: string;
  publisherLegalForm_de?: string;
  registeredAddress?: string;
  registeredAddress_en?: string;
  registeredAddress_tr?: string;
  registeredAddress_fr?: string;
  registeredAddress_de?: string;
  municipality?: string;
  municipality_en?: string;
  municipality_tr?: string;
  municipality_fr?: string;
  municipality_de?: string;
  country?: string;
  country_en?: string;
  country_tr?: string;
  country_fr?: string;
  country_de?: string;
  registrationNumber?: string;
  taxNumber?: string;
  legalRepresentative?: string;
  legalRepresentative_en?: string;
  legalRepresentative_tr?: string;
  legalRepresentative_fr?: string;
  legalRepresentative_de?: string;
  editorInChief?: string;
  editorInChief_en?: string;
  editorInChief_tr?: string;
  editorInChief_fr?: string;
  editorInChief_de?: string;
  contactEmail?: string;
  phone?: string;
  websiteUrl?: string;
  socialLinks?: unknown;
  mediaProjectName?: string;
  mediaProjectName_en?: string;
  mediaProjectName_tr?: string;
  mediaProjectName_fr?: string;
  mediaProjectName_de?: string;
  projectOwner?: string;
  projectOwner_en?: string;
  projectOwner_tr?: string;
  projectOwner_fr?: string;
  projectOwner_de?: string;
  privacyContactEmail?: string;
  mediaRegistryNumber?: string;
  lastUpdatedLabel?: string;
  lastUpdatedLabel_en?: string;
  lastUpdatedLabel_tr?: string;
  lastUpdatedLabel_fr?: string;
  lastUpdatedLabel_de?: string;
  lastUpdated?: string;
};

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar"
};

const chromeByLang: Record<Lang, ImpressumChrome> = {
  sr: {
    label: "Impresum",
    detailsLabel: "Osnovni podaci",
    detailsTitle: "Podaci o platformi i izdavaču",
    noteLabel: "Status",
    noteTitle: "Napomena o statusu",
    rightsLabel: "Autorska prava",
    rightsTitle: "Autorska prava",
    responsibilityLabel: "Odgovornost",
    responsibilityTitle: "Odgovornost za sadržaj",
    fields: {
      siteName: "Naziv platforme",
      mediaProjectName: "Naziv projekta",
      websiteUrl: "Internet adresa",
      publisherName: "Izdavač",
      publisherFullLegalName: "Puni pravni naziv izdavača",
      organisationName: "Naziv organizacije",
      projectOwner: "Nosilac projekta",
      publisherLegalForm: "Pravni oblik izdavača",
      registeredAddress: "Sedište izdavača",
      registrationNumber: "Matični broj izdavača",
      taxNumber: "PIB izdavača",
      legalRepresentative: "Zastupnik udruženja",
      editorInChief: "Urednik platforme",
      contactEmail: "Kontakt",
      privacyContactEmail: "Email za privatnost",
      phone: "Telefon",
      socialLinks: "Mreža",
      mediaRegistryNumber: "Registarski broj medija",
      lastUpdated: "Poslednje ažuriranje"
    }
  },
  en: {
    label: "Imprint",
    detailsLabel: "Key details",
    detailsTitle: "Platform and publisher information",
    noteLabel: "Status",
    noteTitle: "Status note",
    rightsLabel: "Rights",
    rightsTitle: "Copyright",
    responsibilityLabel: "Responsibility",
    responsibilityTitle: "Responsibility for content",
    fields: {
      siteName: "Platform name",
      mediaProjectName: "Project name",
      websiteUrl: "Website",
      publisherName: "Publisher",
      publisherFullLegalName: "Publisher full legal name",
      organisationName: "Organisation name",
      projectOwner: "Project owner",
      publisherLegalForm: "Publisher legal form",
      registeredAddress: "Registered address",
      registrationNumber: "Registration number",
      taxNumber: "Tax ID",
      legalRepresentative: "Legal representative",
      editorInChief: "Editor in chief",
      contactEmail: "Contact email",
      privacyContactEmail: "Privacy contact email",
      phone: "Phone",
      socialLinks: "Social links",
      mediaRegistryNumber: "Media registry number",
      lastUpdated: "Last updated"
    }
  },
  de: {
    label: "Impressum",
    detailsLabel: "Grunddaten",
    detailsTitle: "Angaben zur Plattform und zum Herausgeber",
    noteLabel: "Status",
    noteTitle: "Hinweis zum Status",
    rightsLabel: "Urheberrecht",
    rightsTitle: "Urheberrecht",
    responsibilityLabel: "Verantwortung",
    responsibilityTitle: "Verantwortung fuer Inhalte",
    fields: {
      siteName: "Name der Plattform",
      mediaProjectName: "Projektname",
      websiteUrl: "Internetadresse",
      publisherName: "Herausgeber",
      publisherFullLegalName: "Vollstaendiger Rechtsname des Herausgebers",
      organisationName: "Name der Organisation",
      projectOwner: "Projekttraeger",
      publisherLegalForm: "Rechtsform des Herausgebers",
      registeredAddress: "Sitz des Herausgebers",
      registrationNumber: "Registrierungsnummer",
      taxNumber: "Steuer-ID",
      legalRepresentative: "Gesetzlicher Vertreter",
      editorInChief: "Chefredaktion",
      contactEmail: "Kontakt-E-Mail",
      privacyContactEmail: "Datenschutz-E-Mail",
      phone: "Telefon",
      socialLinks: "Netzwerke",
      mediaRegistryNumber: "Medienregisternummer",
      lastUpdated: "Zuletzt aktualisiert"
    }
  },
  fr: {
    label: "Mentions legales",
    detailsLabel: "Donnees principales",
    detailsTitle: "Informations sur la plateforme et l'editeur",
    noteLabel: "Statut",
    noteTitle: "Note sur le statut",
    rightsLabel: "Droits",
    rightsTitle: "Droits d'auteur",
    responsibilityLabel: "Responsabilite",
    responsibilityTitle: "Responsabilite du contenu",
    fields: {
      siteName: "Nom de la plateforme",
      mediaProjectName: "Nom du projet",
      websiteUrl: "Adresse internet",
      publisherName: "Editeur",
      publisherFullLegalName: "Raison sociale complete de l'editeur",
      organisationName: "Nom de l'organisation",
      projectOwner: "Porteur du projet",
      publisherLegalForm: "Forme juridique de l'editeur",
      registeredAddress: "Siege de l'editeur",
      registrationNumber: "Numero d'enregistrement",
      taxNumber: "Numero fiscal",
      legalRepresentative: "Representant legal",
      editorInChief: "Redacteur en chef",
      contactEmail: "Email de contact",
      privacyContactEmail: "Email pour la confidentialite",
      phone: "Telephone",
      socialLinks: "Reseaux",
      mediaRegistryNumber: "Numero d'enregistrement media",
      lastUpdated: "Derniere mise a jour"
    }
  },
  tr: {
    label: "Kunye",
    detailsLabel: "Temel bilgiler",
    detailsTitle: "Platform ve yayinci bilgileri",
    noteLabel: "Durum",
    noteTitle: "Status notu",
    rightsLabel: "Telif",
    rightsTitle: "Telif haklari",
    responsibilityLabel: "Sorumluluk",
    responsibilityTitle: "Icerik sorumlulugu",
    fields: {
      siteName: "Platform adi",
      mediaProjectName: "Proje adi",
      websiteUrl: "Internet adresi",
      publisherName: "Yayinci",
      publisherFullLegalName: "Yayincinin tam yasal adi",
      organisationName: "Kurulus adi",
      projectOwner: "Proje sahibi",
      publisherLegalForm: "Yayincinin hukuki yapisi",
      registeredAddress: "Kayitli adres",
      registrationNumber: "Kayit numarasi",
      taxNumber: "Vergi numarasi",
      legalRepresentative: "Yasal temsilci",
      editorInChief: "Genel yayin yonetmeni",
      contactEmail: "Iletisim e-postasi",
      privacyContactEmail: "Gizlilik e-postasi",
      phone: "Telefon",
      socialLinks: "Sosyal baglantilar",
      mediaRegistryNumber: "Medya sicil numarasi",
      lastUpdated: "Son guncelleme"
    }
  },
  es: {
    label: "Aviso legal",
    detailsLabel: "Datos clave",
    detailsTitle: "Información sobre la plataforma y el editor",
    noteLabel: "Estado",
    noteTitle: "Nota de estado",
    rightsLabel: "Derechos",
    rightsTitle: "Derechos de autor",
    responsibilityLabel: "Responsabilidad",
    responsibilityTitle: "Responsabilidad por el contenido",
    fields: {
      siteName: "Nombre de la plataforma",
      mediaProjectName: "Nombre del proyecto",
      websiteUrl: "Sitio web",
      publisherName: "Editor",
      publisherFullLegalName: "Nombre legal completo del editor",
      organisationName: "Nombre de la organización",
      projectOwner: "Responsable del proyecto",
      publisherLegalForm: "Forma legal del editor",
      registeredAddress: "Dirección registrada",
      registrationNumber: "Número de registro",
      taxNumber: "Número fiscal",
      legalRepresentative: "Representante legal",
      editorInChief: "Editor jefe",
      contactEmail: "Correo de contacto",
      privacyContactEmail: "Correo de privacidad",
      phone: "Teléfono",
      socialLinks: "Redes",
      mediaRegistryNumber: "Número de registro de medios",
      lastUpdated: "Última actualización"
    }
  },
  el: {
    label: "\u03a3\u03c4\u03bf\u03b9\u03c7\u03b5\u03af\u03b1 \u03ad\u03ba\u03b4\u03bf\u03c3\u03b7\u03c2",
    detailsLabel: "Βασικά στοιχεία",
    detailsTitle: "Στοιχεία πλατφόρμας και εκδότη",
    noteLabel: "Κατάσταση",
    noteTitle: "Σημείωση κατάστασης",
    rightsLabel: "Δικαιώματα",
    rightsTitle: "Πνευματικά δικαιώματα",
    responsibilityLabel: "Ευθύνη",
    responsibilityTitle: "Ευθύνη περιεχομένου",
    fields: {
      siteName: "Όνομα πλατφόρμας",
      mediaProjectName: "Όνομα project",
      websiteUrl: "Ιστότοπος",
      publisherName: "Εκδότης",
      publisherFullLegalName: "Πλήρες νομικό όνομα εκδότη",
      organisationName: "Όνομα οργανισμού",
      projectOwner: "Υπεύθυνος project",
      publisherLegalForm: "Νομική μορφή εκδότη",
      registeredAddress: "Καταχωρισμένη διεύθυνση",
      registrationNumber: "Αριθμός καταχώρισης",
      taxNumber: "Φορολογικός αριθμός",
      legalRepresentative: "Νόμιμος εκπρόσωπος",
      editorInChief: "Αρχισυντάκτης",
      contactEmail: "Email επικοινωνίας",
      privacyContactEmail: "Email ιδιωτικότητας",
      phone: "Τηλέφωνο",
      socialLinks: "Σύνδεσμοι κοινωνικών δικτύων",
      mediaRegistryNumber: "Αριθμός μητρώου μέσου",
      lastUpdated: "Τελευταία ενημέρωση"
    }
  },
  ar: {
    label: "بيانات النشر",
    detailsLabel: "البيانات الأساسية",
    detailsTitle: "معلومات المنصة والناشر",
    noteLabel: "الحالة",
    noteTitle: "ملاحظة الحالة",
    rightsLabel: "الحقوق",
    rightsTitle: "حقوق النشر",
    responsibilityLabel: "المسؤولية",
    responsibilityTitle: "المسؤولية عن المحتوى",
    fields: {
      siteName: "اسم المنصة",
      mediaProjectName: "اسم المشروع",
      websiteUrl: "الموقع الإلكتروني",
      publisherName: "الناشر",
      publisherFullLegalName: "الاسم القانوني الكامل للناشر",
      organisationName: "اسم المنظمة",
      projectOwner: "صاحب المشروع",
      publisherLegalForm: "الشكل القانوني للناشر",
      registeredAddress: "العنوان المسجل",
      registrationNumber: "رقم التسجيل",
      taxNumber: "الرقم الضريبي",
      legalRepresentative: "الممثل القانوني",
      editorInChief: "رئيس التحرير",
      contactEmail: "بريد التواصل",
      privacyContactEmail: "بريد الخصوصية",
      phone: "الهاتف",
      socialLinks: "الروابط الاجتماعية",
      mediaRegistryNumber: "رقم سجل الوسيلة",
      lastUpdated: "آخر تحديث"
    }
  }
};

const fallbackByLang: Record<string, ImpressumContent> = {
  sr: {
    heroTitle: "Impresum cuva osnovne podatke o platformi, izdavacu i urednickoj odgovornosti.",
    editorialPolicyShort:
      "Avangarda je autorska dokumentarno-istrazivacka platforma udruzenja NOVA SPONA - Centar za drustvene inicijative. Platforma objavljuje tekstove, intervjue, analize, video sadrzaje i druge autorske forme iz oblasti drustva, ljudskih prava, ekologije, kulture i politickih procesa.",
    pageSummary:
      "Ova stranica objedinjeno prikazuje identitet platforme, podatke o izdavacu i okvir urednicke i autorske odgovornosti, bez tvrdnje da je Avangarda trenutno upisana u Registar medija APR-a.",
    statusNote:
      "Avangarda trenutno funkcionise kao autorska dokumentarno-istrazivacka platforma udruzenja NOVA SPONA - Centar za drustvene inicijative. Ukoliko platforma bude upisana u Registar medija Agencije za privredne registre Republike Srbije, podaci o registraciji i registarski broj medija bice objavljeni na ovoj stranici.",
    copyrightNotice:
      "Svi tekstovi, fotografije, video materijali i drugi sadrzaji objavljeni na platformi Avangarda zasticeni su autorskim pravom, osim ako je drugacije naznaceno. Preuzimanje sadrzaja dozvoljeno je samo uz jasno navodjenje izvora i autora, kao i aktivan link ka originalnom sadrzaju kada je to tehnicki moguce.",
    responsibilityNote:
      "Objavljeni tekstovi i autorski sadrzaji izrazavaju stavove autora, osim ako je izricito navedeno drugacije. Avangarda zadrzava pravo da uredjuje, dopunjuje ili uklanja sadrzaj u skladu sa urednickim standardima, zakonom i zastitom dostojanstva osoba o kojima se pise.",
    siteName: "Avangarda",
    publisherName: "NOVA SPONA - Centar za drustvene inicijative",
    publisherFullLegalName: "NOVA SPONA - Centar za drustvene inicijative",
    organisationName: "NOVA SPONA - Centar za drustvene inicijative",
    publisherLegalForm: "Udruzenje",
    registeredAddress: "Mirka Milojkovica 34",
    municipality: "Palilula, Beograd",
    country: "Srbija",
    registrationNumber: "28180292",
    taxNumber: "109128615",
    legalRepresentative: "Ilhan Radetinac",
    editorInChief: "Ilhan Radetinac",
    contactEmail: "info@avangarda.media",
    websiteUrl: "https://www.avangarda.media",
    socialLinks: [],
    mediaProjectName: "Avangarda",
    projectOwner: "NOVA SPONA - Centar za drustvene inicijative",
    privacyContactEmail: "info@avangarda.media",
    mediaRegistryNumber: null,
    lastUpdatedLabel: "Poslednje azuriranje",
    lastUpdated: null
  },
  en: {
    heroTitle: "The imprint gathers the platform's core facts, publisher details and editorial responsibility.",
    editorialPolicyShort:
      "Avangarda is an author-led documentary and investigative platform of the association NOVA SPONA - Center for Social Initiatives. The platform publishes texts, interviews, analyses, video work and other authored formats focused on society, human rights, ecology, culture and political processes.",
    pageSummary:
      "This page brings together the identity of the platform, the publisher's details and the framework of editorial and authorship responsibility, without claiming that Avangarda is currently registered in Serbia's official media register.",
    statusNote:
      "Avangarda currently operates as an author-led documentary and investigative platform of the association NOVA SPONA - Center for Social Initiatives. If the platform is later entered into the Media Register of the Serbian Business Registers Agency, registration data and the media registry number will be published on this page.",
    copyrightNotice:
      "All texts, photographs, video materials and other content published on Avangarda are protected by copyright unless stated otherwise. Republishing is allowed only with clear attribution to the source and author, together with an active link to the original content whenever technically possible.",
    responsibilityNote:
      "Published texts and authored materials express the views of their authors unless explicitly stated otherwise. Avangarda reserves the right to edit, supplement or remove content in line with editorial standards, applicable law and the protection of the dignity of the people written about.",
    siteName: "Avangarda",
    publisherName: "NOVA SPONA - Center for Social Initiatives",
    publisherFullLegalName: "NOVA SPONA - Center for Social Initiatives",
    organisationName: "NOVA SPONA - Center for Social Initiatives",
    publisherLegalForm: "Association",
    registeredAddress: "Mirka Milojkovica 34",
    municipality: "Palilula, Belgrade",
    country: "Serbia",
    registrationNumber: "28180292",
    taxNumber: "109128615",
    legalRepresentative: "Ilhan Radetinac",
    editorInChief: "Ilhan Radetinac",
    contactEmail: "info@avangarda.media",
    websiteUrl: "https://www.avangarda.media",
    socialLinks: [],
    mediaProjectName: "Avangarda",
    projectOwner: "NOVA SPONA - Center for Social Initiatives",
    privacyContactEmail: "info@avangarda.media",
    mediaRegistryNumber: null,
    lastUpdatedLabel: "Last updated",
    lastUpdated: null
  },
  de: {
    heroTitle: "Das Impressum sammelt die Kerndaten der Plattform, des Herausgebers und der redaktionellen Verantwortung.",
    editorialPolicyShort:
      "Avangarda ist eine autorengefuehrte dokumentarische und investigative Plattform des Vereins NOVA SPONA - Center for Social Initiatives. Die Plattform veroeffentlicht Texte, Interviews, Analysen, Videoarbeiten und andere autorische Formate zu Gesellschaft, Menschenrechten, Oekologie, Kultur und politischen Prozessen.",
    pageSummary:
      "Diese Seite buendelt die Identitaet der Plattform, die Angaben zum Herausgeber und den Rahmen redaktioneller und urheberrechtlicher Verantwortung, ohne zu behaupten, dass Avangarda derzeit im serbischen Medienregister eingetragen ist.",
    statusNote:
      "Avangarda arbeitet derzeit als autorengefuehrte dokumentarische und investigative Plattform des Vereins NOVA SPONA - Center for Social Initiatives. Sollte die Plattform spaeter in das Medienregister der serbischen Agentur fuer Unternehmensregister eingetragen werden, werden die Registrierungsdaten und die Medienregisternummer auf dieser Seite veroeffentlicht.",
    copyrightNotice:
      "Alle auf Avangarda veroeffentlichten Texte, Fotografien, Videomaterialien und sonstigen Inhalte sind urheberrechtlich geschuetzt, sofern nicht anders angegeben. Die Uebernahme von Inhalten ist nur mit klarer Nennung von Quelle und Autor sowie mit einem aktiven Link zum Originalinhalt erlaubt, wenn dies technisch moeglich ist.",
    responsibilityNote:
      "Veroeffentlichte Texte und autorische Inhalte geben die Ansichten ihrer Autorinnen und Autoren wieder, sofern nicht ausdruecklich anders vermerkt. Avangarda behaelt sich das Recht vor, Inhalte im Einklang mit redaktionellen Standards, dem Gesetz und dem Schutz der Wuerde der betroffenen Personen zu bearbeiten, zu ergaenzen oder zu entfernen.",
    siteName: "Avangarda",
    publisherName: "NOVA SPONA - Center for Social Initiatives",
    publisherFullLegalName: "NOVA SPONA - Center for Social Initiatives",
    organisationName: "NOVA SPONA - Center for Social Initiatives",
    publisherLegalForm: "Verein",
    registeredAddress: "Mirka Milojkovica 34",
    municipality: "Palilula, Belgrad",
    country: "Serbien",
    registrationNumber: "28180292",
    taxNumber: "109128615",
    legalRepresentative: "Ilhan Radetinac",
    editorInChief: "Ilhan Radetinac",
    contactEmail: "info@avangarda.media",
    websiteUrl: "https://www.avangarda.media",
    socialLinks: [],
    mediaProjectName: "Avangarda",
    projectOwner: "NOVA SPONA - Center for Social Initiatives",
    privacyContactEmail: "info@avangarda.media",
    mediaRegistryNumber: null,
    lastUpdatedLabel: "Zuletzt aktualisiert",
    lastUpdated: null
  },
  fr: {
    heroTitle: "Les mentions legales rassemblent les donnees essentielles de la plateforme, de l'editeur et de la responsabilite editoriale.",
    editorialPolicyShort:
      "Avangarda est une plateforme d'auteur, documentaire et investigative de l'association NOVA SPONA - Center for Social Initiatives. La plateforme publie des textes, des entretiens, des analyses, des contenus video et d'autres formes d'auteur autour de la societe, des droits humains, de l'ecologie, de la culture et des processus politiques.",
    pageSummary:
      "Cette page rassemble l'identite de la plateforme, les donnees de l'editeur et le cadre de la responsabilite editoriale et d'auteur, sans affirmer qu'Avangarda est actuellement inscrite au registre officiel des medias en Serbie.",
    statusNote:
      "Avangarda fonctionne actuellement comme une plateforme d'auteur, documentaire et investigative de l'association NOVA SPONA - Center for Social Initiatives. Si la plateforme est plus tard inscrite au Registre des medias de l'Agence serbe des registres des entreprises, les donnees d'enregistrement et le numero media seront publies sur cette page.",
    copyrightNotice:
      "Tous les textes, photographies, videos et autres contenus publies sur Avangarda sont proteges par le droit d'auteur, sauf mention contraire. La reprise de contenu n'est autorisee qu'avec une mention claire de la source et de l'auteur, ainsi qu'un lien actif vers le contenu original lorsque c'est techniquement possible.",
    responsibilityNote:
      "Les textes publies et les contenus d'auteur expriment les positions de leurs auteurs, sauf indication expresse contraire. Avangarda se reserve le droit d'editer, de completer ou de retirer un contenu conformement aux standards editoriaux, a la loi et a la protection de la dignite des personnes concernees.",
    siteName: "Avangarda",
    publisherName: "NOVA SPONA - Center for Social Initiatives",
    publisherFullLegalName: "NOVA SPONA - Center for Social Initiatives",
    organisationName: "NOVA SPONA - Center for Social Initiatives",
    publisherLegalForm: "Association",
    registeredAddress: "Mirka Milojkovica 34",
    municipality: "Palilula, Belgrade",
    country: "Serbie",
    registrationNumber: "28180292",
    taxNumber: "109128615",
    legalRepresentative: "Ilhan Radetinac",
    editorInChief: "Ilhan Radetinac",
    contactEmail: "info@avangarda.media",
    websiteUrl: "https://www.avangarda.media",
    socialLinks: [],
    mediaProjectName: "Avangarda",
    projectOwner: "NOVA SPONA - Center for Social Initiatives",
    privacyContactEmail: "info@avangarda.media",
    mediaRegistryNumber: null,
    lastUpdatedLabel: "Derniere mise a jour",
    lastUpdated: null
  },
  tr: {
    heroTitle: "Kunye, platformun temel kimligini, yayinci bilgilerini ve editoryal sorumlulugu bir araya getirir.",
    editorialPolicyShort:
      "Avangarda, NOVA SPONA - Center for Social Initiatives derneginin yazar odakli belgesel ve arastirmaci platformudur. Platform; toplum, insan haklari, ekoloji, kultur ve politik surecler alaninda metinler, roportajlar, analizler, video icerikleri ve diger yazar islerini yayimlar.",
    pageSummary:
      "Bu sayfa platformun kimligini, yayinci bilgilerini ve editoryal ve telif sorumlulugu cercevesini bir araya getirir; Avangarda'nin su anda Sirbistan'daki resmi medya siciline kayitli oldugu iddiasinda bulunmaz.",
    statusNote:
      "Avangarda su anda NOVA SPONA - Center for Social Initiatives derneginin yazar odakli belgesel ve arastirmaci platformu olarak calismaktadir. Platform ileride Sirbistan Is Kayitlari Ajansi'nin Medya Siciline kaydolursa, kayit bilgileri ve medya sicil numarasi bu sayfada yayimlanacaktir.",
    copyrightNotice:
      "Avangarda'da yayimlanan tum metinler, fotograflar, video materyalleri ve diger icerikler, aksi belirtilmedikce telif hakkiyla korunur. Icerigin yeniden kullanimi yalnizca kaynak ve yazar acikca belirtilerek ve teknik olarak mumkun oldugunda orijinal icerige aktif bir baglanti verilerek mumkundur.",
    responsibilityNote:
      "Yayimlanan metinler ve yazar icerikleri, acikca farkli belirtilmedigi surece yazarlarin goruslerini ifade eder. Avangarda, yazilan kisilerin onurunun korunmasi, yasa ve editoryal standartlarla uyum icinde icerigi duzenleme, tamamlama veya kaldirma hakkini sakli tutar.",
    siteName: "Avangarda",
    publisherName: "NOVA SPONA - Center for Social Initiatives",
    publisherFullLegalName: "NOVA SPONA - Center for Social Initiatives",
    organisationName: "NOVA SPONA - Center for Social Initiatives",
    publisherLegalForm: "Dernek",
    registeredAddress: "Mirka Milojkovica 34",
    municipality: "Palilula, Belgrad",
    country: "Sirbistan",
    registrationNumber: "28180292",
    taxNumber: "109128615",
    legalRepresentative: "Ilhan Radetinac",
    editorInChief: "Ilhan Radetinac",
    contactEmail: "info@avangarda.media",
    websiteUrl: "https://www.avangarda.media",
    socialLinks: [],
    mediaProjectName: "Avangarda",
    projectOwner: "NOVA SPONA - Center for Social Initiatives",
    privacyContactEmail: "info@avangarda.media",
    mediaRegistryNumber: null,
    lastUpdatedLabel: "Son guncelleme",
    lastUpdated: null
  },
  ar: {
    heroTitle: "تجمع هذه الصفحة البيانات الأساسية للمنصة، ومعلومات الناشر، والمسؤولية التحريرية.",
    editorialPolicyShort:
      "أفانغاردا منصة وثائقية وتحقيقية تقودها أصوات مؤلفة، تعمل ضمن جمعية NOVA SPONA - مركز المبادرات الاجتماعية. تنشر المنصة نصوصاً، مقابلات، تحليلات، أعمالاً مرئية وصيغاً مؤلفة أخرى تركّز على المجتمع وحقوق الإنسان والبيئة والثقافة والعمليات السياسية.",
    pageSummary:
      "تجمع هذه الصفحة هوية المنصة وبيانات الناشر وإطار المسؤولية التحريرية وحقوق النشر، من دون الادعاء بأن أفانغاردا مسجلة حالياً في السجل الإعلامي الرسمي في صربيا.",
    statusNote:
      "تعمل أفانغاردا حالياً كمنصة وثائقية وتحقيقية مؤلفة ضمن جمعية NOVA SPONA - مركز المبادرات الاجتماعية. إذا تم تسجيل المنصة لاحقاً في سجل الإعلام لدى وكالة السجلات الاقتصادية في صربيا، فسيتم نشر بيانات التسجيل ورقم السجل الإعلامي في هذه الصفحة.",
    copyrightNotice:
      "جميع النصوص والصور والمواد المرئية والمحتوى الآخر المنشور على أفانغاردا محمي بحقوق النشر ما لم يُذكر خلاف ذلك. لا يُسمح بإعادة النشر إلا مع نسب واضح إلى المصدر والكاتب، ومع رابط فعّال إلى المحتوى الأصلي متى كان ذلك ممكناً تقنياً.",
    responsibilityNote:
      "تعبر النصوص والمواد المؤلفة المنشورة عن آراء كتابها، ما لم يُذكر خلاف ذلك صراحة. تحتفظ أفانغاردا بحق تحرير المحتوى أو استكماله أو إزالته وفقاً للمعايير التحريرية والقانون المعمول به وحماية كرامة الأشخاص الذين يجري الكتابة عنهم.",
    siteName: "أفانغاردا",
    publisherName: "NOVA SPONA - مركز المبادرات الاجتماعية",
    publisherFullLegalName: "NOVA SPONA - مركز المبادرات الاجتماعية",
    organisationName: "NOVA SPONA - مركز المبادرات الاجتماعية",
    publisherLegalForm: "جمعية",
    registeredAddress: "ميركا ميلويكوفيتشا 34",
    municipality: "باليلولا، بلغراد",
    country: "صربيا",
    registrationNumber: "28180292",
    taxNumber: "109128615",
    legalRepresentative: "إلهان راديتيناتس",
    editorInChief: "إلهان راديتيناتس",
    contactEmail: "info@avangarda.media",
    websiteUrl: "https://www.avangarda.media",
    socialLinks: [],
    mediaProjectName: "أفانغاردا",
    projectOwner: "NOVA SPONA - مركز المبادرات الاجتماعية",
    privacyContactEmail: "info@avangarda.media",
    mediaRegistryNumber: null,
    lastUpdatedLabel: "آخر تحديث",
    lastUpdated: null
  }
};

function normalizeForLang(value: string, lang: Lang) {
  return lang === "sr" ? normalizeSerbianLatin(value) : value;
}

function pickLocalizedValue(record: CmsImpressumRecord, field: string, lang: Lang) {
  const baseValue = record[field];
  if (lang === "sr") {
    return typeof baseValue === "string" ? normalizeSerbianLatin(baseValue).trim() : "";
  }

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  if (typeof translatedValue === "string" && translatedValue.trim()) {
    return translatedValue.trim();
  }

  return typeof baseValue === "string" ? baseValue.trim() : "";
}

function pickLocalizedTranslation(record: CmsImpressumRecord, field: string, lang: Lang) {
  if (lang === "sr") {
    return pickLocalizedValue(record, field, lang);
  }

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  return typeof translatedValue === "string" && translatedValue.trim() ? translatedValue.trim() : "";
}

function trimString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeSocialLinks(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as { platform?: unknown; url?: unknown };
    const platform = typeof record.platform === "string" ? record.platform : "";
    const url = typeof record.url === "string" ? record.url.trim() : "";

    if (!platform || !url) return [];

    return [{
      platform: platform as SocialPlatform,
      url
    }];
  });
}

function normalizeTextKey(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAddress(content: ImpressumContent) {
  return [
    content.registeredAddress?.trim(),
    content.municipality?.trim(),
    content.country?.trim()
  ].filter(Boolean).join(", ");
}

function getSocialLabel(platform: SocialPlatform, lang: Lang) {
  const labels: Record<SocialPlatform, Record<Lang, string>> = {
    instagram: { sr: "Instagram", en: "Instagram", de: "Instagram", fr: "Instagram", tr: "Instagram", es: "Instagram", el: "Instagram", ar: "Instagram" },
    tiktok: { sr: "TikTok", en: "TikTok", de: "TikTok", fr: "TikTok", tr: "TikTok", es: "TikTok", el: "TikTok", ar: "TikTok" },
    x: { sr: "X", en: "X", de: "X", fr: "X", tr: "X", es: "X", el: "X", ar: "X" },
    facebook: { sr: "Facebook", en: "Facebook", de: "Facebook", fr: "Facebook", tr: "Facebook", es: "Facebook", el: "Facebook", ar: "Facebook" },
    youtube: { sr: "YouTube", en: "YouTube", de: "YouTube", fr: "YouTube", tr: "YouTube", es: "YouTube", el: "YouTube", ar: "YouTube" },
    linkedin: { sr: "LinkedIn", en: "LinkedIn", de: "LinkedIn", fr: "LinkedIn", tr: "LinkedIn", es: "LinkedIn", el: "LinkedIn", ar: "LinkedIn" },
    website: { sr: "Sajt", en: "Website", de: "Website", fr: "Site", tr: "Web sitesi", es: "Sitio web", el: "Ιστότοπος", ar: "الموقع" }
  };

  return labels[platform]?.[lang] || platform;
}

function getFallbackContent(lang: Lang) {
  return fallbackByLang[lang] ?? fallbackByLang.en;
}

function buildContentFromCms(record: CmsImpressumRecord, lang: Lang): ImpressumContent {
  const fallback = getFallbackContent(lang);
  const socialLinks = normalizeSocialLinks(record.socialLinks);

  return {
    heroTitle: pickLocalizedTranslation(record, "heroTitle", lang) || fallback.heroTitle,
    editorialPolicyShort: pickLocalizedTranslation(record, "editorialPolicyShort", lang) || fallback.editorialPolicyShort,
    pageSummary: pickLocalizedTranslation(record, "pageSummary", lang) || fallback.pageSummary,
    statusNote: pickLocalizedTranslation(record, "statusNote", lang) || fallback.statusNote,
    copyrightNotice: pickLocalizedTranslation(record, "copyrightNotice", lang) || fallback.copyrightNotice,
    responsibilityNote: pickLocalizedTranslation(record, "responsibilityNote", lang) || fallback.responsibilityNote,
    siteName: pickLocalizedTranslation(record, "siteName", lang) || fallback.siteName,
    publisherName: pickLocalizedTranslation(record, "publisherName", lang) || fallback.publisherName,
    publisherFullLegalName: pickLocalizedTranslation(record, "publisherFullLegalName", lang) || fallback.publisherFullLegalName,
    organisationName: pickLocalizedTranslation(record, "organisationName", lang) || fallback.organisationName,
    publisherLegalForm: pickLocalizedTranslation(record, "publisherLegalForm", lang) || fallback.publisherLegalForm,
    registeredAddress: pickLocalizedTranslation(record, "registeredAddress", lang) || fallback.registeredAddress,
    municipality: pickLocalizedTranslation(record, "municipality", lang) || fallback.municipality,
    country: pickLocalizedTranslation(record, "country", lang) || fallback.country,
    registrationNumber: trimString(record.registrationNumber) || fallback.registrationNumber,
    taxNumber: trimString(record.taxNumber) || fallback.taxNumber,
    legalRepresentative: pickLocalizedTranslation(record, "legalRepresentative", lang) || fallback.legalRepresentative,
    editorInChief: pickLocalizedTranslation(record, "editorInChief", lang) || fallback.editorInChief,
    contactEmail: trimString(record.contactEmail) || fallback.contactEmail,
    phone: trimString(record.phone) || undefined,
    websiteUrl: trimString(record.websiteUrl) || fallback.websiteUrl,
    socialLinks: socialLinks.length ? socialLinks : fallback.socialLinks,
    mediaProjectName: pickLocalizedTranslation(record, "mediaProjectName", lang) || fallback.mediaProjectName,
    projectOwner: pickLocalizedTranslation(record, "projectOwner", lang) || fallback.projectOwner,
    privacyContactEmail: trimString(record.privacyContactEmail) || fallback.privacyContactEmail,
    mediaRegistryNumber: trimString(record.mediaRegistryNumber) ?? fallback.mediaRegistryNumber,
    lastUpdatedLabel: pickLocalizedTranslation(record, "lastUpdatedLabel", lang) || fallback.lastUpdatedLabel,
    lastUpdated: trimString(record.lastUpdated) ?? fallback.lastUpdated
  };
}

function pushUniqueEntry(
  entries: ImpressumEntry[],
  seenValues: Set<string>,
  label: string,
  value?: string,
  href?: string
) {
  const trimmed = value?.trim();
  if (!trimmed) return;

  const normalizedValue = normalizeTextKey(trimmed);
  if (normalizedValue && seenValues.has(normalizedValue)) return;
  if (normalizedValue) seenValues.add(normalizedValue);

  entries.push({ label, value: trimmed, href });
}

function buildImpressumEntries(content: ImpressumContent, lang: Lang) {
  const labels = chromeByLang[lang].fields;
  const entries: ImpressumEntry[] = [];
  const seenValues = new Set<string>();

  pushUniqueEntry(entries, seenValues, labels.siteName, content.siteName);
  pushUniqueEntry(entries, seenValues, labels.mediaProjectName, content.mediaProjectName);
  pushUniqueEntry(entries, seenValues, labels.websiteUrl, content.websiteUrl, content.websiteUrl);
  pushUniqueEntry(entries, seenValues, labels.publisherName, content.publisherName);
  pushUniqueEntry(entries, seenValues, labels.publisherFullLegalName, content.publisherFullLegalName);
  pushUniqueEntry(entries, seenValues, labels.organisationName, content.organisationName);
  pushUniqueEntry(entries, seenValues, labels.projectOwner, content.projectOwner);
  pushUniqueEntry(entries, seenValues, labels.publisherLegalForm, content.publisherLegalForm);
  pushUniqueEntry(entries, seenValues, labels.registeredAddress, buildAddress(content));
  pushUniqueEntry(entries, seenValues, labels.registrationNumber, content.registrationNumber);
  pushUniqueEntry(entries, seenValues, labels.taxNumber, content.taxNumber);
  pushUniqueEntry(entries, seenValues, labels.legalRepresentative, content.legalRepresentative);
  pushUniqueEntry(entries, seenValues, labels.editorInChief, content.editorInChief);
  pushUniqueEntry(
    entries,
    seenValues,
    labels.contactEmail,
    content.contactEmail,
    content.contactEmail ? `mailto:${content.contactEmail}` : undefined
  );

  if (
    content.privacyContactEmail &&
    normalizeTextKey(content.privacyContactEmail) !== normalizeTextKey(content.contactEmail)
  ) {
    pushUniqueEntry(
      entries,
      seenValues,
      labels.privacyContactEmail,
      content.privacyContactEmail,
      `mailto:${content.privacyContactEmail}`
    );
  }

  pushUniqueEntry(entries, seenValues, labels.phone, content.phone, content.phone ? `tel:${content.phone}` : undefined);

  if (content.socialLinks.length) {
    entries.push({
      label: labels.socialLinks,
      links: content.socialLinks.map((link) => ({
        label: getSocialLabel(link.platform, lang),
        href: link.url
      }))
    });
  }

  if (content.mediaRegistryNumber?.trim()) {
    entries.push({
      label: labels.mediaRegistryNumber,
      value: content.mediaRegistryNumber.trim()
    });
  }

  if (content.lastUpdated?.trim()) {
    entries.push({
      label: content.lastUpdatedLabel?.trim() || labels.lastUpdated,
      value: formatDisplayDate(content.lastUpdated, lang)
    });
  }

  return entries;
}

function buildPageCopy(content: ImpressumContent, lang: Lang): ImpressumPageCopy {
  const chrome = chromeByLang[lang] ?? chromeByLang.en;

  return {
    label: chrome.label,
    title: normalizeForLang(content.heroTitle, lang),
    intro: normalizeForLang(content.editorialPolicyShort, lang),
    summary: normalizeForLang(content.pageSummary, lang),
    detailsLabel: chrome.detailsLabel,
    detailsTitle: chrome.detailsTitle,
    details: buildImpressumEntries(content, lang),
    noteLabel: chrome.noteLabel,
    noteTitle: chrome.noteTitle,
    noteCopy: normalizeForLang(content.statusNote, lang),
    rightsLabel: chrome.rightsLabel,
    rightsTitle: chrome.rightsTitle,
    rightsCopy: normalizeForLang(content.copyrightNotice, lang),
    responsibilityLabel: chrome.responsibilityLabel,
    responsibilityTitle: chrome.responsibilityTitle,
    responsibilityCopy: normalizeForLang(content.responsibilityNote, lang)
  };
}

export function getFallbackImpressumPageCopy(lang: Lang) {
  return buildPageCopy(getFallbackContent(lang), lang);
}

export async function fetchImpressumPageCopy(lang: Lang): Promise<ImpressumPageCopy> {
  const response = await strapiGet<{ data: unknown }>("/api/impressum");
  const cmsRecord = unwrapStrapiSingle<CmsImpressumRecord>(response);

  if (!cmsRecord) {
    return getFallbackImpressumPageCopy(lang);
  }

  return buildPageCopy(buildContentFromCms(cmsRecord, lang), lang);
}
