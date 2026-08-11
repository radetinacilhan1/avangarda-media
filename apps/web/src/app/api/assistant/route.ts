import { NextResponse } from "next/server";

import { getAssistantReply } from "@/lib/assistant";
import {
  ASSISTANT_MAX_HISTORY_CHARACTERS,
  ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH,
  ASSISTANT_MAX_HISTORY_MESSAGES,
  ASSISTANT_MAX_SUGGESTION_LENGTH,
  ASSISTANT_MAX_SUGGESTIONS,
  type AssistantConversationMessage,
} from "@/lib/assistant-contract";
import { getSignalAssistantReply, getSignalAssistantSuggestions, SIGNAL_MAX_MESSAGE_LENGTH } from "@/lib/assistant-service";
import { resolveLang } from "@/lib/i18n";
import { checkRateLimit, sanitizeLangInput, sanitizePathInput, sanitizeTextInput } from "@/lib/security";

export const dynamic = "force-dynamic";

function sanitizeAssistantHistory(value: unknown): AssistantConversationMessage[] {
  if (!Array.isArray(value)) return [];

  const accepted: AssistantConversationMessage[] = [];
  let acceptedCharacters = 0;

  for (const candidate of value.slice(-ASSISTANT_MAX_HISTORY_MESSAGES * 2).reverse()) {
    if (!candidate || typeof candidate !== "object") continue;
    const role = (candidate as { role?: unknown }).role;
    if (role !== "user" && role !== "assistant") continue;

    const roleLimit = role === "user" ? SIGNAL_MAX_MESSAGE_LENGTH : ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH;
    const text = sanitizeTextInput((candidate as { text?: unknown }).text, roleLimit, { allowNewlines: true });
    if (!text || acceptedCharacters + text.length > ASSISTANT_MAX_HISTORY_CHARACTERS) continue;

    accepted.push({ role, text });
    acceptedCharacters += text.length;
    if (accepted.length >= ASSISTANT_MAX_HISTORY_MESSAGES) break;
  }

  return accepted.reverse();
}

function sanitizeSuggestions(value: unknown, fallback: string[]) {
  const source = Array.isArray(value) ? value : fallback;
  const seen = new Set<string>();

  return source
    .map((entry) => sanitizeTextInput(entry, ASSISTANT_MAX_SUGGESTION_LENGTH))
    .filter((entry) => {
      const key = entry.toLocaleLowerCase();
      if (!entry || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, ASSISTANT_MAX_SUGGESTIONS);
}

export async function POST(req: Request) {
  let message = "";
  let lang = resolveLang();
  let currentPath = "/";
  let history: AssistantConversationMessage[] = [];
  const rateLimit = checkRateLimit(req, {
    bucket: "api-assistant",
    max: 18,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json();
    message = sanitizeTextInput(body?.message, SIGNAL_MAX_MESSAGE_LENGTH + 1);
    lang = sanitizeLangInput(body?.lang);
    currentPath = sanitizePathInput(body?.currentPath, "/");
    history = sanitizeAssistantHistory(body?.history);

    if (!message) {
      return NextResponse.json({ ok: false, error: "missing_message" }, { status: 400 });
    }

    if (message.length > SIGNAL_MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ ok: false, error: "message_too_long" }, { status: 400 });
    }

    const reply = await getSignalAssistantReply({ message, lang, currentPath, history });

    return NextResponse.json({
      ok: true,
      data: {
        ...reply,
        suggestions: sanitizeSuggestions(reply.suggestions, getSignalAssistantSuggestions(message, lang)),
      },
    });
  } catch {
    if (message) {
      const reply = getAssistantReply({
        message,
        lang,
        currentPath,
      });
      return NextResponse.json({
        ok: true,
        data: {
          ...reply,
          suggestions: sanitizeSuggestions(undefined, getSignalAssistantSuggestions(message, lang)),
        },
      });
    }

    return NextResponse.json({ ok: false, error: "assistant_unavailable" }, { status: 500 });
  }
}
