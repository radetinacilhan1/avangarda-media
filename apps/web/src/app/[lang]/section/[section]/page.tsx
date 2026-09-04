import SectionPage, { generateMetadata as generateSectionMetadata } from "../../../(legacy)/section/[section]/page";

export const revalidate = 300;
export const dynamic = "force-static";

type LocalizedSectionParams = { lang: string; section: string };

export function generateMetadata({ params }: { params: LocalizedSectionParams }) {
  return generateSectionMetadata({
    params: { section: params.section },
    searchParams: { lang: params.lang },
  });
}

export default function LocalizedSectionPage({ params }: { params: LocalizedSectionParams }) {
  return SectionPage({
    params: { section: params.section },
    searchParams: { lang: params.lang },
  });
}
