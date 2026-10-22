"use client";

import { sapBoTri } from "@crm/db/fields-chuan";
import {
	type BoTriTruong,
	parseBoTriTruong,
} from "@crm/validation/bo-tri-truong";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { FieldEntity } from "./fields-entity";

export type TuTaoMacDinh = { id: string; key: string };

export function boTriMacDinh(
	entity: FieldEntity,
	tuTao: readonly TuTaoMacDinh[],
): BoTriTruong {
	return sapBoTri(
		entity,
		[],
		tuTao.map((field, position) => ({ ...field, position })),
	);
}

export function useBoTriTruong(
	entity: FieldEntity,
	tuTao: readonly TuTaoMacDinh[] = [],
) {
	const trpc = useTRPC();
	const query = useQuery({
		...trpc.fields.layout.queryOptions({ entity }),
		select: parseBoTriTruong,
	});
	const macDinh = useMemo(() => boTriMacDinh(entity, tuTao), [entity, tuTao]);

	return {
		muc: query.data ?? macDinh,
		daTai: query.isSuccess,
		query,
	};
}
