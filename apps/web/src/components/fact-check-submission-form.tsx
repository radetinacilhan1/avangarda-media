"use client";

import { useState } from "react";

import { getFactCheckCopy } from "@/lib/fact-check-copy";
import { FACT_SCREENSHOT_MAX_BYTES } from "@/lib/fact-check-submission";
import type { Lang } from "@/lib/i18n";
import styles from "./fact-check.module.css";

function fileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result.split(",", 2)[1] || "") : reject(new Error("INVALID_ATTACHMENT"));
    reader.onerror = () => reject(new Error("INVALID_ATTACHMENT"));
    reader.readAsDataURL(file);
  });
}

export function FactCheckSubmissionForm({ lang }: { lang: Lang }) {
  const copy = getFactCheckCopy(lang);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  return <form className={styles.form} onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setStatus("sending"); setMessage("");
    try {
      const file = values.get("screenshot");
      const screenshot = file instanceof File && file.size > 0 ? file : null;
      if (screenshot && (screenshot.size > FACT_SCREENSHOT_MAX_BYTES || !["image/png", "image/jpeg", "image/webp"].includes(screenshot.type))) throw new Error("INVALID_ATTACHMENT");
      const response = await fetch("/api/fact-check-submissions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang, claim: values.get("claim"), sourceUrl: values.get("sourceUrl"), contact: values.get("contact"), website: values.get("website"),
          ...(screenshot ? { screenshot: { name: screenshot.name, mimeType: screenshot.type, base64: await fileAsBase64(screenshot) } } : {}),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.data?.received !== true) throw new Error(payload?.error || "SUBMISSION_FAILED");
      form.reset(); setStatus("success"); setMessage(copy.success);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setStatus("error");
      setMessage(code === "INVALID_ATTACHMENT" ? copy.fileError : code === "INVALID_SUBMISSION" ? copy.invalid : code === "RATE_LIMITED" ? copy.rateLimited : copy.failed);
    }
  }}>
    <label className={styles.field}>{copy.claim}<textarea name="claim" required minLength={12} maxLength={6000} rows={5} disabled={status === "sending"} /></label>
    <label className={styles.field}>{copy.source} <small>({copy.optional})</small><input name="sourceUrl" type="url" maxLength={2000} dir="ltr" disabled={status === "sending"} /></label>
    <label className={styles.field}>{copy.screenshot} <small>({copy.optional})</small><input name="screenshot" type="file" accept="image/png,image/jpeg,image/webp" disabled={status === "sending"} /></label>
    <label className={styles.field}>{copy.contact} <small>({copy.optional})</small><input name="contact" maxLength={240} autoComplete="email" disabled={status === "sending"} /></label>
    <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <p className={styles.muted}>{copy.privacy}</p>
    <button type="submit" className={styles.primary} disabled={status === "sending"}>{status === "sending" ? copy.sending : copy.send}</button>
    <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={status === "error" ? styles.error : styles.feedback}>{message}</p>
  </form>;
}
