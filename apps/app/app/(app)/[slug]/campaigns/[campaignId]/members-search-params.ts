import { createLoader, parseAsBoolean } from "nuqs/server";
import { createListSearchParams } from "@/components/data-table/list-search-params";
import { assertUnreservedSearchParamKeys } from "@/lib/search-param-keys";

export const MEMBERS_PARAM = { uncalled: "uncalled" } as const;

export const MEMBERS_PAGE_SIZE = 50;

assertUnreservedSearchParamKeys(
	Object.values(MEMBERS_PARAM),
	"membersSearchParams",
);

export const membersSearchParams = createListSearchParams({
	pageSize: MEMBERS_PAGE_SIZE,
});

export const uncalledParsers = {
	[MEMBERS_PARAM.uncalled]: parseAsBoolean.withDefault(false),
};

export const loadUncalled = createLoader(uncalledParsers);

export type MemberInput = {
	id: string;
	page: number;
	pageSize: number;
	uncalledOnly: boolean;
	q: string;
};

export function memberInput(
	id: string,
	list: { q: string; page: number; pageSize: number },
	uncalledOnly: boolean,
): MemberInput {
	return {
		id,
		page: list.page,
		pageSize: list.pageSize,
		uncalledOnly,
		q: list.q,
	};
}
