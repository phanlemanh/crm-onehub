"use client";

import { Button } from "@crm/ui/components/button";
import type { DataTableFacet } from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { MUC_TU_TIN, type MucTuTin } from "@crm/validation/okr-cap-nhat";
import {
	LOAI_MUC_TIEU,
	type LoaiMucTieu,
	TRANG_THAI_MUC_TIEU,
	type TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import { LOC_GOP_Y, type LocGopY } from "@crm/validation/okr-tham-so";
import { okrMessages } from "@/lib/messages/okr";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import type { RouterOutputs } from "@/lib/trpc/types";

export type DemMatLoc = RouterOutputs["okr"]["danhSach"]["facetCounts"];

export type LocOkrGiaTri = {
	phuTrach: string[];
	loai: LoaiMucTieu[];
	trangThai: TrangThaiMucTieu[];
	tuTin: MucTuTin[];
	gopY: LocGopY[];
};

export type MatLocOkr = keyof LocOkrGiaTri;

const MAT_LOC: readonly MatLocOkr[] = [
	"phuTrach",
	"loai",
	"trangThai",
	"tuTin",
	"gopY",
];

export const laMatLoc = (id: string): id is MatLocOkr =>
	MAT_LOC.some((mat) => mat === id);

export const coLoc = (loc: LocOkrGiaTri) =>
	MAT_LOC.some((mat) => loc[mat].length > 0);

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
		case "tuTin":
			return { tuTin: MUC_TU_TIN.filter((v) => values.includes(v)) };
		case "gopY":
			return { gopY: LOC_GOP_Y.filter((v) => values.includes(v)) };
	}
}

export function luaChonPhuTrach(
	dem: DemMatLoc["phuTrach"] | undefined,
	chon: string[],
	tenNguoi: ReadonlyMap<string, string>,
	nguoiDaRoi: string,
): { value: string; label: string }[] {
	const coDem = new Set((dem ?? []).map((p) => p.value));
	return [
		...(dem ?? []).map((p) => ({
			value: p.value,
			label: `${p.name} · ${p.count}`,
		})),
		...chon
			.filter((id) => !coDem.has(id))
			.map((id) => ({
				value: id,
				label: `${tenNguoi.get(id) ?? nguoiDaRoi} · 0`,
			})),
	];
}

/** Năm mặt lọc máy chủ của OKR, dạng `facets` của DataTable. */
export function useMatLocOkr(
	dem: DemMatLoc | undefined,
	loc: LocOkrGiaTri,
	tenNguoi: ReadonlyMap<string, string>,
): DataTableFacet[] {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const mg = okrGopYMessages(locale);
	const ui = useMessages();
	const tenMuc = {
		cao: ui.okr.tuTinCao,
		vua: ui.okr.tuTinVua,
		thap: ui.okr.tuTinThap,
	} satisfies Record<MucTuTin, string>;
	const soCua = (ds: { value: string; count: number }[], v: string) =>
		ds.find((d) => d.value === v)?.count ?? 0;
	return [
		{
			id: "phuTrach",
			label: mt.loc.phuTrach,
			options: luaChonPhuTrach(
				dem?.phuTrach,
				loc.phuTrach,
				tenNguoi,
				mt.loc.nguoiDaRoi,
			),
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
		{
			id: "tuTin",
			label: mt.loc.tuTin,
			options: MUC_TU_TIN.map((v) => ({
				value: v,
				label: `${tenMuc[v]} · ${soCua(dem?.tuTin ?? [], v)}`,
			})),
		},
		{
			id: "gopY",
			label: mg.loc.mat,
			options: LOC_GOP_Y.map((v) => ({
				value: v,
				label: mg.loc.coCho(String(soCua(dem?.gopY ?? [], v))),
			})),
		},
	];
}

export function KhongKhop({ boLoc }: { boLoc: () => void }) {
	const b = okrMessages(useLocale()).donViBang;
	return (
		<Empty data-trang-thai="ST-donvi-loc-khongkhop">
			<EmptyHeader>
				<EmptyTitle>{b.khongKhopLoc}</EmptyTitle>
				<EmptyDescription>{b.khongKhopLocMoTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={boLoc} size="sm" variant="outline">
					{b.boLoc}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
