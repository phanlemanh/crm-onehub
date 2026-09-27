import { z } from "zod";
import { ngayLich } from "./okr-chu-ky";

export const TRO_LY_OKR_TRAN = {
	chu: {
		tenMucTieu: 200,
		tenKr: 200,
		viSao: 500,
		lyDo: 200,
		cauHoi: 200,
		cauTomTat: 280,
	},
	soDongDeXuat: 8,
	soCauTomTat: 6,
	soNguonMoiCau: 4,
	tranThangMacDinhUsd: 9,
	tranThangToiDaUsd: 20,
} as const;

export const VIEC_TRO_LY = ["de-xuat", "tom-tat-tuan"] as const;

export const viecTroLy = z.enum(VIEC_TRO_LY);

export type ViecTroLy = z.infer<typeof viecTroLy>;

export const AI_PHAM_VI = ["tat", "toan-cong-ty", "danh-sach"] as const;

export const aiPhamVi = z.enum(AI_PHAM_VI);

export type AiPhamVi = z.infer<typeof aiPhamVi>;

export const TRANG_THAI_DE_XUAT = [
	"cho",
	"nhan",
	"sua",
	"bac",
	"het-han",
	"da-sua-theo",
	"bo-qua",
] as const;

export const trangThaiDeXuat = z.enum(TRANG_THAI_DE_XUAT);

export const LY_DO_KHONG_SAN_SANG = [
	"tat",
	"viec-tat",
	"don-vi-chua-bat",
	"het-tran-thang",
	"het-tran-ngay",
	"chua-noi-tac-tu",
	"chua-co-khoa-mo-hinh",
	"het-tran-gateway",
] as const;

export const lyDoKhongSanSang = z.enum(LY_DO_KHONG_SAN_SANG);

export type LyDoKhongSanSang = z.infer<typeof lyDoKhongSanSang>;

export const troLySanSang = z.discriminatedUnion("bat", [
	z.object({ bat: z.literal(true), conLaiUsd: z.number() }),
	z.object({ bat: z.literal(false), lyDo: lyDoKhongSanSang }),
]);

export type TroLySanSang = z.infer<typeof troLySanSang>;

export const KET_QUA_KIEM_SAN_SANG = [
	"san-sang",
	"chua-co-khoa-mo-hinh",
] as const;

export const ketQuaKiemSanSang = z.enum(KET_QUA_KIEM_SAN_SANG);

export const okrTroLyViec = z.discriminatedUnion("viec", [
	z.object({
		viec: z.literal("de-xuat"),
		objectiveId: z.string().min(1),
		keyResultId: z.string().min(1).nullable(),
		nguoiYeuCau: z.string().min(1),
		inputHash: z.string().min(1),
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

const TRUONG_VIET_LAI = ["title", "whyNow", "kr.title"] as const;

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
