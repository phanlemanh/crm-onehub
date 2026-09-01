"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale } from "../lib/locale";
import { type Messages, messages } from "../lib/messages";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
	locale,
	children,
}: {
	locale: Locale;
	children: React.ReactNode;
}) {
	return (
		<LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
	);
}

export function useLocale(): Locale {
	return useContext(LocaleContext);
}

export function useMessages(): Messages {
	const locale = useLocale();
	return useMemo(() => messages(locale), [locale]);
}
