import FactCheckDetailPage, { generateMetadata as generateFactMetadata } from "../../../(legacy)/provera-cinjenica/[slug]/page";

export const revalidate = 300;
export const dynamic = "force-static";

type Props = { params: { lang: string; slug: string } };
export function generateMetadata({ params }: Props) {
  return generateFactMetadata({ params: { slug: params.slug }, searchParams: { lang: params.lang } });
}

export default function LocalizedFactCheckDetail({ params }: Props) {
  return FactCheckDetailPage({ params: { slug: params.slug }, searchParams: { lang: params.lang } });
}
