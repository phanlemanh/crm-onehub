import {
	AI_PHAM_VI,
	KET_QUA_KIEM_SAN_SANG,
	LY_DO_KHONG_SAN_SANG,
	MA_LOAI_DE_XUAT,
	MINUTE_MS,
	NAC_TRO_LY,
	NGUON_KHOA,
	TRANG_THAI_DE_XUAT,
	TRO_LY_OKR_KHOA,
	TRO_LY_OKR_TRAN,
	TRUONG_VIET_LAI,
	VIEC_TRO_LY,
} from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";
import { ngayLich } from "./okr-chu-ky";
import {
	khoaNhap,
	krNhap,
	LOAI_MUC_TIEU_NHAP,
	mucTieuNhap,
} from "./okr-cuoc-soan";
import { chuanHoa } from "./okr-kiem";
import { KIEU_KR } from "./okr-kr";

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
	MINUTE_MS,
	NAC_TRO_LY,
	type NacTroLy,
	NGUON_KHOA,
	type NguonKhoaDb,
	nacCuaDonVi,
	nguonCuaKetQua,
	phamViCuaViec,
	TRANG_THAI_DE_XUAT,
	TRO_LY_OKR_KHOA,
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
		nac: z.enum(["an", "bat"]),
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

export const dongGopY = z
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

export type DongGopY = z.infer<typeof dongGopY>;

export const LOAI_DONG_SOAN = [
	"muc-tieu-moi",
	"kr-moi",
	"can-chinh-moi",
] as const;

const goiSoan = { cuocSoanId: z.string().min(1), dich: z.null() };

export const dongMucTieuMoi = mucTieuNhap
	.omit({ kr: true, loai: true })
	.extend({
		loai: z.literal("muc-tieu-moi"),
		loaiMucTieu: z.enum(LOAI_MUC_TIEU_NHAP),
		canChinhId: z.string().min(1).nullable(),
		...goiSoan,
	});

export const dongKrMoi = krNhap.omit({ dich: true }).extend({
	loai: z.literal("kr-moi"),
	chaKhoa: khoaNhap,
	khoiDiemGoiY: z.number().finite().nullable(),
	...goiSoan,
});

export const dongCanChinhMoi = z.object({
	loai: z.literal("can-chinh-moi"),
	khoa: khoaNhap,
	chaKhoa: khoaNhap,
	targetObjectiveId: z.string().min(1).nullable(),
	targetKeyResultId: z.string().min(1).nullable(),
	viSao: z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.viSao),
	...goiSoan,
});

export const dongSoan = z
	.discriminatedUnion("loai", [dongMucTieuMoi, dongKrMoi, dongCanChinhMoi])
	.superRefine((d, ctx) => {
		if (
			d.loai === "can-chinh-moi" &&
			Boolean(d.targetObjectiveId) === Boolean(d.targetKeyResultId)
		)
			ctx.addIssue({
				code: "custom",
				message: "can-chinh-moi can dung mot dich",
			});
	});

export type DongSoan = z.infer<typeof dongSoan>;

export const dongDeXuat = z.union([dongGopY, dongSoan]);

export type DongDeXuat = z.infer<typeof dongDeXuat>;

export function laDongSoan(dong: DongDeXuat): dong is DongSoan {
	return (LOAI_DONG_SOAN as readonly string[]).includes(dong.loai);
}

export const noiDungSoan = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("muc-tieu-moi"),
		khoa: khoaNhap,
		viSaoLucNay: z.string(),
		loaiMucTieu: z.enum(LOAI_MUC_TIEU_NHAP),
		canChinhId: z.string().min(1).nullable(),
		viSao: z.string(),
	}),
	z.object({
		loai: z.literal("kr-moi"),
		khoa: khoaNhap,
		chaKhoa: khoaNhap,
		kieu: z.enum(KIEU_KR),
		donVi: z.string(),
		khoiDiemGoiY: z.number().finite().nullable(),
		viSao: z.string(),
	}),
	z.object({
		loai: z.literal("can-chinh-moi"),
		khoa: khoaNhap,
		chaKhoa: khoaNhap,
		targetObjectiveId: z.string().min(1).nullable(),
		targetKeyResultId: z.string().min(1).nullable(),
		viSao: z.string(),
	}),
]);

export type NoiDungSoan = z.infer<typeof noiDungSoan>;

export type HangSoan = {
	loai: string;
	cuocSoanId: string | null;
	sau: string | null;
	lyDo: string;
	noiDung: unknown;
};

export type HangSoanGhi = {
	taskId: string;
	objectiveId: string;
	keyResultId: null;
	loai: DongSoan["loai"];
	truong: null;
	truoc: null;
	sau: string | null;
	sauChuan: string | null;
	maVanDe: null;
	dich: null;
	lyDo: string;
	cuocSoanId: string;
	noiDung: NoiDungSoan;
};

export const HANG_SOAN = { objectiveId: "" } as const;

export function dongSoanTuHang(hang: HangSoan): DongSoan {
	const nd = noiDungSoan.parse(hang.noiDung);
	if (nd.loai !== hang.loai || hang.cuocSoanId === null)
		throw new Error(`hang soan lech: ${hang.loai}`);
	return dongSoan.parse({
		...nd,
		cuocSoanId: hang.cuocSoanId,
		ten: hang.sau,
		dich: null,
	});
}

export function hangTuDongSoan(dong: DongSoan, sessionId: string): HangSoanGhi {
	const ten = dong.loai === "can-chinh-moi" ? null : dong.ten;
	const noiDung: NoiDungSoan =
		dong.loai === "muc-tieu-moi"
			? {
					loai: dong.loai,
					khoa: dong.khoa,
					viSaoLucNay: dong.viSaoLucNay,
					loaiMucTieu: dong.loaiMucTieu,
					canChinhId: dong.canChinhId,
					viSao: dong.viSao,
				}
			: dong.loai === "kr-moi"
				? {
						loai: dong.loai,
						khoa: dong.khoa,
						chaKhoa: dong.chaKhoa,
						kieu: dong.kieu,
						donVi: dong.donVi,
						khoiDiemGoiY: dong.khoiDiemGoiY,
						viSao: dong.viSao,
					}
				: {
						loai: dong.loai,
						khoa: dong.khoa,
						chaKhoa: dong.chaKhoa,
						targetObjectiveId: dong.targetObjectiveId,
						targetKeyResultId: dong.targetKeyResultId,
						viSao: dong.viSao,
					};
	return {
		taskId: sessionId,
		objectiveId: HANG_SOAN.objectiveId,
		keyResultId: null,
		loai: dong.loai,
		truong: null,
		truoc: null,
		sau: ten,
		sauChuan: ten === null ? null : chuanHoa(ten),
		maVanDe: null,
		dich: null,
		lyDo: dong.viSao,
		cuocSoanId: dong.cuocSoanId,
		noiDung,
	};
}

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

export function dongTuHang(hang: HangDeXuat): DongGopY {
	const dich =
		hang.dich === null
			? { targetObjectiveId: null, targetKeyResultId: null }
			: dichDeXuat.parse(hang.dich);
	return dongGopY.parse({
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
	dong: z.array(dongGopY).max(TRO_LY_OKR_TRAN.soDongDeXuat),
});

export type NopDeXuat = z.infer<typeof nopDeXuat>;

export const cauTomTat = z.object({
	vanBan: z.string().trim().min(5).max(TRO_LY_OKR_TRAN.chu.cauTomTat),
	nguon: z.array(z.string().min(1)).min(1).max(TRO_LY_OKR_TRAN.soNguonMoiCau),
});

export type CauTomTat = z.infer<typeof cauTomTat>;

export const nopTomTat = z.object({
	cau: z.array(cauTomTat).max(TRO_LY_OKR_TRAN.soCauTomTat),
});

export type NopTomTat = z.infer<typeof nopTomTat>;

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

export const LY_DO_KHONG_QUYET = [
	"muc-tieu-da-bo",
	"dang-cho-duyet",
	"so-sai-kieu",
	"can-chinh-gioi-han",
	"can-chinh-chinh-no",
	"can-chinh-cung-cap",
	"can-chinh-chua-cong-bo",
	"can-chinh-khac-chu-ky",
	"can-chinh-da-gan",
] as const;

export type LyDoKhongQuyet = (typeof LY_DO_KHONG_QUYET)[number];

export const lyDoKhongQuyet = z.enum(LY_DO_KHONG_QUYET);

export function laLyDoKhongQuyet(lyDo: string): lyDo is LyDoKhongQuyet {
	return lyDoKhongQuyet.safeParse(lyDo).success;
}
