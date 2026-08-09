"use strict";

const LAYOUT_VERSION = "avangarda-admin-layout-v1";
const BACKUP_STORE_KEY = `${LAYOUT_VERSION}-backup`;
const MARKER_STORE_KEY = `${LAYOUT_VERSION}-status`;
const LANGUAGE_ORDER = ["en", "tr", "fr", "de", "es", "el", "ar"];
const LANGUAGE_LABELS = {
  en: "engleski",
  tr: "turski",
  fr: "francuski",
  de: "nemački",
  es: "španski",
  el: "grčki",
  ar: "arapski",
};

const PRIMARY_FIELDS = {
  "api::article.article": [
    "title", "subtitle", "slug", "content",
    "cover", "coverMeta", "imageCredits", "bodyImages", "audioEmbedUrl", "videoEmbedUrl",
    "authors", "topics", "tags", "editorialDirection", "locations", "relatedArticles", "relatedGalleries",
  ],
  "api::legal-resource.legal-resource": [
    "title", "slug", "type", "legalArea", "countryOrFramework", "shortDescription",
    "body", "whatIsThisFor", "whoCanUseIt", "whenToUseIt",
  ],
  "api::human-right.human-right": [
    "title", "slug", "shortDescription", "body", "whatItMeans", "whyItMatters",
    "everydayExamples", "legalBasis", "serbiaFramework", "internationalFramework",
  ],
  "api::gallery.gallery": ["title", "slug", "description", "galleryDate", "locationSummary", "photographerName"],
  "api::team-member.team-member": ["fullName", "slug", "role", "shortBio", "quote", "longBio"],
  "api::homepage-config.homepage-config": ["currentLabel", "mostReadLabel"],
  "api::author.author": ["name", "slug", "bio"],
  "api::topic.topic": ["name", "slug"],
  "api::tag.tag": ["name", "slug"],
  "api::editorial-direction.editorial-direction": ["title", "slug", "description"],
  "api::comment.comment": ["content", "status", "article", "authorName"],
  "api::location.location": ["name", "slug", "country", "region", "latitude", "longitude", "description"],
  "api::documentary.documentary": ["title", "slug", "description", "youtubeUrl", "youtubeVideoId", "date", "location", "director", "duration"],
  "api::signal.signal": ["title", "value", "description", "source", "sourceUrl", "date", "methodNote", "editorialNote", "region"],
  "api::editorial-signal.editorial-signal": ["label", "text", "author", "type", "source"],
  "api::daily-question.daily-question": ["label", "question", "answerA", "answerB"],
  "api::human-rights-page.human-rights-page": ["title", "slug", "heroText", "introText", "body"],
  "api::about-page.about-page": [
    "title", "intro", "whoWeAreTitle", "whoWeAreText", "editorialPrincipleTitle",
    "editorialPrincipleText", "peopleSectionTitle", "peopleSectionIntro", "portfolioCtaLabel", "impressumLinkLabel",
  ],
  "api::contribute-page.contribute-page": [
    "submissionEnabled", "submissionFormTitle", "submissionFormIntro", "submissionClosedTitle", "submissionClosedText",
  ],
  "api::impressum.impressum": [
    "heroTitle", "pageSummary", "statusNote", "editorialPolicyShort", "siteName", "publisherName",
    "publisherFullLegalName", "organisationName", "publisherLegalForm", "registeredAddress", "municipality", "country",
    "registrationNumber", "taxNumber", "legalRepresentative", "editorInChief", "contactEmail", "phone", "websiteUrl",
  ],
};

const SECONDARY_FIELDS = {
  "api::article.article": [
    "editorialControl", "focus", "style", "year", "readingTime", "signalText", "distributionNote",
    "cta", "section", "editorNote", "viewCount",
  ],
  "api::legal-resource.legal-resource": [
    "officialSourceUrl", "sourceName", "pdfFile", "downloadableFile", "fileLabel", "dateUpdated",
    "tags", "relatedHumanRights", "relatedArticles", "relatedTopics", "relatedLocations", "isFeatured",
  ],
  "api::human-right.human-right": [
    "relatedLegalResources", "relatedArticles", "relatedTopics", "relatedLocations", "iconLabel", "isFeatured",
  ],
  "api::gallery.gallery": [
    "authors", "topics", "tags", "locations", "relatedArticles", "images", "shareImage", "isFeatured", "order",
  ],
  "api::team-member.team-member": [
    "portrait", "email", "phone", "website", "socialLinks", "location", "locationUrl", "languages", "skills", "focusAreas",
    "education", "experience", "projects", "publications", "certifications", "trainings", "awards", "customSections",
    "timelineItems", "relatedArticles", "relatedDocumentaries", "cvFile", "portfolioEnabled", "isFounder", "isFeatured", "order", "isActive",
  ],
  "api::homepage-config.homepage-config": ["currentItems", "mostReadItems", "editorialCards"],
  "api::author.author": ["photo", "email", "socials"],
  "api::editorial-direction.editorial-direction": ["ordinal", "displayOrder", "relatedArticles", "isActive"],
  "api::comment.comment": ["authorEmail", "ipHash"],
  "api::documentary.documentary": ["thumbnail", "isFeatured", "order", "isActive"],
  "api::signal.signal": ["topics", "relatedSection", "relatedAnalysis", "isFeatured", "showOnHomepage", "order", "externalSourceKey", "isActive"],
  "api::editorial-signal.editorial-signal": ["linkedArticle", "ctaLabel", "isActive", "priority", "backgroundMode", "updatedNote"],
  "api::daily-question.daily-question": ["votesA", "votesB", "voteRound", "resetVotes", "isActive", "linkedArticle", "ctaLabel", "internalNote", "publishedDate"],
  "api::human-rights-page.human-rights-page": ["cards"],
  "api::about-page.about-page": ["directions"],
  "api::contribute-page.contribute-page": ["submissionRecipientEmail"],
  "api::impressum.impressum": [
    "socialLinks", "mediaProjectName", "projectOwner", "privacyContactEmail", "mediaRegistryNumber",
    "copyrightNotice", "responsibilityNote", "lastUpdatedLabel", "lastUpdated",
  ],
};

const LIST_FIELDS = {
  "api::article.article": ["title", "publishedAt", "updatedAt", "editorialControl", "slug"],
  "api::legal-resource.legal-resource": ["title", "type", "dateUpdated", "isFeatured", "updatedAt", "slug"],
  "api::human-right.human-right": ["title", "isFeatured", "updatedAt", "slug"],
  "api::gallery.gallery": ["title", "galleryDate", "isFeatured", "order", "updatedAt"],
  "api::team-member.team-member": ["fullName", "role", "isActive", "isFeatured", "order", "updatedAt"],
  "api::author.author": ["name", "email", "updatedAt", "slug"],
  "api::topic.topic": ["name", "updatedAt", "slug"],
  "api::tag.tag": ["name", "updatedAt", "slug"],
  "api::editorial-direction.editorial-direction": ["title", "displayOrder", "isActive", "updatedAt"],
  "api::comment.comment": ["content", "status", "article", "authorName", "updatedAt"],
  "api::location.location": ["name", "country", "region", "active", "updatedAt"],
  "api::documentary.documentary": ["title", "date", "isFeatured", "order", "isActive", "updatedAt"],
  "api::signal.signal": ["title", "date", "isFeatured", "showOnHomepage", "order", "isActive", "updatedAt"],
  "api::editorial-signal.editorial-signal": ["label", "type", "isActive", "priority", "updatedAt"],
  "api::daily-question.daily-question": ["question", "isActive", "publishedDate", "updatedAt"],
};

const FIELD_LABELS = {
  title: "Naslov", subtitle: "Podnaslov", fullName: "Ime i prezime", name: "Naziv", slug: "Adresa stranice (slug)",
  content: "Glavni sadržaj", body: "Glavni sadržaj", shortDescription: "Kratak opis", description: "Opis",
  cover: "Naslovna fotografija", coverMeta: "Podaci o naslovnoj fotografiji", imageCredits: "Fotografije i potpisi",
  bodyImages: "Fotografije u tekstu", authors: "Autori", topics: "Teme", tags: "Oznake", locations: "Lokacije",
  editorialDirection: "Urednički pravac", relatedArticles: "Povezani članci", relatedGalleries: "Povezane galerije",
  editorialControl: "Uredničke kontrole", focus: "Fokus", style: "Stil", readingTime: "Vreme čitanja",
  viewCount: "Broj pregleda (tehnički)", editorNote: "Interna urednička napomena", distributionNote: "Napomena za distribuciju",
  signalText: "Signal uz članak", officialSourceUrl: "Zvanični izvor (HTTPS)", sourceName: "Naziv zvaničnog izvora",
  pdfFile: "PDF za otvaranje", downloadableFile: "Fajl za preuzimanje", fileLabel: "Naziv dokumenta",
  dateUpdated: "Datum ažuriranja dokumenta", legalArea: "Pravna oblast", countryOrFramework: "Država ili okvir",
  whatIsThisFor: "Čemu dokument služi", whoCanUseIt: "Ko može da ga koristi", whenToUseIt: "Kada se koristi",
  relatedHumanRights: "Povezana ljudska prava", relatedLegalResources: "Povezani pravni resursi",
  relatedTopics: "Povezane teme", relatedLocations: "Povezane lokacije", images: "Fotografije galerije",
  shareImage: "Slika za deljenje", photographerName: "Fotograf", galleryDate: "Datum galerije", locationSummary: "Sažetak lokacije",
  role: "Uloga", shortBio: "Kratka biografija", longBio: "Duga biografija", portrait: "Portret", socialLinks: "Društvene mreže",
  locationUrl: "Link lokacije", portfolioEnabled: "Prikaži portfolio", isFounder: "Osnivač", isFeatured: "Istaknuto",
  isBreaking: "Važna vest", isTrending: "U trendu", isActive: "Aktivno", active: "Aktivno", order: "Redosled",
  priority: "Prioritet", seo: "SEO", status: "Status", publishedAt: "Status objave", updatedAt: "Poslednja izmena",
  authorEmail: "E-mail pošiljaoca (privatno)", ipHash: "IP otisak (tehnički)", externalSourceKey: "Spoljni ključ (tehnički)",
};

const NON_LISTABLE_TYPES = new Set(["json", "password", "richtext", "dynamiczone", "blocks"]);
const LISTABLE_RELATIONS = new Set(["oneToOne", "oneToMany", "manyToOne", "manyToMany"]);
const TECHNICAL_FIELDS = new Set(["id", "viewCount", "ipHash", "externalSourceKey", "internalNote", "createdAt", "createdBy", "updatedBy"]);

function splitLocalizedName(name) {
  const match = name.match(/_(en|tr|fr|de|es|el|ar)$/);
  return match ? { base: name.slice(0, -3), language: match[1] } : { base: name, language: null };
}

function humanize(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getFieldLabel(name) {
  const { base, language } = splitLocalizedName(name);
  const baseLabel = FIELD_LABELS[base] || humanize(base);
  return language ? `${baseLabel} — ${LANGUAGE_LABELS[language]}` : baseLabel;
}

function getFieldDescription(name, attribute) {
  const { language } = splitLocalizedName(name);
  if (language) return `Prevod na ${LANGUAGE_LABELS[language]}. Ako ostane prazno, javni sajt koristi srpsku vrednost.`;
  if (name === "slug") return "Menjati samo pre prve objave; promena može pokvariti postojeće javne linkove.";
  if (name === "officialSourceUrl") return "Unesi samo provereni HTTPS link zvanične institucije ili originalnog dokumenta.";
  if (name === "pdfFile" || name === "downloadableFile") return "Poveži postojeći provereni fajl i zatim testiraj javno otvaranje i preuzimanje.";
  if (name === "authorEmail" || name === "ipHash") return "Privatan/tehnički podatak za moderaciju; ne objavljuje se i ne menja bez razloga.";
  if (TECHNICAL_FIELDS.has(name)) return "Tehničko polje. Ne menjati ručno bez jasnog uredničkog ili operativnog razloga.";
  if (attribute?.type === "relation") return "Poveži postojeći zapis; ne praviti duplikat samo zbog drugačijeg pisanja naziva.";
  if (attribute?.type === "media") return "Izaberi odgovarajući postojeći medij i proveri opis, autora i prava korišćenja.";
  if (["richtext", "text", "blocks"].includes(attribute?.type)) return "Unesi čitljiv, strukturiran sadržaj; ovo polje koristi punu širinu forme.";
  if (attribute?.type === "boolean") return "Uključi samo kada je ova urednička oznaka zaista potrebna.";
  return "Uredničko polje; proveri vrednost i javni prikaz pre objave.";
}

function getMainFieldForRelation(strapi, attribute) {
  const targetUid = attribute?.targetModel || attribute?.target;
  const target = targetUid ? strapi.contentTypes[targetUid] : null;
  if (!target?.attributes) return "id";
  return ["title", "name", "fullName", "label", "slug"].find((name) => target.attributes[name]) || "id";
}

function isListable(model, name) {
  const attribute = model.attributes?.[name];
  if (!attribute || NON_LISTABLE_TYPES.has(attribute.type)) return false;
  if (attribute.type !== "relation") return true;
  return LISTABLE_RELATIONS.has(attribute.relationType || attribute.relation);
}

function uniqueExisting(names, existingNames) {
  const seen = new Set();
  return names.filter((name) => existingNames.has(name) && !seen.has(name) && seen.add(name));
}

function getLocalizedFields(names, excluded = new Set()) {
  return names
    .filter((name) => splitLocalizedName(name).language && !excluded.has(name))
    .sort((left, right) => {
      const a = splitLocalizedName(left);
      const b = splitLocalizedName(right);
      const languageDifference = LANGUAGE_ORDER.indexOf(a.language) - LANGUAGE_ORDER.indexOf(b.language);
      return languageDifference || a.base.localeCompare(b.base);
    });
}

function getOrderedFields(uid, names, model) {
  const existing = new Set(names);
  const primary = uniqueExisting(PRIMARY_FIELDS[uid] || [], existing);
  const secondary = uniqueExisting(SECONDARY_FIELDS[uid] || [], existing);
  const selected = new Set([...primary, ...secondary]);

  let localized;
  if (uid === "api::article.article") {
    const articleMainTranslations = getLocalizedFields(names).filter((name) => ["title", "subtitle", "content"].includes(splitLocalizedName(name).base));
    localized = articleMainTranslations;
    articleMainTranslations.forEach((name) => selected.add(name));
  } else {
    localized = getLocalizedFields(names);
    localized.forEach((name) => selected.add(name));
  }

  const remainder = names.filter((name) => !selected.has(name));
  const ancillaryTranslations = getLocalizedFields(remainder);
  const ancillaryTranslationSet = new Set(ancillaryTranslations);
  const relationsAndMedia = remainder.filter((name) => {
    const type = model.attributes?.[name]?.type;
    return !ancillaryTranslationSet.has(name) && ["media", "relation", "component", "dynamiczone"].includes(type);
  });
  const editorial = remainder.filter((name) =>
    !ancillaryTranslationSet.has(name) &&
    !relationsAndMedia.includes(name) &&
    /^(is|show|reset)|order|priority|status|active|featured|breaking|trending/i.test(name)
  );
  const seo = remainder.filter((name) => !ancillaryTranslationSet.has(name) && !relationsAndMedia.includes(name) && !editorial.includes(name) && /seo/i.test(name));
  const technical = remainder.filter((name) => TECHNICAL_FIELDS.has(name) || /internal|external.*key/i.test(name));
  const ordinary = remainder.filter((name) =>
    !ancillaryTranslationSet.has(name) && !relationsAndMedia.includes(name) && !editorial.includes(name) &&
    !seo.includes(name) && !technical.includes(name)
  );

  return uniqueExisting([...primary, ...localized, ...secondary, ...ancillaryTranslations, ...ordinary, ...relationsAndMedia, ...editorial, ...seo, ...technical], existing);
}

function buildEditLayout(configuration, uid, model) {
  const sizeByName = new Map();
  for (const row of configuration.layouts?.edit || []) {
    for (const field of row) sizeByName.set(field.name, field.size);
  }

  const orderedNames = getOrderedFields(uid, [...sizeByName.keys()], model);
  const rows = [];
  let currentRow = [];
  let currentSize = 0;

  for (const name of orderedNames) {
    const size = sizeByName.get(name) || 12;
    if (currentRow.length && currentSize + size > 12) {
      rows.push(currentRow);
      currentRow = [];
      currentSize = 0;
    }
    currentRow.push({ name, size });
    currentSize += size;
    if (currentSize >= 12) {
      rows.push(currentRow);
      currentRow = [];
      currentSize = 0;
    }
  }
  if (currentRow.length) rows.push(currentRow);
  return rows;
}

function buildMetadatas(strapi, configuration, model) {
  const metadatas = { ...configuration.metadatas };

  for (const [name, metadata] of Object.entries(configuration.metadatas || {})) {
    const attribute = model.attributes?.[name];
    const edit = {
      ...(metadata.edit || {}),
      label: getFieldLabel(name),
      description: getFieldDescription(name, attribute),
    };
    if (attribute?.type === "relation") edit.mainField = getMainFieldForRelation(strapi, attribute);

    metadatas[name] = {
      ...metadata,
      edit,
      list: { ...(metadata.list || {}), label: getFieldLabel(name) },
    };
  }
  return metadatas;
}

function buildListLayout(uid, configuration, model) {
  const requested = LIST_FIELDS[uid] || [];
  const fields = requested.filter((name) => configuration.metadatas?.[name] && isListable(model, name));
  if (fields.length) return fields;

  const mainField = configuration.settings?.mainField;
  const fallback = [mainField, "updatedAt", ...(configuration.layouts?.list || [])]
    .filter((name) => name && configuration.metadatas?.[name] && isListable(model, name));
  return [...new Set(fallback)].slice(0, 5);
}

function buildSettings(configuration, model) {
  const names = new Set(Object.keys(model.attributes || {}));
  const mainField = ["title", "name", "fullName", "label", "slug", configuration.settings?.mainField]
    .find((name) => name && names.has(name)) || configuration.settings?.mainField || "id";
  const defaultSortBy = names.has("order")
    ? "order"
    : names.has("displayOrder")
      ? "displayOrder"
      : names.has("ordinal")
        ? "ordinal"
        : names.has("updatedAt")
          ? "updatedAt"
          : mainField;

  return {
    ...configuration.settings,
    mainField,
    defaultSortBy,
    defaultSortOrder: ["order", "displayOrder", "ordinal"].includes(defaultSortBy) ? "ASC" : "DESC",
    pageSize: configuration.settings?.pageSize || 10,
  };
}

function toStoredConfiguration(configuration) {
  return {
    settings: configuration.settings,
    metadatas: configuration.metadatas,
    layouts: configuration.layouts,
    options: configuration.options,
  };
}

async function saveMarker(store, completedUids, errors, complete) {
  await store.set({
    key: MARKER_STORE_KEY,
    value: {
      version: LAYOUT_VERSION,
      completedUids: [...completedUids].sort(),
      errors,
      complete,
      updatedAt: new Date().toISOString(),
    },
  });
}

async function applyAvangardaAdminLayouts(strapi) {
  const store = strapi.store({ type: "plugin", name: "content_manager" });
  const contentTypeService = strapi.plugin("content-manager")?.service("content-types");
  if (!contentTypeService) {
    strapi.log.warn(`[${LAYOUT_VERSION}] Content Manager configuration service is unavailable.`);
    return;
  }

  const marker = (await store.get({ key: MARKER_STORE_KEY })) || {};
  if (marker.version === LAYOUT_VERSION && marker.complete === true) {
    strapi.log.info(`[${LAYOUT_VERSION}] Admin layouts are already applied.`);
    return;
  }

  const models = Object.values(strapi.contentTypes)
    .filter((model) => model.uid?.startsWith("api::") && model.pluginOptions?.["content-manager"]?.visible !== false)
    .sort((left, right) => left.uid.localeCompare(right.uid));

  const existingBackup = await store.get({ key: BACKUP_STORE_KEY });
  if (!existingBackup) {
    const configurations = {};
    for (const model of models) {
      configurations[model.uid] = toStoredConfiguration(await contentTypeService.findConfiguration(model));
    }
    await store.set({
      key: BACKUP_STORE_KEY,
      value: { version: LAYOUT_VERSION, createdAt: new Date().toISOString(), configurations },
    });
    strapi.log.info(`[${LAYOUT_VERSION}] Backup saved to content_manager store key ${BACKUP_STORE_KEY}.`);
  }

  const completedUids = new Set(marker.version === LAYOUT_VERSION ? marker.completedUids || [] : []);
  const errors = {};

  for (const model of models) {
    if (completedUids.has(model.uid)) continue;
    try {
      const configuration = await contentTypeService.findConfiguration(model);
      const nextConfiguration = {
        settings: buildSettings(configuration, model),
        metadatas: buildMetadatas(strapi, configuration, model),
        layouts: {
          ...configuration.layouts,
          edit: buildEditLayout(configuration, model.uid, model),
          list: buildListLayout(model.uid, configuration, model),
        },
        options: configuration.options,
      };

      await contentTypeService.updateConfiguration(model, nextConfiguration);
      completedUids.add(model.uid);
      await saveMarker(store, completedUids, errors, false);
      strapi.log.info(`[${LAYOUT_VERSION}] Applied ${model.uid}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors[model.uid] = message.slice(0, 500);
      strapi.log.error(`[${LAYOUT_VERSION}] Could not configure ${model.uid}: ${message}`);
    }
  }

  const complete = completedUids.size === models.length;
  await saveMarker(store, completedUids, errors, complete);
  strapi.log.info(`[${LAYOUT_VERSION}] Finished: ${completedUids.size}/${models.length} models configured.`);
}

module.exports = {
  BACKUP_STORE_KEY,
  LAYOUT_VERSION,
  MARKER_STORE_KEY,
  applyAvangardaAdminLayouts,
};
