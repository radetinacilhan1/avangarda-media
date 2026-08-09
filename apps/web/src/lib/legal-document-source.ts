import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import type { LegalResourceItem } from "@/lib/human-rights";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 5;
export const MAX_LEGAL_DOCUMENT_BYTES = 15 * 1024 * 1024;
const PDF_PROBE_BYTES = 1_024;

type PdfSourceKind = "pdfFile" | "downloadableFile" | "officialSourceUrl";

export type LegalDocumentSource =
  | {
      kind: "pdf";
      source: PdfSourceKind;
      url: string;
      contentType: string;
      status: number;
    }
  | {
      kind: "official-page";
      source: "officialSourceUrl";
      url: string;
      contentType: string;
      status: number;
    }
  | {
      kind: "unavailable";
      source: null;
      url: "";
      contentType: "";
      status: 0;
    };

type SafeFetchResult = {
  response: Response;
  finalUrl: URL;
};

function parseIpv4(value: string) {
  const parts = value.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  return parts;
}

function isPrivateOrReservedIpv4(value: string) {
  const parts = parseIpv4(value);
  if (!parts) return true;
  const [a, b, c] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateOrReservedIp(value: string) {
  const normalized = value.toLowerCase().split("%")[0];
  const version = isIP(normalized);

  if (version === 4) return isPrivateOrReservedIpv4(normalized);
  if (version !== 6) return true;

  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mappedIpv4) return isPrivateOrReservedIpv4(mappedIpv4);

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  );
}

async function assertSafePublicHttpsUrl(url: URL) {
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("UNSAFE_DOCUMENT_URL");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("UNSAFE_DOCUMENT_HOST");
  }

  const literalVersion = isIP(hostname);
  if (literalVersion) {
    if (isPrivateOrReservedIp(hostname)) throw new Error("UNSAFE_DOCUMENT_IP");
    return;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateOrReservedIp(address))) {
    throw new Error("UNSAFE_DOCUMENT_DNS");
  }
}

async function safeFetch(input: string, init: RequestInit = {}): Promise<SafeFetchResult> {
  let currentUrl = new URL(input);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafePublicHttpsUrl(currentUrl);

    const response = await fetch(currentUrl, {
      ...init,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirectCount === MAX_REDIRECTS) throw new Error("INVALID_DOCUMENT_REDIRECT");
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    return { response, finalUrl: currentUrl };
  }

  throw new Error("TOO_MANY_DOCUMENT_REDIRECTS");
}

function hasPdfSignature(bytes: Uint8Array) {
  const prefix = new TextDecoder("latin1").decode(bytes.slice(0, PDF_PROBE_BYTES));
  return prefix.includes("%PDF-");
}

async function readResponseBytes(response: Response, limit: number, allowTruncation: boolean) {
  if (!response.body) throw new Error("EMPTY_DOCUMENT_RESPONSE");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.length) continue;

      const remaining = limit - total;
      if (value.length > remaining) {
        if (!allowTruncation) throw new Error("DOCUMENT_TOO_LARGE");
        if (remaining > 0) chunks.push(value.slice(0, remaining));
        total = limit;
        await reader.cancel();
        break;
      }

      chunks.push(value);
      total += value.length;
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

async function probeDocumentUrl(url: string) {
  const { response, finalUrl } = await safeFetch(url, {
    headers: {
      Accept: "application/pdf,text/html;q=0.8,*/*;q=0.5",
      Range: `bytes=0-${PDF_PROBE_BYTES - 1}`,
    },
  });

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const contentLength = Number(response.headers.get("content-length") || "0");
  if (!response.ok || (contentLength && contentLength > MAX_LEGAL_DOCUMENT_BYTES)) {
    await response.body?.cancel();
    throw new Error("DOCUMENT_UNAVAILABLE");
  }

  const bytes = await readResponseBytes(response, PDF_PROBE_BYTES, true);
  const pdfByType = /(?:^|;)\s*application\/pdf(?:;|$)/i.test(contentType);
  const pdfBySignature = hasPdfSignature(bytes);

  return {
    contentType,
    finalUrl: finalUrl.href,
    isPdf: pdfByType || pdfBySignature,
    status: response.status,
  };
}

export async function resolveLegalDocumentSource(
  item: Pick<LegalResourceItem, "pdfUrl" | "downloadableUrl" | "officialSourceUrl">
): Promise<LegalDocumentSource> {
  const linkedCandidates: Array<{ source: "pdfFile" | "downloadableFile"; url: string }> = [
    { source: "pdfFile", url: item.pdfUrl },
    { source: "downloadableFile", url: item.downloadableUrl },
  ];

  for (const candidate of linkedCandidates) {
    if (!candidate.url) continue;
    try {
      const probe = await probeDocumentUrl(candidate.url);
      if (probe.isPdf) {
        return { kind: "pdf", source: candidate.source, url: probe.finalUrl, contentType: probe.contentType, status: probe.status };
      }
    } catch {
      // Continue with the next source connected to this same CMS record.
    }
  }

  if (item.officialSourceUrl) {
    try {
      const probe = await probeDocumentUrl(item.officialSourceUrl);
      if (probe.isPdf) {
        return { kind: "pdf", source: "officialSourceUrl", url: probe.finalUrl, contentType: probe.contentType, status: probe.status };
      }
      return {
        kind: "official-page",
        source: "officialSourceUrl",
        url: probe.finalUrl,
        contentType: probe.contentType,
        status: probe.status,
      };
    } catch {
      // The public page is shown only after it passes the same URL and availability checks.
    }
  }

  return { kind: "unavailable", source: null, url: "", contentType: "", status: 0 };
}

export async function fetchLegalPdf(url: string) {
  const { response, finalUrl } = await safeFetch(url, {
    headers: { Accept: "application/pdf,*/*;q=0.5" },
  });

  const contentLength = Number(response.headers.get("content-length") || "0");
  if (!response.ok || (contentLength && contentLength > MAX_LEGAL_DOCUMENT_BYTES)) {
    await response.body?.cancel();
    throw new Error("DOCUMENT_UNAVAILABLE");
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const bytes = await readResponseBytes(response, MAX_LEGAL_DOCUMENT_BYTES, false);
  if (!hasPdfSignature(bytes)) throw new Error("INVALID_PDF_SIGNATURE");

  return {
    bytes,
    contentType: /application\/pdf/i.test(contentType) ? contentType : "application/pdf",
    finalUrl: finalUrl.href,
  };
}

export function sanitizeLegalPdfFilename(value: string) {
  const ascii = value
    .replace(/\.pdf$/i, "")
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return `${ascii || "pravni-resurs"}.pdf`;
}
