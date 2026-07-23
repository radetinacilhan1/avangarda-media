export const NEUTRAL_MAN_DECISION_IDS = [
  "public-insult",
  "activist-attack",
  "institutional-injustice",
  "revisionism",
  "media-lynch",
  "need-support",
] as const;

export type NeutralManDecisionId = (typeof NEUTRAL_MAN_DECISION_IDS)[number];
export type NeutralManChoiceKind = "boundary" | "private" | "neutral" | "impulsive";

export type NeutralManMetrics = {
  peace: number;
  reputation: number;
  solidarity: number;
  boundary: number;
};

export type NeutralManCounters = {
  publicSupport: number;
  privateSupport: number;
  neutralStatements: number;
  delayedResponses: number;
  clearBoundaries: number;
  passiveNormalization: number;
  impulsiveConflict: number;
  communityPresence: number;
};

export type NeutralManChoice = {
  id: string;
  kind: NeutralManChoiceKind;
  effects: Partial<NeutralManMetrics>;
  delayed?: boolean;
};

export type NeutralManDecision = {
  id: NeutralManDecisionId;
  choices: NeutralManChoice[];
};

export const NEUTRAL_MAN_DECISIONS: NeutralManDecision[] = NEUTRAL_MAN_DECISION_IDS.map((id) => ({
  id,
  choices: [
    {
      id: `${id}-boundary`,
      kind: "boundary",
      effects: { peace: -7, reputation: -2, solidarity: 10, boundary: -8 },
    },
    {
      id: `${id}-private`,
      kind: "private",
      effects: { peace: 3, reputation: 2, solidarity: 4, boundary: 4 },
    },
    {
      id: `${id}-neutral`,
      kind: "neutral",
      effects: { peace: 6, reputation: 5, solidarity: -7, boundary: 9 },
      delayed: id === "activist-attack" || id === "institutional-injustice" || id === "need-support",
    },
    {
      id: `${id}-impulsive`,
      kind: "impulsive",
      effects: { peace: -12, reputation: -9, solidarity: 2, boundary: 2 },
    },
  ],
}));

export const NEUTRAL_MAN_ENDING_IDS = [
  "entered-everything",
  "boundary-drawn",
  "private-only",
  "always-neutral",
  "uneasy-balance",
] as const;

export type NeutralManEndingId = (typeof NEUTRAL_MAN_ENDING_IDS)[number];
export type NeutralManStage = "intro" | "playing" | "result";

export type NeutralManLogEntry = {
  decisionId: NeutralManDecisionId;
  choiceKind: NeutralManChoiceKind;
  metrics: NeutralManMetrics;
};

export type NeutralManState = {
  stage: NeutralManStage;
  decisionIndex: number;
  metrics: NeutralManMetrics;
  counters: NeutralManCounters;
  log: NeutralManLogEntry[];
  endingId: NeutralManEndingId | null;
};

const INITIAL_METRICS: NeutralManMetrics = {
  peace: 70,
  reputation: 55,
  solidarity: 45,
  boundary: 30,
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function createInitialNeutralManState(): NeutralManState {
  return {
    stage: "intro",
    decisionIndex: 0,
    metrics: { ...INITIAL_METRICS },
    counters: {
      publicSupport: 0,
      privateSupport: 0,
      neutralStatements: 0,
      delayedResponses: 0,
      clearBoundaries: 0,
      passiveNormalization: 0,
      impulsiveConflict: 0,
      communityPresence: 8,
    },
    log: [],
    endingId: null,
  };
}

export function startNeutralManGame(state: NeutralManState): NeutralManState {
  return state.stage === "intro" ? { ...state, stage: "playing" } : state;
}

export function restartNeutralManGame() {
  return createInitialNeutralManState();
}

export function currentNeutralManDecision(state: NeutralManState) {
  return NEUTRAL_MAN_DECISIONS[state.decisionIndex] || null;
}

export function deriveNeutralManEnding(state: NeutralManState): NeutralManEndingId {
  const { metrics, counters } = state;

  // Active extremes are resolved first, then quieter forms of withdrawal.
  if (counters.impulsiveConflict >= 4 && metrics.peace <= 30 && metrics.reputation <= 30) {
    return "entered-everything";
  }
  if (
    counters.clearBoundaries >= 4 &&
    counters.impulsiveConflict <= 2 &&
    metrics.solidarity >= 70 &&
    metrics.boundary <= 35 &&
    metrics.peace >= 20
  ) {
    return "boundary-drawn";
  }
  if (
    counters.privateSupport >= 3 &&
    counters.publicSupport <= 2 &&
    metrics.solidarity < 72 &&
    metrics.boundary >= 45
  ) {
    return "private-only";
  }
  if (
    counters.neutralStatements + counters.delayedResponses >= 4 &&
    metrics.solidarity <= 38 &&
    metrics.boundary >= 62
  ) {
    return "always-neutral";
  }
  return "uneasy-balance";
}

export function applyNeutralManChoice(state: NeutralManState, choiceId: string): NeutralManState {
  if (state.stage !== "playing") return state;
  const decision = currentNeutralManDecision(state);
  const choice = decision?.choices.find((item) => item.id === choiceId);
  if (!decision || !choice) return state;

  const metrics: NeutralManMetrics = {
    peace: clamp(state.metrics.peace + (choice.effects.peace || 0)),
    reputation: clamp(state.metrics.reputation + (choice.effects.reputation || 0)),
    solidarity: clamp(state.metrics.solidarity + (choice.effects.solidarity || 0)),
    boundary: clamp(state.metrics.boundary + (choice.effects.boundary || 0)),
  };

  const counters = { ...state.counters };
  if (choice.kind === "boundary") {
    counters.publicSupport += 1;
    counters.clearBoundaries += 1;
    counters.communityPresence = Math.min(8, counters.communityPresence + 1);
  } else if (choice.kind === "private") {
    counters.privateSupport += 1;
  } else if (choice.kind === "neutral") {
    counters.neutralStatements += 1;
    counters.passiveNormalization += 1;
    counters.communityPresence = Math.max(1, counters.communityPresence - 1);
    if (choice.delayed) counters.delayedResponses += 1;
  } else {
    counters.publicSupport += 1;
    counters.impulsiveConflict += 1;
    counters.communityPresence = Math.max(2, counters.communityPresence - 1);
  }

  const decisionIndex = state.decisionIndex + 1;
  const next: NeutralManState = {
    ...state,
    decisionIndex,
    metrics,
    counters,
    log: [...state.log, { decisionId: decision.id, choiceKind: choice.kind, metrics }],
  };

  if (decisionIndex >= NEUTRAL_MAN_DECISIONS.length) {
    return { ...next, stage: "result", endingId: deriveNeutralManEnding(next) };
  }
  return next;
}

export function neutralManMirrorKind(state: NeutralManState): NeutralManChoiceKind {
  const scores: Array<[NeutralManChoiceKind, number]> = [
    ["neutral", state.counters.neutralStatements + state.counters.delayedResponses],
    ["private", state.counters.privateSupport],
    ["boundary", state.counters.clearBoundaries],
    ["impulsive", state.counters.impulsiveConflict],
  ];
  return scores.sort((a, b) => b[1] - a[1])[0][0];
}
