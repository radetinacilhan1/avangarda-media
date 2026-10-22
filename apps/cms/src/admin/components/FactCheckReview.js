import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useCMEditViewDataManager, useFetchClient, useRBAC } from "@strapi/helper-plugin";

const permissions = { publish: [{ action: "plugin::content-manager.explorer.publish", subject: "api::fact-check.fact-check" }] };
const Panel = styled.section`
  padding: 16px; margin-top: 16px; border: 1px solid ${({ theme }) => theme.colors.neutral200}; border-radius: 4px;
  color: ${({ theme }) => theme.colors.neutral800}; background: ${({ theme }) => theme.colors.neutral0}; font-size: 14px; line-height: 1.5;
  h2 { font-weight: 700; } p, label { display: block; margin-block: 10px; }
  button { padding: 10px; min-height: 40px; border: 1px solid ${({ theme }) => theme.colors.neutral300}; border-radius: 4px; background: ${({ theme }) => theme.colors.neutral100}; color: inherit; cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; }
`;

export default function FactCheckReview() {
  const { slug, initialData, isCreatingEntry, modifiedData } = useCMEditViewDataManager();
  const { get, post } = useFetchClient();
  const { allowedActions } = useRBAC(permissions);
  const [review, setReview] = useState(null), [attachment, setAttachment] = useState(null), [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const id = initialData?.id;
  const fact = slug === "api::fact-check.fact-check", submission = slug === "api::fact-check-submission.fact-check-submission";
  const dirty = JSON.stringify(initialData) !== JSON.stringify(modifiedData);
  const load = async () => {
    setMessage(""); setConfirmed(false);
    if (!id || isCreatingEntry || (!fact && !submission)) return;
    try {
      const response = await get(fact ? `/content-manager/fact-check-review/${id}` : `/content-manager/fact-check-submissions/${id}/attachment`);
      if (fact) setReview(response.data.data); else setAttachment(response.data.data);
    } catch (error) {
      if (submission && error.response?.status === 404) setAttachment(null);
      else setMessage(error.response?.data?.error?.message || "Pregled trenutno nije dostupan.");
    }
  };
  useEffect(() => { void load(); }, [slug, id, initialData?.updatedAt]);
  if (!fact && !submission) return null;
  return <Panel>
    <h2>{fact ? "Urednička potvrda provere" : "Privatan originalni prilog"}</h2>
    {fact ? <>
      <p>Sačuvaj nacrt, proveri tvrdnju, izvore, ocenu i sve prevode. AI priprema ostaje nacrt. Potvrda beleži tvoj prijavljeni identitet i samo sačuvanu verziju; zatim koristi Publish. Svaka izmena javnog sadržaja poništava potvrdu i vraća zapis u nacrt.</p>
      {review?.approved && <p>Potvrđeno: {review.approvedBy}, {new Date(review.approvedAt).toLocaleString()}.</p>}
      {!review?.approved && <p>Ova verzija još nema važeću uredničku potvrdu.</p>}
      <label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Pročitao/la sam sačuvanu tvrdnju, dokaze, ocenu i prevode i preuzimam uredničku odgovornost za pregled.</label>
      <button type="button" disabled={!id || isCreatingEntry || dirty || busy || !confirmed || !review?.fingerprint || !allowedActions.canPublish} onClick={async () => {
        setBusy(true);
        try { await post(`/content-manager/fact-check-review/${id}/approve`, { confirmed: true, fingerprint: review.fingerprint }); await load(); setMessage("Sačuvana verzija je potvrđena. Za javnu objavu izaberi Publish."); }
        catch (error) { setMessage(error.response?.data?.error?.message || "Potvrda nije uspela. Osveži pregled."); }
        finally { setBusy(false); }
      }}>Potvrdi pregled sačuvane verzije</button>
      {dirty && <p>Prvo sačuvaj izmene (Save), zatim ponovi pregled.</p>}
    </> : <>
      <p>Screenshot se čuva u privatnoj CMS bazi. Ne postoji javni Media Library link. Status i vezu ka objavljenoj proveri uređuješ u ovoj prijavi.</p>
      {attachment ? <button type="button" disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          const response = await get(`/content-manager/fact-check-submissions/${id}/attachment?download=1`, { responseType: "blob" });
          const url = URL.createObjectURL(response.data); const anchor = document.createElement("a"); anchor.href = url; anchor.download = attachment.name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch { setMessage("Preuzimanje nije uspelo ili nemaš dozvolu."); }
        finally { setBusy(false); }
      }}>Preuzmi privatni prilog ({Math.ceil(attachment.bytes / 1024)} KB)</button> : <p>Nema priloženog screenshota.</p>}
    </>}
    {!isCreatingEntry && <p><button type="button" disabled={busy} onClick={() => { void load(); }}>Osveži pregled</button></p>}
    {message && <p role="status">{message}</p>}
  </Panel>;
}
