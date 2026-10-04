import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";
import { KIEU_KR, SO_KR_MOC, soKr } from "./okr-kr";

export const LOAI_MUC_TIEU_NHAP = ["cam-ket", "tham-vong"] as const;

export const BAN_NHAP_TRAN = {
	mucTieu: { min: 2, max: 4 },
	kr: { min: 2, max: 4 },
	khoa: 40,
	donVi: 24,
	tenToiThieu: 3,
} as const;

export const khoaNhap = z.string().trim().min(1).max(BAN_NHAP_TRAN.khoa);

const viSao = z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.viSao);

export const krNhap = z.object({
	khoa: khoaNhap,
	ten: z
		.string()
		.trim()
		.min(BAN_NHAP_TRAN.tenToiThieu)
		.max(TRO_LY_OKR_TRAN.chu.tenKr),
	kieu: z.enum(KIEU_KR),
	donVi: z.string().trim().max(BAN_NHAP_TRAN.donVi),
	khoiDiemGoiY: z.number().finite().nullable().optional(),
	dich: z.number().finite().nullable().optional(),
	viSao,
});

export const mucTieuNhap = z.object({
	khoa: khoaNhap,
	ten: z
		.string()
		.trim()
		.min(BAN_NHAP_TRAN.tenToiThieu)
		.max(TRO_LY_OKR_TRAN.chu.tenMucTieu),
	viSaoLucNay: z.string().trim().max(TRO_LY_OKR_TRAN.chu.viSao),
	loai: z.enum(LOAI_MUC_TIEU_NHAP),
	viSao,
	canChinhId: z.string().min(1).nullable().optional(),
	kr: z.array(krNhap).min(BAN_NHAP_TRAN.kr.min).max(BAN_NHAP_TRAN.kr.max),
});

export const banNhap = z.object({
	mucTieu: z
		.array(mucTieuNhap)
		.min(BAN_NHAP_TRAN.mucTieu.min)
		.max(BAN_NHAP_TRAN.mucTieu.max),
});

export type KrNhap = z.infer<typeof krNhap>;
export type MucTieuNhap = z.infer<typeof mucTieuNhap>;
export type BanNhap = z.infer<typeof banNhap>;

export function parseBanNhap(value: unknown): BanNhap {
	const r = banNhap.safeParse(value);
	if (!r.success)
		throw new Error(`bản nháp không đọc được: ${r.error.message}`);
	return r.data;
}

export const soanDuaVaoInput = z.object({
	cuocSoanId: z.string().min(1),
	kr: z.array(
		z.object({
			deXuatId: z.string().min(1),
			khoiDiem: soKr,
			dich: soKr,
		}),
	),
});

export type SoanDuaVaoInput = z.infer<typeof soanDuaVaoInput>;

export const BUOC_CAT = ["3-tom-gon", "3-kr", "ngang-cap", "2a-kr"] as const;

export const bangDaCat = z.object({
	buoc: z.array(z.enum(BUOC_CAT)),
	truocToken: z.number().int().nonnegative(),
	sauToken: z.number().int().nonnegative(),
	chienLuocCatKyTu: z.number().int().nonnegative(),
});

export type BuocCat = z.infer<typeof bangDaCat>["buoc"][number];
export type DaCat = z.infer<typeof bangDaCat>;

export function parseDaCat(value: unknown): DaCat {
	const r = bangDaCat.safeParse(value);
	if (!r.success)
		throw new Error(`bảng đã cắt không đọc được: ${r.error.message}`);
	return r.data;
}

export const vetTaoKrSoan = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("moc"),
		startValue: z.literal(SO_KR_MOC.startValue),
		targetValue: z.literal(SO_KR_MOC.targetValue),
		soNguoiGoKhoiDiem: z.null(),
		soNguoiGoDich: z.null(),
	}),
	z.object({
		kind: z.enum(KIEU_KR).exclude(["moc"]),
		startValue: soKr,
		targetValue: soKr,
		soNguoiGoKhoiDiem: soKr,
		soNguoiGoDich: soKr,
	}),
]);

export type VetTaoKrSoan = z.infer<typeof vetTaoKrSoan>;

export function soGhiKhacNguoiGo(vet: VetTaoKrSoan): boolean {
	if (vet.kind === "moc") return false;
	return (
		vet.startValue !== vet.soNguoiGoKhoiDiem ||
		vet.targetValue !== vet.soNguoiGoDich
	);
}

export const PHIEN_CHO_EVE = "cho-eve:";

export function laChoGiuPhien(id: string): boolean {
	return id.startsWith(PHIEN_CHO_EVE);
}
