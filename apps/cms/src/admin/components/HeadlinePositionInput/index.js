import React, { forwardRef, useEffect, useState } from "react";
import styled from "styled-components";
import { useCMEditViewDataManager, useFetchClient, useRBAC } from "@strapi/helper-plugin";

const permissions = { publish: [{ action: "plugin::content-manager.explorer.publish", subject: "api::article.article" }] };
const Panel = styled.section`
  color: ${({ theme }) => theme.colors.neutral800};
  border: 1px solid ${({ theme }) => theme.colors.neutral200}; border-radius: 4px; padding: 16px;
  background: ${({ theme }) => theme.colors.neutral0}; font-size: 14px; line-height: 1.5;
  label, h3 { display: block; font-weight: 600; margin-bottom: 8px; }
  select, button {
    min-height: 40px; border-radius: 4px; padding: 8px 12px;
    border: 1px solid ${({ theme }) => theme.colors.neutral300};
    background: ${({ theme }) => theme.colors.neutral100}; color: inherit;
  }
  select { width: 100%; max-width: 320px; }
  button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .preview { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 16px; }
  ol { padding-inline-start: 24px; } li { margin-block: 8px; overflow-wrap: anywhere; }
  .hint { color: ${({ theme }) => theme.colors.neutral600}; margin-top: 12px; }
  .error { color: ${({ theme }) => theme.colors.danger600}; margin-top: 12px; }
  @media (max-width: 700px) { .preview { grid-template-columns: 1fr; gap: 12px; } }
`;

function previewOrder(articles, article, position) {
  const next = articles.filter((item) => Number(item.id) !== Number(article.id));
  if (position > 0) next.splice(Math.min(position - 1, next.length), 0, article);
  return next.slice(0, 5);
}

// v4 Content Manager formats JSON attributes as strings in browser state and
// JSON.parse's them on Save, including supported JSON custom fields.
function parsePlacement(value) {
  if (typeof value !== "string") return value || null;
  try { return JSON.parse(value); } catch { return null; }
}

const HeadlinePositionInput = forwardRef(function HeadlinePositionInput({ name, attribute, value, disabled, error, onChange }, ref) {
  const { modifiedData, initialData, isCreatingEntry } = useCMEditViewDataManager();
  const { get, post } = useFetchClient();
  const { allowedActions } = useRBAC(permissions);
  const [state, setState] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const id = Number(modifiedData?.id || initialData?.id) || "new";
  const placement = parsePlacement(value);
  const savedPlacement = parsePlacement(initialData?.[name]);
  const load = async () => {
    setBusy(true);
    try {
      const response = await get("/content-manager/headline-selection/state");
      setState(response.data.data);
      setMessage("");
      return response.data.data;
    } catch (failure) { setMessage(failure.response?.data?.error?.message || "Pregled naslovne trenutno nije dostupan. Pokušaj ponovo."); }
    finally { setBusy(false); }
    return null;
  };
  useEffect(() => { void load(); }, [id, initialData?.publishedAt]);
  const current = state?.articles || [];
  const selected = current.findIndex((article) => Number(article.id) === id) + 1;
  const applied = state?.appliedOperationIds?.includes(placement?.operationId);
  const position = applied ? selected : Number.isInteger(placement?.position) ? placement.position : selected;
  const stale = Boolean(placement && state && placement.baseRevision !== state.revision && !applied);
  const saved = Boolean(placement?.operationId && placement.operationId === savedPlacement?.operationId);
  const published = Boolean(initialData?.publishedAt);
  const article = { id, title: modifiedData?.title || "Novi članak" };
  const proposed = applied ? current : previewOrder(current, article, position);
  const choose = (nextPosition, version = state) => {
    if (!version) return;
    onChange({ target: { name, type: attribute.type, value: JSON.stringify({ position: nextPosition, baseRevision: version.revision, operationId: window.crypto.randomUUID().replaceAll("-", "_") }) } });
    setMessage("");
  };
  return <Panel aria-label="Pozicija na naslovnoj">
    <label htmlFor={`headline-${name}`}>Pozicija na naslovnoj</label>
    <select ref={ref} id={`headline-${name}`} name={name} value={position} disabled={disabled || !state || busy} onChange={(event) => choose(Number(event.target.value))}>
      <option value={0}>Nije izabran</option>
      {[1, 2, 3, 4, 5].map((number) => <option key={number} value={number}>{number}</option>)}
    </select>
    <p className="hint">Save čuva predlog. Javna naslovna se menja tek pri objavi članka (Publish). Za već objavljen članak sačuvaj izbor, zatim klikni „Objavi raspored”. Pomereni i potisnuti članci zadržavaju sadržaj i status objave.</p>
    {state && <div className="preview">
      <div><h3>Trenutni izbor</h3>{current.length ? <ol>{current.map((item) => <li key={item.id}>{item.title}</li>)}</ol> : <p>Nema izabranih članaka.</p>}</div>
      <div><h3>Posle objave ovog izbora</h3>{proposed.length ? <ol>{proposed.map((item) => <li key={item.id}>{item.title}</li>)}</ol> : <p>Nema izabranih članaka.</p>}</div>
    </div>}
    <div className="actions">
      <button type="button" disabled={busy} onClick={() => { void load(); }}>Osveži pregled</button>
      {stale && <button type="button" disabled={disabled || busy} onClick={async () => { const fresh = await load(); if (fresh) choose(position, fresh); }}>Potvrdi izbor u novom rasporedu</button>}
      {published && allowedActions.canPublish && <button type="button" disabled={disabled || busy || !saved || stale || applied || isCreatingEntry} onClick={async () => {
        setBusy(true);
        try {
          await post(`/content-manager/headline-selection/apply/${id}`, { operationId: placement.operationId });
          await load();
          setMessage("Naslovni raspored je objavljen.");
        } catch (failure) { setMessage(failure.response?.data?.error?.message || "Raspored nije objavljen. Osveži pregled i proveri izbor."); }
        finally { setBusy(false); }
      }}>Objavi raspored</button>}
    </div>
    {stale && <p className="error" role="alert">Drugi urednik je promenio naslovnu. Osveži pregled, potvrdi posledicu svog izbora i sačuvaj ga ponovo pre objave.</p>}
    {!saved && placement && <p className="hint">Sačuvaj članak (Save) da bi ovaj predlog mogao da se objavi.</p>}
    {applied && <p className="hint">Ovaj sačuvani izbor je već primenjen. Za novu promenu izaberi novu poziciju.</p>}
    {error && <p className="error" role="alert">{typeof error === "string" ? error : "Proveri izabranu poziciju."}</p>}
    {message && <p role="status">{message}</p>}
  </Panel>;
});

export default HeadlinePositionInput;
