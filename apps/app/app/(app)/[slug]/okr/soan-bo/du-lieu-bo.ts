import { docSoOkr, type KieuKr, SO_KR_MOC } from "@crm/validation/okr-kr";
import type { CapMucTieu, DonViMucTieu } from "@crm/validation/okr-muc-tieu";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import type { RouterOutputs } from "@/lib/trpc/types";
import { SOAN_BO } from "./cau-hinh";

type DanhSach = RouterOutputs["okr"]["danhSach"];
type CayToChuc = RouterOutputs["org"]["tree"];

export type DongDs = DanhSach["rows"][number];

type CapBo = { level: CapMucTieu; unitId: string | null };

function capCuaBo(don: DonChonOkr): CapBo | null {
	switch (don.loai) {
		case "goc":
			return { level: "onehub", unitId: null };
		case "bp":
			return { level: "bo-phan", unitId: don.id };
		case "pb":
			return { level: "phong-ban", unitId: don.id };
		case "nguoi":
			return null;
	}
}

export function chonMucTieuBo(ds: DanhSach, don: DonChonOkr): DongDs[] {
	const cap = capCuaBo(don);
	if (cap === null) return [];
	return ds.rows.filter(
		(r) =>
			r.level === cap.level &&
			(cap.level === "onehub" || r.unitId === cap.unitId),
	);
}

export type DongKrNhap = {
	ten: string;
	khoi: string;
	dich: string;
	donVi: string;
	kieu: KieuKr | null;
	nguoi: string | null;
};

export type TrangThaiDongKr =
	| { loai: "du"; kieu: KieuKr; khoi: number; dich: number }
	| {
			loai: "chua-luu";
			ly:
				| "thieu-ten"
				| "thieu-dich"
				| "thieu-khoi-diem"
				| "dich-bang-khoi"
				| "so-sai";
	  };

export function suyKieuKr(
	khoi: number | null,
	dich: number | null,
): KieuKr | null {
	if (khoi === null && dich === null) return "moc";
	if (khoi === null || dich === null) return null;
	if (dich > khoi) return "tang-toi";
	if (dich < khoi) return "giam-xuong";
	return null;
}

type OSo = { loai: "trong" } | { loai: "so"; gia: number } | { loai: "sai" };

function docOSo(chu: string): OSo {
	if (chu.replace(/\s/g, "") === "") return { loai: "trong" };
	const gia = docSoOkr(chu);
	return gia === null ? { loai: "sai" } : { loai: "so", gia };
}

const giaCua = (o: OSo): number | null => (o.loai === "so" ? o.gia : null);

const chuaLuu = (ly: Extract<TrangThaiDongKr, { loai: "chua-luu" }>["ly"]) =>
	({ loai: "chua-luu", ly }) as const;

export function kiemDongKr(d: DongKrNhap): TrangThaiDongKr {
	if (d.ten.trim().length < SOAN_BO.tenToiThieu) return chuaLuu("thieu-ten");
	const oKhoi = docOSo(d.khoi);
	const oDich = docOSo(d.dich);
	if (oKhoi.loai === "sai" || oDich.loai === "sai") return chuaLuu("so-sai");
	const khoi = giaCua(oKhoi);
	const dich = giaCua(oDich);
	const kieu = d.kieu ?? suyKieuKr(khoi, dich);
	if (kieu === "moc") {
		return {
			loai: "du",
			kieu: "moc",
			khoi: SO_KR_MOC.startValue,
			dich: SO_KR_MOC.targetValue,
		};
	}
	if (dich === null) return chuaLuu("thieu-dich");
	if (khoi === null) return chuaLuu("thieu-khoi-diem");
	if (kieu === null) return chuaLuu("dich-bang-khoi");
	return { loai: "du", kieu, khoi, dich };
}

export function nguoiPhuTrachMacDinh(
	don: DonChonOkr,
	cay: CayToChuc,
	nguoiSoan: string,
): string {
	switch (don.loai) {
		case "bp":
			return cay.divisions.find((x) => x.id === don.id)?.head?.id ?? nguoiSoan;
		case "pb":
			return (
				[...cay.divisions.flatMap((x) => x.departments), ...cay.chuaXep].find(
					(x) => x.id === don.id,
				)?.head?.id ?? nguoiSoan
			);
		case "goc":
		case "nguoi":
			return nguoiSoan;
	}
}

export function demCongBo(
	ds: readonly { status: string; soKrDaLuu: number }[],
): number {
	return ds.filter((d) => d.status === "nhap" && d.soKrDaLuu >= 1).length;
}

export function donViMucTieuCua(don: DonChonOkr): DonViMucTieu {
	switch (don.loai) {
		case "goc":
			return { level: "onehub" };
		case "bp":
			return { level: "bo-phan", divisionId: don.id };
		case "pb":
			return { level: "phong-ban", departmentId: don.id };
		case "nguoi":
			return { level: "ca-nhan", personUserId: don.id };
	}
}

export function dongKrTrong(d: DongKrNhap): boolean {
	return [d.ten, d.khoi, d.dich, d.donVi].every((o) => o.trim() === "");
}
