/** Separate only an unambiguous numeric prefix and a space-delimited unit. */
export function splitSignalValue(value: string) {
  const numeric = "[+\\-−±]?\\p{Nd}+(?:[.,٫٬'’\\u00a0\\u202f ]\\p{Nd}+)*(?:[%‰])?";
  const match = value.match(new RegExp(`^(${numeric})(?:(\\s+)([\\p{L}°€$£¥%‰].*))?$`, "u"));

  if (!match) return null;
  return { number: match[1], separator: match[2] || "", unit: match[3] || "" };
}

/** Unit symbols stay with the value; translated unit words retain their own line. */
export function isCompactSignalUnit(unit: string) {
  return /^(?:[%‰°€$£¥]|°[CFK]|[fpnumkMGT]?(?:g|m[²³23]?|s|W(?:h)?|Hz|L)|K|mol|ppm|ppb)$/u.test(unit);
}

/** A whole numeric token fits its card without introducing digit breakpoints. */
export function signalNumberFit(value: string) {
  return `${150 / Math.max(1, Array.from(value).length)}cqi`;
}
