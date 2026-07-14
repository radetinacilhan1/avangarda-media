"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import styles from "@/components/algorithm-game.module.css";
import {
  ALGORITHM_DECISIONS,
  ALGORITHM_TOPIC_IDS,
  applyAlgorithmChoice,
  createInitialAlgorithmState,
  currentAlgorithmDay,
  currentAlgorithmDecision,
  isAlgorithmChoiceAvailable,
  restartAlgorithmGame,
  shouldRevealCapacity,
  startAlgorithmGame,
  totalAlgorithmAnalytics,
  type AlgorithmChoiceId,
  type AlgorithmMetrics,
  type AlgorithmState,
} from "@/lib/algorithm-interactive";
import type { AlgorithmLocaleCopy } from "@/lib/algorithm-interactive-copy";
import type { Lang } from "@/lib/i18n";

type Props = {
  copy: AlgorithmLocaleCopy;
  lang: Lang;
};

type Action =
  | { type: "start" }
  | { type: "choose"; choiceId: AlgorithmChoiceId }
  | { type: "restart" };

function reducer(state: AlgorithmState, action: Action): AlgorithmState {
  if (action.type === "start") return startAlgorithmGame(state);
  if (action.type === "restart") return restartAlgorithmGame();
  return applyAlgorithmChoice(state, action.choiceId);
}

function Metric({ label, value, capacity = false, copy }: { label: string; value: number; capacity?: boolean; copy: AlgorithmLocaleCopy }) {
  return (
    <div className={`${styles.metric} ${capacity ? styles.capacityMetric : ""}`}>
      <div className={styles.metricHeader}>
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>
      <div
        className={styles.metricTrack}
        role="meter"
        aria-label={`${copy.a11yMetricLabel}: ${label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Metrics({ metrics, revealCapacity, copy }: { metrics: AlgorithmMetrics; revealCapacity: boolean; copy: AlgorithmLocaleCopy }) {
  return (
    <div className={styles.metricsGrid}>
      <Metric label={copy.metricTruth} value={metrics.truth} copy={copy} />
      <Metric label={copy.metricReach} value={metrics.reach} copy={copy} />
      <Metric label={copy.metricTrust} value={metrics.trust} copy={copy} />
      {revealCapacity ? <Metric label={copy.capacityTitle} value={metrics.capacity} capacity copy={copy} /> : null}
    </div>
  );
}

function LowMetricWarnings({ state, copy }: { state: AlgorithmState; copy: AlgorithmLocaleCopy }) {
  const warnings = [
    state.metrics.truth < 45 ? copy.lowMetricWarnings.truth : null,
    state.metrics.reach < 35 ? copy.lowMetricWarnings.reach : null,
    state.metrics.trust < 45 ? copy.lowMetricWarnings.trust : null,
    state.metrics.capacity < 30 ? copy.lowMetricWarnings.capacity : null,
  ].filter(Boolean) as string[];
  if (!warnings.length) return null;
  return (
    <div className={styles.warningStrip} role="status">
      {warnings.map((warning) => <p key={warning}>{warning}</p>)}
    </div>
  );
}

function TopicQueue({ state, copy }: { state: AlgorithmState; copy: AlgorithmLocaleCopy }) {
  return (
    <aside className={styles.topicPanel} aria-labelledby="algorithm-topics-title">
      <div className={styles.panelLabel} id="algorithm-topics-title">{copy.topicsLabel}</div>
      <div className={styles.topicList}>
        {ALGORITHM_TOPIC_IDS.map((topicId, index) => {
          const status = state.topicStatus[topicId];
          return (
            <article className={`${styles.topicRow} ${styles[`topic_${status}`]}`} key={topicId}>
              <span className={styles.topicIndex}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{copy.topics[topicId].title}</h3>
                <p>{copy.topics[topicId].body}</p>
              </div>
              <small>{copy.topicStatus[status]}</small>
            </article>
          );
        })}
      </div>
    </aside>
  );
}

function AlgorithmSignal({ state, copy, day }: { state: AlgorithmState; copy: AlgorithmLocaleCopy; day: number }) {
  const latestStory = state.stories[state.stories.length - 1];
  const eventId = state.lastEventId || latestStory?.eventId || null;
  const event = eventId ? copy.events[eventId] : null;
  const dayCopy = copy.days[day as 1 | 2 | 3 | 4 | 5];

  return (
    <aside className={styles.signalPanel} aria-labelledby="algorithm-signal-title">
      <div className={styles.panelLabel} id="algorithm-signal-title">{copy.algorithmLabel}</div>
      <div className={styles.signalGraph} aria-hidden="true">
        <span /><span /><span /><span /><span />
        <i style={{ insetInlineStart: `${Math.max(8, Math.min(88, state.metrics.reach))}%` }} />
      </div>
      <div className={styles.signalStatus}>
        <span>{copy.metricReach}</span>
        <strong>{Math.round(state.metrics.reach)}</strong>
      </div>
      {day >= 2 ? (
        <div className={styles.eventBox}>
          <small>{copy.latestEventLabel}</small>
          <h3>{event?.title || dayCopy.title}</h3>
          <p>{event?.body || dayCopy.pressure}</p>
        </div>
      ) : (
        <p className={styles.signalHint}>{dayCopy.pressure}</p>
      )}
      {day >= 4 ? (
        <div className={styles.pressureRows} aria-label={copy.days[4].title}>
          <span><i style={{ width: `${Math.max(18, state.metrics.reach)}%` }} />{copy.metricReach}</span>
          <span><i style={{ width: `${Math.max(18, 100 - state.metrics.capacity)}%` }} />{copy.capacityTitle}</span>
          <span><i style={{ width: `${Math.max(18, state.metrics.trust)}%` }} />{copy.metricTrust}</span>
        </div>
      ) : null}
    </aside>
  );
}

function AnalyticsTable({ state, copy }: { state: AlgorithmState; copy: AlgorithmLocaleCopy }) {
  const story = state.stories[state.stories.length - 1];
  if (!story) return null;
  const analytics = story.analytics;
  const values = [
    [copy.analytics.views, analytics.views],
    [copy.analytics.opens, analytics.opens],
    [copy.analytics.completionByFormat[story.format], analytics.completions],
    [copy.analytics.sourceOpens, analytics.sourceOpens],
    [copy.analytics.comments, analytics.comments],
    [copy.analytics.shares, analytics.shares],
    [copy.analytics.saves, analytics.saves],
    [copy.analytics.reports, analytics.reports],
    [copy.analytics.exits, analytics.exits],
  ] as const;
  return (
    <section className={styles.analyticsPanel} aria-labelledby="algorithm-analytics-title">
      <div className={styles.analyticsHeading}>
        <div>
          <span className={styles.panelLabel} id="algorithm-analytics-title">{copy.analyticsLabel}</span>
          <h3>{copy.topics[story.topicId].title}</h3>
        </div>
        <span>{copy.formats[story.format]}</span>
      </div>
      <div className={styles.analyticsGrid}>
        {values.map(([label, value]) => (
          <div key={label}><span>{label}</span><strong>{new Intl.NumberFormat().format(value)}</strong></div>
        ))}
      </div>
    </section>
  );
}

function EditorialLog({ state, copy }: { state: AlgorithmState; copy: AlgorithmLocaleCopy }) {
  return (
    <section className={styles.logPanel} aria-labelledby="algorithm-log-title">
      <div className={styles.panelLabel} id="algorithm-log-title">{copy.logLabel}</div>
      <ol>
        {state.log.map((entry, index) => (
          <li key={`${entry.decisionId}-${index}`}>
            <span>{copy.dayLabel} {entry.day}</span>
            <strong>{copy.choices[entry.choiceId].label}</strong>
            <small>{copy.metricTruth} {Math.round(entry.metrics.truth)} · {copy.metricReach} {Math.round(entry.metrics.reach)} · {copy.metricTrust} {Math.round(entry.metrics.trust)}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Intro({ copy, onStart }: { copy: AlgorithmLocaleCopy; onStart: () => void }) {
  return (
    <section className={styles.intro}>
      <div className={styles.introCopy}>
        <span className={styles.panelLabel}>{copy.introEyebrow}</span>
        <h2>{copy.introTitle}</h2>
        <p>{copy.introCopy}</p>
        <button type="button" className="button-primary" onClick={onStart}>{copy.startLabel}</button>
      </div>
      <div className={styles.introVisual} aria-hidden="true">
        <div className={styles.draftWindow}>
          <span>{copy.listingDraftLabel}</span>
          <b /><b /><b />
          <em>{copy.listingPublishedLabel}</em>
        </div>
        <div className={styles.reachWindow}>
          <span>{copy.metricReach}</span>
          <div><i /><i /><i /><i /><i /></div>
          <strong>{copy.listingNotRecommendedLabel}</strong>
        </div>
      </div>
    </section>
  );
}

function Result({ state, copy, onRestart, onShare, shareStatus }: { state: AlgorithmState; copy: AlgorithmLocaleCopy; onRestart: () => void; onShare: () => void; shareStatus: string }) {
  const ending = copy.endings[state.endingId || "still-in-feed"];
  const totals = totalAlgorithmAnalytics(state.stories);
  return (
    <section className={styles.result}>
      <div className={styles.resultLead}>
        <span className={styles.panelLabel}>{copy.resultEyebrow}</span>
        <h2>{ending.title}</h2>
        <p>{ending.body}</p>
        <div className={styles.resultActions}>
          <button type="button" className="button-primary" onClick={onRestart}>{copy.restartLabel}</button>
          <button type="button" className="button-secondary" onClick={onShare}>{copy.shareLabel}</button>
          <a className="button-secondary" href="#sta-se-desilo-algoritam">{copy.contextLabel}</a>
        </div>
        <span className={styles.shareStatus} role="status">{shareStatus}</span>
      </div>

      <div className={styles.resultMetrics}>
        <h3>{copy.resultMetricsTitle}</h3>
        <Metrics metrics={state.metrics} revealCapacity copy={copy} />
      </div>

      <div className={styles.totalStats}>
        {[copy.analytics.views, copy.analytics.sourceOpens, copy.analytics.saves, copy.analytics.reports].map((label, index) => {
          const value = [totals.views, totals.sourceOpens, totals.saves, totals.reports][index];
          return <div key={label}><span>{label}</span><strong>{new Intl.NumberFormat().format(value)}</strong></div>;
        })}
      </div>

      <div className={styles.storyResults}>
        <h3>{copy.resultStoriesTitle}</h3>
        {state.stories.map((story, index) => (
          <article key={`${story.topicId}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{copy.topics[story.topicId].title}</strong><small>{copy.formats[story.format]}</small></div>
            <b>{new Intl.NumberFormat().format(story.analytics.views)}</b>
          </article>
        ))}
      </div>

      <EditorialLog state={state} copy={copy} />
    </section>
  );
}

export function AlgorithmGame({ copy, lang }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialAlgorithmState);
  const [shareStatus, setShareStatus] = useState("");
  const liveRegion = useRef<HTMLParagraphElement>(null);
  const decisionHeading = useRef<HTMLHeadingElement>(null);
  const decision = currentAlgorithmDecision(state);
  const day = currentAlgorithmDay(state);
  const revealCapacity = shouldRevealCapacity(state);
  const progress = Math.round((state.decisionIndex / ALGORITHM_DECISIONS.length) * 100);

  const warningCount = useMemo(() => [state.metrics.truth < 45, state.metrics.reach < 35, state.metrics.trust < 45, state.metrics.capacity < 30].filter(Boolean).length, [state.metrics]);

  useEffect(() => {
    if (state.stage === "playing" && state.decisionIndex > 0) {
      if (liveRegion.current) liveRegion.current.textContent = copy.a11yDecisionChanged;
      decisionHeading.current?.focus({ preventScroll: true });
    }
  }, [copy.a11yDecisionChanged, state.decisionIndex, state.stage]);

  async function shareResult() {
    const text = `${copy.shareText} ${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: copy.gameTitle, text, url: window.location.href });
      else await navigator.clipboard.writeText(text);
      setShareStatus(copy.sharedLabel);
    } catch {
      setShareStatus("");
    }
  }

  if (state.stage === "intro") {
    return <div className={styles.game} dir={lang === "ar" ? "rtl" : "ltr"}><Intro copy={copy} onStart={() => dispatch({ type: "start" })} /></div>;
  }

  if (state.stage === "result") {
    return (
      <div className={styles.game} dir={lang === "ar" ? "rtl" : "ltr"}>
        <Result state={state} copy={copy} onRestart={() => dispatch({ type: "restart" })} onShare={shareResult} shareStatus={shareStatus} />
      </div>
    );
  }

  if (!decision) return null;
  const dayCopy = copy.days[day as 1 | 2 | 3 | 4 | 5];

  return (
    <section className={styles.game} dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className={styles.gameHeader}>
        <div>
          <span className={styles.panelLabel}>{copy.dayLabel} {day} / 5</span>
          <h2>{dayCopy.title}</h2>
          <p>{dayCopy.pressure}</p>
        </div>
        <div className={styles.progressWrap} aria-label={`${copy.decisionLabel} ${state.decisionIndex + 1} / ${ALGORITHM_DECISIONS.length}`}>
          <span>{String(state.decisionIndex + 1).padStart(2, "0")} / {ALGORITHM_DECISIONS.length}</span>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <Metrics metrics={state.metrics} revealCapacity={revealCapacity} copy={copy} />
      {revealCapacity ? <p className={styles.capacityExplanation}>{copy.capacityCopy}</p> : null}
      {warningCount ? <LowMetricWarnings state={state} copy={copy} /> : null}

      <div className={styles.dashboard}>
        <TopicQueue state={state} copy={copy} />

        <section className={styles.editorPanel} aria-labelledby="algorithm-editor-title">
          <span className={styles.panelLabel}>{copy.editorLabel}</span>
          <p className={styles.decisionCount}>{copy.decisionLabel} {state.decisionIndex + 1}</p>
          <h2 id="algorithm-editor-title" ref={decisionHeading} tabIndex={-1}>{copy.decisions[decision.id].title}</h2>
          <p>{copy.decisions[decision.id].body}</p>

          <div className={styles.choiceGrid}>
            {decision.choiceIds.map((choiceId) => {
              const available = isAlgorithmChoiceAvailable(state, choiceId);
              const choiceCopy = copy.choices[choiceId];
              return (
                <button
                  type="button"
                  className={styles.choiceButton}
                  key={choiceId}
                  disabled={!available}
                  aria-describedby={!available ? `${choiceId}-reason` : undefined}
                  onClick={() => dispatch({ type: "choose", choiceId })}
                >
                  <strong>{choiceCopy.label}</strong>
                  <span>{choiceCopy.detail}</span>
                  {!available ? <small id={`${choiceId}-reason`}>{copy.unavailableLabel}</small> : null}
                </button>
              );
            })}
          </div>
        </section>

        <AlgorithmSignal state={state} copy={copy} day={day} />
      </div>

      {state.stories.length ? <AnalyticsTable state={state} copy={copy} /> : null}
      {day >= 5 ? <EditorialLog state={state} copy={copy} /> : null}
      <p className="sr-only" ref={liveRegion} aria-live="polite" />
    </section>
  );
}
