import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import { getStrapiMediaUrl, unwrapStrapiSingle } from "@/lib/strapi";

export type MostReadItem = { id?: number; title?: string; link?: string; image?: unknown };

export function MostReadList({ items, lang }: { items: MostReadItem[]; lang: Lang }) {
  return <ol className="most-read-list">
    {items.filter(item => item.title?.trim() && item.link?.trim()).slice(0, 5).map((item, index) => {
      const media = unwrapStrapiSingle<{ url?: string; formats?: { thumbnail?: { url?: string }; small?: { url?: string } } }>(item.image);
      const url = media?.formats?.thumbnail?.url || media?.formats?.small?.url || media?.url;
      return <li key={item.id || item.link}>
        <a href={withLang(item.link!, lang)} className={`most-read-list__link${url ? " most-read-list__link--image" : ""}`}>
          <span className="homepage-sidebar__rank" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          {url ? <img className="most-read-list__image" src={getStrapiMediaUrl(url)} width={48} height={48} alt="" loading="lazy" decoding="async" /> : null}
          <strong>{item.title}</strong>
        </a>
      </li>;
    })}
  </ol>;
}
