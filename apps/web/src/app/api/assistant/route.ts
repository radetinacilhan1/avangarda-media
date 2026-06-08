import { NextResponse } from "next/server";

import { getAssistantReply } from "@/lib/assistant";
import { getSignalAssistantReply, SIGNAL_MAX_MESSAGE_LENGTH } from "@/lib/assistant-service";
import { resolveLang } from "@/lib/i18n";
import { checkRateLimit, sanitizeLangInput, sanitizePathInput, sanitizeTextInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let message = "";
  let lang = resolveLang();
  let currentPath = "/";
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
    message = sanitizeTextInput(body?.message, SIGNAL_MAX_MESSAGE_LENGTH + 24);
    lang = sanitizeLangInput(body?.lang);
    currentPath = sanitizePathInput(body?.currentPath, "/");

    if (!message) {
      return NextResponse.json({ ok: false, error: "missing_message" }, { status: 400 });
    }

    if (message.length > SIGNAL_MAX_MESSAGE_LENGTH) {
      const reply = await getSignalAssistantReply({
        message,
        lang,
        currentPath,
      });

      return NextResponse.json({
        ok: true,
        data: reply,
      });
    }

    const reply = await getSignalAssistantReply({ message, lang, currentPath });

    return NextResponse.json({
      ok: true,
      data: reply,
    });
  } catch {
    if (message) {
      return NextResponse.json({
        ok: true,
        data: getAssistantReply({
          message,
          lang,
          currentPath,
        }),
      });
    }

    return NextResponse.json({ ok: false, error: "assistant_unavailable" }, { status: 500 });
  }
}
