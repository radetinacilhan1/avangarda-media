import React, { useEffect, useRef, useState } from "react";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { GALLERY_UID, imageLabel, focusGalleryField, galleryErrorEntries, galleryGeneralErrors } from "../../gallery-workflow-utils";
import GalleryWriteRecovery from "../GalleryWriteRecovery";

const Panel = styled.section`
  margin-top: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.neutral0};
  color: ${({ theme }) => theme.colors.neutral800};
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  h2 { font-weight: 700; margin-bottom: 8px; }
  ul { padding-left: 20px; list-style: disc; }
  button { color: ${({ theme }) => theme.colors.danger600}; text-align: left; background: none; border: 0; text-decoration: underline; min-height: 44px; padding: 4px 0; cursor: pointer; }
  p + p { margin-top: 8px; }
`;

const labels = {
  image: "Fotografija", internalName: "Interni naziv fotografije", matchUrl: "Adresa fotografije",
  altText: "Alt tekst", caption: "Opis fotografije", layout: "Raspored fotografije",
  insertAfterParagraph: "Pozicija posle pasusa", creditType: "Vrsta kredita", authorName: "Autor fotografije",
  sourceName: "Izvor", sourceUrl: "Adresa izvora", license: "Licenca", year: "Godina", copyrightNotice: "Autorska prava",
  title: "Naslov", slug: "Slug", galleryDate: "Datum galerije", description: "Opis galerije",
};

function fieldLabel(path) {
  const field = path.split(".").pop();
  const base = field.replace(/_(en|tr|fr|de|es|el|ar)$/, "");
  const language = field === base ? "" : ` (${field.slice(-2).toUpperCase()})`;
  return `${labels[base] || base}${language}`;
}

export default function GalleryWorkflow() {
  const { slug, modifiedData, initialData, onChange, formErrors } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();
  const initialized = useRef(null);
  const [focusStatus, setFocusStatus] = useState("");
  const images = modifiedData?.images;

  useEffect(() => {
    if (slug !== GALLERY_UID || !Array.isArray(images)) return;
    const identity = initialData;
    const firstPass = initialized.current !== identity;
    if (firstPass) initialized.current = identity;
    let changed = false;
    const labelledImages = images.map((row, index) => {
      const label = imageLabel(row, index);
      if (row.adminLabel === label) return row;
      changed = true;
      return { ...row, adminLabel: label };
    });
    if (changed) onChange({ target: { name: "images", value: labelledImages, type: "json" } }, firstPass);
  }, [slug, images, initialData, onChange]);

  if (slug !== GALLERY_UID) return null;
  const knownFields = new Set(Object.keys({ ...initialData, ...modifiedData }));
  const errors = galleryErrorEntries(formErrors).filter(([path]) => knownFields.has(path.split(".")[0]));
  const generalErrors = galleryGeneralErrors(formErrors, knownFields);
  const errorMessage = (error) => {
    if (typeof error === "string") return error;
    const fallback = error.defaultMessage || error.message || error.id || "Proverite vrednost ovog polja.";
    return formatMessage({ id: error.id || fallback, defaultMessage: fallback }, error.values);
  };
  return <Panel aria-label="Pomoć za fotografije galerije">
    <h2>Fotografije galerije</h2>
    <p>Za postojeći fajl koristite „Pretraži postojeće fotografije” u redu fotografije. Nije potreban ponovni upload. Oznaka „Već u ovoj galeriji” prepoznaje isti fajl po media ID-ju.</p>
    <GalleryWriteRecovery generalMessages={generalErrors.map(errorMessage)} hasFieldErrors={errors.length > 0} />
    {errors.length > 0 && <div role="alert">
      <h2 style={{ marginTop: 12 }}>Proverite označena polja ({errors.length})</h2>
      <ul>{errors.map(([path, error]) => {
        const match = /^images\.(\d+)\./.exec(path);
        const prefix = match ? `Fotografija ${String(Number(match[1]) + 1).padStart(2, "0")} · ` : "";
        const message = errorMessage(error);
        const labelledMessage = /^(?:Fotografija\s+\d+\s*[·:—-]|[^:]+:)/.test(message) ? message : `${prefix}${fieldLabel(path)}: ${message}`;
        return <li key={path}><button type="button" onClick={() => {
          const unavailable = "Polje trenutno nije dostupno. Otvorite odgovarajući red; svi nesnimljeni unosi su sačuvani u formi.";
          const found = focusGalleryField(path, document, window.requestAnimationFrame.bind(window), (focused) => setFocusStatus(focused ? "" : unavailable));
          if (!found) setFocusStatus(unavailable);
        }}>{labelledMessage}</button></li>;
      })}</ul>
    </div>}
    {focusStatus && <p role="status">{focusStatus}</p>}
  </Panel>;
}
