"use client";

import { useEffect, useRef, useState } from "react";

import {
  SUPPORT_ACCOUNT,
  SUPPORT_BANK,
  SUPPORT_PURPOSE,
  SUPPORT_RECIPIENT,
  type SupportPageCopy,
} from "@/lib/support";

type CopyTarget = "account" | "purpose";

type SupportPaymentCardProps = {
  copy: SupportPageCopy;
};

function legacyCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  textarea.remove();
  return succeeded;
}

export function SupportPaymentCard({ copy }: SupportPaymentCardProps) {
  const [copied, setCopied] = useState<CopyTarget | "error" | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function copyValue(value: string, target: CopyTarget) {
    let succeeded = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        succeeded = true;
      } else {
        succeeded = legacyCopy(value);
      }
    } catch {
      succeeded = legacyCopy(value);
    }

    setCopied(succeeded ? target : "error");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(null), 2400);
  }

  const status = copied === "account"
    ? copy.accountCopied
    : copied === "purpose"
      ? copy.purposeCopied
      : copied === "error"
        ? copy.copyFailed
        : "";

  return (
    <section className="panel support-payment" aria-labelledby="support-payment-title">
      <div className="support-payment__heading">
        <span className="eyebrow">Avangarda</span>
        <h2 id="support-payment-title">{copy.paymentTitle}</h2>
      </div>

      <dl className="support-payment__details">
        <div className="support-payment__row">
          <dt>{copy.recipientLabel}</dt>
          <dd><bdi dir="ltr">{SUPPORT_RECIPIENT}</bdi></dd>
        </div>
        <div className="support-payment__row">
          <dt>{copy.bankLabel}</dt>
          <dd><bdi dir="ltr">{SUPPORT_BANK}</bdi></dd>
        </div>
        <div className="support-payment__row support-payment__row--action">
          <dt>{copy.accountLabel}</dt>
          <dd>
            <span className="support-payment__account" dir="ltr">{SUPPORT_ACCOUNT}</span>
            <button
              className="support-payment__copy"
              type="button"
              onClick={() => copyValue(SUPPORT_ACCOUNT, "account")}
              aria-label={`${copy.copyAccount}: ${SUPPORT_ACCOUNT}`}
            >
              {copied === "account" ? copy.accountCopied : copy.copyAccount}
            </button>
          </dd>
        </div>
        <div className="support-payment__row support-payment__row--action">
          <dt>{copy.purposeLabel}</dt>
          <dd>
            <bdi dir="ltr">{SUPPORT_PURPOSE}</bdi>
            <button
              className="support-payment__copy"
              type="button"
              onClick={() => copyValue(SUPPORT_PURPOSE, "purpose")}
              aria-label={`${copy.copyPurpose}: ${SUPPORT_PURPOSE}`}
            >
              {copied === "purpose" ? copy.purposeCopied : copy.copyPurpose}
            </button>
          </dd>
        </div>
        <div className="support-payment__row">
          <dt>{copy.paymentCodeLabel}</dt>
          <dd className="support-payment__codes">
            <span><strong dir="ltr">289</strong> {copy.electronicCode}</span>
            <span><strong dir="ltr">189</strong> {copy.cashCode}</span>
          </dd>
        </div>
        <div className="support-payment__row">
          <dt>{copy.modelLabel}</dt>
          <dd>{copy.modelValue}</dd>
        </div>
        <div className="support-payment__row">
          <dt>{copy.amountLabel}</dt>
          <dd>{copy.amountValue}</dd>
        </div>
      </dl>

      <p className="support-payment__status" role="status" aria-live="polite">{status}</p>

      <div className="support-payment__explanation">
        <h3>{copy.explanationTitle}</h3>
        <p>{copy.explanation}</p>
      </div>
    </section>
  );
}
