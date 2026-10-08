"use client";

import type { DataTableFacet } from "@crm/ui/components/data-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { FieldEntity } from "./fields-entity";

/**
 * SELECT and USER admin fields become filter facets automatically — no
 * per-field opt-in, mirroring `fields.filterableFieldsFor` on the API.
 */
export function useFieldFacets(entity: FieldEntity): DataTableFacet[] {
	const trpc = useTRPC();
	const fields = useQuery(trpc.fields.filters.queryOptions({ entity }));
	const users = useQuery(trpc.users.list.queryOptions());

	return useMemo(() => {
		if (!fields.data) return [];

		return fields.data.map((field) => {
			const options =
				field.type === "USER"
					? (users.data ?? []).map((user) => ({
							value: user.id,
							label: user.name,
						}))
					: field.options.map((option) => ({
							value: option.id,
							label: option.label,
						}));

			return {
				id: `field:${field.key}`,
				label: field.label,
				options,
			};
		});
	}, [fields.data, users.data]);
}
