import { createLoader, parseAsStringLiteral } from "nuqs/server";
import {
	createListSearchParams,
	type ListInput,
} from "@/components/data-table/list-search-params";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const dealsSearchParams = createListSearchParams({
	defaultSort: "createdAt",
	defaultDir: "desc",
	tabId: "status",
	facetIds: ["owner", "stage", "closing"] as const,
});

export const DEALS_VIEWS = ["table", "board"] as const;

export type DealsView = (typeof DEALS_VIEWS)[number];

export const dealsViewParsers = {
	[SEARCH_PARAM.deals.view]:
		parseAsStringLiteral(DEALS_VIEWS).withDefault("table"),
};

export const loadDealsView = createLoader(dealsViewParsers);

export type DealBoardQueryInput = {
	q: string;
	sort: string;
	dir: "asc" | "desc";
	owner: string[];
	closing: string[];
	fields: Record<string, string[]>;
};

export function dealBoardInputFrom(
	list: ListInput<"status", "owner" | "stage" | "closing">,
): DealBoardQueryInput {
	return {
		q: list.q,
		sort: list.sort,
		dir: list.dir,
		owner: list.owner,
		closing: list.closing,
		fields: list.fields,
	};
}

export function showsBoard(view: DealsView, archived: boolean): boolean {
	return view === "board" && !archived;
}
