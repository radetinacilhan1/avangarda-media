import { getLanguageMeta, languages, resolveLang } from "@/lib/i18n";

type LanguageSwitcherProps = {
  currentPath: string;
  activeLang?: string;
};

function withLang(path: string, lang: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${lang}`;
}

export function LanguageSwitcher({ currentPath, activeLang = "sr" }: LanguageSwitcherProps) {
  const active = getLanguageMeta(resolveLang(activeLang));

  return (
    <details className="language-menu">
      <summary className="language-menu__trigger" aria-label={`Language menu: ${active.label}`}>
        <span aria-hidden="true" className="language-menu__flag">{active.flag}</span>
      </summary>

      <div className="language-menu__panel" role="menu" aria-label="Language options">
        {languages.map((language) => (
          <a
            key={language.code}
            href={withLang(currentPath, language.code)}
            className={language.code === activeLang ? "language-menu__option language-menu__option--active" : "language-menu__option"}
            role="menuitem"
            title={language.label}
            aria-label={language.label}
          >
            <span aria-hidden="true">{language.flag}</span>
          </a>
        ))}
      </div>
    </details>
  );
}
