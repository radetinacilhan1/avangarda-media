type ArticleFactsProps = {
  focus?: string;
  date: string;
  dateTime?: string;
  style?: string;
  labels: { focus: string; date: string; style: string };
};

/** Container queries keep the same facts readable in a narrow hero and a wide article. */
export function ArticleFacts({ focus, date, dateTime, style, labels }: ArticleFactsProps) {
  return <div className="article-facts-container">
    <dl className="article-facts">
      {focus ? <div className="article-facts__focus"><dt>{labels.focus}</dt><dd>{focus}</dd></div> : null}
      <div><dt>{labels.date}</dt><dd><time dateTime={dateTime}>{date}</time></dd></div>
      {style ? <div><dt>{labels.style}</dt><dd><span className="article-facts__style">{style}</span></dd></div> : null}
    </dl>
  </div>;
}
