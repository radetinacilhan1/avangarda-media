/** Separate only an unambiguous numeric prefix and a space-delimited unit. */
export function splitSignalValue(value: string) {
  const numeric = "[+\\-−±]?\\p{Nd}+(?:[.,٫٬'’\\u00a0\\u202f ]\\p{Nd}+)*(?:[%‰])?";
  const match = value.match(new RegExp(`^(${numeric})(?:(\\s+)([\\p{L}°€$£¥%‰].*))?$`, "u"));

  if (!match) return null;
  return { number: match[1], separator: match[2] || "", unit: match[3] || "" };
}

/** A whole numeric token fits its card without introducing digit breakpoints. */
export function signalNumberFit(value: string) {
  return `${150 / Math.max(1, Array.from(value).length)}cqi`;
}
