export const THEME_STORAGE_KEY = "avangarda-theme";
export const THEME_CHANGE_EVENT = "avangarda-theme-change";

export type ResolvedTheme = "dark" | "light" | "bordeaux";
export type ThemePreference = "system" | ResolvedTheme;

export const themeCycle: ResolvedTheme[] = ["dark", "light", "bordeaux"];
export const themePreferences: ThemePreference[] = ["system", ...themeCycle];

export function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === "dark" || value === "light" || value === "bordeaux";
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || isResolvedTheme(value);
}
