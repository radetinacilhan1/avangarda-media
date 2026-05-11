"use client";

import { useState } from "react";

import type { TeamMember } from "@/lib/about";
import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";

type AboutTeamCarouselProps = {
  lang: Lang;
  members: TeamMember[];
  portfolioLabel: string;
  previousLabel: string;
  nextLabel: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function AboutTeamCarousel({
  lang,
  members,
  portfolioLabel,
  previousLabel,
  nextLabel,
}: AboutTeamCarouselProps) {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!members.length) {
    return null;
  }

  const canNavigate = members.length > 1;

  function goNext() {
    if (!canNavigate) return;
    setIndex((current) => (current + 1) % members.length);
  }

  function goPrevious() {
    if (!canNavigate) return;
    setIndex((current) => (current - 1 + members.length) % members.length);
  }

  return (
    <div className="team-carousel">
      <div
        className="team-carousel__viewport"
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX === null) return;
          const delta = event.changedTouches[0]?.clientX - touchStartX;
          setTouchStartX(null);

          if (Math.abs(delta) < 42) return;
          if (delta < 0) {
            goNext();
          } else {
            goPrevious();
          }
        }}
      >
        <div
          className="team-carousel__track"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {members.map((member) => (
            <article key={member.slug} className="panel team-card">
              <div className="team-card__portrait-wrap">
                {member.portraitUrl ? (
                  <img
                    src={member.portraitUrl}
                    alt={member.fullName}
                    className="team-card__portrait"
                  />
                ) : (
                  <div className="team-card__placeholder" aria-hidden="true">
                    <span>{getInitials(member.fullName)}</span>
                  </div>
                )}
              </div>

              <div className="team-card__body">
                <span className="eyebrow">{member.role}</span>
                <h3 className="team-card__name">{member.fullName}</h3>
                <p className="team-card__bio">{member.shortBio}</p>

                <div className="team-card__actions">
                  {member.portfolioEnabled ? (
                    <a
                      href={withLang(`/people/${member.slug}`, lang)}
                      className="button-secondary team-card__portfolio"
                    >
                      {portfolioLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {canNavigate ? (
        <div className="team-carousel__controls">
          <button
            type="button"
            className="team-carousel__control"
            aria-label={previousLabel}
            onClick={goPrevious}
          >
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path
                d="M14.5 6.5L8.5 12L14.5 17.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="team-carousel__control"
            aria-label={nextLabel}
            onClick={goNext}
          >
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path
                d="M9.5 6.5L15.5 12L9.5 17.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
