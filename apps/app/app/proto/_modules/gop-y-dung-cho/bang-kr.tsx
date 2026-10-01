"use client";

import { Progress } from "@crm/ui/components/progress";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import type { ReactNode } from "react";
import type { KrMau } from "./du-lieu";

const CELL = "px-3 py-2.5 align-middle";

const COT: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{ id: "phuTrach", header: "Phụ trách", width: "w-40" },
	{ id: "tienDo", header: "Tiến độ", width: "w-48" },
	{ id: "dich", header: "Đích", width: "w-40", align: "right" },
];

export function BangKrMau({
	keyResults,
	lePhanTram,
	tenSau,
	duoiDong,
}: {
	keyResults: KrMau[];
	lePhanTram: number;
	tenSau?: ReadonlyMap<string, string>;
	duoiDong?: (kr: KrMau) => ReactNode;
}) {
	return (
		<SimpleTable columns={COT}>
			{keyResults.map((kr) => {
				const duoi = duoiDong?.(kr);
				return [
					<SimpleTableRow key={kr.id} data-kr={kr.id}>
						<TableCell className={CELL}>
							<span className="flex min-w-0 flex-col gap-1">
								<span className="whitespace-normal" translate="no">
									{tenSau?.get(kr.id) ?? kr.ten}
								</span>
								<span className="text-muted-foreground text-xs">{kr.kieu}</span>
							</span>
						</TableCell>
						<TableCell className={CELL}>
							<span translate="no">{kr.phuTrach}</span>
						</TableCell>
						<TableCell className={CELL}>
							<span className="flex items-center gap-2">
								<Progress
									value={kr.tienDo}
									expected={lePhanTram}
									label={`Tiến độ ${kr.ten}`}
								/>
								<span className="text-xs tabular-nums">{kr.tienDo}%</span>
							</span>
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{kr.so}
						</TableCell>
					</SimpleTableRow>,
					duoi ? (
						<SimpleTableRow key={`${kr.id}-gop-y`} data-gop-y-cua={kr.id}>
							<TableCell colSpan={COT.length} className="px-3 pt-0 pb-3">
								{duoi}
							</TableCell>
						</SimpleTableRow>
					) : null,
				];
			})}
		</SimpleTable>
	);
}
