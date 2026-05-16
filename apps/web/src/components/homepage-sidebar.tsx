"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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

type SidebarAuthor = NonNullable<HomepageSidebarProps["authors"]>[number];

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

const sidebarAuthorCopy: Record<
  Lang,
  { navigation: string; previous: string; next: string; editorialVoice: string }
> = {
  sr: {
    navigation: "Navigacija kroz autore",
    previous: "Prethodni autori",
    next: "Sledeci autori",
    editorialVoice: "Glas redakcije"
  },
  en: {
    navigation: "Author navigation",
    previous: "Previous authors",
    next: "Next authors",
    editorialVoice: "Editorial voice"
  },
  tr: {
    navigation: "Yazarlar arasinda gezinme",
    previous: "Onceki yazarlar",
    next: "Sonraki yazarlar",
    editorialVoice: "Editor sesi"
  },
  fr: {
    navigation: "Navigation des auteurs",
    previous: "Auteurs precedents",
    next: "Auteurs suivants",
    editorialVoice: "Voix editoriale"
  },
  de: {
    navigation: "Autoren-Navigation",
    previous: "Vorherige Autoren",
    next: "Naechste Autoren",
    editorialVoice: "Stimme der Redaktion"
  },
  es: {
    navigation: "Navegacion de autores",
    previous: "Autores anteriores",
    next: "Autores siguientes",
    editorialVoice: "Voz editorial"
  },
  el: {
    navigation: "Πλοήγηση συντακτών",
    previous: "Προηγούμενοι συντάκτες",
    next: "Επόμενοι συντάκτες",
    editorialVoice: "Φωνή της σύνταξης"
  },
  ar: {
    navigation: "التنقل بين الكتّاب",
    previous: "الكتّاب السابقون",
    next: "الكتّاب التاليون",
    editorialVoice: "صوت التحرير"
  }
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

function SidebarAuthorPanel({
  lang,
  label,
  authors
}: {
  lang: Lang;
  label: string;
  authors: SidebarAuthor[];
}) {
  const authorCopy = sidebarAuthorCopy[lang];
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frameId = 0;
    const list = viewport.querySelector<HTMLElement>(".homepage-sidebar__author-scroll-list");
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            scheduleUpdate();
          })
        : null;

    const updateControls = () => {
      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const tolerance = 4;

      setCanScrollUp(viewport.scrollTop > tolerance);
      setCanScrollDown(maxScrollTop > tolerance && viewport.scrollTop < maxScrollTop - tolerance);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateControls);
    };

    scheduleUpdate();
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    resizeObserver?.observe(viewport);

    if (list) {
      resizeObserver?.observe(list);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      viewport.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [authors.length]);

  function nudge(direction: "up" | "down") {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstEntry = viewport.querySelector<HTMLElement>(".homepage-sidebar__author-entry");
    const list = viewport.querySelector<HTMLElement>(".homepage-sidebar__author-scroll-list");
    const listStyles = list ? window.getComputedStyle(list) : null;
    const gap = Number.parseFloat(listStyles?.rowGap || listStyles?.gap || "14") || 14;
    const amount = firstEntry ? firstEntry.offsetHeight + gap : Math.max(120, viewport.clientHeight * 0.72);
    const top = direction === "down" ? amount : amount * -1;

    viewport.scrollBy({ top, behavior: "smooth" });
  }

  return (
    <section className="panel homepage-sidebar__panel homepage-sidebar__panel--authors">
      <div className="homepage-sidebar__heading homepage-sidebar__heading--authors">
        <span className="eyebrow">{label}</span>

        <div className="homepage-sidebar__author-controls" aria-label={authorCopy.navigation}>
          <button
            type="button"
            className="homepage-sidebar__author-control"
            onClick={() => nudge("up")}
            disabled={!canScrollUp}
            aria-label={authorCopy.previous}
          >
            <span aria-hidden="true">^</span>
          </button>
          <button
            type="button"
            className="homepage-sidebar__author-control"
            onClick={() => nudge("down")}
            disabled={!canScrollDown}
            aria-label={authorCopy.next}
          >
            <span aria-hidden="true">v</span>
          </button>
        </div>
      </div>

      <div className="homepage-sidebar__author-shell">
        <div ref={viewportRef} className="homepage-sidebar__author-scroll">
          <div className="homepage-sidebar__author-scroll-list">
            {authors.map((author) => (
              <article key={author.slug} className="homepage-sidebar__author-entry">
                <a className="homepage-sidebar__author-link" href={withLang(`/author/${author.slug}`, lang)}>
                  <span className="homepage-sidebar__initials">{author.initials}</span>
                  <span className="homepage-sidebar__author-copy">
                    <span className="homepage-sidebar__author-name">{author.name}</span>
                    <span className="homepage-sidebar__author-label">{authorCopy.editorialVoice}</span>
                  </span>
                </a>

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
        </div>
      </div>
    </section>
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

      {visibleAuthors.length ? <SidebarAuthorPanel lang={lang} label={authorLabel} authors={visibleAuthors} /> : null}
    </aside>
  );
}
