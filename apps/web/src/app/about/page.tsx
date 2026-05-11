import { redirect } from "next/navigation";

import { resolveLang, withLang } from "@/lib/i18n";

export default function AboutLegacyPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  redirect(withLang("/o-nama", lang));
}
