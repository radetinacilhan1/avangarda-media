import { StaticEditorialPage } from "@/components/static-editorial-page";
import { resolveLang } from "@/lib/i18n";
import { getShowcaseSectionPageCopy } from "@/lib/showcase-sections";

export default function SistemPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  return <StaticEditorialPage lang={lang} currentPath="/sistem" copy={getShowcaseSectionPageCopy("sistem", lang)} />;
}
