"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { useQueryState } from "nuqs";
import { PageShellDescription, PageShellTitle } from "@/components/page-shell";
import { tongQuanMessages } from "@/lib/messages/tong-quan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { overviewParsers } from "./overview-search-params";

export function OverviewGreetingFallback() {
	const m = tongQuanMessages(useLocale()).greeting;
	return (
		<>
			<PageShellTitle>{m.title}</PageShellTitle>
			<PageShellDescription>{m.me}</PageShellDescription>
		</>
	);
}

export function OverviewGreeting() {
	const m = tongQuanMessages(useLocale()).greeting;
	const [scope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	return (
		<>
			<PageShellTitle>{m.title}</PageShellTitle>
			<PageShellDescription>
				{scope === "me" ? m.me : m.everyone}
			</PageShellDescription>
		</>
	);
}
