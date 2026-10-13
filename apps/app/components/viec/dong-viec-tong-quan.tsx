"use client";

import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import type { RouterOutputs } from "@/lib/trpc/types";
import { HanViec } from "./trang-thai-viec";

type ViecQuaHan = RouterOutputs["dashboard"]["summary"]["viecQuaHan"][number];

export const CELL = "px-3 py-2.5 align-middle";

export function DongViecTongQuan({ viec }: { viec: ViecQuaHan }) {
	return (
		<SimpleTableRow data-viec-chung={viec.id}>
			<TableCell className={CELL} />
			<TableCell className={CELL}>
				<span className="flex min-w-0 flex-col">
					<RecordLink className="text-foreground" id={viec.id} kind="viec">
						<span translate="no">{viec.tieuDe}</span>
					</RecordLink>
					{viec.banGhi ? (
						<RecordLink id={viec.banGhi.id} kind={viec.banGhi.loai}>
							<span translate="no">{viec.banGhi.ten}</span>
						</RecordLink>
					) : null}
				</span>
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<HanViec viec={{ hanNgay: viec.hanNgay, quaHan: true }} />
			</TableCell>
		</SimpleTableRow>
	);
}
