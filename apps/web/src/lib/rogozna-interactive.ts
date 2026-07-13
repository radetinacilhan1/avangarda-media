import type { Lang } from "@/lib/i18n";

export type RogoznaEvidenceType =
  | "photo"
  | "testimony"
  | "document"
  | "sample"
  | "officialResponse"
  | "fieldNote";

export type RogoznaLocation = "forest" | "creek" | "village" | "road" | "institution" | "archive";

export type RogoznaMeters = {
  evidence: number;
  time: number;
  damage: number;
  trust: number;
};

export type RogoznaCondition = {
  minTrust?: number;
  maxTrust?: number;
  minEvidenceTypes?: number;
  evidenceAny?: RogoznaEvidenceType[];
  evidenceAll?: RogoznaEvidenceType[];
  choiceMade?: string;
};

export type RogoznaPublicationMode = "early" | "qualified" | "timely" | "wait";

export type RogoznaChoice = {
  id: string;
  location: RogoznaLocation;
  action: string;
  response: string;
  delta: RogoznaMeters;
  evidence?: RogoznaEvidenceType[];
  request?: boolean;
  officialResponse?: "procedural" | "concrete";
  delay?: boolean;
  publication?: RogoznaPublicationMode;
  protectsSource?: boolean;
  credibilityRisk?: number;
  variantGroup?: string;
  condition?: RogoznaCondition;
};

export type RogoznaDecision = {
  id: string;
  prompt: string;
  detail: string;
  choices: RogoznaChoice[];
};

export type RogoznaPhase = {
  id: 1 | 2 | 3 | 4;
  label: string;
  title: string;
  theme: string;
  scenario: string;
  decisions: RogoznaDecision[];
};

export type RogoznaEndingId = "early" | "procedure" | "trace" | "late";

export type RogoznaEnding = {
  eyebrow: string;
  title: string;
  copy: string;
  quote: string;
};

export type RogoznaOutcomeSummary = {
  meters: RogoznaMeters;
  evidenceTypes: RogoznaEvidenceType[];
  requestCount: number;
  responseCount: number;
  concreteResponseCount: number;
  delayCount: number;
  credibilityRisk: number;
  publications: Array<{
    mode: RogoznaPublicationMode;
    evidenceAtChoice: number;
    diversityAtChoice: number;
  }>;
};

type RogoznaFunctionalCopy = {
  sectionLabel: string;
  collectionLabel: string;
  gameTitle: string;
  gameSubtitle: string;
  typeLabel: string;
  durationLabel: string;
  durationValue: string;
  openLabel: string;
  startLabel: string;
  continueLabel: string;
  backLabel: string;
  understandLabel: string;
  restartLabel: string;
  shareLabel: string;
  shareCopiedLabel: string;
  shareUnavailableLabel: string;
  decisionLabel: string;
  choicesLabel: string;
  metersLabel: string;
  evidenceLabel: string;
  timeLabel: string;
  damageLabel: string;
  trustLabel: string;
  daysLabel: string;
  dossierLabel: string;
  emptyDossierLabel: string;
  visitedLabel: string;
  visitedStatusLabel: string;
  availableStatusLabel: string;
  lockedStatusLabel: string;
  requestsLabel: string;
  responsesLabel: string;
  concreteResponsesLabel: string;
  delaysLabel: string;
  resultLabel: string;
  contextEyebrow: string;
  contextTitle: string;
  phaseTitles: [string, string, string, string];
  evidenceLabels: Record<RogoznaEvidenceType, string>;
  locationLabels: Record<RogoznaLocation, string>;
  damageMessages: [string, string, string, string];
  languageNotice?: string;
};

type RogoznaNarrative = {
  listingSeoDescription: string;
  seoDescription: string;
  introEyebrow: string;
  introStatement: string;
  introCopy: string;
  phases: RogoznaPhase[];
  endings: Record<RogoznaEndingId, RogoznaEnding>;
  contextIntro: string;
  contextCards: Array<{ title: string; copy: string }>;
  inspiration: string;
};

export type RogoznaCopy = RogoznaFunctionalCopy & RogoznaNarrative;

const evidenceLabelsEn: Record<RogoznaEvidenceType, string> = {
  photo: "Photograph",
  testimony: "Testimony",
  document: "Document",
  sample: "Sample",
  officialResponse: "Official response",
  fieldNote: "Field note",
};

const locationLabelsEn: Record<RogoznaLocation, string> = {
  forest: "Forest",
  creek: "Creek",
  village: "Village",
  road: "Road",
  institution: "Institution",
  archive: "Document archive",
};

const functionalCopy: Record<Lang, RogoznaFunctionalCopy> = {
  sr: {
    sectionLabel: "Interaktivno",
    collectionLabel: "Dva načina da uđeš u sistem",
    gameTitle: "Rogozna: Planina koja nestaje",
    gameSubtitle: "Interaktivna priča o šumi, vodi, institucijama i šteti koja postaje vidljiva tek kada je možda već kasno.",
    typeLabel: "Interaktivna ekološka simulacija",
    durationLabel: "Trajanje",
    durationValue: "6-10 minuta",
    openLabel: "Otvori",
    startLabel: "Kreni na teren",
    continueLabel: "Nastavi",
    backLabel: "Nazad",
    understandLabel: "Razumi šta se desilo",
    restartLabel: "Igraj ponovo",
    shareLabel: "Podeli simulaciju",
    shareCopiedLabel: "Link je kopiran.",
    shareUnavailableLabel: "Kopiranje linka trenutno nije dostupno.",
    decisionLabel: "Odluka",
    choicesLabel: "Sledeći trag",
    metersLabel: "Stanje terena i istrage",
    evidenceLabel: "Dokazi",
    timeLabel: "Vreme",
    damageLabel: "Šteta",
    trustLabel: "Poverenje",
    daysLabel: "dana",
    dossierLabel: "Dosije dokaza",
    emptyDossierLabel: "Još nema pouzdanog dokaza.",
    visitedLabel: "Posećene lokacije",
    visitedStatusLabel: "Posećeno",
    availableStatusLabel: "Dostupno sada",
    lockedStatusLabel: "Zaključano do sledeće odluke",
    requestsLabel: "Poslati zahtevi",
    responsesLabel: "Odgovori",
    concreteResponsesLabel: "Konkretni odgovori",
    delaysLabel: "Odluke sa odlaganjem",
    resultLabel: "Ishod",
    contextEyebrow: "Kontekst",
    contextTitle: "Šta se upravo desilo?",
    phaseTitles: ["Tragovi", "Procedura", "Normalizacija", "Posledica"],
    evidenceLabels: {
      photo: "Fotografija",
      testimony: "Svedočenje",
      document: "Dokument",
      sample: "Uzorak",
      officialResponse: "Zvanični odgovor",
      fieldNote: "Terenska beleška",
    },
    locationLabels: {
      forest: "Šuma",
      creek: "Potok",
      village: "Selo",
      road: "Put",
      institution: "Institucija",
      archive: "Arhiva dokumenata",
    },
    damageMessages: [
      "Tragovi su lokalni i još uvek sporni.",
      "Promena više nije samo tačka na terenu.",
      "Dokazi se gomilaju. Takođe i posledice.",
      "Pitanje više nije da li se nešto dogodilo.",
    ],
  },
  en: {
    sectionLabel: "Interactive",
    collectionLabel: "Two ways to enter the system",
    gameTitle: "Rogozna: The Disappearing Mountain",
    gameSubtitle: "An interactive story about forest, water, institutions and damage that becomes visible only when it may already be too late.",
    typeLabel: "Interactive environmental simulation",
    durationLabel: "Duration",
    durationValue: "6-10 minutes",
    openLabel: "Open",
    startLabel: "Enter the field",
    continueLabel: "Continue",
    backLabel: "Back",
    understandLabel: "Understand what happened",
    restartLabel: "Play again",
    shareLabel: "Share simulation",
    shareCopiedLabel: "Link copied.",
    shareUnavailableLabel: "The link could not be copied.",
    decisionLabel: "Decision",
    choicesLabel: "Next trace",
    metersLabel: "State of the field and investigation",
    evidenceLabel: "Evidence",
    timeLabel: "Time",
    damageLabel: "Damage",
    trustLabel: "Trust",
    daysLabel: "days",
    dossierLabel: "Evidence dossier",
    emptyDossierLabel: "There is no reliable evidence yet.",
    visitedLabel: "Visited locations",
    visitedStatusLabel: "Visited",
    availableStatusLabel: "Available now",
    lockedStatusLabel: "Locked until the next decision",
    requestsLabel: "Requests sent",
    responsesLabel: "Responses",
    concreteResponsesLabel: "Concrete responses",
    delaysLabel: "Delay decisions",
    resultLabel: "Outcome",
    contextEyebrow: "Context",
    contextTitle: "What just happened?",
    phaseTitles: ["Traces", "Procedure", "Normalization", "Consequence"],
    evidenceLabels: evidenceLabelsEn,
    locationLabels: locationLabelsEn,
    damageMessages: [
      "The traces are local and still disputed.",
      "The change is no longer a single point on the terrain.",
      "Evidence is accumulating. So are the consequences.",
      "The question is no longer whether something happened.",
    ],
  },
  tr: {
    sectionLabel: "Etkileşimli",
    collectionLabel: "Sisteme girmenin iki yolu",
    gameTitle: "Rogozna: Kaybolan Dağ",
    gameSubtitle: "Orman, su, kurumlar ve belki de çok geç olduğunda görünür hâle gelen zarar üzerine etkileşimli bir hikâye.",
    typeLabel: "Etkileşimli çevre simülasyonu",
    durationLabel: "Süre", durationValue: "6-10 dakika", openLabel: "Aç", startLabel: "Sahaya çık", continueLabel: "Devam", backLabel: "Geri",
    understandLabel: "Ne olduğunu anla", restartLabel: "Yeniden oyna", shareLabel: "Simülasyonu paylaş", shareCopiedLabel: "Bağlantı kopyalandı.", shareUnavailableLabel: "Bağlantı kopyalanamadı.",
    decisionLabel: "Karar", choicesLabel: "Sonraki iz", metersLabel: "Saha ve araştırma durumu", evidenceLabel: "Kanıt", timeLabel: "Zaman", damageLabel: "Hasar", trustLabel: "Güven", daysLabel: "gün",
    dossierLabel: "Kanıt dosyası", emptyDossierLabel: "Henüz güvenilir kanıt yok.", visitedLabel: "Ziyaret edilen yerler", visitedStatusLabel: "Ziyaret edildi", availableStatusLabel: "Şimdi kullanılabilir", lockedStatusLabel: "Sonraki karara kadar kilitli", requestsLabel: "Gönderilen talepler", responsesLabel: "Yanıtlar", concreteResponsesLabel: "Somut yanıtlar", delaysLabel: "Gecikme kararları", resultLabel: "Sonuç", contextEyebrow: "Bağlam", contextTitle: "Az önce ne oldu?",
    phaseTitles: ["İzler", "Prosedür", "Normalleştirme", "Sonuç"], evidenceLabels: { photo: "Fotoğraf", testimony: "Tanıklık", document: "Belge", sample: "Numune", officialResponse: "Resmî yanıt", fieldNote: "Saha notu" },
    locationLabels: { forest: "Orman", creek: "Dere", village: "Köy", road: "Yol", institution: "Kurum", archive: "Belge arşivi" },
    damageMessages: ["İzler yerel ve hâlâ tartışmalı.", "Değişim artık arazide tek bir nokta değil.", "Kanıtlar birikiyor. Sonuçlar da.", "Soru artık bir şey olup olmadığı değil."],
    languageNotice: "Bu simülasyonun ayrıntılı anlatımı şu anda İngilizce olarak sunulmaktadır.",
  },
  fr: {
    sectionLabel: "Interactif", collectionLabel: "Deux façons d'entrer dans le système", gameTitle: "Rogozna : la montagne qui disparaît", gameSubtitle: "Une histoire interactive sur la forêt, l'eau, les institutions et les dégâts qui ne deviennent visibles que lorsqu'il est peut-être déjà trop tard.", typeLabel: "Simulation environnementale interactive",
    durationLabel: "Durée", durationValue: "6-10 minutes", openLabel: "Ouvrir", startLabel: "Aller sur le terrain", continueLabel: "Continuer", backLabel: "Retour", understandLabel: "Comprendre ce qui s'est passé", restartLabel: "Rejouer", shareLabel: "Partager la simulation", shareCopiedLabel: "Lien copié.", shareUnavailableLabel: "Impossible de copier le lien.",
    decisionLabel: "Décision", choicesLabel: "Prochaine trace", metersLabel: "État du terrain et de l'enquête", evidenceLabel: "Preuves", timeLabel: "Temps", damageLabel: "Dégâts", trustLabel: "Confiance", daysLabel: "jours", dossierLabel: "Dossier de preuves", emptyDossierLabel: "Aucune preuve fiable pour le moment.", visitedLabel: "Lieux visités", visitedStatusLabel: "Visité", availableStatusLabel: "Disponible maintenant", lockedStatusLabel: "Verrouillé jusqu'à la prochaine décision", requestsLabel: "Demandes envoyées", responsesLabel: "Réponses", concreteResponsesLabel: "Réponses concrètes", delaysLabel: "Décisions d'attente", resultLabel: "Résultat", contextEyebrow: "Contexte", contextTitle: "Que vient-il de se passer ?",
    phaseTitles: ["Traces", "Procédure", "Normalisation", "Conséquence"], evidenceLabels: { photo: "Photographie", testimony: "Témoignage", document: "Document", sample: "Échantillon", officialResponse: "Réponse officielle", fieldNote: "Note de terrain" }, locationLabels: { forest: "Forêt", creek: "Ruisseau", village: "Village", road: "Route", institution: "Institution", archive: "Archives" }, damageMessages: ["Les traces sont locales et encore contestées.", "Le changement n'est plus un simple point sur le terrain.", "Les preuves s'accumulent. Les conséquences aussi.", "La question n'est plus de savoir si quelque chose s'est produit."], languageNotice: "Le récit détaillé de cette simulation est actuellement disponible en anglais.",
  },
  de: {
    sectionLabel: "Interaktiv", collectionLabel: "Zwei Wege in das System", gameTitle: "Rogozna: Der verschwindende Berg", gameSubtitle: "Eine interaktive Geschichte über Wald, Wasser, Institutionen und Schäden, die erst sichtbar werden, wenn es vielleicht schon zu spät ist.", typeLabel: "Interaktive Umweltsimulation",
    durationLabel: "Dauer", durationValue: "6-10 Minuten", openLabel: "Öffnen", startLabel: "Ins Gelände gehen", continueLabel: "Weiter", backLabel: "Zurück", understandLabel: "Verstehen, was geschehen ist", restartLabel: "Neu starten", shareLabel: "Simulation teilen", shareCopiedLabel: "Link kopiert.", shareUnavailableLabel: "Der Link konnte nicht kopiert werden.",
    decisionLabel: "Entscheidung", choicesLabel: "Nächste Spur", metersLabel: "Stand von Gelände und Recherche", evidenceLabel: "Belege", timeLabel: "Zeit", damageLabel: "Schaden", trustLabel: "Vertrauen", daysLabel: "Tage", dossierLabel: "Belegdossier", emptyDossierLabel: "Noch keine verlässlichen Belege.", visitedLabel: "Besuchte Orte", visitedStatusLabel: "Besucht", availableStatusLabel: "Jetzt verfügbar", lockedStatusLabel: "Bis zur nächsten Entscheidung gesperrt", requestsLabel: "Gesendete Anfragen", responsesLabel: "Antworten", concreteResponsesLabel: "Konkrete Antworten", delaysLabel: "Verzögerungsentscheidungen", resultLabel: "Ergebnis", contextEyebrow: "Kontext", contextTitle: "Was ist gerade geschehen?",
    phaseTitles: ["Spuren", "Verfahren", "Normalisierung", "Folge"], evidenceLabels: { photo: "Fotografie", testimony: "Aussage", document: "Dokument", sample: "Probe", officialResponse: "Offizielle Antwort", fieldNote: "Feldnotiz" }, locationLabels: { forest: "Wald", creek: "Bach", village: "Dorf", road: "Straße", institution: "Institution", archive: "Dokumentenarchiv" }, damageMessages: ["Die Spuren sind lokal und noch umstritten.", "Die Veränderung ist nicht mehr nur ein Punkt im Gelände.", "Die Belege häufen sich. Die Folgen ebenfalls.", "Die Frage ist nicht mehr, ob etwas geschehen ist."], languageNotice: "Die ausführliche Erzählung dieser Simulation ist derzeit auf Englisch verfügbar.",
  },
  es: {
    sectionLabel: "Interactivo", collectionLabel: "Dos formas de entrar en el sistema", gameTitle: "Rogozna: La montaña que desaparece", gameSubtitle: "Una historia interactiva sobre el bosque, el agua, las instituciones y un daño que solo se vuelve visible cuando quizá ya sea demasiado tarde.", typeLabel: "Simulación ambiental interactiva",
    durationLabel: "Duración", durationValue: "6-10 minutos", openLabel: "Abrir", startLabel: "Ir al terreno", continueLabel: "Continuar", backLabel: "Volver", understandLabel: "Entender qué ocurrió", restartLabel: "Jugar de nuevo", shareLabel: "Compartir simulación", shareCopiedLabel: "Enlace copiado.", shareUnavailableLabel: "No se pudo copiar el enlace.",
    decisionLabel: "Decisión", choicesLabel: "Siguiente rastro", metersLabel: "Estado del terreno y la investigación", evidenceLabel: "Pruebas", timeLabel: "Tiempo", damageLabel: "Daño", trustLabel: "Confianza", daysLabel: "días", dossierLabel: "Expediente de pruebas", emptyDossierLabel: "Todavía no hay pruebas fiables.", visitedLabel: "Lugares visitados", visitedStatusLabel: "Visitado", availableStatusLabel: "Disponible ahora", lockedStatusLabel: "Bloqueado hasta la próxima decisión", requestsLabel: "Solicitudes enviadas", responsesLabel: "Respuestas", concreteResponsesLabel: "Respuestas concretas", delaysLabel: "Decisiones de demora", resultLabel: "Resultado", contextEyebrow: "Contexto", contextTitle: "¿Qué acaba de ocurrir?",
    phaseTitles: ["Rastros", "Procedimiento", "Normalización", "Consecuencia"], evidenceLabels: { photo: "Fotografía", testimony: "Testimonio", document: "Documento", sample: "Muestra", officialResponse: "Respuesta oficial", fieldNote: "Nota de campo" }, locationLabels: { forest: "Bosque", creek: "Arroyo", village: "Pueblo", road: "Camino", institution: "Institución", archive: "Archivo documental" }, damageMessages: ["Los rastros son locales y aún discutidos.", "El cambio ya no es un solo punto en el terreno.", "Las pruebas se acumulan. También las consecuencias.", "La pregunta ya no es si ocurrió algo."], languageNotice: "La narración detallada de esta simulación está disponible actualmente en inglés.",
  },
  el: {
    sectionLabel: "Διαδραστικό", collectionLabel: "Δύο τρόποι εισόδου στο σύστημα", gameTitle: "Ρογκόζνα: Το βουνό που χάνεται", gameSubtitle: "Μια διαδραστική ιστορία για το δάσος, το νερό, τους θεσμούς και τη ζημιά που γίνεται ορατή όταν ίσως είναι ήδη αργά.", typeLabel: "Διαδραστική περιβαλλοντική προσομοίωση",
    durationLabel: "Διάρκεια", durationValue: "6-10 λεπτά", openLabel: "Άνοιγμα", startLabel: "Έξοδος στο πεδίο", continueLabel: "Συνέχεια", backLabel: "Πίσω", understandLabel: "Κατανόησε τι συνέβη", restartLabel: "Παίξε ξανά", shareLabel: "Κοινοποίηση προσομοίωσης", shareCopiedLabel: "Ο σύνδεσμος αντιγράφηκε.", shareUnavailableLabel: "Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.",
    decisionLabel: "Απόφαση", choicesLabel: "Επόμενο ίχνος", metersLabel: "Κατάσταση πεδίου και έρευνας", evidenceLabel: "Στοιχεία", timeLabel: "Χρόνος", damageLabel: "Ζημιά", trustLabel: "Εμπιστοσύνη", daysLabel: "ημέρες", dossierLabel: "Φάκελος στοιχείων", emptyDossierLabel: "Δεν υπάρχουν ακόμη αξιόπιστα στοιχεία.", visitedLabel: "Τοποθεσίες που επισκέφθηκες", visitedStatusLabel: "Έγινε επίσκεψη", availableStatusLabel: "Διαθέσιμο τώρα", lockedStatusLabel: "Κλειδωμένο μέχρι την επόμενη απόφαση", requestsLabel: "Αιτήματα", responsesLabel: "Απαντήσεις", concreteResponsesLabel: "Συγκεκριμένες απαντήσεις", delaysLabel: "Αποφάσεις καθυστέρησης", resultLabel: "Αποτέλεσμα", contextEyebrow: "Πλαίσιο", contextTitle: "Τι μόλις συνέβη;",
    phaseTitles: ["Ίχνη", "Διαδικασία", "Κανονικοποίηση", "Συνέπεια"], evidenceLabels: { photo: "Φωτογραφία", testimony: "Μαρτυρία", document: "Έγγραφο", sample: "Δείγμα", officialResponse: "Επίσημη απάντηση", fieldNote: "Σημείωση πεδίου" }, locationLabels: { forest: "Δάσος", creek: "Ρέμα", village: "Χωριό", road: "Δρόμος", institution: "Θεσμός", archive: "Αρχείο εγγράφων" }, damageMessages: ["Τα ίχνη είναι τοπικά και ακόμη αμφισβητούνται.", "Η αλλαγή δεν είναι πια ένα σημείο στο πεδίο.", "Τα στοιχεία συσσωρεύονται. Το ίδιο και οι συνέπειες.", "Το ερώτημα δεν είναι πλέον αν συνέβη κάτι."], languageNotice: "Η αναλυτική αφήγηση αυτής της προσομοίωσης είναι προς το παρόν διαθέσιμη στα αγγλικά.",
  },
  ar: {
    sectionLabel: "تفاعلي", collectionLabel: "طريقتان للدخول إلى النظام", gameTitle: "روغوزنا: الجبل الذي يختفي", gameSubtitle: "قصة تفاعلية عن الغابة والمياه والمؤسسات والضرر الذي لا يصبح مرئياً إلا عندما يكون الوقت قد تأخر.", typeLabel: "محاكاة بيئية تفاعلية",
    durationLabel: "المدة", durationValue: "6-10 دقائق", openLabel: "افتح", startLabel: "انزل إلى الميدان", continueLabel: "متابعة", backLabel: "رجوع", understandLabel: "افهم ما حدث", restartLabel: "العب مجدداً", shareLabel: "شارك المحاكاة", shareCopiedLabel: "تم نسخ الرابط.", shareUnavailableLabel: "تعذر نسخ الرابط.",
    decisionLabel: "القرار", choicesLabel: "الأثر التالي", metersLabel: "حالة الميدان والتحقيق", evidenceLabel: "الأدلة", timeLabel: "الوقت", damageLabel: "الضرر", trustLabel: "الثقة", daysLabel: "أيام", dossierLabel: "ملف الأدلة", emptyDossierLabel: "لا يوجد دليل موثوق بعد.", visitedLabel: "المواقع التي زرتها", visitedStatusLabel: "تمت الزيارة", availableStatusLabel: "متاح الآن", lockedStatusLabel: "مغلق حتى القرار التالي", requestsLabel: "الطلبات المرسلة", responsesLabel: "الردود", concreteResponsesLabel: "الردود المحددة", delaysLabel: "قرارات التأخير", resultLabel: "النتيجة", contextEyebrow: "السياق", contextTitle: "ماذا حدث للتو؟",
    phaseTitles: ["الآثار", "الإجراء", "التطبيع", "النتيجة"], evidenceLabels: { photo: "صورة", testimony: "شهادة", document: "وثيقة", sample: "عينة", officialResponse: "رد رسمي", fieldNote: "ملاحظة ميدانية" }, locationLabels: { forest: "الغابة", creek: "الجدول", village: "القرية", road: "الطريق", institution: "المؤسسة", archive: "أرشيف الوثائق" }, damageMessages: ["الآثار محلية وما زالت موضع خلاف.", "لم يعد التغيير نقطة واحدة في الميدان.", "الأدلة تتراكم، وكذلك العواقب.", "لم يعد السؤال ما إذا كان شيء قد حدث."], languageNotice: "السرد التفصيلي لهذه المحاكاة متاح حالياً باللغة الإنجليزية.",
  },
};

const choice = (
  id: string,
  location: RogoznaLocation,
  action: string,
  response: string,
  delta: RogoznaMeters,
  meta: Omit<Partial<RogoznaChoice>, "id" | "location" | "action" | "response" | "delta"> = {}
): RogoznaChoice => ({ id, location, action, response, delta, ...meta });

const enPhases: RogoznaPhase[] = [
  {
    id: 1, label: "Phase 1", title: "Traces", theme: "The mountain still looks the same.", scenario: "You do not know what is happening yet. You only know that the mountain is changing.",
    decisions: [
      { id: "trace-entry", prompt: "Three small changes appear at once. Where do you begin?", detail: "No single trace is large enough to name the problem.", choices: [
        choice("forest-marks", "forest", "Photograph marked trees", "The marks form a line that continues beyond the visible clearing.", { evidence: 11, time: 4, damage: 4, trust: 2 }, { evidence: ["photo", "fieldNote"] }),
        choice("creek-first-sample", "creek", "Take the first water sample", "The water is turbid. A sample preserves more than an impression.", { evidence: 14, time: 7, damage: 5, trust: 3 }, { evidence: ["sample", "fieldNote"] }),
        choice("village-first-talk", "village", "Ask who noticed first", "Two people describe the same noise on different nights.", { evidence: 8, time: 5, damage: 4, trust: 9 }, { evidence: ["testimony"] }),
      ] },
      { id: "trace-road", prompt: "Fresh tyre tracks cut across an older path.", detail: "The road exists before there is a public explanation for it.", choices: [
        choice("road-machinery-photo", "road", "Photograph machinery traces", "The frame shows scale, but not who authorized the work.", { evidence: 12, time: 4, damage: 7, trust: -1 }, { evidence: ["photo"] }),
        choice("road-route-note", "road", "Map the changed route", "A field note connects the new road to the marked trees.", { evidence: 9, time: 5, damage: 6, trust: 3 }, { evidence: ["fieldNote"] }),
        choice("road-worker-source", "road", "Speak without recording a name", "A worker confirms the road is only the first stage.", { evidence: 10, time: 7, damage: 7, trust: 7 }, { evidence: ["testimony"], protectsSource: true }),
      ] },
      { id: "trace-water", prompt: "The creek changes colour after rain.", detail: "A visible change can still be dismissed as weather.", choices: [
        choice("creek-lab-sample", "creek", "Prepare a documented sample", "The chain of custody costs time, but the sample can be checked later.", { evidence: 16, time: 10, damage: 8, trust: 4 }, { evidence: ["sample", "fieldNote"] }),
        choice("archive-water-record", "archive", "Find an older water record", "The comparison shows that turbidity was not always described this way.", { evidence: 12, time: 8, damage: 7, trust: 1 }, { evidence: ["document"] }),
        choice("creek-publish-image", "creek", "Publish the image immediately", "The image travels quickly. The cause remains unverified.", { evidence: 4, time: 1, damage: 9, trust: 3 }, { evidence: ["photo"], publication: "early", credibilityRisk: 3 }),
      ] },
      { id: "trace-first-publication", prompt: "People ask whether you will say anything publicly.", detail: "Speed can create attention. It can also harden a weak first version.", choices: [
        choice("publish-first-claim", "road", "Publish a direct claim", "You are first, but your dossier still has gaps.", { evidence: 2, time: 1, damage: 8, trust: -8 }, { publication: "early", credibilityRisk: 4 }),
        choice("wait-first-confirmation", "archive", "Wait for another confirmation", "The record becomes stronger while the terrain keeps moving.", { evidence: 5, time: 9, damage: 10, trust: 3 }, { delay: true, publication: "wait" }),
        choice("publish-limited-note", "village", "Publish a limited field note", "You describe what is visible and mark what remains unconfirmed.", { evidence: 7, time: 3, damage: 7, trust: 6 }, { publication: "qualified", credibilityRisk: 1 }),
      ] },
    ],
  },
  {
    id: 2, label: "Phase 2", title: "Procedure", theme: "The trace enters a system of deadlines and jurisdictions.", scenario: "Institutions answer. The terrain does not wait for the answer.",
    decisions: [
      { id: "procedure-request", prompt: "An institution asks you to specify the location and evidence.", detail: "The quality of the request now depends on what you already collected.", choices: [
        choice("request-with-attachments", "institution", "Send a precise request with attachments", "The request is accepted and forwarded to another department.", { evidence: 7, time: 9, damage: 8, trust: 2 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", variantGroup: "request", condition: { evidenceAny: ["photo", "fieldNote", "sample"] } }),
        choice("request-generic", "institution", "Send a general request", "The reply asks you to specify what the first request was asking.", { evidence: 2, time: 11, damage: 10, trust: -1 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true, variantGroup: "request" }),
        choice("field-before-request", "forest", "Return to the field first", "The new clearing gives the later request a precise coordinate.", { evidence: 11, time: 8, damage: 9, trust: 4 }, { evidence: ["photo", "fieldNote"] }),
        choice("ask-village-location", "village", "Ask residents to identify the route", "The route gains context, but one person asks not to be named.", { evidence: 9, time: 6, damage: 8, trust: 8 }, { evidence: ["testimony"], protectsSource: true }),
      ] },
      { id: "procedure-annex", prompt: "A document refers to an annex that is not publicly attached.", detail: "The missing page may be routine. It may also hold the useful detail.", choices: [
        choice("archive-find-annex", "archive", "Search the archive for the annex", "A scanned page links the road to a wider work zone.", { evidence: 15, time: 8, damage: 8, trust: 2 }, { evidence: ["document"] }),
        choice("institution-request-annex", "institution", "Request the missing annex", "The request is registered. Availability will be assessed.", { evidence: 5, time: 12, damage: 11, trust: 0 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true }),
        choice("road-check-annex", "road", "Check the document against the road", "The measurements on paper now match a visible cut in the terrain.", { evidence: 12, time: 7, damage: 9, trust: 4 }, { evidence: ["fieldNote"] }),
      ] },
      { id: "procedure-response", prompt: "The first formal response says there are not enough elements to act.", detail: "A response exists. Information is another matter.", choices: [
        choice("compare-response-sample", "creek", "Compare the response with your sample", "The dates expose a gap the response does not address.", { evidence: 15, time: 7, damage: 9, trust: 5 }, { evidence: ["officialResponse", "sample"], officialResponse: "concrete", variantGroup: "response", condition: { evidenceAny: ["sample"] } }),
        choice("clarify-response", "institution", "Ask what evidence would be sufficient", "The reply lists procedure, not a threshold.", { evidence: 5, time: 11, damage: 11, trust: -1 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true, variantGroup: "response" }),
        choice("appeal-response", "institution", "Appeal the procedural answer", "The appeal keeps the file open and the clock moving.", { evidence: 7, time: 13, damage: 12, trust: 2 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true }),
        choice("publish-response", "archive", "Publish the response beside the record", "The absence of an answer becomes part of the documented story.", { evidence: 8, time: 4, damage: 9, trust: 6 }, { publication: "qualified", evidence: ["document"], credibilityRisk: 1 }),
      ] },
      { id: "procedure-trust", prompt: "A resident offers another account, but only if the earlier source was treated carefully.", detail: "Trust changes what the village is willing to place on the record.", choices: [
        choice("deep-testimony", "village", "Record a protected detailed testimony", "The account connects night work, water and the new road.", { evidence: 15, time: 7, damage: 9, trust: 10 }, { evidence: ["testimony"], protectsSource: true, variantGroup: "trust", condition: { minTrust: 60 } }),
        choice("guarded-testimony", "village", "Record only what can be confirmed", "The account remains short because confidence has not been earned.", { evidence: 7, time: 5, damage: 9, trust: 5 }, { evidence: ["testimony"], variantGroup: "trust" }),
        choice("protect-source-first", "village", "Agree on protection before recording", "The source withholds a name but gives you a checkable timeline.", { evidence: 11, time: 6, damage: 9, trust: 13 }, { evidence: ["testimony", "fieldNote"], protectsSource: true }),
        choice("seek-second-record", "archive", "Verify the account in public records", "The document supports the date, not every detail.", { evidence: 12, time: 9, damage: 10, trust: 3 }, { evidence: ["document"] }),
      ] },
    ],
  },
  {
    id: 3, label: "Phase 3", title: "Normalization", theme: "The changes are now visible. So are the explanations that make them ordinary.", scenario: "Development, preparation and temporary inconvenience become the language around the terrain.",
    decisions: [
      { id: "normalization-development", prompt: "The road is presented as a benefit for the local population.", detail: "A useful road and damaging work can exist in the same frame.", choices: [
        choice("archive-development-claim", "archive", "Check the development claim", "The plan names benefits but leaves the environmental cost in another file.", { evidence: 13, time: 8, damage: 10, trust: 3 }, { evidence: ["document"] }),
        choice("publish-official-frame", "institution", "Repeat the official explanation", "The explanation travels faster than the unanswered evidence.", { evidence: 2, time: 2, damage: 11, trust: -9 }, { publication: "early", credibilityRisk: 2, evidence: ["officialResponse"] }),
        choice("road-return-photo", "road", "Photograph who can no longer pass", "The road is no longer only infrastructure; it is a changed boundary.", { evidence: 11, time: 7, damage: 11, trust: 7 }, { evidence: ["photo", "fieldNote"] }),
      ] },
      { id: "normalization-water", prompt: "Officials say there is no confirmed pollution.", detail: "Absence of confirmation is presented as confirmation of absence.", choices: [
        choice("creek-second-sample", "creek", "Take a second documented sample", "The two samples show a change over time, not only one unusual day.", { evidence: 16, time: 10, damage: 12, trust: 5 }, { evidence: ["sample"] }),
        choice("institution-wait-lab", "institution", "Wait for the official laboratory response", "The deadline is extended. The creek does not receive an extension.", { evidence: 4, time: 14, damage: 14, trust: -2 }, { request: true, officialResponse: "procedural", evidence: ["officialResponse"], delay: true, publication: "wait" }),
        choice("publish-denial-context", "archive", "Publish the denial with documented limits", "The official sentence remains visible beside what it does not establish.", { evidence: 9, time: 4, damage: 10, trust: 7 }, { publication: "qualified", credibilityRisk: 1, evidence: ["document"] }),
      ] },
      { id: "normalization-source", prompt: "A source can explain the work schedule but fears being identified.", detail: "The strongest detail may be the one you cannot publish in full.", choices: [
        choice("source-protected-context", "village", "Protect the source and verify the detail", "The testimony becomes useful context without becoming a public name.", { evidence: 14, time: 8, damage: 10, trust: 14 }, { evidence: ["testimony", "fieldNote"], protectsSource: true, variantGroup: "source", condition: { minTrust: 60 } }),
        choice("source-limited-context", "village", "Accept a limited off-record account", "Low trust keeps the detail partial, but it gives you a new date to check.", { evidence: 7, time: 6, damage: 10, trust: 6 }, { evidence: ["fieldNote"], protectsSource: true, variantGroup: "source" }),
        choice("source-demand-name", "village", "Ask for an attributable statement", "The conversation ends before the key detail is repeated.", { evidence: 2, time: 4, damage: 10, trust: -12 }, { credibilityRisk: 1 }),
        choice("archive-verify-schedule", "archive", "Verify the schedule without the source", "A procurement date supports part of the account.", { evidence: 12, time: 9, damage: 11, trust: 2 }, { evidence: ["document"] }),
      ] },
      { id: "normalization-publication", prompt: "The pattern is visible, but one central fact remains incomplete.", detail: "This is the first decision that can define the credibility of the whole record.", choices: [
        choice("publish-pattern-now", "road", "Publish the full allegation now", "The story gains attention before its central link is secure.", { evidence: 3, time: 1, damage: 11, trust: -7 }, { publication: "early", credibilityRisk: 4 }),
        choice("publish-with-limits", "archive", "Publish the pattern with explicit limits", "The public record separates verified facts from open questions.", { evidence: 8, time: 4, damage: 10, trust: 8 }, { publication: "qualified", credibilityRisk: 1 }),
        choice("wait-central-proof", "institution", "Wait for the central confirmation", "The dossier improves slowly while the damage does not pause.", { evidence: 6, time: 13, damage: 14, trust: 1 }, { publication: "wait", delay: true, request: true }),
      ] },
    ],
  },
  {
    id: 4, label: "Phase 4", title: "Consequence", theme: "There is no longer serious doubt that the terrain changed.", scenario: "The remaining decision is what can still be documented, protected and made public.",
    decisions: [
      { id: "consequence-return", prompt: "You return to a landscape that no longer matches the first field note.", detail: "Earlier choices determine what this return can prove.", choices: [
        choice("forest-repeat-photo", "forest", "Repeat the first photograph", "The same frame now measures absence.", { evidence: 13, time: 8, damage: 13, trust: 4 }, { evidence: ["photo", "fieldNote"] }),
        choice("creek-repeat-sample", "creek", "Take the final water sample", "The sequence of samples turns a suspicion into a timeline.", { evidence: 15, time: 10, damage: 15, trust: 5 }, { evidence: ["sample", "fieldNote"] }),
        choice("village-cost-testimony", "village", "Record who carries the cost", "The final testimony documents what the technical record leaves out.", { evidence: 12, time: 7, damage: 13, trust: 10 }, { evidence: ["testimony"], protectsSource: true }),
      ] },
      { id: "consequence-dossier", prompt: "The evidence must become one readable record.", detail: "A pile of files is not yet a public account.", choices: [
        choice("archive-crosscheck-dossier", "archive", "Cross-check the full dossier", "Four kinds of evidence now support the same sequence.", { evidence: 16, time: 9, damage: 12, trust: 5 }, { evidence: ["document", "fieldNote"], variantGroup: "dossier", condition: { minEvidenceTypes: 3 } }),
        choice("archive-build-chronology", "archive", "Build a chronology from the fragments", "The chronology is useful, but important gaps remain visible.", { evidence: 10, time: 7, damage: 12, trust: 4 }, { evidence: ["document", "fieldNote"], variantGroup: "dossier" }),
        choice("institution-final-response", "institution", "Request a final concrete answer", "One answer names a date and a responsible office. It arrives late.", { evidence: 12, time: 12, damage: 14, trust: 2 }, { request: true, officialResponse: "concrete", evidence: ["officialResponse"], delay: true }),
        choice("village-review-record", "village", "Let protected sources review the record", "The review removes one risky detail and strengthens the rest.", { evidence: 9, time: 6, damage: 12, trust: 12 }, { protectsSource: true, evidence: ["testimony"] }),
      ] },
      { id: "consequence-publish", prompt: "The dossier is ready enough to leave your screen.", detail: "What you publish now determines what remains publicly traceable.", choices: [
        choice("publish-complete-dossier", "archive", "Publish the verified dossier", "The record connects terrain, testimony, documents and official answers.", { evidence: 10, time: 3, damage: 10, trust: 8 }, { publication: "timely", credibilityRisk: 0 }),
        choice("publish-protected-dossier", "village", "Publish with protected sources and limits", "The story keeps its evidentiary spine without exposing the people who carried it.", { evidence: 8, time: 4, damage: 10, trust: 13 }, { publication: "timely", protectsSource: true, credibilityRisk: 0 }),
        choice("wait-final-authority", "institution", "Wait for one more official confirmation", "The confirmation becomes another procedural cycle.", { evidence: 3, time: 15, damage: 16, trust: -2 }, { publication: "wait", request: true, delay: true, officialResponse: "procedural", evidence: ["officialResponse"] }),
      ] },
      { id: "consequence-record", prompt: "Choose what the final record protects.", detail: "No ending restores the mountain to its first screen.", choices: [
        choice("record-people-and-proof", "village", "Protect people and preserve the proof", "The record remains public, checkable and careful about who paid for it.", { evidence: 8, time: 4, damage: 9, trust: 12 }, { publication: "timely", protectsSource: true, evidence: ["fieldNote"] }),
        choice("record-release-raw", "archive", "Release the raw archive", "Maximum visibility exposes both useful material and details that needed context.", { evidence: 10, time: 2, damage: 9, trust: -9 }, { publication: "timely", credibilityRisk: 2, evidence: ["document"] }),
        choice("record-preserve-only", "forest", "Preserve the field record without publishing yet", "The evidence survives, but the public trace remains incomplete.", { evidence: 7, time: 10, damage: 13, trust: 3 }, { publication: "wait", delay: true, evidence: ["fieldNote"] }),
      ] },
    ],
  },
];

const srPhases: RogoznaPhase[] = [
  {
    id: 1, label: "Faza 1", title: "Tragovi", theme: "Planina još izgleda isto.", scenario: "Ne znaš još šta se dešava. Znaš samo da se planina menja.",
    decisions: [
      { id: "trace-entry", prompt: "Tri male promene pojavljuju se odjednom. Gde počinješ?", detail: "Nijedan trag još nije dovoljno velik da sam objasni problem.", choices: [
        choice("forest-marks", "forest", "Fotografiraj označena stabla", "Oznake formiraju liniju koja se nastavlja iza vidljive čistine.", { evidence: 11, time: 4, damage: 4, trust: 2 }, { evidence: ["photo", "fieldNote"] }),
        choice("creek-first-sample", "creek", "Uzmi prvi uzorak vode", "Voda je mutna. Uzorak čuva više od utiska.", { evidence: 14, time: 7, damage: 5, trust: 3 }, { evidence: ["sample", "fieldNote"] }),
        choice("village-first-talk", "village", "Pitaj ko je prvi primetio", "Dvoje ljudi opisuje istu buku tokom različitih noći.", { evidence: 8, time: 5, damage: 4, trust: 9 }, { evidence: ["testimony"] }),
      ] },
      { id: "trace-road", prompt: "Sveži tragovi guma presecaju staru stazu.", detail: "Put postoji pre javnog objašnjenja zašto postoji.", choices: [
        choice("road-machinery-photo", "road", "Fotografiraj tragove mašina", "Kadar pokazuje razmeru, ali ne i ko je odobrio radove.", { evidence: 12, time: 4, damage: 7, trust: -1 }, { evidence: ["photo"] }),
        choice("road-route-note", "road", "Ucrtaj promenjenu putanju", "Terenska beleška povezuje novi put sa označenim stablima.", { evidence: 9, time: 5, damage: 6, trust: 3 }, { evidence: ["fieldNote"] }),
        choice("road-worker-source", "road", "Razgovaraj bez beleženja imena", "Radnik potvrđuje da je put samo prva faza.", { evidence: 10, time: 7, damage: 7, trust: 7 }, { evidence: ["testimony"], protectsSource: true }),
      ] },
      { id: "trace-water", prompt: "Potok menja boju posle kiše.", detail: "Vidljiva promena i dalje može biti odbačena kao vreme.", choices: [
        choice("creek-lab-sample", "creek", "Pripremi dokumentovan uzorak", "Lanac čuvanja troši vreme, ali uzorak kasnije može da se proveri.", { evidence: 16, time: 10, damage: 8, trust: 4 }, { evidence: ["sample", "fieldNote"] }),
        choice("archive-water-record", "archive", "Pronađi stariji zapis o vodi", "Poređenje pokazuje da mutnoća ranije nije opisivana ovako.", { evidence: 12, time: 8, damage: 7, trust: 1 }, { evidence: ["document"] }),
        choice("creek-publish-image", "creek", "Odmah objavi fotografiju", "Fotografija brzo putuje. Uzrok ostaje neproveren.", { evidence: 4, time: 1, damage: 9, trust: 3 }, { evidence: ["photo"], publication: "early", credibilityRisk: 3 }),
      ] },
      { id: "trace-first-publication", prompt: "Ljudi pitaju da li ćeš nešto javno reći.", detail: "Brzina može doneti pažnju. Može i učvrstiti slabu prvu verziju.", choices: [
        choice("publish-first-claim", "road", "Objavi direktnu tvrdnju", "Prvi si, ali dosije još ima praznine.", { evidence: 2, time: 1, damage: 8, trust: -8 }, { publication: "early", credibilityRisk: 4 }),
        choice("wait-first-confirmation", "archive", "Sačekaj još jednu potvrdu", "Zapis postaje jači dok se teren i dalje menja.", { evidence: 5, time: 9, damage: 10, trust: 3 }, { delay: true, publication: "wait" }),
        choice("publish-limited-note", "village", "Objavi ograničenu terensku belešku", "Opisuješ ono što je vidljivo i označavaš šta još nije potvrđeno.", { evidence: 7, time: 3, damage: 7, trust: 6 }, { publication: "qualified", credibilityRisk: 1 }),
      ] },
    ],
  },
  {
    id: 2, label: "Faza 2", title: "Procedura", theme: "Trag ulazi u sistem rokova i nadležnosti.", scenario: "Institucije odgovaraju. Teren ne čeka odgovor.",
    decisions: [
      { id: "procedure-request", prompt: "Institucija traži da preciziraš lokaciju i dokaze.", detail: "Kvalitet zahteva sada zavisi od onoga što si već prikupio.", choices: [
        choice("request-with-attachments", "institution", "Pošalji precizan zahtev sa prilozima", "Zahtev je prihvaćen i prosleđen drugom odeljenju.", { evidence: 7, time: 9, damage: 8, trust: 2 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", variantGroup: "request", condition: { evidenceAny: ["photo", "fieldNote", "sample"] } }),
        choice("request-generic", "institution", "Pošalji opšti zahtev", "Odgovor traži da preciziraš šta je prvi zahtev pitao.", { evidence: 2, time: 11, damage: 10, trust: -1 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true, variantGroup: "request" }),
        choice("field-before-request", "forest", "Prvo se vrati na teren", "Nova čistina daje kasnijem zahtevu preciznu koordinatu.", { evidence: 11, time: 8, damage: 9, trust: 4 }, { evidence: ["photo", "fieldNote"] }),
        choice("ask-village-location", "village", "Pitaj stanovnike da označe putanju", "Putanja dobija kontekst, ali jedna osoba traži da joj ne zabeležiš ime.", { evidence: 9, time: 6, damage: 8, trust: 8 }, { evidence: ["testimony"], protectsSource: true }),
      ] },
      { id: "procedure-annex", prompt: "Dokument upućuje na prilog koji nije javno priložen.", detail: "Nedostajuća strana može biti rutina. Može sadržati i jedini koristan detalj.", choices: [
        choice("archive-find-annex", "archive", "Potraži prilog u arhivi", "Skenirana strana povezuje put sa širom zonom radova.", { evidence: 15, time: 8, damage: 8, trust: 2 }, { evidence: ["document"] }),
        choice("institution-request-annex", "institution", "Zatraži nedostajući prilog", "Zahtev je zaveden. Dostupnost će biti procenjena.", { evidence: 5, time: 12, damage: 11, trust: 0 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true }),
        choice("road-check-annex", "road", "Uporedi dokument sa putem", "Mere sa papira sada odgovaraju vidljivom useku u terenu.", { evidence: 12, time: 7, damage: 9, trust: 4 }, { evidence: ["fieldNote"] }),
      ] },
      { id: "procedure-response", prompt: "Prvi formalni odgovor kaže da nema dovoljno elemenata za postupanje.", detail: "Odgovor postoji. Informacija je druga stvar.", choices: [
        choice("compare-response-sample", "creek", "Uporedi odgovor sa uzorkom", "Datumi otkrivaju prazninu koju odgovor ne objašnjava.", { evidence: 15, time: 7, damage: 9, trust: 5 }, { evidence: ["officialResponse", "sample"], officialResponse: "concrete", variantGroup: "response", condition: { evidenceAny: ["sample"] } }),
        choice("clarify-response", "institution", "Pitaj koji bi dokaz bio dovoljan", "Odgovor navodi proceduru, ali ne i prag.", { evidence: 5, time: 11, damage: 11, trust: -1 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true, variantGroup: "response" }),
        choice("appeal-response", "institution", "Uloži žalbu na proceduralni odgovor", "Žalba drži predmet otvorenim, a sat nastavlja da radi.", { evidence: 7, time: 13, damage: 12, trust: 2 }, { request: true, evidence: ["officialResponse"], officialResponse: "procedural", delay: true }),
        choice("publish-response", "archive", "Objavi odgovor uz postojeći zapis", "Odsustvo odgovora postaje deo dokumentovane priče.", { evidence: 8, time: 4, damage: 9, trust: 6 }, { publication: "qualified", evidence: ["document"], credibilityRisk: 1 }),
      ] },
      { id: "procedure-trust", prompt: "Stanovnik nudi novo svedočenje, ali samo ako je prethodni izvor tretiran pažljivo.", detail: "Poverenje menja ono što je selo spremno da stavi u zapis.", choices: [
        choice("deep-testimony", "village", "Zabeleži detaljno zaštićeno svedočenje", "Iskaz povezuje noćne radove, vodu i novi put.", { evidence: 15, time: 7, damage: 9, trust: 10 }, { evidence: ["testimony"], protectsSource: true, variantGroup: "trust", condition: { minTrust: 60 } }),
        choice("guarded-testimony", "village", "Zabeleži samo ono što može da se potvrdi", "Iskaz ostaje kratak jer poverenje još nije izgrađeno.", { evidence: 7, time: 5, damage: 9, trust: 5 }, { evidence: ["testimony"], variantGroup: "trust" }),
        choice("protect-source-first", "village", "Dogovori zaštitu pre razgovora", "Izvor zadržava ime, ali daje proverljivu vremensku liniju.", { evidence: 11, time: 6, damage: 9, trust: 13 }, { evidence: ["testimony", "fieldNote"], protectsSource: true }),
        choice("seek-second-record", "archive", "Proveri iskaz u javnom zapisu", "Dokument potvrđuje datum, ali ne i svaki detalj.", { evidence: 12, time: 9, damage: 10, trust: 3 }, { evidence: ["document"] }),
      ] },
    ],
  },
  {
    id: 3, label: "Faza 3", title: "Normalizacija", theme: "Promene su sada vidljive. Vidljiva su i objašnjenja koja ih čine običnim.", scenario: "Razvoj, pripremni radovi i privremena neprijatnost postaju jezik oko terena.",
    decisions: [
      { id: "normalization-development", prompt: "Put se predstavlja kao korist za lokalno stanovništvo.", detail: "Koristan put i štetni radovi mogu postojati u istom kadru.", choices: [
        choice("archive-development-claim", "archive", "Proveri razvojnu tvrdnju", "Plan navodi koristi, a ekološku cenu ostavlja u drugom dokumentu.", { evidence: 13, time: 8, damage: 10, trust: 3 }, { evidence: ["document"] }),
        choice("publish-official-frame", "institution", "Prenesi zvanično objašnjenje", "Objašnjenje putuje brže od neodgovorenih dokaza.", { evidence: 2, time: 2, damage: 11, trust: -9 }, { publication: "early", credibilityRisk: 2, evidence: ["officialResponse"] }),
        choice("road-return-photo", "road", "Fotografiraj ko više ne može da prođe", "Put više nije samo infrastruktura; postao je promenjena granica.", { evidence: 11, time: 7, damage: 11, trust: 7 }, { evidence: ["photo", "fieldNote"] }),
      ] },
      { id: "normalization-water", prompt: "Zvanični odgovor kaže da zagađenje nije potvrđeno.", detail: "Odsustvo potvrde predstavlja se kao potvrda odsustva.", choices: [
        choice("creek-second-sample", "creek", "Uzmi drugi dokumentovan uzorak", "Dva uzorka pokazuju promenu kroz vreme, ne samo jedan neobičan dan.", { evidence: 16, time: 10, damage: 12, trust: 5 }, { evidence: ["sample"] }),
        choice("institution-wait-lab", "institution", "Sačekaj odgovor zvanične laboratorije", "Rok je produžen. Potok nije dobio produženje.", { evidence: 4, time: 14, damage: 14, trust: -2 }, { request: true, officialResponse: "procedural", evidence: ["officialResponse"], delay: true, publication: "wait" }),
        choice("publish-denial-context", "archive", "Objavi demanti uz dokumentovana ograničenja", "Zvanična rečenica ostaje vidljiva pored onoga što ne dokazuje.", { evidence: 9, time: 4, damage: 10, trust: 7 }, { publication: "qualified", credibilityRisk: 1, evidence: ["document"] }),
      ] },
      { id: "normalization-source", prompt: "Izvor može objasniti raspored radova, ali se plaši identifikacije.", detail: "Najjači detalj može biti onaj koji ne možeš u celosti da objaviš.", choices: [
        choice("source-protected-context", "village", "Zaštiti izvor i proveri detalj", "Svedočenje postaje koristan kontekst bez pretvaranja čoveka u javno ime.", { evidence: 14, time: 8, damage: 10, trust: 14 }, { evidence: ["testimony", "fieldNote"], protectsSource: true, variantGroup: "source", condition: { minTrust: 60 } }),
        choice("source-limited-context", "village", "Prihvati ograničen razgovor bez citiranja", "Nisko poverenje zadržava detalj nepotpunim, ali daje novi datum za proveru.", { evidence: 7, time: 6, damage: 10, trust: 6 }, { evidence: ["fieldNote"], protectsSource: true, variantGroup: "source" }),
        choice("source-demand-name", "village", "Traži izjavu sa imenom", "Razgovor se završava pre nego što je ključni detalj ponovljen.", { evidence: 2, time: 4, damage: 10, trust: -12 }, { credibilityRisk: 1 }),
        choice("archive-verify-schedule", "archive", "Proveri raspored bez izvora", "Datum nabavke potvrđuje deo iskaza.", { evidence: 12, time: 9, damage: 11, trust: 2 }, { evidence: ["document"] }),
      ] },
      { id: "normalization-publication", prompt: "Obrazac je vidljiv, ali jedna centralna činjenica ostaje nepotpuna.", detail: "Ovo je odluka koja može odrediti kredibilitet celog zapisa.", choices: [
        choice("publish-pattern-now", "road", "Odmah objavi punu optužbu", "Priča dobija pažnju pre nego što je centralna veza sigurna.", { evidence: 3, time: 1, damage: 11, trust: -7 }, { publication: "early", credibilityRisk: 4 }),
        choice("publish-with-limits", "archive", "Objavi obrazac uz jasna ograničenja", "Javni zapis odvaja potvrđene činjenice od otvorenih pitanja.", { evidence: 8, time: 4, damage: 10, trust: 8 }, { publication: "qualified", credibilityRisk: 1 }),
        choice("wait-central-proof", "institution", "Sačekaj centralnu potvrdu", "Dosije polako jača, dok šteta ne pravi pauzu.", { evidence: 6, time: 13, damage: 14, trust: 1 }, { publication: "wait", delay: true, request: true }),
      ] },
    ],
  },
  {
    id: 4, label: "Faza 4", title: "Posledica", theme: "Više nema ozbiljne sumnje da se teren promenio.", scenario: "Preostala odluka je šta još može da bude dokumentovano, zaštićeno i objavljeno.",
    decisions: [
      { id: "consequence-return", prompt: "Vraćaš se u pejzaž koji više ne odgovara prvoj terenskoj belešci.", detail: "Raniji izbori određuju šta ovaj povratak može da dokaže.", choices: [
        choice("forest-repeat-photo", "forest", "Ponovi prvu fotografiju", "Isti kadar sada meri odsustvo.", { evidence: 13, time: 8, damage: 13, trust: 4 }, { evidence: ["photo", "fieldNote"] }),
        choice("creek-repeat-sample", "creek", "Uzmi poslednji uzorak vode", "Niz uzoraka pretvara sumnju u vremensku liniju.", { evidence: 15, time: 10, damage: 15, trust: 5 }, { evidence: ["sample", "fieldNote"] }),
        choice("village-cost-testimony", "village", "Zabeleži ko snosi cenu", "Poslednje svedočenje dokumentuje ono što tehnički zapis izostavlja.", { evidence: 12, time: 7, damage: 13, trust: 10 }, { evidence: ["testimony"], protectsSource: true }),
      ] },
      { id: "consequence-dossier", prompt: "Dokazi moraju postati jedan čitljiv zapis.", detail: "Gomila fajlova još nije javna priča.", choices: [
        choice("archive-crosscheck-dossier", "archive", "Ukrsti ceo dosije", "Četiri vrste dokaza sada podržavaju isti sled.", { evidence: 16, time: 9, damage: 12, trust: 5 }, { evidence: ["document", "fieldNote"], variantGroup: "dossier", condition: { minEvidenceTypes: 3 } }),
        choice("archive-build-chronology", "archive", "Sastavi hronologiju iz fragmenata", "Hronologija je korisna, ali važne praznine ostaju vidljive.", { evidence: 10, time: 7, damage: 12, trust: 4 }, { evidence: ["document", "fieldNote"], variantGroup: "dossier" }),
        choice("institution-final-response", "institution", "Zatraži poslednji konkretan odgovor", "Jedan odgovor navodi datum i odgovornu službu. Stiže kasno.", { evidence: 12, time: 12, damage: 14, trust: 2 }, { request: true, officialResponse: "concrete", evidence: ["officialResponse"], delay: true }),
        choice("village-review-record", "village", "Daj zaštićenim izvorima da provere zapis", "Provera uklanja jedan rizičan detalj i jača ostatak.", { evidence: 9, time: 6, damage: 12, trust: 12 }, { protectsSource: true, evidence: ["testimony"] }),
      ] },
      { id: "consequence-publish", prompt: "Dosije je dovoljno spreman da napusti tvoj ekran.", detail: "Ono što sada objaviš određuje šta ostaje javno proverljivo.", choices: [
        choice("publish-complete-dossier", "archive", "Objavi provereni dosije", "Zapis povezuje teren, svedočenja, dokumente i zvanične odgovore.", { evidence: 10, time: 3, damage: 10, trust: 8 }, { publication: "timely", credibilityRisk: 0 }),
        choice("publish-protected-dossier", "village", "Objavi uz zaštićene izvore i ograničenja", "Priča čuva dokaznu osnovu bez izlaganja ljudi koji su je nosili.", { evidence: 8, time: 4, damage: 10, trust: 13 }, { publication: "timely", protectsSource: true, credibilityRisk: 0 }),
        choice("wait-final-authority", "institution", "Sačekaj još jednu zvaničnu potvrdu", "Potvrda postaje još jedan proceduralni ciklus.", { evidence: 3, time: 15, damage: 16, trust: -2 }, { publication: "wait", request: true, delay: true, officialResponse: "procedural", evidence: ["officialResponse"] }),
      ] },
      { id: "consequence-record", prompt: "Izaberi šta završni zapis štiti.", detail: "Nijedan kraj ne vraća planinu na prvi ekran.", choices: [
        choice("record-people-and-proof", "village", "Zaštiti ljude i sačuvaj dokaze", "Zapis ostaje javan, proverljiv i pažljiv prema onima koji su platili njegovu cenu.", { evidence: 8, time: 4, damage: 9, trust: 12 }, { publication: "timely", protectsSource: true, evidence: ["fieldNote"] }),
        choice("record-release-raw", "archive", "Objavi sirovu arhivu", "Maksimalna vidljivost izlaže i koristan materijal i detalje kojima je trebao kontekst.", { evidence: 10, time: 2, damage: 9, trust: -9 }, { publication: "timely", credibilityRisk: 2, evidence: ["document"] }),
        choice("record-preserve-only", "forest", "Sačuvaj terenski zapis bez objave", "Dokazi opstaju, ali javni trag ostaje nepotpun.", { evidence: 7, time: 10, damage: 13, trust: 3 }, { publication: "wait", delay: true, evidence: ["fieldNote"] }),
      ] },
    ],
  },
];

const enNarrative: RogoznaNarrative = {
  listingSeoDescription: "Interactive Avangarda formats about power, evidence, procedure and the cost of delay.",
  seoDescription: "An interactive environmental simulation about evidence, institutions, damage and the cost of delay.",
  introEyebrow: "Field condition",
  introStatement: "The mountain still looks the same.",
  introCopy: "But the traces are already here. You do not know what is happening yet. You only know that the mountain is changing.",
  phases: enPhases,
  endings: {
    early: { eyebrow: "Published too soon", title: "You were first. That was not the same as being right.", copy: "A public claim arrived before the evidence was diverse and secure. The story kept attention, but lost part of its credibility.", quote: "Speed became part of the damage." },
    procedure: { eyebrow: "The silence of procedure", title: "The system did not say no. It only waited longer than the mountain.", copy: "Requests, deadlines and procedural answers accumulated while concrete information remained rare.", quote: "Every response had a date. The terrain had consequences." },
    trace: { eyebrow: "A trace remained", title: "You did not save the whole mountain. You did not let it disappear unnoticed.", copy: "Different kinds of evidence, protected sources and a careful publication left a record that can still be checked.", quote: "The best ending still contains loss." },
    late: { eyebrow: "Proven too late", title: "You proved what happened. You did not arrive in time to stop it happening.", copy: "The dossier became strong while time and damage crossed the point where proof alone could repair the terrain.", quote: "Certainty arrived after the landscape changed." },
  },
  contextIntro: "Environmental damage rarely begins with one large event. More often it emerges through small changes, delays, incomplete answers and moments when there was still not enough evidence. This simulation shows the cost of the time between the first trace and public recognition of a problem.",
  contextCards: [
    { title: "Trace", copy: "A problem first exists as suspicion, a change in space or an account that still lacks confirmation." },
    { title: "Procedure", copy: "Institutions can answer while nothing actually moves. Procedure consumes time as the terrain changes." },
    { title: "Consequence", copy: "When the evidence becomes undeniable, the question is no longer only what happened, but what can still be restored." },
  ],
  inspiration: "The simulation is inspired by experiences of documenting environmental change in the field. It does not make a claim about a specific event, person or legal case.",
};

const srNarrative: RogoznaNarrative = {
  listingSeoDescription: "Interaktivni formati Avangarde o moći, dokazima, proceduri i ceni čekanja.",
  seoDescription: "Interaktivna ekološka simulacija o terenu, dokazima, institucijama i ceni čekanja.",
  introEyebrow: "Stanje terena",
  introStatement: "Planina još izgleda isto.",
  introCopy: "Ali tragovi su već tu. Ne znaš još šta se dešava. Znaš samo da se planina menja.",
  phases: srPhases,
  endings: {
    early: { eyebrow: "Objavljeno prerano", title: "Bio si prvi. To nije bilo isto što i biti u pravu.", copy: "Javna tvrdnja stigla je pre nego što su dokazi postali raznovrsni i sigurni. Priča je dobila pažnju, ali izgubila deo kredibiliteta.", quote: "Brzina je postala deo štete." },
    procedure: { eyebrow: "Tišina postupka", title: "Sistem ti nije rekao ne. Samo je čekao duže od planine.", copy: "Zahtevi, rokovi i proceduralni odgovori su se gomilali, dok su konkretne informacije ostale retke.", quote: "Svaki odgovor imao je datum. Teren je imao posledice." },
    trace: { eyebrow: "Trag je ostao", title: "Nisi spasao celu planinu. Nisi dozvolio da nestane neprimećeno.", copy: "Različite vrste dokaza, zaštićeni izvori i pažljiva objava ostavili su zapis koji i dalje može da se proveri.", quote: "I najbolji kraj i dalje sadrži gubitak." },
    late: { eyebrow: "Dokazano prekasno", title: "Dokazao si šta se dogodilo. Nisi stigao da sprečiš da se dogodi.", copy: "Dosije je postao jak dok su vreme i šteta prelazili tačku na kojoj sam dokaz može da popravi teren.", quote: "Izvesnost je stigla posle promene pejzaža." },
  },
  contextIntro: "Ekološka šteta retko počinje jednim velikim događajem. Češće nastaje kroz niz malih promena, odlaganja, nepotpunih odgovora i trenutaka u kojima još uvek nije bilo dovoljno dokaza. Ova simulacija pokazuje cenu vremena između prvog traga i javnog priznanja problema.",
  contextCards: [
    { title: "Trag", copy: "Problem prvo postoji kao sumnja, promena u prostoru ili priča kojoj još nedostaje potvrda." },
    { title: "Postupak", copy: "Institucije mogu da odgovaraju, a da se ništa stvarno ne pomeri. Procedura troši vreme, dok se teren menja." },
    { title: "Posledica", copy: "Kada dokaz konačno postane nesporan, pitanje više nije samo šta se dogodilo, nego šta se još može vratiti." },
  ],
  inspiration: "Simulacija je inspirisana iskustvima terenskog dokumentovanja ekoloških promena. Ne predstavlja tvrdnju o konkretnom događaju, osobi ili pravnom slučaju.",
};

export const ROGOZNA_ENDING_THRESHOLDS = {
  earlyEvidence: 45,
  earlyDiversity: 3,
  earlyCredibilityRisk: 3,
  procedureRequests: 4,
  procedureDelays: 5,
  procedureConcreteResponses: 1,
  traceEvidence: 68,
  traceDiversity: 4,
  traceTrust: 58,
  traceMaximumDamage: 81,
  traceMaximumCredibilityRisk: 2,
} as const;

export const ROGOZNA_DAMAGE_RATE = 0.5;

export function getRogoznaEnding(summary: RogoznaOutcomeSummary): RogoznaEndingId {
  const earlyPublication = summary.publications.some(
    (publication) =>
      publication.mode === "early" &&
      (publication.evidenceAtChoice < ROGOZNA_ENDING_THRESHOLDS.earlyEvidence ||
        publication.diversityAtChoice < ROGOZNA_ENDING_THRESHOLDS.earlyDiversity)
  );

  if (earlyPublication || summary.credibilityRisk >= ROGOZNA_ENDING_THRESHOLDS.earlyCredibilityRisk) {
    return "early";
  }

  const hasTimelyPublication = summary.publications.some((publication) => publication.mode === "timely");
  if (
    summary.requestCount >= ROGOZNA_ENDING_THRESHOLDS.procedureRequests &&
    summary.delayCount >= ROGOZNA_ENDING_THRESHOLDS.procedureDelays &&
    summary.concreteResponseCount <= ROGOZNA_ENDING_THRESHOLDS.procedureConcreteResponses &&
    !hasTimelyPublication
  ) {
    return "procedure";
  }

  const hasCarefulPublication = summary.publications.some(
    (publication) => publication.mode === "qualified" || publication.mode === "timely"
  );
  if (
    summary.meters.evidence >= ROGOZNA_ENDING_THRESHOLDS.traceEvidence &&
    summary.evidenceTypes.length >= ROGOZNA_ENDING_THRESHOLDS.traceDiversity &&
    summary.meters.trust >= ROGOZNA_ENDING_THRESHOLDS.traceTrust &&
    summary.meters.damage <= ROGOZNA_ENDING_THRESHOLDS.traceMaximumDamage &&
    summary.credibilityRisk <= ROGOZNA_ENDING_THRESHOLDS.traceMaximumCredibilityRisk &&
    hasCarefulPublication
  ) {
    return "trace";
  }

  return "late";
}

export function getRogoznaDamageBand(damage: number) {
  if (damage < 30) return 0;
  if (damage < 55) return 1;
  if (damage < 80) return 2;
  return 3;
}

export function getRogoznaCopy(lang: Lang): RogoznaCopy {
  const functional = functionalCopy[lang];
  const narrative = lang === "sr" ? srNarrative : enNarrative;
  const phases = narrative.phases.map((phase, index) => ({
    ...phase,
    title: functional.phaseTitles[index],
    label: lang === "sr" ? phase.label : lang === "en" ? phase.label : `${index + 1} / 4`,
  })) as RogoznaPhase[];

  return { ...functional, ...narrative, phases };
}

export function getRogoznaSearchKeywords(lang: Lang) {
  const copy = getRogoznaCopy(lang);
  return [
    "Rogozna",
    "planina koja nestaje",
    "disappearing mountain",
    "ekologija",
    "ekološka simulacija",
    "šuma",
    "voda",
    "environmental justice",
    copy.gameTitle,
    copy.gameSubtitle,
    copy.typeLabel,
  ];
}
