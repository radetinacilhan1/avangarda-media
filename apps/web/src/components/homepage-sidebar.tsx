import type { ReactNode } from "react";

import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import { getStrapiMediaUrl, unwrapStrapiSingle } from "@/lib/strapi";

type SidebarItem = {
  id?: number;
  title?: string;
  shortDescription?: string;
  link?: string;
  image?: unknown;
};

type HomepageSidebarProps = {
  lang: Lang;
  currentLabel?: string;
  currentItems?: SidebarItem[];
  mostReadLabel?: string;
  mostReadItems?: SidebarItem[];
  authorLabel?: string;
  authors?: {
    name: string;
    slug: string;
    initials: string;
    posts: { id: number; title: string; slug: string }[];
  }[];
};

type SidebarLink = {
  href?: string;
  external: boolean;
};

type SidebarMedia = {
  url?: string;
  formats?: {
    small?: { url?: string };
    medium?: { url?: string };
    thumbnail?: { url?: string };
  };
};

function resolveSidebarLink(link: string | undefined, lang: Lang): SidebarLink {
  if (!link?.trim()) return { href: undefined, external: false };

  if (/^(https?:)?\/\//i.test(link)) {
    return { href: link, external: true };
  }

  const normalized = link.startsWith("/") ? link : `/${link}`;
  const [pathname, query = ""] = normalized.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", lang);

  return {
    href: `${pathname}?${params.toString()}`,
    external: false
  };
}

function getSidebarImageUrl(image: unknown) {
  const media = unwrapStrapiSingle<SidebarMedia>(image);
  const url = media?.formats?.small?.url || media?.formats?.thumbnail?.url || media?.formats?.medium?.url || media?.url;
  return url ? getStrapiMediaUrl(url) : "";
}

function renderSidebarItem(
  item: SidebarItem,
  lang: Lang,
  className: string,
  content: ReactNode
) {
  const resolved = resolveSidebarLink(item.link, lang);

  if (!resolved.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      className={className}
      href={resolved.href}
      {...(resolved.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

export function HomepageSidebar({
  lang,
  currentLabel = "Sada",
  currentItems = [],
  mostReadLabel = "Najčitanije",
  mostReadItems = [],
  authorLabel = "Autori",
  authors = []
}: HomepageSidebarProps) {
  const visibleCurrentItems = currentItems.filter((item) => item.title?.trim());
  const visibleMostReadItems = mostReadItems.filter((item) => item.title?.trim());
  const visibleAuthors = authors.filter((author) => author.name.trim() && author.posts.length);

  if (!visibleCurrentItems.length && !visibleMostReadItems.length && !visibleAuthors.length) {
    return null;
  }

  return (
    <aside className="homepage-sidebar">
      {visibleCurrentItems.length ? (
        <section className="panel homepage-sidebar__panel homepage-sidebar__panel--current">
          <div className="homepage-sidebar__heading">
            <span className="eyebrow">{currentLabel}</span>
          </div>

          <div className="homepage-sidebar__current-list">
            {visibleCurrentItems.map((item, index) => (
              <div key={item.id || `${item.title}-${index}`}>
                {renderSidebarItem(
                  item,
                  lang,
                  "homepage-sidebar__current-item",
                  <>
                    <strong>{item.title}</strong>
                    {item.shortDescription?.trim() ? <p>{item.shortDescription}</p> : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {visibleMostReadItems.length ? (
        <section className="panel homepage-sidebar__panel homepage-sidebar__panel--most-read">
          <div className="homepage-sidebar__heading">
            <span className="eyebrow">{mostReadLabel}</span>
          </div>

          <div className="homepage-sidebar__most-read-list">
            {visibleMostReadItems.map((item, index) => {
              const imageUrl = getSidebarImageUrl(item.image);

              return (
                <div key={item.id || `${item.title}-${index}`}>
                  {renderSidebarItem(
                    item,
                    lang,
                    imageUrl
                      ? "homepage-sidebar__most-read-item homepage-sidebar__most-read-item--with-image"
                      : "homepage-sidebar__most-read-item",
                    <>
                      <span className="homepage-sidebar__rank">{String(index + 1).padStart(2, "0")}</span>
                      {imageUrl ? (
                        <img
                          className="homepage-sidebar__thumb"
                          src={imageUrl}
                          alt={item.title || ""}
                        />
                      ) : null}
                      <div className="homepage-sidebar__copy">
                        <strong>{item.title}</strong>
                        {item.shortDescription?.trim() ? <p>{item.shortDescription}</p> : null}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {visibleAuthors.length ? (
        <section className="panel homepage-sidebar__panel homepage-sidebar__panel--authors">
          <div className="homepage-sidebar__heading">
            <span className="eyebrow">{authorLabel}</span>
          </div>

          <div className="homepage-sidebar__author-list">
            {visibleAuthors.map((author) => (
              <article key={author.slug} className="homepage-sidebar__author-card">
                <div className="homepage-sidebar__author-topline">
                  <span className="homepage-sidebar__initials">{author.initials}</span>
                  <div className="homepage-sidebar__author-copy">
                    <a className="homepage-sidebar__author-name" href={withLang(`/author/${author.slug}`, lang)}>
                      {author.name}
                    </a>
                    <span className="homepage-sidebar__author-label">Glas redakcije</span>
                  </div>
                </div>

                <div className="homepage-sidebar__author-posts">
                  {author.posts.slice(0, 3).map((post) => (
                    <a key={post.id} href={withLang(`/a/${post.slug}`, lang)} className="homepage-sidebar__mini-link">
                      {post.title}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
