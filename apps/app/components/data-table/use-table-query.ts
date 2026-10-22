"use client";

import { TIEN_TO_COT_TRUONG } from "@crm/db/fields-shape";
import type { SortDirection, TableQueryState } from "@crm/ui/lib/table-query";
import type { SavedViewFilters } from "@crm/validation/saved-view";
import type { Nullable, Values } from "nuqs";
import { parseAsNativeArrayOf, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import {
	type FieldFilters,
	type ListInput,
	type ListSearchParams,
	type ListSearchValues,
	locGiaTriHopLe,
	type TruongLoc,
} from "./list-search-params";

export type TableQuery<TTab extends string, TFacet extends string = never> = {
	query: TableQueryState;
	input: ListInput<TTab, TFacet>;
	setArchived: (value: boolean) => void;
	currentView: SavedViewFilters;
	applyView: (view: SavedViewFilters) => void;
};

const FIELD_FILTER_PREFIX = TIEN_TO_COT_TRUONG;

const mangChu = () => parseAsNativeArrayOf(parseAsString).withDefault([]);

const fieldFiltersValueSchema = z.record(z.string(), z.array(z.string()));

const queryValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.string()),
	fieldFiltersValueSchema,
	z.null(),
]);

type QueryValue = z.infer<typeof queryValueSchema>;

const rawValuesSchema = z
	.object({
		q: z.string().default(""),
		sort: z.string().default(""),
		dir: z.string().default("asc"),
		page: z.number().default(1),
		fields: fieldFiltersValueSchema.default({}),
		archived: z.boolean().default(false),
	})
	.catchall(queryValueSchema);

type RawUpdate = Record<string, QueryValue | undefined>;

const stringSchema = z.string();
const stringArraySchema = z.array(z.string());

function asString(value: QueryValue, fallback = ""): string {
	const result = stringSchema.safeParse(value);
	return result.success ? result.data : fallback;
}

function asStringArray(value: QueryValue): string[] {
	const result = stringArraySchema.safeParse(value);
	return result.success ? result.data : [];
}

export function useTableQuery<TTab extends string, TFacet extends string>(
	searchParams: ListSearchParams<TTab, TFacet>,
	{ truongLoc = [] }: { truongLoc?: TruongLoc[] } = {},
): TableQuery<TTab, TFacet> {
	const { parsers: parsersTinh, config, toInput } = searchParams;
	const { defaultDir, pageSize, tabId, facetIds } = config;

	const khoaTruong = truongLoc.map((t) => t.key).join(",");
	const parsers = useMemo(() => {
		const them: Record<string, ReturnType<typeof mangChu>> = {};
		for (const key of khoaTruong ? khoaTruong.split(",") : []) {
			them[`${FIELD_FILTER_PREFIX}${key}`] = mangChu();
		}
		return { ...parsersTinh, ...them } as typeof parsersTinh;
	}, [parsersTinh, khoaTruong]);

	const [rawState, rawSetState] = useQueryStates(parsers);
	const values = rawValuesSchema.parse(rawState);

	type NuqsValues = Partial<Nullable<Values<typeof parsers>>>;

	function setValues(
		update: Partial<RawUpdate>,
		history?: "push" | "replace",
	): Promise<void> {
		return rawSetState(
			update as NuqsValues,
			history ? { history } : undefined,
		).then(() => undefined);
	}

	const q = values.q;
	const sort = values.sort;
	const dir = values.dir === "desc" ? "desc" : "asc";
	const rawPage = values.page;
	const page = rawPage > 0 ? rawPage : 1;
	const cu = values.fields;
	const moi: FieldFilters = {};
	for (const { key } of truongLoc) {
		const gia = asStringArray(values[`${FIELD_FILTER_PREFIX}${key}`] ?? null);
		if (gia.length > 0) moi[key] = gia;
	}
	const fields = locGiaTriHopLe({ ...cu, ...moi }, truongLoc);
	const archived = values.archived;
	const cuChu = JSON.stringify(cu);

	useEffect(() => {
		const doc: FieldFilters = JSON.parse(cuChu);
		if (Object.keys(doc).length === 0 || !khoaTruong) return;
		const update: RawUpdate = { fields: null };
		for (const key of khoaTruong.split(",")) {
			if (doc[key]?.length) update[`${FIELD_FILTER_PREFIX}${key}`] = doc[key];
		}
		void rawSetState(update as NuqsValues, { history: "replace" });
	}, [cuChu, khoaTruong, rawSetState]);
	const tab = tabId ? asString(values[tabId]) : "all";

	const filters: Record<string, string[]> = {};
	if (tabId) filters[tabId] = [tab];
	for (const id of facetIds ?? []) {
		filters[id] = asStringArray(values[id]);
	}
	for (const [key, selected] of Object.entries(fields)) {
		filters[`${FIELD_FILTER_PREFIX}${key}`] = selected;
	}

	const query: TableQueryState = {
		sort,
		dir,
		page,
		pageSize,
		tab,
		tabId,
		filters,
		toggleSort: (id) =>
			rawSetState((old) => {
				const current = rawValuesSchema.parse(old);
				const nextDir: SortDirection = current.dir === "asc" ? "desc" : "asc";
				const update: RawUpdate =
					current.sort === id
						? { dir: nextDir, page: 1 }
						: { sort: id, dir: defaultDir, page: 1 };
				return update as NuqsValues;
			}),
		setSort: (id) => setValues({ sort: id, page: 1 }),
		setDir: (nextDir) => setValues({ dir: nextDir, page: 1 }),
		setPage: (next) => setValues({ page: next }),
		setTab: (value) => {
			if (!tabId) return;
			setValues({ [tabId]: value, page: 1 });
		},
		setFilter: (id, selected) => {
			if (id.startsWith(FIELD_FILTER_PREFIX)) {
				setValues({
					[id]: selected.length === 0 ? null : selected,
					fields: null,
					page: 1,
				});
				return;
			}

			setValues({ [id]: selected, page: 1 });
		},
	};

	const input = toInput({
		q,
		sort,
		dir,
		page: rawPage,
		fields,
		archived,
		...Object.fromEntries(
			[...(tabId ? [tabId] : []), ...(facetIds ?? [])].map((id) => [
				id,
				id === tabId ? tab : (filters[id] ?? []),
			]),
		),
	} as ListSearchValues<TTab, TFacet>);

	const setArchived = (value: boolean) =>
		setValues({ archived: value, page: 1 });

	const currentView: SavedViewFilters = { q, sort, dir, archived, filters };

	const applyView = (view: SavedViewFilters) => {
		const update: RawUpdate = {
			q: view.q,
			sort: view.sort,
			dir: view.dir,
			archived: view.archived,
			page: 1,
		};

		for (const id of facetIds ?? []) update[id] = [];
		for (const { key } of truongLoc) {
			update[`${FIELD_FILTER_PREFIX}${key}`] = null;
		}

		const ngoai: FieldFilters = {};
		for (const [key, selected] of Object.entries(view.filters)) {
			if (key.startsWith(FIELD_FILTER_PREFIX)) {
				const khoa = key.slice(FIELD_FILTER_PREFIX.length);
				if (truongLoc.some((t) => t.key === khoa)) update[key] = selected;
				else ngoai[khoa] = selected;
			} else if (key === tabId) {
				update[key] = selected[0] ?? "all";
			} else {
				update[key] = selected;
			}
		}
		update.fields = Object.keys(ngoai).length > 0 ? ngoai : null;

		setValues(update);
	};

	return { query, input, setArchived, currentView, applyView };
}
