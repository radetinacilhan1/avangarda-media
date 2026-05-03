import { resolveLang, withLang } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default function VestiRedirectPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  redirect(withLang("/front", lang));
}
