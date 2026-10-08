"use client";

import Add from "@carbon/icons-react/es/Add";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { TableCell } from "@crm/ui/components/table";
import { formatDay } from "@crm/ui/lib/format";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TaoKeHoach } from "@/app/(app)/[slug]/onboarding/tao-ke-hoach";
import { DetailSheetEmpty } from "@/components/detail-sheet";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { dien } from "./plan-copy";
import { AddRow, KhungTaiLoi } from "./record-parts";
import { useOpenRecord } from "./record-stack";

type HangKeHoach = RouterOutputs["onboarding"]["plansOfCompany"][number];

const PHU = "max-sm:hidden";

function DongKeHoach({ hang }: { hang: HangKeHoach }) {
	const locale = useLocale();
	const m = keHoachNoiMessages(locale).congTy;
	const openRecord = useOpenRecord();
	const dong = hang.closedAt !== null;

	return (
		<SimpleTableRow
			clickable
			data-ke-hoach={hang.id}
			onClick={() => openRecord({ kind: "plan", id: hang.id })}
		>
			<TableCell className="py-2.5 pr-3 pl-5">
				<span className="flex min-w-0 flex-col">
					<span className="flex min-w-0 items-center gap-2">
						<span className="truncate font-medium" translate="no">
							{hang.templateName ?? m.khongKhuon}
						</span>
						{dong ? <Badge variant="secondary">{m.daDong}</Badge> : null}
					</span>
					<span className="truncate text-muted-foreground text-xs">
						{dien(m.batDau, {
							ngay: formatDay(new Date(hang.startedAt).toISOString(), locale),
						})}
					</span>
				</span>
			</TableCell>
			<TableCell className={`${PHU} px-3 py-2.5 text-right tabular-nums`}>
				{hang.ngayThu}/{hang.targetDays}
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right tabular-nums">
				{hang.buocXong}/{hang.buocTong}
			</TableCell>
			<TableCell className={`${PHU} truncate px-3 py-2.5`} translate="no">
				{dong || hang.tacO === null ? <EmptyCellValue /> : hang.tacO}
			</TableCell>
			<TableCell className={`${PHU} truncate px-3 py-2.5`} translate="no">
				{hang.ownerName}
			</TableCell>
		</SimpleTableRow>
	);
}

export function CompanyPlans({
	companyId,
	companyName,
}: {
	companyId: string;
	companyName: string;
}) {
	const m = keHoachNoiMessages(useLocale()).congTy;
	const trpc = useTRPC();
	const [dangTao, setDangTao] = useState(false);
	const query = useQuery(
		trpc.onboarding.plansOfCompany.queryOptions({ companyId }),
	);

	const tao = (
		<TaoKeHoach
			congTyCoDinh={{ id: companyId, name: companyName }}
			mo={dangTao}
			doiMo={setDangTao}
		/>
	);

	if (query.isPending) {
		return (
			<div aria-live="polite" className="flex justify-center py-10">
				<Spinner />
			</div>
		);
	}

	if (query.isError) {
		return <KhungTaiLoi onRetry={() => void query.refetch()} />;
	}

	if (query.data.length === 0) {
		return (
			<>
				<DetailSheetEmpty
					icon={Roadmap}
					title={m.rongTieuDe}
					description={m.rongMoTa}
					action={
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDangTao(true)}
						>
							<Icon icon={Add} data-icon="inline-start" />
							{m.tao}
						</Button>
					}
				/>
				{tao}
			</>
		);
	}

	const cot = [
		{
			id: "ke-hoach",
			header: m.cot.keHoach,
			width: "w-[34%]",
			className: "pl-5",
		},
		{
			id: "ngay",
			header: m.cot.ngay,
			width: "w-[12%]",
			align: "right" as const,
			className: PHU,
		},
		{
			id: "buoc",
			header: m.cot.buoc,
			width: "w-[12%]",
			align: "right" as const,
		},
		{ id: "tac-o", header: m.cot.tacO, width: "w-[24%]", className: PHU },
		{
			id: "cam-trich",
			header: m.cot.camTrich,
			width: "w-[18%]",
			className: PHU,
		},
	];

	return (
		<>
			<SimpleTable variant="panel" columns={cot}>
				{query.data.map((hang) => (
					<DongKeHoach hang={hang} key={hang.id} />
				))}
				<AddRow
					label={m.tao}
					columns={cot.length}
					onClick={() => setDangTao(true)}
				/>
			</SimpleTable>
			{tao}
		</>
	);
}
