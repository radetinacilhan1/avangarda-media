import React, { useState } from "react";
import styled from "styled-components";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";

const fields = ["content", "content_en", "content_tr", "content_fr", "content_de", "content_es", "content_el", "content_ar"];
const escapeLabel = (value) => String(value).replace(/[\\[\]]/g, "\\$&").replace(/[\r\n]+/g, " ");

const Panel = styled.section`
  padding: 16px;
  margin-top: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.neutral800};
  background: ${({ theme }) => theme.colors.neutral0};
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  button, select {
    color: ${({ theme }) => theme.colors.neutral800};
    background: ${({ theme }) => theme.colors.neutral100};
    border: 1px solid ${({ theme }) => theme.colors.neutral200};
    border-radius: 4px;
    padding: 8px;
  }
  button:disabled { opacity: .5; }
`;

export default function ArticleDocumentLinks() {
  const { slug, modifiedData, onChange, isCreatingEntry, createActionAllowedFields, updateActionAllowedFields } = useCMEditViewDataManager();
  const [field, setField] = useState("content");
  const [status, setStatus] = useState("");
  if (slug !== "api::article.article") return null;
  const allowed = isCreatingEntry ? createActionAllowedFields : updateActionAllowedFields;
  const writable = fields.filter((name) => Array.isArray(allowed) && allowed.includes(name));
  const documents = (modifiedData?.documents || []).filter((entry) => entry.id && entry.pdfFile);
  return <Panel>
    <h2 style={{ fontWeight: 700 }}>Dokumenti uz tekst</h2>
    <p style={{ marginBlock: 12, lineHeight: 1.5 }}>U polju „Dokumenti uz tekst” dodajte PDF iz Media Library ili otpremite novi (do 15 MB). Sačuvajte članak da biste ovde dobili link za glavni tekst. Dokumenti su javni tek kada je članak objavljen.</p>
    {writable.length ? <label>Tekst u koji se dodaje link
      <select aria-label="Jezik teksta za PDF link" value={field} onChange={(event) => setField(event.target.value)} style={{ width: "100%", minHeight: 44 }}>
        {writable.map((name) => <option key={name} value={name}>{name === "content" ? "Srpski" : name.slice(8).toUpperCase()}</option>)}
      </select>
    </label> : null}
    {documents.map((document) => <div key={document.id} style={{ marginTop: 12 }}>
      <strong>{document.title || "PDF"}</strong>
      <button type="button" disabled={!writable.includes(field) || !modifiedData.slug} style={{ display: "block", minHeight: 44 }} onClick={() => {
        const url = `/api/article-document?slug=${encodeURIComponent(modifiedData.slug)}&document=${document.id}`;
        const link = `[${escapeLabel(document.linkLabel || document.title || "PDF")}](${url})`;
        onChange({ target: { name: field, value: `${modifiedData[field] || ""}\n\n${link}`, type: "string" } });
        setStatus("Link je dodat na kraj izabranog teksta. Možete ga premestiti u editoru. Sačuvajte izmene.");
      }}>Dodaj link u tekst</button>
    </div>)}
    <p role="status">{status}</p>
  </Panel>;
}
