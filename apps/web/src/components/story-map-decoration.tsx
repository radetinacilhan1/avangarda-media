/** Decorative, fictional contours; no geographic or activity data. */
export function StoryMapDecoration({ side }: { side: "left" | "right" }) {
  return (
    <svg className={`story-map-decoration story-map-decoration--${side}`} viewBox="0 0 240 200" aria-hidden="true" focusable="false">
      <g className="story-map-decoration__contours" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M-20 32C28 4 58 56 103 32S173 3 239 43M-19 49C30 20 55 74 110 49S179 23 254 63M-12 67C29 39 60 92 116 69S194 48 251 84" />
        <path d="M-14 140C40 173 66 111 123 137S190 185 256 149M-12 156C39 190 71 128 124 155S196 203 254 168M-16 122C35 152 59 96 119 117S193 162 250 130" />
      </g>
      <path className="story-map-decoration__route" d="M24 104L72 76L125 108L177 70L214 94" pathLength="1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <g fill="currentColor"><circle cx="24" cy="104" r="3"/><circle cx="72" cy="76" r="3"/><circle cx="125" cy="108" r="3"/><circle cx="177" cy="70" r="3"/><circle cx="214" cy="94" r="3"/></g>
    </svg>
  );
}
