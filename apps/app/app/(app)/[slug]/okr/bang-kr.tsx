"use client";

import { Badge } from "@crm/ui/components/badge";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import type { Locale } from "@crm/ui/lib/locale";
import type { LoaiMucTieu } from "@crm/validation/okr-muc-tieu";
import { okrMessages } from "@/lib/messages/okr";
import { CELL, type KetQua } from "./kieu";
import { TienDoKr } from "./tien-do-kr";

const DINH_DANG_SO = { vi: "vi-VN", en: "en-US" } satisfies Record<
	Locale,
	string
>;

function giaTri(kr: KetQua, so: number, locale: Locale): string {
	const m = okrMessages(locale);
	if (kr.kind === "moc") return so >= 1 ? m.moc.xong : m.moc.chuaXong;
	const chu = so.toLocaleString(DINH_DANG_SO[locale]);
	return kr.unit === "%" ? `${chu}%` : `${chu} ${kr.unit}`.trim();
}

export function BangKr({
	keyResults,
	kind,
	expected,
	danhDauCuaToi,
}: {
	keyResults: KetQua[];
	kind: LoaiMucTieu;
	expected: number | null;
	danhDauCuaToi: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const cot: SimpleTableColumn[] = [
		{ id: "ten", header: m.cot.ten },
		{ id: "phuTrach", header: m.cot.phuTrach, width: "w-40" },
		{ id: "tienDo", header: m.cot.tienDo, width: "w-48" },
		{ id: "dich", header: m.cot.dich, width: "w-40", align: "right" },
	];

	return (
		<SimpleTable columns={cot}>
			{keyResults.map((kr) => (
				<SimpleTableRow key={kr.id} data-kr={kr.id}>
					<TableCell className={CELL}>
						<span className="flex min-w-0 flex-col gap-1">
							<span className="whitespace-normal" translate="no">
								{kr.title}
							</span>
							<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
								{m.kieu[kr.kind]}
								{danhDauCuaToi && kr.laCuaToi ? (
									<Badge variant="outline" data-cua-toi>
										{m.cuaToi}
									</Badge>
								) : null}
							</span>
						</span>
					</TableCell>
					<TableCell className={CELL}>
						<span translate="no">{kr.owner.name}</span>
					</TableCell>
					<TableCell className={CELL}>
						<TienDoKr
							ten={kr.title}
							progress={kr.progress}
							expected={expected}
							kind={kind}
							laMoc={kr.kind === "moc"}
						/>
					</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{kr.kind === "moc" ? (
							giaTri(kr, kr.currentValue, locale)
						) : (
							<span translate="no">
								{giaTri(kr, kr.currentValue, locale)} /{" "}
								{giaTri(kr, kr.targetValue, locale)}
							</span>
						)}
					</TableCell>
				</SimpleTableRow>
			))}
			{keyResults.length === 0 ? (
				<SimpleTableRow>
					<TableCell colSpan={cot.length} className="p-0">
						<CardTableEmpty>{m.chuaCoKr}</CardTableEmpty>
					</TableCell>
				</SimpleTableRow>
			) : null}
		</SimpleTable>
	);
}
