import type { Lang } from "@/lib/i18n";

type SocialLinksProps = {
  lang: Lang;
};

const socialLinks = [
  {
    key: "x",
    label: "X",
    href: "https://x.com/avangarda_rs",
    path: "M18.9 3H21l-4.6 5.3L21.8 21H15l-5.3-7-6.1 7H1.5l4.9-5.6L1 3h6.9l4.8 6.4L18.9 3Zm-1.9 16h1.2L7.2 4.9H5.9L17 19Z",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@avangarda.rs?lang=en",
    path: "M14.3 2c.3 1.8 1.4 3.3 3 4.2a6.7 6.7 0 0 0 3.1.8v3.2a9.8 9.8 0 0 1-3.9-.8v5.6c0 1.5-.5 2.9-1.4 4a7.2 7.2 0 0 1-5.7 2.8A7.4 7.4 0 0 1 2 14.4a7.3 7.3 0 0 1 9.3-7V11a3.8 3.8 0 0 0-4.9 3.6 3.9 3.9 0 0 0 6.8 2.6c.4-.5.7-1.3.7-2V2h.4Z",
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@Avangarda-s3i",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.7V8.3l6.4 3.7-6.4 3.7Z",
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/avangarda.raw/",
    path: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9A3.7 3.7 0 0 0 7.5 20.2h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.7 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.8A3.7 3.7 0 1 0 15.7 12 3.7 3.7 0 0 0 12 8.3Z",
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61592707285929",
    path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07Z",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/avangarda-human-rights",
    path: "M5.4 8.2A1.8 1.8 0 1 0 5.4 4.6a1.8 1.8 0 0 0 0 3.6ZM3.8 9.7h3.1V20H3.8V9.7Zm5 0h3v1.4h.1c.4-.8 1.5-1.8 3.2-1.8 3.4 0 4 2.2 4 5.2V20H16v-4.8c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V20H9V9.7Z",
  },
] as const;

const socialCopy: Record<Lang, { groupLabel: string; profileLabel: string }> = {
  sr: { groupLabel: "Avangarda na dru\u0161tvenim mre\u017eama", profileLabel: "Avangarda na mre\u017ei {platform}" },
  en: { groupLabel: "Avangarda on social media", profileLabel: "Avangarda on {platform}" },
  tr: { groupLabel: "Avangarda sosyal medyada", profileLabel: "Avangarda {platform} hesab\u0131" },
  de: { groupLabel: "Avangarda in sozialen Netzwerken", profileLabel: "Avangarda auf {platform}" },
  fr: { groupLabel: "Avangarda sur les r\u00e9seaux sociaux", profileLabel: "Avangarda sur {platform}" },
  es: { groupLabel: "Avangarda en redes sociales", profileLabel: "Avangarda en {platform}" },
  el: { groupLabel: "\u0397 Avangarda \u03c3\u03c4\u03b1 \u03bc\u03ad\u03c3\u03b1 \u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03b9\u03ba\u03ae\u03c2 \u03b4\u03b9\u03ba\u03c4\u03cd\u03c9\u03c3\u03b7\u03c2", profileLabel: "\u0397 Avangarda \u03c3\u03c4\u03bf {platform}" },
  ar: { groupLabel: "\u0623\u0641\u0627\u0646\u063a\u0627\u0631\u062f\u0627 \u0639\u0644\u0649 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a", profileLabel: "\u0623\u0641\u0627\u0646\u063a\u0627\u0631\u062f\u0627 \u0639\u0644\u0649 \u0645\u0646\u0635\u0629 {platform}" },
};

export function SocialLinks({ lang }: SocialLinksProps) {
  const copy = socialCopy[lang];

  return (
    <div className="social-links" aria-label={copy.groupLabel}>
      {socialLinks.map((social) => {
        const accessibleLabel = copy.profileLabel.replace("{platform}", social.label);

        return (
          <a
            key={social.key}
            className={`social-links__item social-links__item--${social.key}`}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={accessibleLabel}
            title={accessibleLabel}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={social.path} fill="currentColor" />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
