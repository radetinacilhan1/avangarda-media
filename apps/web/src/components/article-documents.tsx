import { articleDocumentHref, articleDocumentLabels, getArticleDocuments } from "@/lib/article-documents";
import type { Lang } from "@/lib/i18n";
import "./article-documents.css";

export function ArticleDocuments({ value, slug, lang }: { value: unknown; slug: string; lang: Lang }) {
  const documents = getArticleDocuments(value);
  if (!documents.length) return null;
  const [heading, open] = articleDocumentLabels[lang];
  return <section className="article-documents" aria-labelledby="article-documents-title">
    <h2 id="article-documents-title">{heading}</h2>
    <div className="article-documents__grid">{documents.map((document) =>
      <article className="panel article-documents__card" key={document.id}>
        <span className="article-documents__format">PDF{document.sizeLabel ? ` · ${document.sizeLabel}` : ""}</span>
        <h3>{document.title}</h3>
        {document.description ? <p>{document.description}</p> : null}
        <a className="button-secondary" href={articleDocumentHref(slug, document.id)} target="_blank" rel="noopener noreferrer" aria-label={`${document.linkLabel || open} — ${document.title}`}>
          {document.linkLabel || open}
        </a>
      </article>
    )}</div>
  </section>;
}
