"use client";

import { useEffect, useMemo, useState } from "react";

import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";

type DailyQuestionCardData = {
  id?: number;
  label: string;
  question: string;
  answerA: string;
  answerB: string;
  votesA: number;
  votesB: number;
  voteRound?: number;
  percentA?: number;
  percentB?: number;
  totalVotes?: number;
  href?: string;
  ctaLabel?: string;
  isActive?: boolean;
  author?: string;
  source?: string;
};

type DailyQuestionCardProps = {
  question: DailyQuestionCardData;
  lang: Lang;
};

type VoteAnswer = "A" | "B";

type VoteResponse = {
  data?: {
    votesA?: number;
    votesB?: number;
    percentA?: number;
    percentB?: number;
    totalVotes?: number;
  };
};

const totalVotesCopy: Record<Lang, string> = {
  sr: "glasova",
  en: "votes",
  tr: "oy",
  fr: "votes",
  de: "Stimmen"
};

function getVoteStorageKey(question: DailyQuestionCardData) {
  return `avangarda-daily-question-vote:${question.id ?? question.question}:${question.voteRound ?? 1}`;
}

function calculatePercentages(votesA: number, votesB: number) {
  const totalVotes = votesA + votesB;

  return {
    totalVotes,
    percentA: totalVotes ? Math.round((votesA / totalVotes) * 100) : 0,
    percentB: totalVotes ? Math.round((votesB / totalVotes) * 100) : 0
  };
}

export function DailyQuestionCard({ question, lang }: DailyQuestionCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(() => {
    const votesA = Number(question.votesA) || 0;
    const votesB = Number(question.votesB) || 0;
    const calculated = calculatePercentages(votesA, votesB);

    return {
      votesA,
      votesB,
      totalVotes: question.totalVotes ?? calculated.totalVotes,
      percentA: question.percentA ?? calculated.percentA,
      percentB: question.percentB ?? calculated.percentB
    };
  });

  const storageKey = useMemo(() => getVoteStorageKey(question), [question]);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      if (storedValue === "A" || storedValue === "B") {
        setHasVoted(true);
      }
    } catch {
      setHasVoted(false);
    }
  }, [storageKey]);

  async function handleVote(answer: VoteAnswer) {
    if (hasVoted || isSubmitting || question.isActive === false) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/daily-question/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answer })
      });

      if (!res.ok) {
        throw new Error("Vote request failed");
      }

      const payload = (await res.json()) as VoteResponse;
      const nextVotesA = Number(payload.data?.votesA) || 0;
      const nextVotesB = Number(payload.data?.votesB) || 0;
      const calculated = calculatePercentages(nextVotesA, nextVotesB);

      setResults({
        votesA: nextVotesA,
        votesB: nextVotesB,
        totalVotes: payload.data?.totalVotes ?? calculated.totalVotes,
        percentA: payload.data?.percentA ?? calculated.percentA,
        percentB: payload.data?.percentB ?? calculated.percentB
      });
      setHasVoted(true);
      window.localStorage.setItem(storageKey, answer);
    } catch {
      const optimisticVotesA = results.votesA + (answer === "A" ? 1 : 0);
      const optimisticVotesB = results.votesB + (answer === "B" ? 1 : 0);
      const calculated = calculatePercentages(optimisticVotesA, optimisticVotesB);

      setResults({
        votesA: optimisticVotesA,
        votesB: optimisticVotesB,
        totalVotes: calculated.totalVotes,
        percentA: calculated.percentA,
        percentB: calculated.percentB
      });
      setHasVoted(true);
      window.localStorage.setItem(storageKey, answer);
    } finally {
      setIsSubmitting(false);
    }
  }

  const meta = [question.author?.trim(), question.source?.trim()].filter(Boolean).join(" / ");
  const hasCta = Boolean(question.href && question.ctaLabel?.trim());

  return (
    <section className="panel daily-question-card" aria-label={question.label}>
      <div className="daily-question-card__header">
        <span className="eyebrow">{question.label}</span>
        {meta ? <span className="daily-question-card__meta">{meta}</span> : null}
      </div>

      <h3 className="daily-question-card__question">{question.question}</h3>

      {!hasVoted ? (
        <div className="daily-question-card__actions">
          <button
            type="button"
            className="daily-question-card__option"
            onClick={() => handleVote("A")}
            disabled={isSubmitting}
          >
            {question.answerA}
          </button>
          <button
            type="button"
            className="daily-question-card__option"
            onClick={() => handleVote("B")}
            disabled={isSubmitting}
          >
            {question.answerB}
          </button>
        </div>
      ) : (
        <div className="daily-question-card__results">
          <div className="daily-question-card__result">
            <div className="daily-question-card__result-topline">
              <span>{question.answerA}</span>
              <strong>{results.percentA}%</strong>
            </div>
            <div className="daily-question-card__bar">
              <span className="daily-question-card__bar-fill" style={{ width: `${results.percentA}%` }} />
            </div>
          </div>

          <div className="daily-question-card__result">
            <div className="daily-question-card__result-topline">
              <span>{question.answerB}</span>
              <strong>{results.percentB}%</strong>
            </div>
            <div className="daily-question-card__bar">
              <span className="daily-question-card__bar-fill" style={{ width: `${results.percentB}%` }} />
            </div>
          </div>

          <p className="daily-question-card__total">
            {results.totalVotes} {totalVotesCopy[lang]}
          </p>
        </div>
      )}

      {hasCta ? (
        <a className="daily-question-card__cta" href={withLang(question.href || "", lang)}>
          {question.ctaLabel}
        </a>
      ) : null}
    </section>
  );
}
