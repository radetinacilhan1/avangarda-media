import { getStrapiMediaUrl, unwrapStrapiCollection, unwrapStrapiSingle } from "@/lib/strapi";
import type { Lang } from "@/lib/i18n";

export const articleDocumentLabels: Record<Lang, [string, string]> = {
  sr: ["Dokumenti uz tekst", "Otvori PDF"], en: ["Documents accompanying this article", "Open PDF"],
  tr: ["Yazıya ek belgeler", "PDF aç"], fr: ["Documents joints à l’article", "Ouvrir le PDF"],
  de: ["Dokumente zum Artikel", "PDF öffnen"], es: ["Documentos del artículo", "Abrir PDF"],
  el: ["Έγγραφα του άρθρου", "Άνοιγμα PDF"], ar: ["مستندات مرفقة بالمقال", "فتح PDF"],
};

type Media = { url?: string; mime?: string; size?: number; ext?: string };
type Document = { id?: number; title?: string; description?: string; linkLabel?: string; pdfFile?: unknown };

export function getArticleDocuments(value: unknown) {
  return unwrapStrapiCollection<Document>(value).flatMap((document) => {
    const file = unwrapStrapiSingle<Media>(document.pdfFile);
    if (!document.id || !document.title?.trim() || !file?.url || file.mime !== "application/pdf"
      || (file.size != null && (file.size <= 0 || file.size > 15 * 1024))) return [];
    return [{ id: document.id, title: document.title.trim(), description: document.description?.trim(),
      linkLabel: document.linkLabel?.trim(), url: getStrapiMediaUrl(file.url),
      sizeLabel: file.size ? (file.size >= 1024 ? `${(file.size / 1024).toFixed(1)} MB` : `${Math.ceil(file.size)} KB`) : "" }];
  });
}

export function articleDocumentHref(slug: string, id: number) {
  return `/api/article-document?slug=${encodeURIComponent(slug)}&document=${id}`;
}
