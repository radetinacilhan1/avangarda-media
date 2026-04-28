const PUBLIC_ACTIONS = [
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
