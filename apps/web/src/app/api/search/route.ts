import { NextResponse } from "next/server";
import { resolveLang } from "@/lib/i18n";
import { searchContent } from "@/lib/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const section = searchParams.get("section") || "";
  const year = searchParams.get("year") || "";
  const lang = resolveLang(searchParams.get("lang") || undefined);
  const result = await searchContent({ q, section, year, lang });
  return NextResponse.json(result);
}
