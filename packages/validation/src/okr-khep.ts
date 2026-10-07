import { z } from "zod";
import { ngayLich } from "./okr-chu-ky";
import type { THANG_CHAM } from "./okr-chuong-trinh";
import { type KieuKr, tienDoKr } from "./okr-kr";
import type { LoaiMucTieu } from "./okr-muc-tieu";

export const OKR_KHEP = {
	buocPhanTram: 10,
	nguongThamVong: 0.7,
	lyDo: { toiThieu: 10, toiDa: 500 },
	dieuHocDuoc: { toiDa: 2000 },
	chamDon: { phut: 10 },
	mangSang: { diemTron: 1 },
} as const;

export type ThangCham = (typeof THANG_CHAM)[number];
const ma = z.string().trim().min(1).max(120);
const lyDo = z
	.string()
	.trim()
	.min(OKR_KHEP.lyDo.toiThieu)
	.max(OKR_KHEP.lyDo.toiDa);

export function goiYDiem(
	kieu: KieuKr,
	khoi: number,
	dich: number,
	soChot: number,
): number {
	const p = tienDoKr(kieu, khoi, dich, soChot);
	const b = OKR_KHEP.buocPhanTram;
	return (Math.floor((p + b / 2) / b) * b) / 100;
}

export function luoiDiem(thang: ThangCham): number[] {
	const n = 100 / OKR_KHEP.buocPhanTram;
	return Array.from({ length: n + 1 }, (_, i) =>
		thang === "0-100" ? i * OKR_KHEP.buocPhanTram : i / n,
	);
}

export function diemChuan(v: number, thang: ThangCham): number | null {
	const phanTram = thang === "0-100" ? v : v * 100;
	const tron = Math.round(phanTram);
	if (Math.abs(phanTram - tron) > 1e-9) return null;
	if (tron < 0 || tron > 100 || tron % OKR_KHEP.buocPhanTram !== 0) return null;
	if (thang === "0-100" && !Number.isInteger(v)) return null;
	return tron / 100;
}

export function diemTheoThang(d: number, thang: ThangCham): number {
	return thang === "0-100" ? Math.round(d * 100) : d;
}

export function diemMucTieu(
	krs: { diem: number | null; weight: number }[],
	trongSoBat: boolean,
): number | null {
	if (krs.length === 0 || krs.some((k) => k.diem === null)) return null;
	const w = (k: { weight: number }) => (trongSoBat ? k.weight : 1);
	const tong = krs.reduce((s, k) => s + w(k), 0);
	if (tong === 0) return null;
	return (
		Math.round(
			(krs.reduce((s, k) => s + (k.diem ?? 0) * w(k), 0) / tong) * 100,
		) / 100
	);
}

export const CACH_DOC = [
	"tot",
	"duoi-muc-tot",
	"dat",
	"chua-tron",
	"da-tra-loi",
	"chua-tra-loi",
] as const;
export type CachDoc = (typeof CACH_DOC)[number];
export function cachDoc(
	loai: LoaiMucTieu,
	diem: number | null,
	dieuHocDuoc: string,
): CachDoc | null {
	if (loai === "hoc-tap")
		return dieuHocDuoc.trim() ? "da-tra-loi" : "chua-tra-loi";
	if (diem === null) return null;
	if (loai === "tham-vong")
		return diem >= OKR_KHEP.nguongThamVong ? "tot" : "duoi-muc-tot";
	return diem >= 1 ? "dat" : "chua-tron";
}

export const lyDoDoiDich = lyDo;
export const moRaInput = z
	.object({ cycleId: ma, tuNgay: ngayLich, denNgay: ngayLich })
	.refine((v) => v.tuNgay <= v.denNgay, { message: "tuNgay <= denNgay" });
export const dongRaInput = z.object({ id: ma });
export const chamKrInput = z.object({
	keyResultId: ma,
	diem: z.number().finite(),
	lyDo: z.string().trim().max(OKR_KHEP.lyDo.toiDa).optional(),
});
export const ghiDieuHocDuocInput = z.object({
	objectiveId: ma,
	noiDung: z.string().trim().max(OKR_KHEP.dieuHocDuoc.toiDa),
});
export const moLaiKyInput = z.object({ id: ma, lyDo });
export const anChuKyInput = z.object({ id: ma, lyDo });
export const mangSangInput = z.object({ objectiveId: ma });
export const xuatKyInput = z.object({ cycleId: ma });
export type ChamKrInput = z.infer<typeof chamKrInput>;
export type MoRaInput = z.infer<typeof moRaInput>;
export type AnChuKyInput = z.infer<typeof anChuKyInput>;
