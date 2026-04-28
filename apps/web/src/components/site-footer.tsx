import { FooterNewsletterForm } from "@/components/footer-newsletter-form";
import { SocialLinks } from "@/components/social-links";
import type { Dictionary, Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";

type SiteFooterProps = {
  lang: Lang;
  t?: Dictionary;
};

type FooterCopy = {
  brandCopy: string;
  editorialLabel: string;
  editorialLinks: {
    home: string;
    about: string;
    principle: string;
    contact: string;
    contribute: string;
  };
  sectionsLabel: string;
  sectionsLinks: {
    news: string;
    analysis: string;
    interview: string;
    column: string;
    archive: string;
    topics: string;
  };
  networkLabel: string;
  networkLinks: {
    youtube: string;
    instagram: string;
    tiktok: string;
    x: string;
    newsletter: string;
  };
  newsletterTitle: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
  newsletterNote: string;
  newsletterLabel: string;
  slogan: string;
  copyright: string;
  privacy: string;
  terms: string;
  cookies: string;
};

const footerCopy: Record<Lang, FooterCopy> = {
  sr: {
    brandCopy: "Avangarda je prostor za pri\u010de koje tra\u017ee vreme, kontekst i stav.",
    editorialLabel: "Uredni\u0161tvo",
    editorialLinks: {
      home: "Naslovna",
      about: "O nama",
      principle: "Uredni\u010dki princip",
      contact: "Kontakt",
      contribute: "Po\u0161alji pri\u010du / Saradnja"
    },
    sectionsLabel: "Sekcije",
    sectionsLinks: {
      news: "Vesti",
      analysis: "Analize",
      interview: "Intervjui",
      column: "Kolumne",
      archive: "Arhiva",
      topics: "Teme"
    },
    networkLabel: "Mre\u017ea",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      newsletter: "Newsletter"
    },
    newsletterTitle: "Ne \u0161aljemo sve. Samo ono \u0161to ostaje.",
    newsletterPlaceholder: "Email adresa",
    newsletterButton: "Prijavi se",
    newsletterNote: "Newsletter forma je placeholder i bi\u0107e povezana sa API-jem kada backend bude spreman.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Politika privatnosti",
    terms: "Uslovi kori\u0161\u0107enja",
    cookies: "Cookie policy"
  },
  en: {
    brandCopy: "Avangarda is a space for stories that need time, context and a position.",
    editorialLabel: "Editorial",
    editorialLinks: {
      home: "Home",
      about: "About",
      principle: "Editorial principle",
      contact: "Contact",
      contribute: "Pitch a story / Collaborate"
    },
    sectionsLabel: "Sections",
    sectionsLinks: {
      news: "News",
      analysis: "Analysis",
      interview: "Interviews",
      column: "Columns",
      archive: "Archive",
      topics: "Topics"
    },
    networkLabel: "Network",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      newsletter: "Newsletter"
    },
    newsletterTitle: "We don't send everything. Only what stays.",
    newsletterPlaceholder: "Email address",
    newsletterButton: "Subscribe",
    newsletterNote: "This newsletter form is a frontend placeholder and will be connected to an API later.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Privacy policy",
    terms: "Terms of use",
    cookies: "Cookie policy"
  },
  de: {
    brandCopy: "Avangarda ist ein Raum f\u00fcr Geschichten, die Zeit, Kontext und Haltung brauchen.",
    editorialLabel: "Editorial",
    editorialLinks: {
      home: "Startseite",
      about: "\u00dcber uns",
      principle: "Redaktionelles Prinzip",
      contact: "Kontakt",
      contribute: "Geschichte senden / Zusammenarbeit"
    },
    sectionsLabel: "Sektionen",
    sectionsLinks: {
      news: "News",
      analysis: "Analysen",
      interview: "Interviews",
      column: "Kolumnen",
      archive: "Archiv",
      topics: "Themen"
    },
    networkLabel: "Netzwerk",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      newsletter: "Newsletter"
    },
    newsletterTitle: "Wir schicken nicht alles. Nur das, was bleibt.",
    newsletterPlaceholder: "E-Mail-Adresse",
    newsletterButton: "Anmelden",
    newsletterNote: "Dieses Newsletter-Feld ist vorerst ein Frontend-Placeholder und wird sp\u00e4ter mit einer API verbunden.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    cookies: "Cookie-Richtlinie"
  },
  fr: {
    brandCopy: "Avangarda est un espace pour les r\u00e9cits qui demandent du temps, du contexte et une position.",
    editorialLabel: "\u00c9ditorial",
    editorialLinks: {
      home: "Accueil",
      about: "\u00c0 propos",
      principle: "Principe \u00e9ditorial",
      contact: "Contact",
      contribute: "Envoyer une histoire / Collaborer"
    },
    sectionsLabel: "Sections",
    sectionsLinks: {
      news: "Actus",
      analysis: "Analyses",
      interview: "Interviews",
      column: "Chroniques",
      archive: "Archives",
      topics: "Th\u00e8mes"
    },
    networkLabel: "R\u00e9seau",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      newsletter: "Newsletter"
    },
    newsletterTitle: "Nous n'envoyons pas tout. Seulement ce qui reste.",
    newsletterPlaceholder: "Adresse e-mail",
    newsletterButton: "S'inscrire",
    newsletterNote: "Ce formulaire newsletter est un placeholder frontend et sera reli\u00e9 \u00e0 une API plus tard.",
    newsletterLabel: "Newsletter",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Politique de confidentialit\u00e9",
    terms: "Conditions d'utilisation",
    cookies: "Politique des cookies"
  },
  tr: {
    brandCopy: "Avangarda; zaman, ba\u011flam ve tav\u0131r isteyen hik\u00e2yeler i\u00e7in bir aland\u0131r.",
    editorialLabel: "Editoryal",
    editorialLinks: {
      home: "Ana sayfa",
      about: "Hakk\u0131m\u0131zda",
      principle: "Editoryal ilke",
      contact: "\u0130leti\u015fim",
      contribute: "Hik\u00e2ye g\u00f6nder / \u0130\u015f birli\u011fi"
    },
    sectionsLabel: "B\u00f6l\u00fcmler",
    sectionsLinks: {
      news: "Haberler",
      analysis: "Analizler",
      interview: "R\u00f6portajlar",
      column: "Kolumne",
      archive: "Ar\u015fiv",
      topics: "Temalar"
    },
    networkLabel: "A\u011f",
    networkLinks: {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      x: "X",
      newsletter: "B\u00fclten"
    },
    newsletterTitle: "Her \u015feyi g\u00f6ndermiyoruz. Sadece kalan\u0131.",
    newsletterPlaceholder: "E-posta adresi",
    newsletterButton: "Kaydol",
    newsletterNote: "Bu b\u00fclten formu \u015fimdilik bir frontend placeholder'\u0131d\u0131r; backend haz\u0131r oldu\u011funda API ile ba\u011flanacakt\u0131r.",
    newsletterLabel: "B\u00fclten",
    slogan: "Human Rights, Raw, and Real.",
    copyright: "\u00a9 2026 Avangarda",
    privacy: "Gizlilik politikas\u0131",
    terms: "Kullan\u0131m ko\u015fullar\u0131",
    cookies: "\u00c7erez politikas\u0131"
  }
};

export function SiteFooter({ lang }: SiteFooterProps) {
  const copy = footerCopy[lang];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <img className="site-footer__logo" src="/avangarda-logo.png" alt="Avangarda logo" />
            <div className="site-footer__brand-copy">
              <strong className="site-footer__brand-title">Avangarda</strong>
              <p className="site-footer__brand-text">{copy.brandCopy}</p>
              <SocialLinks />
            </div>
          </div>

          <div className="site-footer__grid">
            <div className="site-footer__column">
              <span className="site-footer__label">{copy.editorialLabel}</span>
              <a href={withLang("/", lang)}>{copy.editorialLinks.home}</a>
              <a href={withLang("/about", lang)}>{copy.editorialLinks.about}</a>
              <a href={withLang("/editorial-principle", lang)}>{copy.editorialLinks.principle}</a>
              <a href={withLang("/contact", lang)}>{copy.editorialLinks.contact}</a>
              <a href={withLang("/contribute", lang)}>{copy.editorialLinks.contribute}</a>
            </div>

            <div className="site-footer__column">
              <span className="site-footer__label">{copy.sectionsLabel}</span>
              <a href={withLang("/section/news", lang)}>{copy.sectionsLinks.news}</a>
              <a href={withLang("/section/analysis", lang)}>{copy.sectionsLinks.analysis}</a>
              <a href={withLang("/section/interview", lang)}>{copy.sectionsLinks.interview}</a>
              <a href={withLang("/section/column", lang)}>{copy.sectionsLinks.column}</a>
              <a href={withLang("/archive", lang)}>{copy.sectionsLinks.archive}</a>
              <a href={withLang("/topics", lang)}>{copy.sectionsLinks.topics}</a>
            </div>

            <div className="site-footer__column">
              <span className="site-footer__label">{copy.networkLabel}</span>
              <a href="https://www.youtube.com/@Avangarda-s3i" target="_blank" rel="noreferrer">{copy.networkLinks.youtube}</a>
              <a href="https://www.instagram.com/avangarda.us/" target="_blank" rel="noreferrer">{copy.networkLinks.instagram}</a>
              <a href="https://www.tiktok.com/@avangarda.rs?lang=en" target="_blank" rel="noreferrer">{copy.networkLinks.tiktok}</a>
              <a href="https://x.com/avangarda_rs" target="_blank" rel="noreferrer">{copy.networkLinks.x}</a>
              <a href="#footer-newsletter">{copy.networkLinks.newsletter}</a>
            </div>
          </div>
        </div>

        <section id="footer-newsletter" className="site-footer__newsletter">
          <div className="site-footer__newsletter-copy">
            <span className="site-footer__label">{copy.newsletterLabel}</span>
            <h3>{copy.newsletterTitle}</h3>
          </div>
          <FooterNewsletterForm
            placeholder={copy.newsletterPlaceholder}
            buttonLabel={copy.newsletterButton}
            note={copy.newsletterNote}
          />
        </section>

        <div className="site-footer__bottom">
          <span className="site-footer__bottomline">{copy.copyright}</span>
          <span className="site-footer__bottomline">{copy.slogan}</span>
          <div className="site-footer__legal">
            <a href={withLang("/privacy-policy", lang)}>{copy.privacy}</a>
            <a href={withLang("/terms-of-use", lang)}>{copy.terms}</a>
            <a href={withLang("/cookie-policy", lang)}>{copy.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
