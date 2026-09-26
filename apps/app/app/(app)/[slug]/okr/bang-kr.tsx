"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import type { Locale } from "@crm/ui/lib/locale";
import type { LoaiMucTieu } from "@crm/validation/okr-muc-tieu";
import type { ReactNode } from "react";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoMessages } from "@/lib/messages/okr-so";
import { CELL, type KetQua } from "./kieu";
import {
	chuSo,
	KHOA_DAU,
	type NguonMay,
	useXemDuocBanGhi,
	type XemBanGhi,
} from "./nguon-so";
import { TienDoKr } from "./tien-do-kr";

export function giaTri(
	kr: Pick<KetQua, "kind" | "unit">,
	so: number,
	locale: Locale,
): string {
	const m = okrMessages(locale);
	if (kr.kind === "moc") return so >= 1 ? m.moc.xong : m.moc.chuaXong;
	const chu = chuSo(so, locale);
	return kr.unit === "%" ? `${chu}%` : `${chu} ${kr.unit}`.trim();
}

function soTran(
	kr: Pick<KetQua, "kind" | "unit">,
	so: number,
	locale: Locale,
): string {
	if (kr.kind === "moc") return giaTri(kr, so, locale);
	const chu = chuSo(so, locale);
	return kr.unit === "%" ? `${chu}%` : chu;
}

function nguonMayCua(kr: KetQua): NguonMay | null {
	if (kr.source !== "tay") return kr.source;
	return kr.doCanh ? (kr.soMay?.nguon ?? null) : null;
}

const CHUP_THEO_NHIP: readonly NguonMay[] = ["crm", "bang-tinh"];

function SoCuaKr({ kr, xem }: { kr: KetQua; xem: XemBanGhi }) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const moSo = useOpenRecord();
	const coMay = kr.source !== "tay" || kr.doCanh;
	const dich = giaTri(kr, kr.targetValue, locale);

	if (!coMay)
		return kr.kind === "moc" ? (
			giaTri(kr, kr.currentValue, locale)
		) : (
			<span translate="no">
				{giaTri(kr, kr.currentValue, locale)} / {dich}
			</span>
		);

	const may = nguonMayCua(kr);
	const chuaChup =
		kr.soMay === null &&
		(kr.doCanh || CHUP_THEO_NHIP.some((n) => n === kr.source));
	const so =
		kr.doCanh && kr.soMay
			? s.trangThai.bangKr.doCanh(
					soTran(kr, kr.currentValue, locale),
					soTran(kr, kr.soMay.giaTri, locale),
				)
			: giaTri(kr, kr.currentValue, locale);
	const hienSo = kr.doCanh && kr.soMay ? so : <span translate="no">{so}</span>;

	return (
		<span className="inline-flex flex-col items-end gap-1">
			<span className="inline-flex flex-wrap items-center justify-end gap-2">
				{may ? (
					<Badge variant="outline" data-dau-nguon={may}>
						{s.dau[KHOA_DAU[may]]}
					</Badge>
				) : null}
				<span className="inline-flex items-center">
					{xem === "chua-biet" ? (
						<span data-so-kr-cho={kr.id}>{hienSo}</span>
					) : xem === "duoc" ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="link"
									size="xs"
									data-so-kr={kr.id}
									onClick={() => moSo({ kind: "so-kr", id: kr.id })}
								>
									{hienSo}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{s.trangThai.bangKr.moSo(kr.title)}
							</TooltipContent>
						</Tooltip>
					) : (
						<Tooltip>
							<TooltipTrigger asChild>
								<span data-so-kr-tran={kr.id}>{hienSo}</span>
							</TooltipTrigger>
							<TooltipContent>{s.trangThai.bangKr.chiOkr}</TooltipContent>
						</Tooltip>
					)}
					{kr.kind === "moc" ? null : (
						<span translate="no">
							{" / "}
							{dich}
						</span>
					)}
				</span>
			</span>
			{chuaChup ? (
				<span className="text-muted-foreground text-xs" data-chua-chup>
					{s.trangThai.bangKr.chuaChup}
				</span>
			) : null}
		</span>
	);
}

export function BangKr({
	keyResults,
	kind,
	expected,
	danhDauCuaToi,
	hanhDong,
	nhanHanhDong,
}: {
	keyResults: KetQua[];
	kind: LoaiMucTieu;
	expected: number | null;
	danhDauCuaToi: boolean;
	hanhDong?: (kr: KetQua) => ReactNode;
	nhanHanhDong?: string;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const xem = useXemDuocBanGhi();
	const cot: SimpleTableColumn[] = [
		{ id: "ten", header: m.cot.kr },
		{ id: "phuTrach", header: m.cot.phuTrach, width: "w-40" },
		{ id: "tienDo", header: m.cot.tienDo, width: "w-48" },
		{ id: "dich", header: m.cot.dich, width: "w-40", align: "right" },
		...(hanhDong
			? [{ id: "hanhDong", srLabel: nhanHanhDong, width: "w-12" }]
			: []),
	];

	return (
		<SimpleTable columns={cot}>
			{keyResults.map((kr) => (
				<SimpleTableRow key={kr.id} data-kr={kr.id} data-kr-hang={kr.id}>
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
					<TableCell
						className={`${CELL} text-right tabular-nums`}
						data-nguon={kr.source}
						data-do-canh={kr.doCanh ? "" : undefined}
					>
						<SoCuaKr kr={kr} xem={xem} />
					</TableCell>
					{hanhDong ? (
						<TableCell className={CELL}>{hanhDong(kr)}</TableCell>
					) : null}
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
