import {
	LY_DO_TAM_DUNG_TOM_TAT,
	MUC_TU_TIN,
	TRANG_THAI_QUAN_TRI_TOM_TAT,
} from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";
import { cauTomTat } from "./okr-tro-ly";

export {
	OKR_TOM_TAT,
	TRANG_THAI_QUAN_TRI_TOM_TAT,
	type TrangThaiQuanTriTomTat,
} from "@crm/db/okr-tro-ly-danh-muc";

export const TRANG_THAI_TOM_TAT = ["hien", "can-xem"] as const;

export type TrangThaiTomTat = (typeof TRANG_THAI_TOM_TAT)[number];

export const trangThaiTomTat = z.enum(TRANG_THAI_TOM_TAT);

export const MA_BO_CAU = [
	"nguon-ngoai-goi",
	"so-lech",
	"sai-chieu",
	"noi-ve-nguoi",
	"tu-cam",
	"trung-cau",
] as const;

export type MaBoCau = (typeof MA_BO_CAU)[number];

export const maBoCau = z.enum(MA_BO_CAU);

const nacBan = z.enum(["an", "bat"]);

export const cauBoTomTat = cauTomTat.extend({ maBo: maBoCau });

export const noiDungTomTat = z.object({
	nac: nacBan,
	cau: z.array(cauTomTat),
	bo: z.array(cauBoTomTat),
});

export type NoiDungTomTat = z.infer<typeof noiDungTomTat>;

export function parseNoiDungTomTat(value: unknown): NoiDungTomTat {
	const ket = noiDungTomTat.safeParse(value);
	if (!ket.success) {
		throw new Error(`noi dung tom tat tuan hong: ${ket.error.message}`);
	}
	return ket.data;
}

export function parseTrangThaiTomTat(value: unknown): TrangThaiTomTat {
	const ket = trangThaiTomTat.safeParse(value);
	if (!ket.success) {
		throw new Error(`trang thai tom tat tuan hong: ${ket.error.message}`);
	}
	return ket.data;
}

const ma = z.string().trim().min(1).max(120);

const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const troLyTomTatInput = z.object({ cycleId: ma, departmentId: ma });

export const nguonHienTomTat = z.object({
	id: z.string(),
	keyResultId: z.string(),
	krTen: z.string(),
	mucTieuId: z.string(),
	mucTieuTen: z.string(),
	ngay,
	giaTri: z.number(),
	donVi: z.string(),
	tuTin: z.enum(MUC_TU_TIN),
	ghiChu: z.string(),
});

export const banHienTomTat = z.object({
	id: z.string(),
	tuan: ngay,
	soLanCapNhat: z.number().int(),
	cau: z.array(
		z.object({ vanBan: z.string(), nguon: z.array(nguonHienTomTat) }),
	),
	phanHoiCuaToi: z.boolean().nullable(),
});

export const choBanTomTat = z.discriminatedUnion("kieu", [
	z.object({ kieu: z.literal("toi-luc"), luc: z.iso.datetime() }),
	z.object({ kieu: z.literal("dang-xep") }),
	z.object({
		kieu: z.literal("tam-dung"),
		lyDo: z.enum(LY_DO_TAM_DUNG_TOM_TAT),
		moLai: ngay.nullable(),
	}),
]);

export const troLyTomTatOutput = z.object({
	ban: banHienTomTat.nullable(),
	dangSoan: z.boolean(),
	chuaCapNhat: z.boolean(),
	choBan: choBanTomTat.optional(),
});

export const troLyTomTatPhanHoiInput = z.object({
	tomTatId: ma,
	huuIch: z.boolean(),
});

export const troLyTomTatPhanHoiOutput = z.object({ ok: z.literal(true) });

export const troLyTomTatQuanTriInput = z.object({ cycleId: ma });

export const nguonQuanTriTomTat = z.discriminatedUnion("mat", [
	z.object({
		id: z.string(),
		mat: z.literal(false),
		ngay,
		krTen: z.string(),
	}),
	z.object({ id: z.string(), mat: z.literal(true) }),
]);

export const cauQuanTriTomTat = z.object({
	vanBan: z.string(),
	nguon: z.array(nguonQuanTriTomTat),
});

export const cauBoQuanTriTomTat = cauQuanTriTomTat.extend({ maBo: maBoCau });

export const dongQuanTriTomTat = z.object({
	departmentId: z.string(),
	ten: z.string(),
	nac: nacBan,
	trangThai: z.enum(TRANG_THAI_QUAN_TRI_TOM_TAT),
	tomTatId: z.string().nullable(),
	soCau: z.number().int(),
	soCauBo: z.number().int(),
	huuIch: z.number().int(),
	khongHuuIch: z.number().int(),
	cau: z.array(cauQuanTriTomTat),
	bo: z.array(cauBoQuanTriTomTat),
});

export const troLyTomTatQuanTriOutput = z.object({
	tuan: ngay.nullable(),
	phong: z.array(dongQuanTriTomTat),
});

export type TroLyTomTatInput = z.infer<typeof troLyTomTatInput>;
export type BanHienTomTat = z.infer<typeof banHienTomTat>;
export type ChoBanTomTat = z.infer<typeof choBanTomTat>;
export type TroLyTomTatOutput = z.infer<typeof troLyTomTatOutput>;
export type TroLyTomTatPhanHoiInput = z.infer<typeof troLyTomTatPhanHoiInput>;
export type TroLyTomTatPhanHoiOutput = z.infer<typeof troLyTomTatPhanHoiOutput>;
export type TroLyTomTatQuanTriInput = z.infer<typeof troLyTomTatQuanTriInput>;
export type NguonQuanTriTomTat = z.infer<typeof nguonQuanTriTomTat>;
export type DongQuanTriTomTat = z.infer<typeof dongQuanTriTomTat>;
export type TroLyTomTatQuanTriOutput = z.infer<typeof troLyTomTatQuanTriOutput>;
