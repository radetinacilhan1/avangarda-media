import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Lang } from "@/lib/i18n";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type ImpressumEntry = {
  label: string;
  value: string;
  href?: string;
};

type ImpressumCopy = {
  label: string;
  title: string;
  intro: string;
  summary: string;
  detailsLabel: string;
  detailsTitle: string;
  details: ImpressumEntry[];
  mediaRegistryLabel: string;
  mediaRegistryNumber: string | null;
  noteTitle: string;
  noteCopy: string;
  rightsTitle: string;
  rightsCopy: string;
  responsibilityTitle: string;
  responsibilityCopy: string;
};

const copy: Record<Lang, ImpressumCopy> = {
  sr: {
    label: "Impresum",
    title: "Impresum cuva osnovne podatke o platformi, izdavacu i urednickoj odgovornosti.",
    intro:
      "Avangarda je autorska dokumentarno-istrazivacka platforma udruzenja NOVA SPONA - Centar za drustvene inicijative. Platforma objavljuje tekstove, intervjue, analize, video sadrzaje i druge autorske forme iz oblasti drustva, ljudskih prava, ekologije, kulture i politickih procesa.",
    summary:
      "Ova stranica objedinjeno prikazuje identitet platforme, podatke o izdavacu i okvir urednicke i autorske odgovornosti, bez tvrdnje da je Avangarda trenutno upisana u Registar medija APR-a.",
    detailsLabel: "Osnovni podaci",
    detailsTitle: "Podaci o platformi i izdavacu",
    details: [
      { label: "Naziv platforme", value: "Avangarda" },
      { label: "Internet adresa", value: "https://www.avangarda.media", href: "https://www.avangarda.media" },
      { label: "Izdavac", value: "NOVA SPONA - Centar za drustvene inicijative" },
      { label: "Pravni oblik izdavaca", value: "Udruzenje" },
      { label: "Sediste izdavaca", value: "Mirka Milojkovica 34, Beograd - Palilula" },
      { label: "Maticni broj izdavaca", value: "28180292" },
      { label: "PIB izdavaca", value: "109128615" },
      { label: "Zastupnik udruzenja", value: "Ilhan Radetinac" },
      { label: "Urednik platforme", value: "Ilhan Radetinac" },
      { label: "Kontakt", value: "info@avangarda.media", href: "mailto:info@avangarda.media" },
    ],
    mediaRegistryLabel: "Registarski broj medija",
    mediaRegistryNumber: null,
    noteTitle: "Napomena o statusu",
    noteCopy:
      "Avangarda trenutno funkcionise kao autorska dokumentarno-istrazivacka platforma udruzenja NOVA SPONA - Centar za drustvene inicijative. Ukoliko platforma bude upisana u Registar medija Agencije za privredne registre Republike Srbije, podaci o registraciji i registarski broj medija bice objavljeni na ovoj stranici.",
    rightsTitle: "Autorska prava",
    rightsCopy:
      "Svi tekstovi, fotografije, video materijali i drugi sadrzaji objavljeni na platformi Avangarda zasticeni su autorskim pravom, osim ako je drugacije naznaceno. Preuzimanje sadrzaja dozvoljeno je samo uz jasno navodjenje izvora i autora, kao i aktivan link ka originalnom sadrzaju kada je to tehnicki moguce.",
    responsibilityTitle: "Odgovornost za sadrzaj",
    responsibilityCopy:
      "Objavljeni tekstovi i autorski sadrzaji izrazavaju stavove autora, osim ako je izricito navedeno drugacije. Avangarda zadrzava pravo da uredjuje, dopunjuje ili uklanja sadrzaj u skladu sa urednickim standardima, zakonom i zastitom dostojanstva osoba o kojima se pise.",
  },
  en: {
    label: "Imprint",
    title: "The imprint gathers the platform's core facts, publisher details and editorial responsibility.",
    intro:
      "Avangarda is an author-led documentary and investigative platform of the association NOVA SPONA - Center for Social Initiatives. The platform publishes texts, interviews, analyses, video work and other authored formats focused on society, human rights, ecology, culture and political processes.",
    summary:
      "This page brings together the identity of the platform, the publisher's details and the framework of editorial and authorship responsibility, without claiming that Avangarda is currently registered in Serbia's official media register.",
    detailsLabel: "Key details",
    detailsTitle: "Platform and publisher information",
    details: [
      { label: "Platform name", value: "Avangarda" },
      { label: "Website", value: "https://www.avangarda.media", href: "https://www.avangarda.media" },
      { label: "Publisher", value: "NOVA SPONA - Center for Social Initiatives" },
      { label: "Publisher legal form", value: "Association" },
      { label: "Publisher seat", value: "Mirka Milojkovica 34, Belgrade - Palilula" },
      { label: "Publisher registration number", value: "28180292" },
      { label: "Publisher tax ID", value: "109128615" },
      { label: "Association representative", value: "Ilhan Radetinac" },
      { label: "Platform editor", value: "Ilhan Radetinac" },
      { label: "Contact", value: "info@avangarda.media", href: "mailto:info@avangarda.media" },
    ],
    mediaRegistryLabel: "Media registry number",
    mediaRegistryNumber: null,
    noteTitle: "Status note",
    noteCopy:
      "Avangarda currently operates as an author-led documentary and investigative platform of the association NOVA SPONA - Center for Social Initiatives. If the platform is later entered into the Media Register of the Serbian Business Registers Agency, registration data and the media registry number will be published on this page.",
    rightsTitle: "Copyright",
    rightsCopy:
      "All texts, photographs, video materials and other content published on Avangarda are protected by copyright unless stated otherwise. Republishing is allowed only with clear attribution to the source and author, together with an active link to the original content whenever technically possible.",
    responsibilityTitle: "Responsibility for content",
    responsibilityCopy:
      "Published texts and authored materials express the views of their authors unless explicitly stated otherwise. Avangarda reserves the right to edit, supplement or remove content in line with editorial standards, applicable law and the protection of the dignity of the people written about.",
  },
  de: {
    label: "Impressum",
    title: "Das Impressum sammelt die Kerndaten der Plattform, des Herausgebers und der redaktionellen Verantwortung.",
    intro:
      "Avangarda ist eine autorengefuehrte dokumentarische und investigative Plattform des Vereins NOVA SPONA - Center for Social Initiatives. Die Plattform veroeffentlicht Texte, Interviews, Analysen, Videoarbeiten und andere autorische Formate zu Gesellschaft, Menschenrechten, Oekologie, Kultur und politischen Prozessen.",
    summary:
      "Diese Seite buendelt die Identitaet der Plattform, die Angaben zum Herausgeber und den Rahmen redaktioneller und urheberrechtlicher Verantwortung, ohne zu behaupten, dass Avangarda derzeit im serbischen Medienregister eingetragen ist.",
    detailsLabel: "Grunddaten",
    detailsTitle: "Angaben zur Plattform und zum Herausgeber",
    details: [
      { label: "Name der Plattform", value: "Avangarda" },
      { label: "Internetadresse", value: "https://www.avangarda.media", href: "https://www.avangarda.media" },
      { label: "Herausgeber", value: "NOVA SPONA - Center for Social Initiatives" },
      { label: "Rechtsform des Herausgebers", value: "Verein" },
      { label: "Sitz des Herausgebers", value: "Mirka Milojkovica 34, Belgrad - Palilula" },
      { label: "Registrierungsnummer des Herausgebers", value: "28180292" },
      { label: "Steuer-ID des Herausgebers", value: "109128615" },
      { label: "Vertreter des Vereins", value: "Ilhan Radetinac" },
      { label: "Redakteur der Plattform", value: "Ilhan Radetinac" },
      { label: "Kontakt", value: "info@avangarda.media", href: "mailto:info@avangarda.media" },
    ],
    mediaRegistryLabel: "Medienregisternummer",
    mediaRegistryNumber: null,
    noteTitle: "Hinweis zum Status",
    noteCopy:
      "Avangarda arbeitet derzeit als autorengefuehrte dokumentarische und investigative Plattform des Vereins NOVA SPONA - Center for Social Initiatives. Sollte die Plattform spaeter in das Medienregister der serbischen Agentur fuer Unternehmensregister eingetragen werden, werden die Registrierungsdaten und die Medienregisternummer auf dieser Seite veroeffentlicht.",
    rightsTitle: "Urheberrecht",
    rightsCopy:
      "Alle auf Avangarda veroeffentlichten Texte, Fotografien, Videomaterialien und sonstigen Inhalte sind urheberrechtlich geschuetzt, sofern nicht anders angegeben. Die Uebernahme von Inhalten ist nur mit klarer Nennung von Quelle und Autor sowie mit einem aktiven Link zum Originalinhalt erlaubt, wenn dies technisch moeglich ist.",
    responsibilityTitle: "Verantwortung fuer Inhalte",
    responsibilityCopy:
      "Veroeffentlichte Texte und autorische Inhalte geben die Ansichten ihrer Autorinnen und Autoren wieder, sofern nicht ausdruecklich anders vermerkt. Avangarda behaelt sich das Recht vor, Inhalte im Einklang mit redaktionellen Standards, dem Gesetz und dem Schutz der Wuerde der betroffenen Personen zu bearbeiten, zu ergaenzen oder zu entfernen.",
  },
  fr: {
    label: "Mentions legales",
    title: "Les mentions legales rassemblent les donnees essentielles de la plateforme, de l'editeur et de la responsabilite editoriale.",
    intro:
      "Avangarda est une plateforme d'auteur, documentaire et investigative de l'association NOVA SPONA - Center for Social Initiatives. La plateforme publie des textes, des entretiens, des analyses, des contenus video et d'autres formes d'auteur autour de la societe, des droits humains, de l'ecologie, de la culture et des processus politiques.",
    summary:
      "Cette page rassemble l'identite de la plateforme, les donnees de l'editeur et le cadre de la responsabilite editoriale et d'auteur, sans affirmer qu'Avangarda est actuellement inscrite au registre officiel des medias en Serbie.",
    detailsLabel: "Donnees principales",
    detailsTitle: "Informations sur la plateforme et l'editeur",
    details: [
      { label: "Nom de la plateforme", value: "Avangarda" },
      { label: "Adresse internet", value: "https://www.avangarda.media", href: "https://www.avangarda.media" },
      { label: "Editeur", value: "NOVA SPONA - Center for Social Initiatives" },
      { label: "Forme juridique de l'editeur", value: "Association" },
      { label: "Siege de l'editeur", value: "Mirka Milojkovica 34, Belgrade - Palilula" },
      { label: "Numero d'enregistrement de l'editeur", value: "28180292" },
      { label: "Numero fiscal de l'editeur", value: "109128615" },
      { label: "Representant de l'association", value: "Ilhan Radetinac" },
      { label: "Editeur de la plateforme", value: "Ilhan Radetinac" },
      { label: "Contact", value: "info@avangarda.media", href: "mailto:info@avangarda.media" },
    ],
    mediaRegistryLabel: "Numero d'enregistrement media",
    mediaRegistryNumber: null,
    noteTitle: "Note sur le statut",
    noteCopy:
      "Avangarda fonctionne actuellement comme une plateforme d'auteur, documentaire et investigative de l'association NOVA SPONA - Center for Social Initiatives. Si la plateforme est plus tard inscrite au Registre des medias de l'Agence serbe des registres des entreprises, les donnees d'enregistrement et le numero media seront publies sur cette page.",
    rightsTitle: "Droits d'auteur",
    rightsCopy:
      "Tous les textes, photographies, videos et autres contenus publies sur Avangarda sont proteges par le droit d'auteur, sauf mention contraire. La reprise de contenu n'est autorisee qu'avec une mention claire de la source et de l'auteur, ainsi qu'un lien actif vers le contenu original lorsque c'est techniquement possible.",
    responsibilityTitle: "Responsabilite du contenu",
    responsibilityCopy:
      "Les textes publies et les contenus d'auteur expriment les positions de leurs auteurs, sauf indication expresse contraire. Avangarda se reserve le droit d'editer, de completer ou de retirer un contenu conformement aux standards editoriaux, a la loi et a la protection de la dignite des personnes concernees.",
  },
  tr: {
    label: "Kunye",
    title: "Kunye, platformun temel kimligini, yayinci bilgilerini ve editoryal sorumlulugu bir araya getirir.",
    intro:
      "Avangarda, NOVA SPONA - Center for Social Initiatives derneginin yazar odakli belgesel ve arastirmaci platformudur. Platform; toplum, insan haklari, ekoloji, kultur ve politik surecler alaninda metinler, roportajlar, analizler, video icerikleri ve diger yazar islerini yayimlar.",
    summary:
      "Bu sayfa platformun kimligini, yayinci bilgilerini ve editoryal ve telif sorumlulugu cercevesini bir araya getirir; Avangarda'nin su anda Sirbistan'daki resmi medya siciline kayitli oldugu iddiasinda bulunmaz.",
    detailsLabel: "Temel bilgiler",
    detailsTitle: "Platform ve yayinci bilgileri",
    details: [
      { label: "Platform adi", value: "Avangarda" },
      { label: "Internet adresi", value: "https://www.avangarda.media", href: "https://www.avangarda.media" },
      { label: "Yayinci", value: "NOVA SPONA - Center for Social Initiatives" },
      { label: "Yayincinin hukuki yapisi", value: "Dernek" },
      { label: "Yayinci merkezi", value: "Mirka Milojkovica 34, Belgrad - Palilula" },
      { label: "Yayinci kayit numarasi", value: "28180292" },
      { label: "Yayinci vergi numarasi", value: "109128615" },
      { label: "Dernek temsilcisi", value: "Ilhan Radetinac" },
      { label: "Platform editoru", value: "Ilhan Radetinac" },
      { label: "Iletisim", value: "info@avangarda.media", href: "mailto:info@avangarda.media" },
    ],
    mediaRegistryLabel: "Medya sicil numarasi",
    mediaRegistryNumber: null,
    noteTitle: "Status notu",
    noteCopy:
      "Avangarda su anda NOVA SPONA - Center for Social Initiatives derneginin yazar odakli belgesel ve arastirmaci platformu olarak calismaktadir. Platform ileride Sirbistan Is Kayitlari Ajansi'nin Medya Siciline kaydolursa, kayit bilgileri ve medya sicil numarasi bu sayfada yayimlanacaktir.",
    rightsTitle: "Telif haklari",
    rightsCopy:
      "Avangarda'da yayimlanan tum metinler, fotograflar, video materyalleri ve diger icerikler, aksi belirtilmedikce telif hakkiyla korunur. Icerigin yeniden kullanimi yalnizca kaynak ve yazar acikca belirtilerek ve teknik olarak mumkun oldugunda orijinal icerige aktif bir baglanti verilerek mumkundur.",
    responsibilityTitle: "Icerik sorumlulugu",
    responsibilityCopy:
      "Yayimlanan metinler ve yazar icerikleri, acikca farkli belirtilmedigi surece yazarlarin goruslerini ifade eder. Avangarda, yazilan kisilerin onurunun korunmasi, yasa ve editoryal standartlarla uyum icinde icerigi duzenleme, tamamlama veya kaldirma hakkini sakli tutar.",
  },
};

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const pageCopy = lang === "sr" ? normalizeSerbianLatinDeep(copy[lang]) : copy[lang];

  return buildSeoMetadata({
    lang,
    pathname: "/impresum",
    title: buildPageTitle(pageCopy.label),
    description: pageCopy.intro,
  });
}

export default function ImpressumPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const pageCopy = lang === "sr" ? normalizeSerbianLatinDeep(copy[lang]) : copy[lang];
  const details = pageCopy.mediaRegistryNumber
    ? [...pageCopy.details, { label: pageCopy.mediaRegistryLabel, value: pageCopy.mediaRegistryNumber }]
    : pageCopy.details;

  return (
    <>
      <SiteHeader lang={lang} currentPath="/impresum" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{pageCopy.label}</span>
            <h1 className="subpage-hero__title">{pageCopy.title}</h1>
            <p className="subpage-hero__copy">{pageCopy.intro}</p>
          </section>

          <section className="panel info-card impressum-sheet">
            <span className="eyebrow">{pageCopy.detailsLabel}</span>
            <h2 className="impressum-sheet__title">{pageCopy.detailsTitle}</h2>
            <p className="impressum-sheet__lead">{pageCopy.summary}</p>

            <dl className="impressum-meta" aria-label={pageCopy.detailsTitle}>
              {details.map((entry) => (
                <div key={entry.label} className="impressum-meta__row">
                  <dt className="impressum-meta__label">{entry.label}</dt>
                  <dd className="impressum-meta__value">
                    {entry.href ? <a href={entry.href}>{entry.value}</a> : entry.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="page-grid">
            <article className="panel info-card">
              <span className="eyebrow">{pageCopy.label}</span>
              <h3>{pageCopy.noteTitle}</h3>
              <p>{pageCopy.noteCopy}</p>
            </article>

            <article className="panel info-card">
              <span className="eyebrow">{pageCopy.label}</span>
              <h3>{pageCopy.rightsTitle}</h3>
              <p>{pageCopy.rightsCopy}</p>
            </article>

            <article className="panel info-card">
              <span className="eyebrow">{pageCopy.label}</span>
              <h3>{pageCopy.responsibilityTitle}</h3>
              <p>{pageCopy.responsibilityCopy}</p>
            </article>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
