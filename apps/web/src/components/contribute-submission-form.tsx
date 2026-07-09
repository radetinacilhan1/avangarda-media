"use client";

import { useState } from "react";

import type { ContributeSubmissionFormCopy } from "@/lib/contribute";
import type { Lang } from "@/lib/i18n";

type ContributeSubmissionFormProps = {
  lang: Lang;
  copy: ContributeSubmissionFormCopy;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function getErrorMessage(copy: ContributeSubmissionFormCopy, code: string) {
  if (code === "INVALID_SUBMISSION") return copy.invalidError;
  if (code === "SUBMISSIONS_CLOSED") return copy.closedError;
  if (code === "SUBMISSION_UNAVAILABLE" || code === "CMS_UNAVAILABLE") return copy.unavailableError;
  if (code === "RATE_LIMITED") return copy.rateLimitError;
  return copy.genericError;
}

export function ContributeSubmissionForm({ lang, copy }: ContributeSubmissionFormProps) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");

  const isSubmitting = status === "submitting";

  return (
    <form
      className="contribute-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        setStatus("submitting");
        setMessage("");

        try {
          const response = await fetch("/api/contribute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lang,
              fullName: formData.get("fullName"),
              email: formData.get("email"),
              storyTitle: formData.get("storyTitle"),
              storySummary: formData.get("storySummary"),
              location: formData.get("location"),
              collaborationType: formData.get("collaborationType"),
              links: formData.get("links"),
              website: formData.get("website"),
              acknowledged: formData.get("acknowledged") === "yes",
            }),
          });
          const payload = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(typeof payload?.error === "string" ? payload.error : "SUBMISSION_FAILED");
          }

          form.reset();
          setStatus("success");
          setMessage(copy.successText);
        } catch (error) {
          const code = error instanceof Error ? error.message : "SUBMISSION_FAILED";
          setStatus("error");
          setMessage(getErrorMessage(copy, code));
        }
      }}
    >
      <div className="contribute-form__grid">
        <label className="contribute-form__field">
          <span>{copy.fullNameLabel}</span>
          <input
            className="field"
            name="fullName"
            placeholder={copy.fullNamePlaceholder}
            autoComplete="name"
            maxLength={120}
            required
            disabled={isSubmitting}
          />
        </label>

        <label className="contribute-form__field">
          <span>{copy.emailLabel}</span>
          <input
            className="field"
            type="email"
            name="email"
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            inputMode="email"
            maxLength={160}
            required
            disabled={isSubmitting}
          />
        </label>
      </div>

      <label className="contribute-form__field">
        <span>{copy.storyTitleLabel}</span>
        <input
          className="field"
          name="storyTitle"
          placeholder={copy.storyTitlePlaceholder}
          maxLength={180}
          required
          disabled={isSubmitting}
        />
      </label>

      <label className="contribute-form__field">
        <span>{copy.storySummaryLabel}</span>
        <textarea
          className="textarea contribute-form__textarea"
          name="storySummary"
          placeholder={copy.storySummaryPlaceholder}
          rows={8}
          minLength={24}
          maxLength={4000}
          required
          disabled={isSubmitting}
        />
      </label>

      <div className="contribute-form__grid">
        <label className="contribute-form__field">
          <span>{copy.locationLabel}</span>
          <input
            className="field"
            name="location"
            placeholder={copy.locationPlaceholder}
            maxLength={160}
            disabled={isSubmitting}
          />
        </label>

        <label className="contribute-form__field">
          <span>{copy.collaborationTypeLabel}</span>
          <select className="select" name="collaborationType" defaultValue="" disabled={isSubmitting}>
            <option value="">{copy.collaborationTypePlaceholder}</option>
            {copy.collaborationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="contribute-form__field">
        <span>{copy.linksLabel}</span>
        <textarea
          className="textarea"
          name="links"
          placeholder={copy.linksPlaceholder}
          rows={4}
          maxLength={1200}
          disabled={isSubmitting}
        />
      </label>

      <div className="contribute-form__honeypot" aria-hidden="true">
        <label htmlFor="contribute-website">Website</label>
        <input id="contribute-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="contribute-form__checkbox">
        <input type="checkbox" name="acknowledged" value="yes" required disabled={isSubmitting} />
        <span>{copy.acknowledgedLabel}</span>
      </label>

      <div className="contribute-form__actions">
        <button className="button-ghost" type="submit" disabled={isSubmitting}>
          {isSubmitting ? copy.submittingLabel : copy.submitLabel}
        </button>
      </div>

      {message ? (
        <div className={`contribute-form__status contribute-form__status--${status}`} role="status" aria-live="polite">
          <strong>{status === "success" ? copy.successTitle : copy.genericError}</strong>
          <p>{message}</p>
        </div>
      ) : null}
    </form>
  );
}
