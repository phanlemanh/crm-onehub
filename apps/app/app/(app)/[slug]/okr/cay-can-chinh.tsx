"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { okrMessages } from "@/lib/messages/okr";
import { CELL, type NutCay, THUT_CAY } from "./kieu";
import { ChamTrangThai } from "./tien-do-kr";

type DongPhang = { khoa: string; nut: NutCay; cap: number };

function trai(ds: NutCay[], cap: number, cha: string): DongPhang[] {
	return ds.flatMap((nut, i) => {
		const khoa = `${cha}/${nut.id}-${i}`;
		return [{ khoa, nut, cap }, ...trai(nut.children, cap + 1, khoa)];
	});
}

function DongCanChinh({ dong }: { dong: DongPhang }) {
	const m = okrMessages(useLocale());
	const { nut, cap } = dong;
	const laKr = nut.loai === "kr";
	return (
		<SimpleTableRow data-nut-can-chinh={nut.id} data-cap={cap}>
			<TableCell
				className={CELL}
				style={{
					paddingInlineStart: `${THUT_CAY.dauRem + cap * THUT_CAY.moiCapRem}rem`,
				}}
			>
				<span className="flex min-w-0 flex-col gap-0.5">
					<span
						className={
							laKr || nut.lapLai
								? "whitespace-normal text-muted-foreground"
								: "whitespace-normal font-medium"
						}
						translate="no"
					>
						{laKr ? `${m.cot.kr} · ${nut.title}` : nut.title}
					</span>
					{laKr ? null : (
						<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
							<span translate="no">{nut.unitName}</span>
							{nut.gop > 1 ? (
								<Badge variant="outline">{m.gopVao(nut.gop)}</Badge>
							) : null}
							{nut.lapLai ? <span>{m.lapLai}</span> : null}
						</span>
					)}
				</span>
			</TableCell>
			<TableCell className={CELL}>
				<span className="flex items-center gap-2">
					<Progress
						value={nut.progress}
						aria-label={m.tienDoCua(nut.title, nut.progress)}
					/>
					<span className="text-xs tabular-nums">{nut.progress}%</span>
				</span>
			</TableCell>
			<TableCell className={CELL}>
				{laKr ? null : <ChamTrangThai status={nut.status} />}
			</TableCell>
		</SimpleTableRow>
	);
}

export function CayCanChinh({
	roots,
	chuaCanChinh,
}: {
	roots: NutCay[];
	chuaCanChinh: NutCay[];
}) {
	const m = okrMessages(useLocale());
	const cot: SimpleTableColumn[] = [
		{ id: "title", header: m.cotCay.ten },
		{ id: "tienDo", header: m.cotCay.tienDo, width: "w-48" },
		{ id: "trangThai", header: m.cotCay.trangThai, width: "w-32" },
	];
	return (
		<SimpleTable columns={cot}>
			{trai(roots, 0, "goc").map((d) => (
				<DongCanChinh key={d.khoa} dong={d} />
			))}
			{chuaCanChinh.length > 0 ? (
				<SimpleTableRow data-nhom="chua-can-chinh">
					<TableCell
						colSpan={cot.length}
						className={`${CELL} text-muted-foreground text-xs`}
					>
						{m.chuaCanChinh}
					</TableCell>
				</SimpleTableRow>
			) : null}
			{trai(chuaCanChinh, 0, "chua").map((d) => (
				<DongCanChinh key={d.khoa} dong={d} />
			))}
		</SimpleTable>
	);
}
