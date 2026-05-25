"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { getAssistantUiCopy } from "@/lib/assistant";
import type { Lang } from "@/lib/i18n";

type AssistantWidgetProps = {
  lang: Lang;
  direction: "ltr" | "rtl";
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  links?: AssistantLink[];
};

type AssistantLink = {
  href: string;
  label?: string;
  title?: string;
  type?: string;
  cta?: string;
};

type AssistantApiResponse = {
  ok: boolean;
  data?: {
    answer: string;
    links?: AssistantLink[];
  };
};

function CompassMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path
        d="M12 6.2 15.9 15.4 12.9 13.8 9.9 17.8 8.2 8.6 11.2 10.2Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function AssistantWidget({ lang, direction }: AssistantWidgetProps) {
  const copy = getAssistantUiCopy(lang);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      text: copy.emptyState,
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: "assistant-welcome",
        role: "assistant",
        text: copy.emptyState,
      },
    ]);
    setDraft("");
    setIsLoading(false);
  }, [copy.emptyState, lang]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const hasConversation = messages.some((message) => message.role === "user");

  useEffect(() => {
    if (!isOpen) return;
    if (!hasConversation && !isLoading) return;

    const viewport = messagesViewportRef.current;
    if (!viewport) return;

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hasConversation, isLoading, isOpen, messages]);

  async function submitMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || isLoading) return;

    const currentPath = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          lang,
          currentPath,
        }),
      });

      const payload = (await response.json()) as AssistantApiResponse;
      const answer = payload.ok && payload.data?.answer ? payload.data.answer : copy.errorAnswer;
      const links = payload.ok ? payload.data?.links : undefined;

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: answer,
          links,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: copy.errorAnswer,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="assistant-widget" data-open={isOpen ? "true" : "false"} data-dir={direction}>
      {isOpen ? (
        <section className="assistant-widget__panel" aria-label={copy.title}>
          <div className="assistant-widget__panel-header">
            <div className="assistant-widget__title-block">
              <span className="assistant-widget__eyebrow assistant-widget__eyebrow--icon" aria-hidden="true">
                <CompassMark className="assistant-widget__mark assistant-widget__mark--panel" />
              </span>
              <div className="assistant-widget__heading-copy">
                <h2 className="assistant-widget__title">{copy.title}</h2>
                <p className="assistant-widget__intro">{copy.description}</p>
              </div>
            </div>

            <button
              type="button"
              className="assistant-widget__close"
              onClick={() => setIsOpen(false)}
              aria-label={copy.close}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M7 7 17 17M17 7 7 17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="assistant-widget__body" ref={messagesViewportRef} aria-live="polite">
            {!hasConversation ? (
              <div className="assistant-widget__suggestions">
                <span className="assistant-widget__suggestions-label">{copy.askLabel}</span>
                <div className="assistant-widget__chips">
                  {copy.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="assistant-widget__chip"
                      onClick={() => void submitMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="assistant-widget__messages">
              {messages.map((message) => (
                <article key={message.id} className={`assistant-widget__message assistant-widget__message--${message.role}`}>
                  <p>{message.text}</p>

                  {message.links?.length ? (() => {
                    const hasRichLinks = message.links.some((link) => link.title || link.type || link.cta);

                    return (
                      <div className={`assistant-widget__links${hasRichLinks ? " assistant-widget__links--cards" : ""}`}>
                        {message.links.map((link) => (
                          link.title || link.type || link.cta ? (
                            <a
                              key={`${message.id}-${link.href}`}
                              href={link.href}
                              className="assistant-widget__link-card"
                            >
                              <span className="assistant-widget__link-card-meta">{link.type || copy.title}</span>
                              <strong className="assistant-widget__link-card-title">{link.title || link.label}</strong>
                              <span className="assistant-widget__link-card-cta">{link.cta || copy.send}</span>
                            </a>
                          ) : (
                            <a key={`${message.id}-${link.href}`} href={link.href} className="assistant-widget__link">
                              {link.label}
                            </a>
                          )
                        ))}
                      </div>
                    );
                  })() : null}
                </article>
              ))}

              {isLoading ? <div className="assistant-widget__loading">{copy.thinking}</div> : null}
            </div>
          </div>

          <form
            className="assistant-widget__composer"
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage(draft);
            }}
          >
            <label className="assistant-widget__composer-label" htmlFor={inputId}>
              {copy.title}
            </label>
            <input
              id={inputId}
              className="assistant-widget__input"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.inputPlaceholder}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="assistant-widget__send" disabled={isLoading || !draft.trim()}>
              {copy.send}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="assistant-widget__trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={copy.title}
      >
        <span className="assistant-widget__trigger-mark" aria-hidden="true">
          <CompassMark className="assistant-widget__mark assistant-widget__mark--trigger" />
        </span>
      </button>
    </div>
  );
}
