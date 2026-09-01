import { cookies, headers } from "next/headers";
import { LANG_COOKIE, type Locale } from "./locale";
import { resolveLocale } from "./resolve";

export async function getLocale(): Promise<Locale> {
	const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
	return resolveLocale(
		cookieStore.get(LANG_COOKIE)?.value,
		headerList.get("accept-language") ?? undefined,
	);
}
