import React, { useEffect, useRef, useState } from "react";
import { getFetchClient, useCMEditViewDataManager } from "@strapi/helper-plugin";
import { GALLERY_UID } from "../../gallery-workflow-utils";
import { isReadAbort, readWithRecovery } from "../../gallery-read-recovery";
import { captureWriteAttempt, nativeWriteConfirmed, relationChanges, savedIntentMatches, writeAction, writeFailureOutcome } from "../../gallery-write-recovery";

const actionLabels = { save: "Čuvanje", publish: "Objavljivanje", unpublish: "Povlačenje objave" };

export default function GalleryWriteRecovery({ generalMessages, hasFieldErrors }) {
  const { slug, status, initialData, modifiedData } = useCMEditViewDataManager();
  const previousStatus = useRef(null);
  const attempt = useRef(null);
  const controller = useRef(null);
  const checkInFlight = useRef(false);
  const [outcome, setOutcome] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [clock, setClock] = useState(Date.now);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (retryAt <= Date.now()) return undefined;
    const timer = setInterval(() => {
      const current = Date.now();
      setClock(current);
      if (current >= retryAt) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [retryAt]);

  useEffect(() => {
    if (slug !== GALLERY_UID) return;
    const action = writeAction(status);
    if (attempt.current?.id != null && initialData?.id != null && String(attempt.current.id) !== String(initialData.id)) {
      controller.current?.abort();
      attempt.current = null;
      checkInFlight.current = false;
      setOutcome(null);
      setChecking(false);
      setCheckMessage("");
      setRetryAt(0);
    }
    if (action && status !== previousStatus.current) {
      controller.current?.abort();
      checkInFlight.current = false;
      setChecking(false);
      setCheckMessage("");
      setRetryAt(0);
      attempt.current = captureWriteAttempt(status, initialData, modifiedData);
      setOutcome("pending");
    } else if (attempt.current && !action) {
      if (nativeWriteConfirmed(attempt.current, initialData)) {
        setOutcome("confirmed");
      } else if (writeAction(previousStatus.current)) {
        setOutcome(writeFailureOutcome({ hasFieldErrors, generalMessages }));
      }
    }
    previousStatus.current = status;
  }, [slug, status, initialData, modifiedData, hasFieldErrors, generalMessages]);

  async function checkSavedVersion() {
    if (!attempt.current?.id || checkInFlight.current || retryAt > Date.now()) return;
    checkInFlight.current = true;
    const currentAttempt = attempt.current;
    const currentController = new AbortController();
    controller.current?.abort();
    controller.current = currentController;
    setChecking(true);
    setCheckMessage("");
    const read = (endpoint, params) => readWithRecovery(endpoint, ({ signal }) => getFetchClient().get(endpoint, { signal, params }), {
      signal: currentController.signal,
      onWait: ({ retryAt: deadline }) => { if (!currentController.signal.aborted) { setRetryAt(deadline); setClock(Date.now()); } },
    });
    try {
      const endpoint = `/content-manager/collection-types/${GALLERY_UID}/${encodeURIComponent(currentAttempt.id)}`;
      const { data: saved } = await read(endpoint);
      const relations = {};
      for (const { field } of relationChanges(currentAttempt)) {
        const rows = [];
        let page = 1;
        while (true) {
          const { data } = await read(`/content-manager/relations/${GALLERY_UID}/${encodeURIComponent(currentAttempt.id)}/${field}`, { page, pageSize: 50 });
          if (!Array.isArray(data?.results) || !Number.isInteger(data.pagination?.pageCount)) throw new Error("Incomplete relation response");
          rows.push(...data.results);
          if (page >= data.pagination.pageCount) break;
          if (page >= 100) throw new Error("Relation verification exceeds bounded pages");
          page += 1;
        }
        relations[field] = rows;
      }
      if (currentController.signal.aborted || attempt.current !== currentAttempt) return;
      setRetryAt(0);
      if (savedIntentMatches(currentAttempt, saved, relations)) {
        setOutcome("confirmed");
        setCheckMessage("Sačuvana verzija sadrži izmene iz prethodnog pokušaja. Naknadni nesnimljeni unosi ostaju u otvorenoj formi.");
      } else {
        setOutcome("unconfirmed");
        setCheckMessage("Pročitana verzija još ne potvrđuje prethodni pokušaj. Zahtev može još trajati ili izmene nisu snimljene. Otvorena forma i izbor fotografija su sačuvani; čuvanje nije automatski ponovljeno.");
      }
    } catch (error) {
      if (isReadAbort(error, currentController.signal)) return;
      setOutcome("unconfirmed");
      setRetryAt(error?.retryAt || 0);
      setClock(Date.now());
      setCheckMessage(error?.status === 429
        ? "Provera sačuvane verzije je privremeno ograničena. Sačekajte prikazani rok; čuvanje nije ponovljeno."
        : "Sačuvana verzija trenutno nije dostupna za proveru. Ishod prethodnog pokušaja ostaje nepotvrđen; unosi su ostali u formi.");
    } finally {
      if (controller.current === currentController) {
        checkInFlight.current = false;
        if (!currentController.signal.aborted) setChecking(false);
      }
    }
  }

  if (slug !== GALLERY_UID) return null;
  const action = attempt.current?.action || "save";
  const actionLabel = actionLabels[action];
  const displayOutcome = outcome || (generalMessages.length ? "unconfirmed" : null);
  if (!displayOutcome) return null;
  const seconds = Math.max(0, Math.ceil((retryAt - clock) / 1000));
  const message = displayOutcome === "pending" ? `${actionLabel} je u toku. Sačekajte završetak zahteva.`
    : displayOutcome === "confirmed" ? `${actionLabel} iz prethodnog pokušaja je potvrđeno.`
      : displayOutcome === "rejected" ? `${actionLabel} je odbijeno. Ispravite prijavljeni problem i poštujte rok za novi pokušaj ako je zahtev ograničen.`
        : `Ishod prethodnog zahteva za ${action === "publish" ? "objavljivanje" : action === "unpublish" ? "povlačenje objave" : "čuvanje"} još nije potvrđen.`;
  return <div role={displayOutcome === "unconfirmed" || displayOutcome === "rejected" ? "alert" : "status"} aria-label="Status čuvanja galerije">
    <h2 style={{ marginTop: 12 }}>{message}</h2>
    {(displayOutcome === "unconfirmed" || displayOutcome === "rejected") && <p>Nesnimljeni unosi, izabrane fotografije i redosled ostali su u otvorenoj formi. Čuvanje, objavljivanje i upload se ne ponavljaju automatski.</p>}
    {displayOutcome !== "confirmed" && generalMessages.map((message, index) => <p key={index}>{message}</p>)}
    {displayOutcome === "unconfirmed" && (attempt.current?.id
      ? <button type="button" onClick={checkSavedVersion} disabled={checking || seconds > 0} aria-busy={checking} style={{ cursor: checking || seconds > 0 ? "default" : "pointer", opacity: checking || seconds > 0 ? 0.6 : 1 }}>{checking ? "Proveravam sačuvanu verziju…" : "Proveri sačuvanu verziju"}</button>
      : <p>{initialData?.id ? "Posle neuspešnog pokušaja nemojte osvežavati formu. Pri sledećem pokušaju ova pomoć prati sačuvanu verziju bez gubitka unosa." : "Pre ponovnog kreiranja proverite u listi galerija da li je novi zapis već nastao."}</p>)}
    {seconds > 0 && <p role="status">Novi pokušaj čitanja za {seconds} s.</p>}
    {checkMessage && <p role="status">{checkMessage}</p>}
  </div>;
}
