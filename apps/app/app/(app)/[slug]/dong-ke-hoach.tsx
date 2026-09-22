"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { nhacMessages } from "@/lib/messages/nhac";
import type { RouterOutputs } from "@/lib/trpc/types";

export type KeHoachCanDeY =
	RouterOutputs["dashboard"]["summary"]["keHoachCanDeY"][number];

const CELL = "px-3 py-2.5 align-middle";

export function DongKeHoach({ dong }: { dong: KeHoachCanDeY }) {
	const m = nhacMessages(useLocale());
	const openRecord = useOpenRecord();
	const im = dong.loai === "ke-hoach-im";
	const phu =
		!im && dong.soBuocXong !== undefined && dong.soBuocTong !== undefined
			? dien(m.buocXong, { xong: dong.soBuocXong, tong: dong.soBuocTong })
			: null;

	return (
		<SimpleTableRow
			clickable
			data-can-de-y={dong.loai}
			onClick={() => openRecord({ kind: "plan", id: dong.planId })}
		>
			<TableCell className={CELL} />
			<TableCell className={CELL}>
				<span className="flex min-w-0 flex-col">
					<span className="flex min-w-0 gap-1">
						<span className="shrink-0">{im ? m.keHoachIm : m.mocNgay}</span>
						<span aria-hidden>·</span>
						<span className="truncate" translate="no">
							{dong.companyName}
						</span>
					</span>
					<span className="flex min-w-0 gap-1 text-muted-foreground">
						{phu === null ? (
							<span className="truncate" translate="no">
								{dong.goiY}
							</span>
						) : (
							<span className="truncate">{phu}</span>
						)}
						<span aria-hidden>·</span>
						<RecordLink kind="plan" id={dong.planId}>
							{m.keHoach}
						</RecordLink>
					</span>
				</span>
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<StatusIndicator
					tone={im ? "error" : "neutral"}
					label={
						im
							? dien(m.imNgay, { n: dong.soNgay })
							: dien(m.ngayThu, { n: dong.soNgay })
					}
				/>
			</TableCell>
		</SimpleTableRow>
	);
}
