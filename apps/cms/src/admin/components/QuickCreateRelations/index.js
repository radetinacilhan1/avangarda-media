import React, { useMemo, useState } from "react";

import {
  getFetchClient,
  useCMEditViewDataManager,
  useRBAC,
} from "@strapi/helper-plugin";

import "./quick-create-relations.css";

const ARTICLE_UID = "api::article.article";
const CREATE_ACTION = "plugin::content-manager.explorer.create";
const RELATIONS = [
  { key: "tag", permissionKey: "canTag", relationName: "tags", uid: "api::tag.tag", label: "oznaku", buttonLabel: "Nova oznaka" },
  { key: "topic", permissionKey: "canTopic", relationName: "topics", uid: "api::topic.topic", label: "temu", buttonLabel: "Nova tema" },
  { key: "location", permissionKey: "canLocation", relationName: "locations", uid: "api::location.location", label: "lokaciju", buttonLabel: "Nova lokacija" },
];

const PERMISSIONS = Object.fromEntries(
  RELATIONS.map((relation) => [
    relation.key,
    [{ action: CREATE_ACTION, subject: relation.uid }],
  ])
);

function slugify(value) {
  return value
    .trim()
    .toLocaleLowerCase("sr-Latn")
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function unwrapResults(payload) {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getErrorMessage(error) {
  return error?.response?.data?.error?.message
    || error?.response?.data?.message
    || error?.message
    || "Zapis nije mogao da se kreira.";
}

export default function QuickCreateRelations() {
  const {
    createActionAllowedFields,
    isCreatingEntry,
    modifiedData,
    relationConnect,
    slug: contentTypeUid,
    updateActionAllowedFields,
  } = useCMEditViewDataManager();
  const { allowedActions, isLoading: permissionsLoading } = useRBAC(PERMISSIONS);
  const [activeRelation, setActiveRelation] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const writableFields = isCreatingEntry ? createActionAllowedFields : updateActionAllowedFields;
  const visibleRelations = useMemo(() => RELATIONS.filter((relation) => {
    return Array.isArray(writableFields) && writableFields.includes(relation.relationName);
  }), [writableFields]);

  if (contentTypeUid !== ARTICLE_UID || visibleRelations.length === 0) return null;

  function openModal(relation) {
    setActiveRelation(relation);
    setName("");
    setSlug("");
    setSlugEdited(false);
    setExistingRecord(null);
    setStatus("");
    setError("");
  }

  function closeModal() {
    if (saving) return;
    setActiveRelation(null);
    setExistingRecord(null);
    setError("");
  }

  function connectRecord(record) {
    if (!activeRelation || !record?.id || !relationConnect) {
      setError("Zapis postoji, ali nije mogao odmah da se poveže.");
      return;
    }

    const currentRelations = Array.isArray(modifiedData?.[activeRelation.relationName])
      ? modifiedData[activeRelation.relationName]
      : [];
    const alreadyConnected = currentRelations.some((entry) => String(entry?.id) === String(record.id));

    if (!alreadyConnected) {
      relationConnect({
        name: activeRelation.relationName,
        value: { id: record.id },
      });
    }

    setStatus(alreadyConnected
      ? `${record.name || record.slug} je već povezan sa člankom.`
      : `${record.name || record.slug} je kreiran/povezan. Sačuvaj članak da relacija ostane.`);
    setActiveRelation(null);
    setExistingRecord(null);
  }

  async function submit(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!activeRelation || saving) return;

    const cleanName = name.trim();
    const cleanSlug = slugify(slug || name);
    if (!cleanName || !cleanSlug) {
      setError("Naziv i ispravan slug su obavezni.");
      return;
    }

    setSaving(true);
    setError("");
    setExistingRecord(null);

    try {
      const client = getFetchClient();
      const listResponse = await client.get(`/content-manager/collection-types/${activeRelation.uid}`, {
        params: { page: 1, pageSize: 100, sort: "name:ASC" },
      });
      const duplicate = unwrapResults(listResponse.data).find((record) => {
        return String(record?.name || "").trim().toLocaleLowerCase("sr-Latn") === cleanName.toLocaleLowerCase("sr-Latn")
          || String(record?.slug || "").trim().toLowerCase() === cleanSlug.toLowerCase();
      });

      if (duplicate) {
        setExistingRecord(duplicate);
        setStatus("Duplikat nije kreiran. Možeš povezati postojeći zapis.");
        return;
      }

      const createResponse = await client.post(
        `/content-manager/collection-types/${activeRelation.uid}`,
        { name: cleanName, slug: cleanSlug }
      );
      connectRecord(createResponse.data);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="avangarda-quick-create">
      <strong>Kreiraj i poveži</strong>
      <p>Dodaj minimalan zapis bez napuštanja članka. Ovi tipovi nemaju draft režim.</p>
      <div className="avangarda-quick-create__actions">
        {visibleRelations.map((relation) => {
          const canCreate = allowedActions?.[relation.permissionKey] === true;
          return (
            <button
              key={relation.key}
              type="button"
              disabled={permissionsLoading || !canCreate}
              onClick={() => openModal(relation)}
              title={canCreate ? `Kreiraj ${relation.label}` : "Nemaš dozvolu za kreiranje ovog tipa"}
            >
              {relation.buttonLabel}
            </button>
          );
        })}
      </div>
      {status ? <p className="avangarda-quick-create__status" role="status">{status}</p> : null}

      {activeRelation ? (
        <div className="avangarda-quick-create__backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <section
            className="avangarda-quick-create__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avangarda-quick-create-title"
          >
            <div className="avangarda-quick-create__dialog-header">
              <div>
                <span>Članak ostaje otvoren</span>
                <h2 id="avangarda-quick-create-title">Kreiraj {activeRelation.label}</h2>
              </div>
              <button type="button" onClick={closeModal} aria-label="Zatvori">×</button>
            </div>

            <form onSubmit={submit}>
              <label>
                Naziv*
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setName(nextName);
                    if (!slugEdited) setSlug(slugify(nextName));
                  }}
                  maxLength={160}
                />
              </label>
              <label>
                Slug*
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(event.target.value);
                  }}
                  onBlur={() => setSlug(slugify(slug || name))}
                  maxLength={120}
                />
              </label>

              <p className="avangarda-quick-create__note">
                Zapis se odmah objavljuje jer postojeći model nema Draft &amp; Publish ni Strapi i18n.
                Prevode teme/lokacije možeš dopuniti kasnije; ne prave se prazne lokalizacije.
              </p>

              {existingRecord ? (
                <div className="avangarda-quick-create__duplicate" role="status">
                  <strong>Postojeći zapis: {existingRecord.name}</strong>
                  <span>/{existingRecord.slug}</span>
                  <button type="button" onClick={() => connectRecord(existingRecord)}>Poveži postojeći</button>
                </div>
              ) : null}
              {error ? <p className="avangarda-quick-create__error" role="alert">{error}</p> : null}

              <div className="avangarda-quick-create__dialog-actions">
                <button type="button" onClick={closeModal} disabled={saving}>Otkaži</button>
                <button type="submit" disabled={saving}>{saving ? "Provera…" : "Kreiraj i poveži"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
