import { NextResponse } from "next/server";

import { getAssistantReply } from "@/lib/assistant";
import { resolveLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const lang = resolveLang(body?.lang);
    const currentPath = typeof body?.currentPath === "string" ? body.currentPath : "/";

    if (!message) {
      return NextResponse.json({ ok: false, error: "missing_message" }, { status: 400 });
    }

    const reply = getAssistantReply({ message, lang, currentPath });

    return NextResponse.json({
      ok: true,
      data: reply,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
