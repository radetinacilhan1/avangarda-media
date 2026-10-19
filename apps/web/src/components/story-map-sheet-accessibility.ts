/** Keep a mobile map sheet modal without losing the underlying map position. */
export function activateStoryMapSheet(dialog: HTMLElement, close: HTMLElement, onClose: () => void) {
  const { body, documentElement } = document;
  const savedScroll = { x: window.scrollX, y: window.scrollY };
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const properties = ["position", "top", "left", "right", "width", "overflow", "overscrollBehavior", "paddingInlineEnd"] as const;
  const savedStyles = Object.fromEntries(properties.map((property) => [property, body.style[property]]));
  const savedHtmlOverflow = documentElement.style.overflow;
  const savedHtmlOverscroll = documentElement.style.overscrollBehavior;
  const scrollbar = Math.max(0, window.innerWidth - documentElement.clientWidth);
  const padding = parseFloat(getComputedStyle(body).paddingInlineEnd) || 0;

  // Fixed positioning also prevents the document moving behind the sheet on iOS.
  body.style.position = "fixed";
  body.style.top = `${-savedScroll.y}px`;
  body.style.left = `${-savedScroll.x}px`;
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "contain";
  if (scrollbar) body.style.paddingInlineEnd = `${padding + scrollbar}px`;
  documentElement.style.overflow = "hidden";
  documentElement.style.overscrollBehavior = "contain";
  close.focus({ preventScroll: true });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Tab") {
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]'
      )).filter((element) => element.getClientRects().length > 0 && !element.closest("[hidden]"));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    properties.forEach((property) => { body.style[property] = savedStyles[property]; });
    documentElement.style.overflow = savedHtmlOverflow;
    documentElement.style.overscrollBehavior = savedHtmlOverscroll;
    const savedScrollBehavior = documentElement.style.scrollBehavior;
    documentElement.style.scrollBehavior = "auto";
    window.scrollTo(savedScroll.x, savedScroll.y);
    documentElement.style.scrollBehavior = savedScrollBehavior;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  };
}
