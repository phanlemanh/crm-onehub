"use client";

import type { DataTableColumn } from "@crm/ui/components/data-table";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { FieldEntity } from "./fields-entity";
import { OTruongBang } from "./kieu-truong";

function nhanTrongO(
	giaTri: string | number | boolean | null,
): { value: string; label: string }[] {
	if (giaTri === null || giaTri === "") return [];
	const nhan = String(giaTri);
	return [{ value: nhan, label: nhan }];
}

type WithFields = { fields: Record<string, string | number | boolean | null> };

export function useFieldColumns<Row extends WithFields>(
	entity: FieldEntity,
): DataTableColumn<Row>[] {
	const trpc = useTRPC();
	const query = useQuery(
		trpc.fields.list.queryOptions({ entity, includeArchived: false }),
	);
	const users = useQuery(trpc.users.list.queryOptions());

	const fields = query.data;
	const members = users.data;

	return useMemo(() => {
		if (!fields) return [];

		return fields
			.filter((field) => field.showOnTable)
			.map((field) => ({
				id: `field:${field.key}`,
				header: field.label,
				width: "w-[12%]",
				hideBelow: "lg" as const,
				cell: (row: Row) => (
					<OTruongBang
						kieu={field.type}
						giaTri={row.fields[field.key] ?? null}
						luaChon={nhanTrongO(row.fields[field.key] ?? null)}
						nguoiDung={members}
					/>
				),
			}));
	}, [fields, members]);
}
