"use client";

import { useReducer, useState } from "react";

import styles from "@/components/neutral-man-game.module.css";
import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import {
  applyNeutralManChoice,
  createInitialNeutralManState,
  currentNeutralManDecision,
  neutralManMirrorKind,
  restartNeutralManGame,
  startNeutralManGame,
  type NeutralManChoiceKind,
  type NeutralManState,
} from "@/lib/neutral-man-interactive";
import type { NeutralManLocaleCopy } from "@/lib/neutral-man-interactive-copy";

type NeutralManGameProps = {
  copy: NeutralManLocaleCopy;
  lang: Lang;
};

type GameAction =
  | { type: "start" }
  | { type: "choose"; choiceId: string }
  | { type: "restart" };

function gameReducer(state: NeutralManState, action: GameAction): NeutralManState {
  if (action.type === "start") return startNeutralManGame(state);
  if (action.type === "choose") return applyNeutralManChoice(state, action.choiceId);
  return restartNeutralManGame();
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricHead}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div
        className={styles.metricTrack}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Metrics({ copy, state }: { copy: NeutralManLocaleCopy; state: NeutralManState }) {
  return (
    <div className={styles.metrics}>
      <Metric label={copy.metricPeace} value={state.metrics.peace} />
      <Metric label={copy.metricReputation} value={state.metrics.reputation} />
      <Metric label={copy.metricSolidarity} value={state.metrics.solidarity} />
      <Metric label={copy.metricBoundary} value={state.metrics.boundary} />
    </div>
  );
}

function Community({ copy, state }: { copy: NeutralManLocaleCopy; state: NeutralManState }) {
  const recent = state.log.slice(-3).reverse();

  return (
    <aside className={styles.community} aria-label={copy.communityLabel}>
      <div className={styles.communityHead}>
        <span>{copy.communityLabel}</span>
        <strong>{state.counters.communityPresence} / 8</strong>
      </div>
      <div className={styles.people} aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span
            className={index < state.counters.communityPresence ? styles.person : styles.personGone}
            key={index}
          >
            <i />
          </span>
        ))}
      </div>
      <div className={styles.echoes} aria-live="polite">
        {recent.length ? (
          recent.map((entry, index) => (
            <p key={`${entry.decisionId}-${index}`}>{copy.mirrors[entry.choiceKind]}</p>
          ))
        ) : (
          <p>{copy.introCopy}</p>
        )}
      </div>
    </aside>
  );
}

export function NeutralManGame({ copy, lang }: NeutralManGameProps) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialNeutralManState);
  const [shared, setShared] = useState(false);
  const decision = currentNeutralManDecision(state);
  const situation = copy.situations[state.decisionIndex];
  const ending = state.endingId ? copy.endings[state.endingId] : null;
  const isRtl = lang === "ar";
  const sterileClass =
    state.counters.neutralStatements >= 4
      ? styles.sterileHigh
      : state.counters.neutralStatements >= 2
        ? styles.sterileMedium
        : "";

  async function shareResult() {
    if (!ending) return;
    const text = `${copy.shareText} ${ending.title}`;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: copy.gameTitle, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared(true);
      }
    } catch {
      return;
    }
  }

  const choiceCounts = state.log.reduce<Record<NeutralManChoiceKind, number>>(
    (counts, entry) => ({ ...counts, [entry.choiceKind]: counts[entry.choiceKind] + 1 }),
    { boundary: 0, private: 0, neutral: 0, impulsive: 0 },
  );

  return (
    <section className={`${styles.game} ${sterileClass}`} dir={isRtl ? "rtl" : "ltr"}>
      {state.stage === "intro" ? (
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <span className={styles.panelLabel}>{copy.introEyebrow}</span>
            <h2>{copy.introTitle}</h2>
            <p>{copy.introCopy}</p>
            <button className={styles.primaryButton} type="button" onClick={() => dispatch({ type: "start" })}>
              {copy.startLabel}
            </button>
          </div>
          <div className={styles.introScene} aria-hidden="true">
            <div className={styles.introCrowd}>
              {Array.from({ length: 11 }, (_, index) => <span key={index}><i /></span>)}
            </div>
            <div className={styles.introAxis}><span /></div>
            <p>{copy.gameSubtitle}</p>
          </div>
        </div>
      ) : null}

      {state.stage === "playing" && decision && situation ? (
        <div className={styles.playing}>
          <header className={styles.gameHeader}>
            <div>
              <span className={styles.panelLabel}>{copy.gameTitle}</span>
              <h2>{copy.situationLabel} {state.decisionIndex + 1}</h2>
            </div>
            <div className={styles.progress} aria-label={`${state.decisionIndex + 1} / 6`}>
              <span>{String(state.decisionIndex + 1).padStart(2, "0")} / 06</span>
              <i><b style={{ width: `${((state.decisionIndex + 1) / 6) * 100}%` }} /></i>
            </div>
          </header>

          <Metrics copy={copy} state={state} />

          <div className={styles.decisionLayout}>
            <article className={styles.situation}>
              <span className={styles.panelLabel}>{copy.situationLabel}</span>
              <h3>{situation.title}</h3>
              <p>{situation.body}</p>
              {state.decisionIndex === 5 && state.log.length ? (
                <blockquote>
                  <small>{copy.mirrorLabel}</small>
                  <strong>{copy.mirrors[neutralManMirrorKind(state)]}</strong>
                </blockquote>
              ) : null}
            </article>

            <div className={styles.choices} aria-label={copy.decisionLabel}>
              {decision.choices.map((choice, index) => {
                const choiceCopy = situation.choices[index];
                return (
                  <button
                    key={choice.id}
                    className={styles.choice}
                    data-kind={choice.kind}
                    type="button"
                    onClick={() => dispatch({ type: "choose", choiceId: choice.id })}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{choiceCopy.label}</strong>
                    <small>{choiceCopy.detail}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <Community copy={copy} state={state} />
        </div>
      ) : null}

      {state.stage === "result" && ending ? (
        <div className={styles.result}>
          <div className={styles.resultLead}>
            <span className={styles.panelLabel}>{copy.resultEyebrow}</span>
            <h2>{ending.title}</h2>
            <p>{ending.body}</p>
            <div className={styles.resultActions}>
              <button className={styles.primaryButton} type="button" onClick={() => dispatch({ type: "restart" })}>
                {copy.restartLabel}
              </button>
              <button className={styles.secondaryButton} type="button" onClick={shareResult}>
                {shared ? copy.sharedLabel : copy.shareLabel}
              </button>
              <a className={styles.secondaryButton} href={`${withLang("/interaktivno/neutralni-covek", lang)}#sta-se-desilo-neutralni-covek`}>
                {copy.contextLabel}
              </a>
            </div>
          </div>

          <div className={styles.resultData}>
            <section>
              <h3>{copy.resultMetricsTitle}</h3>
              <Metrics copy={copy} state={state} />
            </section>
            <section>
              <h3>{copy.resultChoicesTitle}</h3>
              <div className={styles.choiceSummary}>
                {(Object.keys(choiceCounts) as NeutralManChoiceKind[]).map((kind) => (
                  <div key={kind}>
                    <span>{copy.choiceKinds[kind]}</span>
                    <strong>{choiceCounts[kind]}</strong>
                  </div>
                ))}
              </div>
            </section>
            <Community copy={copy} state={state} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
