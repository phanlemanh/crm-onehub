import type { LoaiTrang } from "@crm/validation/tai-lieu";
import { createSerializer, parseAsBoolean, useQueryStates } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import type { NhomDeXuat, TabTaiLieu } from "@/lib/tai-lieu-man";
import { taiLieuParsers } from "./tai-lieu-search-params";

export type Loc = {
	tab: TabTaiLieu;
	loai: LoaiTrang | null;
	donVi: string | null;
	chu: string | null;
	nhom: NhomDeXuat;
	page: number;
	archived: boolean;
};

export type DoiLoc = (sua: Partial<Loc>) => void;

const K = SEARCH_PARAM.taiLieu;
const L = SEARCH_PARAM.list;

function soTrang(page: number | undefined): number | null | undefined {
	if (page === undefined) return undefined;
	return page > 1 ? page : null;
}

function luuTru(archived: boolean | undefined): true | null | undefined {
	if (archived === undefined) return undefined;
	return archived ? true : null;
}

function sangKhoa(sua: Partial<Loc>) {
	return {
		[K.tab]: sua.tab,
		[K.loai]: sua.loai,
		[K.donVi]: sua.donVi,
		[K.chu]: sua.chu,
		[K.nhom]: sua.nhom,
		[L.page]: soTrang(sua.page),
		[L.archived]: luuTru(sua.archived),
	};
}

const noiDuong = createSerializer(taiLieuParsers);
const noiDuongTim = createSerializer({
	...taiLieuParsers,
	[SEARCH_PARAM.dialog.switcher]: parseAsBoolean,
});

export function duongLoc(goc: string, loc: Partial<Loc>): string {
	return `${goc}${noiDuong(sangKhoa(loc))}`;
}

export function duongTimNhanh(goc: string, loc: Partial<Loc>): string {
	return `${goc}${noiDuongTim({
		...sangKhoa(loc),
		[SEARCH_PARAM.dialog.switcher]: true,
	})}`;
}

export function useLocTaiLieu(): readonly [Loc, DoiLoc] {
	const [q, dat] = useQueryStates(taiLieuParsers, { shallow: false });
	const loc: Loc = {
		tab: q[K.tab],
		loai: q[K.loai],
		donVi: q[K.donVi],
		chu: q[K.chu],
		nhom: q[K.nhom],
		page: Math.max(1, q[L.page]),
		archived: q[L.archived],
	};
	const doi: DoiLoc = (sua) => {
		void dat(sangKhoa(sua));
	};
	return [loc, doi] as const;
}

export const BO_LOC_TRONG = {
	loai: null,
	donVi: null,
	chu: null,
	page: 1,
	archived: false,
} as const satisfies Partial<Loc>;
