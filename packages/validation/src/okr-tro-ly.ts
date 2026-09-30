import {
	AI_PHAM_VI,
	KET_QUA_KIEM_SAN_SANG,
	LY_DO_KHONG_SAN_SANG,
	MA_LOAI_DE_XUAT,
	NAC_TRO_LY,
	NGUON_KHOA,
	TRANG_THAI_DE_XUAT,
	TRO_LY_OKR_TRAN,
	TRUONG_VIET_LAI,
	VIEC_TRO_LY,
} from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";
import { ngayLich } from "./okr-chu-ky";

export {
	AI_PHAM_VI,
	type AiPhamVi,
	type CauHinhAi,
	DON_VI_ONEHUB,
	type DonViMucTieu,
	KET_QUA_KIEM_SAN_SANG,
	type KetQuaKiemSanSang,
	LY_DO_KHONG_SAN_SANG,
	type LyDoKhongSanSang,
	MA_LOAI_DE_XUAT,
	type MaLoaiDeXuat,
	NAC_TRO_LY,
	NGUON_KHOA,
	type NacTroLy,
	type NguonKhoaDb,
	nacCuaDonVi,
	nguonCuaKetQua,
	phamViCuaViec,
	TRANG_THAI_DE_XUAT,
	TRO_LY_OKR_TRAN,
	TRUONG_VIET_LAI,
	type TroLySanSang,
	type TruongVietLai,
	VIEC_TRO_LY,
	type ViecTroLy,
} from "@crm/db/okr-tro-ly-danh-muc";

export const viecTroLy = z.enum(VIEC_TRO_LY);

export const aiPhamVi = z.enum(AI_PHAM_VI);

export const trangThaiDeXuat = z.enum(TRANG_THAI_DE_XUAT);

export const nacTroLy = z.enum(NAC_TRO_LY);

export const maLoaiDeXuat = z.enum(MA_LOAI_DE_XUAT);

export const lyDoKhongSanSang = z.enum(LY_DO_KHONG_SAN_SANG);

export const troLySanSang = z.discriminatedUnion("bat", [
	z.object({ bat: z.literal(true), conLaiUsd: z.number() }),
	z.object({ bat: z.literal(false), lyDo: lyDoKhongSanSang }),
]);

export const ketQuaKiemSanSang = z.enum(KET_QUA_KIEM_SAN_SANG);

export const nguonKhoaHien = z.enum([...NGUON_KHOA, "chua-ro"]).nullable();

export type NguonKhoaHien = z.infer<typeof nguonKhoaHien>;

export const okrTroLyViec = z.discriminatedUnion("viec", [
	z.object({
		viec: z.literal("de-xuat"),
		objectiveId: z.string().min(1),
		keyResultId: z.string().min(1).nullable(),
		nguoiYeuCau: z.string().min(1),
		inputHash: z.string().min(1),
		nac: nacTroLy.exclude(["tat"]).default("bat"),
	}),
	z.object({
		viec: z.literal("tom-tat-tuan"),
		departmentId: z.string().min(1),
		cycleId: z.string().min(1),
		tuan: ngayLich,
		inputHash: z.string().min(1),
	}),
]);

export type OkrTroLyViec = z.infer<typeof okrTroLyViec>;

const TRAN_CUA_TRUONG = {
	title: TRO_LY_OKR_TRAN.chu.tenMucTieu,
	whyNow: TRO_LY_OKR_TRAN.chu.viSao,
	"kr.title": TRO_LY_OKR_TRAN.chu.tenKr,
} as const satisfies Record<(typeof TRUONG_VIET_LAI)[number], number>;

export const MA_VAN_DE = [
	"kr-la-viec",
	"thieu-doi-trong",
	"khong-do-duoc",
	"trung-y",
	"muc-tieu-la-so",
] as const;

export const dongDeXuat = z
	.object({
		loai: z.enum(["viet-lai", "hoi", "can-chinh"]),
		objectiveId: z.string().min(1),
		keyResultId: z.string().min(1).nullable(),
		truong: z.enum(TRUONG_VIET_LAI).nullable(),
		truoc: z.string().nullable(),
		sau: z.string().trim().nullable(),
		maVanDe: z.enum(MA_VAN_DE).nullable(),
		targetObjectiveId: z.string().min(1).nullable(),
		targetKeyResultId: z.string().min(1).nullable(),
		lyDo: z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.lyDo),
	})
	.superRefine((d, ctx) => {
		const loi = (message: string) => ctx.addIssue({ code: "custom", message });
		if (d.loai === "viet-lai") {
			if (!d.truong || d.truoc === null || !d.sau) {
				loi("viet-lai can truong, truoc, sau");
				return;
			}
			if (d.sau.length < 3 || d.sau.length > TRAN_CUA_TRUONG[d.truong]) {
				loi(`sau vuot tran cua ${d.truong}`);
			}
		}
		if (d.loai === "hoi" && !d.maVanDe) loi("hoi can maVanDe");
		if (
			d.loai === "can-chinh" &&
			Boolean(d.targetObjectiveId) === Boolean(d.targetKeyResultId)
		) {
			loi("can-chinh can dung mot dich");
		}
	});

export type DongDeXuat = z.infer<typeof dongDeXuat>;

export const dichDeXuat = z.object({
	targetObjectiveId: z.string().min(1).nullable(),
	targetKeyResultId: z.string().min(1).nullable(),
});

export type HangDeXuat = {
	loai: string;
	objectiveId: string;
	keyResultId: string | null;
	truong: string | null;
	truoc: string | null;
	sau: string | null;
	maVanDe: string | null;
	dich: unknown;
	lyDo: string;
};

export function dongTuHang(hang: HangDeXuat): DongDeXuat {
	const dich =
		hang.dich === null
			? { targetObjectiveId: null, targetKeyResultId: null }
			: dichDeXuat.parse(hang.dich);
	return dongDeXuat.parse({
		loai: hang.loai,
		objectiveId: hang.objectiveId,
		keyResultId: hang.keyResultId,
		truong: hang.truong,
		truoc: hang.truoc,
		sau: hang.sau,
		maVanDe: hang.maVanDe,
		...dich,
		lyDo: hang.lyDo,
	});
}

export const nopDeXuat = z.object({
	dong: z.array(dongDeXuat).max(TRO_LY_OKR_TRAN.soDongDeXuat),
});

export type NopDeXuat = z.infer<typeof nopDeXuat>;

export const cauTomTat = z.object({
	vanBan: z.string().trim().min(5).max(TRO_LY_OKR_TRAN.chu.cauTomTat),
	nguon: z.array(z.string().min(1)).min(1).max(TRO_LY_OKR_TRAN.soNguonMoiCau),
});

export const nopTomTat = z.object({
	cau: z.array(cauTomTat).max(TRO_LY_OKR_TRAN.soCauTomTat),
});

export const MA_LOI_TRO_LY = [
	"thieu-du-lieu",
	"khuon-hong",
	"sai-viec",
	"het-han-muc",
	"tu-choi",
] as const;

export const ketQuaTroLy = z.object({
	trangThai: z.enum(["da-nop", "khong-lam-duoc"]),
	maLoi: z.enum(MA_LOI_TRO_LY).nullable(),
});

export type KetQuaTroLy = z.infer<typeof ketQuaTroLy>;
