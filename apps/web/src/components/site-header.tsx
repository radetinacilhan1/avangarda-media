import { BrandLockup } from "@/components/brand-lockup";
import { HeaderClock } from "@/components/header-clock";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SocialLinks } from "@/components/social-links";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { Lang } from "@/lib/i18n";
import { getDictionary, withLang } from "@/lib/i18n";

type HeaderNavKey = "news" | "analysis" | "interview" | "column" | "archive" | "about";

type SiteHeaderProps = {
  lang: Lang;
  currentPath: string;
  activeNav?: HeaderNavKey | null;
  eyebrow?: string;
  searchQuery?: string;
};

const aboutLabels: Record<Lang, string> = {
  sr: "O nama",
  en: "About",
  tr: "Hakk\u0131m\u0131zda",
  fr: "\u00c0 propos",
  de: "\u00dcber uns"
};

export function SiteHeader({ lang, currentPath, activeNav = null, eyebrow, searchQuery = "" }: SiteHeaderProps) {
  const t = getDictionary(lang);
  const navItems: Array<{ key: HeaderNavKey; href: string; label: string }> = [
    { key: "news", href: withLang("/section/news", lang), label: t.navNews },
    { key: "analysis", href: withLang("/section/analysis", lang), label: t.navAnalysis },
    { key: "interview", href: withLang("/section/interview", lang), label: t.navInterview },
    { key: "column", href: withLang("/section/column", lang), label: t.navColumn },
    { key: "archive", href: withLang("/archive", lang), label: t.navArchive },
    { key: "about", href: withLang("/about", lang), label: aboutLabels[lang] }
  ];

  return (
    <header className={`site-header site-header--${lang}`}>
      <div className="site-header__inner">
        <BrandLockup href={withLang("/", lang)} eyebrow={eyebrow || t.brandEyebrow} />

        <div className="site-header__topbar">
          <div className="site-header__utility">
            <HeaderClock lang={lang} />
            <SocialLinks />
            <ThemeSwitcher lang={lang} />
            <LanguageSwitcher currentPath={currentPath} activeLang={lang} />
          </div>
        </div>

        <div className="site-header__bottomline">
          <nav className="site-nav">
            {navItems.map((item) => (
              <a key={item.key} href={item.href} aria-current={activeNav === item.key ? "page" : undefined}>
                {item.label}
              </a>
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
