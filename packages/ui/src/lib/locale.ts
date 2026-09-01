export const LOCALES = ["vi", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "en" satisfies Locale;

export function isLocale(value: string | undefined): value is Locale {
	return value !== undefined && (LOCALES as readonly string[]).includes(value);
}
