import { NextResponse } from "next/server";

import { getAssistantReply } from "@/lib/assistant";
import { getSignalAssistantReply, SIGNAL_MAX_MESSAGE_LENGTH } from "@/lib/assistant-service";
import { resolveLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let message = "";
  let lang = resolveLang();
  let currentPath = "/";

  try {
    const body = await req.json();
    message = typeof body?.message === "string" ? body.message.replace(/\s+/g, " ").trim() : "";
    lang = resolveLang(body?.lang);
    currentPath = typeof body?.currentPath === "string" ? body.currentPath : "/";

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

    // TODO: Add lightweight rate limiting before exposing the endpoint more broadly.
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

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
