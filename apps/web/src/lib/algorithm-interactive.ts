export const ALGORITHM_TOPIC_IDS = [
  "river-pollution",
  "mining-research",
  "child-rights",
  "war-crime",
  "poverty",
  "police-violence",
  "hate-speech",
  "public-space",
] as const;

export type AlgorithmTopicId = (typeof ALGORITHM_TOPIC_IDS)[number];

export const ALGORITHM_FORMAT_IDS = ["analysis", "reel", "carousel", "newsletter", "raw", "combined"] as const;
export type AlgorithmFormatId = (typeof ALGORITHM_FORMAT_IDS)[number];

export const ALGORITHM_DECISION_IDS = [
  "day1-topic",
  "day1-angle",
  "day1-headline",
  "day1-publish",
  "day2-reaction",
  "day2-topic",
  "day2-publish",
  "day3-topic",
  "day3-protection",
  "day3-context",
  "day3-publish",
  "day4-pressure",
  "day4-backlog",
  "day4-publish",
  "day5-topic",
  "day5-headline",
  "day5-correction",
  "day5-publish",
] as const;

export type AlgorithmDecisionId = (typeof ALGORITHM_DECISION_IDS)[number];

export const ALGORITHM_CHOICE_IDS = [
  "river-first",
  "poverty-first",
  "space-first",
  "documents-angle",
  "daily-life-angle",
  "conflict-angle",
  "precise-headline",
  "question-headline",
  "shock-headline",
  "analysis-first",
  "combined-first",
  "reel-first",
  "rewrite-for-reach",
  "build-entry-format",
  "keep-original",
  "mining-second",
  "hate-second",
  "carousel-second",
  "newsletter-second",
  "raw-second",
  "child-sensitive",
  "war-sensitive",
  "police-sensitive",
  "protect-identity",
  "seek-consent",
  "minimal-redaction",
  "full-context",
  "careful-summary",
  "overclaim",
  "wait-verification",
  "publish-now",
  "source-first-newsletter",
  "follow-donor",
  "follow-platform",
  "serve-audience",
  "protect-newsroom",
  "backlog-public-interest",
  "backlog-fastest",
  "backlog-algorithm",
  "deep-fourth",
  "combined-fourth",
  "concise-fourth",
  "final-important",
  "final-reachable",
  "final-verifiable",
  "final-precise",
  "final-useful",
  "final-spike",
  "publish-correction",
  "add-source-note",
  "move-to-next-story",
  "combined-final",
  "analysis-final",
  "newsletter-final",
  "concise-final",
] as const;

export type AlgorithmChoiceId = (typeof ALGORITHM_CHOICE_IDS)[number];

export const ALGORITHM_EVENT_IDS = [
  "headline-outpaced-story",
  "short-opened-source",
  "verification-lost-cycle",
  "source-became-cautious",
  "newsletter-returned",
  "correction-limited",
  "trust-drag",
  "platform-boost",
  "steady-attention",
] as const;

export type AlgorithmEventId = (typeof ALGORITHM_EVENT_IDS)[number];

export const ALGORITHM_ENDING_IDS = [
  "visible-without-reason",
  "feed-moved-on",
  "truth-alone",
  "not-for-algorithm",
  "newsroom-survived",
  "still-in-feed",
] as const;

export type AlgorithmEndingId = (typeof ALGORITHM_ENDING_IDS)[number];

export type AlgorithmMetrics = {
  truth: number;
  reach: number;
  trust: number;
  capacity: number;
};

export type AlgorithmCounters = {
  sensational: number;
  contextLoss: number;
  responsibleCombos: number;
  corrections: number;
  protectedSources: number;
  sensitiveSources: number;
  compromises: number;
  delayed: number;
  deferred: number;
  stale: number;
  otherMedia: number;
};

export type AlgorithmAnalytics = {
  views: number;
  opens: number;
  completions: number;
  comments: number;
  shares: number;
  saves: number;
  reports: number;
  exits: number;
  sourceOpens: number;
  sharedWithoutSource: number;
};

export type AlgorithmTopicStatus = "pending" | "selected" | "published" | "deferred" | "other-media" | "stale";

export type AlgorithmDraft = {
  topicId: AlgorithmTopicId | null;
  format: AlgorithmFormatId;
  hook: number;
  context: number;
  verification: number;
  protectedSource: boolean;
  consent: boolean;
  delayed: boolean;
};

export type AlgorithmStory = {
  day: number;
  topicId: AlgorithmTopicId;
  format: AlgorithmFormatId;
  eventId: AlgorithmEventId;
  analytics: AlgorithmAnalytics;
  truthAtPublish: number;
  reachAtPublish: number;
  trustAtPublish: number;
  protectedSource: boolean;
};

export type AlgorithmLogEntry = {
  day: number;
  decisionId: AlgorithmDecisionId;
  choiceId: AlgorithmChoiceId;
  eventId?: AlgorithmEventId;
  metrics: AlgorithmMetrics;
};

export type AlgorithmStage = "intro" | "playing" | "result";

export type AlgorithmState = {
  stage: AlgorithmStage;
  decisionIndex: number;
  metrics: AlgorithmMetrics;
  counters: AlgorithmCounters;
  topicStatus: Record<AlgorithmTopicId, AlgorithmTopicStatus>;
  draft: AlgorithmDraft;
  stories: AlgorithmStory[];
  log: AlgorithmLogEntry[];
  lastEventId: AlgorithmEventId | null;
  endingId: AlgorithmEndingId | null;
};

type MetricEffects = Partial<AlgorithmMetrics>;

export type AlgorithmChoiceMechanic = {
  id: AlgorithmChoiceId;
  effects: MetricEffects;
};

export type AlgorithmDecisionMechanic = {
  id: AlgorithmDecisionId;
  day: 1 | 2 | 3 | 4 | 5;
  choiceIds: AlgorithmChoiceId[];
};

export type AlgorithmTopicMechanic = {
  id: AlgorithmTopicId;
  publicImportance: number;
  complexity: number;
  verificationNeed: number;
  simplificationRisk: number;
  emotionalPotential: number;
  algorithmPotential: number;
  harmRisk: number;
  sensitive: boolean;
};

export const ALGORITHM_TOPICS: Record<AlgorithmTopicId, AlgorithmTopicMechanic> = {
  "river-pollution": { id: "river-pollution", publicImportance: 8, complexity: 6, verificationNeed: 7, simplificationRisk: 5, emotionalPotential: 6, algorithmPotential: 6, harmRisk: 4, sensitive: false },
  "mining-research": { id: "mining-research", publicImportance: 9, complexity: 9, verificationNeed: 9, simplificationRisk: 8, emotionalPotential: 5, algorithmPotential: 5, harmRisk: 6, sensitive: false },
  "child-rights": { id: "child-rights", publicImportance: 10, complexity: 8, verificationNeed: 9, simplificationRisk: 9, emotionalPotential: 9, algorithmPotential: 8, harmRisk: 10, sensitive: true },
  "war-crime": { id: "war-crime", publicImportance: 10, complexity: 10, verificationNeed: 10, simplificationRisk: 10, emotionalPotential: 10, algorithmPotential: 9, harmRisk: 10, sensitive: true },
  poverty: { id: "poverty", publicImportance: 8, complexity: 7, verificationNeed: 6, simplificationRisk: 8, emotionalPotential: 7, algorithmPotential: 6, harmRisk: 7, sensitive: false },
  "police-violence": { id: "police-violence", publicImportance: 10, complexity: 8, verificationNeed: 9, simplificationRisk: 9, emotionalPotential: 10, algorithmPotential: 9, harmRisk: 10, sensitive: true },
  "hate-speech": { id: "hate-speech", publicImportance: 8, complexity: 7, verificationNeed: 7, simplificationRisk: 9, emotionalPotential: 9, algorithmPotential: 9, harmRisk: 8, sensitive: false },
  "public-space": { id: "public-space", publicImportance: 7, complexity: 5, verificationNeed: 5, simplificationRisk: 5, emotionalPotential: 5, algorithmPotential: 5, harmRisk: 3, sensitive: false },
};

const choice = (
  id: AlgorithmChoiceId,
  effects: MetricEffects,
): readonly [AlgorithmChoiceId, AlgorithmChoiceMechanic] => [id, { id, effects }];

export const ALGORITHM_CHOICES: Record<AlgorithmChoiceId, AlgorithmChoiceMechanic> = Object.fromEntries([
  choice("river-first", { truth: 2, capacity: -3 }),
  choice("poverty-first", { trust: 2, capacity: -2 }),
  choice("space-first", { reach: 2, capacity: -1 }),
  choice("documents-angle", { truth: 8, reach: -3, capacity: -7 }),
  choice("daily-life-angle", { truth: 3, reach: 3, trust: 2, capacity: -4 }),
  choice("conflict-angle", { truth: -5, reach: 8, trust: -3, capacity: -2 }),
  choice("precise-headline", { truth: 5, reach: -3, trust: 2, capacity: -1 }),
  choice("question-headline", { truth: 1, reach: 4, trust: 1, capacity: -1 }),
  choice("shock-headline", { truth: -8, reach: 12, trust: -6 }),
  choice("analysis-first", { truth: 6, reach: -4, trust: 2, capacity: -8 }),
  choice("combined-first", { truth: 4, reach: 8, trust: 4, capacity: -6 }),
  choice("reel-first", { truth: -7, reach: 12, trust: -4, capacity: -5 }),
  choice("rewrite-for-reach", { truth: -5, reach: 10, trust: -5, capacity: -2 }),
  choice("build-entry-format", { truth: 2, reach: 7, trust: 3, capacity: 2 }),
  choice("keep-original", { truth: 2, reach: -2, trust: 2, capacity: -2 }),
  choice("mining-second", { truth: 2, capacity: -4 }),
  choice("hate-second", { reach: 3, trust: -1, capacity: -2 }),
  choice("carousel-second", { truth: 3, reach: 7, trust: 2, capacity: -6 }),
  choice("newsletter-second", { truth: 4, trust: 6, capacity: 3 }),
  choice("raw-second", { truth: -4, reach: 10, trust: -5, capacity: -3 }),
  choice("child-sensitive", { truth: 2, trust: 2, capacity: -4 }),
  choice("war-sensitive", { truth: 3, reach: 2, capacity: -5 }),
  choice("police-sensitive", { reach: 3, trust: 1, capacity: -4 }),
  choice("protect-identity", { truth: 3, reach: -3, trust: 8, capacity: -8 }),
  choice("seek-consent", { truth: 5, reach: -2, trust: 7, capacity: -10 }),
  choice("minimal-redaction", { truth: -2, reach: 7, trust: -7, capacity: -3 }),
  choice("full-context", { truth: 8, reach: -5, trust: 6, capacity: -8 }),
  choice("careful-summary", { truth: 3, reach: 2, trust: 1, capacity: -4 }),
  choice("overclaim", { truth: -10, reach: 10, trust: -8, capacity: -1 }),
  choice("wait-verification", { truth: 7, reach: -9, trust: 4, capacity: -8 }),
  choice("publish-now", { truth: -3, reach: 7, trust: -2, capacity: -2 }),
  choice("source-first-newsletter", { truth: 6, reach: -3, trust: 7, capacity: -9 }),
  choice("follow-donor", { truth: -5, reach: 8, trust: -4, capacity: 4 }),
  choice("follow-platform", { truth: -3, reach: 10, trust: -2, capacity: -5 }),
  choice("serve-audience", { truth: 2, reach: 2, trust: 5, capacity: -7 }),
  choice("protect-newsroom", { reach: -5, trust: 2, capacity: 8 }),
  choice("backlog-public-interest", { truth: 4, reach: -2, capacity: -5 }),
  choice("backlog-fastest", { truth: -2, reach: 3, capacity: 1 }),
  choice("backlog-algorithm", { truth: -3, reach: 7, trust: -2, capacity: -2 }),
  choice("deep-fourth", { truth: 7, reach: -3, trust: 3, capacity: -10 }),
  choice("combined-fourth", { truth: 4, reach: 7, trust: 3, capacity: -5 }),
  choice("concise-fourth", { truth: -2, reach: 5, trust: -1, capacity: -4 }),
  choice("final-important", { truth: 5, reach: -2, capacity: -5 }),
  choice("final-reachable", { truth: -2, reach: 6, trust: -2, capacity: -2 }),
  choice("final-verifiable", { truth: 4, trust: 3, capacity: -4 }),
  choice("final-precise", { truth: 4, reach: -2, trust: 3, capacity: -1 }),
  choice("final-useful", { truth: 2, reach: 4, trust: 4, capacity: -2 }),
  choice("final-spike", { truth: -7, reach: 12, trust: -7 }),
  choice("publish-correction", { truth: 8, reach: -5, trust: 5, capacity: -8 }),
  choice("add-source-note", { truth: 5, reach: -1, trust: 5, capacity: -5 }),
  choice("move-to-next-story", { truth: -2, reach: 6, trust: -1, capacity: -3 }),
  choice("combined-final", { truth: 4, reach: 7, trust: 4, capacity: -5 }),
  choice("analysis-final", { truth: 7, reach: -5, trust: 3, capacity: -9 }),
  choice("newsletter-final", { truth: 4, reach: 1, trust: 7, capacity: -6 }),
  choice("concise-final", { truth: -3, reach: 6, trust: -1, capacity: -3 }),
]) as Record<AlgorithmChoiceId, AlgorithmChoiceMechanic>;

export const ALGORITHM_DECISIONS: AlgorithmDecisionMechanic[] = [
  { id: "day1-topic", day: 1, choiceIds: ["river-first", "poverty-first", "space-first"] },
  { id: "day1-angle", day: 1, choiceIds: ["documents-angle", "daily-life-angle", "conflict-angle"] },
  { id: "day1-headline", day: 1, choiceIds: ["precise-headline", "question-headline", "shock-headline"] },
  { id: "day1-publish", day: 1, choiceIds: ["analysis-first", "combined-first", "reel-first"] },
  { id: "day2-reaction", day: 2, choiceIds: ["rewrite-for-reach", "build-entry-format", "keep-original"] },
  { id: "day2-topic", day: 2, choiceIds: ["mining-second", "hate-second"] },
  { id: "day2-publish", day: 2, choiceIds: ["carousel-second", "newsletter-second", "raw-second"] },
  { id: "day3-topic", day: 3, choiceIds: ["child-sensitive", "war-sensitive", "police-sensitive"] },
  { id: "day3-protection", day: 3, choiceIds: ["protect-identity", "seek-consent", "minimal-redaction"] },
  { id: "day3-context", day: 3, choiceIds: ["full-context", "careful-summary", "overclaim"] },
  { id: "day3-publish", day: 3, choiceIds: ["wait-verification", "publish-now", "source-first-newsletter"] },
  { id: "day4-pressure", day: 4, choiceIds: ["follow-donor", "follow-platform", "serve-audience", "protect-newsroom"] },
  { id: "day4-backlog", day: 4, choiceIds: ["backlog-public-interest", "backlog-fastest", "backlog-algorithm"] },
  { id: "day4-publish", day: 4, choiceIds: ["deep-fourth", "combined-fourth", "concise-fourth"] },
  { id: "day5-topic", day: 5, choiceIds: ["final-important", "final-reachable", "final-verifiable"] },
  { id: "day5-headline", day: 5, choiceIds: ["final-precise", "final-useful", "final-spike"] },
  { id: "day5-correction", day: 5, choiceIds: ["publish-correction", "add-source-note", "move-to-next-story"] },
  { id: "day5-publish", day: 5, choiceIds: ["combined-final", "analysis-final", "newsletter-final", "concise-final"] },
];

const emptyAnalytics = (): AlgorithmAnalytics => ({
  views: 0,
  opens: 0,
  completions: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  reports: 0,
  exits: 0,
  sourceOpens: 0,
  sharedWithoutSource: 0,
});

const freshDraft = (): AlgorithmDraft => ({
  topicId: null,
  format: "analysis",
  hook: 1,
  context: 1,
  verification: 1,
  protectedSource: false,
  consent: false,
  delayed: false,
});

export function createInitialAlgorithmState(): AlgorithmState {
  return {
    stage: "intro",
    decisionIndex: 0,
    metrics: { truth: 70, reach: 35, trust: 65, capacity: 72 },
    counters: {
      sensational: 0,
      contextLoss: 0,
      responsibleCombos: 0,
      corrections: 0,
      protectedSources: 0,
      sensitiveSources: 0,
      compromises: 0,
      delayed: 0,
      deferred: 0,
      stale: 0,
      otherMedia: 0,
    },
    topicStatus: Object.fromEntries(ALGORITHM_TOPIC_IDS.map((id) => [id, "pending"])) as Record<AlgorithmTopicId, AlgorithmTopicStatus>,
    draft: freshDraft(),
    stories: [],
    log: [],
    lastEventId: null,
    endingId: null,
  };
}

export function startAlgorithmGame(state: AlgorithmState): AlgorithmState {
  return { ...state, stage: "playing" };
}

const clamp = (value: number, minimum = 0, maximum = 100) => Math.min(maximum, Math.max(minimum, value));

function applyMetricEffects(metrics: AlgorithmMetrics, effects: MetricEffects, choiceId: AlgorithmChoiceId): AlgorithmMetrics {
  const lowCapacityMultiplier = metrics.capacity < 30 && (effects.capacity || 0) < 0 ? 1.25 : 1;
  const correctionMultiplier = choiceId === "publish-correction" && metrics.truth < 45 ? 0.5 : 1;
  return {
    truth: clamp(metrics.truth + (effects.truth || 0) * correctionMultiplier),
    reach: clamp(metrics.reach + (effects.reach || 0)),
    trust: clamp(metrics.trust + (effects.trust || 0) * correctionMultiplier),
    capacity: clamp(metrics.capacity + (effects.capacity || 0) * lowCapacityMultiplier),
  };
}

function setTopic(state: AlgorithmState, topicId: AlgorithmTopicId, candidates?: AlgorithmTopicId[], unselectedStatus: AlgorithmTopicStatus = "deferred") {
  const topicStatus = { ...state.topicStatus };
  if (candidates) {
    candidates.forEach((candidate) => {
      if (candidate !== topicId && topicStatus[candidate] === "pending") topicStatus[candidate] = unselectedStatus;
    });
  }
  topicStatus[topicId] = "selected";
  return {
    topicStatus,
    draft: { ...freshDraft(), topicId },
  };
}

function pendingTopics(state: AlgorithmState) {
  return ALGORITHM_TOPIC_IDS.filter((id) => ["pending", "deferred"].includes(state.topicStatus[id]));
}

function pickPendingTopic(state: AlgorithmState, strategy: "important" | "fast" | "algorithm" | "verifiable") {
  const candidates = pendingTopics(state);
  const fallback = ALGORITHM_TOPIC_IDS.find((id) => state.topicStatus[id] !== "published") || "public-space";
  return [...candidates].sort((a, b) => {
    const first = ALGORITHM_TOPICS[a];
    const second = ALGORITHM_TOPICS[b];
    if (strategy === "important") return second.publicImportance - first.publicImportance;
    if (strategy === "fast") return first.complexity - second.complexity;
    if (strategy === "verifiable") return first.verificationNeed - second.verificationNeed;
    return second.algorithmPotential - first.algorithmPotential;
  })[0] || fallback;
}

function updateCounters(counters: AlgorithmCounters, choiceId: AlgorithmChoiceId): AlgorithmCounters {
  const next = { ...counters };
  const sensational = ["conflict-angle", "shock-headline", "rewrite-for-reach", "raw-second", "overclaim", "backlog-algorithm", "final-spike"];
  const contextLoss = ["conflict-angle", "shock-headline", "raw-second", "minimal-redaction", "overclaim", "follow-donor", "follow-platform", "backlog-algorithm", "concise-fourth", "final-spike", "concise-final"];
  const compromises = ["careful-summary", "follow-donor", "follow-platform", "backlog-fastest", "backlog-algorithm", "concise-fourth", "final-reachable", "move-to-next-story", "concise-final"];
  if (sensational.includes(choiceId)) next.sensational += 1;
  if (contextLoss.includes(choiceId)) next.contextLoss += 1;
  if (compromises.includes(choiceId)) next.compromises += 1;
  if (["combined-first", "build-entry-format", "combined-fourth", "combined-final"].includes(choiceId)) next.responsibleCombos += 1;
  if (["protect-identity", "seek-consent"].includes(choiceId)) next.protectedSources += 1;
  if (choiceId === "publish-correction") next.corrections += 1;
  if (choiceId === "wait-verification") next.delayed += 1;
  return next;
}

function resolveEvent(state: AlgorithmState): AlgorithmEventId {
  const topic = state.draft.topicId ? ALGORITHM_TOPICS[state.draft.topicId] : null;
  if (topic?.sensitive && !state.draft.protectedSource) return "source-became-cautious";
  if (state.draft.hook >= 3 && state.draft.context >= 2) return "headline-outpaced-story";
  if (state.draft.format === "combined") return "short-opened-source";
  if (state.draft.delayed) return "verification-lost-cycle";
  if (state.draft.format === "newsletter" && state.metrics.trust >= 60) return "newsletter-returned";
  if (state.metrics.trust < 45) return "trust-drag";
  if (["reel", "raw"].includes(state.draft.format) && state.draft.hook >= 2) return "platform-boost";
  return "steady-attention";
}

function analyticsForStory(state: AlgorithmState, eventId: AlgorithmEventId): AlgorithmAnalytics {
  const topic = ALGORITHM_TOPICS[state.draft.topicId || "public-space"];
  const format = state.draft.format;
  const formatReach = { analysis: -3, reel: 10, carousel: 6, newsletter: -2, raw: 8, combined: 7 }[format];
  const formatCompletion = { analysis: 0.1, reel: 0.19, carousel: 0.15, newsletter: 0.17, raw: 0.08, combined: 0.14 }[format];
  const eventReach = {
    "headline-outpaced-story": 9,
    "short-opened-source": 7,
    "verification-lost-cycle": -7,
    "source-became-cautious": 8,
    "newsletter-returned": 2,
    "correction-limited": -5,
    "trust-drag": -6,
    "platform-boost": 11,
    "steady-attention": 0,
  }[eventId];
  const effectiveReach = clamp(state.metrics.reach + formatReach + eventReach);
  const views = Math.max(320, Math.round(650 + effectiveReach * effectiveReach * 4.1 + topic.algorithmPotential * 95));
  const openRate = clamp(0.09 + state.draft.hook * 0.055 + state.metrics.trust / 520 - state.counters.contextLoss * 0.008, 0.06, 0.62);
  const opens = Math.min(views, Math.round(views * openRate));
  const completionRate = clamp(0.07 + formatCompletion + state.metrics.truth / 420 + state.draft.context * 0.04 - topic.complexity * 0.009, 0.08, 0.82);
  const completions = Math.min(opens, Math.round(opens * completionRate));
  const sourceOpenRate = clamp(0.025 + state.metrics.trust / 720 + state.draft.verification * 0.035 + (format === "combined" ? 0.07 : 0), 0.02, 0.42);
  const sourceOpens = Math.min(opens, Math.round(opens * sourceOpenRate));
  const comments = Math.min(views, Math.round(views * clamp(0.006 + topic.emotionalPotential * 0.0025 + state.draft.hook * 0.003, 0.006, 0.08)));
  const shares = Math.min(views, Math.round(views * clamp(0.004 + topic.emotionalPotential * 0.0018 + effectiveReach / 5000, 0.004, 0.07)));
  const saves = Math.min(views, Math.round(views * clamp(0.004 + state.metrics.truth / 3200 + state.draft.context * 0.006, 0.004, 0.09)));
  const reportRisk = (state.draft.protectedSource ? 0 : topic.harmRisk * 0.0008) + state.counters.sensational * 0.0007;
  const reports = Math.min(views, Math.round(views * clamp(0.0005 + reportRisk, 0.0005, 0.035)));
  const exits = Math.min(opens, Math.round(opens * clamp(0.13 + state.counters.contextLoss * 0.025 + (55 - state.metrics.trust) / 400, 0.08, 0.72)));
  const sharedWithoutSource = Math.min(shares, Math.max(0, Math.round(shares * clamp(0.54 - sourceOpenRate, 0.08, 0.52))));
  return { views, opens, completions, comments, shares, saves, reports, exits, sourceOpens, sharedWithoutSource };
}

function publishDraft(state: AlgorithmState): AlgorithmState {
  if (!state.draft.topicId) return state;
  let metrics = { ...state.metrics };
  if (metrics.truth < 45) metrics = applyMetricEffects(metrics, { trust: -3, reach: -3 }, "move-to-next-story");
  if (metrics.trust < 45) metrics = applyMetricEffects(metrics, { reach: -6 }, "move-to-next-story");
  if (metrics.reach < 35) metrics = applyMetricEffects(metrics, { capacity: -2 }, "move-to-next-story");
  const eventId = resolveEvent({ ...state, metrics });
  const analytics = analyticsForStory({ ...state, metrics }, eventId);
  const topicStatus = { ...state.topicStatus, [state.draft.topicId]: "published" as const };
  const story: AlgorithmStory = {
    day: ALGORITHM_DECISIONS[state.decisionIndex].day,
    topicId: state.draft.topicId,
    format: state.draft.format,
    eventId,
    analytics,
    truthAtPublish: metrics.truth,
    reachAtPublish: metrics.reach,
    trustAtPublish: metrics.trust,
    protectedSource: state.draft.protectedSource,
  };
  return { ...state, metrics, topicStatus, stories: [...state.stories, story], lastEventId: eventId, draft: freshDraft() };
}

function countUnpublished(state: AlgorithmState) {
  return ALGORITHM_TOPIC_IDS.filter((id) => state.topicStatus[id] !== "published").length;
}

export function totalAlgorithmAnalytics(stories: AlgorithmStory[]): AlgorithmAnalytics {
  return stories.reduce((total, story) => {
    (Object.keys(total) as Array<keyof AlgorithmAnalytics>).forEach((key) => {
      total[key] += story.analytics[key];
    });
    return total;
  }, emptyAnalytics());
}

export function resolveAlgorithmEnding(state: AlgorithmState): AlgorithmEndingId {
  const totals = totalAlgorithmAnalytics(state.stories);
  const averageCompletion = totals.opens ? totals.completions / totals.opens : 0;
  const unpublished = countUnpublished(state);
  const allSensitiveProtected = state.counters.sensitiveSources === 0 || state.counters.protectedSources >= state.counters.sensitiveSources;

  if (
    state.metrics.reach >= 75 &&
    state.metrics.truth <= 45 &&
    state.metrics.trust <= 50 &&
    state.counters.sensational >= 3 &&
    state.counters.contextLoss >= 2
  ) return "visible-without-reason";

  if (
    state.metrics.truth < 65 &&
    state.metrics.reach < 60 &&
    state.metrics.trust < 50 &&
    state.metrics.capacity <= 25 &&
    unpublished >= 3 &&
    averageCompletion < 0.3
  ) return "feed-moved-on";

  if (
    state.metrics.truth >= 75 &&
    state.metrics.reach <= 38 &&
    averageCompletion <= 0.46 &&
    (state.metrics.capacity <= 35 || state.counters.deferred + state.counters.stale >= 3)
  ) return "truth-alone";

  if (
    state.metrics.truth >= 68 &&
    state.metrics.trust >= 65 &&
    state.metrics.reach >= 45 &&
    state.metrics.reach <= 80 &&
    state.metrics.capacity >= 30 &&
    state.counters.responsibleCombos >= 2 &&
    allSensitiveProtected &&
    state.counters.sensational <= 1 &&
    state.counters.contextLoss <= 1
  ) return "not-for-algorithm";

  if (
    state.metrics.capacity >= 35 &&
    state.metrics.reach >= 45 &&
    state.counters.compromises >= 3 &&
    (state.metrics.truth < 68 || state.metrics.trust < 65)
  ) return "newsroom-survived";

  return "still-in-feed";
}

export function currentAlgorithmDecision(state: AlgorithmState) {
  return ALGORITHM_DECISIONS[state.decisionIndex] || null;
}

export function isAlgorithmChoiceAvailable(state: AlgorithmState, choiceId: AlgorithmChoiceId) {
  if (["analysis-final", "deep-fourth"].includes(choiceId) && state.metrics.capacity < 25) return false;
  if (choiceId === "final-spike" && state.metrics.reach >= 60) return false;
  return true;
}

function applyChoiceAction(state: AlgorithmState, choiceId: AlgorithmChoiceId): AlgorithmState {
  let next = { ...state, draft: { ...state.draft }, topicStatus: { ...state.topicStatus }, counters: { ...state.counters } };

  const directTopics: Partial<Record<AlgorithmChoiceId, AlgorithmTopicId>> = {
    "river-first": "river-pollution",
    "poverty-first": "poverty",
    "space-first": "public-space",
    "mining-second": "mining-research",
    "hate-second": "hate-speech",
    "child-sensitive": "child-rights",
    "war-sensitive": "war-crime",
    "police-sensitive": "police-violence",
  };
  const directTopic = directTopics[choiceId];
  if (directTopic) {
    const candidates = choiceId.endsWith("first")
      ? (["river-pollution", "poverty", "public-space"] as AlgorithmTopicId[])
      : choiceId.endsWith("second")
        ? (["mining-research", "hate-speech"] as AlgorithmTopicId[])
        : (["child-rights", "war-crime", "police-violence"] as AlgorithmTopicId[]);
    const selected = setTopic(next, directTopic, candidates, choiceId.endsWith("second") ? "other-media" : "deferred");
    next = { ...next, ...selected };
    if (["child-sensitive", "war-sensitive", "police-sensitive"].includes(choiceId)) next.counters.sensitiveSources += 1;
  }

  if (choiceId === "documents-angle") next.draft = { ...next.draft, context: 3, verification: 3, hook: 1 };
  if (choiceId === "daily-life-angle") next.draft = { ...next.draft, context: 2, verification: 2, hook: 2 };
  if (choiceId === "conflict-angle") next.draft = { ...next.draft, context: 0, verification: 1, hook: 3 };
  if (choiceId === "precise-headline" || choiceId === "final-precise") next.draft = { ...next.draft, hook: 1, context: Math.max(2, next.draft.context) };
  if (choiceId === "question-headline" || choiceId === "final-useful") next.draft = { ...next.draft, hook: 2 };
  if (choiceId === "shock-headline" || choiceId === "final-spike") next.draft = { ...next.draft, hook: 3, context: Math.max(0, next.draft.context - 1) };

  const formatMap: Partial<Record<AlgorithmChoiceId, AlgorithmFormatId>> = {
    "analysis-first": "analysis",
    "combined-first": "combined",
    "reel-first": "reel",
    "carousel-second": "carousel",
    "newsletter-second": "newsletter",
    "raw-second": "raw",
    "source-first-newsletter": "newsletter",
    "deep-fourth": "analysis",
    "combined-fourth": "combined",
    "concise-fourth": "carousel",
    "combined-final": "combined",
    "analysis-final": "analysis",
    "newsletter-final": "newsletter",
    "concise-final": "carousel",
  };
  if (formatMap[choiceId]) next.draft = { ...next.draft, format: formatMap[choiceId]! };

  if (choiceId === "protect-identity") next.draft = { ...next.draft, protectedSource: true, verification: 2 };
  if (choiceId === "seek-consent") next.draft = { ...next.draft, protectedSource: true, consent: true, verification: 3 };
  if (choiceId === "minimal-redaction") next.draft = { ...next.draft, protectedSource: false, verification: 1 };
  if (choiceId === "full-context") next.draft = { ...next.draft, context: 3, verification: 3 };
  if (choiceId === "careful-summary") next.draft = { ...next.draft, context: 2, verification: 2 };
  if (choiceId === "overclaim") next.draft = { ...next.draft, context: 0, verification: 0, hook: 3 };
  if (choiceId === "wait-verification") next.draft = { ...next.draft, delayed: true, verification: 3 };
  if (choiceId === "publish-now") next.draft = { ...next.draft, verification: Math.max(1, next.draft.verification), format: "reel" };
  if (choiceId === "source-first-newsletter") next.draft = { ...next.draft, protectedSource: true, delayed: true, context: 3, verification: 3 };

  if (["backlog-public-interest", "backlog-fastest", "backlog-algorithm"].includes(choiceId)) {
    const strategy = choiceId === "backlog-public-interest" ? "important" : choiceId === "backlog-fastest" ? "fast" : "algorithm";
    const selected = setTopic(next, pickPendingTopic(next, strategy));
    next = { ...next, ...selected };
  }
  if (["final-important", "final-reachable", "final-verifiable"].includes(choiceId)) {
    const strategy = choiceId === "final-important" ? "important" : choiceId === "final-reachable" ? "algorithm" : "verifiable";
    const selected = setTopic(next, pickPendingTopic(next, strategy));
    next = { ...next, ...selected };
  }

  if (choiceId === "publish-correction") next.lastEventId = "correction-limited";
  if (choiceId === "build-entry-format") next.lastEventId = "short-opened-source";
  if (choiceId === "rewrite-for-reach") next.lastEventId = "headline-outpaced-story";
  if (choiceId === "keep-original") next.lastEventId = "steady-attention";

  return next;
}

export function applyAlgorithmChoice(state: AlgorithmState, choiceId: AlgorithmChoiceId): AlgorithmState {
  const decision = currentAlgorithmDecision(state);
  if (state.stage !== "playing" || !decision || !decision.choiceIds.includes(choiceId) || !isAlgorithmChoiceAvailable(state, choiceId)) return state;

  const mechanic = ALGORITHM_CHOICES[choiceId];
  let next: AlgorithmState = {
    ...state,
    metrics: applyMetricEffects(state.metrics, mechanic.effects, choiceId),
    counters: updateCounters(state.counters, choiceId),
  };
  next = applyChoiceAction(next, choiceId);

  const publishingChoice = [
    "analysis-first", "combined-first", "reel-first",
    "carousel-second", "newsletter-second", "raw-second",
    "wait-verification", "publish-now", "source-first-newsletter",
    "deep-fourth", "combined-fourth", "concise-fourth",
    "combined-final", "analysis-final", "newsletter-final", "concise-final",
  ].includes(choiceId);
  if (publishingChoice) next = publishDraft(next);

  const nextIndex = state.decisionIndex + 1;
  const isFinished = nextIndex >= ALGORITHM_DECISIONS.length;
  if (isFinished) {
    const topicStatus = { ...next.topicStatus };
    ALGORITHM_TOPIC_IDS.forEach((id) => {
      if (["pending", "deferred", "selected"].includes(topicStatus[id])) {
        const status = ALGORITHM_TOPICS[id].algorithmPotential >= 8 ? "other-media" : "stale";
        topicStatus[id] = status;
      }
    });
    const stale = ALGORITHM_TOPIC_IDS.filter((id) => topicStatus[id] === "stale").length;
    const otherMedia = ALGORITHM_TOPIC_IDS.filter((id) => topicStatus[id] === "other-media").length;
    next = {
      ...next,
      topicStatus,
      counters: { ...next.counters, stale, otherMedia, deferred: ALGORITHM_TOPIC_IDS.filter((id) => topicStatus[id] === "deferred").length },
    };
  }

  const entry: AlgorithmLogEntry = {
    day: decision.day,
    decisionId: decision.id,
    choiceId,
    eventId: next.lastEventId || undefined,
    metrics: next.metrics,
  };
  next = { ...next, decisionIndex: nextIndex, log: [...next.log, entry] };
  if (isFinished) {
    const endingId = resolveAlgorithmEnding(next);
    next = { ...next, endingId, stage: "result" };
  }
  return next;
}

export function restartAlgorithmGame() {
  return startAlgorithmGame(createInitialAlgorithmState());
}

export function currentAlgorithmDay(state: AlgorithmState) {
  return currentAlgorithmDecision(state)?.day || 5;
}

export function shouldRevealCapacity(state: AlgorithmState) {
  return currentAlgorithmDay(state) >= 3 || state.metrics.capacity < 45 || state.stage === "result";
}

export function algorithmEndingThresholds() {
  return {
    priority: [...ALGORITHM_ENDING_IDS],
    visibleWithoutReason: { reachMin: 75, truthMax: 45, trustMax: 50, sensationalMin: 3, contextLossMin: 2 },
    feedMovedOn: { truthMaxExclusive: 65, reachMaxExclusive: 60, trustMaxExclusive: 50, capacityMax: 25, unpublishedMin: 3, completionRateMaxExclusive: 0.3 },
    truthAlone: { truthMin: 75, reachMax: 38, completionRateMax: 0.46, capacityMax: 35, orDeferredAndStaleMin: 3 },
    notForAlgorithm: { truthMin: 68, trustMin: 65, reachMin: 45, reachMax: 80, capacityMin: 30, responsibleCombosMin: 2, sensationalMax: 1, contextLossMax: 1, allSensitiveSourcesProtected: true },
    newsroomSurvived: { capacityMin: 35, reachMin: 45, compromisesMin: 3, truthOrTrustBelow: 68 },
  };
}

function assertEngineStructure() {
  if (ALGORITHM_DECISIONS.length !== 18) throw new Error("Algorithm must contain exactly 18 decisions.");
  const days = new Set(ALGORITHM_DECISIONS.map((decision) => decision.day));
  if (days.size !== 5) throw new Error("Algorithm must contain five editorial days.");
  ALGORITHM_DECISIONS.forEach((decision) => {
    decision.choiceIds.forEach((choiceId) => {
      if (!ALGORITHM_CHOICES[choiceId]) throw new Error(`Missing mechanic for ${choiceId}.`);
    });
  });
}

assertEngineStructure();
