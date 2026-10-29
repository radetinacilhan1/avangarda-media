"use strict";

const GALLERY_UID = "api::gallery.gallery";
const IMAGE_COMPONENT_UID = "shared.article-image-credit";

function mediaId(media) {
  const value = media?.data?.id ?? media?.id ?? (typeof media === "number" || typeof media === "string" ? media : null);
  return value === null || value === undefined || value === "" ? null : String(value);
}

function imageLabel(row, index) {
  const number = String(index + 1).padStart(2, "0");
  const file = row?.image?.data?.attributes ?? row?.image;
  const name = String(row?.internalName || "").trim() || String(file?.name || "").trim();
  return name ? `${number} · ${name}` : `Fotografija ${number} — izaberi sliku`;
}

function galleryMediaIds(images) {
  return new Set((images || []).map((row) => mediaId(row?.image)).filter(Boolean));
}

function galleryLayout({ layout, ...rest }) {
  if (layout?.contentType?.uid !== GALLERY_UID || !layout.components?.[IMAGE_COMPONENT_UID]) return { layout, ...rest };
  const component = layout.components[IMAGE_COMPONENT_UID];
  const edit = (component.layouts?.edit || [])
    .map((row) => row.filter((field) => !["internalName", "adminLabel"].includes(field.name)))
    .filter((row) => row.length);
  const internalName = {
    name: "internalName",
    size: 12,
    fieldSchema: component.attributes.internalName,
    metadatas: {
      label: "Interni naziv fotografije (opciono)",
      description: "Samo za prepoznavanje reda u CMS-u. Ako je prazno, koristi se naziv fajla. Ne menja opis, alt tekst, autora ni prava.",
      placeholder: "Opciono — inače se koristi naziv fajla",
      visible: true,
      editable: true,
    },
  };
  return {
    ...rest,
    layout: {
      ...layout,
      components: {
        ...layout.components,
        [IMAGE_COMPONENT_UID]: {
          ...component,
          settings: { ...component.settings, mainField: "adminLabel" },
          layouts: { ...component.layouts, edit: [[internalName], ...edit] },
        },
      },
    },
  };
}

// Strapi 4 emits these accessibility attributes from AccordionToggle and uses
// each field path as its input id. Only normal click/focus actions are used:
// changing ?field= would make Strapi refetch and replace the unsaved form.
function focusGalleryField(path, documentObject, schedule, onFocused) {
  if (typeof path !== "string" || !documentObject) return false;
  const match = /^images\.(\d+)\.[A-Za-z][A-Za-z0-9_]*$/.exec(path);
  if (match) {
    const controls = `accordion-content-images.${match[1]}`;
    const toggle = Array.from(documentObject.querySelectorAll("[data-strapi-accordion-toggle]"))
      .find((element) => element.getAttribute("aria-controls") === controls);
    if (!toggle) return false;
    if (toggle.getAttribute("aria-expanded") !== "true") toggle.click();
  }
  const focus = () => {
    const field = documentObject.getElementById(path);
    if (field) {
      field.focus();
      field.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }
    onFocused?.(Boolean(field));
  };
  (schedule || ((callback) => callback()))(focus);
  return true;
}

function galleryErrorEntries(errors, prefix = "") {
  if (!errors || typeof errors !== "object") return [];
  if (!prefix && (errors.id || errors.defaultMessage || typeof errors.message === "string")) return [];
  return Object.entries(errors).flatMap(([key, error]) => {
    // Native Strapi 4 spreads non-validation API error strings into numeric
    // properties. They represent one server message, never individual fields.
    if (!prefix && /^\d+$/.test(key)) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    if (!error) return [];
    if (typeof error === "string" || error.id || error.defaultMessage || error.message) return [[path, error]];
    return galleryErrorEntries(error, path);
  });
}

function galleryGeneralErrors(errors, knownFields = new Set()) {
  if (!errors) return [];
  if (typeof errors === "string") return [errors];
  if (typeof errors !== "object") return [];
  if (errors.id || errors.defaultMessage || typeof errors.message === "string") return [errors];
  const messages = [];
  const characters = Object.keys(errors).filter((key) => /^\d+$/.test(key)).sort((a, b) => Number(a) - Number(b));
  if (characters.length && characters.every((key) => typeof errors[key] === "string")) messages.push(characters.map((key) => errors[key]).join(""));
  for (const [key, value] of Object.entries(errors)) {
    if (/^\d+$/.test(key) || knownFields.has(key.split(".")[0])) continue;
    if (typeof value === "string" || value?.id || value?.defaultMessage || value?.message) messages.push(value);
  }
  return messages;
}

module.exports = { GALLERY_UID, IMAGE_COMPONENT_UID, mediaId, imageLabel, galleryMediaIds, galleryLayout, focusGalleryField, galleryErrorEntries, galleryGeneralErrors };
