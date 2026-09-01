export type Locale = "vi" | "en";

export const LOCALES: readonly Locale[] = ["vi", "en"];
export const DEFAULT_LOCALE: Locale = "en";
export const LANG_COOKIE = "lang";
export const COOKIE_MAX_AGE = 31536000;
export const COOKIE_PATH = "/";
export const COOKIE_SAME_SITE = "Lax";

export function isLocale(value: string | undefined): value is Locale {
	return value !== undefined && LOCALES.includes(value as Locale);
}
