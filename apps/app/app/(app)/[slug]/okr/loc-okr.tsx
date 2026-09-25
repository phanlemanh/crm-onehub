"use client";

import { Button } from "@crm/ui/components/button";
import {
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	LOAI_MUC_TIEU,
	type LoaiMucTieu,
	TRANG_THAI_MUC_TIEU,
	type TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import type { RouterOutputs } from "@/lib/trpc/types";

export type DemMatLoc = RouterOutputs["okr"]["danhSach"]["facetCounts"];

export type LocOkrGiaTri = {
	phuTrach: string[];
	loai: LoaiMucTieu[];
	trangThai: TrangThaiMucTieu[];
};

export type MatLocOkr = keyof LocOkrGiaTri;

const laMat = (id: string): id is MatLocOkr =>
	id === "phuTrach" || id === "loai" || id === "trangThai";

export const coLoc = (loc: LocOkrGiaTri) =>
	loc.phuTrach.length + loc.loai.length + loc.trangThai.length > 0;

export function chuanLoc(
	id: MatLocOkr,
	values: string[],
): Partial<LocOkrGiaTri> {
	switch (id) {
		case "phuTrach":
			return { phuTrach: values };
		case "loai":
			return {
				loai: LOAI_MUC_TIEU.filter((v) => values.includes(v)),
			};
		case "trangThai":
			return {
				trangThai: TRANG_THAI_MUC_TIEU.filter((v) => values.includes(v)),
			};
	}
}

export function LocOkr({
	dem,
	loc,
	doiLoc,
	boLoc,
}: {
	dem: DemMatLoc | undefined;
	loc: LocOkrGiaTri;
	doiLoc: (thay: Partial<LocOkrGiaTri>) => void;
	boLoc: () => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const soCua = (ds: { value: string; count: number }[], v: string) =>
		ds.find((d) => d.value === v)?.count ?? 0;
	const nguoi = new Map(
		(dem?.phuTrach ?? []).map((p) => [p.value, p] as const),
	);
	const facets: DataTableFacet[] = [
		{
			id: "phuTrach",
			label: mt.loc.phuTrach,
			options: [
				...(dem?.phuTrach ?? []).map((p) => ({
					value: p.value,
					label: `${p.name} · ${p.count}`,
				})),
				...loc.phuTrach
					.filter((id) => !nguoi.has(id))
					.map((id) => ({ value: id, label: `${id} · 0` })),
			],
		},
		{
			id: "loai",
			label: mt.loc.loai,
			options: LOAI_MUC_TIEU.map((v) => ({
				value: v,
				label: `${m.loai[v]} · ${soCua(dem?.loai ?? [], v)}`,
			})),
		},
		{
			id: "trangThai",
			label: mt.loc.trangThai,
			options: TRANG_THAI_MUC_TIEU.map((v) => ({
				value: v,
				label: `${m.trangThai[v]} · ${soCua(dem?.trangThai ?? [], v)}`,
			})),
		},
	];

	return (
		<div className="flex flex-wrap items-center gap-2" data-loc-okr>
			<DataTableFacetMenu
				facets={facets}
				filters={{
					phuTrach: loc.phuTrach,
					loai: loc.loai,
					trangThai: loc.trangThai,
				}}
				onFilterChange={(id, values) => {
					if (laMat(id)) doiLoc(chuanLoc(id, values));
				}}
			/>
			{coLoc(loc) ? (
				<Button data-nut="bo-loc" onClick={boLoc} size="sm" variant="ghost">
					{mt.loc.boLoc}
				</Button>
			) : null}
		</div>
	);
}

export function KhongKhop({ boLoc }: { boLoc: () => void }) {
	const mt = okrToanCanhMessages(useLocale());
	return (
		<Empty data-trang-thai="ST-donvi-loc-khongkhop">
			<EmptyHeader>
				<EmptyTitle>{mt.loc.khongKhop}</EmptyTitle>
				<EmptyDescription>{mt.loc.khongKhopMoTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={boLoc} size="sm" variant="outline">
					{mt.loc.boLoc}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
