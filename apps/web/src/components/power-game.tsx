"use client";

import { useMemo, useRef, useState } from "react";

import type {
  InteractiveCopy,
  PowerChoice,
  PowerMeters,
  PowerOutcomeCategory,
} from "@/lib/interactive";

import styles from "./power-game.module.css";

type PowerGameProps = {
  copy: InteractiveCopy;
};

type GamePhase = "intro" | "playing" | "result";

type ChoiceLogEntry = {
  decisionId: string;
  choiceId: string;
  category: PowerOutcomeCategory;
  delta: PowerMeters;
};

const initialMeters: PowerMeters = {
  agency: 100,
  visibility: 100,
  compliance: 0,
};

function clampMeter(value: number) {
  return Math.min(100, Math.max(0, value));
}

function applyDelta(current: PowerMeters, delta: PowerMeters): PowerMeters {
  return {
    agency: clampMeter(current.agency + delta.agency),
    visibility: clampMeter(current.visibility + delta.visibility),
    compliance: clampMeter(current.compliance + delta.compliance),
  };
}

function getCategoryLabel(copy: InteractiveCopy, category: PowerOutcomeCategory) {
  if (category === "changed") return copy.changedLabel;
  if (category === "symbolic") return copy.symbolicLabel;
  return copy.shapedLabel;
}

function getDominantCategory(counts: Record<PowerOutcomeCategory, number>): PowerOutcomeCategory {
  const ordered: PowerOutcomeCategory[] = ["shaped", "symbolic", "changed"];
  return ordered.reduce((dominant, category) =>
    counts[category] > counts[dominant] ? category : dominant
  );
}

function PowerGameMeters({ copy, meters }: { copy: InteractiveCopy; meters: PowerMeters }) {
  const entries = [
    { key: "agency", label: copy.agencyLabel, value: meters.agency },
    { key: "visibility", label: copy.visibilityLabel, value: meters.visibility },
    { key: "compliance", label: copy.complianceLabel, value: meters.compliance },
  ] as const;

  return (
    <section className={styles.meters} aria-label={copy.metersLabel}>
      {entries.map((entry) => (
        <div className={styles.meter} key={entry.key}>
          <div className={styles.meterHeader}>
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
          </div>
          <div
            className={styles.meterTrack}
            role="progressbar"
            aria-label={entry.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={entry.value}
          >
            <span className={styles.meterValue} style={{ inlineSize: `${entry.value}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}

export function PowerGame({ copy }: PowerGameProps) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [levelIndex, setLevelIndex] = useState(0);
  const [decisionIndex, setDecisionIndex] = useState(0);
  const [meters, setMeters] = useState<PowerMeters>(initialMeters);
  const [log, setLog] = useState<ChoiceLogEntry[]>([]);
  const [lastChoice, setLastChoice] = useState<PowerChoice | null>(null);
  const [announcement, setAnnouncement] = useState(copy.introStatement);
  const [shareStatus, setShareStatus] = useState("");
  const gameRef = useRef<HTMLElement | null>(null);

  const totalDecisionCount = useMemo(
    () => copy.levels.reduce((total, level) => total + level.decisions.length, 0),
    [copy.levels]
  );
  const currentLevel = copy.levels[levelIndex];
  const currentDecision = currentLevel?.decisions[decisionIndex];
  const completedBeforeCurrentLevel = copy.levels
    .slice(0, levelIndex)
    .reduce((total, level) => total + level.decisions.length, 0);
  const currentDecisionNumber = Math.min(
    totalDecisionCount,
    completedBeforeCurrentLevel + decisionIndex + 1
  );

  const categoryCounts = useMemo(
    () =>
      log.reduce<Record<PowerOutcomeCategory, number>>(
        (counts, entry) => ({ ...counts, [entry.category]: counts[entry.category] + 1 }),
        { shaped: 0, symbolic: 0, changed: 0 }
      ),
    [log]
  );
  const dominantCategory = getDominantCategory(categoryCounts);
  const resultVariant = copy.resultVariants[dominantCategory];

  function focusGame() {
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  function startGame() {
    setPhase("playing");
    setAnnouncement(`${copy.levels[0].label}: ${copy.levels[0].title}`);
    focusGame();
  }

  function choose(choice: PowerChoice) {
    if (choice.disabled || lastChoice) return;

    const nextMeters = applyDelta(meters, choice.delta);
    setMeters(nextMeters);
    setLog((entries) => [
      ...entries,
      {
        decisionId: currentDecision.id,
        choiceId: choice.id,
        category: choice.category,
        delta: choice.delta,
      },
    ]);
    setLastChoice(choice);
    setAnnouncement(
      [choice.thought, choice.response, getCategoryLabel(copy, choice.category)]
        .filter(Boolean)
        .join(" ")
    );
  }

  function advance() {
    if (!lastChoice) return;

    const hasNextDecision = decisionIndex + 1 < currentLevel.decisions.length;
    if (hasNextDecision) {
      setDecisionIndex((index) => index + 1);
      setLastChoice(null);
      setAnnouncement(
        `${copy.decisionLabel} ${currentDecisionNumber + 1} ${copy.choicesLabel.toLowerCase()}`
      );
      focusGame();
      return;
    }

    const hasNextLevel = levelIndex + 1 < copy.levels.length;
    if (hasNextLevel) {
      const nextLevel = copy.levels[levelIndex + 1];
      setLevelIndex((index) => index + 1);
      setDecisionIndex(0);
      setLastChoice(null);
      setAnnouncement(`${nextLevel.label}: ${nextLevel.title}. ${nextLevel.theme}`);
      focusGame();
      return;
    }

    setPhase("result");
    setLastChoice(null);
    setAnnouncement(`${copy.resultTitle} ${copy.resultCopy}`);
    focusGame();
  }

  function restart() {
    setPhase("intro");
    setLevelIndex(0);
    setDecisionIndex(0);
    setMeters(initialMeters);
    setLog([]);
    setLastChoice(null);
    setShareStatus("");
    setAnnouncement(copy.introStatement);
    focusGame();
  }

  async function share() {
    const url = window.location.href;
    const shareData = {
      title: `${copy.gameTitle} | Avangarda`,
      text: copy.gameSubtitle,
      url,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        setShareStatus("");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(copy.shareCopiedLabel);
    } catch {
      setShareStatus(copy.shareUnavailableLabel);
    }
  }

  function scrollToContext() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById("sta-se-desilo")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  const stageClass = currentLevel
    ? currentLevel.id === 1
      ? styles.stageLevelOne
      : currentLevel.id === 2
        ? styles.stageLevelTwo
        : styles.stageLevelThree
    : styles.stageLevelOne;

  return (
    <section
      ref={gameRef}
      className={`${styles.game} ${stageClass}`}
      tabIndex={-1}
      aria-label={copy.gameTitle}
    >
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {phase === "intro" ? (
        <div className={styles.intro}>
          <div className={styles.introIndex} aria-hidden="true">
            <span>01</span>
            <span>02</span>
            <span>03</span>
          </div>
          <div className={styles.introCopy}>
            <span className={styles.microLabel}>{copy.introEyebrow}</span>
            <h2>{copy.introStatement}</h2>
            <p>{copy.introCopy}</p>
            <button type="button" className={styles.primaryAction} onClick={startGame}>
              {copy.startLabel}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "playing" && currentLevel && currentDecision ? (
        <div className={styles.playing}>
          <header className={styles.gameHeader}>
            <div>
              <span className={styles.microLabel}>{currentLevel.label}</span>
              <h2>{currentLevel.title}</h2>
              <p>{currentLevel.theme}</p>
            </div>
            <div className={styles.decisionCounter} aria-label={`${copy.decisionLabel} ${currentDecisionNumber} / ${totalDecisionCount}`}>
              <span>{copy.decisionLabel}</span>
              <strong>{String(currentDecisionNumber).padStart(2, "0")}</strong>
              <small>/ {totalDecisionCount}</small>
            </div>
          </header>

          <div className={styles.progressLine} aria-hidden="true">
            <span style={{ inlineSize: `${(log.length / totalDecisionCount) * 100}%` }} />
          </div>

          <PowerGameMeters copy={copy} meters={meters} />

          <div className={styles.stage}>
            <div className={styles.scenarioColumn}>
              <span className={styles.microLabel}>{copy.choicesLabel}</span>
              <p className={styles.scenario}>{currentLevel.scenario}</p>
              {currentDecision.systemNote ? (
                <p className={styles.systemNote}>{currentDecision.systemNote}</p>
              ) : null}
            </div>

            <div className={styles.decisionColumn}>
              <h3>{currentDecision.prompt}</h3>
              <p className={styles.decisionDetail}>{currentDecision.detail}</p>

              {!lastChoice ? (
                <div className={styles.choiceGrid}>
                  {currentDecision.choices.map((choice) => {
                    const reasonId = `${currentDecision.id}-${choice.id}-reason`;
                    const reasonableStrengthClass = choice.reasonable
                      ? decisionIndex >= 3
                        ? styles.choiceReasonableStrong
                        : decisionIndex >= 1
                          ? styles.choiceReasonableMid
                          : styles.choiceReasonable
                      : "";
                    const choiceClass = [
                      styles.choice,
                      choice.offset ? styles.choiceOffset : "",
                      reasonableStrengthClass,
                      choice.disabled ? styles.choiceDisabled : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div className={styles.choiceWrap} key={choice.id}>
                        <button
                          type="button"
                          className={choiceClass}
                          disabled={choice.disabled}
                          aria-describedby={choice.disabledReason ? reasonId : undefined}
                          onClick={() => choose(choice)}
                        >
                          <span>{choice.label}</span>
                          {choice.status ? <small>{choice.status}</small> : null}
                          {choice.originalLabel ? (
                            <small className={styles.originalLabel}>{choice.originalLabel}</small>
                          ) : null}
                        </button>
                        {choice.disabledReason ? (
                          <small className={styles.disabledReason} id={reasonId}>
                            {choice.disabledReason}
                          </small>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.response} role="status">
                  <div className={styles.responseMeta}>
                    <span>{getCategoryLabel(copy, lastChoice.category)}</span>
                    <span>{lastChoice.label}</span>
                  </div>
                  {lastChoice.thought ? <p className={styles.thought}>{lastChoice.thought}</p> : null}
                  <p className={styles.responseCopy}>{lastChoice.response}</p>
                  <button type="button" className={styles.continueAction} onClick={advance}>
                    {copy.continueLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {phase === "result" ? (
        <div className={styles.result}>
          <div className={styles.resultLead}>
            <span className={styles.microLabel}>{copy.resultLabel}</span>
            <h2>{copy.resultTitle}</h2>
            <p className={styles.resultCopy}>{copy.resultCopy}</p>
          </div>

          <PowerGameMeters copy={copy} meters={meters} />

          <div className={styles.resultGrid}>
            <div className={styles.resultStats}>
              <div>
                <strong>{log.length}</strong>
                <span>{copy.choicesLabel}</span>
              </div>
              <div>
                <strong>{categoryCounts.shaped}</strong>
                <span>{copy.shapedLabel}</span>
              </div>
              <div>
                <strong>{categoryCounts.symbolic}</strong>
                <span>{copy.symbolicLabel}</span>
              </div>
              <div>
                <strong>{categoryCounts.changed}</strong>
                <span>{copy.changedLabel}</span>
              </div>
            </div>

            <article className={styles.resultReading}>
              <span className={styles.microLabel}>{resultVariant.eyebrow}</span>
              <h3>{resultVariant.title}</h3>
              <p>{resultVariant.copy}</p>
              <small>{copy.resultQuote}</small>
            </article>
          </div>

          <div className={styles.resultActions}>
            <button type="button" className={styles.primaryAction} onClick={scrollToContext}>
              {copy.understandLabel}
            </button>
            <button type="button" className={styles.secondaryAction} onClick={restart}>
              {copy.restartLabel}
            </button>
            <button type="button" className={styles.secondaryAction} onClick={share}>
              {copy.shareLabel}
            </button>
          </div>
          <p className={styles.shareStatus} role="status" aria-live="polite">
            {shareStatus}
          </p>
        </div>
      ) : null}
    </section>
  );
}
