"use client";

import type { CSSProperties } from "react";
import { useMemo, useReducer, useRef, useState } from "react";

import styles from "@/components/waiting-room-game.module.css";
import {
  getWaitingRoomDepartureIds,
  getWaitingRoomEnding,
  WAITING_ROOM_PEOPLE,
  type WaitingRoomChoice,
  type WaitingRoomCopy,
  type WaitingRoomCounters,
  type WaitingRoomFlag,
  type WaitingRoomMeters,
  type WaitingRoomOutcomeSummary,
  type WaitingRoomRequirement,
  type WaitingRoomStatusId,
} from "@/lib/waiting-room-interactive";

type GameStage = "intro" | "playing" | "result";

type LogEntry = {
  decisionId: string;
  choiceId: string;
  response: string;
  status: WaitingRoomStatusId;
  formalMovement: number;
  realMovement: number;
  elapsedTime: number;
  departed: string[];
};

type GameState = {
  stage: GameStage;
  phaseIndex: number;
  decisionIndex: number;
  caseIndex: number;
  meters: WaitingRoomMeters;
  counters: WaitingRoomCounters;
  status: WaitingRoomStatusId;
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
  queueNumber: number;
  departed: string[];
  log: LogEntry[];
  lastChoice: WaitingRoomChoice | null;
};

type GameAction =
  | { type: "start"; caseIndex: number }
  | { type: "choose"; choice: WaitingRoomChoice; decisionId: string }
  | { type: "advance"; phaseCount: number; decisionCount: number }
  | { type: "restart" };

const initialMeters: WaitingRoomMeters = { patience: 100, dignity: 100, time: 0 };

const initialCounters: WaitingRoomCounters = {
  visits: 0,
  calls: 0,
  supplements: 0,
  redirects: 0,
  missedWorkdays: 0,
  proceduralResponses: 0,
  concreteInformation: 0,
  retellings: 0,
  writtenRequests: 0,
  withdrawals: 0,
  failedVisits: 0,
};

function createInitialState(): GameState {
  return {
    stage: "intro",
    phaseIndex: 0,
    decisionIndex: 0,
    caseIndex: 0,
    meters: initialMeters,
    counters: initialCounters,
    status: "received",
    formalMovement: 0,
    realMovement: 0,
    connection: 0,
    patterns: 0,
    receipts: 0,
    concessions: 0,
    flags: [],
    acceptedWeakSolution: false,
    caseProtected: false,
    caseAccepted: false,
    caseClosed: false,
    capacityToContinue: true,
    queueNumber: 12,
    departed: [],
    log: [],
    lastChoice: null,
  };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function mergeCounters(current: WaitingRoomCounters, delta: Partial<WaitingRoomCounters> = {}) {
  return Object.fromEntries(
    Object.entries(current).map(([key, value]) => [
      key,
      value + (delta[key as keyof WaitingRoomCounters] ?? 0),
    ])
  ) as WaitingRoomCounters;
}

function reducer(state: GameState, action: GameAction): GameState {
  if (action.type === "start") {
    return { ...state, stage: "playing", caseIndex: action.caseIndex };
  }

  if (action.type === "restart") return createInitialState();

  if (action.type === "choose") {
    if (state.lastChoice) return state;
    const effect = action.choice.effect;
    const meters = {
      patience: clamp(state.meters.patience + effect.delta.patience),
      dignity: clamp(state.meters.dignity + effect.delta.dignity),
      time: Math.max(0, state.meters.time + effect.delta.time),
    };
    const counters = mergeCounters(state.counters, effect.counters);
    const newlyDeparted = getWaitingRoomDepartureIds(meters, counters, state.departed);
    const departed = [...state.departed, ...newlyDeparted];
    const queueAdvance = effect.queueAdvance ?? ((state.log.length + 1) % 3 === 0 ? 1 : 0);

    return {
      ...state,
      meters,
      counters,
      status: effect.status,
      formalMovement: state.formalMovement + effect.formalMovement,
      realMovement: state.realMovement + effect.realMovement,
      connection: Math.max(0, state.connection + (effect.connection ?? 0)),
      patterns: Math.max(0, state.patterns + (effect.patterns ?? 0)),
      receipts: Math.max(0, state.receipts + (effect.receipts ?? 0)),
      concessions: Math.max(0, state.concessions + (effect.concessions ?? 0)),
      flags: Array.from(new Set([...state.flags, ...(effect.flags ?? [])])),
      acceptedWeakSolution: state.acceptedWeakSolution || Boolean(effect.acceptedWeakSolution),
      caseProtected: state.caseProtected || Boolean(effect.caseProtected),
      caseAccepted: state.caseAccepted || Boolean(effect.caseAccepted),
      caseClosed: effect.caseClosed ?? state.caseClosed,
      capacityToContinue: effect.capacityToContinue ?? state.capacityToContinue,
      queueNumber: Math.min(46, state.queueNumber + queueAdvance),
      departed,
      lastChoice: action.choice,
      log: [
        ...state.log,
        {
          decisionId: action.decisionId,
          choiceId: action.choice.id,
          response: action.choice.response,
          status: effect.status,
          formalMovement: effect.formalMovement,
          realMovement: effect.realMovement,
          elapsedTime: meters.time,
          departed: newlyDeparted,
        },
      ],
    };
  }

  if (!state.lastChoice) return state;

  if (state.decisionIndex + 1 < action.decisionCount) {
    return { ...state, decisionIndex: state.decisionIndex + 1, lastChoice: null };
  }

  if (state.phaseIndex + 1 < action.phaseCount) {
    return { ...state, phaseIndex: state.phaseIndex + 1, decisionIndex: 0, lastChoice: null };
  }

  return { ...state, stage: "result", lastChoice: null };
}

function unit(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

export function formatWaitingRoomTime(days: number, copy: WaitingRoomCopy) {
  if (days <= 90) return unit(days, copy.timeUnits.dayOne, copy.timeUnits.dayMany);

  if (days < 730) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return remainingDays
      ? `${unit(months, copy.timeUnits.monthOne, copy.timeUnits.monthMany)}, ${unit(remainingDays, copy.timeUnits.dayOne, copy.timeUnits.dayMany)}`
      : unit(months, copy.timeUnits.monthOne, copy.timeUnits.monthMany);
  }

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return months
    ? `${unit(years, copy.timeUnits.yearOne, copy.timeUnits.yearMany)}, ${unit(months, copy.timeUnits.monthOne, copy.timeUnits.monthMany)}`
    : unit(years, copy.timeUnits.yearOne, copy.timeUnits.yearMany);
}

function getRequirementReason(
  requirement: WaitingRoomRequirement | undefined,
  state: GameState,
  copy: WaitingRoomCopy
) {
  if (!requirement) return "";
  if (requirement.minPatience !== undefined && state.meters.patience < requirement.minPatience) return copy.requirementLabels.patience;
  if (requirement.minDignity !== undefined && state.meters.dignity < requirement.minDignity) return copy.requirementLabels.dignity;
  if (requirement.minReceipts !== undefined && state.receipts < requirement.minReceipts) return copy.requirementLabels.receipts;
  if (requirement.minConnection !== undefined && state.connection < requirement.minConnection) return copy.requirementLabels.connection;
  if (requirement.minPatterns !== undefined && state.patterns < requirement.minPatterns) return copy.requirementLabels.patterns;
  if (requirement.anyFlags?.length && !requirement.anyFlags.some((flag) => state.flags.includes(flag))) return copy.requirementLabels.support;
  return "";
}

function WaitingRoomMetersView({ copy, meters }: { copy: WaitingRoomCopy; meters: WaitingRoomMeters }) {
  const elapsed = formatWaitingRoomTime(meters.time, copy);
  return (
    <section className={styles.meters} aria-label={copy.metersLabel}>
      {[
        { label: copy.patienceLabel, value: meters.patience },
        { label: copy.dignityLabel, value: meters.dignity },
      ].map((entry) => (
        <div className={styles.meter} key={entry.label}>
          <div><span>{entry.label}</span><strong>{entry.value}</strong></div>
          <div className={styles.meterTrack} role="progressbar" aria-label={entry.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={entry.value}>
            <span style={{ inlineSize: `${entry.value}%` }} />
          </div>
        </div>
      ))}
      <div className={`${styles.meter} ${styles.timeMeter}`}>
        <span>{copy.timeLabel}</span>
        <strong aria-label={`${copy.timeLabel}: ${elapsed}`}>{elapsed}</strong>
      </div>
    </section>
  );
}

function WaitingRoomScene({ copy, state }: { copy: WaitingRoomCopy; state: GameState }) {
  const folderRatio = Math.min(100, state.log.length * 5 + state.counters.supplements * 9);
  const sceneStyle = {
    "--clock-hour": `${state.meters.time * 0.82}deg`,
    "--clock-minute": `${state.meters.time * 6.2}deg`,
    "--folder-depth": `${folderRatio}%`,
    "--room-emptiness": `${Math.min(100, state.departed.length * 19)}%`,
  } as CSSProperties;
  const monitorMessage = copy.monitorMessages[Math.min(copy.monitorMessages.length - 1, Math.floor(state.log.length / 4))];

  return (
    <div className={styles.roomFrame} style={sceneStyle}>
      <p className={styles.srOnly}>{copy.screenReaderRoomLabel} {copy.screenReaderClockLabel} {copy.screenReaderQueueLabel}</p>
      <div className={styles.room} aria-hidden="true">
        <div className={styles.fluorescent} />
        <div className={styles.clock}><span className={styles.hourHand} /><span className={styles.minuteHand} /><i /></div>
        <div className={styles.queueDisplay}>
          <small>{copy.queueServingLabel}</small>
          <strong>{String(state.queueNumber).padStart(2, "0")}</strong>
          <span>{monitorMessage}</span>
        </div>
        <div className={`${styles.door} ${state.queueNumber % 2 ? styles.doorOpen : ""}`}><span>{String(state.queueNumber + 1).padStart(2, "0")}</span></div>
        <div className={styles.counter}>
          <div className={styles.frostedGlass}><span>{copy.queueWaitingLabel}</span></div>
          <div className={styles.counterBase} />
        </div>
        <div className={styles.folder}>
          <span className={styles.folderTab}>{String(state.receipts).padStart(2, "0")}</span>
          {Array.from({ length: Math.min(8, Math.ceil(state.formalMovement / 2)) }).map((_, index) => <i key={index}>✓</i>)}
        </div>
        <div className={styles.chairs}>
          {WAITING_ROOM_PEOPLE.map((person) => {
            const hasLeft = state.departed.includes(person);
            return (
              <div className={`${styles.chair} ${hasLeft ? styles.emptyChair : ""}`} key={person}>
                <span className={styles.person} />
                <strong>{person}</strong>
              </div>
            );
          })}
        </div>
        <div className={styles.ticket}><small>{copy.queueYourNumberLabel}</small><strong>47</strong></div>
      </div>
    </div>
  );
}

function ProcessStatus({ copy, state }: { copy: WaitingRoomCopy; state: GameState }) {
  return (
    <section className={styles.processPanel} aria-label={copy.statusLabel}>
      <div className={styles.statusHeading}>
        <span>{copy.statusLabel}</span>
        <strong aria-live="polite">{copy.statuses[state.status]}</strong>
      </div>
      <div className={styles.movementGrid}>
        <div>
          <span>{copy.formalLabel}</span>
          <strong>{String(state.formalMovement).padStart(2, "0")}</strong>
          <div className={styles.formalMarks} aria-hidden="true">{Array.from({ length: Math.min(10, state.formalMovement) }).map((_, index) => <i key={index} />)}</div>
        </div>
        <div>
          <span>{copy.realLabel}</span>
          <strong>{String(state.realMovement).padStart(2, "0")}</strong>
          <div className={styles.realMarks} aria-hidden="true">{Array.from({ length: Math.min(10, state.realMovement) }).map((_, index) => <i key={index} />)}</div>
        </div>
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {copy.formalLabel}: {state.formalMovement}. {copy.realLabel}: {state.realMovement}.
      </p>
    </section>
  );
}

function OutcomeStats({ copy, state }: { copy: WaitingRoomCopy; state: GameState }) {
  const values = [
    [copy.resultStats.totalTime, formatWaitingRoomTime(state.meters.time, copy)],
    [copy.resultStats.visits, state.counters.visits],
    [copy.resultStats.calls, state.counters.calls],
    [copy.resultStats.supplements, state.counters.supplements],
    [copy.resultStats.redirects, state.counters.redirects],
    [copy.resultStats.retellings, state.counters.retellings],
    [copy.resultStats.proceduralResponses, state.counters.proceduralResponses],
    [copy.resultStats.concreteInformation, state.counters.concreteInformation],
    [copy.resultStats.peopleLeft, state.departed.length],
    [copy.resultStats.patience, state.meters.patience],
    [copy.resultStats.dignity, state.meters.dignity],
    [copy.resultStats.formalMovement, state.formalMovement],
    [copy.resultStats.realMovement, state.realMovement],
  ];

  return <div className={styles.resultStats}>{values.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

export function WaitingRoomGame({ copy }: { copy: WaitingRoomCopy }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [announcement, setAnnouncement] = useState(copy.welcomeLines.join(" "));
  const [shareStatus, setShareStatus] = useState("");
  const gameRef = useRef<HTMLElement | null>(null);
  const currentPhase = copy.phases[state.phaseIndex];
  const currentDecision = currentPhase?.decisions[state.decisionIndex];
  const totalDecisionCount = useMemo(() => copy.phases.reduce((sum, phase) => sum + phase.decisions.length, 0), [copy.phases]);
  const completedBeforePhase = copy.phases.slice(0, state.phaseIndex).reduce((sum, phase) => sum + phase.decisions.length, 0);
  const currentDecisionNumber = Math.min(totalDecisionCount, completedBeforePhase + state.decisionIndex + 1);
  const outcomeSummary: WaitingRoomOutcomeSummary = {
    meters: state.meters,
    counters: state.counters,
    formalMovement: state.formalMovement,
    realMovement: state.realMovement,
    connection: state.connection,
    patterns: state.patterns,
    receipts: state.receipts,
    concessions: state.concessions,
    flags: state.flags,
    acceptedWeakSolution: state.acceptedWeakSolution,
    caseProtected: state.caseProtected,
    caseAccepted: state.caseAccepted,
    caseClosed: state.caseClosed,
    capacityToContinue: state.capacityToContinue,
  };
  const ending = copy.endings[getWaitingRoomEnding(outcomeSummary)];

  function focusGame() {
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  function startGame() {
    const caseIndex = Math.floor(Math.random() * copy.caseTypes.length);
    dispatch({ type: "start", caseIndex });
    setAnnouncement(`${copy.caseLabel}: ${copy.caseTypes[caseIndex]}. ${copy.phases[0].scenario}`);
    focusGame();
  }

  function choose(choice: WaitingRoomChoice) {
    if (state.lastChoice || !currentDecision) return;
    const reason = getRequirementReason(choice.requirement, state, copy);
    if (reason) return;
    const previousDepartures = state.departed.length;
    dispatch({ type: "choose", choice, decisionId: currentDecision.id });
    const status = copy.statuses[choice.effect.status];
    setAnnouncement(`${choice.response} ${copy.statusLabel}: ${status}. ${copy.formalLabel}: +${choice.effect.formalMovement}. ${copy.realLabel}: +${choice.effect.realMovement}.`);
    if (previousDepartures < WAITING_ROOM_PEOPLE.length) focusGame();
  }

  function advance() {
    if (!state.lastChoice || !currentPhase) return;
    const movingToResult = state.phaseIndex === copy.phases.length - 1 && state.decisionIndex === currentPhase.decisions.length - 1;
    const movingToNextPhase = state.decisionIndex === currentPhase.decisions.length - 1 && !movingToResult;
    const nextPhase = movingToNextPhase ? copy.phases[state.phaseIndex + 1] : currentPhase;
    dispatch({ type: "advance", phaseCount: copy.phases.length, decisionCount: currentPhase.decisions.length });
    if (movingToResult) setAnnouncement(`${ending.title}. ${ending.copy}`);
    else if (movingToNextPhase) setAnnouncement(`${nextPhase.title}. ${nextPhase.scenario}`);
    else setAnnouncement(`${copy.decisionLabel} ${currentDecisionNumber + 1}`);
    focusGame();
  }

  function restart() {
    dispatch({ type: "restart" });
    setShareStatus("");
    setAnnouncement(copy.welcomeLines.join(" "));
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
    document.getElementById("sta-se-desilo-cekaonica")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  const newDepartures = state.log.at(-1)?.departed ?? [];

  return (
    <section ref={gameRef} className={`${styles.game} ${styles[`phase${currentPhase?.id ?? 1}`]}`} tabIndex={-1} aria-label={copy.gameTitle}>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</p>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {copy.queueServingLabel}: {state.queueNumber}. {copy.timeLabel}: {formatWaitingRoomTime(state.meters.time, copy)}.
      </p>

      {state.stage === "intro" ? (
        <div className={styles.intro}>
          <WaitingRoomScene copy={copy} state={state} />
          <div className={styles.introCopy}>
            <span className={styles.microLabel}>{copy.typeLabel}</span>
            <h2>{copy.gameTitle}</h2>
            <p className={styles.subtitle}>{copy.gameSubtitle}</p>
            <div className={styles.welcome}>{copy.welcomeLines.map((line) => <span key={line}>{line}</span>)}</div>
            <div className={styles.introNumbers}>
              <span><small>{copy.queueYourNumberLabel}</small><strong>47</strong></span>
              <span><small>{copy.queueServingLabel}</small><strong>12</strong></span>
            </div>
            <button type="button" className={styles.primaryAction} onClick={startGame}>{copy.startLabel}</button>
          </div>
        </div>
      ) : null}

      {state.stage === "playing" && currentPhase && currentDecision ? (
        <div className={styles.playing}>
          <header className={styles.gameHeader}>
            <div>
              <span className={styles.microLabel}>{currentPhase.label}</span>
              <h2>{currentPhase.title}</h2>
              <p>{currentPhase.theme}</p>
            </div>
            <div className={styles.decisionCounter}><span>{copy.decisionLabel}</span><strong>{String(currentDecisionNumber).padStart(2, "0")}</strong><small>/ {totalDecisionCount}</small></div>
          </header>

          <div className={styles.progressLine}><span style={{ inlineSize: `${(currentDecisionNumber / totalDecisionCount) * 100}%` }} /></div>
          <WaitingRoomMetersView copy={copy} meters={state.meters} />

          <div className={styles.playGrid}>
            <div className={styles.roomColumn}>
              <WaitingRoomScene copy={copy} state={state} />
              {newDepartures.length ? (
                <div className={styles.departureNotice} role="status">
                  {newDepartures.map((id) => <p key={id}>{copy.people[id as keyof typeof copy.people].departure}</p>)}
                </div>
              ) : null}
            </div>
            <aside className={styles.caseColumn}>
              <div className={styles.caseCard}><span>{copy.caseLabel}</span><strong>{copy.caseTypes[state.caseIndex]}</strong></div>
              <ProcessStatus copy={copy} state={state} />
              {currentPhase.id === 4 ? (
                <div className={styles.connectionPanel}>
                  <span>{copy.connectionLabel}</span><strong>{state.connection}</strong>
                  <small>{copy.receiptsLabel}: {state.receipts} · {copy.patternsLabel}: {state.patterns}</small>
                </div>
              ) : null}
              {state.departed.length ? (
                <div className={styles.departureLog}>
                  <span>{copy.departuresLabel}</span>
                  {state.departed.map((id) => <p key={id}>{copy.people[id as keyof typeof copy.people].departure}</p>)}
                </div>
              ) : null}
            </aside>
          </div>

          <section className={styles.decisionPanel}>
            <div className={styles.decisionLead}>
              <span className={styles.microLabel}>{copy.choicesLabel}</span>
              <h3>{currentDecision.prompt}</h3>
              <p>{currentDecision.detail}</p>
            </div>
            <div className={styles.choices}>
              {currentDecision.choices.map((choice, index) => {
                const reason = getRequirementReason(choice.requirement, state, copy);
                const disabled = Boolean(state.lastChoice) || Boolean(reason);
                const reasonId = `${currentDecision.id}-${choice.id}-reason`;
                return (
                  <button
                    type="button"
                    className={`${styles.choice} ${state.lastChoice?.id === choice.id ? styles.choiceSelected : ""}`}
                    disabled={disabled}
                    aria-describedby={reason ? reasonId : undefined}
                    onClick={() => choose(choice)}
                    key={choice.id}
                  >
                    <span className={styles.choiceIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{choice.action}</strong>
                    {reason ? <small id={reasonId}>{reason}</small> : null}
                  </button>
                );
              })}
            </div>
          </section>

          {state.lastChoice ? (
            <div className={styles.responsePanel}>
              <div><span className={styles.microLabel}>{copy.statusLabel}: {copy.statuses[state.status]}</span><p>{state.lastChoice.response}</p></div>
              <button type="button" className={styles.continueAction} onClick={advance}>{copy.continueLabel}</button>
            </div>
          ) : null}

          {state.log.length ? (
            <details className={styles.procedureLog}>
              <summary>{copy.logLabel} · {state.log.length}</summary>
              <ol>{state.log.slice().reverse().slice(0, 8).map((entry, index) => <li key={`${entry.decisionId}-${entry.choiceId}-${index}`}><span>{formatWaitingRoomTime(entry.elapsedTime, copy)}</span><strong>{copy.statuses[entry.status]}</strong><p>{entry.response}</p></li>)}</ol>
            </details>
          ) : null}
        </div>
      ) : null}

      {state.stage === "result" ? (
        <div className={styles.result}>
          <WaitingRoomScene copy={copy} state={state} />
          <div className={styles.resultCopy}>
            <span className={styles.microLabel}>{ending.eyebrow}</span>
            <h2>{ending.title}</h2>
            <p>{ending.copy}</p>
            <blockquote>{ending.note}</blockquote>
          </div>
          <ProcessStatus copy={copy} state={state} />
          <OutcomeStats copy={copy} state={state} />
          {state.departed.length ? <div className={styles.finalDepartures}><h3>{copy.departuresLabel}</h3>{state.departed.map((id) => <p key={id}>{copy.people[id as keyof typeof copy.people].departure}</p>)}</div> : null}
          <div className={styles.resultActions}>
            <button type="button" className={styles.primaryAction} onClick={scrollToContext}>{copy.understandLabel}</button>
            <button type="button" className={styles.secondaryAction} onClick={restart}>{copy.restartLabel}</button>
            <button type="button" className={styles.secondaryAction} onClick={share}>{copy.shareLabel}</button>
          </div>
          <p className={styles.shareStatus} role="status">{shareStatus}</p>
        </div>
      ) : null}
    </section>
  );
}
