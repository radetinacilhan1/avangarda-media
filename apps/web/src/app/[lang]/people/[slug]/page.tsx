import PersonPortfolioPage, { generateMetadata as generatePersonMetadata } from "../../../(legacy)/people/[slug]/page";

export const revalidate = 300;
export const dynamic = "force-static";

type LocalizedPersonParams = { lang: string; slug: string };

export function generateMetadata({ params }: { params: LocalizedPersonParams }) {
  return generatePersonMetadata({
    params: { slug: params.slug },
    searchParams: { lang: params.lang },
  });
}

export default function LocalizedPersonPage({ params }: { params: LocalizedPersonParams }) {
  return PersonPortfolioPage({
    params: { slug: params.slug },
    searchParams: { lang: params.lang },
  });
}
