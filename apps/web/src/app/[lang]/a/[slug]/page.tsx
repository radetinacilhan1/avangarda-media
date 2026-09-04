import ArticlePage, { generateMetadata as generateArticleMetadata } from "../../../(legacy)/a/[slug]/page";

export const revalidate = 300;
export const dynamic = "force-static";

type LocalizedArticleParams = { lang: string; slug: string };

export function generateMetadata({ params }: { params: LocalizedArticleParams }) {
  return generateArticleMetadata({
    params: { slug: params.slug },
    searchParams: { lang: params.lang },
  });
}

export default function LocalizedArticlePage({ params }: { params: LocalizedArticleParams }) {
  return ArticlePage({
    params: { slug: params.slug },
    searchParams: { lang: params.lang },
  });
}
