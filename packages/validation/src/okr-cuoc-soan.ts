import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";
import { KIEU_KR, SO_KR_MOC, soKr } from "./okr-kr";
import { LOAI_MUC_TIEU } from "./okr-muc-tieu";

export const LOAI_MUC_TIEU_NHAP = LOAI_MUC_TIEU;

export const BAN_NHAP_TRAN = {
	mucTieu: { min: 2, max: 4 },
	kr: { min: 2, max: 4 },
	khoa: 40,
	donVi: 24,
	tenToiThieu: 3,
} as const;

export const BAN_NHAP_LOI = {
	mucTieuTrungKhoa: "khoa Mục tiêu trùng",
	krTrungKhoa: "khoa KR trùng trong cùng Mục tiêu",
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

function lapLai(khoa: readonly string[]): { i: number; khoa: string }[] {
	return khoa.flatMap((k, i) => (khoa.indexOf(k) < i ? [{ i, khoa: k }] : []));
}

function chanKhoaTrung(
	b: { mucTieu: MucTieuNhap[] },
	ctx: z.RefinementCtx,
): void {
	for (const { i, khoa } of lapLai(b.mucTieu.map((m) => m.khoa)))
		ctx.addIssue({
			code: "custom",
			path: ["mucTieu", i, "khoa"],
			message: `${BAN_NHAP_LOI.mucTieuTrungKhoa}: ${khoa}`,
		});
	b.mucTieu.forEach((m, i) => {
		for (const { i: j, khoa } of lapLai(m.kr.map((k) => k.khoa)))
			ctx.addIssue({
				code: "custom",
				path: ["mucTieu", i, "kr", j, "khoa"],
				message: `${BAN_NHAP_LOI.krTrungKhoa}: ${khoa}`,
			});
	});
}

export const banNhap = z
	.object({
		mucTieu: z
			.array(mucTieuNhap)
			.min(BAN_NHAP_TRAN.mucTieu.min)
			.max(BAN_NHAP_TRAN.mucTieu.max),
	})
	.superRefine(chanKhoaTrung);

export type KrNhap = z.infer<typeof krNhap>;
export type MucTieuNhap = z.infer<typeof mucTieuNhap>;
export type BanNhap = z.infer<typeof banNhap>;

export function docBanNhap(value: unknown): BanNhap | null {
	const r = banNhap.safeParse(value);
	return r.success ? r.data : null;
}

export const KET_QUA_NOP = ["da-ghi", "tu-choi"] as const;

export const LY_DO_TU_CHOI_NOP = {
	cuocKhongThuocPhien: "cuoc khong thuoc phien",
	cuocKhongDang: "cuoc khong con dang",
	donViChuaBat: "don-vi-chua-bat",
	saiMucDich: "phien khong phai okr-soan",
	chuKyKhongLapKeHoach: "chu ky khong o pha lap ke hoach",
	dongTrungKhoa: "dong trung khoa",
	phienKhongSong: "phien khong con song",
} as const;

export type LyDoTuChoiNop = keyof typeof LY_DO_TU_CHOI_NOP;
type GiaTriLyDo = (typeof LY_DO_TU_CHOI_NOP)[LyDoTuChoiNop];

const GIA_TRI_LY_DO = Object.values(LY_DO_TU_CHOI_NOP) as [
	GiaTriLyDo,
	...GiaTriLyDo[],
];
const MA_THEO_GIA_TRI = new Map<string, LyDoTuChoiNop>(
	(Object.keys(LY_DO_TU_CHOI_NOP) as LyDoTuChoiNop[]).map((k) => [
		LY_DO_TU_CHOI_NOP[k],
		k,
	]),
);

export const lyDoTuChoiGhi = z.union([z.enum(GIA_TRI_LY_DO), z.literal("")]);

export const ketQuaNopDoc = z.object({
	ketQua: z.enum(KET_QUA_NOP),
	lyDo: z
		.string()
		.transform((v): LyDoTuChoiNop | null => MA_THEO_GIA_TRI.get(v) ?? null),
});

export type KetQuaNopDoc = z.infer<typeof ketQuaNopDoc>;

export function docKetQuaNop(value: unknown): KetQuaNopDoc | null {
	const r = ketQuaNopDoc.safeParse(value);
	return r.success ? r.data : null;
}

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
