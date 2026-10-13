import { z } from "zod";

export const NHOM_TRANG_THAI = [
	"da-giao",
	"dang-lam",
	"chua-bat-dau",
	"khac",
] as const;

const moiNguoi = z.object({
	da_giao: z.string().nullable(),
	vi_sao: z.string().nullable(),
	trang_thai: z.string().nullable(),
	ngay: z.string().nullable(),
	production: z.string().nullable(),
	do_gi: z.string().nullable(),
	ket_qua: z.string().nullable(),
	chua_lam: z.string().nullable(),
	ai_quyet: z.string().nullable(),
});

const chuKho = z.object({
	tieu_chi: z.number().nullable(),
	phep_do: z.number().nullable(),
	luot_cham: z.number().nullable(),
	token: z.number().nullable(),
	quyet_dinh_may: z.number().nullable(),
	quyet_dinh_nguoi: z.number().nullable(),
	ma: z.string().nullable(),
});

const tomTat = z.object({ moi_nguoi: moiNguoi, chu_kho: chuKho });

const hangLoTrinh = z.object({
	ma: z.string(),
	cau_giao: z.string(),
	hang: z.string(),
	nhom: z.string(),
	dung_tren: z.array(z.string()),
	trang_thai: z.string(),
	nhom_trang_thai: z.enum(NHOM_TRANG_THAI),
	ho_so: z.string().nullable(),
	theo_loi: z.boolean(),
	co: z.array(z.string()),
	bat_khi: z.string(),
	vi_sao: z.string(),
	tom_tat: tomTat.nullable().default(null),
});

const NGAY_ISO = /^\d{4}-\d{2}-\d{2}$/;

const khuonMoc = z.object({
	ten: z.string(),
	ngay: z.string(),
	hang: z.array(z.string()),
	con_viec: z.boolean(),
});

const mocLoTrinh = khuonMoc.transform((moc) => ({
	...moc,
	ngayHopLe: NGAY_ISO.test(moc.ngay) ? moc.ngay : null,
}));

const hangKe = z.object({
	ma: z.string(),
	cau_giao: z.string(),
	lenh: z.string().nullable(),
});

const canSua = z.object({ ma: z.string().nullable(), chu: z.string() });

const tienDo = z.object({
	tong: z.number(),
	da_giao: z.number(),
	dang_lam: z.number(),
	chua_bat_dau: z.number(),
	khac: z.number(),
});

const daBac = z.object({ ma: z.string(), ly_do: z.string() });

const loTrinh = z.object({
	tep: z.string(),
	ten: z.string().nullable(),
	loi: z.string().nullable(),
	hang_ke: hangKe.nullable(),
	can_sua: z.array(canSua),
	tien_do: tienDo,
	hang: z.array(hangLoTrinh),
	moc: z.array(mocLoTrinh),
	da_bac: z.array(daBac),
});

export const loTrinhDuLieu = z.object({
	khuon: z.literal("lo-trinh-du-lieu"),
	phien_ban: z.number(),
	nguon: z.array(z.string()),
	lo_trinh: z.array(loTrinh),
	ngoai_lo_trinh: z.array(z.string()),
});

export type LoTrinhDuLieu = z.infer<typeof loTrinhDuLieu>;
export type LoTrinh = z.infer<typeof loTrinh>;
export type HangLoTrinh = z.infer<typeof hangLoTrinh>;
export type MocLoTrinh = z.infer<typeof mocLoTrinh>;
export type NhomTrangThai = (typeof NHOM_TRANG_THAI)[number];
export type TomTatHoSo = z.infer<typeof tomTat>;
export type TomTatChoXem = Omit<TomTatHoSo, "chu_kho"> & {
	chu_kho: TomTatHoSo["chu_kho"] | null;
};
export type HangChoXem = Omit<HangLoTrinh, "tom_tat"> & {
	tom_tat: TomTatChoXem | null;
};
export type LoTrinhChoXem = Omit<LoTrinh, "hang"> & { hang: HangChoXem[] };
export type DuLieuChoXem = Omit<LoTrinhDuLieu, "lo_trinh"> & {
	lo_trinh: LoTrinhChoXem[];
};

export const KHOA_LO_TRINH_DU_LIEU = {
	goc: Object.keys(loTrinhDuLieu.shape),
	lo_trinh: Object.keys(loTrinh.shape),
	hang_ke: Object.keys(hangKe.shape),
	can_sua: Object.keys(canSua.shape),
	tien_do: Object.keys(tienDo.shape),
	hang: Object.keys(hangLoTrinh.shape),
	moc: Object.keys(khuonMoc.shape),
	da_bac: Object.keys(daBac.shape),
	tom_tat: Object.keys(tomTat.shape),
	moi_nguoi: Object.keys(moiNguoi.shape),
	chu_kho: Object.keys(chuKho.shape),
} as const;

export type KetQuaLoTrinh =
	| { ok: true; duLieu: LoTrinhDuLieu }
	| { ok: false; duongKhoa: string; thongDiep: string };

export function phanTichLoTrinh(gt: unknown): KetQuaLoTrinh {
	const kq = loTrinhDuLieu.safeParse(gt);
	if (kq.success) return { ok: true, duLieu: kq.data };
	const loi = kq.error.issues[0];
	return {
		ok: false,
		duongKhoa: (loi?.path ?? []).map(String).join("."),
		thongDiep: loi?.message ?? "",
	};
}
