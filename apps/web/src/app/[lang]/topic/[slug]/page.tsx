import TopicPage, { generateMetadata as generateTopicMetadata } from "../../../(legacy)/topic/[slug]/page";

export const revalidate = 300;
export const dynamic = "force-static";

type LocalizedTopicParams = { lang: string; slug: string };

export function generateMetadata({ params }: { params: LocalizedTopicParams }) {
  return generateTopicMetadata({
    params: { slug: params.slug },
    searchParams: { lang: params.lang },
  });
}

export default function LocalizedTopicPage({ params }: { params: LocalizedTopicParams }) {
  return TopicPage({
    params: { slug: params.slug },
    searchParams: { lang: params.lang },
  });
}
