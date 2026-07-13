"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";

import {
  ROGOZNA_DAMAGE_RATE,
  getRogoznaDamageBand,
  getRogoznaEnding,
  type RogoznaChoice,
  type RogoznaCondition,
  type RogoznaCopy,
  type RogoznaEvidenceType,
  type RogoznaLocation,
  type RogoznaMeters,
  type RogoznaOutcomeSummary,
  type RogoznaPublicationMode,
} from "@/lib/rogozna-interactive";

import styles from "./rogozna-game.module.css";

type RogoznaGameProps = {
  copy: RogoznaCopy;
};

type GameState = "intro" | "playing" | "result";

type ChoiceLogEntry = {
  decisionId: string;
  choiceId: string;
  location: RogoznaLocation;
  request: boolean;
  officialResponse?: "procedural" | "concrete";
  delay: boolean;
  publication?: RogoznaPublicationMode;
  credibilityRisk: number;
  evidenceAtChoice: number;
  diversityAtChoice: number;
};

const initialMeters: RogoznaMeters = {
  evidence: 0,
  time: 0,
  damage: 5,
  trust: 50,
};

const evidenceOrder: RogoznaEvidenceType[] = [
  "photo",
  "testimony",
  "document",
  "sample",
  "officialResponse",
  "fieldNote",
];

const locationOrder: RogoznaLocation[] = [
  "forest",
  "creek",
  "village",
  "road",
  "institution",
  "archive",
];

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function applyDelta(current: RogoznaMeters, delta: RogoznaMeters): RogoznaMeters {
  return {
    evidence: clamp(current.evidence + delta.evidence),
    time: Math.max(0, current.time + delta.time),
    damage: clamp(Math.round(current.damage + delta.damage * ROGOZNA_DAMAGE_RATE)),
    trust: clamp(current.trust + delta.trust),
  };
}

function conditionMatches(
  condition: RogoznaCondition | undefined,
  meters: RogoznaMeters,
  evidenceTypes: RogoznaEvidenceType[],
  log: ChoiceLogEntry[]
) {
  if (!condition) return true;
  if (condition.minTrust !== undefined && meters.trust < condition.minTrust) return false;
  if (condition.maxTrust !== undefined && meters.trust > condition.maxTrust) return false;
  if (
    condition.minEvidenceTypes !== undefined &&
    evidenceTypes.length < condition.minEvidenceTypes
  ) {
    return false;
  }
  if (condition.evidenceAny?.length && !condition.evidenceAny.some((type) => evidenceTypes.includes(type))) {
    return false;
  }
  if (condition.evidenceAll?.length && !condition.evidenceAll.every((type) => evidenceTypes.includes(type))) {
    return false;
  }
  if (condition.choiceMade && !log.some((entry) => entry.choiceId === condition.choiceMade)) return false;
  return true;
}

function resolveChoices(
  choices: RogoznaChoice[],
  meters: RogoznaMeters,
  evidenceTypes: RogoznaEvidenceType[],
  log: ChoiceLogEntry[]
) {
  const resolvedGroups = new Set<string>();

  return choices.filter((choice) => {
    if (!choice.variantGroup) {
      return conditionMatches(choice.condition, meters, evidenceTypes, log);
    }
    if (resolvedGroups.has(choice.variantGroup)) return false;
    if (!conditionMatches(choice.condition, meters, evidenceTypes, log)) return false;
    resolvedGroups.add(choice.variantGroup);
    return true;
  });
}

function EvidenceIcon({ type }: { type: RogoznaEvidenceType }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "photo") {
    return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m5 17 4-4 3 3 3-4 4 5" /></svg>;
  }
  if (type === "testimony") {
    return <svg {...common}><path d="M5 18h9l5 3v-3h1V5H5z" /><path d="M8 9h8M8 13h6" /></svg>;
  }
  if (type === "document") {
    return <svg {...common}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></svg>;
  }
  if (type === "sample") {
    return <svg {...common}><path d="M9 3h6M10 3v6l-4 8a3 3 0 0 0 3 4h6a3 3 0 0 0 3-4l-4-8V3" /><path d="M8 16h8" /></svg>;
  }
  if (type === "officialResponse") {
    return <svg {...common}><path d="M4 20h16M6 17h12M7 9v8M12 9v8M17 9v8M3 9h18L12 3z" /></svg>;
  }
  return <svg {...common}><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
}

function Terrain({ damage, phase, copy }: { damage: number; phase: number; copy: RogoznaCopy }) {
  const damageBand = getRogoznaDamageBand(damage);

  return (
    <div className={`${styles.terrain} ${styles[`damageBand${damageBand}`]}`}>
      <p className={styles.srOnly}>
        {locationOrder.map((location) => copy.locationLabels[location]).join(", ")}. {copy.damageMessages[damageBand]}
      </p>
      <svg viewBox="0 0 720 330" aria-hidden="true">
        <g className={styles.topoLines}>
          <path d="M18 82c79-38 133 26 210-8s139-21 194 15 133 27 280-4" />
          <path d="M22 105c76-29 139 24 217-4s132-17 190 18 132 21 268-1" />
          <path d="M25 129c72-24 139 21 215-2s139-12 195 18 128 19 256 5" />
        </g>
        <path className={styles.terrainBack} d="M0 224 92 164l76 31 94-115 68 62 65-42 94 78 77-91 154 137v106H0z" />
        <path className={styles.terrainMid} d="M0 255 124 177l95 51 104-91 74 61 82-29 99 82 142-55v134H0z" />
        <path className={styles.ridge} d="M20 220 92 164l76 31 94-115 68 62 65-42 94 78 77-91 134 119" />

        <g className={styles.forestZone}>
          <path className={styles.forestGround} d="M35 246c42-30 89-39 151-30 28 4 49 15 73 31v40H35z" />
          <path className={styles.forestMarks} d="M55 238v-55m17 55v-76m19 76v-48m18 48v-88m20 88v-68m18 68v-97m20 97v-61m20 61v-79m20 79v-52m20 52v-72" />
          <path className={styles.forestCanopy} d="m46 193 9-18 9 18m-2-22 10-21 11 21m-3 17 12-25 11 25m-5-31 11-24 12 24m-2 17 10-22 11 22m-4-29 12-25 12 25m-3 22 11-24 11 24m-3-31 12-24 12 24m-2 20 10-21 11 21" />
        </g>

        <path className={styles.waterShadow} d="M27 290c89-36 146 16 227-16 71-28 125 19 194-7 83-31 128 18 242-8" />
        <path className={styles.water} d="M31 286c89-36 143 16 224-16 71-28 125 19 194-7 83-31 128 18 239-8" />
        <path className={styles.roadBase} d="M537 307c-27-39-15-79-62-108-33-21-46-61-41-102" />
        <path className={styles.road} pathLength="100" d="M537 307c-27-39-15-79-62-108-33-21-46-61-41-102" />
        <g className={styles.roadTicks}>
          <path d="m512 279 18-9M493 239l18-9M468 201l18-10M446 160l17-9" />
        </g>

        <g className={styles.villageZone}>
          <path d="M205 239h19v15h-19zM229 229h24v25h-24zM258 237h18v17h-18z" />
          <path d="m202 239 12-10 12 10m0-10 15-12 15 12m-1 8 12-9 12 9" />
          <circle cx="241" cy="263" r="4" />
        </g>

        <g className={styles.institutionZone}>
          <rect x="500" y="43" width="102" height="54" rx="2" />
          <path d="M513 83h76M518 72V56m18 16V56m18 16V56m18 16V56M509 54h84l-42-13z" />
        </g>

        <g className={styles.archiveZone}>
          <path d="M612 111h60v43h-60zM605 104h60v43M598 97h60v43" />
          <path d="M612 119h36M612 129h29M612 139h39" />
        </g>

        <path className={styles.cutOne} d="M292 103 252 216l92 12" />
        <path className={styles.cutTwo} d="m487 179 71 74-108 10" />
        <g className={styles.procedureLines}>
          <path d="M70 42h238M70 55h178M490 41h154M505 54h139" />
          <path d="M65 301h122M550 302h105" />
          <path d="M474 112h136M481 124h92M564 167h91M573 179h61" />
        </g>
        <g className={styles.procedureCodes}>
          <text x="491" y="117">R-01</text>
          <text x="577" y="117">30D</text>
          <text x="579" y="174">02-14</text>
        </g>
        <g className={styles.tracePoints}>
          <path d="m91 190 6 6-6 6-6-6zM288 273l6 6-6 6-6-6zM458 191l6 6-6 6-6-6z" />
        </g>

        <g className={styles.featureLabels}>
          <g transform="translate(40 120)"><rect width="94" height="25" rx="2" /><text x="9" y="17">{copy.locationLabels.forest}</text></g>
          <g transform="translate(245 294)"><rect width="94" height="25" rx="2" /><text x="9" y="17">{copy.locationLabels.creek}</text></g>
          <g transform="translate(192 268)"><rect width="94" height="25" rx="2" /><text x="9" y="17">{copy.locationLabels.village}</text></g>
          <g transform="translate(419 138)"><rect width="85" height="25" rx="2" /><text x="9" y="17">{copy.locationLabels.road}</text></g>
          <g transform="translate(493 12)"><rect width="116" height="25" rx="2" /><text x="9" y="17">{copy.locationLabels.institution}</text></g>
          <g transform="translate(575 161)"><rect width="132" height="25" rx="2" /><text x="9" y="17">{copy.locationLabels.archive}</text></g>
        </g>
      </svg>
      <div className={styles.terrainLegend}>
        <span><i className={styles.legendForest} />{copy.locationLabels.forest}</span>
        <span><i className={styles.legendWater} />{copy.locationLabels.creek}</span>
        <span><i className={styles.legendRoad} />{copy.locationLabels.road}</span>
        <span><i className={styles.legendTrace} />{copy.dossierLabel}</span>
      </div>
      <div className={styles.terrainStamp}>
        <span>0{phase}</span>
        <strong>{String(Math.round(damage)).padStart(2, "0")}</strong>
      </div>
    </div>
  );
}

function GameMeters({ copy, meters }: { copy: RogoznaCopy; meters: RogoznaMeters }) {
  const entries = [
    { key: "evidence", label: copy.evidenceLabel, value: meters.evidence, max: 100, suffix: "" },
    { key: "time", label: copy.timeLabel, value: meters.time, max: 160, suffix: ` ${copy.daysLabel}` },
    { key: "damage", label: copy.damageLabel, value: meters.damage, max: 100, suffix: "" },
    { key: "trust", label: copy.trustLabel, value: meters.trust, max: 100, suffix: "" },
  ] as const;

  return (
    <section className={styles.meters} aria-label={copy.metersLabel}>
      {entries.map((entry) => {
        const width = Math.min(100, (entry.value / entry.max) * 100);
        return (
          <div className={styles.meter} key={entry.key}>
            <div className={styles.meterHeader}>
              <span>{entry.label}</span>
              <strong>{entry.value}{entry.suffix}</strong>
            </div>
            <div
              className={styles.meterTrack}
              role="progressbar"
              aria-label={entry.label}
              aria-valuemin={0}
              aria-valuemax={entry.max}
              aria-valuenow={Math.min(entry.value, entry.max)}
            >
              <span style={{ inlineSize: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function RogoznaGame({ copy }: RogoznaGameProps) {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [decisionIndex, setDecisionIndex] = useState(0);
  const [meters, setMeters] = useState<RogoznaMeters>(initialMeters);
  const [evidenceTypes, setEvidenceTypes] = useState<RogoznaEvidenceType[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<RogoznaLocation[]>([]);
  const [log, setLog] = useState<ChoiceLogEntry[]>([]);
  const [lastChoice, setLastChoice] = useState<RogoznaChoice | null>(null);
  const [announcement, setAnnouncement] = useState(copy.introStatement);
  const [shareStatus, setShareStatus] = useState("");
  const gameRef = useRef<HTMLElement | null>(null);

  const totalDecisionCount = useMemo(
    () => copy.phases.reduce((total, phase) => total + phase.decisions.length, 0),
    [copy.phases]
  );
  const currentPhase = copy.phases[phaseIndex];
  const currentDecision = currentPhase?.decisions[decisionIndex];
  const completedBeforePhase = copy.phases
    .slice(0, phaseIndex)
    .reduce((total, phase) => total + phase.decisions.length, 0);
  const currentDecisionNumber = Math.min(
    totalDecisionCount,
    completedBeforePhase + decisionIndex + 1
  );
  const currentChoices = useMemo(
    () => currentDecision ? resolveChoices(currentDecision.choices, meters, evidenceTypes, log) : [],
    [currentDecision, meters, evidenceTypes, log]
  );
  const outcomeSummary = useMemo<RogoznaOutcomeSummary>(() => ({
    meters,
    evidenceTypes,
    requestCount: log.filter((entry) => entry.request).length,
    responseCount: log.filter((entry) => entry.officialResponse).length,
    concreteResponseCount: log.filter((entry) => entry.officialResponse === "concrete").length,
    delayCount: log.filter((entry) => entry.delay).length,
    credibilityRisk: log.reduce((total, entry) => total + entry.credibilityRisk, 0),
    publications: log
      .filter((entry): entry is ChoiceLogEntry & { publication: RogoznaPublicationMode } => Boolean(entry.publication))
      .map((entry) => ({
        mode: entry.publication,
        evidenceAtChoice: entry.evidenceAtChoice,
        diversityAtChoice: entry.diversityAtChoice,
      })),
  }), [meters, evidenceTypes, log]);
  const ending = copy.endings[getRogoznaEnding(outcomeSummary)];
  const damageBand = getRogoznaDamageBand(meters.damage);
  const narrativeLanguage = copy.languageNotice ? { dir: "ltr" as const, lang: "en" } : {};
  const surfaceStyle = {
    "--damage-ratio": `${meters.damage}%`,
    "--time-ratio": `${Math.min(100, (meters.time / 160) * 100)}%`,
    "--forest-opacity": String(Math.max(0.34, 1 - meters.damage / 145)),
    "--forest-scale": String(Math.max(0.42, 1 - meters.damage / 155)),
    "--procedure-opacity": String(Math.min(0.92, 0.22 + meters.time / 210)),
    "--road-width": String(Math.min(5, 1.6 + meters.time / 55)),
    "--road-dash-offset": `${Math.max(0, 75 - meters.time * 0.45)}px`,
    "--road-progress": `${Math.min(100, 26 + meters.time * 0.52 + meters.damage * 0.18)} 100`,
  } as CSSProperties;

  function focusGame() {
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  function startGame() {
    setGameState("playing");
    setAnnouncement(`${copy.phases[0].title}. ${copy.phases[0].scenario}`);
    focusGame();
  }

  function choose(choice: RogoznaChoice) {
    if (lastChoice || !currentDecision) return;

    const nextMeters = applyDelta(meters, choice.delta);
    const nextEvidenceTypes = Array.from(new Set([...evidenceTypes, ...(choice.evidence ?? [])]));
    setMeters(nextMeters);
    setEvidenceTypes(nextEvidenceTypes);
    setVisitedLocations((locations) => Array.from(new Set([...locations, choice.location])));
    setLog((entries) => [
      ...entries,
      {
        decisionId: currentDecision.id,
        choiceId: choice.id,
        location: choice.location,
        request: Boolean(choice.request),
        officialResponse: choice.officialResponse,
        delay: Boolean(choice.delay),
        publication: choice.publication,
        credibilityRisk: choice.credibilityRisk ?? 0,
        evidenceAtChoice: nextMeters.evidence,
        diversityAtChoice: nextEvidenceTypes.length,
      },
    ]);
    setLastChoice(choice);
    setAnnouncement(`${choice.response} ${copy.damageMessages[getRogoznaDamageBand(nextMeters.damage)]}`);
  }

  function advance() {
    if (!lastChoice || !currentPhase) return;

    if (decisionIndex + 1 < currentPhase.decisions.length) {
      setDecisionIndex((index) => index + 1);
      setLastChoice(null);
      setAnnouncement(`${copy.decisionLabel} ${currentDecisionNumber + 1}`);
      focusGame();
      return;
    }

    if (phaseIndex + 1 < copy.phases.length) {
      const nextPhase = copy.phases[phaseIndex + 1];
      setPhaseIndex((index) => index + 1);
      setDecisionIndex(0);
      setLastChoice(null);
      setAnnouncement(`${nextPhase.title}. ${nextPhase.scenario}`);
      focusGame();
      return;
    }

    setGameState("result");
    setLastChoice(null);
    setAnnouncement(`${ending.title} ${ending.copy}`);
    focusGame();
  }

  function restart() {
    setGameState("intro");
    setPhaseIndex(0);
    setDecisionIndex(0);
    setMeters(initialMeters);
    setEvidenceTypes([]);
    setVisitedLocations([]);
    setLog([]);
    setLastChoice(null);
    setShareStatus("");
    setAnnouncement(copy.introStatement);
    focusGame();
  }

  async function share() {
    const data = { title: `${copy.gameTitle} | Avangarda`, text: copy.gameSubtitle, url: window.location.href };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
        setShareStatus("");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus(copy.shareCopiedLabel);
    } catch {
      setShareStatus(copy.shareUnavailableLabel);
    }
  }

  function scrollToContext() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("sta-se-desilo-rogozna")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section
      ref={gameRef}
      className={`${styles.game} ${styles[`phase${currentPhase?.id ?? 1}`]}`}
      style={surfaceStyle}
      tabIndex={-1}
      aria-label={copy.gameTitle}
    >
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</p>

      {gameState === "intro" ? (
        <div className={styles.intro}>
          <Terrain damage={initialMeters.damage} phase={1} copy={copy} />
          <div className={styles.introCopy}>
            <span className={styles.microLabel}>{copy.introEyebrow}</span>
            <h2 {...narrativeLanguage}>{copy.introStatement}</h2>
            <p {...narrativeLanguage}>{copy.introCopy}</p>
            <div className={styles.introFacts}>
              <span>04 / {copy.phaseTitles.length}</span>
              <span>16 / {copy.decisionLabel}</span>
              <span>06 / {copy.evidenceLabel}</span>
            </div>
            <button type="button" className={styles.primaryAction} onClick={startGame}>
              {copy.startLabel}
            </button>
          </div>
        </div>
      ) : null}

      {gameState === "playing" && currentPhase && currentDecision ? (
        <div className={styles.playing}>
          <header className={styles.gameHeader}>
            <div>
              <span className={styles.microLabel}>{currentPhase.label}</span>
              <h2>{currentPhase.title}</h2>
              <p {...narrativeLanguage}>{currentPhase.theme}</p>
            </div>
            <div className={styles.decisionCounter}>
              <span>{copy.decisionLabel}</span>
              <strong>{String(currentDecisionNumber).padStart(2, "0")}</strong>
              <small>/ {totalDecisionCount}</small>
            </div>
          </header>

          <div className={styles.progressLine}><span style={{ inlineSize: `${(currentDecisionNumber / totalDecisionCount) * 100}%` }} /></div>
          <GameMeters copy={copy} meters={meters} />

          <div className={styles.fieldGrid}>
            <div className={styles.fieldColumn}>
              <Terrain damage={meters.damage} phase={currentPhase.id} copy={copy} />
              <p className={styles.damageMessage}>{copy.damageMessages[damageBand]}</p>
              <ul className={styles.locations} aria-label={copy.visitedLabel}>
                {locationOrder.map((location) => {
                  const isVisited = visitedLocations.includes(location);
                  const isAvailable = currentChoices.some((choice) => choice.location === location);
                  const visitCount = log.filter((entry) => entry.location === location).length;
                  const statusParts = [
                    isVisited ? copy.visitedStatusLabel : null,
                    isAvailable ? copy.availableStatusLabel : copy.lockedStatusLabel,
                  ].filter(Boolean);
                  return (
                    <li
                      className={`${styles.location} ${isVisited ? styles.locationVisited : ""} ${isAvailable ? styles.locationAvailable : styles.locationLocked}`}
                      key={location}
                      tabIndex={0}
                      aria-label={`${copy.locationLabels[location]}: ${statusParts.join(", ")}`}
                    >
                      <span className={styles.locationMarker} aria-hidden="true">
                        {visitCount ? String(visitCount).padStart(2, "0") : isAvailable ? "→" : "—"}
                      </span>
                      <span className={styles.locationCopy}>
                        <strong>{copy.locationLabels[location]}</strong>
                        <small>{statusParts.join(" · ")}</small>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className={styles.dossier} aria-label={copy.dossierLabel}>
              <div className={styles.dossierHeader}>
                <span className={styles.microLabel}>{copy.dossierLabel}</span>
                <strong>{String(evidenceTypes.length).padStart(2, "0")} / 06</strong>
              </div>
              <div className={styles.evidenceGrid}>
                {evidenceOrder.map((type) => {
                  const collected = evidenceTypes.includes(type);
                  return (
                    <div className={`${styles.evidenceItem} ${collected ? styles.evidenceCollected : ""}`} key={type}>
                      <EvidenceIcon type={type} />
                      <span>{copy.evidenceLabels[type]}</span>
                    </div>
                  );
                })}
              </div>
              {!evidenceTypes.length ? <p className={styles.emptyDossier}>{copy.emptyDossierLabel}</p> : null}
            </aside>
          </div>

          <section className={styles.decisionPanel}>
            <div className={styles.decisionLead}>
              <span className={styles.microLabel}>{copy.choicesLabel}</span>
              <h3 {...narrativeLanguage}>{currentDecision.prompt}</h3>
              <p {...narrativeLanguage}>{currentDecision.detail}</p>
            </div>
            <div className={styles.choices}>
              {currentChoices.map((choice, index) => (
                <button
                  type="button"
                  className={`${styles.choice} ${lastChoice?.id === choice.id ? styles.choiceSelected : ""}`}
                  disabled={Boolean(lastChoice)}
                  onClick={() => choose(choice)}
                  key={choice.id}
                >
                  <span className={styles.choiceIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.choiceLocation}>{copy.locationLabels[choice.location]}</span>
                  <strong {...narrativeLanguage}>{choice.action}</strong>
                </button>
              ))}
            </div>
          </section>

          {lastChoice ? (
            <div className={styles.responsePanel}>
              <div>
                <span className={styles.microLabel}>{copy.resultLabel}</span>
                <p {...narrativeLanguage}>{lastChoice.response}</p>
              </div>
              <button type="button" className={styles.continueAction} onClick={advance}>{copy.continueLabel}</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {gameState === "result" ? (
        <div className={styles.result}>
          <div className={styles.resultLead} {...narrativeLanguage}>
            <span className={styles.microLabel}>{ending.eyebrow}</span>
            <h2>{ending.title}</h2>
            <p>{ending.copy}</p>
            <blockquote>{ending.quote}</blockquote>
          </div>

          <Terrain damage={meters.damage} phase={4} copy={copy} />
          <GameMeters copy={copy} meters={meters} />

          <div className={styles.resultStats}>
            <div><span>{copy.evidenceLabel}</span><strong>{evidenceTypes.length} / 6</strong></div>
            <div><span>{copy.visitedLabel}</span><strong>{visitedLocations.length} / 6</strong></div>
            <div><span>{copy.requestsLabel}</span><strong>{outcomeSummary.requestCount}</strong></div>
            <div><span>{copy.concreteResponsesLabel}</span><strong>{outcomeSummary.concreteResponseCount}</strong></div>
            <div><span>{copy.delaysLabel}</span><strong>{outcomeSummary.delayCount}</strong></div>
          </div>

          <div className={styles.resultActions}>
            <button type="button" className={styles.primaryAction} onClick={scrollToContext}>{copy.understandLabel}</button>
            <button type="button" className={styles.secondaryAction} onClick={restart}>{copy.restartLabel}</button>
            <button type="button" className={styles.secondaryAction} onClick={share}>{copy.shareLabel}</button>
          </div>
          {shareStatus ? <p className={styles.shareStatus} role="status">{shareStatus}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
