import {
	LOI_VAO,
	MUC_TU_TIN,
	type MucTuTin,
} from "@crm/validation/okr-cap-nhat";
import type { LoaiChuKy, PhaChuKy } from "@crm/validation/okr-chu-ky";
import {
	LOAI_MUC_TIEU,
	type LoaiMucTieu,
	TRANG_THAI_MUC_TIEU,
	type TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import {
	createLoader,
	createParser,
	parseAsArrayOf,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export type DonChonOkr =
	| { loai: "goc" }
	| { loai: "bp"; id: string }
	| { loai: "pb"; id: string }
	| { loai: "nguoi"; id: string };

export const CACH_XEM = ["danh-sach", "cay", "hop-tuan", "cham"] as const;
export type CachXem = (typeof CACH_XEM)[number];

export const KY_HIEN_TAI = "current";

export const khoaDon = (d: DonChonOkr): string =>
	d.loai === "goc" ? d.loai : `${d.loai}:${d.id}`;

export const parseAsDonOkr = createParser<DonChonOkr>({
	parse: (v) => {
		if (v === "goc") return { loai: "goc" };
		const [loai, id, ...du] = v.split(":");
		if (
			(loai === "bp" || loai === "pb" || loai === "nguoi") &&
			id &&
			du.length === 0
		)
			return { loai, id };
		return null;
	},
	serialize: khoaDon,
	eq: (a, b) => khoaDon(a) === khoaDon(b),
});

export const okrParsers = {
	[SEARCH_PARAM.okr.ky]: parseAsString,
	[SEARCH_PARAM.okr.don]: parseAsDonOkr,
	[SEARCH_PARAM.okr.xem]: parseAsStringLiteral(CACH_XEM),
	[SEARCH_PARAM.okr.phuTrach]: parseAsArrayOf(parseAsString).withDefault([]),
	[SEARCH_PARAM.okr.loai]: parseAsArrayOf(
		parseAsStringLiteral(LOAI_MUC_TIEU),
	).withDefault([]),
	[SEARCH_PARAM.okr.trangThai]: parseAsArrayOf(
		parseAsStringLiteral(TRANG_THAI_MUC_TIEU),
	).withDefault([]),
	[SEARCH_PARAM.okr.tuTin]: parseAsArrayOf(
		parseAsStringLiteral(MUC_TU_TIN),
	).withDefault([]),
	[SEARCH_PARAM.okr.tu]: parseAsStringLiteral(LOI_VAO).withDefault("tab"),
};

export const loadOkrSearchParams = createLoader(okrParsers);

export function locOkr(v: {
	[SEARCH_PARAM.okr.phuTrach]: string[];
	[SEARCH_PARAM.okr.loai]: LoaiMucTieu[];
	[SEARCH_PARAM.okr.trangThai]: TrangThaiMucTieu[];
	[SEARCH_PARAM.okr.tuTin]: MucTuTin[];
}) {
	return {
		phuTrach: v[SEARCH_PARAM.okr.phuTrach],
		loai: v[SEARCH_PARAM.okr.loai],
		trangThai: v[SEARCH_PARAM.okr.trangThai],
		tuTin: v[SEARCH_PARAM.okr.tuTin],
	};
}

type ChuKyGiai = {
	id: string;
	kind: LoaiChuKy;
	phase: PhaChuKy;
	startsOn: string;
	anLuc: string | null;
};

export function kyTrongOChon<T extends { anLuc: string | null }>(
	cycles: readonly T[],
): T[] {
	return cycles.filter((c) => c.anLuc === null);
}

const PHA_HOI_Y = "lap-ke-hoach" satisfies PhaChuKy;
const LOAI_UU_TIEN = "nam" satisfies LoaiChuKy;

export function kyMacDinhHoiY(cycles: {
	cycles: ChuKyGiai[];
	currentId: string | null;
}): string | null {
	const keHoach = kyTrongOChon(cycles.cycles)
		.filter((c) => c.phase === PHA_HOI_Y)
		.sort(
			(a, b) =>
				a.startsOn.localeCompare(b.startsOn) ||
				(a.kind === b.kind ? 0 : a.kind === LOAI_UU_TIEN ? -1 : 1),
		);
	return keHoach[0]?.id ?? cycles.currentId;
}

export function giaiKyHoiY(
	ky: string | null,
	cycles: { cycles: ChuKyGiai[]; currentId: string | null } | null,
): string | null {
	if (!cycles) return null;
	if (ky === KY_HIEN_TAI) return cycles.currentId;
	if (ky !== null && kyTrongOChon(cycles.cycles).some((c) => c.id === ky))
		return ky;
	return kyMacDinhHoiY(cycles);
}

export function giaiKy(
	ky: string | null,
	cycles: {
		cycles: { id: string; anLuc: string | null }[];
		currentId: string | null;
	} | null,
): string | null {
	if (!cycles) return null;
	if (
		ky !== null &&
		ky !== KY_HIEN_TAI &&
		kyTrongOChon(cycles.cycles).some((c) => c.id === ky)
	)
		return ky;
	return cycles.currentId;
}
