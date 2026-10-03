import { MUC_TU_TIN, type MucTuTin } from "@crm/validation/okr-cap-nhat";
import {
	LOAI_MUC_TIEU,
	type LoaiMucTieu,
	TRANG_THAI_MUC_TIEU,
	type TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import { LOC_GOP_Y } from "@crm/validation/okr-tham-so";
import type { DanhSachOutput, LocDanhSach } from "./okr-xem.contracts";

type NguoiGon = { id: string; name: string };

export type MucTieuGon = {
	id: string;
	owner: NguoiGon;
	kind: LoaiMucTieu;
	status: TrangThaiMucTieu;
	krOwners: NguoiGon[];
	tuTinKr: MucTuTin[];
	coGopYCho: boolean;
};

type MatLoc = keyof LocDanhSach;

export function khopLoc(
	m: MucTieuGon,
	loc: LocDanhSach,
	bo: MatLoc | null,
): boolean {
	if (
		bo !== "phuTrach" &&
		loc.phuTrach.length > 0 &&
		!loc.phuTrach.includes(m.owner.id) &&
		!m.krOwners.some((k) => loc.phuTrach.includes(k.id))
	)
		return false;
	if (bo !== "loai" && loc.loai.length > 0 && !loc.loai.includes(m.kind))
		return false;
	if (
		bo !== "trangThai" &&
		loc.trangThai.length > 0 &&
		!loc.trangThai.includes(m.status)
	)
		return false;
	if (
		bo !== "tuTin" &&
		loc.tuTin.length > 0 &&
		!m.tuTinKr.some((t) => loc.tuTin.includes(t))
	)
		return false;
	if (bo !== "gopY" && loc.gopY.includes("cho") && !m.coGopYCho) return false;
	return true;
}

function demTheo<T extends string>(
	ds: MucTieuGon[],
	thuTu: readonly T[],
	lay: (m: MucTieuGon) => T,
) {
	const dem = new Map<T, number>();
	for (const m of ds) dem.set(lay(m), (dem.get(lay(m)) ?? 0) + 1);
	return thuTu
		.filter((v) => (dem.get(v) ?? 0) > 0)
		.map((value) => ({ value, count: dem.get(value) ?? 0 }));
}

export function demMatLoc(
	ds: MucTieuGon[],
	loc: LocDanhSach,
): DanhSachOutput["facetCounts"] {
	const nguoi = new Map<string, { name: string; count: number }>();
	for (const m of ds.filter((x) => khopLoc(x, loc, "phuTrach"))) {
		const ai = new Map<string, string>([[m.owner.id, m.owner.name]]);
		for (const k of m.krOwners) ai.set(k.id, k.name);
		for (const [id, name] of ai) {
			const cu = nguoi.get(id);
			nguoi.set(id, { name, count: (cu?.count ?? 0) + 1 });
		}
	}
	return {
		phuTrach: [...nguoi]
			.map(([value, v]) => ({ value, name: v.name, count: v.count }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "vi")),
		loai: demTheo(
			ds.filter((x) => khopLoc(x, loc, "loai")),
			LOAI_MUC_TIEU,
			(m) => m.kind,
		),
		trangThai: demTheo(
			ds.filter((x) => khopLoc(x, loc, "trangThai")),
			TRANG_THAI_MUC_TIEU,
			(m) => m.status,
		),
		tuTin: MUC_TU_TIN.map((value) => ({
			value,
			count: ds
				.filter((x) => khopLoc(x, loc, "tuTin"))
				.filter((m) => m.tuTinKr.includes(value)).length,
		})).filter((d) => d.count > 0),
		gopY: LOC_GOP_Y.map((value) => ({
			value,
			count: ds
				.filter((x) => khopLoc(x, loc, "gopY"))
				.filter((m) => m.coGopYCho).length,
		})).filter((d) => d.count > 0),
	};
}
