const PUBLIC_ACTIONS = [
  "api::about-page.about-page.find",
  "api::about-page.about-page.findOne",
  "api::article.article.find",
  "api::article.article.findOne",
  "api::author.author.find",
  "api::author.author.findOne",
  "api::comment.comment.create",
  "api::comment.comment.find",
  "api::comment.comment.findOne",
  "api::daily-question.daily-question.find",
  "api::daily-question.daily-question.findOne",
  "api::editorial-signal.editorial-signal.find",
  "api::editorial-signal.editorial-signal.findOne",
  "api::homepage-config.homepage-config.find",
  "api::homepage-config.homepage-config.findOne",
  "api::impressum.impressum.find",
  "api::impressum.impressum.findOne",
  "api::team-member.team-member.find",
  "api::team-member.team-member.findOne",
  "api::topic.topic.find",
  "api::topic.topic.findOne"
];

const DEFAULT_EDITORIAL_CARDS = [
  {
    label: "ŠTA NE OBJAVLJUJEMO",
    label_en: "WHAT WE DO NOT PUBLISH",
    label_tr: "Neyi YAYINLAMIYORUZ",
    label_fr: "CE QUE NOUS NE PUBLIONS PAS",
    label_de: "WAS WIR NICHT VERÖFFENTLICHEN",
    title: "NE OBJAVLJUJEMO SVE.",
    title_en: "WE DO NOT PUBLISH EVERYTHING.",
    title_tr: "HER ŞEYİ YAYINLAMIYORUZ.",
    title_fr: "NOUS NE PUBLIIONS PAS TOUT.",
    title_de: "WIR VERÖFFENTLICHEN NICHT ALLES.",
    text: "Ne jurimo brzinu po svaku cenu. Ako priča nema kontekst, ostaje van sajta. Tišina je nekad bolja od loše informacije.",
    text_en: "We do not chase speed at any cost. If a story has no context, it stays off the site. Silence is sometimes better than bad information.",
    text_tr: "Her ne pahasına olursa olsun hızın peşine düşmüyoruz. Bir hikâyenin bağlamı yoksa siteye girmiyor. Bazen sessizlik kötü bilgiden iyidir.",
    text_fr: "Nous ne poursuivons pas la vitesse à tout prix. Si une histoire n'a pas de contexte, elle reste hors du site. Le silence vaut parfois mieux qu'une mauvaise information.",
    text_de: "Wir jagen nicht um jeden Preis der Geschwindigkeit nach. Wenn einer Geschichte der Kontext fehlt, bleibt sie draußen. Schweigen ist manchmal besser als schlechte Information."
  },
  {
    label: "KAKO ČITATI",
    label_en: "HOW TO READ",
    label_tr: "NASIL OKUNUR",
    label_fr: "COMMENT LIRE",
    label_de: "WIE MAN LIEST",
    title: "OVO NIJE SCROLL, OVO JE ČITANJE.",
    title_en: "THIS IS NOT SCROLLING. THIS IS READING.",
    title_tr: "BU BİR KAYDIRMA DEĞİL, OKUMADIR.",
    title_fr: "CE N'EST PAS DU SCROLL, C'EST DE LA LECTURE.",
    title_de: "DAS IST KEIN SCROLLEN. DAS IST LESEN.",
    text: "Ovaj sajt nije pravljen za brz prolaz. Ako ostaneš duže od jednog minuta, već si ušao u priču.",
    text_en: "This site was not made for a quick pass. If you stay longer than a minute, you have already entered the story.",
    text_tr: "Bu site hızlı geçişler için yapılmadı. Bir dakikadan uzun kalırsan, hikâyenin içindesin demektir.",
    text_fr: "Ce site n'a pas été conçu pour un passage rapide. Si tu restes plus d'une minute, tu es déjà entré dans l'histoire.",
    text_de: "Diese Seite ist nicht für einen schnellen Durchlauf gemacht. Wenn du länger als eine Minute bleibst, bist du schon in der Geschichte."
  },
  {
    label: "ODGOVORNOST",
    label_en: "RESPONSIBILITY",
    label_tr: "SORUMLULUK",
    label_fr: "RESPONSABILITÉ",
    label_de: "VERANTWORTUNG",
    title: "NIJE SAMO DO NAS.",
    title_en: "IT IS NOT ONLY ON US.",
    title_tr: "BU SADECE BIZE BAGLI DEGIL.",
    title_fr: "CE N'EST PAS QU'UNE AFFAIRE DE NOUS.",
    title_de: "ES LIEGT NICHT NUR AN UNS.",
    text: "Ako vidiš problem i nastaviš dalje, postaješ deo njega. Ovaj sajt ne traži samo pažnju, nego stav.",
    text_en: "If you see the problem and keep going, you become part of it. This site does not ask only for attention, but for a position.",
    text_tr: "Sorunu görüp yoluna devam edersen onun bir parçası olursun. Bu site yalnızca dikkat değil, tavır da ister.",
    text_fr: "Si tu vois le problème et que tu passes ton chemin, tu en deviens une part. Ce site ne demande pas seulement de l'attention, mais une position.",
    text_de: "Wenn du das Problem siehst und weitergehst, wirst du Teil davon. Diese Seite fordert nicht nur Aufmerksamkeit, sondern Haltung."
  }
];

const DEFAULT_IMPRESSUM = {
  heroTitle: "Impresum cuva osnovne podatke o platformi, izdavacu i urednickoj odgovornosti.",
  editorialPolicyShort:
    "Avangarda je autorska dokumentarno-istrazivacka platforma udruzenja NOVA SPONA - Centar za drustvene inicijative. Platforma objavljuje tekstove, intervjue, analize, video sadrzaje i druge autorske forme iz oblasti drustva, ljudskih prava, ekologije, kulture i politickih procesa.",
  pageSummary:
    "Ova stranica objedinjeno prikazuje identitet platforme, podatke o izdavacu i okvir urednicke i autorske odgovornosti, bez tvrdnje da je Avangarda trenutno upisana u Registar medija APR-a.",
  statusNote:
    "Avangarda trenutno funkcionise kao autorska dokumentarno-istrazivacka platforma udruzenja NOVA SPONA - Centar za drustvene inicijative. Ukoliko platforma bude upisana u Registar medija Agencije za privredne registre Republike Srbije, podaci o registraciji i registarski broj medija bice objavljeni na ovoj stranici.",
  copyrightNotice:
    "Svi tekstovi, fotografije, video materijali i drugi sadrzaji objavljeni na platformi Avangarda zasticeni su autorskim pravom, osim ako je drugacije naznaceno. Preuzimanje sadrzaja dozvoljeno je samo uz jasno navodjenje izvora i autora, kao i aktivan link ka originalnom sadrzaju kada je to tehnicki moguce.",
  responsibilityNote:
    "Objavljeni tekstovi i autorski sadrzaji izrazavaju stavove autora, osim ako je izricito navedeno drugacije. Avangarda zadrzava pravo da uredjuje, dopunjuje ili uklanja sadrzaj u skladu sa urednickim standardima, zakonom i zastitom dostojanstva osoba o kojima se pise.",
  siteName: "Avangarda",
  publisherName: "NOVA SPONA - Centar za drustvene inicijative",
  publisherFullLegalName: "NOVA SPONA - Centar za drustvene inicijative",
  organisationName: "NOVA SPONA - Centar za drustvene inicijative",
  publisherLegalForm: "Udruzenje",
  registeredAddress: "Mirka Milojkovica 34",
  municipality: "Palilula, Beograd",
  country: "Srbija",
  registrationNumber: "28180292",
  taxNumber: "109128615",
  legalRepresentative: "Ilhan Radetinac",
  editorInChief: "Ilhan Radetinac",
  contactEmail: "info@avangarda.media",
  websiteUrl: "https://www.avangarda.media",
  socialLinks: [],
  mediaProjectName: "Avangarda",
  projectOwner: "NOVA SPONA - Centar za drustvene inicijative",
  privacyContactEmail: "info@avangarda.media",
  lastUpdatedLabel: "Poslednje azuriranje"
};

const DEFAULT_ABOUT_PAGE = {
  title: "O nama",
  title_en: "About",
  title_tr: "Hakkimizda",
  title_fr: "A propos",
  title_de: "Uber uns",
  intro:
    "Avangarda je urednicka platforma za ljudska prava, drustvo, demokratiju, ekologiju, secanje, rad, manjine i politicki zivot Balkana i sireg prostora.",
  intro_en:
    "Avangarda is an editorial platform focused on human rights, society, democracy, environment, memory, labour, minorities and political life in the Balkans and beyond.",
  intro_tr:
    "Avangarda; insan haklari, toplum, demokrasi, ekoloji, hafiza, emek, azinliklar ve Balkanlar ile otesindeki politik hayata odaklanan bir editoryal platformdur.",
  intro_fr:
    "Avangarda est une plateforme editoriale consacree aux droits humains, a la societe, a la democratie, a l'ecologie, a la memoire, au travail, aux minorites et a la vie politique des Balkans et d'ailleurs.",
  intro_de:
    "Avangarda ist eine redaktionelle Plattform zu Menschenrechten, Gesellschaft, Demokratie, Umwelt, Erinnerung, Arbeit, Minderheiten und politischem Leben auf dem Balkan und daruber hinaus.",
  whoWeAreTitle: "Ko smo mi",
  whoWeAreTitle_en: "Who we are",
  whoWeAreTitle_tr: "Biz kimiz",
  whoWeAreTitle_fr: "Qui sommes-nous",
  whoWeAreTitle_de: "Wer wir sind",
  whoWeAreText:
    "Avangarda nije klasicni portal za brz promet sadrzaja, vec platforma za price, analize, teren i dokumentarne formate koji traze vreme, kontekst i jasnu urednicku liniju.",
  whoWeAreText_en:
    "Avangarda is not a classic portal built for quick content turnover, but a platform for stories, analysis, field reporting and documentary forms that need time, context and a clear editorial line.",
  whoWeAreText_tr:
    "Avangarda, hizli icerik akisi icin kurulmus klasik bir portal degil; zaman, baglam ve net bir editoryal cizgi gerektiren hikayeler, analizler, saha metinleri ve belgesel formatlari icin bir platformdur.",
  whoWeAreText_fr:
    "Avangarda n'est pas un portail classique pense pour la rotation rapide du contenu, mais une plateforme pour des recits, des analyses, du terrain et des formats documentaires qui demandent du temps, du contexte et une ligne editoriale claire.",
  whoWeAreText_de:
    "Avangarda ist kein klassisches Portal fur schnellen Content-Umschlag, sondern eine Plattform fur Geschichten, Analysen, Terrain und dokumentarische Formate, die Zeit, Kontext und eine klare redaktionelle Linie brauchen.",
  editorialPrincipleTitle: "Urednicki princip",
  editorialPrincipleTitle_en: "Editorial principle",
  editorialPrincipleTitle_tr: "Editoryal ilke",
  editorialPrincipleTitle_fr: "Principe editorial",
  editorialPrincipleTitle_de: "Redaktionelles Prinzip",
  editorialPrincipleText:
    "Cetiri urednicka pravca - Sistem, Teren, Tisina i Kontra - cine okvir kroz koji Avangarda povezuje price, moc, iskustvo i otpor bez odustajanja od konteksta.",
  editorialPrincipleText_en:
    "The four editorial directions - Sistem, Teren, Tisina and Kontra - form the frame through which Avangarda connects stories, power, lived experience and resistance without giving up context.",
  editorialPrincipleText_tr:
    "Dort editoryal yon - Sistem, Teren, Tisina ve Kontra - Avangarda'nin hikayeleri, gucu, deneyimi ve direnci baglamdan vazgecmeden bir araya getirdigi cerceveyi kurar.",
  editorialPrincipleText_fr:
    "Les quatre directions editoriales - Sistem, Teren, Tisina et Kontra - constituent le cadre par lequel Avangarda relie les recits, le pouvoir, l'experience vecue et la resistance sans renoncer au contexte.",
  editorialPrincipleText_de:
    "Die vier redaktionellen Richtungen - Sistem, Teren, Tisina und Kontra - bilden den Rahmen, durch den Avangarda Geschichten, Macht, Erfahrung und Widerstand verbindet, ohne den Kontext aufzugeben.",
  peopleSectionTitle: "Ljudi iza Avangarde",
  peopleSectionTitle_en: "People behind Avangarda",
  peopleSectionTitle_tr: "Avangarda'nin arkasindaki insanlar",
  peopleSectionTitle_fr: "Les personnes derriere Avangarda",
  peopleSectionTitle_de: "Die Menschen hinter Avangarda",
  peopleSectionIntro:
    "Ovaj prostor okuplja ljude koji razvijaju urednicki, istrazivacki i dokumentarni identitet platforme.",
  peopleSectionIntro_en:
    "This section gathers the people shaping the editorial, investigative and documentary identity of the platform.",
  peopleSectionIntro_tr:
    "Bu alan, platformun editoryal, arastirmaci ve belgesel kimligini olusturan insanlari bir araya getirir.",
  peopleSectionIntro_fr:
    "Cette section rassemble les personnes qui construisent l'identite editoriale, investigative et documentaire de la plateforme.",
  peopleSectionIntro_de:
    "Dieser Bereich versammelt die Menschen, die die redaktionelle, investigative und dokumentarische Identitat der Plattform praegen.",
  portfolioCtaLabel: "Pogledaj portfolio",
  portfolioCtaLabel_en: "View portfolio",
  portfolioCtaLabel_tr: "Portfolyoyu gor",
  portfolioCtaLabel_fr: "Voir le portfolio",
  portfolioCtaLabel_de: "Portfolio ansehen",
  impressumLinkLabel: "Impresum",
  impressumLinkLabel_en: "Imprint",
  impressumLinkLabel_tr: "Kunye",
  impressumLinkLabel_fr: "Mentions legales",
  impressumLinkLabel_de: "Impressum"
};

const DEFAULT_TEAM_MEMBER = {
  fullName: "Ilhan Radetinac",
  slug: "ilhan-radetinac",
  role: "Founder / Editor, Avangarda",
  role_en: "Founder / Editor, Avangarda",
  role_tr: "Kurucu / Editor, Avangarda",
  role_fr: "Fondateur / Editeur, Avangarda",
  role_de: "Gruender / Editor, Avangarda",
  shortBio:
    "Ilhan Radetinac vodi razvoj Avangarde kao urednicke, dokumentarne i drustveno-politicke platforme usmerene na ljudska prava, javni interes i dugacku formu.",
  shortBio_en:
    "Ilhan Radetinac leads the development of Avangarda as an editorial, documentary and socio-political platform focused on human rights, public interest and long-form work.",
  shortBio_tr:
    "Ilhan Radetinac, Avangarda'nin insan haklari, kamusal yarar ve uzun form etrafinda kurulan editoryal, belgesel ve toplumsal-politik platform olarak gelisimini yurutur.",
  shortBio_fr:
    "Ilhan Radetinac dirige le developpement d'Avangarda en tant que plateforme editoriale, documentaire et socio-politique consacree aux droits humains, a l'interet public et au long format.",
  shortBio_de:
    "Ilhan Radetinac leitet die Entwicklung von Avangarda als redaktionelle, dokumentarische und gesellschaftspolitische Plattform mit Fokus auf Menschenrechte, oeffentliches Interesse und lange Formate.",
  longBio:
    "Kao osnivac i urednik, radi na oblikovanju urednicke linije, formata i saradnji oko prica koje traze vise konteksta, vise terena i vecu odgovornost prema javnosti.",
  longBio_en:
    "As founder and editor, he works on shaping the editorial line, formats and collaborations around stories that need more context, more field work and greater accountability to the public.",
  longBio_tr:
    "Kurucu ve editor olarak; daha fazla baglam, daha fazla saha calismasi ve kamuya daha yuksek sorumluluk gerektiren hikayeler etrafinda editoryal cizgiyi, formatlari ve is birliklerini sekillendirir.",
  longBio_fr:
    "En tant que fondateur et editeur, il travaille a la ligne editoriale, aux formats et aux collaborations autour de recits qui demandent davantage de contexte, de terrain et de responsabilite envers le public.",
  longBio_de:
    "Als Gruender und Editor arbeitet er an redaktioneller Linie, Formaten und Kooperationen rund um Geschichten, die mehr Kontext, mehr Terrain und groessere Verantwortung gegenueber der Oeffentlichkeit brauchen.",
  portfolioEnabled: true,
  order: 1,
  isActive: true
};

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    const editorialSignal = await strapi
      .query("api::editorial-signal.editorial-signal")
      .findOne();

    if (!editorialSignal) {
      await strapi.entityService.create("api::editorial-signal.editorial-signal", {
        data: {
          label: "UREDNIČKI SIGNAL",
          text: "Dobar magazinski sajt mora da ima stav čim se otvori.",
          author: "Avangarda",
          type: "statement",
          ctaLabel: "Pročitaj kontekst",
          isActive: true,
          backgroundMode: "yellow"
        }
      });
    }

    const homepageConfig = await strapi
      .query("api::homepage-config.homepage-config")
      .findOne();

    if (!homepageConfig) {
      await strapi.entityService.create("api::homepage-config.homepage-config", {
        data: {
          currentLabel: "Sada",
          mostReadLabel: "Naj\u010ditanije",
          editorialCards: DEFAULT_EDITORIAL_CARDS
        }
      });
    } else if (!homepageConfig.editorialCards || !homepageConfig.editorialCards.length) {
      await strapi.entityService.update("api::homepage-config.homepage-config", homepageConfig.id, {
        data: {
          editorialCards: DEFAULT_EDITORIAL_CARDS
        }
      });
    }

    const dailyQuestion = await strapi
      .query("api::daily-question.daily-question")
      .findOne();

    if (!dailyQuestion) {
      await strapi.entityService.create("api::daily-question.daily-question", {
        data: {
          label: "PITANJE DANA",
          question: "Da li misli\u0161 da je umor politi\u010dki problem?",
          answerA: "DA",
          answerB: "NE",
          votesA: 0,
          votesB: 0,
          isActive: true,
          ctaLabel: "Pro\u010ditaj kontekst"
        }
      });
    }

    const impressum = await strapi
      .query("api::impressum.impressum")
      .findOne();

    if (!impressum) {
      await strapi.entityService.create("api::impressum.impressum", {
        data: DEFAULT_IMPRESSUM
      });
    }

    const aboutPage = await strapi
      .query("api::about-page.about-page")
      .findOne();

    if (!aboutPage) {
      await strapi.entityService.create("api::about-page.about-page", {
        data: DEFAULT_ABOUT_PAGE
      });
    }

    const teamMembers = await strapi
      .query("api::team-member.team-member")
      .findMany({ limit: 1 });

    if (!teamMembers?.length) {
      await strapi.entityService.create("api::team-member.team-member", {
        data: DEFAULT_TEAM_MEMBER
      });
    }

    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (!publicRole) return;

    const permissions = await strapi
      .query("plugin::users-permissions.permission")
      .findMany({
        where: {
          role: publicRole.id,
          action: {
            $in: PUBLIC_ACTIONS
          }
        }
      });

    await Promise.all(
      permissions
        .filter((permission) => !permission.enabled)
        .map((permission) =>
          strapi.query("plugin::users-permissions.permission").update({
            where: { id: permission.id },
            data: { enabled: true }
          })
        )
    );
  }
};
