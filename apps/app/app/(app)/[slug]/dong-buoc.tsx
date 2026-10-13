"use client";

import { Checkbox } from "@crm/ui/components/checkbox";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { formatDay } from "@crm/ui/lib/format";
import { quaHanTheoNgayVN } from "@crm/validation/ngay-vn";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import type { RouterOutputs } from "@/lib/trpc/types";

export type BuocCuaToi =
	RouterOutputs["dashboard"]["summary"]["mySteps"][number];

const CELL = "px-3 py-2.5 align-middle";

export function ngayCuaBuoc(dueAt: string): Date {
	const [nam, thang, ngay] = dueAt.split("-").map(Number);
	return new Date(nam ?? 1970, (thang ?? 1) - 1, ngay ?? 1);
}

export function buocQuaHan(buoc: BuocCuaToi, now: Date): boolean {
	return quaHanTheoNgayVN(buoc.dueAt, now);
}

export function DongBuoc({
	buoc,
	now,
	dangGhi,
	onXong,
}: {
	buoc: BuocCuaToi;
	now: Date;
	dangGhi: boolean;
	onXong: () => void;
}) {
	const locale = useLocale();
	const k = keHoachNoiMessages(locale).tasks;
	const tre = buocQuaHan(buoc, now);

	return (
		<SimpleTableRow data-buoc={buoc.stepId}>
			<TableCell className={CELL}>
				<Checkbox
					checked={false}
					disabled={dangGhi}
					aria-label={dien(k.xongBuoc, { nhan: buoc.nhan })}
					onCheckedChange={onXong}
				/>
			</TableCell>
			<TableCell className={CELL}>
				<span className="flex min-w-0 flex-col">
					<span className="truncate" translate="no">
						{buoc.nhan}
					</span>
					<span className="flex min-w-0 gap-1 text-muted-foreground">
						<RecordLink kind="company" id={buoc.company.id}>
							<span translate="no">{buoc.company.name}</span>
						</RecordLink>
						<span aria-hidden>·</span>
						<RecordLink kind="plan" id={buoc.planId}>
							{k.keHoach}
						</RecordLink>
					</span>
				</span>
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<StatusIndicator
					tone={tre ? "error" : "neutral"}
					label={formatDay(buoc.dueAt, locale)}
				/>
			</TableCell>
		</SimpleTableRow>
	);
}
