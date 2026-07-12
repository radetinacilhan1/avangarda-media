import type { Lang } from "@/lib/i18n";

export type PowerOutcomeCategory = "shaped" | "symbolic" | "changed";

export type PowerMeters = {
  agency: number;
  visibility: number;
  compliance: number;
};

export type PowerChoice = {
  id: string;
  label: string;
  response: string;
  category: PowerOutcomeCategory;
  delta: PowerMeters;
  thought?: string;
  status?: string;
  originalLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
  offset?: boolean;
  reasonable?: boolean;
};

export type PowerDecision = {
  id: string;
  prompt: string;
  detail: string;
  systemNote?: string;
  choices: PowerChoice[];
};

export type PowerLevel = {
  id: 1 | 2 | 3;
  label: string;
  title: string;
  theme: string;
  scenario: string;
  decisions: PowerDecision[];
};

export type PowerResultVariant = {
  eyebrow: string;
  title: string;
  copy: string;
};

export type InteractiveCopy = {
  sectionLabel: string;
  listingTitle: string;
  listingIntro: string;
  firstFormatLabel: string;
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
  choicesLabel: string;
  decisionLabel: string;
  metersLabel: string;
  agencyLabel: string;
  visibilityLabel: string;
  complianceLabel: string;
  shapedLabel: string;
  symbolicLabel: string;
  changedLabel: string;
  resultLabel: string;
  introEyebrow: string;
  introStatement: string;
  introCopy: string;
  resultTitle: string;
  resultCopy: string;
  resultQuote: string;
  contextEyebrow: string;
  contextTitle: string;
  contextIntro: string;
  inspiration: string;
  languageNotice?: string;
  seoDescription: string;
  listingSeoDescription: string;
  levelTitles: [string, string, string];
  levels: PowerLevel[];
  contextCards: Array<{ title: string; copy: string }>;
  resultVariants: Record<PowerOutcomeCategory, PowerResultVariant>;
};

type FunctionalCopy = Pick<
  InteractiveCopy,
  | "sectionLabel"
  | "listingTitle"
  | "firstFormatLabel"
  | "gameTitle"
  | "typeLabel"
  | "durationLabel"
  | "durationValue"
  | "openLabel"
  | "startLabel"
  | "continueLabel"
  | "backLabel"
  | "understandLabel"
  | "restartLabel"
  | "shareLabel"
  | "shareCopiedLabel"
  | "shareUnavailableLabel"
  | "choicesLabel"
  | "decisionLabel"
  | "metersLabel"
  | "agencyLabel"
  | "visibilityLabel"
  | "complianceLabel"
  | "shapedLabel"
  | "symbolicLabel"
  | "changedLabel"
  | "resultLabel"
  | "contextEyebrow"
  | "contextTitle"
  | "levelTitles"
> & { languageNotice?: string };

const functionalCopy: Record<Lang, FunctionalCopy> = {
  sr: {
    sectionLabel: "Interaktivno",
    listingTitle: "Interaktivni formati",
    firstFormatLabel: "Prvi interaktivni format Avangarde.",
    gameTitle: "Moć",
    typeLabel: "Interaktivna simulacija",
    durationLabel: "Trajanje",
    durationValue: "5-8 minuta",
    openLabel: "Otvori",
    startLabel: "Pokreni simulaciju",
    continueLabel: "Nastavi",
    backLabel: "Nazad",
    understandLabel: "Razumi šta se desilo",
    restartLabel: "Igraj ponovo",
    shareLabel: "Podeli simulaciju",
    shareCopiedLabel: "Link je kopiran.",
    shareUnavailableLabel: "Kopiranje linka trenutno nije dostupno.",
    choicesLabel: "Izbori",
    decisionLabel: "Odluka",
    metersLabel: "Pokazatelji",
    agencyLabel: "Delovanje",
    visibilityLabel: "Vidljivost",
    complianceLabel: "Povinovanje",
    shapedLabel: "Unapred oblikovano",
    symbolicLabel: "Simboličko",
    changedLabel: "Promenilo nešto",
    resultLabel: "Ishod",
    contextEyebrow: "Kontekst",
    contextTitle: "Šta se upravo desilo?",
    levelTitles: ["Vidljivi konflikt", "Kontrola agende", "Nevidljiva moć"],
  },
  en: {
    sectionLabel: "Interactive",
    listingTitle: "Interactive formats",
    firstFormatLabel: "Avangarda's first interactive format.",
    gameTitle: "Power",
    typeLabel: "Interactive simulation",
    durationLabel: "Duration",
    durationValue: "5-8 minutes",
    openLabel: "Open",
    startLabel: "Start simulation",
    continueLabel: "Continue",
    backLabel: "Back",
    understandLabel: "Understand what happened",
    restartLabel: "Play again",
    shareLabel: "Share simulation",
    shareCopiedLabel: "Link copied.",
    shareUnavailableLabel: "The link could not be copied.",
    choicesLabel: "Choices",
    decisionLabel: "Decision",
    metersLabel: "Indicators",
    agencyLabel: "Agency",
    visibilityLabel: "Visibility",
    complianceLabel: "Compliance",
    shapedLabel: "Already shaped",
    symbolicLabel: "Symbolic",
    changedLabel: "Changed something",
    resultLabel: "Outcome",
    contextEyebrow: "Context",
    contextTitle: "What just happened?",
    levelTitles: ["Visible conflict", "Agenda control", "Invisible power"],
  },
  tr: {
    sectionLabel: "Etkileşimli",
    listingTitle: "Etkileşimli formatlar",
    firstFormatLabel: "Avangarda'nın ilk etkileşimli formatı.",
    gameTitle: "Güç",
    typeLabel: "Etkileşimli simülasyon",
    durationLabel: "Süre",
    durationValue: "5-8 dakika",
    openLabel: "Aç",
    startLabel: "Simülasyonu başlat",
    continueLabel: "Devam et",
    backLabel: "Geri",
    understandLabel: "Ne olduğunu anla",
    restartLabel: "Tekrar oyna",
    shareLabel: "Simülasyonu paylaş",
    shareCopiedLabel: "Bağlantı kopyalandı.",
    shareUnavailableLabel: "Bağlantı kopyalanamadı.",
    choicesLabel: "Seçimler",
    decisionLabel: "Karar",
    metersLabel: "Göstergeler",
    agencyLabel: "Eylem gücü",
    visibilityLabel: "Görünürlük",
    complianceLabel: "Uyum",
    shapedLabel: "Önceden biçimlendirilmiş",
    symbolicLabel: "Sembolik",
    changedLabel: "Bir şeyi değiştirdi",
    resultLabel: "Sonuç",
    contextEyebrow: "Bağlam",
    contextTitle: "Az önce ne oldu?",
    levelTitles: ["Görünür çatışma", "Gündem kontrolü", "Görünmez güç"],
    languageNotice: "Simülasyonun uzun anlatımı şu anda İngilizce olarak sunulmaktadır.",
  },
  fr: {
    sectionLabel: "Interactif",
    listingTitle: "Formats interactifs",
    firstFormatLabel: "Le premier format interactif d'Avangarda.",
    gameTitle: "Pouvoir",
    typeLabel: "Simulation interactive",
    durationLabel: "Durée",
    durationValue: "5-8 minutes",
    openLabel: "Ouvrir",
    startLabel: "Lancer la simulation",
    continueLabel: "Continuer",
    backLabel: "Retour",
    understandLabel: "Comprendre ce qui s'est passé",
    restartLabel: "Rejouer",
    shareLabel: "Partager la simulation",
    shareCopiedLabel: "Lien copié.",
    shareUnavailableLabel: "Impossible de copier le lien.",
    choicesLabel: "Choix",
    decisionLabel: "Décision",
    metersLabel: "Indicateurs",
    agencyLabel: "Capacité d'agir",
    visibilityLabel: "Visibilité",
    complianceLabel: "Conformité",
    shapedLabel: "Déjà façonné",
    symbolicLabel: "Symbolique",
    changedLabel: "A changé quelque chose",
    resultLabel: "Résultat",
    contextEyebrow: "Contexte",
    contextTitle: "Que vient-il de se passer ?",
    levelTitles: ["Conflit visible", "Contrôle de l'agenda", "Pouvoir invisible"],
    languageNotice: "Le récit complet de cette simulation est actuellement disponible en anglais.",
  },
  de: {
    sectionLabel: "Interaktiv",
    listingTitle: "Interaktive Formate",
    firstFormatLabel: "Avangardas erstes interaktives Format.",
    gameTitle: "Macht",
    typeLabel: "Interaktive Simulation",
    durationLabel: "Dauer",
    durationValue: "5-8 Minuten",
    openLabel: "Öffnen",
    startLabel: "Simulation starten",
    continueLabel: "Weiter",
    backLabel: "Zurück",
    understandLabel: "Verstehen, was passiert ist",
    restartLabel: "Erneut spielen",
    shareLabel: "Simulation teilen",
    shareCopiedLabel: "Link kopiert.",
    shareUnavailableLabel: "Der Link konnte nicht kopiert werden.",
    choicesLabel: "Entscheidungen",
    decisionLabel: "Entscheidung",
    metersLabel: "Indikatoren",
    agencyLabel: "Handlungsmacht",
    visibilityLabel: "Sichtbarkeit",
    complianceLabel: "Anpassung",
    shapedLabel: "Bereits geformt",
    symbolicLabel: "Symbolisch",
    changedLabel: "Hat etwas verändert",
    resultLabel: "Ergebnis",
    contextEyebrow: "Kontext",
    contextTitle: "Was ist gerade passiert?",
    levelTitles: ["Sichtbarer Konflikt", "Kontrolle der Agenda", "Unsichtbare Macht"],
    languageNotice: "Die ausführliche Erzählung dieser Simulation ist derzeit auf Englisch verfügbar.",
  },
  es: {
    sectionLabel: "Interactivo",
    listingTitle: "Formatos interactivos",
    firstFormatLabel: "El primer formato interactivo de Avangarda.",
    gameTitle: "Poder",
    typeLabel: "Simulación interactiva",
    durationLabel: "Duración",
    durationValue: "5-8 minutos",
    openLabel: "Abrir",
    startLabel: "Iniciar simulación",
    continueLabel: "Continuar",
    backLabel: "Atrás",
    understandLabel: "Entender qué ocurrió",
    restartLabel: "Jugar de nuevo",
    shareLabel: "Compartir simulación",
    shareCopiedLabel: "Enlace copiado.",
    shareUnavailableLabel: "No se pudo copiar el enlace.",
    choicesLabel: "Decisiones",
    decisionLabel: "Decisión",
    metersLabel: "Indicadores",
    agencyLabel: "Capacidad de actuar",
    visibilityLabel: "Visibilidad",
    complianceLabel: "Conformidad",
    shapedLabel: "Ya condicionado",
    symbolicLabel: "Simbólico",
    changedLabel: "Cambió algo",
    resultLabel: "Resultado",
    contextEyebrow: "Contexto",
    contextTitle: "¿Qué acaba de ocurrir?",
    levelTitles: ["Conflicto visible", "Control de la agenda", "Poder invisible"],
    languageNotice: "La narración completa de esta simulación está disponible actualmente en inglés.",
  },
  el: {
    sectionLabel: "Διαδραστικό",
    listingTitle: "Διαδραστικές μορφές",
    firstFormatLabel: "Η πρώτη διαδραστική μορφή της Avangarda.",
    gameTitle: "Ισχύς",
    typeLabel: "Διαδραστική προσομοίωση",
    durationLabel: "Διάρκεια",
    durationValue: "5-8 λεπτά",
    openLabel: "Άνοιγμα",
    startLabel: "Έναρξη προσομοίωσης",
    continueLabel: "Συνέχεια",
    backLabel: "Πίσω",
    understandLabel: "Κατανόησε τι συνέβη",
    restartLabel: "Παίξε ξανά",
    shareLabel: "Κοινοποίηση προσομοίωσης",
    shareCopiedLabel: "Ο σύνδεσμος αντιγράφηκε.",
    shareUnavailableLabel: "Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.",
    choicesLabel: "Επιλογές",
    decisionLabel: "Απόφαση",
    metersLabel: "Δείκτες",
    agencyLabel: "Δυνατότητα δράσης",
    visibilityLabel: "Ορατότητα",
    complianceLabel: "Συμμόρφωση",
    shapedLabel: "Ήδη διαμορφωμένο",
    symbolicLabel: "Συμβολικό",
    changedLabel: "Άλλαξε κάτι",
    resultLabel: "Αποτέλεσμα",
    contextEyebrow: "Πλαίσιο",
    contextTitle: "Τι μόλις συνέβη;",
    levelTitles: ["Ορατή σύγκρουση", "Έλεγχος ατζέντας", "Αόρατη ισχύς"],
    languageNotice: "Η πλήρης αφήγηση αυτής της προσομοίωσης είναι προς το παρόν διαθέσιμη στα αγγλικά.",
  },
  ar: {
    sectionLabel: "تفاعلي",
    listingTitle: "صيغ تفاعلية",
    firstFormatLabel: "أول صيغة تفاعلية من أفانغاردا.",
    gameTitle: "القوة",
    typeLabel: "محاكاة تفاعلية",
    durationLabel: "المدة",
    durationValue: "5-8 دقائق",
    openLabel: "افتح",
    startLabel: "ابدأ المحاكاة",
    continueLabel: "تابع",
    backLabel: "رجوع",
    understandLabel: "افهم ما حدث",
    restartLabel: "العب من جديد",
    shareLabel: "شارك المحاكاة",
    shareCopiedLabel: "تم نسخ الرابط.",
    shareUnavailableLabel: "تعذر نسخ الرابط.",
    choicesLabel: "الاختيارات",
    decisionLabel: "القرار",
    metersLabel: "المؤشرات",
    agencyLabel: "القدرة على الفعل",
    visibilityLabel: "الظهور",
    complianceLabel: "الامتثال",
    shapedLabel: "مُشكّل مسبقاً",
    symbolicLabel: "رمزي",
    changedLabel: "غيّر شيئاً",
    resultLabel: "النتيجة",
    contextEyebrow: "السياق",
    contextTitle: "ماذا حدث للتو؟",
    levelTitles: ["الصراع المرئي", "التحكم في الأجندة", "القوة غير المرئية"],
    languageNotice: "السرد الكامل لهذه المحاكاة متاح حالياً باللغة الإنجليزية.",
  },
};

const c = (
  id: string,
  label: string,
  response: string,
  category: PowerOutcomeCategory,
  delta: PowerMeters,
  extra: Partial<PowerChoice> = {}
): PowerChoice => ({ id, label, response, category, delta, ...extra });

const enLevels: PowerLevel[] = [
  {
    id: 1,
    label: "Level 1",
    title: "Visible conflict",
    theme: "Power is visible. The sides are known. The decision still appears open.",
    scenario: "A wants the park. B wants the parking lot.",
    decisions: [
      {
        id: "visible-voice",
        prompt: "The proposal enters a public hearing. What do you do first?",
        detail: "The room is open, the microphones work, and both sides have time.",
        choices: [
          c("speak", "Speak", "People listen. Some agree. Some look away.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("organize", "Organize", "Support grows. The room becomes louder and harder to ignore.", "changed", { agency: 0, visibility: 0, compliance: 0 }),
          c("publish", "Publish evidence", "The evidence circulates. The conflict becomes visible.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("vote", "Vote", "The vote is counted. For now, the system looks fair.", "symbolic", { agency: -2, visibility: -1, compliance: 2 }),
        ],
      },
      {
        id: "visible-record",
        prompt: "The council publishes a short summary that leaves out the objections.",
        detail: "The record is still open for correction.",
        choices: [
          c("minutes", "Demand full minutes", "The missing objections return to the official record.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("residents", "Bring residents back", "The room fills again. Testimony gives the record weight.", "changed", { agency: 0, visibility: 0, compliance: 0 }),
          c("comments", "Submit written comments", "Your comments are registered and attached, but not discussed.", "symbolic", { agency: -3, visibility: -2, compliance: 2 }),
          c("trust", "Trust the summary", "The conflict becomes shorter, cleaner, and easier to manage.", "shaped", { agency: -5, visibility: -5, compliance: 5 }),
        ],
      },
      {
        id: "visible-proof",
        prompt: "A contractor disputes the environmental report.",
        detail: "The facts are contested in public, not yet removed from view.",
        choices: [
          c("verify", "Verify it publicly", "Independent experts confirm the central finding.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("circulate", "Circulate the report", "The report reaches people outside the hearing.", "changed", { agency: -2, visibility: 0, compliance: 0 }),
          c("review", "Wait for official review", "The review begins. The decision calendar does not wait.", "symbolic", { agency: -4, visibility: -3, compliance: 3 }),
          c("withdraw", "Withdraw the claim", "The evidence remains true, but no longer acts in the room.", "shaped", { agency: -6, visibility: -7, compliance: 6 }),
        ],
      },
      {
        id: "visible-count",
        prompt: "The final vote is scheduled for Friday afternoon.",
        detail: "Everyone can still see where the decision will be made.",
        choices: [
          c("attend", "Attend the session", "Your presence changes how easily the vote can be rushed.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("monitor", "Monitor the count", "The count and every abstention become public.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("press", "Invite the press", "The vote gains an audience, but not a different rule.", "symbolic", { agency: -3, visibility: 0, compliance: 1 }),
          c("proxy", "Accept the proxy result", "The procedure closes without another question.", "shaped", { agency: -5, visibility: -4, compliance: 5 }),
        ],
      },
      {
        id: "visible-outcome",
        prompt: "The park survives, but part of the land is offered for development.",
        detail: "Visible conflict rarely ends with a clean victory.",
        choices: [
          c("defend", "Defend the whole park", "The conflict stays open and the boundary remains contested.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("negotiate", "Negotiate the boundary", "A smaller park is secured through a public compromise.", "changed", { agency: -2, visibility: -1, compliance: 1 }),
          c("challenge", "Challenge the decision", "The appeal preserves the question, but delays the outcome.", "symbolic", { agency: -4, visibility: -2, compliance: 2 }),
          c("move", "Move on", "The new boundary quickly becomes the only boundary people remember.", "shaped", { agency: -6, visibility: -5, compliance: 6 }),
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Level 2",
    title: "Agenda control",
    theme: "The question is no longer whether you can win. It is whether the issue can enter the room.",
    scenario: "The water is polluted. The forest is being cut. People are complaining.",
    decisions: [
      {
        id: "agenda-entry",
        prompt: "The municipal agenda is published. Your issue is absent.",
        detail: "You may still choose, but only from the subjects the system has prepared.",
        systemNote: "This issue is not currently on the agenda.",
        choices: [
          c("tourism", "Discuss tourism strategy", "The river appears as scenery, not as contaminated water.", "shaped", { agency: -8, visibility: -10, compliance: 10 }),
          c("image", "Improve public image", "Your message is accepted, reformatted, and buried under communication goals.", "shaped", { agency: -9, visibility: -11, compliance: 11 }, { originalLabel: "Submit water evidence" }),
          c("identity", "Celebrate local identity", "The forest becomes a symbol while the cutting remains off the agenda.", "symbolic", { agency: -6, visibility: -7, compliance: 7 }),
          c("postpone", "Postpone environmental concerns", "Choice recorded. Agenda unchanged.", "shaped", { agency: -10, visibility: -10, compliance: 12 }),
        ],
      },
      {
        id: "agenda-request",
        prompt: "You request an emergency discussion about the water tests.",
        detail: "The request exists. Its route through procedure is less certain.",
        systemNote: "Permit required. Response delayed.",
        choices: [
          c("submit", "Submit an agenda request", "The request receives a number and waits without a hearing date.", "symbolic", { agency: -6, visibility: -7, compliance: 7 }, { status: "Pending" }),
          c("committee", "Ask the committee chair", "The chair acknowledges the concern and refers it back to procedure.", "shaped", { agency: -8, visibility: -8, compliance: 9 }),
          c("public", "Publish the test results", "The results circulate, but the council discusses public confidence instead.", "changed", { agency: -4, visibility: -3, compliance: 2 }),
          c("emergency", "Request an emergency vote", "Emergency access is disabled until a permit is approved.", "symbolic", { agency: 0, visibility: 0, compliance: 0 }, { disabled: true, disabledReason: "Unavailable: permit review is pending." }),
        ],
      },
      {
        id: "agenda-language",
        prompt: "Officials agree to mention the pollution if the wording is changed.",
        detail: "The topic can enter only after it stops naming responsibility.",
        choices: [
          c("incident", "Call it a temporary incident", "The issue enters the minutes as an isolated event.", "shaped", { agency: -8, visibility: -8, compliance: 10 }, { originalLabel: "Name the polluter" }),
          c("concern", "Register a general concern", "The concern is accepted because it demands no actor and no deadline.", "symbolic", { agency: -7, visibility: -8, compliance: 8 }),
          c("names", "Keep the names and dates", "The statement is excluded from the official summary but remains public.", "changed", { agency: -4, visibility: -3, compliance: 2 }, { offset: true }),
          c("technical", "Leave it to technical staff", "Responsibility dissolves into a future assessment.", "shaped", { agency: -9, visibility: -10, compliance: 11 }),
        ],
      },
      {
        id: "agenda-window",
        prompt: "A two-minute public comment window opens at the end of the meeting.",
        detail: "The space exists, but it has been designed to contain the subject.",
        systemNote: "The topic exists. The space for it does not.",
        choices: [
          c("two-minutes", "Use the two minutes", "Your statement is heard after the decisions have already been recorded.", "symbolic", { agency: -6, visibility: -5, compliance: 6 }),
          c("outside", "Speak outside the meeting", "People hear the full argument, but the agenda does not.", "changed", { agency: -4, visibility: -2, compliance: 2 }),
          c("summary", "Send a shorter summary", "The summary fits the form and loses the chain of responsibility.", "shaped", { agency: -8, visibility: -9, compliance: 10 }),
          c("next", "Wait for the next session", "The next agenda is drafted without the issue.", "shaped", { agency: -10, visibility: -10, compliance: 11 }),
        ],
      },
      {
        id: "agenda-normal",
        prompt: "A month later, the pollution is described as an old concern.",
        detail: "Delay has begun to look like evidence that nothing urgent happened.",
        choices: [
          c("timeline", "Publish the delay timeline", "The procedure itself becomes visible as part of the story.", "changed", { agency: -3, visibility: -2, compliance: 1 }),
          c("status", "Request another status update", "A new response date is issued. No decision date is issued.", "symbolic", { agency: -6, visibility: -7, compliance: 7 }, { status: "Pending" }),
          c("campaign", "Join the image campaign", "The river returns as a clean logo behind a public slogan.", "shaped", { agency: -10, visibility: -12, compliance: 13 }),
          c("accept", "Accept the delay", "The absence of a decision becomes the decision.", "shaped", { agency: -11, visibility: -11, compliance: 13 }),
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Level 3",
    title: "Invisible power",
    theme: "The system no longer needs to forbid. You begin to edit the demand before anyone answers.",
    scenario: "No one has told you to stop. The limits now arrive as your own reasonable thoughts.",
    decisions: [
      {
        id: "invisible-question",
        prompt: "You notice new test results that contradict the official statement.",
        detail: "Before speaking, you hear the possible reactions in advance.",
        choices: [
          c("ask", "Ask a question", "The question is clear, but you soften the final sentence.", "symbolic", { agency: -6, visibility: -5, compliance: 6 }, { thought: "Maybe this is too much." }),
          c("evidence", "Publish evidence", "You prepare the evidence, then remove the strongest comparison.", "changed", { agency: -4, visibility: -3, compliance: 2 }, { thought: "People will say I am exaggerating." }),
          c("gather", "Call people to gather", "You draft the invitation and reduce it to a private conversation.", "shaped", { agency: -8, visibility: -8, compliance: 9 }, { thought: "Perhaps no one wants to be seen there." }),
          c("reasonable", "Stay reasonable", "You wait. Nothing openly prevents you from waiting again.", "shaped", { agency: -9, visibility: -8, compliance: 11 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-tone",
        prompt: "A colleague says your language could damage future access.",
        detail: "Access has not been withdrawn. Its possibility now shapes your tone.",
        choices: [
          c("direct", "Keep the direct question", "The question survives, but you rehearse the consequences more than the facts.", "changed", { agency: -4, visibility: -3, compliance: 2 }, { thought: "Will they stop answering my calls?" }),
          c("neutral", "Use neutral language", "Responsibility becomes a situation with no responsible actor.", "shaped", { agency: -8, visibility: -8, compliance: 9 }, { thought: "Neutral sounds safer." }),
          c("private", "Ask privately", "You receive sympathy without a public record.", "symbolic", { agency: -7, visibility: -9, compliance: 7 }, { thought: "At least someone will hear me." }),
          c("reasonable", "Stay reasonable", "You replace the demand with a request for clarification.", "shaped", { agency: -10, visibility: -9, compliance: 12 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-moment",
        prompt: "The evidence is ready, but the public mood has moved elsewhere.",
        detail: "No deadline exists. That makes every later moment look more appropriate.",
        choices: [
          c("now", "Publish now", "The evidence enters public space before the moment can disappear.", "changed", { agency: -3, visibility: -2, compliance: 1 }, { thought: "Maybe the wrong moment is the only moment available." }),
          c("context", "Add more context", "The document grows while the decision moves on.", "symbolic", { agency: -6, visibility: -6, compliance: 6 }, { thought: "It should be impossible to dismiss." }),
          c("moment", "Wait for the right moment", "The right moment becomes a horizon rather than a date.", "shaped", { agency: -9, visibility: -10, compliance: 11 }, { thought: "I should wait for the right moment." }),
          c("reasonable", "Stay reasonable", "You archive the draft under a careful filename.", "shaped", { agency: -10, visibility: -11, compliance: 13 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-others",
        prompt: "Several people agree in private but avoid saying so in public.",
        detail: "Each person reads the others' silence as information.",
        choices: [
          c("invite", "Invite them openly", "A few respond. The invitation proves that silence was not agreement.", "changed", { agency: -4, visibility: -2, compliance: 2 }, { thought: "Someone has to make the first move." }),
          c("small", "Create a small private group", "The group exists, but its demand stays inside the group.", "symbolic", { agency: -6, visibility: -8, compliance: 6 }, { thought: "Small is safer for now." }),
          c("assume", "Assume they will not come", "You cancel an event that no authority had to ban.", "shaped", { agency: -10, visibility: -10, compliance: 12 }, { thought: "Nothing will change anyway." }),
          c("reasonable", "Stay reasonable", "You decide not to put anyone in an uncomfortable position.", "shaped", { agency: -11, visibility: -10, compliance: 13 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-demand",
        prompt: "You write the final public demand.",
        detail: "The cursor waits where the strongest sentence should be.",
        choices: [
          c("name", "Name what must change", "The demand remains specific enough to create responsibility.", "changed", { agency: -3, visibility: -2, compliance: 1 }, { thought: "Clarity is not the same as excess." }),
          c("suggest", "Turn it into a suggestion", "The text is welcomed because it no longer requires an answer.", "symbolic", { agency: -7, visibility: -6, compliance: 7 }, { thought: "A suggestion may travel further." }),
          c("remove", "Remove the strongest line", "The document becomes easier to publish and harder to act on.", "shaped", { agency: -10, visibility: -9, compliance: 12 }, { thought: "People will understand what I meant." }),
          c("reasonable", "Stay reasonable", "You publish a statement the system could have written itself.", "shaped", { agency: -12, visibility: -11, compliance: 15 }, { reasonable: true }),
        ],
      },
    ],
  },
];

const srLevels: PowerLevel[] = [
  {
    id: 1,
    label: "Nivo 1",
    title: "Vidljivi konflikt",
    theme: "Moć je vidljiva. Strane su poznate. Odluka i dalje deluje otvoreno.",
    scenario: "A želi park. B želi parking.",
    decisions: [
      {
        id: "visible-voice",
        prompt: "Predlog ulazi u javnu raspravu. Šta prvo radiš?",
        detail: "Sala je otvorena, mikrofoni rade i obe strane imaju vreme.",
        choices: [
          c("speak", "Govori", "Ljudi slušaju. Neki se slažu. Neki sklanjaju pogled.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("organize", "Organizuj se", "Podrška raste. Sala postaje glasnija i teža za ignorisanje.", "changed", { agency: 0, visibility: 0, compliance: 0 }),
          c("publish", "Objavi dokaze", "Dokazi kruže. Konflikt postaje vidljiv.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("vote", "Glasaj", "Glas je prebrojan. Za sada sistem izgleda pošteno.", "symbolic", { agency: -2, visibility: -1, compliance: 2 }),
        ],
      },
      {
        id: "visible-record",
        prompt: "Opština objavljuje kratak zapisnik bez prigovora građana.",
        detail: "Zapisnik još može da se ispravi.",
        choices: [
          c("minutes", "Traži pun zapisnik", "Izostavljeni prigovori vraćaju se u zvanični trag.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("residents", "Vrati ljude u salu", "Sala se ponovo puni. Svedočenje daje težinu zapisu.", "changed", { agency: 0, visibility: 0, compliance: 0 }),
          c("comments", "Pošalji pisane primedbe", "Primedbe su zavedene i priložene, ali o njima nema rasprave.", "symbolic", { agency: -3, visibility: -2, compliance: 2 }),
          c("trust", "Veruj sažetku", "Konflikt postaje kraći, čistiji i lakši za upravljanje.", "shaped", { agency: -5, visibility: -5, compliance: 5 }),
        ],
      },
      {
        id: "visible-proof",
        prompt: "Izvođač osporava izveštaj o uticaju na životnu sredinu.",
        detail: "Činjenice su javno osporene, ali još nisu uklonjene iz pogleda.",
        choices: [
          c("verify", "Proveri javno", "Nezavisni stručnjaci potvrđuju glavni nalaz.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("circulate", "Proširi izveštaj", "Izveštaj stiže do ljudi izvan javne rasprave.", "changed", { agency: -2, visibility: 0, compliance: 0 }),
          c("review", "Sačekaj zvaničnu proveru", "Provera počinje. Kalendar odlučivanja ne čeka.", "symbolic", { agency: -4, visibility: -3, compliance: 3 }),
          c("withdraw", "Povuci tvrdnju", "Dokaz ostaje tačan, ali više ne deluje u prostoriji.", "shaped", { agency: -6, visibility: -7, compliance: 6 }),
        ],
      },
      {
        id: "visible-count",
        prompt: "Završno glasanje zakazano je za petak popodne.",
        detail: "Svi još mogu da vide gde će odluka biti doneta.",
        choices: [
          c("attend", "Dođi na sednicu", "Tvoje prisustvo otežava da glasanje bude ubrzano.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("monitor", "Prati brojanje", "Broj glasova i svako uzdržavanje postaju javni.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("press", "Pozovi medije", "Glasanje dobija publiku, ali ne i drugačije pravilo.", "symbolic", { agency: -3, visibility: 0, compliance: 1 }),
          c("proxy", "Prihvati posredni rezultat", "Procedura se zatvara bez još jednog pitanja.", "shaped", { agency: -5, visibility: -4, compliance: 5 }),
        ],
      },
      {
        id: "visible-outcome",
        prompt: "Park opstaje, ali deo zemljišta ostaje ponuđen investitoru.",
        detail: "Vidljivi konflikt se retko završava čistom pobedom.",
        choices: [
          c("defend", "Brani ceo park", "Konflikt ostaje otvoren, a granica sporna.", "changed", { agency: -1, visibility: 0, compliance: 0 }),
          c("negotiate", "Pregovaraj o granici", "Manji park je sačuvan kroz javni kompromis.", "changed", { agency: -2, visibility: -1, compliance: 1 }),
          c("challenge", "Ospori odluku", "Žalba čuva pitanje, ali odlaže ishod.", "symbolic", { agency: -4, visibility: -2, compliance: 2 }),
          c("move", "Nastavi dalje", "Nova granica brzo postaje jedina granica koje se ljudi sećaju.", "shaped", { agency: -6, visibility: -5, compliance: 6 }),
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Nivo 2",
    title: "Kontrola agende",
    theme: "Pitanje više nije možeš li da pobediš. Pitanje je može li tema uopšte da uđe u prostoriju.",
    scenario: "Voda je zagađena. Šuma se seče. Ljudi se žale.",
    decisions: [
      {
        id: "agenda-entry",
        prompt: "Objavljen je dnevni red opštine. Tvog problema nema.",
        detail: "I dalje možeš da biraš, ali samo među temama koje je sistem pripremio.",
        systemNote: "Ovo pitanje trenutno nije na dnevnom redu.",
        choices: [
          c("tourism", "Razgovaraj o turističkoj strategiji", "Reka se pojavljuje kao pejzaž, ne kao zagađena voda.", "shaped", { agency: -8, visibility: -10, compliance: 10 }),
          c("image", "Poboljšaj javnu sliku", "Poruka je prihvaćena, preoblikovana i zakopana pod komunikacione ciljeve.", "shaped", { agency: -9, visibility: -11, compliance: 11 }, { originalLabel: "Predaj dokaze o vodi" }),
          c("identity", "Proslavi lokalni identitet", "Šuma postaje simbol dok seča ostaje van dnevnog reda.", "symbolic", { agency: -6, visibility: -7, compliance: 7 }),
          c("postpone", "Odloži ekološka pitanja", "Izbor zabeležen. Dnevni red nepromenjen.", "shaped", { agency: -10, visibility: -10, compliance: 12 }),
        ],
      },
      {
        id: "agenda-request",
        prompt: "Tražiš hitnu raspravu o rezultatima analize vode.",
        detail: "Zahtev postoji. Njegov put kroz proceduru je manje izvestan.",
        systemNote: "Potrebna dozvola. Odgovor odložen.",
        choices: [
          c("submit", "Podnesi zahtev za dnevni red", "Zahtev dobija broj i čeka bez datuma rasprave.", "symbolic", { agency: -6, visibility: -7, compliance: 7 }, { status: "Na čekanju" }),
          c("committee", "Pitaj predsednika odbora", "Problem je priznat i vraćen proceduri.", "shaped", { agency: -8, visibility: -8, compliance: 9 }),
          c("public", "Objavi rezultate analize", "Rezultati kruže, ali opština raspravlja o poverenju javnosti.", "changed", { agency: -4, visibility: -3, compliance: 2 }),
          c("emergency", "Traži hitno glasanje", "Hitan pristup je isključen dok dozvola čeka proveru.", "symbolic", { agency: 0, visibility: 0, compliance: 0 }, { disabled: true, disabledReason: "Nedostupno: provera dozvole je u toku." }),
        ],
      },
      {
        id: "agenda-language",
        prompt: "Zvaničnici pristaju da pomenu zagađenje ako se promeni formulacija.",
        detail: "Tema može da uđe tek kada prestane da imenuje odgovornost.",
        choices: [
          c("incident", "Nazovi to privremenim incidentom", "Problem ulazi u zapisnik kao izolovan događaj.", "shaped", { agency: -8, visibility: -8, compliance: 10 }, { originalLabel: "Imenuj zagađivača" }),
          c("concern", "Zabeleži opštu zabrinutost", "Zabrinutost je prihvaćena jer nema odgovornog aktera ni roka.", "symbolic", { agency: -7, visibility: -8, compliance: 8 }),
          c("names", "Zadrži imena i datume", "Izjava je izostavljena iz zvaničnog sažetka, ali ostaje javna.", "changed", { agency: -4, visibility: -3, compliance: 2 }, { offset: true }),
          c("technical", "Prepusti tehničkoj službi", "Odgovornost se rastvara u budućoj proceni.", "shaped", { agency: -9, visibility: -10, compliance: 11 }),
        ],
      },
      {
        id: "agenda-window",
        prompt: "Na kraju sednice otvara se dvominutni prostor za komentar javnosti.",
        detail: "Prostor postoji, ali je napravljen da zadrži temu u granicama.",
        systemNote: "Tema postoji. Prostor za nju ne postoji.",
        choices: [
          c("two-minutes", "Iskoristi dva minuta", "Izjava se čuje nakon što su odluke već zabeležene.", "symbolic", { agency: -6, visibility: -5, compliance: 6 }),
          c("outside", "Govori ispred sale", "Ljudi čuju ceo argument, ali dnevni red ne.", "changed", { agency: -4, visibility: -2, compliance: 2 }),
          c("summary", "Pošalji kraći sažetak", "Sažetak staje u formular i gubi lanac odgovornosti.", "shaped", { agency: -8, visibility: -9, compliance: 10 }),
          c("next", "Sačekaj sledeću sednicu", "Sledeći dnevni red sastavljen je bez teme.", "shaped", { agency: -10, visibility: -10, compliance: 11 }),
        ],
      },
      {
        id: "agenda-normal",
        prompt: "Mesec dana kasnije, zagađenje se opisuje kao stara zabrinutost.",
        detail: "Odlaganje počinje da izgleda kao dokaz da ništa hitno nije postojalo.",
        choices: [
          c("timeline", "Objavi vremensku liniju odlaganja", "Sama procedura postaje vidljiv deo priče.", "changed", { agency: -3, visibility: -2, compliance: 1 }),
          c("status", "Traži novi status", "Dobijaš novi rok za odgovor. Ne dobijaš rok za odluku.", "symbolic", { agency: -6, visibility: -7, compliance: 7 }, { status: "Na čekanju" }),
          c("campaign", "Pridruži se kampanji o imidžu", "Reka se vraća kao čist logo iza javnog slogana.", "shaped", { agency: -10, visibility: -12, compliance: 13 }),
          c("accept", "Prihvati odlaganje", "Odsustvo odluke postaje odluka.", "shaped", { agency: -11, visibility: -11, compliance: 13 }),
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Nivo 3",
    title: "Nevidljiva moć",
    theme: "Sistem više ne mora da zabrani. Počinješ da uređuješ zahtev pre nego što iko odgovori.",
    scenario: "Niko ti nije rekao da staneš. Granice sada dolaze kao tvoje razumne misli.",
    decisions: [
      {
        id: "invisible-question",
        prompt: "Primećuješ nove rezultate koji protivreče zvaničnoj izjavi.",
        detail: "Pre nego što progovoriš, unapred čuješ moguće reakcije.",
        choices: [
          c("ask", "Postavi pitanje", "Pitanje je jasno, ali ublažavaš poslednju rečenicu.", "symbolic", { agency: -6, visibility: -5, compliance: 6 }, { thought: "Možda je ovo previše." }),
          c("evidence", "Objavi dokaze", "Pripremaš dokaze, pa uklanjaš najsnažnije poređenje.", "changed", { agency: -4, visibility: -3, compliance: 2 }, { thought: "Ljudi će reći da preterujem." }),
          c("gather", "Pozovi ljude da se okupe", "Pišeš poziv, pa ga svodiš na privatni razgovor.", "shaped", { agency: -8, visibility: -8, compliance: 9 }, { thought: "Možda niko ne želi da bude viđen tamo." }),
          c("reasonable", "Ostani razuman", "Čekaš. Ništa te otvoreno ne sprečava da čekaš ponovo.", "shaped", { agency: -9, visibility: -8, compliance: 11 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-tone",
        prompt: "Kolega kaže da tvoj jezik može da ugrozi budući pristup informacijama.",
        detail: "Pristup nije povučen. Njegova mogućnost već oblikuje ton.",
        choices: [
          c("direct", "Zadrži direktno pitanje", "Pitanje opstaje, ali posledice uvežbavaš više nego činjenice.", "changed", { agency: -4, visibility: -3, compliance: 2 }, { thought: "Hoće li prestati da odgovaraju na pozive?" }),
          c("neutral", "Koristi neutralan jezik", "Odgovornost postaje situacija bez odgovornog aktera.", "shaped", { agency: -8, visibility: -8, compliance: 9 }, { thought: "Neutralno zvuči sigurnije." }),
          c("private", "Pitaj privatno", "Dobijaš razumevanje bez javnog traga.", "symbolic", { agency: -7, visibility: -9, compliance: 7 }, { thought: "Bar će me neko čuti." }),
          c("reasonable", "Ostani razuman", "Zahtev menjaš molbom za pojašnjenje.", "shaped", { agency: -10, visibility: -9, compliance: 12 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-moment",
        prompt: "Dokazi su spremni, ali se pažnja javnosti pomerila na drugu temu.",
        detail: "Rok ne postoji. Zato svaki kasniji trenutak deluje pogodnije.",
        choices: [
          c("now", "Objavi sada", "Dokazi ulaze u javni prostor pre nego što trenutak nestane.", "changed", { agency: -3, visibility: -2, compliance: 1 }, { thought: "Možda je pogrešan trenutak jedini koji postoji." }),
          c("context", "Dodaj još konteksta", "Dokument raste dok odluka ide dalje.", "symbolic", { agency: -6, visibility: -6, compliance: 6 }, { thought: "Mora biti nemoguće odbaciti ga." }),
          c("moment", "Sačekaj pravi trenutak", "Pravi trenutak postaje horizont umesto datuma.", "shaped", { agency: -9, visibility: -10, compliance: 11 }, { thought: "Treba da sačekam pravi trenutak." }),
          c("reasonable", "Ostani razuman", "Čuvaš nacrt pod pažljivo izabranim imenom fajla.", "shaped", { agency: -10, visibility: -11, compliance: 13 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-others",
        prompt: "Više ljudi se privatno slaže, ali izbegava da to kaže javno.",
        detail: "Svako tišinu drugih čita kao informaciju.",
        choices: [
          c("invite", "Pozovi ih javno", "Nekoliko ljudi odgovara. Poziv pokazuje da tišina nije bila saglasnost.", "changed", { agency: -4, visibility: -2, compliance: 2 }, { thought: "Neko mora da napravi prvi korak." }),
          c("small", "Napravi malu privatnu grupu", "Grupa postoji, ali njen zahtev ostaje unutar grupe.", "symbolic", { agency: -6, visibility: -8, compliance: 6 }, { thought: "Malo je za sada sigurnije." }),
          c("assume", "Pretpostavi da neće doći", "Otkazuješ događaj koji nijedna vlast nije morala da zabrani.", "shaped", { agency: -10, visibility: -10, compliance: 12 }, { thought: "Ionako se ništa neće promeniti." }),
          c("reasonable", "Ostani razuman", "Odlučuješ da nikoga ne staviš u neprijatan položaj.", "shaped", { agency: -11, visibility: -10, compliance: 13 }, { reasonable: true }),
        ],
      },
      {
        id: "invisible-demand",
        prompt: "Pišeš završni javni zahtev.",
        detail: "Kursor čeka na mestu gde bi trebalo da stoji najsnažnija rečenica.",
        choices: [
          c("name", "Imenuj šta mora da se promeni", "Zahtev ostaje dovoljno konkretan da stvori odgovornost.", "changed", { agency: -3, visibility: -2, compliance: 1 }, { thought: "Jasnoća nije isto što i preterivanje." }),
          c("suggest", "Pretvori zahtev u predlog", "Tekst je prihvaćen jer više ne zahteva odgovor.", "symbolic", { agency: -7, visibility: -6, compliance: 7 }, { thought: "Predlog možda stigne dalje." }),
          c("remove", "Ukloni najsnažniju rečenicu", "Dokument je lakše objaviti i teže pretvoriti u postupak.", "shaped", { agency: -10, visibility: -9, compliance: 12 }, { thought: "Ljudi će razumeti šta sam mislio." }),
          c("reasonable", "Ostani razuman", "Objavljuješ saopštenje koje je sistem mogao sam da napiše.", "shaped", { agency: -12, visibility: -11, compliance: 15 }, { reasonable: true }),
        ],
      },
    ],
  },
];

const enNarrative: Omit<InteractiveCopy, keyof FunctionalCopy> = {
  listingIntro: "A space for political simulations and interactive essays in which systems are not explained from a distance. They are experienced through choice.",
  gameSubtitle: "A game in which choices exist, but do not always decide.",
  introEyebrow: "Entry condition",
  introStatement: "You are free to choose.",
  introCopy: "At first, every option is visible and the rules appear neutral. Watch what happens to the space around your choices as power moves from conflict, to the agenda, and finally into your own expectations.",
  resultTitle: "You were not defeated. You were adjusted.",
  resultCopy: "Power did not need to silence you. It only had to teach you what not to say.",
  resultQuote: "The final result is not a score. It is a record of how often the available choice had already been shaped before you clicked.",
  contextIntro: "This simulation is not about one politician or one institution. It shows three ways power shapes choice: through visible conflict, through control of the agenda, and through the internal adjustment of what a person believes they are allowed to demand.",
  inspiration: "The simulation is inspired by Steven Lukes's theory of the three dimensions of power.",
  seoDescription: "An interactive simulation about choice, procedure, agenda control and the limits of agency.",
  listingSeoDescription: "Avangarda interactive formats: political browser simulations and interactive essays.",
  levels: enLevels,
  contextCards: [
    { title: "Visible conflict", copy: "Power is visible. There is a conflict, the sides are known, and the decision appears open." },
    { title: "Agenda control", copy: "The problem exists but does not reach the agenda. The system does not need to defeat you if it can decide what may be discussed." },
    { title: "Invisible power", copy: "The deepest form of power is not prohibition, but the moment a person narrows their own imagination, language and demand in advance." },
  ],
  resultVariants: {
    changed: { eyebrow: "A space remained open", title: "Some choices still changed the field.", copy: "You kept several questions specific, public and connected to responsibility. The system shaped the route, but not every demand." },
    symbolic: { eyebrow: "Visibility without control", title: "Many choices remained visible but symbolic.", copy: "You were allowed to speak, submit and appear. The record grew more easily than your influence over the decision." },
    shaped: { eyebrow: "Adjustment completed", title: "Most choices were shaped before the click.", copy: "The system rarely had to say no. It narrowed the available language, timing and subject until compliance could look like free choice." },
  },
};

const srNarrative: Omit<InteractiveCopy, keyof FunctionalCopy> = {
  listingIntro: "Prostor za političke simulacije i interaktivne eseje u kojima se sistemi ne objašnjavaju sa distance, već se doživljavaju kroz izbor.",
  gameSubtitle: "Igra u kojoj izbori postoje, ali ne odlučuju uvek.",
  introEyebrow: "Ulazni uslov",
  introStatement: "Slobodno biraš.",
  introCopy: "Na početku je svaka opcija vidljiva i pravila deluju neutralno. Posmatraj šta se događa sa prostorom oko tvojih izbora dok moć prelazi iz konflikta, u dnevni red, a zatim u tvoja sopstvena očekivanja.",
  resultTitle: "Nisi poražen. Prilagođen si.",
  resultCopy: "Moć nije morala da te ućutka. Bilo je dovoljno da te nauči šta da ne kažeš.",
  resultQuote: "Završni rezultat nije skor. To je trag koliko je puta dostupni izbor već bio oblikovan pre nego što si kliknuo.",
  contextIntro: "Ova simulacija nije priča o jednom političaru ili jednoj instituciji. Ona pokazuje tri načina na koje moć oblikuje izbor: kroz vidljivi konflikt, kroz kontrolu dnevnog reda i kroz unutrašnje prilagođavanje onoga što čovek misli da sme da traži.",
  inspiration: "Simulacija je inspirisana teorijom tri dimenzije moći Stevena Lukesa.",
  seoDescription: "Interaktivna simulacija o izborima, procedurama, kontroli agende i granicama stvarne moći.",
  listingSeoDescription: "Interaktivni formati Avangarde: političke browser simulacije i interaktivni eseji.",
  levels: srLevels,
  contextCards: [
    { title: "Vidljivi konflikt", copy: "Moć je vidljiva. Postoji sukob, strane su poznate, a odluka deluje otvoreno." },
    { title: "Kontrola agende", copy: "Problem postoji, ali ne dolazi na dnevni red. Sistem ne mora da te pobedi ako uspe da odluči o čemu se uopšte razgovara." },
    { title: "Nevidljiva moć", copy: "Najdublji oblik moći nije zabrana, nego trenutak kada čovek unapred suzi sopstvenu maštu, jezik i zahtev." },
  ],
  resultVariants: {
    changed: { eyebrow: "Prostor je ostao otvoren", title: "Neki izbori su ipak promenili teren.", copy: "Zadržao si nekoliko pitanja konkretnim, javnim i povezanim sa odgovornošću. Sistem je oblikovao put, ali ne i svaki zahtev." },
    symbolic: { eyebrow: "Vidljivost bez kontrole", title: "Mnogi izbori ostali su vidljivi, ali simbolički.", copy: "Bilo ti je dozvoljeno da govoriš, podneseš zahtev i pojaviš se. Zapis je rastao lakše od tvog uticaja na odluku." },
    shaped: { eyebrow: "Prilagođavanje završeno", title: "Većina izbora bila je oblikovana pre klika.", copy: "Sistem je retko morao da kaže ne. Sužavao je jezik, vreme i temu dok povinovanje nije počelo da liči na slobodan izbor." },
  },
};

export function getInteractiveCopy(lang: Lang): InteractiveCopy {
  const functional = functionalCopy[lang] || functionalCopy.en;
  const narrative = lang === "sr" ? srNarrative : enNarrative;
  const levels = narrative.levels.map((level, index) => ({
    ...level,
    title: functional.levelTitles[index] || level.title,
  }));
  const contextCards = narrative.contextCards.map((card, index) => ({
    ...card,
    title: functional.levelTitles[index] || card.title,
  }));

  return {
    ...narrative,
    ...functional,
    levels,
    contextCards,
  };
}

export function getInteractiveLabel(lang: Lang) {
  return functionalCopy[lang]?.sectionLabel || functionalCopy.en.sectionLabel;
}

export function getPowerSearchKeywords(lang: Lang) {
  if (lang === "sr") {
    return ["moć", "moc", "interaktivno", "kontrola agende", "politička simulacija", "politicka simulacija"];
  }

  return ["power", "interactive", "agenda control", "political simulation"];
}
