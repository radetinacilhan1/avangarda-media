import { BrandLockup } from "@/components/brand-lockup";
import { HeaderClock } from "@/components/header-clock";
import { MobileHeaderMenu } from "@/components/mobile-header-menu";
import { SocialLinks } from "@/components/social-links";
import { getAboutNavigationGroup } from "@/lib/about";
import type { Lang } from "@/lib/i18n";
import { getDictionary, withLang } from "@/lib/i18n";

type HeaderNavKey = "news" | "analysis" | "interview" | "column" | "archive" | "about";

type HeaderNavItem = {
  key: HeaderNavKey;
  href: string;
  label: string;
  children?: Array<{
    key: string;
    href: string;
    label: string;
  }>;
};

type SiteHeaderProps = {
  lang: Lang;
  currentPath: string;
  activeNav?: HeaderNavKey | null;
  eyebrow?: string;
  searchQuery?: string;
};

export function SiteHeader({ lang, currentPath, activeNav = null, eyebrow, searchQuery = "" }: SiteHeaderProps) {
  const t = getDictionary(lang);
  const aboutGroup = getAboutNavigationGroup(lang);
  const navItems: HeaderNavItem[] = [
    { key: "news", href: withLang("/section/front", lang), label: t.navNews },
    { key: "analysis", href: withLang("/section/analysis", lang), label: t.navAnalysis },
    { key: "interview", href: withLang("/section/interview", lang), label: t.navInterview },
    { key: "column", href: withLang("/section/column", lang), label: t.navColumn },
    { key: "archive", href: withLang("/archive", lang), label: t.navArchive },
    { key: "about", href: aboutGroup.href, label: aboutGroup.label, children: aboutGroup.children }
  ];

  return (
    <header className={`site-header site-header--${lang}`}>
      <div className="site-header__inner">
        <BrandLockup href={withLang("/", lang)} eyebrow={eyebrow || t.brandEyebrow} />

        <MobileHeaderMenu
          lang={lang}
          items={navItems}
          currentPath={currentPath}
          activeLang={lang}
          searchPlaceholder={t.searchPlaceholder}
          searchLabel={t.navSearch}
          searchQuery={searchQuery}
          clock={<HeaderClock lang={lang} />}
          socialLinks={<SocialLinks />}
        />

        <div className="site-header__bottomline">
          <nav className="site-nav">
            {navItems.map((item) => (
              item.children?.length ? (
                <div key={item.key} className="site-nav__item site-nav__item--has-dropdown">
                  <a
                    href={item.href}
                    className="site-nav__link site-nav__link--dropdown"
                    aria-current={activeNav === item.key ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path
                        d="M7.5 9.5 12 14l4.5-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>

                  <div className="site-nav__dropdown" role="menu" aria-label={item.label}>
                    {item.children.map((child) => (
                      <a key={child.key} href={child.href} className="site-nav__dropdown-link" role="menuitem">
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a key={item.key} href={item.href} className="site-nav__link" aria-current={activeNav === item.key ? "page" : undefined}>
                  {item.label}
                </a>
              )
            ))}
          </nav>
          <form action="/search" method="get" autoComplete="off" className="header-search">
            <input type="hidden" name="lang" value={lang} />
            <input
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              defaultValue={searchQuery}
              className="header-search__field"
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
            <button className="header-search__button" type="submit">
              {t.navSearch}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
