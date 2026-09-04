import HomePage, { generateMetadata as generateHomeMetadata } from "../(legacy)/page";

export const revalidate = 300;
export const dynamic = "force-static";

export function generateMetadata({ params }: { params: { lang: string } }) {
  return generateHomeMetadata({ searchParams: { lang: params.lang } });
}

export default function LocalizedHomePage({ params }: { params: { lang: string } }) {
  return HomePage({ searchParams: { lang: params.lang } });
}
