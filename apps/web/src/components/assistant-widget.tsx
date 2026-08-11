"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { getAssistantOnboardingToast, getAssistantUiCopy } from "@/lib/assistant";
import {
  ASSISTANT_MAX_HISTORY_MESSAGES,
  ASSISTANT_MAX_MESSAGE_LENGTH,
  ASSISTANT_MAX_STORED_MESSAGES,
  ASSISTANT_MAX_SUGGESTION_LENGTH,
  ASSISTANT_MAX_SUGGESTIONS,
  type AssistantConversationMessage,
  type AssistantResponseData,
  type AssistantResponseLink,
} from "@/lib/assistant-contract";
import type { Lang } from "@/lib/i18n";

type AssistantWidgetProps = {
  lang: Lang;
  direction: "ltr" | "rtl";
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  links?: AssistantResponseLink[];
  suggestions?: string[];
};

type AssistantApiResponse = {
  ok: boolean;
  data?: AssistantResponseData;
};

const OPEN_ASSISTANT_EVENT = "avangarda:open-assistant";
const ONBOARDING_TOAST_STORAGE_KEY = "avangarda-compass-toast-seen-v3";
const CONVERSATION_STORAGE_KEY_PREFIX = "avangarda-compass-conversation-v1";
const HINT_REVEAL_DELAY_MS = 1700;
const HINT_VISIBLE_DURATION_MS = 3400;
const HINT_REDUCED_MOTION_DURATION_MS = 2200;

const openAssistantLabelByLang: Record<Lang, string> = {
  sr: "Otvori Kompas asistenta",
  en: "Open Compass assistant",
  tr: "Pusula asistanını aç",
  fr: "Ouvrir l’assistant Boussole",
  de: "Kompass-Assistenten öffnen",
  es: "Abrir el asistente Brújula",
  el: "Άνοιξε τον βοηθό Πυξίδα",
  ar: "افتح مساعد البوصلة",
};

const assistantStatusByLang: Record<Lang, string> = {
  sr: "Tu sam da pomognem",
  en: "Ready to help",
  tr: "Yardım etmeye hazırım",
  fr: "Prête à vous guider",
  de: "Bereit zu helfen",
  es: "Lista para ayudarte",
  el: "Έτοιμη να βοηθήσω",
  ar: "جاهز للمساعدة",
};

const MAX_INPUT_HEIGHT_PX = 104;

function getConversationStorageKey(lang: Lang) {
  return `${CONVERSATION_STORAGE_KEY_PREFIX}:${lang}`;
}

function createWelcomeMessage(text: string): ChatMessage {
  return { id: "assistant-welcome", role: "assistant", text };
}

function getSafeClientHref(value: unknown) {
  if (typeof value !== "string") return "";
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) return href;

  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

function restoreConversation(value: string | null): ChatMessage[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .slice(-ASSISTANT_MAX_STORED_MESSAGES)
      .map((entry, index): ChatMessage | null => {
        if (!entry || typeof entry !== "object") return null;
        const role = (entry as { role?: unknown }).role;
        const rawText = (entry as { text?: unknown }).text;
        if ((role !== "user" && role !== "assistant") || typeof rawText !== "string") return null;
        const text = rawText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 600);
        if (!text) return null;

        const links = Array.isArray((entry as { links?: unknown }).links)
          ? ((entry as { links: unknown[] }).links)
              .slice(0, 4)
              .map((link): AssistantResponseLink | null => {
                if (!link || typeof link !== "object") return null;
                const href = getSafeClientHref((link as { href?: unknown }).href);
                if (!href) return null;
                const actions = Array.isArray((link as { actions?: unknown }).actions)
                  ? ((link as { actions: unknown[] }).actions)
                      .slice(0, 3)
                      .map((action) => {
                        if (!action || typeof action !== "object") return null;
                        const actionHref = getSafeClientHref((action as { href?: unknown }).href);
                        const label = typeof (action as { label?: unknown }).label === "string"
                          ? (action as { label: string }).label.trim().slice(0, 90)
                          : "";
                        return actionHref && label
                          ? { href: actionHref, label, external: (action as { external?: unknown }).external === true }
                          : null;
                      })
                      .filter((action): action is NonNullable<typeof action> => Boolean(action))
                  : undefined;

                const readText = (key: "label" | "title" | "type" | "cta" | "description", max: number) => {
                  const candidate = (link as Record<string, unknown>)[key];
                  return typeof candidate === "string" ? candidate.trim().slice(0, max) : undefined;
                };
                return {
                  href,
                  label: readText("label", 140),
                  title: readText("title", 180),
                  type: readText("type", 80),
                  cta: readText("cta", 90),
                  description: readText("description", 260),
                  actions,
                };
              })
              .filter((link): link is AssistantResponseLink => Boolean(link))
          : undefined;

        const suggestions = Array.isArray((entry as { suggestions?: unknown }).suggestions)
          ? ((entry as { suggestions: unknown[] }).suggestions)
              .filter((suggestion): suggestion is string => typeof suggestion === "string")
              .map((suggestion) => suggestion.trim().slice(0, ASSISTANT_MAX_SUGGESTION_LENGTH))
              .filter(Boolean)
              .slice(0, ASSISTANT_MAX_SUGGESTIONS)
          : undefined;

        return { id: `restored-${index}`, role, text, links, suggestions };
      })
      .filter((message): message is ChatMessage => Boolean(message));
  } catch {
    return [];
  }
}

function resizeComposerInput(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, MAX_INPUT_HEIGHT_PX)}px`;
}

function CompassMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle
        className="assistant-widget__mark-ring"
        cx="12"
        cy="12"
        r="8.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <g className="assistant-widget__mark-needle-wrap">
        <path
          className="assistant-widget__mark-needle"
          d="M12 6.2 15.9 15.4 12.9 13.8 9.9 17.8 8.2 8.6 11.2 10.2Z"
          fill="currentColor"
        />
        <circle className="assistant-widget__mark-cap" cx="12" cy="12" r="1.05" fill="currentColor" />
      </g>
    </svg>
  );
}

export function AssistantWidget({ lang, direction }: AssistantWidgetProps) {
  const copy = getAssistantUiCopy(lang);
  const onboardingToast = getAssistantOnboardingToast(lang);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();
  const panelId = useId();
  const panelTitleId = `${panelId}-title`;
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pulseTimeoutRef = useRef<number | null>(null);
  const hintPersistTimeoutRef = useRef<number | null>(null);
  const hintHideTimeoutRef = useRef<number | null>(null);
  const conversationGenerationRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hydratedLang, setHydratedLang] = useState<Lang | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage(copy.emptyState)]);
  const hintRevealDelay = prefersReducedMotion ? 0 : HINT_REVEAL_DELAY_MS;
  const forceOnboardingHint = searchParams?.get("compassHint") === "1";

  useEffect(() => {
    setHydratedLang(null);
    let restored: ChatMessage[] = [];
    try {
      restored = restoreConversation(window.sessionStorage?.getItem(getConversationStorageKey(lang)) || null);
    } catch {
      restored = [];
    }

    conversationGenerationRef.current += 1;
    setMessages([createWelcomeMessage(copy.emptyState), ...restored]);
    setDraft("");
    setIsLoading(false);
    setHydratedLang(lang);
  }, [copy.emptyState, lang]);

  useEffect(() => {
    if (hydratedLang !== lang) return;
    const sessionMessages = messages.filter((message) => message.id !== "assistant-welcome").slice(-ASSISTANT_MAX_STORED_MESSAGES);
    try {
      window.sessionStorage?.setItem(getConversationStorageKey(lang), JSON.stringify(sessionMessages));
    } catch {
      // Restricted contexts may disable sessionStorage; the in-memory conversation still works.
    }
  }, [hydratedLang, lang, messages]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncPreference);
      return () => mediaQuery.removeEventListener("change", syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  useEffect(
    () => () => {
      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
      if (hintPersistTimeoutRef.current !== null) {
        window.clearTimeout(hintPersistTimeoutRef.current);
      }
      if (hintHideTimeoutRef.current !== null) {
        window.clearTimeout(hintHideTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let hasSeenOnboardingToast = false;

    try {
      hasSeenOnboardingToast = window.sessionStorage?.getItem(ONBOARDING_TOAST_STORAGE_KEY) === "true";
    } catch {
      hasSeenOnboardingToast = false;
    }

    if (hasSeenOnboardingToast && !forceOnboardingHint) return undefined;

    setShowHint(true);

    if (!forceOnboardingHint) {
      hintPersistTimeoutRef.current = window.setTimeout(() => {
        try {
          window.sessionStorage?.setItem(ONBOARDING_TOAST_STORAGE_KEY, "true");
        } catch {
          // Some embedded or restricted browser contexts expose no sessionStorage.
          // In that case we still show the onboarding hint once for the current mount.
        }
      }, hintRevealDelay);
    }

    hintHideTimeoutRef.current = window.setTimeout(
      () => {
        setShowHint(false);
      },
      hintRevealDelay + (prefersReducedMotion ? HINT_REDUCED_MOTION_DURATION_MS : HINT_VISIBLE_DURATION_MS),
    );

    return () => {
      if (hintPersistTimeoutRef.current !== null) {
        window.clearTimeout(hintPersistTimeoutRef.current);
        hintPersistTimeoutRef.current = null;
      }

      if (hintHideTimeoutRef.current !== null) {
        window.clearTimeout(hintHideTimeoutRef.current);
        hintHideTimeoutRef.current = null;
      }
    };
  }, [forceOnboardingHint, hintRevealDelay, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen) return;
    setShowHint(false);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleExternalOpen() {
      setIsOpen(true);
    }

    window.addEventListener(OPEN_ASSISTANT_EVENT, handleExternalOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleExternalOpen);
  }, []);

  const hasConversation = messages.some((message) => message.role === "user");
  const latestAssistantResponseId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.id !== "assistant-welcome")?.id;

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

  useEffect(() => {
    if (!isOpen || !inputRef.current) return;
    resizeComposerInput(inputRef.current);
  }, [draft, isOpen]);

  function setTriggerMotion(tiltX: number, tiltY: number, needleRotate: number, scale = 1) {
    const trigger = triggerRef.current;
    if (!trigger) return;

    trigger.style.setProperty("--assistant-tilt-x", `${tiltX.toFixed(2)}deg`);
    trigger.style.setProperty("--assistant-tilt-y", `${tiltY.toFixed(2)}deg`);
    trigger.style.setProperty("--assistant-needle-rotate", `${needleRotate.toFixed(2)}deg`);
    trigger.style.setProperty("--assistant-scale", scale.toFixed(3));
  }

  function resetTriggerMotion() {
    setTriggerMotion(0, 0, 0, 1);
  }

  function pulseTrigger() {
    if (prefersReducedMotion) return;

    setTriggerMotion(0, 0, 0, 1.06);

    if (pulseTimeoutRef.current !== null) {
      window.clearTimeout(pulseTimeoutRef.current);
    }

    pulseTimeoutRef.current = window.setTimeout(() => {
      setTriggerMotion(0, 0, 0, 1);
      pulseTimeoutRef.current = null;
    }, 220);
  }

  function handleTriggerPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (prefersReducedMotion) return;
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltY = (x - 0.5) * 10;
    const tiltX = (0.5 - y) * 10;
    const needleRotate = (x - 0.5) * 18;
    const scale = isOpen ? 1.03 : 1.01;
    setTriggerMotion(tiltX, tiltY, needleRotate, scale);
  }

  function handleTriggerToggle() {
    pulseTrigger();
    if (isOpen) {
      closePanel();
    } else {
      setIsOpen(true);
    }
  }

  function closePanel() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function resetConversation() {
    if (hasConversation && copy.resetConfirmation && !window.confirm(copy.resetConfirmation)) return;

    conversationGenerationRef.current += 1;
    try {
      window.sessionStorage?.removeItem(getConversationStorageKey(lang));
    } catch {
      // The visible conversation can still be reset when storage is unavailable.
    }
    setMessages([createWelcomeMessage(copy.emptyState)]);
    setDraft("");
    setIsLoading(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function submitMessage(rawMessage: string) {
    const message = rawMessage.trim().slice(0, ASSISTANT_MAX_MESSAGE_LENGTH);
    if (!message || isLoading) return;

    const currentPath = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
    };
    const requestGeneration = conversationGenerationRef.current;
    const history: AssistantConversationMessage[] = messages
      .filter((entry) => entry.id !== "assistant-welcome")
      .slice(-ASSISTANT_MAX_HISTORY_MESSAGES)
      .map((entry) => ({ role: entry.role, text: entry.text }));

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
          history,
        }),
      });

      const payload = (await response.json()) as AssistantApiResponse;
      const answer = payload.ok && payload.data?.answer ? payload.data.answer : copy.errorAnswer;
      const links = payload.ok ? payload.data?.links : undefined;
      const suggestions = payload.ok ? payload.data?.suggestions?.slice(0, ASSISTANT_MAX_SUGGESTIONS) : undefined;

      if (conversationGenerationRef.current !== requestGeneration) return;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: answer,
          links,
          suggestions,
        },
      ]);
    } catch {
      if (conversationGenerationRef.current !== requestGeneration) return;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: copy.errorAnswer,
        },
      ]);
    } finally {
      if (conversationGenerationRef.current === requestGeneration) setIsLoading(false);
    }
  }

  return (
    <div className="assistant-widget" data-open={isOpen ? "true" : "false"} data-dir={direction}>
      {isOpen ? (
        <section
          id={panelId}
          className="assistant-widget__panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={panelTitleId}
        >
          <div className="assistant-widget__panel-header">
            <div className="assistant-widget__title-block">
              <span className="assistant-widget__eyebrow assistant-widget__eyebrow--icon" aria-hidden="true">
                <CompassMark className="assistant-widget__mark assistant-widget__mark--panel" />
              </span>
              <div className="assistant-widget__heading-copy">
                <h2 id={panelTitleId} className="assistant-widget__title">Kompas AI</h2>
                <p className="assistant-widget__status">{assistantStatusByLang[lang]}</p>
              </div>
            </div>

            <div className="assistant-widget__header-actions">
              <button
                type="button"
                className="assistant-widget__reset"
                onClick={resetConversation}
                aria-label={copy.newConversation || "New conversation"}
                title={copy.newConversation || "New conversation"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 8a8 8 0 1 1-1 7M5 8V3M5 8h5" />
                </svg>
              </button>
              <button
                type="button"
                className="assistant-widget__close"
                onClick={closePanel}
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
          </div>

          <div className="assistant-widget__body">
            <div className="assistant-widget__messages" ref={messagesViewportRef} aria-live="polite">
              {!hasConversation ? (
                <div className="assistant-widget__suggestions">
                  <span className="assistant-widget__suggestions-label">{copy.askLabel}</span>
                  <div className="assistant-widget__chips">
                    {copy.suggestions.slice(0, 3).map((suggestion) => (
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

              {messages.map((message) => (
                <article key={message.id} className={`assistant-widget__message assistant-widget__message--${message.role}`}>
                  <p>{message.text}</p>

                  {message.id === "assistant-welcome" && copy.disclaimer ? (
                    <p className="assistant-widget__message-disclaimer">{copy.disclaimer}</p>
                  ) : null}

                  {message.links?.length ? (() => {
                    const hasRichLinks = message.links.some((link) => link.title || link.type || link.cta || link.actions?.length);

                    return (
                      <div className={`assistant-widget__links${hasRichLinks ? " assistant-widget__links--cards" : ""}`}>
                        {copy.sourcesLabel ? (
                          <span className="assistant-widget__suggestions-label">{copy.sourcesLabel}</span>
                        ) : null}
                        {message.links.map((link) => (
                          link.title || link.type || link.cta || link.actions?.length ? (
                            <div key={`${message.id}-${link.href}`} className="assistant-widget__link-card">
                              <a href={link.href} className="assistant-widget__link-card-main">
                                <span className="assistant-widget__link-card-meta">{link.type || copy.title}</span>
                                <strong className="assistant-widget__link-card-title">{link.title || link.label}</strong>
                                {link.description ? (
                                  <span className="assistant-widget__link-card-description">{link.description}</span>
                                ) : null}
                                <span className="assistant-widget__link-card-cta">{link.cta || copy.send}</span>
                              </a>
                              {link.actions?.length ? (
                                <span className="assistant-widget__link-card-actions">
                                  {link.actions.slice(0, 3).map((action) => (
                                    <a
                                      key={`${link.href}-${action.href}`}
                                      href={action.href}
                                      className="assistant-widget__link-card-action"
                                      target={action.external ? "_blank" : undefined}
                                      rel={action.external ? "noopener noreferrer" : undefined}
                                      aria-label={`${action.label}: ${link.title || link.label || copy.title}`}
                                    >
                                      {action.label}
                                    </a>
                                  ))}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <a key={`${message.id}-${link.href}`} href={link.href} className="assistant-widget__link">
                              {link.label}
                            </a>
                          )
                        ))}
                      </div>
                    );
                  })() : null}

                  {message.id === latestAssistantResponseId && message.suggestions?.length ? (
                    <div className="assistant-widget__follow-ups">
                      <span className="assistant-widget__suggestions-label">{copy.followUpLabel || copy.askLabel}</span>
                      <div className="assistant-widget__chips">
                        {message.suggestions.slice(0, ASSISTANT_MAX_SUGGESTIONS).map((suggestion) => (
                          <button
                            key={`${message.id}-${suggestion}`}
                            type="button"
                            className="assistant-widget__chip"
                            onClick={() => void submitMessage(suggestion)}
                            disabled={isLoading}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}

              {isLoading ? (
                <div className="assistant-widget__loading" role="status" aria-label={copy.thinking}>
                  <span className="assistant-widget__loading-label">{copy.thinking}</span>
                  <span className="assistant-widget__loading-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              ) : null}
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
            <textarea
              id={inputId}
              className="assistant-widget__input"
              rows={1}
              ref={inputRef}
              value={draft}
              maxLength={ASSISTANT_MAX_MESSAGE_LENGTH}
              onChange={(event) => {
                setDraft(event.target.value);
                resizeComposerInput(event.currentTarget);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (draft.trim() && !isLoading) void submitMessage(draft);
                }
              }}
              placeholder={copy.inputPlaceholder}
              autoComplete="off"
              enterKeyHint="send"
              spellCheck
            />
            <button
              type="submit"
              className="assistant-widget__send"
              disabled={isLoading || !draft.trim()}
              aria-label={copy.send}
              title={copy.send}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m4 4 17 8-17 8 3-8-3-8Z" />
                <path d="M7 12h13" />
              </svg>
            </button>
          </form>
        </section>
      ) : null}

      {showHint && !isOpen ? (
        <div
          className="assistant-widget__hint"
          role="status"
          aria-live="polite"
          style={{ "--assistant-hint-delay": `${hintRevealDelay}ms` } as CSSProperties}
        >
          <p className="assistant-widget__hint-copy">{onboardingToast}</p>
          <button
            type="button"
            className="assistant-widget__hint-close"
            onClick={() => setShowHint(false)}
            aria-label={copy.close}
          >
            &times;
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="assistant-widget__trigger"
        onClick={handleTriggerToggle}
        onPointerMove={handleTriggerPointerMove}
        onPointerLeave={resetTriggerMotion}
        onPointerCancel={resetTriggerMotion}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? copy.close : openAssistantLabelByLang[lang]}
        ref={triggerRef}
      >
        <span className="assistant-widget__trigger-mark" aria-hidden="true">
          <CompassMark className="assistant-widget__mark assistant-widget__mark--trigger" />
        </span>
      </button>
    </div>
  );
}

