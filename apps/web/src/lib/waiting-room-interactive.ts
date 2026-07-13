import type { Lang } from "@/lib/i18n";

export type WaitingRoomStatusId =
  | "received"
  | "checking"
  | "supplement"
  | "forwarded"
  | "missing"
  | "reentered"
  | "deadlineOpen"
  | "deadlineExpired"
  | "signature"
  | "returned"
  | "inProgress"
  | "decisionDrafted"
  | "delivery";

export type WaitingRoomEndingId = "evidence" | "compromise" | "exhausted" | "late" | "ongoing";

export type WaitingRoomFlag =
  | "case-number"
  | "written-record"
  | "jurisdiction-confirmed"
  | "legal-support"
  | "public-action";

export type WaitingRoomMeters = {
  patience: number;
  dignity: number;
  time: number;
};

export type WaitingRoomCounters = {
  visits: number;
  calls: number;
  supplements: number;
  redirects: number;
  missedWorkdays: number;
  proceduralResponses: number;
  concreteInformation: number;
  retellings: number;
  writtenRequests: number;
  withdrawals: number;
  failedVisits: number;
};

export type WaitingRoomRequirement = {
  minPatience?: number;
  minDignity?: number;
  minReceipts?: number;
  minConnection?: number;
  minPatterns?: number;
  anyFlags?: WaitingRoomFlag[];
};

export type WaitingRoomChoiceEffect = {
  delta: WaitingRoomMeters;
  counters?: Partial<WaitingRoomCounters>;
  status: WaitingRoomStatusId;
  formalMovement: number;
  realMovement: number;
  connection?: number;
  patterns?: number;
  receipts?: number;
  concessions?: number;
  flags?: WaitingRoomFlag[];
  acceptedWeakSolution?: boolean;
  caseProtected?: boolean;
  caseAccepted?: boolean;
  caseClosed?: boolean;
  capacityToContinue?: boolean;
  queueAdvance?: number;
};

export type WaitingRoomChoice = {
  id: string;
  action: string;
  response: string;
  effect: WaitingRoomChoiceEffect;
  requirement?: WaitingRoomRequirement;
};

export type WaitingRoomDecision = {
  id: string;
  prompt: string;
  detail: string;
  choices: WaitingRoomChoice[];
};

export type WaitingRoomPhase = {
  id: 1 | 2 | 3 | 4;
  label: string;
  title: string;
  theme: string;
  scenario: string;
  decisions: WaitingRoomDecision[];
};

export type WaitingRoomEnding = {
  eyebrow: string;
  title: string;
  copy: string;
  note: string;
};

export type WaitingRoomOutcomeSummary = {
  meters: WaitingRoomMeters;
  counters: WaitingRoomCounters;
  formalMovement: number;
  realMovement: number;
  connection: number;
  patterns: number;
  receipts: number;
  concessions: number;
  flags: WaitingRoomFlag[];
  acceptedWeakSolution: boolean;
  caseProtected: boolean;
  caseAccepted: boolean;
  caseClosed: boolean;
  capacityToContinue: boolean;
};

type WaitingRoomTimeUnits = {
  dayOne: string;
  dayMany: string;
  monthOne: string;
  monthMany: string;
  yearOne: string;
  yearMany: string;
};

type WaitingRoomLocaleDecision = {
  prompt: string;
  detail: string;
  choices: Array<{ action: string; response: string }>;
};

type WaitingRoomLocalePhase = {
  label: string;
  title: string;
  theme: string;
  scenario: string;
  decisions: WaitingRoomLocaleDecision[];
};

type WaitingRoomLocaleCopy = {
  sectionLabel: string;
  collectionTitle: string;
  collectionIntro: string;
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
  patienceLabel: string;
  dignityLabel: string;
  timeLabel: string;
  formalLabel: string;
  realLabel: string;
  statusLabel: string;
  logLabel: string;
  connectionLabel: string;
  receiptsLabel: string;
  patternsLabel: string;
  departuresLabel: string;
  queueYourNumberLabel: string;
  queueServingLabel: string;
  queueWaitingLabel: string;
  welcomeLines: [string, string, string];
  caseLabel: string;
  caseTypes: string[];
  monitorMessages: string[];
  statuses: Record<WaitingRoomStatusId, string>;
  requirementLabels: {
    patience: string;
    dignity: string;
    receipts: string;
    connection: string;
    patterns: string;
    support: string;
  };
  people: Record<"31" | "38" | "42" | "45" | "53", { label: string; departure: string }>;
  endings: Record<WaitingRoomEndingId, WaitingRoomEnding>;
  resultStats: {
    totalTime: string;
    visits: string;
    calls: string;
    supplements: string;
    redirects: string;
    retellings: string;
    proceduralResponses: string;
    concreteInformation: string;
    peopleLeft: string;
    patience: string;
    dignity: string;
    formalMovement: string;
    realMovement: string;
  };
  phases: WaitingRoomLocalePhase[];
  contextEyebrow: string;
  contextTitle: string;
  contextIntro: string;
  contextCards: Array<{ title: string; copy: string }>;
  disclaimer: string;
  listingSeoDescription: string;
  seoDescription: string;
  timeUnits: WaitingRoomTimeUnits;
  screenReaderRoomLabel: string;
  screenReaderClockLabel: string;
  screenReaderQueueLabel: string;
  screenReaderEmptySeatLabel: string;
};

export type WaitingRoomCopy = Omit<WaitingRoomLocaleCopy, "phases"> & {
  phases: WaitingRoomPhase[];
};

type MechanicalChoice = {
  id: string;
  effect: WaitingRoomChoiceEffect;
  requirement?: WaitingRoomRequirement;
};

type MechanicalDecision = {
  id: string;
  choices: MechanicalChoice[];
};

type MechanicalPhase = {
  id: 1 | 2 | 3 | 4;
  decisions: MechanicalDecision[];
};

const c = (
  id: string,
  effect: WaitingRoomChoiceEffect,
  requirement?: WaitingRoomRequirement
): MechanicalChoice => ({ id, effect, requirement });

const mechanics: MechanicalPhase[] = [
  {
    id: 1,
    decisions: [
      {
        id: "first-contact",
        choices: [
          c("counter", { delta: { patience: -8, dignity: -4, time: 1 }, counters: { visits: 1, missedWorkdays: 1, retellings: 1 }, status: "checking", formalMovement: 1, realMovement: 0 }),
          c("written-request", { delta: { patience: -4, dignity: 1, time: 3 }, counters: { writtenRequests: 1 }, status: "received", formalMovement: 1, realMovement: 1, receipts: 1, flags: ["written-record"], caseProtected: true }),
          c("listen", { delta: { patience: 2, dignity: 4, time: 1 }, status: "received", formalMovement: 0, realMovement: 0, connection: 2, patterns: 1 }),
        ],
      },
      {
        id: "locate-case",
        choices: [
          c("call", { delta: { patience: -5, dignity: -1, time: 2 }, counters: { calls: 1, proceduralResponses: 1 }, status: "checking", formalMovement: 1, realMovement: 0 }),
          c("return-counter", { delta: { patience: -10, dignity: -4, time: 2 }, counters: { visits: 1, failedVisits: 1, missedWorkdays: 1, retellings: 1 }, status: "missing", formalMovement: 1, realMovement: 0 }, { minPatience: 20 }),
          c("preserve-receipt", { delta: { patience: -2, dignity: 2, time: 1 }, counters: { concreteInformation: 1 }, status: "received", formalMovement: 0, realMovement: 1, receipts: 1, flags: ["written-record"] }),
        ],
      },
      {
        id: "first-status",
        choices: [
          c("accept-wait", { delta: { patience: -3, dignity: -2, time: 30 }, counters: { proceduralResponses: 1 }, status: "deadlineOpen", formalMovement: 1, realMovement: 0 }),
          c("request-number", { delta: { patience: -7, dignity: 3, time: 5 }, counters: { writtenRequests: 1, concreteInformation: 1 }, status: "reentered", formalMovement: 1, realMovement: 1, flags: ["case-number"] }, { minPatience: 14 }),
          c("leave-today", { delta: { patience: 7, dignity: 2, time: 3 }, counters: { withdrawals: 1 }, status: "checking", formalMovement: 0, realMovement: 0 }),
        ],
      },
      {
        id: "first-handoff",
        choices: [
          c("duplicate-documents", { delta: { patience: -6, dignity: -4, time: 14 }, counters: { supplements: 1, missedWorkdays: 1 }, status: "supplement", formalMovement: 1, realMovement: 1 }),
          c("confirm-jurisdiction", { delta: { patience: -8, dignity: 4, time: 21 }, counters: { writtenRequests: 1, concreteInformation: 1 }, status: "forwarded", formalMovement: 1, realMovement: 1, receipts: 1, flags: ["jurisdiction-confirmed"] }, { minPatience: 18 }),
          c("informal-promise", { delta: { patience: 1, dignity: -10, time: 7 }, counters: { proceduralResponses: 1 }, status: "inProgress", formalMovement: 1, realMovement: 0, concessions: 1 }),
        ],
      },
    ],
  },
  {
    id: 2,
    decisions: [
      {
        id: "missing-paper",
        choices: [
          c("complete-file", { delta: { patience: -5, dignity: -2, time: 35 }, counters: { supplements: 1, missedWorkdays: 1 }, status: "supplement", formalMovement: 1, realMovement: 1 }),
          c("legal-help", { delta: { patience: 8, dignity: 10, time: 20 }, status: "supplement", formalMovement: 1, realMovement: 1, connection: 1, flags: ["legal-support"] }, { minDignity: 20 }),
          c("leave-today", { delta: { patience: 8, dignity: 2, time: 7 }, counters: { withdrawals: 1 }, status: "supplement", formalMovement: 0, realMovement: 0 }),
        ],
      },
      {
        id: "jurisdiction-loop",
        choices: [
          c("other-body", { delta: { patience: -8, dignity: -3, time: 45 }, counters: { redirects: 1, visits: 1, retellings: 1, missedWorkdays: 1 }, status: "forwarded", formalMovement: 1, realMovement: 0 }),
          c("written-competence", { delta: { patience: -6, dignity: 5, time: 30 }, counters: { writtenRequests: 1, concreteInformation: 1 }, status: "received", formalMovement: 1, realMovement: 1, receipts: 1, flags: ["jurisdiction-confirmed", "written-record"] }, { minPatience: 16 }),
          c("compare-stories", { delta: { patience: 4, dignity: 6, time: 4 }, status: "forwarded", formalMovement: 0, realMovement: 0, connection: 2, patterns: 1 }),
        ],
      },
      {
        id: "missing-evidence",
        choices: [
          c("repeat-submission", { delta: { patience: -6, dignity: -5, time: 30 }, counters: { supplements: 1, retellings: 1 }, status: "reentered", formalMovement: 1, realMovement: 0, receipts: 1 }),
          c("show-receipt", { delta: { patience: -3, dignity: 5, time: 7 }, counters: { concreteInformation: 1 }, status: "inProgress", formalMovement: 1, realMovement: 2 }, { minReceipts: 1 }),
          c("remove-demand", { delta: { patience: 3, dignity: -12, time: 5 }, status: "returned", formalMovement: 1, realMovement: 0, concessions: 1 }),
        ],
      },
      {
        id: "system-down",
        choices: [
          c("wait-at-counter", { delta: { patience: -12, dignity: -8, time: 1 }, counters: { visits: 1, failedVisits: 1, missedWorkdays: 1, retellings: 1 }, status: "missing", formalMovement: 1, realMovement: 0 }),
          c("send-written", { delta: { patience: -4, dignity: 3, time: 5 }, counters: { writtenRequests: 1 }, status: "received", formalMovement: 1, realMovement: 1, receipts: 1, flags: ["written-record"] }),
          c("leave-today", { delta: { patience: 10, dignity: 2, time: 3 }, counters: { withdrawals: 1 }, status: "missing", formalMovement: 0, realMovement: 0 }),
        ],
      },
    ],
  },
  {
    id: 3,
    decisions: [
      {
        id: "deadline-open",
        choices: [
          c("wait-deadline", { delta: { patience: -4, dignity: -4, time: 90 }, counters: { proceduralResponses: 1 }, status: "deadlineOpen", formalMovement: 1, realMovement: 0 }),
          c("written-urgency", { delta: { patience: -7, dignity: 5, time: 30 }, counters: { writtenRequests: 1, concreteInformation: 1 }, status: "inProgress", formalMovement: 1, realMovement: 1, receipts: 1 }, { minPatience: 14 }),
          c("call-again", { delta: { patience: -6, dignity: -2, time: 15 }, counters: { calls: 1, proceduralResponses: 1 }, status: "signature", formalMovement: 1, realMovement: 0 }),
        ],
      },
      {
        id: "deadline-expired",
        choices: [
          c("precise-complaint", { delta: { patience: -8, dignity: 7, time: 120 }, counters: { writtenRequests: 1, concreteInformation: 1 }, status: "decisionDrafted", formalMovement: 2, realMovement: 2, receipts: 1, caseProtected: true }, { minReceipts: 1, minPatience: 15 }),
          c("submit-again", { delta: { patience: -10, dignity: -8, time: 60 }, counters: { supplements: 1, retellings: 1 }, status: "reentered", formalMovement: 1, realMovement: 0 }),
          c("verbal-assurance", { delta: { patience: 2, dignity: -14, time: 45 }, counters: { proceduralResponses: 1 }, status: "signature", formalMovement: 1, realMovement: 0, concessions: 1 }),
        ],
      },
      {
        id: "waiting-signature",
        choices: [
          c("legal-help", { delta: { patience: 8, dignity: 8, time: 45 }, status: "signature", formalMovement: 1, realMovement: 1, connection: 1, flags: ["legal-support"] }, { minDignity: 18 }),
          c("keep-calling", { delta: { patience: -10, dignity: -4, time: 30 }, counters: { calls: 2, proceduralResponses: 2 }, status: "signature", formalMovement: 1, realMovement: 0 }),
          c("leave-today", { delta: { patience: 10, dignity: 3, time: 14 }, counters: { withdrawals: 1 }, status: "signature", formalMovement: 0, realMovement: 0 }),
        ],
      },
      {
        id: "decision-delayed",
        choices: [
          c("request-copy", { delta: { patience: -8, dignity: 6, time: 90 }, counters: { writtenRequests: 1, concreteInformation: 1 }, status: "delivery", formalMovement: 2, realMovement: 2, caseProtected: true, caseAccepted: true }, { minPatience: 12 }),
          c("close-without-liability", { delta: { patience: 5, dignity: -18, time: 15 }, status: "decisionDrafted", formalMovement: 2, realMovement: 1, concessions: 2, acceptedWeakSolution: true, caseClosed: true }),
          c("share-delay", { delta: { patience: 3, dignity: 7, time: 7 }, status: "signature", formalMovement: 0, realMovement: 0, connection: 2, patterns: 1 }),
        ],
      },
    ],
  },
  {
    id: 4,
    decisions: [
      {
        id: "recognize-pattern",
        choices: [
          c("compare-answers", { delta: { patience: -4, dignity: 6, time: 7 }, status: "inProgress", formalMovement: 0, realMovement: 1, connection: 2, patterns: 2 }),
          c("only-own-case", { delta: { patience: -2, dignity: -1, time: 30 }, counters: { proceduralResponses: 1 }, status: "inProgress", formalMovement: 1, realMovement: 0 }),
          c("leave-today", { delta: { patience: 8, dignity: 2, time: 21 }, counters: { withdrawals: 1 }, status: "inProgress", formalMovement: 0, realMovement: 0 }),
        ],
      },
      {
        id: "preserve-pattern",
        choices: [
          c("collect-receipts", { delta: { patience: -6, dignity: 4, time: 20 }, status: "inProgress", formalMovement: 1, realMovement: 1, connection: 2, patterns: 1, receipts: 1 }),
          c("public-question", { delta: { patience: -8, dignity: 5, time: 15 }, status: "inProgress", formalMovement: 1, realMovement: 1, connection: 2, patterns: 1, flags: ["public-action"] }, { minConnection: 4, minDignity: 25 }),
          c("partial-settlement", { delta: { patience: 4, dignity: -15, time: 10 }, status: "decisionDrafted", formalMovement: 1, realMovement: 1, concessions: 1 }),
        ],
      },
      {
        id: "collective-step",
        choices: [
          c("joint-request", { delta: { patience: -6, dignity: 8, time: 60 }, counters: { writtenRequests: 1 }, status: "forwarded", formalMovement: 2, realMovement: 2, connection: 2, patterns: 1, caseProtected: true }, { minConnection: 5, minReceipts: 2 }),
          c("group-legal-help", { delta: { patience: 6, dignity: 10, time: 45 }, status: "inProgress", formalMovement: 1, realMovement: 2, connection: 2, patterns: 1, flags: ["legal-support"] }, { minConnection: 3, minDignity: 20 }),
          c("fast-partial-answer", { delta: { patience: 6, dignity: -20, time: 7 }, status: "decisionDrafted", formalMovement: 2, realMovement: 1, concessions: 2, acceptedWeakSolution: true, caseClosed: true }),
        ],
      },
      {
        id: "final-record",
        choices: [
          c("document-pattern", { delta: { patience: -5, dignity: 5, time: 120 }, status: "inProgress", formalMovement: 1, realMovement: 2, connection: 2, patterns: 1, flags: ["public-action"], caseProtected: true }, { minConnection: 5, minReceipts: 2, minPatterns: 2, anyFlags: ["legal-support", "public-action"] }),
          c("keep-case-active", { delta: { patience: -8, dignity: -3, time: 365 }, counters: { proceduralResponses: 1 }, status: "delivery", formalMovement: 2, realMovement: 2, caseProtected: true, caseAccepted: true }),
          c("close-weakly", { delta: { patience: 10, dignity: -25, time: 14 }, status: "decisionDrafted", formalMovement: 2, realMovement: 0, concessions: 2, acceptedWeakSolution: true, caseClosed: true }),
          c("no-capacity", { delta: { patience: -100, dignity: -2, time: 30 }, counters: { withdrawals: 1 }, status: "inProgress", formalMovement: 0, realMovement: 0, capacityToContinue: false }),
        ],
      },
    ],
  },
];

export const WAITING_ROOM_ENDING_THRESHOLDS = {
  evidence: { connection: 7, receipts: 2, patterns: 3, dignity: 35, patience: 1 },
  compromise: { concessions: 2, lowRealMovement: 1, dignityLoss: 55 },
  exhausted: { patience: 0, withdrawals: 3 },
  late: { time: 730, realMovement: 2 },
} as const;

export function getWaitingRoomEnding(summary: WaitingRoomOutcomeSummary): WaitingRoomEndingId {
  const hasSupport = summary.flags.includes("legal-support") || summary.flags.includes("public-action");
  const collective =
    summary.connection >= WAITING_ROOM_ENDING_THRESHOLDS.evidence.connection &&
    summary.receipts >= WAITING_ROOM_ENDING_THRESHOLDS.evidence.receipts &&
    summary.patterns >= WAITING_ROOM_ENDING_THRESHOLDS.evidence.patterns &&
    summary.meters.dignity >= WAITING_ROOM_ENDING_THRESHOLDS.evidence.dignity &&
    summary.meters.patience >= WAITING_ROOM_ENDING_THRESHOLDS.evidence.patience &&
    hasSupport;

  if (collective) return "evidence";

  const compromised =
    summary.acceptedWeakSolution ||
    summary.concessions >= WAITING_ROOM_ENDING_THRESHOLDS.compromise.concessions ||
    (summary.caseClosed &&
      summary.realMovement <= WAITING_ROOM_ENDING_THRESHOLDS.compromise.lowRealMovement &&
      100 - summary.meters.dignity >= WAITING_ROOM_ENDING_THRESHOLDS.compromise.dignityLoss &&
      summary.concessions > 0);

  if (compromised) return "compromise";

  const exhausted =
    summary.meters.patience <= WAITING_ROOM_ENDING_THRESHOLDS.exhausted.patience ||
    (summary.counters.withdrawals >= WAITING_ROOM_ENDING_THRESHOLDS.exhausted.withdrawals && !hasSupport) ||
    (!summary.capacityToContinue && !hasSupport);

  if (exhausted) return "exhausted";

  const arrivedTooLate =
    (summary.caseProtected || summary.caseAccepted) &&
    summary.realMovement >= WAITING_ROOM_ENDING_THRESHOLDS.late.realMovement &&
    summary.meters.time >= WAITING_ROOM_ENDING_THRESHOLDS.late.time;

  return arrivedTooLate ? "late" : "ongoing";
}

export const WAITING_ROOM_PEOPLE = ["31", "38", "42", "45", "53"] as const;

export function getWaitingRoomDepartureIds(
  meters: WaitingRoomMeters,
  counters: WaitingRoomCounters,
  alreadyLeft: string[]
) {
  const candidates: Array<{ id: (typeof WAITING_ROOM_PEOPLE)[number]; leaves: boolean }> = [
    { id: "31", leaves: meters.time >= 45 || counters.visits >= 3 },
    { id: "38", leaves: counters.missedWorkdays >= 3 },
    { id: "42", leaves: meters.time >= 365 },
    { id: "45", leaves: counters.supplements >= 3 || counters.redirects >= 3 },
    { id: "53", leaves: counters.failedVisits >= 3 || meters.time >= 730 },
  ];

  return candidates.filter((entry) => entry.leaves && !alreadyLeft.includes(entry.id)).map((entry) => entry.id);
}

const localeCopy: Record<Lang, WaitingRoomLocaleCopy> = {
  sr: {
    sectionLabel: "Interaktivno",
    collectionTitle: "Interaktivni formati",
    collectionIntro: "Uđi u sistem, teren i instituciju iznutra. Odluke postoje, ali posledice ne ostaju samo na ekranu.",
    gameTitle: "Čekaonica",
    gameSubtitle: "Nisu te odbili. Samo su te ostavili da čekaš.",
    typeLabel: "Institucionalna simulacija",
    durationLabel: "Trajanje",
    durationValue: "7–10 minuta",
    openLabel: "Otvori",
    startLabel: "Uzmi broj",
    continueLabel: "Nastavi da čekaš",
    backLabel: "Nazad na interaktivno",
    understandLabel: "Šta se upravo desilo?",
    restartLabel: "Počni ponovo",
    shareLabel: "Podeli simulaciju",
    shareCopiedLabel: "Link je kopiran.",
    shareUnavailableLabel: "Kopiranje linka trenutno nije dostupno.",
    decisionLabel: "Odluka",
    choicesLabel: "Šta ćeš uraditi?",
    metersLabel: "Lično stanje",
    patienceLabel: "Strpljenje",
    dignityLabel: "Dostojanstvo",
    timeLabel: "Prošlo vreme",
    formalLabel: "Formalno kretanje",
    realLabel: "Stvarni pomak",
    statusLabel: "Status predmeta",
    logLabel: "Trag postupka",
    connectionLabel: "Povezanost",
    receiptsLabel: "Sačuvane potvrde",
    patternsLabel: "Prepoznata ponavljanja",
    departuresLabel: "Ljudi koji više ne dolaze",
    queueYourNumberLabel: "Vaš broj",
    queueServingLabel: "Trenutno se obrađuje",
    queueWaitingLabel: "Molimo sačekajte",
    welcomeLines: ["Dobrodošli.", "Vaš slučaj je važan.", "Molimo sačekajte."],
    caseLabel: "Predmet",
    caseTypes: [
      "Prijava zbog ugroženog prava",
      "Zahtev za zaštitu",
      "Žalba na odluku",
      "Dokaz koji institucija još nije primila",
      "Zahtev za pristup usluzi",
      "Predmet koji je već jednom vraćen",
    ],
    monitorMessages: [
      "Molimo sačekajte.",
      "Vaš zahtev je u proceduri.",
      "Bićete obavešteni.",
      "Rok još nije istekao.",
      "Nadležna služba će vas kontaktirati.",
    ],
    statuses: {
      received: "Primljen",
      checking: "U proveri",
      supplement: "Potrebna dopuna",
      forwarded: "Prosleđen",
      missing: "Nije pronađen u sistemu",
      reentered: "Ponovo zaveden",
      deadlineOpen: "Rok nije istekao",
      deadlineExpired: "Rok je istekao",
      signature: "Čeka potpis",
      returned: "Vraćen na dopunu",
      inProgress: "U radu",
      decisionDrafted: "Odluka izrađena",
      delivery: "Dostava u toku",
    },
    requirementLabels: {
      patience: "Za ovu akciju više nemaš dovoljno snage.",
      dignity: "Ova mogućnost traži osećaj sigurnosti koji je postupak već potrošio.",
      receipts: "Najpre moraš da sačuvaš dokaz o predaji.",
      connection: "Još ne poznaješ dovoljno iskustava drugih ljudi.",
      patterns: "Obrazac još nije dovoljno dokumentovan.",
      support: "Potrebna je pravna, javna ili kolektivna podrška.",
    },
    people: {
      "31": { label: "Broj 31", departure: "Broj 31 više nije došao. Nije imao novca za još jednu autobusku kartu." },
      "38": { label: "Broj 38", departure: "Broj 38 je prestala da dolazi. Nije mogla ponovo da uzme slobodan dan." },
      "42": { label: "Broj 42", departure: "Broj 42 je dobio odluku. Stigla je nakon što mu više nije mogla pomoći." },
      "45": { label: "Broj 45", departure: "Broj 45 je odneo fasciklu kući. Nova dopuna bi značila još jedan mesec čekanja." },
      "53": { label: "Broj 53", departure: "Broj 53 se nije vratio. Tri puta je došao kada sistem nije radio." },
    },
    endings: {
      evidence: {
        eyebrow: "Obrazac je zabeležen",
        title: "Čekaonica je postala dokaz",
        copy: "Jedan predmet se lako izgubi. Iskustva, potvrde i ponovljeni odgovori sada pokazuju da problem nije pojedinačan.",
        note: "Postupak možda još nije završen. Ali čekanje više ne može lako da se predstavi kao slučajnost.",
      },
      compromise: {
        eyebrow: "Predmet je zatvoren",
        title: "Loš kompromis",
        copy: "Prihvatio si rešenje koje ne rešava ono zbog čega si došao.",
        note: "Procedura je završena brže. Pravo zbog kojeg je počela ostalo je samo delimično zaštićeno.",
      },
      exhausted: {
        eyebrow: "Predmet je ostao aktivan",
        title: "Iscrpljen",
        copy: "Nisi izgubio slučaj. Samo više nisi imao snage da budeš stranka u postupku.",
        note: "Formalno, vrata nisu zatvorena. U stvarnosti, više nemaš kapacitet da im ponovo priđeš.",
      },
      late: {
        eyebrow: "Odluka će biti doneta",
        title: "Prihvaćeno prekasno",
        copy: "Predmet je formalno sačuvan i konačno je ostvario stvarni pomak.",
        note: "Zaštita dolazi nakon vremena u kojem je bila najpotrebnija.",
      },
      ongoing: {
        eyebrow: "Nema konačne odluke",
        title: "Predmet je i dalje u toku",
        copy: "Formalno, postupak nije završen.",
        note: "U stvarnom životu, čekanje se nastavlja.",
      },
    },
    resultStats: {
      totalTime: "Ukupno vreme",
      visits: "Dolasci",
      calls: "Telefonski pozivi",
      supplements: "Dopune",
      redirects: "Preusmeravanja",
      retellings: "Ponovljena objašnjenja",
      proceduralResponses: "Proceduralni odgovori",
      concreteInformation: "Konkretne informacije",
      peopleLeft: "Ljudi koji su otišli",
      patience: "Završno strpljenje",
      dignity: "Završno dostojanstvo",
      formalMovement: "Formalne promene",
      realMovement: "Stvarni pomaci",
    },
    phases: [
      {
        label: "Faza 1 / Broj",
        title: "Broj",
        theme: "Red izgleda jasno. Još veruješ da procedura ima logiku.",
        scenario: "Ušao si, uzeo broj 47 i seo. Monitor pokazuje 12.",
        decisions: [
          {
            prompt: "Predmet još nema jasan trag u sistemu.",
            detail: "Šalter je otvoren, ali red se ne pomera.",
            choices: [
              { action: "Idi na šalter i objasni slučaj", response: "Saslušali su te i uneli napomenu. Status je promenjen, ali nisi dobio novu informaciju." },
              { action: "Pošalji pisani zahtev i sačuvaj potvrdu", response: "Zahtev je primljen. Prvi put imaš trag koji ne zavisi od sećanja službenika." },
              { action: "Razgovaraj sa ljudima koji već čekaju", response: "Čuo si isti uvod u tri različita predmeta. Red više ne izgleda sasvim pojedinačno." },
            ],
          },
          {
            prompt: "Pitaš gde se predmet nalazi.",
            detail: "Odgovor zavisi od kanala kojim pokušavaš da ga pronađeš.",
            choices: [
              { action: "Pozovi instituciju", response: "Automatska poruka potvrđuje da je zahtev u proceduri. Ne govori gde." },
              { action: "Ponovo dođi na šalter", response: "U evidenciji ne nalaze predmet pod podacima koje si već dao." },
              { action: "Sredi i sačuvaj dokaz o predaji", response: "Potvrda ne pomera red, ali sužava prostor za odgovor da dokument nikada nije stigao." },
            ],
          },
          {
            prompt: "Dobio si prvi formalni status.",
            detail: "Piše da rok još nije istekao. Ne piše šta se tokom roka radi.",
            choices: [
              { action: "Prihvati da sačekaš istek roka", response: "Prošao je mesec. Status zvuči uredno, a stvarni pomak ostaje isti." },
              { action: "Traži broj predmeta i tačno mesto u proceduri", response: "Predmet je ponovo zaveden i dobio si broj koji možeš da navedeš sledeći put." },
              { action: "Odustani za danas i sačuvaj snagu", response: "Otišao si pre novog razgovora. Predmet se nije pomerio, ali danas nisi morao ponovo sve da objašnjavaš." },
            ],
          },
          {
            prompt: "Predmet je prosleđen drugoj službi.",
            detail: "Prosleđivanje izgleda kao napredak, ali nadležnost još nije potvrđena.",
            choices: [
              { action: "Donesi iste dokumente u još jednom primerku", response: "Fascikla je deblja. Dopuna je primljena, ali razlog za duplikat nije objašnjen." },
              { action: "Traži pisanu potvrdu nadležnosti", response: "Dobio si ime službe i potvrdu da predmet mora biti razmotren." },
              { action: "Prihvati usmeno obećanje da će te pozvati", response: "Razgovor je kraći. Nema zapisa koji potvrđuje šta je obećano." },
            ],
          },
        ],
      },
      {
        label: "Faza 2 / Dopuna",
        title: "Dopuna",
        theme: "Isti podaci se traže ponovo. Svaki novi papir otvara prostor za sledeći.",
        scenario: "Monitor je pomerio jedan broj. Fascikla je već deblja nego kada si ušao.",
        decisions: [
          {
            prompt: "Fali vam još jedan dokument.",
            detail: "Nije bio na prvom spisku, ali bez njega predmet neće biti razmatran.",
            choices: [
              { action: "Prikupi dokument i dopuni predmet", response: "Dopuna je evidentirana. Predmet je formalno potpuniji, uz još jedan izgubljen radni dan." },
              { action: "Potraži pravnu pomoć pre nove dopune", response: "Neko je prvi put pročitao ceo sled. Više nisi sam, ali je prošlo još vremena." },
              { action: "Odustani za danas", response: "Sačuvao si malo snage. Spisak dokumenata ostao je isti." },
            ],
          },
          {
            prompt: "Ovo nije naša nadležnost.",
            detail: "Služba koja je primila predmet sada te upućuje organu koji ga je već vratio.",
            choices: [
              { action: "Idi kod drugog organa", response: "Ispričao si istu priču na novom mestu. Predmet je prosleđen, ne i razjašnjen." },
              { action: "Traži pisano utvrđivanje nadležnosti", response: "Dobio si konkretnu potvrdu ko mora da postupa i sačuvao njen trag." },
              { action: "Uporedi iskustva sa drugima u čekaonici", response: "Tri osobe imaju isti krug prosleđivanja. Pojedinačna greška počinje da liči na obrazac." },
            ],
          },
          {
            prompt: "Nemamo evidenciju da je dokument primljen.",
            detail: "Dokument koji si predao više nije vidljiv u njihovom sistemu.",
            choices: [
              { action: "Predaj isti dokument ponovo", response: "Dokument je ponovo zaveden. Ti si ponovo objasnio zašto postoji." },
              { action: "Pokaži sačuvanu potvrdu", response: "Potvrda je prihvaćena. Predmet je prvi put pomeren bez ponovnog podnošenja." },
              { action: "Povuci deo zahteva da bi ostalo prošlo", response: "Predmet je jednostavniji za obradu. Deo zaštite zbog koje si došao više nije u njemu." },
            ],
          },
          {
            prompt: "Sistem trenutno ne radi.",
            detail: "Šalter je otvoren. Evidencija nije.",
            choices: [
              { action: "Ostani do kraja radnog vremena", response: "Sistem se nije vratio. Izgubio si dan i još jednom objasnio razlog dolaska." },
              { action: "Pošalji dokument pisanim putem", response: "Dobio si novu potvrdu. Sistem i dalje ne radi, ali predaja više nije nevidljiva." },
              { action: "Otiđi pre novog čekanja", response: "Danas nisi izgubio ceo dan. Status predmeta ostao je nejasan." },
            ],
          },
        ],
      },
      {
        label: "Faza 3 / Rok",
        title: "Rok",
        theme: "Rokovi institucije i vreme čoveka više nisu ista stvar.",
        scenario: "Sat je napravio mnogo krugova. Monitor je pomerio samo nekoliko brojeva.",
        decisions: [
          {
            prompt: "Rok još nije istekao.",
            detail: "To je jedina informacija koju dobijaš o predmetu.",
            choices: [
              { action: "Sačekaj zakonski rok", response: "Prošla su tri meseca. Rok je postao sadržaj odgovora umesto granice postupanja." },
              { action: "Pošalji pisanu urgenciju", response: "Urgencija je evidentirana i dobio si konkretniji trag o tome ko drži predmet." },
              { action: "Pozovi još jednom", response: "Rečeno ti je da predmet čeka potpis. Nije navedeno čiji ni od kada." },
            ],
          },
          {
            prompt: "Rok je istekao.",
            detail: "Odluke još nema, a novi korak traži još jedan dokumentovan zahtev.",
            choices: [
              { action: "Podnesi preciznu žalbu uz potvrde", response: "Žalba je primljena. Prvi put postoji konkretna pravna mogućnost i trag da je rok probijen." },
              { action: "Ponovo podnesi osnovni zahtev", response: "Predmet je ponovo zaveden. Rok počinje da se računa iz novog datuma." },
              { action: "Prihvati usmeno uveravanje da je odluka blizu", response: "Nisi morao da sastavljaš novu žalbu. Nema dokaza da je odluka zaista bliže." },
            ],
          },
          {
            prompt: "Predmet čeka potpis.",
            detail: "Status se ne menja. Ne znaš da li odluka postoji.",
            choices: [
              { action: "Uključi pravnu pomoć", response: "Dobio si jasniji pregled mogućih koraka i nekoga ko može da ih prati sa tobom." },
              { action: "Nastavi da zoveš", response: "Dva poziva dala su isti proceduralni odgovor. Potpis je i dalje bez datuma." },
              { action: "Odustani za danas", response: "Sačuvao si deo snage. Potpis se nije pojavio." },
            ],
          },
          {
            prompt: "Kažu da je odluka izrađena.",
            detail: "Ne možeš da je vidiš dok dostava ne bude završena.",
            choices: [
              { action: "Traži kopiju odluke i dokaz dostave", response: "Dobio si konkretan dokument. Postupak se zaista pomerio, ali tek posle još tri meseca." },
              { action: "Zatvori predmet bez priznanja odgovornosti", response: "Dobićeš ograničeno rešenje odmah. Razlog zbog kojeg si došao ostaje bez odgovora." },
              { action: "Podeli iskustvo kašnjenja sa drugima", response: "Isti status čeka potpis u više fascikli. Kašnjenje više nije samo tvoj datum." },
            ],
          },
        ],
      },
      {
        label: "Faza 4 / Čekaonica",
        title: "Čekaonica",
        theme: "Više ne vidiš samo svoj predmet. Vidiš odgovor koji se ponavlja.",
        scenario: "Stolice su praznije. Ne zato što su svi dobili ono zbog čega su došli.",
        decisions: [
          {
            prompt: "Prepoznaješ iste rečenice u različitim predmetima.",
            detail: "Pitanje više nije samo gde je tvoja fascikla.",
            choices: [
              { action: "Uporedi pisane odgovore", response: "Datumi i formulacije pokazuju ponavljanje koje se može dokumentovati." },
              { action: "Drži se samo svog predmeta", response: "Predmet ostaje aktivan, ali iskustva drugih ostaju odvojena." },
              { action: "Odustani za danas", response: "Sačuvao si malo snage. Čekaonica je nastavila bez novog traga." },
            ],
          },
          {
            prompt: "Ljudi imaju potvrde koje pričaju istu priču.",
            detail: "Mogu ostati zasebni papiri ili postati sled.",
            choices: [
              { action: "Prikupi kopije potvrda uz saglasnost", response: "Sačuvali ste više tragova predaje bez izlaganja tuđih predmeta." },
              { action: "Postavi javno pitanje o obrascu čekanja", response: "Institucija mora da odgovori na obrazac, ne samo na jedan broj u redu." },
              { action: "Prihvati delimično rešenje svog predmeta", response: "Tvoj predmet se pomerio. Uzrok problema i iskustva drugih ostali su van rešenja." },
            ],
          },
          {
            prompt: "Čekaonica sada može da govori zajednički.",
            detail: "To ne garantuje odluku, ali menja ono što se više ne može lako poreći.",
            choices: [
              { action: "Pošaljite zajednički dokumentovan zahtev", response: "Više predmeta je povezano kroz datume, potvrde i iste odgovore." },
              { action: "Zatražite zajedničku pravnu podršku", response: "Ljudi više ne nose proceduru pojedinačno. Otvoren je konkretniji put za proveru." },
              { action: "Prihvati brzo delimično rešenje samo za sebe", response: "Tvoj predmet se zatvara. Zajednički obrazac ostaje bez tvog traga." },
            ],
          },
          {
            prompt: "Ostaje poslednja odluka o tome šta čuvaš.",
            detail: "Predmet može ostati aktivan, biti zatvoren ili postati deo šireg dokaza.",
            choices: [
              { action: "Dokumentuj obrazac uz podršku i zaštitu ljudi", response: "Čekaonica nije rešila sve predmete. Ali njihovo ponavljanje više nije nevidljivo." },
              { action: "Sačuvaj predmet aktivnim do dostave", response: "Predmet je ostao u postupku i konačno ostvario pomak. Vreme se meri godinama." },
              { action: "Zatvori predmet uz slabo rešenje", response: "Čekanje prestaje. Rešenje ne pokriva ono zbog čega je postupak počeo." },
              { action: "Odustani jer više nemaš kapacitet", response: "Predmet formalno ostaje otvoren. Ti više nemaš snage za još jedan krug." },
            ],
          },
        ],
      },
    ],
    contextEyebrow: "Iza procedure",
    contextTitle: "Šta se upravo desilo?",
    contextIntro: "Institucionalno iscrpljivanje ne izgleda uvek kao otvoreno odbijanje. Često se sastoji od ponavljanja, dopuna, rokova, preusmeravanja i čekanja koje čoveku troši vreme, novac, zdravlje i snagu. Formalno, predmet još postoji. U stvarnom životu, mogućnost zaštite može nestati mnogo pre nego što postupak bude završen.",
    contextCards: [
      { title: "Čekanje", copy: "Vreme nije neutralno. Za instituciju je to rok. Za čoveka je deo života koji se ne vraća." },
      { title: "Ponavljanje", copy: "Čovek iznova objašnjava istu stvar, donosi iste papire i dokazuje da problem još postoji." },
      { title: "Obrazac", copy: "Jedan predmet može izgledati kao pojedinačan problem. Kada se isti odgovor ponovi desetinama ljudi, čekaonica postaje dokaz sistema." },
    ],
    disclaimer: "Ova simulacija je fikcionalni interaktivni format zasnovan na obrascima institucionalnog čekanja. Ne predstavlja konkretan pravni slučaj niti pravni savet.",
    listingSeoDescription: "Interaktivni formati Avangarde o moći, terenu, institucijama i posledicama odluka.",
    seoDescription: "Interaktivna simulacija o čekanju, dostojanstvu, vremenu i institucionalnom iscrpljivanju.",
    timeUnits: { dayOne: "dan", dayMany: "dana", monthOne: "mesec", monthMany: "meseci", yearOne: "godina", yearMany: "godine" },
    screenReaderRoomLabel: "Čekaonica sa redom stolica, šalterom iza mutnog stakla, zidnim satom i ekranom za brojeve.",
    screenReaderClockLabel: "Zidni sat predstavlja proteklo životno vreme.",
    screenReaderQueueLabel: "Broj na redu napreduje mnogo sporije od sata.",
    screenReaderEmptySeatLabel: "Prazna stolica pripada osobi koja više ne dolazi.",
  },
  en: {
    sectionLabel: "Interactive",
    collectionTitle: "Interactive formats",
    collectionIntro: "Enter the system, the field and the institution from within. Choices exist, but their consequences do not remain on screen.",
    gameTitle: "The Waiting Room",
    gameSubtitle: "They did not reject you. They simply left you waiting.",
    typeLabel: "Institutional simulation",
    durationLabel: "Duration",
    durationValue: "7–10 minutes",
    openLabel: "Open",
    startLabel: "Take a number",
    continueLabel: "Keep waiting",
    backLabel: "Back to Interactive",
    understandLabel: "What just happened?",
    restartLabel: "Start again",
    shareLabel: "Share simulation",
    shareCopiedLabel: "Link copied.",
    shareUnavailableLabel: "The link could not be copied.",
    decisionLabel: "Decision",
    choicesLabel: "What will you do?",
    metersLabel: "Personal state",
    patienceLabel: "Patience",
    dignityLabel: "Dignity",
    timeLabel: "Time elapsed",
    formalLabel: "Formal movement",
    realLabel: "Real progress",
    statusLabel: "Case status",
    logLabel: "Procedural record",
    connectionLabel: "Connection",
    receiptsLabel: "Saved receipts",
    patternsLabel: "Repeated patterns",
    departuresLabel: "People who no longer return",
    queueYourNumberLabel: "Your number",
    queueServingLabel: "Now serving",
    queueWaitingLabel: "Please wait",
    welcomeLines: ["Welcome.", "Your case matters.", "Please wait."],
    caseLabel: "Case",
    caseTypes: [
      "Report concerning a threatened right",
      "Request for protection",
      "Appeal against a decision",
      "Evidence the institution has not yet received",
      "Request for access to a service",
      "A case already returned once",
    ],
    monitorMessages: ["Please wait.", "Your request is being processed.", "You will be notified.", "The deadline has not yet expired.", "The responsible unit will contact you."],
    statuses: {
      received: "Received", checking: "Under review", supplement: "Additional documents required", forwarded: "Forwarded", missing: "Not found in the system", reentered: "Registered again", deadlineOpen: "Deadline not expired", deadlineExpired: "Deadline expired", signature: "Awaiting signature", returned: "Returned for completion", inProgress: "In progress", decisionDrafted: "Decision prepared", delivery: "Delivery in progress",
    },
    requirementLabels: {
      patience: "You no longer have enough strength for this action.",
      dignity: "This option requires a sense of security the process has already worn down.",
      receipts: "You first need to preserve proof of submission.",
      connection: "You do not yet know enough about other people's experiences.",
      patterns: "The pattern has not yet been documented clearly enough.",
      support: "Legal, public or collective support is required.",
    },
    people: {
      "31": { label: "Number 31", departure: "Number 31 did not return. He could not afford another bus ticket." },
      "38": { label: "Number 38", departure: "Number 38 stopped coming. She could not take another day off work." },
      "42": { label: "Number 42", departure: "Number 42 received a decision. It arrived after it could still help him." },
      "45": { label: "Number 45", departure: "Number 45 took the folder home. Another supplement would have meant another month of waiting." },
      "53": { label: "Number 53", departure: "Number 53 did not return. Three visits ended with the system unavailable." },
    },
    endings: {
      evidence: { eyebrow: "The pattern is recorded", title: "The waiting room became evidence", copy: "One case is easy to lose. Shared experiences, receipts and repeated replies now show that the problem is not isolated.", note: "The procedure may still be unfinished. But the waiting can no longer be presented so easily as an accident." },
      compromise: { eyebrow: "The case is closed", title: "A bad compromise", copy: "You accepted an outcome that does not resolve why you came.", note: "The procedure ended sooner. The right that started it remains only partly protected." },
      exhausted: { eyebrow: "The case remains active", title: "Exhausted", copy: "You did not lose the case. You simply no longer had the strength to remain a party to the procedure.", note: "Formally, the door is still open. In practice, you no longer have the capacity to approach it again." },
      late: { eyebrow: "A decision will be issued", title: "Accepted too late", copy: "The case was formally preserved and finally made real progress.", note: "Protection arrives after the time when it was needed most." },
      ongoing: { eyebrow: "No final decision", title: "The case is still in progress", copy: "Formally, the procedure has not ended.", note: "In real life, the waiting continues." },
    },
    resultStats: {
      totalTime: "Total time", visits: "Visits", calls: "Phone calls", supplements: "Additional submissions", redirects: "Referrals", retellings: "Repeated explanations", proceduralResponses: "Procedural replies", concreteInformation: "Concrete information", peopleLeft: "People who left", patience: "Final patience", dignity: "Final dignity", formalMovement: "Formal changes", realMovement: "Real progress",
    },
    phases: [
      {
        label: "Phase 1 / Number", title: "Number", theme: "The queue looks clear. You still believe the procedure has a logic.", scenario: "You entered, took number 47 and sat down. The display shows 12.",
        decisions: [
          { prompt: "Your case has no clear trace in the system yet.", detail: "The counter is open, but the queue is not moving.", choices: [
            { action: "Go to the counter and explain the case", response: "They listened and added a note. The status changed, but you received no new information." },
            { action: "Send a written request and keep the receipt", response: "The request was received. For the first time, you have a trace that does not depend on an official's memory." },
            { action: "Talk to people who are already waiting", response: "You heard the same opening in three different cases. The queue no longer looks entirely individual." },
          ] },
          { prompt: "You ask where the case is.", detail: "The answer depends on the channel you use to find it.", choices: [
            { action: "Call the institution", response: "An automated message confirms that the request is being processed. It does not say where." },
            { action: "Return to the counter", response: "They cannot find the case under the details you already provided." },
            { action: "Organise and preserve proof of submission", response: "The receipt does not move the queue, but it narrows the room for saying the document never arrived." },
          ] },
          { prompt: "You received the first formal status.", detail: "It says the deadline has not expired. It does not say what is happening during that time.", choices: [
            { action: "Wait for the deadline to expire", response: "A month passed. The status sounds orderly while real progress remains unchanged." },
            { action: "Ask for the case number and exact procedural location", response: "The case was registered again, and you received a number you can cite next time." },
            { action: "Leave for today and preserve your strength", response: "You left before another conversation. The case did not move, but today you did not have to explain everything again." },
          ] },
          { prompt: "The case was forwarded to another unit.", detail: "Forwarding looks like progress, but responsibility has not been confirmed.", choices: [
            { action: "Bring the same documents in another copy", response: "The folder is thicker. The supplement was received, but no one explained why a duplicate was needed." },
            { action: "Request written confirmation of responsibility", response: "You received the unit's name and confirmation that the case must be considered." },
            { action: "Accept a verbal promise that they will call", response: "The conversation is shorter. There is no record of what was promised." },
          ] },
        ],
      },
      {
        label: "Phase 2 / Supplement", title: "Supplement", theme: "The same information is requested again. Every new paper creates space for the next one.", scenario: "The display moved by one number. The folder is already thicker than when you entered.",
        decisions: [
          { prompt: "One more document is missing.", detail: "It was not on the first list, but the case will not be considered without it.", choices: [
            { action: "Collect the document and complete the file", response: "The supplement was recorded. The case is formally more complete, at the cost of another missed workday." },
            { action: "Seek legal help before another submission", response: "Someone read the full sequence for the first time. You are no longer alone, but more time has passed." },
            { action: "Leave for today", response: "You preserved some strength. The list of documents remained unchanged." },
          ] },
          { prompt: "This is not our responsibility.", detail: "The office that received the case now sends you to the body that already returned it.", choices: [
            { action: "Go to the other body", response: "You told the same story in a new place. The case was forwarded, not clarified." },
            { action: "Request a written determination of responsibility", response: "You received concrete confirmation of who must act and preserved its trace." },
            { action: "Compare experiences with others in the waiting room", response: "Three people are caught in the same referral loop. An isolated error begins to look like a pattern." },
          ] },
          { prompt: "We have no record that the document was received.", detail: "A document you submitted is no longer visible in their system.", choices: [
            { action: "Submit the same document again", response: "The document was registered again. You explained again why it exists." },
            { action: "Show the saved receipt", response: "The receipt was accepted. For the first time, the case moved without a new submission." },
            { action: "Withdraw part of the request so the rest can proceed", response: "The case is easier to process. Part of the protection you came for is no longer in it." },
          ] },
          { prompt: "The system is currently unavailable.", detail: "The counter is open. The records are not.", choices: [
            { action: "Wait until the end of office hours", response: "The system did not return. You lost a day and explained the reason for your visit again." },
            { action: "Send the document in writing", response: "You received another receipt. The system is still unavailable, but the submission is no longer invisible." },
            { action: "Leave before another wait", response: "You did not lose the whole day. The case status remained unclear." },
          ] },
        ],
      },
      {
        label: "Phase 3 / Deadline", title: "Deadline", theme: "The institution's deadlines and a person's time are no longer the same thing.", scenario: "The clock has made many turns. The display moved only a few numbers.",
        decisions: [
          { prompt: "The deadline has not yet expired.", detail: "That is the only information you receive about the case.", choices: [
            { action: "Wait for the statutory deadline", response: "Three months passed. The deadline became the content of the reply instead of a limit on action." },
            { action: "Send a written request for urgent action", response: "The request was recorded, and you received a more concrete trace of who holds the case." },
            { action: "Call again", response: "You were told the case awaits a signature. No one said whose or since when." },
          ] },
          { prompt: "The deadline has expired.", detail: "There is still no decision, and the next step requires another documented request.", choices: [
            { action: "Submit a precise complaint with receipts", response: "The complaint was received. For the first time, there is a concrete legal option and proof that the deadline was missed." },
            { action: "Submit the original request again", response: "The case was registered again. The deadline starts from the new date." },
            { action: "Accept a verbal assurance that the decision is close", response: "You did not have to draft another complaint. There is no evidence that the decision is actually closer." },
          ] },
          { prompt: "The case is awaiting a signature.", detail: "The status does not change. You do not know whether a decision exists.", choices: [
            { action: "Bring in legal support", response: "You received a clearer map of possible steps and someone who can follow them with you." },
            { action: "Keep calling", response: "Two calls produced the same procedural reply. The signature still has no date." },
            { action: "Leave for today", response: "You preserved some strength. The signature did not appear." },
          ] },
          { prompt: "They say the decision has been prepared.", detail: "You cannot see it until delivery is complete.", choices: [
            { action: "Request a copy and proof of delivery", response: "You received a concrete document. The procedure truly moved, but only after another three months." },
            { action: "Close the case without an admission of responsibility", response: "You will receive a limited outcome immediately. The reason you came remains unanswered." },
            { action: "Share the delay with others", response: "The same status awaits a signature in several folders. The delay is no longer only your date." },
          ] },
        ],
      },
      {
        label: "Phase 4 / Waiting room", title: "Waiting room", theme: "You no longer see only your case. You see the reply that keeps repeating.", scenario: "More seats are empty. Not because everyone received what they came for.",
        decisions: [
          { prompt: "You recognise the same sentences in different cases.", detail: "The question is no longer only where your folder is.", choices: [
            { action: "Compare written replies", response: "Dates and wording reveal a repetition that can be documented." },
            { action: "Focus only on your own case", response: "The case remains active, but other experiences remain separate." },
            { action: "Leave for today", response: "You preserved some strength. The waiting room continued without a new trace." },
          ] },
          { prompt: "People hold receipts that tell the same story.", detail: "They can remain separate papers or become a sequence.", choices: [
            { action: "Collect copies of receipts with consent", response: "You preserved several submission traces without exposing anyone else's case." },
            { action: "Ask a public question about the pattern of delay", response: "The institution must answer a pattern, not only one number in the queue." },
            { action: "Accept a partial outcome in your own case", response: "Your case moved. The cause of the problem and the experiences of others remained outside the solution." },
          ] },
          { prompt: "The waiting room can now speak together.", detail: "That does not guarantee a decision, but it changes what can no longer be easily denied.", choices: [
            { action: "Send a joint documented request", response: "Several cases are connected through dates, receipts and identical replies." },
            { action: "Seek shared legal support", response: "People no longer carry the procedure alone. A more concrete route for scrutiny has opened." },
            { action: "Accept a quick partial answer only for yourself", response: "Your case closes. The shared pattern loses your trace." },
          ] },
          { prompt: "One final decision remains about what you preserve.", detail: "The case may stay active, close, or become part of wider evidence.", choices: [
            { action: "Document the pattern with support and protection", response: "The waiting room did not resolve every case. But their repetition is no longer invisible." },
            { action: "Keep the case active until delivery", response: "The case remained in the procedure and finally made progress. Time is measured in years." },
            { action: "Close the case with a weak outcome", response: "The waiting ends. The outcome does not cover why the procedure began." },
            { action: "Withdraw because you have no capacity left", response: "The case formally remains open. You no longer have strength for another round." },
          ] },
        ],
      },
    ],
    contextEyebrow: "Behind the procedure",
    contextTitle: "What just happened?",
    contextIntro: "Institutional exhaustion does not always look like an open refusal. It is often made of repetition, additional documents, deadlines, referrals and waiting that consumes a person's time, money, health and strength. Formally, the case still exists. In real life, the possibility of protection may disappear long before the procedure ends.",
    contextCards: [
      { title: "Waiting", copy: "Time is not neutral. For an institution it is a deadline. For a person it is a part of life that does not return." },
      { title: "Repetition", copy: "A person explains the same thing again, brings the same papers and proves that the problem still exists." },
      { title: "Pattern", copy: "One case can look like an isolated problem. When the same reply reaches dozens of people, the waiting room becomes evidence of a system." },
    ],
    disclaimer: "This simulation is a fictional interactive format based on patterns of institutional delay. It does not represent a specific legal case or legal advice.",
    listingSeoDescription: "Avangarda interactive formats about power, the field, institutions and the consequences of decisions.",
    seoDescription: "An interactive simulation about waiting, dignity, time and institutional exhaustion.",
    timeUnits: { dayOne: "day", dayMany: "days", monthOne: "month", monthMany: "months", yearOne: "year", yearMany: "years" },
    screenReaderRoomLabel: "A waiting room with rows of chairs, a counter behind frosted glass, a wall clock and a queue display.",
    screenReaderClockLabel: "The wall clock represents elapsed life time.",
    screenReaderQueueLabel: "The queue number advances much more slowly than the clock.",
    screenReaderEmptySeatLabel: "An empty seat belongs to a person who no longer returns.",
  },
  tr: {
    sectionLabel: "Etkileşimli",
    collectionTitle: "Etkileşimli formatlar",
    collectionIntro: "Sisteme, sahaya ve kuruma içeriden gir. Seçenekler vardır; sonuçları ekranda kalmaz.",
    gameTitle: "Bekleme Salonu",
    gameSubtitle: "Seni reddetmediler. Sadece beklemeye bıraktılar.",
    typeLabel: "Kurumsal simülasyon",
    durationLabel: "Süre",
    durationValue: "7–10 dakika",
    openLabel: "Aç",
    startLabel: "Sıra numarası al",
    continueLabel: "Beklemeye devam et",
    backLabel: "Etkileşimli formatlara dön",
    understandLabel: "Az önce ne oldu?",
    restartLabel: "Yeniden başla",
    shareLabel: "Simülasyonu paylaş",
    shareCopiedLabel: "Bağlantı kopyalandı.",
    shareUnavailableLabel: "Bağlantı kopyalanamadı.",
    decisionLabel: "Karar",
    choicesLabel: "Ne yapacaksın?",
    metersLabel: "Kişisel durum",
    patienceLabel: "Sabır",
    dignityLabel: "Onur",
    timeLabel: "Geçen süre",
    formalLabel: "Resmî hareket",
    realLabel: "Gerçek ilerleme",
    statusLabel: "Dosya durumu",
    logLabel: "İşlem kaydı",
    connectionLabel: "Bağlantı",
    receiptsLabel: "Saklanan teslim belgeleri",
    patternsLabel: "Belirlenen tekrarlar",
    departuresLabel: "Artık gelmeyenler",
    queueYourNumberLabel: "Numaranız",
    queueServingLabel: "Şu anda işlem gören",
    queueWaitingLabel: "Lütfen bekleyin",
    welcomeLines: ["Hoş geldiniz.", "Dosyanız önemlidir.", "Lütfen bekleyin."],
    caseLabel: "Dosya",
    caseTypes: ["İhlal riski altındaki bir hakla ilgili başvuru", "Koruma talebi", "Bir karara itiraz", "Kurumun henüz almadığı bir kanıt", "Bir hizmete erişim talebi", "Daha önce bir kez iade edilmiş dosya"],
    monitorMessages: ["Lütfen bekleyin.", "Talebiniz işlem sürecindedir.", "Size bilgi verilecektir.", "Süre henüz dolmadı.", "Yetkili birim sizinle iletişime geçecektir."],
    statuses: { received: "Alındı", checking: "İnceleniyor", supplement: "Ek belge gerekli", forwarded: "Sevk edildi", missing: "Sistemde bulunamadı", reentered: "Yeniden kaydedildi", deadlineOpen: "Süre dolmadı", deadlineExpired: "Süre doldu", signature: "İmza bekliyor", returned: "Tamamlama için iade edildi", inProgress: "İşlemde", decisionDrafted: "Karar hazırlandı", delivery: "Tebligat sürüyor" },
    requirementLabels: {
      patience: "Bu işlem için yeterli gücün kalmadı.",
      dignity: "Bu seçenek, sürecin aşındırdığı bir güven duygusu gerektiriyor.",
      receipts: "Önce teslim kanıtını saklamalısın.",
      connection: "Diğer insanların deneyimlerini henüz yeterince bilmiyorsun.",
      patterns: "Örüntü henüz yeterince belgelenmedi.",
      support: "Hukuki, kamusal ya da kolektif destek gerekli.",
    },
    people: {
      "31": { label: "31 numara", departure: "31 numara bir daha gelmedi. Bir otobüs biletine daha parası yetmedi." },
      "38": { label: "38 numara", departure: "38 numara gelmeyi bıraktı. İşten bir gün daha izin alamadı." },
      "42": { label: "42 numara", departure: "42 numara kararı aldı. Karar, artık ona yardım edemeyecek kadar geç geldi." },
      "45": { label: "45 numara", departure: "45 numara dosyasını eve götürdü. Bir ek belge daha, bir ay daha beklemek demekti." },
      "53": { label: "53 numara", departure: "53 numara geri dönmedi. Üç gelişinde de sistem çalışmıyordu." },
    },
    endings: {
      evidence: { eyebrow: "Örüntü kayda geçti", title: "Bekleme salonu kanıta dönüştü", copy: "Tek bir dosya kolayca kaybolur. Ortak deneyimler, teslim belgeleri ve tekrarlanan yanıtlar sorunun tekil olmadığını gösteriyor.", note: "Süreç hâlâ bitmemiş olabilir. Ama bekleme artık kolayca tesadüf gibi gösterilemez." },
      compromise: { eyebrow: "Dosya kapandı", title: "Kötü uzlaşma", copy: "Buraya gelme nedenini çözmeyen bir sonucu kabul ettin.", note: "İşlem daha erken bitti. Onu başlatan hak yalnızca kısmen korunmuş kaldı." },
      exhausted: { eyebrow: "Dosya açık kaldı", title: "Tükendin", copy: "Dosyayı kaybetmedin. Sadece sürecin tarafı olmaya devam edecek gücün kalmadı.", note: "Resmen kapı açık. Gerçekte ona yeniden yaklaşacak kapasiten kalmadı." },
      late: { eyebrow: "Karar verilecek", title: "Çok geç kabul edildi", copy: "Dosya resmen korundu ve sonunda gerçek bir ilerleme sağladı.", note: "Koruma, en çok gerekli olduğu zaman geçtikten sonra geliyor." },
      ongoing: { eyebrow: "Nihai karar yok", title: "Dosya hâlâ işlemde", copy: "Resmen süreç bitmedi.", note: "Gerçek hayatta bekleyiş sürüyor." },
    },
    resultStats: { totalTime: "Toplam süre", visits: "Gelişler", calls: "Telefon aramaları", supplements: "Ek başvurular", redirects: "Yönlendirmeler", retellings: "Tekrarlanan anlatımlar", proceduralResponses: "Usule ilişkin yanıtlar", concreteInformation: "Somut bilgiler", peopleLeft: "Ayrılan kişiler", patience: "Son sabır", dignity: "Son onur", formalMovement: "Resmî değişiklikler", realMovement: "Gerçek ilerleme" },
    phases: [
      {
        label: "Aşama 1 / Numara", title: "Numara", theme: "Sıra açık görünüyor. Sürecin hâlâ bir mantığı olduğuna inanıyorsun.", scenario: "İçeri girdin, 47 numarayı aldın ve oturdun. Ekranda 12 yazıyor.",
        decisions: [
          { prompt: "Dosyanın sistemde henüz açık bir izi yok.", detail: "Gişe açık, ama sıra ilerlemiyor.", choices: [
            { action: "Gişeye git ve durumu anlat", response: "Seni dinleyip bir not girdiler. Durum değişti, fakat yeni bilgi vermediler." },
            { action: "Yazılı talep gönder ve alındıyı sakla", response: "Talep alındı. İlk kez bir memurun hafızasına bağlı olmayan bir izin var." },
            { action: "Bekleyen insanlarla konuş", response: "Üç ayrı dosyada aynı başlangıcı duydun. Sıra artık tamamen kişisel görünmüyor." },
          ] },
          { prompt: "Dosyanın nerede olduğunu soruyorsun.", detail: "Yanıt, onu hangi kanaldan aradığına göre değişiyor.", choices: [
            { action: "Kurumu ara", response: "Otomatik mesaj talebin işlemde olduğunu söylüyor. Nerede olduğunu söylemiyor." },
            { action: "Gişeye yeniden git", response: "Daha önce verdiğin bilgilerle dosyayı bulamıyorlar." },
            { action: "Teslim kanıtını düzenle ve sakla", response: "Belge sırayı ilerletmiyor, ama evrakın hiç gelmediği yanıtına daha az alan bırakıyor." },
          ] },
          { prompt: "İlk resmî durumu aldın.", detail: "Sürenin dolmadığı yazıyor. Bu sürede ne yapıldığı yazmıyor.", choices: [
            { action: "Sürenin dolmasını bekle", response: "Bir ay geçti. Durum düzenli görünüyor, gerçek ilerleme ise aynı." },
            { action: "Dosya numarasını ve işlemdeki yerini iste", response: "Dosya yeniden kaydedildi ve bir dahaki sefere kullanabileceğin bir numara aldın." },
            { action: "Bugünlük ayrıl ve gücünü koru", response: "Yeni bir konuşmadan önce çıktın. Dosya ilerlemedi, ama bugün her şeyi yeniden anlatmadın." },
          ] },
          { prompt: "Dosya başka bir birime sevk edildi.", detail: "Sevk ilerleme gibi görünüyor, fakat yetki doğrulanmadı.", choices: [
            { action: "Aynı belgeleri bir nüsha daha getir", response: "Dosya kalınlaştı. Ek belge alındı, ama neden ikinci nüsha gerektiği açıklanmadı." },
            { action: "Yetkinin yazılı olarak doğrulanmasını iste", response: "Birimin adını ve dosyayı incelemek zorunda olduğuna dair teyidi aldın." },
            { action: "Seni arayacaklarına dair sözlü sözü kabul et", response: "Görüşme kısa sürdü. Verilen sözü gösteren bir kayıt yok." },
          ] },
        ],
      },
      {
        label: "Aşama 2 / Ek belge", title: "Ek belge", theme: "Aynı bilgiler yeniden isteniyor. Her yeni kâğıt bir sonrakine yer açıyor.", scenario: "Ekran yalnızca bir numara ilerledi. Dosya içeri girdiğinden daha kalın.",
        decisions: [
          { prompt: "Bir belge daha eksik.", detail: "İlk listede yoktu, ama onsuz dosya incelenmeyecek.", choices: [
            { action: "Belgeyi topla ve dosyayı tamamla", response: "Ek belge kayda geçti. Bir iş günü daha kaybettin, dosya resmen daha tamam." },
            { action: "Yeni teslimden önce hukuki yardım ara", response: "Biri ilk kez bütün sıralamayı okudu. Artık yalnız değilsin, fakat zaman geçti." },
            { action: "Bugünlük ayrıl", response: "Biraz güç sakladın. Belge listesi değişmedi." },
          ] },
          { prompt: "Bu bizim yetkimizde değil.", detail: "Dosyayı alan birim seni, onu daha önce iade eden kuruma gönderiyor.", choices: [
            { action: "Diğer kuruma git", response: "Aynı hikâyeyi yeni bir yerde anlattın. Dosya sevk edildi, açıklığa kavuşmadı." },
            { action: "Yetkinin yazılı olarak belirlenmesini iste", response: "Kimin işlem yapması gerektiğine dair somut teyit aldın ve kaydını sakladın." },
            { action: "Bekleme salonundakilerle deneyimleri karşılaştır", response: "Üç kişi aynı yönlendirme döngüsünde. Tekil hata bir örüntüye benzemeye başlıyor." },
          ] },
          { prompt: "Belgenin alındığına dair kaydımız yok.", detail: "Teslim ettiğin belge artık sistemde görünmüyor.", choices: [
            { action: "Aynı belgeyi yeniden teslim et", response: "Belge yeniden kaydedildi. Neden var olduğunu yeniden anlattın." },
            { action: "Sakladığın alındıyı göster", response: "Alındı kabul edildi. Dosya ilk kez yeni teslim olmadan ilerledi." },
            { action: "Kalan kısım ilerlesin diye talebin bir bölümünü çek", response: "Dosyanın işlenmesi kolaylaştı. Aradığın korumanın bir bölümü artık içinde değil." },
          ] },
          { prompt: "Sistem şu anda çalışmıyor.", detail: "Gişe açık. Kayıtlar kapalı.", choices: [
            { action: "Mesai bitimine kadar bekle", response: "Sistem açılmadı. Bir gün kaybettin ve geliş nedenini yeniden anlattın." },
            { action: "Belgeyi yazılı yolla gönder", response: "Yeni bir alındı aldın. Sistem hâlâ kapalı, fakat teslim artık görünmez değil." },
            { action: "Yeni bir bekleyiş başlamadan ayrıl", response: "Bütün günü kaybetmedin. Dosyanın durumu belirsiz kaldı." },
          ] },
        ],
      },
      {
        label: "Aşama 3 / Süre", title: "Süre", theme: "Kurumun süreleriyle insanın zamanı artık aynı şey değil.", scenario: "Saat birçok tur attı. Ekran yalnızca birkaç numara ilerledi.",
        decisions: [
          { prompt: "Süre henüz dolmadı.", detail: "Dosyayla ilgili aldığın tek bilgi bu.", choices: [
            { action: "Yasal süreyi bekle", response: "Üç ay geçti. Süre, işlem sınırı olmak yerine yanıtın kendisine dönüştü." },
            { action: "Yazılı hızlandırma talebi gönder", response: "Talep kayda geçti ve dosyayı kimin tuttuğuna dair daha somut bir iz aldın." },
            { action: "Tekrar ara", response: "Dosyanın imza beklediği söylendi. Kimin imzası ve ne zamandan beri olduğu söylenmedi." },
          ] },
          { prompt: "Süre doldu.", detail: "Karar hâlâ yok ve sonraki adım yeni bir belgeli başvuru istiyor.", choices: [
            { action: "Alındılarla birlikte açık bir itiraz gönder", response: "İtiraz alındı. İlk kez somut bir hukuki yol ve sürenin aşıldığına dair kanıt var." },
            { action: "İlk talebi yeniden sun", response: "Dosya yeniden kaydedildi. Süre yeni tarihten işlemeye başlıyor." },
            { action: "Kararın yakın olduğuna dair sözlü güvenceyi kabul et", response: "Yeni itiraz hazırlamadın. Kararın gerçekten yaklaştığına dair kanıt yok." },
          ] },
          { prompt: "Dosya imza bekliyor.", detail: "Durum değişmiyor. Bir kararın var olup olmadığını bilmiyorsun.", choices: [
            { action: "Hukuki destek al", response: "Olası adımları daha açık gördün ve onları seninle izleyebilecek biri var." },
            { action: "Aramaya devam et", response: "İki arama aynı usul yanıtını verdi. İmzanın hâlâ tarihi yok." },
            { action: "Bugünlük ayrıl", response: "Biraz güç sakladın. İmza gelmedi." },
          ] },
          { prompt: "Kararın hazırlandığını söylüyorlar.", detail: "Tebligat bitene kadar kararı göremiyorsun.", choices: [
            { action: "Kararın kopyasını ve tebligat kanıtını iste", response: "Somut bir belge aldın. Süreç gerçekten ilerledi, ama üç ay daha sonra." },
            { action: "Sorumluluk kabul edilmeden dosyayı kapat", response: "Sınırlı bir sonuç hemen verilecek. Buraya gelme nedenin yanıtsız kalıyor." },
            { action: "Gecikme deneyimini başkalarıyla paylaş", response: "Aynı durum birkaç dosyada imza bekliyor. Gecikme artık yalnızca senin tarihin değil." },
          ] },
        ],
      },
      {
        label: "Aşama 4 / Bekleme salonu", title: "Bekleme salonu", theme: "Artık yalnızca kendi dosyanı değil, tekrarlanan yanıtı görüyorsun.", scenario: "Daha çok koltuk boş. Herkes istediğini aldığı için değil.",
        decisions: [
          { prompt: "Farklı dosyalarda aynı cümleleri tanıyorsun.", detail: "Soru artık yalnızca senin dosyanın nerede olduğu değil.", choices: [
            { action: "Yazılı yanıtları karşılaştır", response: "Tarihler ve ifadeler belgelenebilen bir tekrarı gösteriyor." },
            { action: "Yalnızca kendi dosyana odaklan", response: "Dosya açık kalıyor, diğer deneyimler birbirinden ayrı kalıyor." },
            { action: "Bugünlük ayrıl", response: "Biraz güç sakladın. Bekleme salonu yeni bir iz bırakmadan devam etti." },
          ] },
          { prompt: "İnsanların elindeki alındılar aynı hikâyeyi anlatıyor.", detail: "Ayrı kâğıtlar olarak kalabilir ya da bir sıraya dönüşebilirler.", choices: [
            { action: "İzinle alındı kopyalarını topla", response: "Kimsenin dosyasını açığa çıkarmadan birkaç teslim izini korudunuz." },
            { action: "Bekleme örüntüsü hakkında kamuya açık soru sor", response: "Kurum artık yalnızca sıradaki bir numaraya değil, örüntüye yanıt vermek zorunda." },
            { action: "Kendi dosyan için kısmi çözümü kabul et", response: "Dosyan ilerledi. Sorunun nedeni ve başkalarının deneyimleri çözümün dışında kaldı." },
          ] },
          { prompt: "Bekleme salonu artık birlikte konuşabilir.", detail: "Bu karar garantisi değildir, ama kolayca inkâr edilebilecek şeyi değiştirir.", choices: [
            { action: "Ortak ve belgeli bir talep gönderin", response: "Birkaç dosya tarihler, alındılar ve aynı yanıtlar üzerinden bağlandı." },
            { action: "Ortak hukuki destek isteyin", response: "İnsanlar süreci artık tek başına taşımıyor. İnceleme için daha somut bir yol açıldı." },
            { action: "Yalnızca kendin için hızlı kısmi yanıtı kabul et", response: "Dosyan kapanıyor. Ortak örüntü senin izini kaybediyor." },
          ] },
          { prompt: "Neyi koruyacağına dair son karar kaldı.", detail: "Dosya açık kalabilir, kapanabilir ya da daha geniş bir kanıtın parçası olabilir.", choices: [
            { action: "Örüntüyü destekle ve insanları koruyarak belgele", response: "Bekleme salonu her dosyayı çözmedi. Ama tekrar artık görünmez değil." },
            { action: "Tebligata kadar dosyayı açık tut", response: "Dosya süreçte kaldı ve sonunda ilerledi. Zaman artık yıllarla ölçülüyor." },
            { action: "Dosyayı zayıf bir sonuçla kapat", response: "Bekleyiş bitiyor. Sonuç, sürecin neden başladığını kapsamıyor." },
            { action: "Devam edecek kapasiten kalmadığı için çekil", response: "Dosya resmen açık kalıyor. Bir tur daha için gücün kalmadı." },
          ] },
        ],
      },
    ],
    contextEyebrow: "Sürecin ardı",
    contextTitle: "Az önce ne oldu?",
    contextIntro: "Kurumsal yıpratma her zaman açık bir ret gibi görünmez. Çoğu zaman insanın zamanını, parasını, sağlığını ve gücünü tüketen tekrarlar, ek belgeler, süreler, yönlendirmeler ve bekleyişten oluşur. Resmen dosya hâlâ vardır. Gerçek hayatta koruma imkânı, süreç bitmeden çok önce kaybolabilir.",
    contextCards: [
      { title: "Bekleyiş", copy: "Zaman tarafsız değildir. Kurum için bir süredir. İnsan için geri gelmeyen bir yaşam parçasıdır." },
      { title: "Tekrar", copy: "İnsan aynı şeyi yeniden anlatır, aynı kâğıtları getirir ve sorunun hâlâ sürdüğünü kanıtlar." },
      { title: "Örüntü", copy: "Tek bir dosya kişisel bir sorun gibi görünebilir. Aynı yanıt onlarca kişiye verildiğinde bekleme salonu sistemin kanıtına dönüşür." },
    ],
    disclaimer: "Bu simülasyon, kurumsal bekleme örüntülerine dayanan kurgusal bir etkileşimli formattır. Belirli bir hukuki olayı veya hukuki tavsiyeyi temsil etmez.",
    listingSeoDescription: "Güç, saha, kurumlar ve kararların sonuçları üzerine Avangarda etkileşimli formatları.",
    seoDescription: "Bekleyiş, onur, zaman ve kurumsal yıpranma üzerine etkileşimli bir simülasyon.",
    timeUnits: { dayOne: "gün", dayMany: "gün", monthOne: "ay", monthMany: "ay", yearOne: "yıl", yearMany: "yıl" },
    screenReaderRoomLabel: "Sıra sıra koltuklar, buzlu cam arkasında bir gişe, duvar saati ve sıra ekranı bulunan bekleme salonu.",
    screenReaderClockLabel: "Duvar saati geçen yaşam zamanını temsil eder.",
    screenReaderQueueLabel: "Sıra numarası saatten çok daha yavaş ilerler.",
    screenReaderEmptySeatLabel: "Boş koltuk artık geri gelmeyen bir kişiye aittir.",
  },
  fr: {
    sectionLabel: "Interactif",
    collectionTitle: "Formats interactifs",
    collectionIntro: "Entrez dans le système, le terrain et l’institution. Les choix existent, mais leurs conséquences ne restent pas à l’écran.",
    gameTitle: "La salle d’attente",
    gameSubtitle: "On ne vous a pas refusé. On vous a simplement laissé attendre.",
    typeLabel: "Simulation institutionnelle",
    durationLabel: "Durée",
    durationValue: "7–10 minutes",
    openLabel: "Ouvrir",
    startLabel: "Prendre un numéro",
    continueLabel: "Continuer d’attendre",
    backLabel: "Retour aux formats interactifs",
    understandLabel: "Que vient-il de se passer ?",
    restartLabel: "Recommencer",
    shareLabel: "Partager la simulation",
    shareCopiedLabel: "Lien copié.",
    shareUnavailableLabel: "Impossible de copier le lien.",
    decisionLabel: "Décision",
    choicesLabel: "Que faites-vous ?",
    metersLabel: "État personnel",
    patienceLabel: "Patience",
    dignityLabel: "Dignité",
    timeLabel: "Temps écoulé",
    formalLabel: "Mouvement formel",
    realLabel: "Progrès réel",
    statusLabel: "Statut du dossier",
    logLabel: "Trace de la procédure",
    connectionLabel: "Lien collectif",
    receiptsLabel: "Preuves de dépôt conservées",
    patternsLabel: "Répétitions identifiées",
    departuresLabel: "Personnes qui ne reviennent plus",
    queueYourNumberLabel: "Votre numéro",
    queueServingLabel: "Numéro appelé",
    queueWaitingLabel: "Veuillez patienter",
    welcomeLines: ["Bienvenue.", "Votre dossier est important.", "Veuillez patienter."],
    caseLabel: "Dossier",
    caseTypes: ["Signalement d’un droit menacé", "Demande de protection", "Recours contre une décision", "Preuve non encore reçue par l’institution", "Demande d’accès à un service", "Dossier déjà renvoyé une fois"],
    monitorMessages: ["Veuillez patienter.", "Votre demande est en cours de traitement.", "Vous serez informé.", "Le délai n’est pas encore expiré.", "Le service compétent vous contactera."],
    statuses: { received: "Reçu", checking: "En vérification", supplement: "Pièce complémentaire requise", forwarded: "Transmis", missing: "Introuvable dans le système", reentered: "Enregistré de nouveau", deadlineOpen: "Délai non expiré", deadlineExpired: "Délai expiré", signature: "En attente de signature", returned: "Renvoyé pour complément", inProgress: "En cours", decisionDrafted: "Décision rédigée", delivery: "Notification en cours" },
    requirementLabels: {
      patience: "Vous n’avez plus assez de force pour cette démarche.",
      dignity: "Cette option exige une sécurité que la procédure a déjà entamée.",
      receipts: "Vous devez d’abord conserver une preuve de dépôt.",
      connection: "Vous ne connaissez pas encore assez les expériences des autres.",
      patterns: "Le schéma n’est pas encore suffisamment documenté.",
      support: "Un soutien juridique, public ou collectif est nécessaire.",
    },
    people: {
      "31": { label: "Numéro 31", departure: "Le numéro 31 n’est pas revenu. Il ne pouvait pas payer un nouveau trajet en bus." },
      "38": { label: "Numéro 38", departure: "Le numéro 38 a cessé de venir. Elle ne pouvait pas reprendre un jour de congé." },
      "42": { label: "Numéro 42", departure: "Le numéro 42 a reçu une décision. Elle est arrivée trop tard pour pouvoir encore l’aider." },
      "45": { label: "Numéro 45", departure: "Le numéro 45 a rapporté son dossier chez lui. Une pièce de plus aurait signifié un mois d’attente supplémentaire." },
      "53": { label: "Numéro 53", departure: "Le numéro 53 n’est pas revenu. Lors de trois visites, le système était indisponible." },
    },
    endings: {
      evidence: { eyebrow: "Le schéma est documenté", title: "La salle d’attente est devenue une preuve", copy: "Un dossier isolé se perd facilement. Les expériences, reçus et réponses répétées montrent désormais que le problème n’est pas individuel.", note: "La procédure n’est peut-être pas terminée. Mais l’attente ne peut plus être présentée si facilement comme un accident." },
      compromise: { eyebrow: "Le dossier est clos", title: "Un mauvais compromis", copy: "Vous avez accepté une issue qui ne résout pas la raison de votre venue.", note: "La procédure s’est terminée plus vite. Le droit qui l’avait déclenchée n’est que partiellement protégé." },
      exhausted: { eyebrow: "Le dossier reste actif", title: "Épuisé", copy: "Vous n’avez pas perdu votre dossier. Vous n’aviez simplement plus la force de rester partie à la procédure.", note: "Formellement, la porte reste ouverte. En pratique, vous ne pouvez plus vous en approcher." },
      late: { eyebrow: "Une décision sera rendue", title: "Accepté trop tard", copy: "Le dossier a été formellement préservé et a enfin progressé réellement.", note: "La protection arrive après le moment où elle était la plus nécessaire." },
      ongoing: { eyebrow: "Aucune décision finale", title: "Le dossier est toujours en cours", copy: "Formellement, la procédure n’est pas terminée.", note: "Dans la vie réelle, l’attente continue." },
    },
    resultStats: { totalTime: "Temps total", visits: "Déplacements", calls: "Appels", supplements: "Pièces complémentaires", redirects: "Renvois", retellings: "Récits répétés", proceduralResponses: "Réponses procédurales", concreteInformation: "Informations concrètes", peopleLeft: "Personnes parties", patience: "Patience finale", dignity: "Dignité finale", formalMovement: "Changements formels", realMovement: "Progrès réels" },
    phases: [
      {
        label: "Phase 1 / Numéro", title: "Numéro", theme: "La file paraît claire. Vous croyez encore que la procédure suit une logique.", scenario: "Vous êtes entré, avez pris le numéro 47 et vous êtes assis. L’écran affiche 12.",
        decisions: [
          { prompt: "Votre dossier n’a pas encore de trace claire dans le système.", detail: "Le guichet est ouvert, mais la file n’avance pas.", choices: [
            { action: "Aller au guichet et expliquer le dossier", response: "On vous a écouté et ajouté une note. Le statut a changé, sans information nouvelle." },
            { action: "Envoyer une demande écrite et garder le reçu", response: "La demande est reçue. Pour la première fois, vous avez une trace qui ne dépend pas de la mémoire d’un agent." },
            { action: "Parler aux personnes qui attendent déjà", response: "Vous avez entendu la même introduction dans trois dossiers différents. La file ne semble plus tout à fait individuelle." },
          ] },
          { prompt: "Vous demandez où se trouve le dossier.", detail: "La réponse dépend du canal par lequel vous le cherchez.", choices: [
            { action: "Appeler l’institution", response: "Un message automatique confirme que la demande est en cours. Il ne dit pas où." },
            { action: "Revenir au guichet", response: "Le dossier reste introuvable avec les informations déjà fournies." },
            { action: "Classer et conserver la preuve de dépôt", response: "Le reçu ne fait pas avancer la file, mais réduit la possibilité de nier la réception." },
          ] },
          { prompt: "Vous recevez le premier statut formel.", detail: "Il indique que le délai n’est pas expiré, sans expliquer ce qui se passe pendant ce délai.", choices: [
            { action: "Attendre l’expiration du délai", response: "Un mois passe. Le statut paraît ordonné, le progrès réel reste nul." },
            { action: "Demander le numéro et l’emplacement exact du dossier", response: "Le dossier est réenregistré et vous obtenez un numéro à citer la prochaine fois." },
            { action: "Partir pour aujourd’hui et préserver vos forces", response: "Vous partez avant un nouveau récit. Le dossier ne bouge pas, mais vous n’avez pas tout répété." },
          ] },
          { prompt: "Le dossier est transmis à un autre service.", detail: "La transmission ressemble à un progrès, mais la compétence n’est pas confirmée.", choices: [
            { action: "Apporter une nouvelle copie des mêmes documents", response: "Le dossier s’épaissit. Le complément est reçu, sans explication sur le doublon." },
            { action: "Exiger une confirmation écrite de la compétence", response: "Vous obtenez le nom du service et la confirmation qu’il doit examiner le dossier." },
            { action: "Accepter la promesse orale d’un rappel", response: "L’échange est plus court. Rien ne prouve ce qui a été promis." },
          ] },
        ],
      },
      {
        label: "Phase 2 / Complément", title: "Complément", theme: "Les mêmes données sont demandées à nouveau. Chaque papier en appelle un autre.", scenario: "L’écran n’a avancé que d’un numéro. Le dossier est déjà plus épais qu’à votre arrivée.",
        decisions: [
          { prompt: "Il manque encore un document.", detail: "Il ne figurait pas sur la première liste, mais le dossier ne sera pas examiné sans lui.", choices: [
            { action: "Obtenir le document et compléter le dossier", response: "Le complément est enregistré. Le dossier paraît plus complet, au prix d’un nouveau jour de travail perdu." },
            { action: "Chercher une aide juridique avant un nouveau dépôt", response: "Quelqu’un lit enfin toute la chronologie. Vous n’êtes plus seul, mais du temps a encore passé." },
            { action: "Partir pour aujourd’hui", response: "Vous préservez un peu de force. La liste des pièces ne change pas." },
          ] },
          { prompt: "Ce n’est pas de notre compétence.", detail: "Le service qui a reçu le dossier vous renvoie vers l’organisme qui l’a déjà retourné.", choices: [
            { action: "Aller auprès de l’autre organisme", response: "Vous racontez la même histoire ailleurs. Le dossier est transmis, pas clarifié." },
            { action: "Demander une décision écrite sur la compétence", response: "Vous obtenez une confirmation concrète de l’autorité qui doit agir." },
            { action: "Comparer les expériences dans la salle", response: "Trois personnes suivent la même boucle. L’erreur isolée commence à ressembler à un schéma." },
          ] },
          { prompt: "Nous n’avons aucune trace de la réception du document.", detail: "Un document déposé n’apparaît plus dans le système.", choices: [
            { action: "Déposer le même document de nouveau", response: "Le document est réenregistré. Vous expliquez une nouvelle fois pourquoi il existe." },
            { action: "Présenter le reçu conservé", response: "Le reçu est accepté. Pour la première fois, le dossier avance sans nouveau dépôt." },
            { action: "Retirer une partie de la demande", response: "Le dossier devient plus simple. Une partie de la protection demandée en disparaît." },
          ] },
          { prompt: "Le système est indisponible.", detail: "Le guichet est ouvert. Les dossiers ne le sont pas.", choices: [
            { action: "Attendre jusqu’à la fermeture", response: "Le système ne revient pas. Vous perdez une journée et répétez le motif de votre venue." },
            { action: "Envoyer le document par écrit", response: "Vous recevez une nouvelle preuve. Le système reste indisponible, mais le dépôt n’est plus invisible." },
            { action: "Partir avant une nouvelle attente", response: "Vous ne perdez pas toute la journée. Le statut reste incertain." },
          ] },
        ],
      },
      {
        label: "Phase 3 / Délai", title: "Délai", theme: "Les délais de l’institution et le temps d’une personne ne sont plus la même chose.", scenario: "L’horloge a fait de nombreux tours. L’écran n’a avancé que de quelques numéros.",
        decisions: [
          { prompt: "Le délai n’est pas encore expiré.", detail: "C’est la seule information donnée sur le dossier.", choices: [
            { action: "Attendre le délai légal", response: "Trois mois passent. Le délai devient le contenu de la réponse au lieu d’être une limite à l’inaction." },
            { action: "Envoyer une relance écrite", response: "La relance est enregistrée et vous obtenez une trace plus précise du service qui détient le dossier." },
            { action: "Appeler encore", response: "On vous dit que le dossier attend une signature, sans préciser laquelle ni depuis quand." },
          ] },
          { prompt: "Le délai est expiré.", detail: "Il n’y a toujours pas de décision et l’étape suivante exige une nouvelle demande documentée.", choices: [
            { action: "Former un recours précis avec les reçus", response: "Le recours est reçu. Une voie concrète existe enfin, avec la preuve du délai dépassé." },
            { action: "Redéposer la demande initiale", response: "Le dossier est réenregistré. Le délai repart de la nouvelle date." },
            { action: "Accepter l’assurance orale que la décision est proche", response: "Vous évitez un nouveau recours. Rien ne prouve que la décision soit réellement plus proche." },
          ] },
          { prompt: "Le dossier attend une signature.", detail: "Le statut ne change pas. Vous ignorez si une décision existe.", choices: [
            { action: "Faire intervenir une aide juridique", response: "Vous obtenez une lecture plus claire des étapes et quelqu’un pour les suivre avec vous." },
            { action: "Continuer à appeler", response: "Deux appels donnent la même réponse de procédure. La signature n’a toujours pas de date." },
            { action: "Partir pour aujourd’hui", response: "Vous préservez un peu de force. La signature n’apparaît pas." },
          ] },
          { prompt: "On vous dit que la décision est rédigée.", detail: "Vous ne pouvez pas la voir avant la fin de la notification.", choices: [
            { action: "Demander une copie et la preuve de notification", response: "Vous obtenez un document concret. La procédure avance réellement, mais après trois mois supplémentaires." },
            { action: "Clore sans reconnaissance de responsabilité", response: "Une issue limitée est proposée immédiatement. La raison de votre venue reste sans réponse." },
            { action: "Partager le retard avec les autres", response: "Le même statut attend une signature dans plusieurs dossiers. Le retard n’est plus seulement votre date." },
          ] },
        ],
      },
      {
        label: "Phase 4 / Salle d’attente", title: "Salle d’attente", theme: "Vous ne voyez plus seulement votre dossier. Vous voyez la réponse qui se répète.", scenario: "Davantage de chaises sont vides. Pas parce que chacun a obtenu ce qu’il cherchait.",
        decisions: [
          { prompt: "Vous reconnaissez les mêmes phrases dans différents dossiers.", detail: "La question n’est plus seulement de savoir où se trouve votre chemise.", choices: [
            { action: "Comparer les réponses écrites", response: "Les dates et formulations révèlent une répétition qui peut être documentée." },
            { action: "Se concentrer uniquement sur votre dossier", response: "Le dossier reste actif, mais les autres expériences restent séparées." },
            { action: "Partir pour aujourd’hui", response: "Vous gardez un peu de force. La salle continue sans nouvelle trace." },
          ] },
          { prompt: "Les reçus racontent la même histoire.", detail: "Ils peuvent rester des papiers séparés ou former une suite.", choices: [
            { action: "Rassembler des copies avec le consentement de chacun", response: "Plusieurs traces sont préservées sans exposer les dossiers des autres." },
            { action: "Poser publiquement la question du schéma d’attente", response: "L’institution doit répondre à un schéma, pas seulement à un numéro." },
            { action: "Accepter une issue partielle pour votre dossier", response: "Votre dossier avance. La cause du problème et les autres expériences restent hors de la solution." },
          ] },
          { prompt: "La salle peut désormais parler collectivement.", detail: "Cela ne garantit pas une décision, mais change ce qui peut encore être nié.", choices: [
            { action: "Envoyer une demande commune et documentée", response: "Plusieurs dossiers sont reliés par les dates, les reçus et les mêmes réponses." },
            { action: "Demander un soutien juridique commun", response: "La procédure n’est plus portée individuellement. Une voie plus concrète de contrôle s’ouvre." },
            { action: "Accepter une réponse partielle rapide pour vous seul", response: "Votre dossier se ferme. Le schéma collectif perd votre trace." },
          ] },
          { prompt: "Il reste une dernière décision sur ce que vous conservez.", detail: "Le dossier peut rester actif, se fermer ou rejoindre une preuve plus large.", choices: [
            { action: "Documenter le schéma avec soutien et protection", response: "La salle n’a pas résolu tous les dossiers. Mais leur répétition n’est plus invisible." },
            { action: "Maintenir le dossier actif jusqu’à la notification", response: "Le dossier reste ouvert et finit par avancer. Le temps se compte en années." },
            { action: "Clore le dossier avec une issue insuffisante", response: "L’attente s’arrête. L’issue ne couvre pas la raison initiale de la procédure." },
            { action: "Se retirer faute de capacité", response: "Le dossier reste formellement ouvert. Vous n’avez plus la force pour un nouveau cycle." },
          ] },
        ],
      },
    ],
    contextEyebrow: "Derrière la procédure",
    contextTitle: "Que vient-il de se passer ?",
    contextIntro: "L’épuisement institutionnel ne prend pas toujours la forme d’un refus ouvert. Il se compose souvent de répétitions, de pièces supplémentaires, de délais, de renvois et d’une attente qui consume le temps, l’argent, la santé et les forces. Formellement, le dossier existe encore. Dans la vie réelle, la possibilité d’être protégé peut disparaître bien avant la fin de la procédure.",
    contextCards: [
      { title: "Attente", copy: "Le temps n’est pas neutre. Pour l’institution, c’est un délai. Pour une personne, une part de vie qui ne revient pas." },
      { title: "Répétition", copy: "La personne explique encore la même chose, apporte les mêmes papiers et prouve que le problème existe toujours." },
      { title: "Schéma", copy: "Un dossier peut sembler isolé. Quand la même réponse revient pour des dizaines de personnes, la salle d’attente devient une preuve du système." },
    ],
    disclaimer: "Cette simulation est un format interactif fictif inspiré de schémas d’attente institutionnelle. Elle ne représente ni une affaire juridique précise ni un conseil juridique.",
    listingSeoDescription: "Les formats interactifs d’Avangarda sur le pouvoir, le terrain, les institutions et les conséquences des décisions.",
    seoDescription: "Une simulation interactive sur l’attente, la dignité, le temps et l’épuisement institutionnel.",
    timeUnits: { dayOne: "jour", dayMany: "jours", monthOne: "mois", monthMany: "mois", yearOne: "an", yearMany: "ans" },
    screenReaderRoomLabel: "Une salle d’attente avec des rangées de chaises, un guichet derrière une vitre dépolie, une horloge et un écran d’appel.",
    screenReaderClockLabel: "L’horloge représente le temps de vie écoulé.",
    screenReaderQueueLabel: "Le numéro appelé avance beaucoup plus lentement que l’horloge.",
    screenReaderEmptySeatLabel: "Une chaise vide appartient à une personne qui ne revient plus.",
  },
  de: {
    sectionLabel: "Interaktiv",
    collectionTitle: "Interaktive Formate",
    collectionIntro: "Betritt System, Gelände und Institution von innen. Entscheidungen gibt es, doch ihre Folgen bleiben nicht auf dem Bildschirm.",
    gameTitle: "Das Wartezimmer",
    gameSubtitle: "Man hat Sie nicht abgelehnt. Man hat Sie nur warten lassen.",
    typeLabel: "Institutionelle Simulation",
    durationLabel: "Dauer",
    durationValue: "7–10 Minuten",
    openLabel: "Öffnen",
    startLabel: "Nummer ziehen",
    continueLabel: "Weiter warten",
    backLabel: "Zurück zu Interaktiv",
    understandLabel: "Was ist gerade geschehen?",
    restartLabel: "Neu beginnen",
    shareLabel: "Simulation teilen",
    shareCopiedLabel: "Link kopiert.",
    shareUnavailableLabel: "Der Link konnte nicht kopiert werden.",
    decisionLabel: "Entscheidung",
    choicesLabel: "Was tun Sie?",
    metersLabel: "Persönlicher Zustand",
    patienceLabel: "Geduld",
    dignityLabel: "Würde",
    timeLabel: "Vergangene Zeit",
    formalLabel: "Formale Bewegung",
    realLabel: "Tatsächlicher Fortschritt",
    statusLabel: "Aktenstatus",
    logLabel: "Verfahrensspur",
    connectionLabel: "Verbundenheit",
    receiptsLabel: "Gesicherte Eingangsbelege",
    patternsLabel: "Erkannte Wiederholungen",
    departuresLabel: "Menschen, die nicht mehr kommen",
    queueYourNumberLabel: "Ihre Nummer",
    queueServingLabel: "Aktuell aufgerufen",
    queueWaitingLabel: "Bitte warten",
    welcomeLines: ["Willkommen.", "Ihr Anliegen ist wichtig.", "Bitte warten."],
    caseLabel: "Vorgang",
    caseTypes: ["Meldung wegen eines gefährdeten Rechts", "Antrag auf Schutz", "Beschwerde gegen eine Entscheidung", "Nachweis, den die Behörde noch nicht erhalten hat", "Antrag auf Zugang zu einer Leistung", "Ein bereits einmal zurückgesandter Vorgang"],
    monitorMessages: ["Bitte warten.", "Ihr Antrag befindet sich im Verfahren.", "Sie werden benachrichtigt.", "Die Frist ist noch nicht abgelaufen.", "Die zuständige Stelle wird Sie kontaktieren."],
    statuses: { received: "Eingegangen", checking: "In Prüfung", supplement: "Ergänzung erforderlich", forwarded: "Weitergeleitet", missing: "Im System nicht auffindbar", reentered: "Erneut erfasst", deadlineOpen: "Frist nicht abgelaufen", deadlineExpired: "Frist abgelaufen", signature: "Wartet auf Unterschrift", returned: "Zur Ergänzung zurückgesandt", inProgress: "In Bearbeitung", decisionDrafted: "Entscheidung erstellt", delivery: "Zustellung läuft" },
    requirementLabels: {
      patience: "Für diesen Schritt fehlt Ihnen inzwischen die Kraft.",
      dignity: "Diese Möglichkeit verlangt eine Sicherheit, die das Verfahren bereits geschwächt hat.",
      receipts: "Zuerst müssen Sie einen Eingangsbeleg sichern.",
      connection: "Sie kennen noch nicht genügend Erfahrungen anderer Menschen.",
      patterns: "Das Muster ist noch nicht ausreichend dokumentiert.",
      support: "Rechtliche, öffentliche oder gemeinschaftliche Unterstützung ist erforderlich.",
    },
    people: {
      "31": { label: "Nummer 31", departure: "Nummer 31 kam nicht wieder. Eine weitere Busfahrt konnte er sich nicht leisten." },
      "38": { label: "Nummer 38", departure: "Nummer 38 hörte auf zu kommen. Einen weiteren freien Arbeitstag bekam sie nicht." },
      "42": { label: "Nummer 42", departure: "Nummer 42 erhielt eine Entscheidung. Sie kam, nachdem sie ihm nicht mehr helfen konnte." },
      "45": { label: "Nummer 45", departure: "Nummer 45 nahm die Akte mit nach Hause. Eine weitere Ergänzung hätte einen weiteren Monat Warten bedeutet." },
      "53": { label: "Nummer 53", departure: "Nummer 53 kehrte nicht zurück. Bei drei Besuchen war das System nicht verfügbar." },
    },
    endings: {
      evidence: { eyebrow: "Das Muster ist festgehalten", title: "Das Wartezimmer wurde zum Beweis", copy: "Ein einzelner Vorgang geht leicht verloren. Gemeinsame Erfahrungen, Belege und wiederholte Antworten zeigen nun, dass das Problem nicht vereinzelt ist.", note: "Das Verfahren ist vielleicht noch nicht beendet. Aber das Warten lässt sich nicht mehr so leicht als Zufall darstellen." },
      compromise: { eyebrow: "Der Vorgang ist geschlossen", title: "Ein schlechter Kompromiss", copy: "Sie haben ein Ergebnis angenommen, das den Grund Ihres Kommens nicht löst.", note: "Das Verfahren endete schneller. Das Recht, mit dem es begann, bleibt nur teilweise geschützt." },
      exhausted: { eyebrow: "Der Vorgang bleibt aktiv", title: "Erschöpft", copy: "Sie haben den Vorgang nicht verloren. Ihnen fehlte nur die Kraft, weiter Verfahrenspartei zu sein.", note: "Formal steht die Tür offen. Tatsächlich können Sie sich ihr nicht noch einmal nähern." },
      late: { eyebrow: "Eine Entscheidung wird ergehen", title: "Zu spät angenommen", copy: "Der Vorgang wurde formal gesichert und hat schließlich tatsächlich Fortschritt gemacht.", note: "Der Schutz kommt nach dem Zeitpunkt, an dem er am dringendsten gebraucht wurde." },
      ongoing: { eyebrow: "Keine endgültige Entscheidung", title: "Der Vorgang läuft weiter", copy: "Formal ist das Verfahren nicht beendet.", note: "Im wirklichen Leben geht das Warten weiter." },
    },
    resultStats: { totalTime: "Gesamtzeit", visits: "Behördengänge", calls: "Anrufe", supplements: "Ergänzungen", redirects: "Weiterleitungen", retellings: "Wiederholte Erklärungen", proceduralResponses: "Verfahrensantworten", concreteInformation: "Konkrete Informationen", peopleLeft: "Gegangene Personen", patience: "Verbleibende Geduld", dignity: "Verbleibende Würde", formalMovement: "Formale Änderungen", realMovement: "Tatsächliche Fortschritte" },
    phases: [
      {
        label: "Phase 1 / Nummer", title: "Nummer", theme: "Die Reihenfolge wirkt klar. Noch glauben Sie, dass das Verfahren einer Logik folgt.", scenario: "Sie sind eingetreten, haben Nummer 47 gezogen und Platz genommen. Die Anzeige steht auf 12.",
        decisions: [
          { prompt: "Ihr Vorgang hat im System noch keine klare Spur.", detail: "Der Schalter ist offen, doch die Reihe bewegt sich nicht.", choices: [
            { action: "Zum Schalter gehen und den Fall erklären", response: "Man hörte Ihnen zu und fügte einen Vermerk hinzu. Der Status änderte sich, neue Informationen gab es nicht." },
            { action: "Einen schriftlichen Antrag senden und den Beleg sichern", response: "Der Antrag ist eingegangen. Erstmals haben Sie eine Spur, die nicht vom Gedächtnis eines Mitarbeiters abhängt." },
            { action: "Mit den bereits Wartenden sprechen", response: "In drei verschiedenen Vorgängen hören Sie denselben Anfang. Die Reihe wirkt nicht mehr rein individuell." },
          ] },
          { prompt: "Sie fragen, wo sich der Vorgang befindet.", detail: "Die Antwort hängt davon ab, auf welchem Weg Sie suchen.", choices: [
            { action: "Bei der Behörde anrufen", response: "Eine automatische Ansage bestätigt, dass der Antrag im Verfahren ist. Wo er liegt, sagt sie nicht." },
            { action: "Erneut zum Schalter gehen", response: "Unter den bereits angegebenen Daten ist der Vorgang nicht auffindbar." },
            { action: "Den Eingangsbeleg ordnen und sichern", response: "Der Beleg bewegt die Reihe nicht, erschwert aber die Behauptung, das Dokument sei nie angekommen." },
          ] },
          { prompt: "Sie erhalten den ersten formalen Status.", detail: "Die Frist sei noch nicht abgelaufen. Was innerhalb der Frist geschieht, bleibt offen.", choices: [
            { action: "Den Ablauf der Frist abwarten", response: "Ein Monat vergeht. Der Status klingt geordnet, der tatsächliche Fortschritt bleibt unverändert." },
            { action: "Aktenzeichen und genaue Verfahrensstelle verlangen", response: "Der Vorgang wird erneut erfasst und Sie erhalten eine Nummer für den nächsten Kontakt." },
            { action: "Für heute gehen und Kraft bewahren", response: "Sie gehen vor einem weiteren Gespräch. Der Vorgang bewegt sich nicht, doch Sie müssen heute nichts erneut erzählen." },
          ] },
          { prompt: "Der Vorgang wurde an eine andere Stelle weitergeleitet.", detail: "Die Weiterleitung sieht nach Fortschritt aus, ohne dass die Zuständigkeit bestätigt ist.", choices: [
            { action: "Dieselben Unterlagen noch einmal einreichen", response: "Die Akte wird dicker. Die Ergänzung ist eingegangen, der Grund für das Doppel bleibt unerklärt." },
            { action: "Eine schriftliche Zuständigkeitsbestätigung verlangen", response: "Sie erhalten den Namen der Stelle und die Bestätigung, dass sie den Vorgang prüfen muss." },
            { action: "Das mündliche Versprechen eines Rückrufs annehmen", response: "Das Gespräch ist kürzer. Für das Versprechen gibt es keinen Nachweis." },
          ] },
        ],
      },
      {
        label: "Phase 2 / Ergänzung", title: "Ergänzung", theme: "Dieselben Angaben werden erneut verlangt. Jedes neue Papier schafft Raum für das nächste.", scenario: "Die Anzeige ist um eine Nummer weiter. Die Akte ist bereits dicker als bei Ihrer Ankunft.",
        decisions: [
          { prompt: "Noch ein Dokument fehlt.", detail: "Auf der ersten Liste stand es nicht, doch ohne dieses Dokument werde nicht geprüft.", choices: [
            { action: "Das Dokument beschaffen und die Akte ergänzen", response: "Die Ergänzung wird erfasst. Formal ist die Akte vollständiger, ein weiterer Arbeitstag ist verloren." },
            { action: "Vor der nächsten Einreichung rechtliche Hilfe suchen", response: "Erstmals liest jemand den ganzen Ablauf. Sie sind nicht mehr allein, doch weitere Zeit vergeht." },
            { action: "Für heute gehen", response: "Sie bewahren etwas Kraft. Die Liste der Unterlagen bleibt dieselbe." },
          ] },
          { prompt: "Dafür sind wir nicht zuständig.", detail: "Die Stelle, die den Vorgang annahm, schickt Sie zu der Behörde, die ihn bereits zurückgesandt hat.", choices: [
            { action: "Zur anderen Behörde gehen", response: "Sie erzählen dieselbe Geschichte an einem neuen Ort. Der Vorgang wird weitergeleitet, nicht geklärt." },
            { action: "Eine schriftliche Zuständigkeitsklärung verlangen", response: "Sie erhalten eine konkrete Bestätigung, wer handeln muss, und sichern deren Spur." },
            { action: "Erfahrungen im Wartezimmer vergleichen", response: "Drei Menschen stecken in derselben Schleife. Ein Einzelfehler beginnt wie ein Muster auszusehen." },
          ] },
          { prompt: "Wir haben keinen Nachweis über den Eingang.", detail: "Ein eingereichtes Dokument ist im System nicht mehr sichtbar.", choices: [
            { action: "Dasselbe Dokument erneut einreichen", response: "Das Dokument wird neu erfasst. Sie erklären erneut, warum es existiert." },
            { action: "Den gesicherten Beleg vorzeigen", response: "Der Beleg wird anerkannt. Erstmals bewegt sich der Vorgang ohne eine neue Einreichung." },
            { action: "Einen Teil des Antrags zurücknehmen", response: "Der Vorgang wird leichter zu bearbeiten. Ein Teil des gesuchten Schutzes gehört nicht mehr dazu." },
          ] },
          { prompt: "Das System ist derzeit nicht verfügbar.", detail: "Der Schalter ist offen. Die Akten sind es nicht.", choices: [
            { action: "Bis zum Dienstschluss warten", response: "Das System kehrt nicht zurück. Sie verlieren einen Tag und erklären den Besuch erneut." },
            { action: "Das Dokument schriftlich senden", response: "Sie erhalten einen neuen Beleg. Das System bleibt aus, doch die Einreichung ist nicht mehr unsichtbar." },
            { action: "Vor einer weiteren Wartezeit gehen", response: "Sie verlieren nicht den ganzen Tag. Der Status bleibt unklar." },
          ] },
        ],
      },
      {
        label: "Phase 3 / Frist", title: "Frist", theme: "Behördliche Fristen und die Zeit eines Menschen sind nicht mehr dasselbe.", scenario: "Die Uhr hat viele Runden gedreht. Die Anzeige nur wenige Nummern.",
        decisions: [
          { prompt: "Die Frist ist noch nicht abgelaufen.", detail: "Das ist die einzige Information zum Vorgang.", choices: [
            { action: "Die gesetzliche Frist abwarten", response: "Drei Monate vergehen. Die Frist wird zum Inhalt der Antwort statt zur Grenze des Handelns." },
            { action: "Eine schriftliche Sachstandsanfrage senden", response: "Die Anfrage wird erfasst und Sie erhalten eine konkretere Spur zur zuständigen Stelle." },
            { action: "Noch einmal anrufen", response: "Der Vorgang warte auf eine Unterschrift. Wessen und seit wann, sagt niemand." },
          ] },
          { prompt: "Die Frist ist abgelaufen.", detail: "Eine Entscheidung fehlt weiterhin, der nächste Schritt verlangt einen weiteren dokumentierten Antrag.", choices: [
            { action: "Eine genaue Beschwerde mit Belegen einreichen", response: "Die Beschwerde geht ein. Erstmals gibt es eine konkrete Möglichkeit und den Nachweis der überschrittenen Frist." },
            { action: "Den ursprünglichen Antrag neu stellen", response: "Der Vorgang wird neu erfasst. Die Frist beginnt mit dem neuen Datum." },
            { action: "Die mündliche Zusicherung einer baldigen Entscheidung annehmen", response: "Sie müssen keine neue Beschwerde verfassen. Dass die Entscheidung näher ist, bleibt unbelegt." },
          ] },
          { prompt: "Der Vorgang wartet auf eine Unterschrift.", detail: "Der Status bleibt gleich. Ob eine Entscheidung existiert, wissen Sie nicht.", choices: [
            { action: "Rechtliche Unterstützung hinzuziehen", response: "Sie erhalten einen klareren Überblick und jemanden, der die Schritte mit Ihnen verfolgt." },
            { action: "Weiter anrufen", response: "Zwei Anrufe bringen dieselbe Verfahrensantwort. Die Unterschrift hat weiterhin kein Datum." },
            { action: "Für heute gehen", response: "Sie bewahren etwas Kraft. Die Unterschrift erscheint nicht." },
          ] },
          { prompt: "Die Entscheidung sei erstellt.", detail: "Sie dürfen sie erst nach abgeschlossener Zustellung sehen.", choices: [
            { action: "Kopie und Zustellungsnachweis verlangen", response: "Sie erhalten ein konkretes Dokument. Das Verfahren bewegt sich wirklich, aber erst nach drei weiteren Monaten." },
            { action: "Ohne Anerkennung der Verantwortung schließen", response: "Eine begrenzte Lösung kommt sofort. Der Grund Ihres Kommens bleibt unbeantwortet." },
            { action: "Die Verzögerung mit anderen teilen", response: "Derselbe Status wartet in mehreren Akten auf Unterschrift. Die Verzögerung ist nicht mehr nur Ihr Datum." },
          ] },
        ],
      },
      {
        label: "Phase 4 / Wartezimmer", title: "Wartezimmer", theme: "Sie sehen nicht mehr nur Ihren Vorgang. Sie sehen die Antwort, die sich wiederholt.", scenario: "Mehr Stühle sind leer. Nicht, weil alle bekommen haben, wofür sie kamen.",
        decisions: [
          { prompt: "Sie erkennen dieselben Sätze in verschiedenen Vorgängen.", detail: "Es geht nicht mehr nur darum, wo Ihre Akte liegt.", choices: [
            { action: "Schriftliche Antworten vergleichen", response: "Daten und Formulierungen zeigen eine Wiederholung, die sich dokumentieren lässt." },
            { action: "Nur den eigenen Vorgang verfolgen", response: "Der Vorgang bleibt aktiv, die Erfahrungen der anderen bleiben getrennt." },
            { action: "Für heute gehen", response: "Sie bewahren etwas Kraft. Das Wartezimmer läuft ohne neue Spur weiter." },
          ] },
          { prompt: "Belege erzählen dieselbe Geschichte.", detail: "Sie können einzelne Papiere bleiben oder zu einer Reihe werden.", choices: [
            { action: "Mit Einwilligung Belegkopien sammeln", response: "Mehrere Eingangsbelege bleiben erhalten, ohne fremde Vorgänge offenzulegen." },
            { action: "Das Muster des Wartens öffentlich ansprechen", response: "Die Institution muss einem Muster antworten, nicht nur einer Nummer." },
            { action: "Eine Teillösung für den eigenen Vorgang annehmen", response: "Ihr Vorgang bewegt sich. Ursache und Erfahrungen anderer bleiben außerhalb der Lösung." },
          ] },
          { prompt: "Das Wartezimmer kann nun gemeinsam sprechen.", detail: "Das garantiert keine Entscheidung, verändert aber, was sich noch leicht bestreiten lässt.", choices: [
            { action: "Einen gemeinsamen dokumentierten Antrag senden", response: "Mehrere Vorgänge sind durch Daten, Belege und identische Antworten verbunden." },
            { action: "Gemeinsame rechtliche Unterstützung suchen", response: "Menschen tragen das Verfahren nicht mehr einzeln. Ein konkreterer Prüfweg öffnet sich." },
            { action: "Nur für sich eine schnelle Teillösung annehmen", response: "Ihr Vorgang schließt. Dem gemeinsamen Muster fehlt Ihre Spur." },
          ] },
          { prompt: "Eine letzte Entscheidung bleibt: Was bewahren Sie?", detail: "Der Vorgang kann aktiv bleiben, geschlossen werden oder Teil eines größeren Beweises werden.", choices: [
            { action: "Das Muster mit Unterstützung und Schutz dokumentieren", response: "Das Wartezimmer hat nicht alle Vorgänge gelöst. Ihre Wiederholung ist aber nicht mehr unsichtbar." },
            { action: "Den Vorgang bis zur Zustellung aktiv halten", response: "Der Vorgang bleibt im Verfahren und bewegt sich schließlich. Zeit wird in Jahren gemessen." },
            { action: "Den Vorgang mit einer schwachen Lösung schließen", response: "Das Warten endet. Die Lösung deckt den Anlass des Verfahrens nicht ab." },
            { action: "Aufgeben, weil keine Kraft mehr bleibt", response: "Formal bleibt der Vorgang offen. Für eine weitere Runde fehlt Ihnen die Kraft." },
          ] },
        ],
      },
    ],
    contextEyebrow: "Hinter dem Verfahren",
    contextTitle: "Was ist gerade geschehen?",
    contextIntro: "Institutionelle Erschöpfung sieht nicht immer wie eine offene Ablehnung aus. Oft besteht sie aus Wiederholungen, Ergänzungen, Fristen, Weiterleitungen und Warten, das Zeit, Geld, Gesundheit und Kraft verbraucht. Formal existiert der Vorgang weiter. Im wirklichen Leben kann die Möglichkeit des Schutzes lange vor dem Verfahrensende verschwinden.",
    contextCards: [
      { title: "Warten", copy: "Zeit ist nicht neutral. Für die Institution ist sie eine Frist. Für einen Menschen ist sie ein Teil des Lebens, der nicht zurückkehrt." },
      { title: "Wiederholung", copy: "Ein Mensch erklärt immer wieder dasselbe, bringt dieselben Papiere und beweist, dass das Problem noch besteht." },
      { title: "Muster", copy: "Ein Vorgang kann wie ein Einzelfall wirken. Erhalten Dutzende dieselbe Antwort, wird das Wartezimmer zum Beweis des Systems." },
    ],
    disclaimer: "Diese Simulation ist ein fiktionales interaktives Format, das auf Mustern institutionellen Wartens beruht. Sie stellt weder einen konkreten Rechtsfall noch Rechtsberatung dar.",
    listingSeoDescription: "Interaktive Avangarda-Formate über Macht, Gelände, Institutionen und die Folgen von Entscheidungen.",
    seoDescription: "Eine interaktive Simulation über Warten, Würde, Zeit und institutionelle Erschöpfung.",
    timeUnits: { dayOne: "Tag", dayMany: "Tage", monthOne: "Monat", monthMany: "Monate", yearOne: "Jahr", yearMany: "Jahre" },
    screenReaderRoomLabel: "Ein Wartezimmer mit Stuhlreihen, einem Schalter hinter Milchglas, einer Wanduhr und einer Nummernanzeige.",
    screenReaderClockLabel: "Die Wanduhr steht für verstrichene Lebenszeit.",
    screenReaderQueueLabel: "Die Aufrufnummer bewegt sich deutlich langsamer als die Uhr.",
    screenReaderEmptySeatLabel: "Ein leerer Stuhl gehört zu einer Person, die nicht mehr wiederkommt.",
  },
  es: {
    sectionLabel: "Interactivo",
    collectionTitle: "Formatos interactivos",
    collectionIntro: "Entra en el sistema, el territorio y la institución desde dentro. Hay decisiones, pero sus consecuencias no se quedan en la pantalla.",
    gameTitle: "La sala de espera",
    gameSubtitle: "No te rechazaron. Simplemente te dejaron esperando.",
    typeLabel: "Simulación institucional",
    durationLabel: "Duración",
    durationValue: "7–10 minutos",
    openLabel: "Abrir",
    startLabel: "Sacar número",
    continueLabel: "Seguir esperando",
    backLabel: "Volver a Interactivo",
    understandLabel: "¿Qué acaba de pasar?",
    restartLabel: "Empezar de nuevo",
    shareLabel: "Compartir simulación",
    shareCopiedLabel: "Enlace copiado.",
    shareUnavailableLabel: "No se pudo copiar el enlace.",
    decisionLabel: "Decisión",
    choicesLabel: "¿Qué vas a hacer?",
    metersLabel: "Estado personal",
    patienceLabel: "Paciencia",
    dignityLabel: "Dignidad",
    timeLabel: "Tiempo transcurrido",
    formalLabel: "Movimiento formal",
    realLabel: "Avance real",
    statusLabel: "Estado del expediente",
    logLabel: "Rastro del procedimiento",
    connectionLabel: "Conexión",
    receiptsLabel: "Justificantes guardados",
    patternsLabel: "Repeticiones detectadas",
    departuresLabel: "Personas que ya no vuelven",
    queueYourNumberLabel: "Tu número",
    queueServingLabel: "Atendiendo ahora",
    queueWaitingLabel: "Por favor, espera",
    welcomeLines: ["Bienvenido.", "Tu caso es importante.", "Por favor, espera."],
    caseLabel: "Expediente",
    caseTypes: ["Denuncia por un derecho amenazado", "Solicitud de protección", "Recurso contra una decisión", "Prueba que la institución aún no ha recibido", "Solicitud de acceso a un servicio", "Expediente ya devuelto una vez"],
    monitorMessages: ["Por favor, espera.", "Tu solicitud está en trámite.", "Recibirás una notificación.", "El plazo aún no ha vencido.", "El servicio competente se pondrá en contacto contigo."],
    statuses: { received: "Recibido", checking: "En revisión", supplement: "Falta documentación", forwarded: "Remitido", missing: "No consta en el sistema", reentered: "Registrado de nuevo", deadlineOpen: "Plazo no vencido", deadlineExpired: "Plazo vencido", signature: "Pendiente de firma", returned: "Devuelto para completar", inProgress: "En tramitación", decisionDrafted: "Decisión redactada", delivery: "Notificación en curso" },
    requirementLabels: {
      patience: "Ya no te queda fuerza suficiente para esta gestión.",
      dignity: "Esta opción exige una seguridad que el procedimiento ya ha desgastado.",
      receipts: "Primero debes conservar una prueba de entrega.",
      connection: "Aún no conoces suficientes experiencias de otras personas.",
      patterns: "El patrón todavía no está suficientemente documentado.",
      support: "Hace falta apoyo jurídico, público o colectivo.",
    },
    people: {
      "31": { label: "Número 31", departure: "El número 31 no volvió. No podía pagar otro billete de autobús." },
      "38": { label: "Número 38", departure: "El número 38 dejó de venir. No podía pedir otro día libre." },
      "42": { label: "Número 42", departure: "El número 42 recibió una decisión. Llegó cuando ya no podía ayudarle." },
      "45": { label: "Número 45", departure: "El número 45 se llevó la carpeta a casa. Otro documento habría supuesto otro mes de espera." },
      "53": { label: "Número 53", departure: "El número 53 no regresó. En tres visitas el sistema no funcionaba." },
    },
    endings: {
      evidence: { eyebrow: "El patrón quedó registrado", title: "La sala de espera se convirtió en prueba", copy: "Un expediente aislado se pierde con facilidad. Las experiencias, justificantes y respuestas repetidas muestran ahora que el problema no es individual.", note: "El procedimiento quizá no haya terminado. Pero la espera ya no puede presentarse tan fácilmente como un accidente." },
      compromise: { eyebrow: "El expediente está cerrado", title: "Un mal acuerdo", copy: "Aceptaste una solución que no resuelve el motivo por el que viniste.", note: "El procedimiento terminó antes. El derecho que lo inició quedó protegido solo en parte." },
      exhausted: { eyebrow: "El expediente sigue activo", title: "Agotado", copy: "No perdiste el caso. Simplemente ya no tenías fuerza para seguir siendo parte del procedimiento.", note: "Formalmente, la puerta sigue abierta. En la práctica, ya no puedes acercarte de nuevo." },
      late: { eyebrow: "Habrá una decisión", title: "Aceptado demasiado tarde", copy: "El expediente se conservó formalmente y por fin logró un avance real.", note: "La protección llega después del momento en que más se necesitaba." },
      ongoing: { eyebrow: "Sin decisión definitiva", title: "El expediente sigue en trámite", copy: "Formalmente, el procedimiento no ha terminado.", note: "En la vida real, la espera continúa." },
    },
    resultStats: { totalTime: "Tiempo total", visits: "Visitas", calls: "Llamadas", supplements: "Aportaciones", redirects: "Remisiones", retellings: "Explicaciones repetidas", proceduralResponses: "Respuestas procedimentales", concreteInformation: "Información concreta", peopleLeft: "Personas que se fueron", patience: "Paciencia final", dignity: "Dignidad final", formalMovement: "Cambios formales", realMovement: "Avances reales" },
    phases: [
      {
        label: "Fase 1 / Número", title: "Número", theme: "La cola parece clara. Todavía crees que el procedimiento tiene lógica.", scenario: "Entraste, sacaste el número 47 y te sentaste. La pantalla muestra el 12.",
        decisions: [
          { prompt: "Tu expediente todavía no deja un rastro claro en el sistema.", detail: "La ventanilla está abierta, pero la cola no avanza.", choices: [
            { action: "Ir a la ventanilla y explicar el caso", response: "Te escucharon y añadieron una nota. El estado cambió, pero no recibiste información nueva." },
            { action: "Enviar una solicitud escrita y guardar el justificante", response: "La solicitud fue recibida. Por primera vez tienes un rastro que no depende de la memoria de un funcionario." },
            { action: "Hablar con quienes ya están esperando", response: "Oíste el mismo comienzo en tres expedientes distintos. La cola ya no parece del todo individual." },
          ] },
          { prompt: "Preguntas dónde está el expediente.", detail: "La respuesta depende del canal por el que lo busques.", choices: [
            { action: "Llamar a la institución", response: "Un mensaje automático confirma que la solicitud está en trámite. No dice dónde." },
            { action: "Volver a la ventanilla", response: "No encuentran el expediente con los datos que ya diste." },
            { action: "Ordenar y conservar la prueba de entrega", response: "El justificante no mueve la cola, pero reduce el margen para decir que el documento nunca llegó." },
          ] },
          { prompt: "Recibes el primer estado formal.", detail: "Dice que el plazo no ha vencido. No dice qué sucede durante ese plazo.", choices: [
            { action: "Esperar a que venza el plazo", response: "Pasa un mes. El estado suena ordenado y el avance real sigue igual." },
            { action: "Pedir el número y la ubicación exacta del expediente", response: "El expediente se registra de nuevo y recibes un número que podrás citar la próxima vez." },
            { action: "Marcharte por hoy y conservar fuerzas", response: "Te fuiste antes de otra conversación. El expediente no avanzó, pero hoy no repetiste todo." },
          ] },
          { prompt: "El expediente fue remitido a otra unidad.", detail: "La remisión parece un avance, pero la competencia no está confirmada.", choices: [
            { action: "Llevar otra copia de los mismos documentos", response: "La carpeta engorda. La aportación fue recibida, pero nadie explicó por qué hacía falta duplicarla." },
            { action: "Pedir confirmación escrita de la competencia", response: "Recibiste el nombre de la unidad y la confirmación de que debe examinar el expediente." },
            { action: "Aceptar la promesa verbal de una llamada", response: "La conversación fue más corta. No queda constancia de la promesa." },
          ] },
        ],
      },
      {
        label: "Fase 2 / Aportación", title: "Aportación", theme: "Vuelven a pedir los mismos datos. Cada papel nuevo abre espacio para el siguiente.", scenario: "La pantalla avanzó un número. La carpeta ya es más gruesa que al entrar.",
        decisions: [
          { prompt: "Falta un documento más.", detail: "No figuraba en la primera lista, pero sin él no examinarán el expediente.", choices: [
            { action: "Conseguir el documento y completar el expediente", response: "La aportación quedó registrada. El expediente está formalmente más completo y tú perdiste otro día de trabajo." },
            { action: "Buscar ayuda jurídica antes de otra entrega", response: "Alguien leyó por primera vez toda la secuencia. Ya no estás solo, pero pasó más tiempo." },
            { action: "Marcharte por hoy", response: "Conservaste algo de fuerza. La lista de documentos no cambió." },
          ] },
          { prompt: "Esto no es competencia nuestra.", detail: "La oficina que recibió el expediente te envía al organismo que ya lo devolvió.", choices: [
            { action: "Ir al otro organismo", response: "Contaste la misma historia en otro lugar. El expediente fue remitido, no aclarado." },
            { action: "Pedir una determinación escrita de la competencia", response: "Recibiste confirmación concreta de quién debe actuar y guardaste su rastro." },
            { action: "Comparar experiencias en la sala", response: "Tres personas recorren el mismo círculo. Un error aislado empieza a parecer un patrón." },
          ] },
          { prompt: "No consta que hayamos recibido el documento.", detail: "Un documento entregado ya no aparece en el sistema.", choices: [
            { action: "Entregar de nuevo el mismo documento", response: "El documento se registra otra vez. Vuelves a explicar por qué existe." },
            { action: "Mostrar el justificante guardado", response: "El justificante fue aceptado. Por primera vez el expediente avanzó sin una nueva entrega." },
            { action: "Retirar una parte de la solicitud", response: "El expediente resulta más sencillo. Una parte de la protección solicitada desaparece de él." },
          ] },
          { prompt: "El sistema no funciona.", detail: "La ventanilla está abierta. Los registros no.", choices: [
            { action: "Esperar hasta el final del horario", response: "El sistema no volvió. Perdiste el día y repetiste el motivo de tu visita." },
            { action: "Enviar el documento por escrito", response: "Recibiste otro justificante. El sistema sigue caído, pero la entrega ya no es invisible." },
            { action: "Irte antes de otra espera", response: "No perdiste el día entero. El estado quedó sin aclarar." },
          ] },
        ],
      },
      {
        label: "Fase 3 / Plazo", title: "Plazo", theme: "Los plazos de la institución y el tiempo de una persona ya no son lo mismo.", scenario: "El reloj dio muchas vueltas. La pantalla avanzó pocos números.",
        decisions: [
          { prompt: "El plazo aún no ha vencido.", detail: "Es la única información que recibes sobre el expediente.", choices: [
            { action: "Esperar el plazo legal", response: "Pasan tres meses. El plazo se convierte en el contenido de la respuesta en lugar de limitar la inacción." },
            { action: "Enviar un requerimiento escrito", response: "El escrito quedó registrado y obtuviste un rastro más concreto de quién tiene el expediente." },
            { action: "Llamar otra vez", response: "Te dijeron que el expediente espera una firma. Nadie dijo de quién ni desde cuándo." },
          ] },
          { prompt: "El plazo ha vencido.", detail: "Sigue sin haber decisión y el siguiente paso exige otra petición documentada.", choices: [
            { action: "Presentar un recurso preciso con justificantes", response: "El recurso fue recibido. Por primera vez hay una vía concreta y prueba de que el plazo se incumplió." },
            { action: "Presentar de nuevo la solicitud inicial", response: "El expediente se registra otra vez. El plazo empieza desde la nueva fecha." },
            { action: "Aceptar la garantía verbal de que la decisión está cerca", response: "No redactaste otro recurso. No hay prueba de que la decisión esté realmente más cerca." },
          ] },
          { prompt: "El expediente espera una firma.", detail: "El estado no cambia. No sabes si existe una decisión.", choices: [
            { action: "Incorporar apoyo jurídico", response: "Obtienes un mapa más claro de los pasos y alguien que puede seguirlos contigo." },
            { action: "Seguir llamando", response: "Dos llamadas dieron la misma respuesta procedimental. La firma sigue sin fecha." },
            { action: "Marcharte por hoy", response: "Conservaste algo de fuerza. La firma no apareció." },
          ] },
          { prompt: "Dicen que la decisión está redactada.", detail: "No puedes verla hasta que termine la notificación.", choices: [
            { action: "Pedir copia y prueba de notificación", response: "Recibiste un documento concreto. El procedimiento avanzó de verdad, pero tres meses después." },
            { action: "Cerrar sin reconocimiento de responsabilidad", response: "Recibirás de inmediato una solución limitada. El motivo de tu visita sigue sin respuesta." },
            { action: "Compartir el retraso con los demás", response: "El mismo estado espera firma en varias carpetas. El retraso ya no es solo tu fecha." },
          ] },
        ],
      },
      {
        label: "Fase 4 / Sala de espera", title: "Sala de espera", theme: "Ya no ves solo tu expediente. Ves la respuesta que se repite.", scenario: "Hay más sillas vacías. No porque todos hayan recibido lo que buscaban.",
        decisions: [
          { prompt: "Reconoces las mismas frases en distintos expedientes.", detail: "La pregunta ya no es solo dónde está tu carpeta.", choices: [
            { action: "Comparar las respuestas escritas", response: "Las fechas y las fórmulas muestran una repetición que puede documentarse." },
            { action: "Centrarte solo en tu expediente", response: "El expediente sigue activo, pero las experiencias de los demás permanecen separadas." },
            { action: "Marcharte por hoy", response: "Conservaste algo de fuerza. La sala siguió sin dejar un rastro nuevo." },
          ] },
          { prompt: "Los justificantes cuentan la misma historia.", detail: "Pueden seguir siendo papeles aislados o formar una secuencia.", choices: [
            { action: "Reunir copias con consentimiento", response: "Se conservaron varios rastros de entrega sin exponer expedientes ajenos." },
            { action: "Plantear públicamente el patrón de espera", response: "La institución debe responder a un patrón, no solo a un número." },
            { action: "Aceptar una solución parcial para tu expediente", response: "Tu expediente avanzó. La causa del problema y las experiencias ajenas quedaron fuera." },
          ] },
          { prompt: "La sala puede hablar en común.", detail: "No garantiza una decisión, pero cambia lo que todavía puede negarse con facilidad.", choices: [
            { action: "Enviar una petición conjunta y documentada", response: "Varios expedientes quedan conectados por fechas, justificantes y respuestas idénticas." },
            { action: "Buscar apoyo jurídico compartido", response: "Las personas ya no cargan solas con el procedimiento. Se abre una vía más concreta de revisión." },
            { action: "Aceptar una respuesta parcial rápida solo para ti", response: "Tu expediente se cierra. El patrón común pierde tu rastro." },
          ] },
          { prompt: "Queda una última decisión sobre qué conservar.", detail: "El expediente puede seguir activo, cerrarse o formar parte de una prueba más amplia.", choices: [
            { action: "Documentar el patrón con apoyo y protección", response: "La sala no resolvió todos los expedientes. Pero su repetición ya no es invisible." },
            { action: "Mantener el expediente activo hasta la notificación", response: "El expediente siguió en trámite y por fin avanzó. El tiempo se mide en años." },
            { action: "Cerrar el expediente con una solución débil", response: "La espera termina. La solución no cubre el motivo inicial del procedimiento." },
            { action: "Retirarte porque ya no tienes capacidad", response: "El expediente sigue formalmente abierto. Ya no tienes fuerza para otra vuelta." },
          ] },
        ],
      },
    ],
    contextEyebrow: "Detrás del procedimiento",
    contextTitle: "¿Qué acaba de pasar?",
    contextIntro: "El agotamiento institucional no siempre parece un rechazo abierto. A menudo consiste en repeticiones, documentación adicional, plazos, remisiones y una espera que consume tiempo, dinero, salud y fuerza. Formalmente, el expediente sigue existiendo. En la vida real, la posibilidad de protección puede desaparecer mucho antes de que termine el procedimiento.",
    contextCards: [
      { title: "Espera", copy: "El tiempo no es neutral. Para la institución es un plazo. Para una persona es una parte de la vida que no vuelve." },
      { title: "Repetición", copy: "La persona vuelve a explicar lo mismo, lleva los mismos papeles y demuestra que el problema todavía existe." },
      { title: "Patrón", copy: "Un expediente puede parecer un problema aislado. Cuando la misma respuesta llega a decenas de personas, la sala de espera se convierte en prueba del sistema." },
    ],
    disclaimer: "Esta simulación es un formato interactivo ficticio basado en patrones de demora institucional. No representa un caso jurídico concreto ni asesoramiento jurídico.",
    listingSeoDescription: "Formatos interactivos de Avangarda sobre poder, territorio, instituciones y consecuencias de las decisiones.",
    seoDescription: "Una simulación interactiva sobre espera, dignidad, tiempo y agotamiento institucional.",
    timeUnits: { dayOne: "día", dayMany: "días", monthOne: "mes", monthMany: "meses", yearOne: "año", yearMany: "años" },
    screenReaderRoomLabel: "Una sala de espera con filas de sillas, una ventanilla tras vidrio esmerilado, un reloj y una pantalla de turnos.",
    screenReaderClockLabel: "El reloj representa el tiempo de vida transcurrido.",
    screenReaderQueueLabel: "El número de turno avanza mucho más despacio que el reloj.",
    screenReaderEmptySeatLabel: "Una silla vacía pertenece a una persona que ya no vuelve.",
  },
  el: {
    sectionLabel: "Διαδραστικά",
    collectionTitle: "Διαδραστικές μορφές",
    collectionIntro: "Μπες στο σύστημα, στο πεδίο και στον θεσμό από μέσα. Υπάρχουν επιλογές, αλλά οι συνέπειές τους δεν μένουν στην οθόνη.",
    gameTitle: "Η αίθουσα αναμονής",
    gameSubtitle: "Δεν σε απέρριψαν. Απλώς σε άφησαν να περιμένεις.",
    typeLabel: "Θεσμική προσομοίωση",
    durationLabel: "Διάρκεια",
    durationValue: "7–10 λεπτά",
    openLabel: "Άνοιγμα",
    startLabel: "Πάρε αριθμό",
    continueLabel: "Συνέχισε να περιμένεις",
    backLabel: "Πίσω στα Διαδραστικά",
    understandLabel: "Τι μόλις συνέβη;",
    restartLabel: "Από την αρχή",
    shareLabel: "Κοινοποίηση προσομοίωσης",
    shareCopiedLabel: "Ο σύνδεσμος αντιγράφηκε.",
    shareUnavailableLabel: "Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.",
    decisionLabel: "Απόφαση",
    choicesLabel: "Τι θα κάνεις;",
    metersLabel: "Προσωπική κατάσταση",
    patienceLabel: "Υπομονή",
    dignityLabel: "Αξιοπρέπεια",
    timeLabel: "Χρόνος που πέρασε",
    formalLabel: "Τυπική κίνηση",
    realLabel: "Πραγματική πρόοδος",
    statusLabel: "Κατάσταση υπόθεσης",
    logLabel: "Ίχνος διαδικασίας",
    connectionLabel: "Σύνδεση",
    receiptsLabel: "Αποδεικτικά κατάθεσης",
    patternsLabel: "Επαναλήψεις που εντοπίστηκαν",
    departuresLabel: "Άνθρωποι που δεν επιστρέφουν",
    queueYourNumberLabel: "Ο αριθμός σου",
    queueServingLabel: "Τώρα εξυπηρετείται",
    queueWaitingLabel: "Παρακαλώ περιμένετε",
    welcomeLines: ["Καλώς ήρθατε.", "Η υπόθεσή σας είναι σημαντική.", "Παρακαλώ περιμένετε."],
    caseLabel: "Υπόθεση",
    caseTypes: ["Αναφορά για δικαίωμα που απειλείται", "Αίτημα προστασίας", "Προσφυγή κατά απόφασης", "Στοιχείο που ο θεσμός δεν έχει ακόμη παραλάβει", "Αίτημα πρόσβασης σε υπηρεσία", "Υπόθεση που έχει ήδη επιστραφεί μία φορά"],
    monitorMessages: ["Παρακαλώ περιμένετε.", "Το αίτημά σας βρίσκεται σε διαδικασία.", "Θα ενημερωθείτε.", "Η προθεσμία δεν έχει ακόμη λήξει.", "Η αρμόδια υπηρεσία θα επικοινωνήσει μαζί σας."],
    statuses: { received: "Παραλήφθηκε", checking: "Υπό έλεγχο", supplement: "Απαιτούνται συμπληρωματικά στοιχεία", forwarded: "Διαβιβάστηκε", missing: "Δεν βρέθηκε στο σύστημα", reentered: "Καταχωρίστηκε ξανά", deadlineOpen: "Η προθεσμία δεν έληξε", deadlineExpired: "Η προθεσμία έληξε", signature: "Αναμένει υπογραφή", returned: "Επιστράφηκε για συμπλήρωση", inProgress: "Υπό επεξεργασία", decisionDrafted: "Η απόφαση συντάχθηκε", delivery: "Η κοινοποίηση βρίσκεται σε εξέλιξη" },
    requirementLabels: {
      patience: "Δεν σου έχει απομείνει αρκετή δύναμη για αυτή την ενέργεια.",
      dignity: "Αυτή η επιλογή απαιτεί μια αίσθηση ασφάλειας που η διαδικασία έχει ήδη φθείρει.",
      receipts: "Πρέπει πρώτα να κρατήσεις αποδεικτικό κατάθεσης.",
      connection: "Δεν γνωρίζεις ακόμη αρκετά για τις εμπειρίες των άλλων.",
      patterns: "Το μοτίβο δεν έχει ακόμη τεκμηριωθεί αρκετά.",
      support: "Χρειάζεται νομική, δημόσια ή συλλογική στήριξη.",
    },
    people: {
      "31": { label: "Αριθμός 31", departure: "Ο αριθμός 31 δεν επέστρεψε. Δεν μπορούσε να πληρώσει άλλο ένα εισιτήριο λεωφορείου." },
      "38": { label: "Αριθμός 38", departure: "Ο αριθμός 38 σταμάτησε να έρχεται. Δεν μπορούσε να πάρει άλλη μία ημέρα άδειας." },
      "42": { label: "Αριθμός 42", departure: "Ο αριθμός 42 έλαβε απόφαση. Έφτασε όταν δεν μπορούσε πια να τον βοηθήσει." },
      "45": { label: "Αριθμός 45", departure: "Ο αριθμός 45 πήρε τον φάκελο σπίτι. Ένα ακόμη συμπλήρωμα θα σήμαινε έναν ακόμη μήνα αναμονής." },
      "53": { label: "Αριθμός 53", departure: "Ο αριθμός 53 δεν γύρισε. Σε τρεις επισκέψεις το σύστημα δεν λειτουργούσε." },
    },
    endings: {
      evidence: { eyebrow: "Το μοτίβο καταγράφηκε", title: "Η αίθουσα αναμονής έγινε αποδεικτικό στοιχείο", copy: "Μία υπόθεση χάνεται εύκολα. Οι κοινές εμπειρίες, τα αποδεικτικά και οι επαναλαμβανόμενες απαντήσεις δείχνουν πλέον ότι το πρόβλημα δεν είναι μεμονωμένο.", note: "Η διαδικασία μπορεί να μην έχει τελειώσει. Όμως η αναμονή δεν μπορεί πια να παρουσιαστεί εύκολα ως σύμπτωση." },
      compromise: { eyebrow: "Η υπόθεση έκλεισε", title: "Κακός συμβιβασμός", copy: "Δέχτηκες μια λύση που δεν αντιμετωπίζει τον λόγο για τον οποίο ήρθες.", note: "Η διαδικασία τελείωσε νωρίτερα. Το δικαίωμα που την ξεκίνησε προστατεύτηκε μόνο εν μέρει." },
      exhausted: { eyebrow: "Η υπόθεση παραμένει ενεργή", title: "Εξαντλήθηκες", copy: "Δεν έχασες την υπόθεση. Απλώς δεν είχες πια τη δύναμη να παραμείνεις μέρος της διαδικασίας.", note: "Τυπικά, η πόρτα είναι ακόμη ανοιχτή. Στην πράξη, δεν μπορείς να την πλησιάσεις ξανά." },
      late: { eyebrow: "Θα εκδοθεί απόφαση", title: "Έγινε δεκτό πολύ αργά", copy: "Η υπόθεση διατηρήθηκε τυπικά και τελικά σημείωσε πραγματική πρόοδο.", note: "Η προστασία έρχεται μετά τη στιγμή που ήταν περισσότερο αναγκαία." },
      ongoing: { eyebrow: "Καμία οριστική απόφαση", title: "Η υπόθεση βρίσκεται ακόμη σε εξέλιξη", copy: "Τυπικά, η διαδικασία δεν έχει ολοκληρωθεί.", note: "Στην πραγματική ζωή, η αναμονή συνεχίζεται." },
    },
    resultStats: { totalTime: "Συνολικός χρόνος", visits: "Επισκέψεις", calls: "Τηλεφωνήματα", supplements: "Συμπληρώσεις", redirects: "Παραπομπές", retellings: "Επαναλήψεις εξηγήσεων", proceduralResponses: "Διαδικαστικές απαντήσεις", concreteInformation: "Συγκεκριμένες πληροφορίες", peopleLeft: "Άνθρωποι που έφυγαν", patience: "Τελική υπομονή", dignity: "Τελική αξιοπρέπεια", formalMovement: "Τυπικές αλλαγές", realMovement: "Πραγματικά βήματα" },
    phases: [
      {
        label: "Φάση 1 / Αριθμός", title: "Αριθμός", theme: "Η σειρά φαίνεται ξεκάθαρη. Ακόμη πιστεύεις ότι η διαδικασία έχει λογική.", scenario: "Μπήκες, πήρες τον αριθμό 47 και κάθισες. Η οθόνη δείχνει 12.",
        decisions: [
          { prompt: "Η υπόθεσή σου δεν έχει ακόμη καθαρό ίχνος στο σύστημα.", detail: "Το γκισέ είναι ανοιχτό, αλλά η σειρά δεν προχωρά.", choices: [
            { action: "Πήγαινε στο γκισέ και εξήγησε την υπόθεση", response: "Σε άκουσαν και πρόσθεσαν μια σημείωση. Η κατάσταση άλλαξε, αλλά δεν πήρες νέα πληροφορία." },
            { action: "Στείλε γραπτό αίτημα και κράτησε το αποδεικτικό", response: "Το αίτημα παραλήφθηκε. Για πρώτη φορά έχεις ίχνος που δεν εξαρτάται από τη μνήμη ενός υπαλλήλου." },
            { action: "Μίλησε με όσους ήδη περιμένουν", response: "Άκουσες την ίδια αρχή σε τρεις διαφορετικές υποθέσεις. Η σειρά δεν μοιάζει πια εντελώς ατομική." },
          ] },
          { prompt: "Ρωτάς πού βρίσκεται η υπόθεση.", detail: "Η απάντηση εξαρτάται από τον τρόπο με τον οποίο την αναζητάς.", choices: [
            { action: "Τηλεφώνησε στον θεσμό", response: "Ένα αυτόματο μήνυμα επιβεβαιώνει ότι το αίτημα βρίσκεται σε διαδικασία. Δεν λέει πού." },
            { action: "Επέστρεψε στο γκισέ", response: "Δεν βρίσκουν την υπόθεση με τα στοιχεία που έχεις ήδη δώσει." },
            { action: "Τακτοποίησε και φύλαξε το αποδεικτικό κατάθεσης", response: "Το αποδεικτικό δεν προχωρά τη σειρά, αλλά περιορίζει τη δυνατότητα να πουν ότι το έγγραφο δεν έφτασε." },
          ] },
          { prompt: "Λαμβάνεις την πρώτη τυπική κατάσταση.", detail: "Λέει ότι η προθεσμία δεν έληξε. Δεν λέει τι γίνεται μέσα σε αυτή.", choices: [
            { action: "Περίμενε να λήξει η προθεσμία", response: "Περνά ένας μήνας. Η κατάσταση ακούγεται τακτοποιημένη, ενώ η πραγματική πρόοδος μένει ίδια." },
            { action: "Ζήτησε αριθμό και ακριβή θέση στη διαδικασία", response: "Η υπόθεση καταχωρίζεται ξανά και παίρνεις αριθμό για την επόμενη επικοινωνία." },
            { action: "Φύγε για σήμερα και κράτησε δυνάμεις", response: "Έφυγες πριν από άλλη συζήτηση. Η υπόθεση δεν προχώρησε, αλλά σήμερα δεν επανέλαβες τα πάντα." },
          ] },
          { prompt: "Η υπόθεση διαβιβάστηκε σε άλλη υπηρεσία.", detail: "Η διαβίβαση μοιάζει με πρόοδο, αλλά η αρμοδιότητα δεν επιβεβαιώθηκε.", choices: [
            { action: "Φέρε ξανά τα ίδια έγγραφα", response: "Ο φάκελος παχαίνει. Τα έγγραφα παραλήφθηκαν, χωρίς εξήγηση για το αντίγραφο." },
            { action: "Ζήτησε γραπτή επιβεβαίωση αρμοδιότητας", response: "Πήρες το όνομα της υπηρεσίας και επιβεβαίωση ότι οφείλει να εξετάσει την υπόθεση." },
            { action: "Δέξου την προφορική υπόσχεση ότι θα σε καλέσουν", response: "Η συζήτηση ήταν σύντομη. Δεν υπάρχει καταγραφή της υπόσχεσης." },
          ] },
        ],
      },
      {
        label: "Φάση 2 / Συμπλήρωση", title: "Συμπλήρωση", theme: "Ζητούν ξανά τα ίδια στοιχεία. Κάθε νέο χαρτί ανοίγει χώρο για το επόμενο.", scenario: "Η οθόνη προχώρησε έναν αριθμό. Ο φάκελος είναι ήδη πιο παχύς από όταν μπήκες.",
        decisions: [
          { prompt: "Λείπει ακόμη ένα έγγραφο.", detail: "Δεν ήταν στην πρώτη λίστα, αλλά χωρίς αυτό η υπόθεση δεν θα εξεταστεί.", choices: [
            { action: "Βρες το έγγραφο και συμπλήρωσε τον φάκελο", response: "Η συμπλήρωση καταγράφηκε. Ο φάκελος είναι τυπικά πληρέστερος, με άλλη μία χαμένη ημέρα εργασίας." },
            { action: "Ζήτησε νομική βοήθεια πριν από νέα κατάθεση", response: "Κάποιος διάβασε για πρώτη φορά όλη τη σειρά. Δεν είσαι πια μόνος, αλλά πέρασε κι άλλος χρόνος." },
            { action: "Φύγε για σήμερα", response: "Κράτησες λίγη δύναμη. Η λίστα των εγγράφων δεν άλλαξε." },
          ] },
          { prompt: "Δεν είμαστε αρμόδιοι.", detail: "Η υπηρεσία που παρέλαβε την υπόθεση σε στέλνει στον φορέα που την είχε ήδη επιστρέψει.", choices: [
            { action: "Πήγαινε στον άλλο φορέα", response: "Είπες την ίδια ιστορία σε νέο μέρος. Η υπόθεση διαβιβάστηκε, δεν ξεκαθαρίστηκε." },
            { action: "Ζήτησε γραπτό καθορισμό αρμοδιότητας", response: "Πήρες συγκεκριμένη επιβεβαίωση για το ποιος πρέπει να ενεργήσει και κράτησες το ίχνος." },
            { action: "Σύγκρινε εμπειρίες στην αίθουσα", response: "Τρία άτομα βρίσκονται στον ίδιο κύκλο παραπομπών. Ένα μεμονωμένο λάθος αρχίζει να μοιάζει με μοτίβο." },
          ] },
          { prompt: "Δεν έχουμε καταγραφή ότι παραλάβαμε το έγγραφο.", detail: "Ένα κατατεθειμένο έγγραφο δεν φαίνεται πια στο σύστημα.", choices: [
            { action: "Κατάθεσε ξανά το ίδιο έγγραφο", response: "Το έγγραφο καταχωρίζεται ξανά. Εξηγείς ξανά γιατί υπάρχει." },
            { action: "Δείξε το αποδεικτικό που κράτησες", response: "Το αποδεικτικό γίνεται δεκτό. Για πρώτη φορά η υπόθεση προχωρά χωρίς νέα κατάθεση." },
            { action: "Απέσυρε μέρος του αιτήματος", response: "Η υπόθεση γίνεται ευκολότερη. Μέρος της προστασίας που ζήτησες δεν περιλαμβάνεται πλέον." },
          ] },
          { prompt: "Το σύστημα δεν λειτουργεί.", detail: "Το γκισέ είναι ανοιχτό. Τα αρχεία όχι.", choices: [
            { action: "Περίμενε ως το τέλος του ωραρίου", response: "Το σύστημα δεν επανήλθε. Έχασες μια ημέρα και εξήγησες ξανά τον λόγο της επίσκεψης." },
            { action: "Στείλε το έγγραφο γραπτώς", response: "Πήρες νέο αποδεικτικό. Το σύστημα παραμένει κλειστό, αλλά η κατάθεση δεν είναι πια αόρατη." },
            { action: "Φύγε πριν από νέα αναμονή", response: "Δεν έχασες όλη την ημέρα. Η κατάσταση έμεινε ασαφής." },
          ] },
        ],
      },
      {
        label: "Φάση 3 / Προθεσμία", title: "Προθεσμία", theme: "Οι προθεσμίες του θεσμού και ο χρόνος ενός ανθρώπου δεν είναι πια το ίδιο.", scenario: "Το ρολόι έκανε πολλούς κύκλους. Η οθόνη προχώρησε λίγους αριθμούς.",
        decisions: [
          { prompt: "Η προθεσμία δεν έχει ακόμη λήξει.", detail: "Αυτή είναι η μόνη πληροφορία για την υπόθεση.", choices: [
            { action: "Περίμενε τη νόμιμη προθεσμία", response: "Περνούν τρεις μήνες. Η προθεσμία γίνεται η ίδια η απάντηση αντί για όριο αδράνειας." },
            { action: "Στείλε γραπτή υπενθύμιση", response: "Η υπενθύμιση καταγράφηκε και πήρες πιο συγκεκριμένο ίχνος για το ποιος κρατά την υπόθεση." },
            { action: "Τηλεφώνησε ξανά", response: "Σου είπαν ότι η υπόθεση περιμένει υπογραφή. Δεν είπαν ποιανού ούτε από πότε." },
          ] },
          { prompt: "Η προθεσμία έληξε.", detail: "Απόφαση ακόμη δεν υπάρχει και το επόμενο βήμα απαιτεί νέο τεκμηριωμένο αίτημα.", choices: [
            { action: "Κατάθεσε σαφή προσφυγή με αποδεικτικά", response: "Η προσφυγή παραλήφθηκε. Για πρώτη φορά υπάρχει συγκεκριμένη δυνατότητα και απόδειξη της καθυστέρησης." },
            { action: "Κατάθεσε ξανά το αρχικό αίτημα", response: "Η υπόθεση καταχωρίζεται ξανά. Η προθεσμία αρχίζει από τη νέα ημερομηνία." },
            { action: "Δέξου την προφορική διαβεβαίωση ότι η απόφαση πλησιάζει", response: "Δεν συνέταξες νέα προσφυγή. Δεν υπάρχει απόδειξη ότι η απόφαση είναι πράγματι πιο κοντά." },
          ] },
          { prompt: "Η υπόθεση περιμένει υπογραφή.", detail: "Η κατάσταση δεν αλλάζει. Δεν ξέρεις αν υπάρχει απόφαση.", choices: [
            { action: "Ζήτησε νομική στήριξη", response: "Έχεις σαφέστερο χάρτη των βημάτων και κάποιον να τα παρακολουθεί μαζί σου." },
            { action: "Συνέχισε να τηλεφωνείς", response: "Δύο κλήσεις έδωσαν την ίδια διαδικαστική απάντηση. Η υπογραφή παραμένει χωρίς ημερομηνία." },
            { action: "Φύγε για σήμερα", response: "Κράτησες λίγη δύναμη. Η υπογραφή δεν εμφανίστηκε." },
          ] },
          { prompt: "Λένε ότι η απόφαση έχει συνταχθεί.", detail: "Δεν μπορείς να τη δεις πριν ολοκληρωθεί η κοινοποίηση.", choices: [
            { action: "Ζήτησε αντίγραφο και απόδειξη κοινοποίησης", response: "Πήρες συγκεκριμένο έγγραφο. Η διαδικασία προχώρησε πραγματικά, αλλά τρεις μήνες αργότερα." },
            { action: "Κλείσε χωρίς αναγνώριση ευθύνης", response: "Θα λάβεις άμεσα περιορισμένη λύση. Ο λόγος που ήρθες μένει αναπάντητος." },
            { action: "Μοιράσου την καθυστέρηση με τους άλλους", response: "Η ίδια κατάσταση περιμένει υπογραφή σε πολλούς φακέλους. Η καθυστέρηση δεν είναι πια μόνο η δική σου ημερομηνία." },
          ] },
        ],
      },
      {
        label: "Φάση 4 / Αίθουσα αναμονής", title: "Αίθουσα αναμονής", theme: "Δεν βλέπεις πια μόνο τη δική σου υπόθεση. Βλέπεις την απάντηση που επαναλαμβάνεται.", scenario: "Περισσότερες καρέκλες είναι άδειες. Όχι επειδή όλοι πήραν αυτό που ζήτησαν.",
        decisions: [
          { prompt: "Αναγνωρίζεις τις ίδιες φράσεις σε διαφορετικές υποθέσεις.", detail: "Το ερώτημα δεν είναι πια μόνο πού βρίσκεται ο δικός σου φάκελος.", choices: [
            { action: "Σύγκρινε τις γραπτές απαντήσεις", response: "Ημερομηνίες και διατυπώσεις δείχνουν επανάληψη που μπορεί να τεκμηριωθεί." },
            { action: "Ασχολήσου μόνο με τη δική σου υπόθεση", response: "Η υπόθεση μένει ενεργή, αλλά οι εμπειρίες των άλλων παραμένουν χωριστές." },
            { action: "Φύγε για σήμερα", response: "Κράτησες λίγη δύναμη. Η αίθουσα συνέχισε χωρίς νέο ίχνος." },
          ] },
          { prompt: "Τα αποδεικτικά λένε την ίδια ιστορία.", detail: "Μπορούν να μείνουν χωριστά χαρτιά ή να γίνουν ακολουθία.", choices: [
            { action: "Συγκέντρωσε αντίγραφα με συναίνεση", response: "Διατηρήθηκαν πολλά ίχνη κατάθεσης χωρίς να εκτεθούν ξένες υποθέσεις." },
            { action: "Θέσε δημόσια το ερώτημα του μοτίβου αναμονής", response: "Ο θεσμός πρέπει να απαντήσει σε ένα μοτίβο, όχι μόνο σε έναν αριθμό." },
            { action: "Δέξου μερική λύση για τη δική σου υπόθεση", response: "Η υπόθεσή σου προχώρησε. Η αιτία του προβλήματος και οι εμπειρίες των άλλων έμειναν εκτός." },
          ] },
          { prompt: "Η αίθουσα μπορεί τώρα να μιλήσει συλλογικά.", detail: "Αυτό δεν εγγυάται απόφαση, αλλά αλλάζει ό,τι μπορεί ακόμη να αμφισβητηθεί εύκολα.", choices: [
            { action: "Στείλτε κοινό τεκμηριωμένο αίτημα", response: "Πολλές υποθέσεις συνδέθηκαν με ημερομηνίες, αποδεικτικά και ίδιες απαντήσεις." },
            { action: "Ζητήστε κοινή νομική στήριξη", response: "Οι άνθρωποι δεν σηκώνουν πια μόνοι τη διαδικασία. Ανοίγει πιο συγκεκριμένος δρόμος ελέγχου." },
            { action: "Δέξου γρήγορη μερική απάντηση μόνο για σένα", response: "Η υπόθεσή σου κλείνει. Το κοινό μοτίβο χάνει το ίχνος σου." },
          ] },
          { prompt: "Μένει μία τελευταία απόφαση για το τι θα διατηρήσεις.", detail: "Η υπόθεση μπορεί να μείνει ενεργή, να κλείσει ή να γίνει μέρος ευρύτερης απόδειξης.", choices: [
            { action: "Τεκμηρίωσε το μοτίβο με στήριξη και προστασία", response: "Η αίθουσα δεν έλυσε όλες τις υποθέσεις. Η επανάληψή τους όμως δεν είναι πια αόρατη." },
            { action: "Κράτησε την υπόθεση ενεργή μέχρι την κοινοποίηση", response: "Η υπόθεση έμεινε στη διαδικασία και τελικά προχώρησε. Ο χρόνος μετριέται σε χρόνια." },
            { action: "Κλείσε την υπόθεση με ανεπαρκή λύση", response: "Η αναμονή τελειώνει. Η λύση δεν καλύπτει τον αρχικό λόγο της διαδικασίας." },
            { action: "Αποχώρησε επειδή δεν έχεις άλλη αντοχή", response: "Η υπόθεση μένει τυπικά ανοιχτή. Δεν έχεις δύναμη για ακόμη έναν κύκλο." },
          ] },
        ],
      },
    ],
    contextEyebrow: "Πίσω από τη διαδικασία",
    contextTitle: "Τι μόλις συνέβη;",
    contextIntro: "Η θεσμική εξάντληση δεν μοιάζει πάντα με ανοιχτή απόρριψη. Συχνά αποτελείται από επαναλήψεις, συμπληρώσεις, προθεσμίες, παραπομπές και αναμονή που καταναλώνει χρόνο, χρήματα, υγεία και δύναμη. Τυπικά, η υπόθεση εξακολουθεί να υπάρχει. Στην πραγματική ζωή, η δυνατότητα προστασίας μπορεί να χαθεί πολύ πριν ολοκληρωθεί η διαδικασία.",
    contextCards: [
      { title: "Αναμονή", copy: "Ο χρόνος δεν είναι ουδέτερος. Για τον θεσμό είναι προθεσμία. Για έναν άνθρωπο είναι μέρος της ζωής που δεν επιστρέφει." },
      { title: "Επανάληψη", copy: "Ο άνθρωπος εξηγεί ξανά το ίδιο, φέρνει τα ίδια χαρτιά και αποδεικνύει ότι το πρόβλημα εξακολουθεί να υπάρχει." },
      { title: "Μοτίβο", copy: "Μία υπόθεση μπορεί να φαίνεται μεμονωμένη. Όταν η ίδια απάντηση δίνεται σε δεκάδες ανθρώπους, η αίθουσα αναμονής γίνεται απόδειξη του συστήματος." },
    ],
    disclaimer: "Η προσομοίωση είναι μια μυθοπλαστική διαδραστική μορφή βασισμένη σε μοτίβα θεσμικής αναμονής. Δεν αποτελεί συγκεκριμένη νομική υπόθεση ούτε νομική συμβουλή.",
    listingSeoDescription: "Διαδραστικές μορφές της Avangarda για την εξουσία, το πεδίο, τους θεσμούς και τις συνέπειες των αποφάσεων.",
    seoDescription: "Μια διαδραστική προσομοίωση για την αναμονή, την αξιοπρέπεια, τον χρόνο και τη θεσμική εξάντληση.",
    timeUnits: { dayOne: "ημέρα", dayMany: "ημέρες", monthOne: "μήνας", monthMany: "μήνες", yearOne: "έτος", yearMany: "έτη" },
    screenReaderRoomLabel: "Αίθουσα αναμονής με σειρές καθισμάτων, γκισέ πίσω από θαμπό γυαλί, ρολόι τοίχου και οθόνη αριθμών.",
    screenReaderClockLabel: "Το ρολόι τοίχου αναπαριστά τον χρόνο ζωής που πέρασε.",
    screenReaderQueueLabel: "Ο αριθμός προχωρά πολύ πιο αργά από το ρολόι.",
    screenReaderEmptySeatLabel: "Μια άδεια θέση ανήκει σε άνθρωπο που δεν επιστρέφει πια.",
  },
  ar: {
    sectionLabel: "تفاعلي",
    collectionTitle: "صيغ تفاعلية",
    collectionIntro: "ادخل إلى النظام والميدان والمؤسسة من الداخل. توجد خيارات، لكن عواقبها لا تبقى على الشاشة.",
    gameTitle: "غرفة الانتظار",
    gameSubtitle: "لم يرفضوك. لقد تركوك فقط تنتظر.",
    typeLabel: "محاكاة مؤسسية",
    durationLabel: "المدة",
    durationValue: "7–10 دقائق",
    openLabel: "افتح",
    startLabel: "خذ رقمًا",
    continueLabel: "واصل الانتظار",
    backLabel: "العودة إلى التفاعلي",
    understandLabel: "ماذا حدث للتو؟",
    restartLabel: "ابدأ من جديد",
    shareLabel: "شارك المحاكاة",
    shareCopiedLabel: "تم نسخ الرابط.",
    shareUnavailableLabel: "تعذر نسخ الرابط.",
    decisionLabel: "قرار",
    choicesLabel: "ماذا ستفعل؟",
    metersLabel: "الحالة الشخصية",
    patienceLabel: "الصبر",
    dignityLabel: "الكرامة",
    timeLabel: "الوقت المنقضي",
    formalLabel: "الحركة الشكلية",
    realLabel: "التقدم الفعلي",
    statusLabel: "حالة الملف",
    logLabel: "سجل الإجراء",
    connectionLabel: "الترابط",
    receiptsLabel: "إيصالات التسليم المحفوظة",
    patternsLabel: "الأنماط المتكررة",
    departuresLabel: "أشخاص لم يعودوا يأتون",
    queueYourNumberLabel: "رقمك",
    queueServingLabel: "الرقم الجاري خدمته",
    queueWaitingLabel: "يرجى الانتظار",
    welcomeLines: ["مرحبًا.", "قضيتك مهمة.", "يرجى الانتظار."],
    caseLabel: "الملف",
    caseTypes: ["بلاغ بشأن حق مهدد", "طلب حماية", "تظلم من قرار", "دليل لم تتسلمه المؤسسة بعد", "طلب الوصول إلى خدمة", "ملف أعيد مرة من قبل"],
    monitorMessages: ["يرجى الانتظار.", "طلبك قيد الإجراء.", "سيتم إبلاغك.", "المهلة لم تنته بعد.", "ستتواصل معك الجهة المختصة."],
    statuses: { received: "تم الاستلام", checking: "قيد المراجعة", supplement: "مطلوب استكمال الوثائق", forwarded: "تمت الإحالة", missing: "غير موجود في النظام", reentered: "أعيد تسجيله", deadlineOpen: "المهلة لم تنته", deadlineExpired: "انتهت المهلة", signature: "بانتظار التوقيع", returned: "أعيد للاستكمال", inProgress: "قيد المعالجة", decisionDrafted: "أُعد القرار", delivery: "التبليغ جارٍ" },
    requirementLabels: {
      patience: "لم تعد لديك طاقة كافية لهذه الخطوة.",
      dignity: "يتطلب هذا الخيار شعورًا بالأمان أضعفته الإجراءات.",
      receipts: "عليك أولًا حفظ دليل على التسليم.",
      connection: "لا تعرف بعد ما يكفي عن تجارب الآخرين.",
      patterns: "لم يوثق النمط بما يكفي بعد.",
      support: "يلزم دعم قانوني أو علني أو جماعي.",
    },
    people: {
      "31": { label: "الرقم 31", departure: "لم يعد الرقم 31. لم يكن يملك ثمن تذكرة حافلة أخرى." },
      "38": { label: "الرقم 38", departure: "توقفت صاحبة الرقم 38 عن الحضور. لم تستطع أخذ يوم إجازة آخر." },
      "42": { label: "الرقم 42", departure: "حصل الرقم 42 على قرار. وصل بعد أن فقد قدرته على مساعدته." },
      "45": { label: "الرقم 45", departure: "أخذ الرقم 45 ملفه إلى المنزل. وثيقة إضافية كانت ستعني شهرًا آخر من الانتظار." },
      "53": { label: "الرقم 53", departure: "لم يعد الرقم 53. في ثلاث زيارات كان النظام متوقفًا." },
    },
    endings: {
      evidence: { eyebrow: "تم توثيق النمط", title: "تحولت غرفة الانتظار إلى دليل", copy: "من السهل أن يضيع ملف واحد. أما التجارب والإيصالات والردود المتكررة فتظهر الآن أن المشكلة ليست فردية.", note: "قد لا يكون الإجراء قد انتهى. لكن لم يعد من السهل تقديم الانتظار على أنه مصادفة." },
      compromise: { eyebrow: "أغلق الملف", title: "تسوية سيئة", copy: "قبلت نتيجة لا تعالج السبب الذي جئت من أجله.", note: "انتهى الإجراء أسرع، لكن الحق الذي بدأ بسببه بقي محميًا جزئيًا فقط." },
      exhausted: { eyebrow: "الملف ما زال نشطًا", title: "مُنهك", copy: "لم تخسر قضيتك. لم تعد تملك القوة لتبقى طرفًا في الإجراء.", note: "شكليًا، ما زال الباب مفتوحًا. فعليًا، لم تعد قادرًا على الاقتراب منه مرة أخرى." },
      late: { eyebrow: "سيصدر قرار", title: "قُبل بعد فوات الأوان", copy: "حُفظ الملف شكليًا وحقق أخيرًا تقدمًا فعليًا.", note: "تصل الحماية بعد الوقت الذي كانت فيه أشد ضرورة." },
      ongoing: { eyebrow: "لا قرار نهائي", title: "الملف ما زال قيد الإجراء", copy: "شكليًا، لم ينته الإجراء.", note: "في الحياة الفعلية، يستمر الانتظار." },
    },
    resultStats: { totalTime: "الوقت الإجمالي", visits: "الزيارات", calls: "المكالمات", supplements: "استكمالات الوثائق", redirects: "الإحالات", retellings: "مرات إعادة الشرح", proceduralResponses: "الردود الإجرائية", concreteInformation: "المعلومات الملموسة", peopleLeft: "الأشخاص الذين غادروا", patience: "الصبر المتبقي", dignity: "الكرامة المتبقية", formalMovement: "التغييرات الشكلية", realMovement: "خطوات التقدم الفعلية" },
    phases: [
      {
        label: "المرحلة 1 / الرقم", title: "الرقم", theme: "يبدو الدور واضحًا. ما زلت تظن أن للإجراء منطقًا.", scenario: "دخلت وأخذت الرقم 47 وجلست. تعرض الشاشة الرقم 12.",
        decisions: [
          { prompt: "لا يوجد بعد أثر واضح لملفك في النظام.", detail: "الشباك مفتوح، لكن الدور لا يتحرك.", choices: [
            { action: "اذهب إلى الشباك واشرح القضية", response: "استمعوا إليك وأضافوا ملاحظة. تغيرت الحالة، لكنك لم تحصل على معلومة جديدة." },
            { action: "أرسل طلبًا مكتوبًا واحتفظ بالإيصال", response: "تم استلام الطلب. لديك للمرة الأولى أثر لا يعتمد على ذاكرة الموظف." },
            { action: "تحدث مع من ينتظرون قبلك", response: "سمعت البداية نفسها في ثلاثة ملفات مختلفة. لم يعد الدور يبدو فرديًا تمامًا." },
          ] },
          { prompt: "تسأل أين يوجد الملف.", detail: "تختلف الإجابة بحسب القناة التي تبحث من خلالها.", choices: [
            { action: "اتصل بالمؤسسة", response: "تؤكد رسالة آلية أن الطلب قيد الإجراء. لا تقول أين يوجد." },
            { action: "عد إلى الشباك", response: "لا يجدون الملف بالبيانات التي قدمتها سابقًا." },
            { action: "رتب دليل التسليم واحتفظ به", response: "لا يقدم الإيصال الدور، لكنه يضيق مجال القول إن الوثيقة لم تصل." },
          ] },
          { prompt: "تحصل على أول حالة شكلية.", detail: "تفيد بأن المهلة لم تنته، ولا تقول ماذا يجري خلالها.", choices: [
            { action: "انتظر انتهاء المهلة", response: "يمر شهر. تبدو الحالة منظمة، بينما يبقى التقدم الفعلي كما هو." },
            { action: "اطلب رقم الملف وموقعه الدقيق في الإجراء", response: "أعيد تسجيل الملف وحصلت على رقم يمكنك ذكره في المرة المقبلة." },
            { action: "غادر اليوم وحافظ على طاقتك", response: "غادرت قبل محادثة جديدة. لم يتحرك الملف، لكنك لم تعد شرح كل شيء اليوم." },
          ] },
          { prompt: "أحيل الملف إلى وحدة أخرى.", detail: "تبدو الإحالة تقدمًا، لكن الاختصاص لم يتأكد.", choices: [
            { action: "قدم نسخة أخرى من الوثائق نفسها", response: "ازداد الملف سماكة. تم استلام الوثائق، ولم يشرح أحد سبب الحاجة إلى نسخة مكررة." },
            { action: "اطلب تأكيدًا مكتوبًا للاختصاص", response: "حصلت على اسم الوحدة وتأكيد بأنها ملزمة بالنظر في الملف." },
            { action: "اقبل وعدًا شفهيًا بأنهم سيتصلون", response: "كانت المحادثة أقصر. لا يوجد سجل لما وُعدت به." },
          ] },
        ],
      },
      {
        label: "المرحلة 2 / الاستكمال", title: "الاستكمال", theme: "تُطلب المعلومات نفسها مرة أخرى. تفتح كل ورقة جديدة مجالًا للورقة التالية.", scenario: "تقدمت الشاشة رقمًا واحدًا. أصبح الملف أكثر سماكة مما كان عند دخولك.",
        decisions: [
          { prompt: "تنقص وثيقة أخرى.", detail: "لم تكن في القائمة الأولى، لكن الملف لن يُنظر فيه من دونها.", choices: [
            { action: "اجمع الوثيقة واستكمل الملف", response: "سُجل الاستكمال. أصبح الملف أكمل شكليًا، مقابل يوم عمل ضائع آخر." },
            { action: "اطلب مساعدة قانونية قبل تسليم جديد", response: "قرأ أحدهم التسلسل كاملًا للمرة الأولى. لم تعد وحدك، لكن مزيدًا من الوقت مر." },
            { action: "غادر اليوم", response: "احتفظت ببعض طاقتك. لم تتغير قائمة الوثائق." },
          ] },
          { prompt: "هذا ليس من اختصاصنا.", detail: "ترسلك الجهة التي استلمت الملف إلى الجهة التي أعادته سابقًا.", choices: [
            { action: "اذهب إلى الجهة الأخرى", response: "شرحت القصة نفسها في مكان جديد. أحيل الملف ولم يتضح مساره." },
            { action: "اطلب تحديد الاختصاص كتابة", response: "حصلت على تأكيد ملموس للجهة التي يجب أن تتصرف وحفظت أثره." },
            { action: "قارن التجارب مع الآخرين في الغرفة", response: "ثلاثة أشخاص يدورون في دائرة الإحالة نفسها. يبدأ الخطأ الفردي بالظهور كنمط." },
          ] },
          { prompt: "لا يوجد لدينا سجل باستلام الوثيقة.", detail: "لم تعد وثيقة قدمتها ظاهرة في النظام.", choices: [
            { action: "قدم الوثيقة نفسها مرة أخرى", response: "أعيد تسجيل الوثيقة. شرحت مرة أخرى سبب وجودها." },
            { action: "أبرز الإيصال المحفوظ", response: "تم قبول الإيصال. تحرك الملف للمرة الأولى من دون تقديم جديد." },
            { action: "اسحب جزءًا من الطلب ليمر الباقي", response: "أصبح الملف أسهل للمعالجة. خرج جزء من الحماية التي جئت من أجلها." },
          ] },
          { prompt: "النظام متوقف حاليًا.", detail: "الشباك مفتوح. السجلات ليست كذلك.", choices: [
            { action: "انتظر حتى نهاية الدوام", response: "لم يعد النظام. خسرت يومًا وأعدت شرح سبب حضورك." },
            { action: "أرسل الوثيقة كتابة", response: "حصلت على إيصال جديد. النظام ما زال متوقفًا، لكن التسليم لم يعد غير مرئي." },
            { action: "غادر قبل انتظار آخر", response: "لم تخسر اليوم كاملًا. بقيت حالة الملف غامضة." },
          ] },
        ],
      },
      {
        label: "المرحلة 3 / المهلة", title: "المهلة", theme: "لم تعد مهل المؤسسة ووقت الإنسان شيئًا واحدًا.", scenario: "دار عقرب الساعة دورات كثيرة. تقدمت الشاشة أرقامًا قليلة فقط.",
        decisions: [
          { prompt: "المهلة لم تنته بعد.", detail: "هذه هي المعلومة الوحيدة التي تحصل عليها عن الملف.", choices: [
            { action: "انتظر المهلة القانونية", response: "تمر ثلاثة أشهر. تصبح المهلة مضمون الرد بدل أن تكون حدًا لعدم التحرك." },
            { action: "أرسل مطالبة مكتوبة بالتعجيل", response: "سُجلت المطالبة وحصلت على أثر أوضح للجهة التي تحتفظ بالملف." },
            { action: "اتصل مرة أخرى", response: "قيل لك إن الملف ينتظر توقيعًا. لم يحدد أحد توقيع من ولا منذ متى." },
          ] },
          { prompt: "انتهت المهلة.", detail: "لا يوجد قرار بعد، والخطوة التالية تتطلب طلبًا موثقًا آخر.", choices: [
            { action: "قدم تظلمًا دقيقًا مع الإيصالات", response: "تم استلام التظلم. توجد للمرة الأولى إمكانية قانونية واضحة ودليل على تجاوز المهلة." },
            { action: "قدم الطلب الأصلي من جديد", response: "أعيد تسجيل الملف. تبدأ المهلة من التاريخ الجديد." },
            { action: "اقبل تطمينًا شفهيًا بأن القرار قريب", response: "لم تعد تكتب تظلمًا جديدًا. لا دليل على أن القرار أصبح أقرب فعلًا." },
          ] },
          { prompt: "الملف ينتظر التوقيع.", detail: "لا تتغير الحالة. لا تعرف إن كان القرار موجودًا.", choices: [
            { action: "أدخل دعمًا قانونيًا", response: "حصلت على صورة أوضح للخطوات وعلى شخص يتابعها معك." },
            { action: "واصل الاتصال", response: "أعطت مكالمتان الرد الإجرائي نفسه. لا يزال التوقيع بلا تاريخ." },
            { action: "غادر اليوم", response: "حافظت على بعض طاقتك. لم يظهر التوقيع." },
          ] },
          { prompt: "يقولون إن القرار أُعد.", detail: "لا يمكنك رؤيته قبل اكتمال التبليغ.", choices: [
            { action: "اطلب نسخة ودليلًا على التبليغ", response: "حصلت على وثيقة ملموسة. تحرك الإجراء فعليًا، لكن بعد ثلاثة أشهر أخرى." },
            { action: "أغلق الملف بلا اعتراف بالمسؤولية", response: "ستحصل فورًا على نتيجة محدودة. يبقى سبب حضورك بلا جواب." },
            { action: "شارك تجربة التأخير مع الآخرين", response: "الحالة نفسها تنتظر التوقيع في ملفات عدة. لم يعد التأخير تاريخك وحدك." },
          ] },
        ],
      },
      {
        label: "المرحلة 4 / غرفة الانتظار", title: "غرفة الانتظار", theme: "لم تعد ترى ملفك وحده. ترى الرد الذي يتكرر.", scenario: "ازداد عدد المقاعد الفارغة، وليس لأن الجميع حصلوا على ما جاؤوا من أجله.",
        decisions: [
          { prompt: "تتعرف إلى العبارات نفسها في ملفات مختلفة.", detail: "لم يعد السؤال فقط أين يوجد ملفك.", choices: [
            { action: "قارن الردود المكتوبة", response: "تكشف التواريخ والصياغات تكرارًا يمكن توثيقه." },
            { action: "ركز على ملفك وحده", response: "يبقى الملف نشطًا، وتبقى تجارب الآخرين منفصلة." },
            { action: "غادر اليوم", response: "احتفظت ببعض طاقتك. استمرت الغرفة من دون أثر جديد." },
          ] },
          { prompt: "تحكي الإيصالات القصة نفسها.", detail: "يمكن أن تبقى أوراقًا منفصلة أو تصبح تسلسلًا.", choices: [
            { action: "اجمع نسخ الإيصالات بموافقة أصحابها", response: "حُفظت آثار عدة للتسليم من دون كشف ملفات الآخرين." },
            { action: "اطرح علنًا سؤال نمط الانتظار", response: "على المؤسسة أن تجيب عن نمط، لا عن رقم واحد في الدور." },
            { action: "اقبل نتيجة جزئية لملفك", response: "تحرك ملفك. بقي سبب المشكلة وتجارب الآخرين خارج الحل." },
          ] },
          { prompt: "تستطيع غرفة الانتظار الآن أن تتحدث جماعيًا.", detail: "هذا لا يضمن قرارًا، لكنه يغير ما يمكن إنكاره بسهولة.", choices: [
            { action: "أرسلوا طلبًا جماعيًا موثقًا", response: "ارتبطت ملفات عدة بالتواريخ والإيصالات والردود المتطابقة." },
            { action: "اطلبوا دعمًا قانونيًا مشتركًا", response: "لم يعد الناس يحملون الإجراء منفردين. انفتح طريق أوضح للمراجعة." },
            { action: "اقبل جوابًا جزئيًا سريعًا لنفسك فقط", response: "يغلق ملفك. يفقد النمط الجماعي أثرك." },
          ] },
          { prompt: "تبقى خطوة أخيرة بشأن ما ستحفظه.", detail: "يمكن أن يبقى الملف نشطًا أو يغلق أو يصبح جزءًا من دليل أوسع.", choices: [
            { action: "وثق النمط مع الدعم وحماية الناس", response: "لم تحل الغرفة كل الملفات، لكن تكرارها لم يعد غير مرئي." },
            { action: "أبق الملف نشطًا حتى التبليغ", response: "بقي الملف في الإجراء وتقدم أخيرًا. صار الوقت يقاس بالسنوات." },
            { action: "أغلق الملف بنتيجة ضعيفة", response: "ينتهي الانتظار. لا تغطي النتيجة سبب بدء الإجراء." },
            { action: "انسحب لأنك لم تعد قادرًا على الاستمرار", response: "يبقى الملف مفتوحًا شكليًا. لم تعد تملك القوة لدورة أخرى." },
          ] },
        ],
      },
    ],
    contextEyebrow: "خلف الإجراء",
    contextTitle: "ماذا حدث للتو؟",
    contextIntro: "لا يبدو الاستنزاف المؤسسي دائمًا كرفض صريح. غالبًا ما يتكون من التكرار، واستكمال الوثائق، والمهل، والإحالات، وانتظار يستهلك وقت الإنسان وماله وصحته وقوته. شكليًا، ما زال الملف موجودًا. في الحياة الفعلية، قد تختفي إمكانية الحماية قبل وقت طويل من انتهاء الإجراء.",
    contextCards: [
      { title: "الانتظار", copy: "الوقت ليس محايدًا. هو مهلة بالنسبة إلى المؤسسة، وجزء من الحياة لا يعود بالنسبة إلى الإنسان." },
      { title: "التكرار", copy: "يشرح الإنسان الشيء نفسه مرارًا، ويحضر الأوراق نفسها، ويثبت أن المشكلة ما زالت قائمة." },
      { title: "النمط", copy: "قد يبدو ملف واحد مشكلة فردية. عندما يتكرر الرد نفسه مع عشرات الناس، تصبح غرفة الانتظار دليلًا على النظام." },
    ],
    disclaimer: "هذه المحاكاة صيغة تفاعلية خيالية تستند إلى أنماط الانتظار المؤسسي. لا تمثل قضية قانونية محددة ولا تقدم مشورة قانونية.",
    listingSeoDescription: "صيغ Avangarda التفاعلية عن السلطة والميدان والمؤسسات وعواقب القرارات.",
    seoDescription: "محاكاة تفاعلية عن الانتظار والكرامة والوقت والاستنزاف المؤسسي.",
    timeUnits: { dayOne: "يوم", dayMany: "يومًا", monthOne: "شهر", monthMany: "شهرًا", yearOne: "سنة", yearMany: "سنوات" },
    screenReaderRoomLabel: "غرفة انتظار فيها صفوف مقاعد وشباك خلف زجاج معتم وساعة حائط وشاشة أرقام.",
    screenReaderClockLabel: "تمثل ساعة الحائط وقت الحياة الذي انقضى.",
    screenReaderQueueLabel: "يتقدم رقم الدور أبطأ بكثير من الساعة.",
    screenReaderEmptySeatLabel: "المقعد الفارغ يعود إلى شخص لم يعد يأتي.",
  },
};

function assertLocaleStructure(lang: Lang, locale: WaitingRoomLocaleCopy) {
  if (locale.phases.length !== mechanics.length) {
    throw new Error(`Waiting Room translation ${lang} has an invalid phase count.`);
  }

  mechanics.forEach((phase, phaseIndex) => {
    const localizedPhase = locale.phases[phaseIndex];
    if (localizedPhase.decisions.length !== phase.decisions.length) {
      throw new Error(`Waiting Room translation ${lang} has an invalid decision count in phase ${phase.id}.`);
    }

    phase.decisions.forEach((decision, decisionIndex) => {
      if (localizedPhase.decisions[decisionIndex].choices.length !== decision.choices.length) {
        throw new Error(`Waiting Room translation ${lang} has an invalid choice count for ${decision.id}.`);
      }
    });
  });
}

function buildCopy(lang: Lang): WaitingRoomCopy {
  const locale = localeCopy[lang];
  assertLocaleStructure(lang, locale);

  const phases = mechanics.map((phase, phaseIndex): WaitingRoomPhase => {
    const localizedPhase = locale.phases[phaseIndex];
    return {
      id: phase.id,
      label: localizedPhase.label,
      title: localizedPhase.title,
      theme: localizedPhase.theme,
      scenario: localizedPhase.scenario,
      decisions: phase.decisions.map((decision, decisionIndex) => {
        const localizedDecision = localizedPhase.decisions[decisionIndex];
        return {
          id: decision.id,
          prompt: localizedDecision.prompt,
          detail: localizedDecision.detail,
          choices: decision.choices.map((choice, choiceIndex) => ({
            ...choice,
            ...localizedDecision.choices[choiceIndex],
          })),
        };
      }),
    };
  });

  return { ...locale, phases };
}

const copyByLang = Object.fromEntries(
  (Object.keys(localeCopy) as Lang[]).map((lang) => [lang, buildCopy(lang)])
) as Record<Lang, WaitingRoomCopy>;

export function getWaitingRoomCopy(lang: Lang) {
  return copyByLang[lang];
}

export function getWaitingRoomSearchKeywords(lang: Lang) {
  const copy = getWaitingRoomCopy(lang);
  const shared = [
    "Čekaonica",
    "The Waiting Room",
    "čekanje",
    "institucija",
    "birokratija",
    "pravo",
    "postupak",
    "žalba",
    "dostojanstvo",
    "waiting",
    "bureaucracy",
    "institutional delay",
  ];

  return [
    ...shared,
    copy.gameTitle,
    copy.gameSubtitle,
    copy.typeLabel,
    copy.seoDescription,
    ...copy.caseTypes,
    ...Object.values(copy.statuses),
    ...copy.contextCards.flatMap((card) => [card.title, card.copy]),
  ];
}
