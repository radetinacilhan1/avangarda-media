import { headers } from "next/headers";

import SiteDocument from "@/components/site-document";
import { resolveLang } from "@/lib/i18n";

export { generateMetadata } from "@/components/site-document";

// Query-dependent routes retain their original request-time language behavior.
export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  const lang = resolveLang(headers().get("x-avangarda-lang") ?? undefined);
  return <SiteDocument lang={lang}>{children}</SiteDocument>;
}
