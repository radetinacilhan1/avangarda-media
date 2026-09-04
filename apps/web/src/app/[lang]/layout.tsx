import { notFound } from "next/navigation";

import { isLang, languages } from "@/lib/i18n";
import SiteDocument from "@/components/site-document";

export { generateMetadata } from "@/components/site-document";

export const revalidate = 300;

export function generateStaticParams() {
  return languages.map(({ code }) => ({ lang: code }));
}

export default function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isLang(params.lang)) notFound();
  return <SiteDocument lang={params.lang}>{children}</SiteDocument>;
}
