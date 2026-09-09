/** Shared navigation chevrons, matching the existing hero controls. */
export function ChevronIcon({ direction }: { direction: "left" | "right" | "up" | "down" }) {
  const paths = {
    left: "M14.5 6.5L8.5 12L14.5 17.5",
    right: "M9.5 6.5L15.5 12L9.5 17.5",
    up: "M6.5 14.5L12 8.5L17.5 14.5",
    down: "M6.5 9.5L12 15.5L17.5 9.5",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={paths[direction]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
