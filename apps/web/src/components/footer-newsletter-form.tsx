"use client";

import { useState } from "react";

type FooterNewsletterFormProps = {
  placeholder: string;
  buttonLabel: string;
  note: string;
};

export function FooterNewsletterForm({ placeholder, buttonLabel, note }: FooterNewsletterFormProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="site-footer__newsletter-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        className="site-footer__newsletter-input"
        type="email"
        name="email"
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="email"
      />
      <button className="site-footer__newsletter-button" type="submit">
        {buttonLabel}
      </button>
      <p className="site-footer__newsletter-note" role="status" aria-live="polite">
        {submitted ? note : "\u00a0"}
      </p>
    </form>
  );
}
