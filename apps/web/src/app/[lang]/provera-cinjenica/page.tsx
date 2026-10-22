import FactCheckListPage, { generateMetadata as generateFactMetadata } from "../../(legacy)/provera-cinjenica/page";

export const revalidate = 300;
export const dynamic = "force-static";

export function generateMetadata({ params }: { params: { lang: string } }) {
  return generateFactMetadata({ searchParams: { lang: params.lang } });
}

export default function LocalizedFactCheckList({ params }: { params: { lang: string } }) {
  return FactCheckListPage({ searchParams: { lang: params.lang } });
}
