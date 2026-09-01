import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./locale";

type Ranked = { base: string; q: number };

function rank(acceptLanguage: string): Ranked[] {
	return acceptLanguage
		.split(",")
		.map((part) => {
			const [tag, ...params] = part.trim().split(";");
			const quality = params
				.map((param) => param.trim())
				.find((param) => param.startsWith("q="))
				?.slice(2);
			const q = quality === undefined ? 1 : Number(quality);
			return { base: (tag ?? "").split("-")[0]?.toLowerCase() ?? "", q };
		})
		.filter((entry) => entry.base !== "" && !Number.isNaN(entry.q))
		.sort((a, b) => b.q - a.q);
}

export function resolveLocale(
	cookieValue: string | undefined,
	acceptLanguage: string | undefined,
): Locale {
	if (isLocale(cookieValue)) return cookieValue;
	if (cookieValue !== undefined) return DEFAULT_LOCALE;
	if (!acceptLanguage) return DEFAULT_LOCALE;

	for (const entry of rank(acceptLanguage)) {
		const hit = LOCALES.find((locale) => locale === entry.base);
		if (hit) return hit;
	}
	return DEFAULT_LOCALE;
}
