import {
	TRANG_THAI_HOI_Y,
	type TrangThaiHoiY,
	trangThaiHoiY,
} from "@crm/db/okr-hoi-y-trang-thai";
import { z } from "zod";
import { mucTieuInput } from "./okr-muc-tieu";

function tranWhyNow(): number {
	const max = mucTieuInput.shape.whyNow.maxLength;
	if (max === null)
		throw new Error(
			"Khuôn «vì sao lúc này» của mục tiêu phải khai độ dài tối đa.",
		);
	return max;
}

const TRAN_WHY_NOW = tranWhyNow();

export const OKR_HOI_Y = {
	yMoiNguoi: 3,
	soLieu: {
		min: 1,
		max: 5,
		nhan: { min: 2, max: 60 },
		giaTri: { min: 1, max: 40 },
		ghiChu: { max: 120 },
	},
	cauHoi: { min: 10, max: 300 },
	loiMo: { max: 1000 },
	noiDung: { min: 10, max: 300 },
	viSao: { max: 500 },
	doBangGi: { max: 200 },
	banTruoc: {
		min: 3,
		max: 5,
		cau: { min: 10, max: 200 },
		motTrongHai:
			"Viết các câu viết trước, hoặc khai không viết trước — chỉ một trong hai.",
	},
	gan: {
		motTrongHai:
			"Gắn ý vào một chủ đề, hoặc đánh dấu ý lạ — chỉ một trong hai.",
		yLaMotY: "Ý lạ chỉ đánh dấu đúng một ý mỗi lần.",
	},
	ketLuan: {
		canCauMucTieu: "Chủ đề chọn cần câu mục tiêu hợp với khuôn tên mục tiêu.",
		lyDoChonMax: TRAN_WHY_NOW,
		lyDoChonQuaDai: `Chủ đề chọn: lý do tối đa ${TRAN_WHY_NOW} ký tự, vì thành «vì sao lúc này» của mục tiêu.`,
	},
	tenChuDe: { min: 2, max: 120 },
	maToiDa: 120,
	lyDo: { min: 10, max: 1000 },
	hanGio: { min: 24, max: 168 },
	dongNgay: {
		motTrongHai: "Đóng ngay lấy giờ của máy chủ — không gửi kèm một hạn khác.",
	},
	trich: 2,
	hienTruoc: 10,
	hieuNgay: 7,
	ganToiDa: 50,
	doPhu: {
		idGoc: "goc",
		idChuaXep: "chua-xep",
		nhanChuaXep: "Chưa xếp phòng ban",
	},
} as const;

export { TRANG_THAI_HOI_Y, type TrangThaiHoiY, trangThaiHoiY };
export const trangThaiHoiYKhuon = z.enum(TRANG_THAI_HOI_Y);

export const LY_DO_KHOA_Y = ["chua-niem-phong", "het-quyen-chon"] as const;
export type LyDoKhoaY = (typeof LY_DO_KHOA_Y)[number];
export const lyDoKhoaYKhuon = z.enum(LY_DO_KHOA_Y);

export const LOAI_CHU_DE = ["chu-de", "y-la"] as const;
export type LoaiChuDe = (typeof LOAI_CHU_DE)[number];
export const loaiChuDe = z.enum(LOAI_CHU_DE);

export const KET_LUAN = ["chon", "de-sau", "khong-lam", "da-co"] as const;
export type KetLuan = (typeof KET_LUAN)[number];
export const ketLuanChuDe = z.enum(KET_LUAN);

export const KET_LUAN_CHON = "chon" satisfies KetLuan;

export const NOI_BAN_TRUOC = [
	"cau-1",
	"cau-2",
	"cau-3",
	"cau-4",
	"cau-5",
	"moi",
] as const;
export type NoiBanTruoc = (typeof NOI_BAN_TRUOC)[number];
export const noiBanTruoc = z.enum(NOI_BAN_TRUOC);

export const NOI_MOI = "moi" satisfies NoiBanTruoc;

const NOI_CAU: readonly NoiBanTruoc[] = NOI_BAN_TRUOC.filter(
	(n) => n !== NOI_MOI,
);

export function soCauCuaNoi(noi: NoiBanTruoc): number | null {
	const i = NOI_CAU.indexOf(noi);
	return i < 0 ? null : i + 1;
}

export function noiTuSoCau(soCau: number): NoiBanTruoc | null {
	return NOI_CAU[soCau - 1] ?? null;
}

const ma = z.string().trim().min(1).max(OKR_HOI_Y.maToiDa);

function chu(tran: { min?: number; max: number }) {
	return z
		.string()
		.trim()
		.min(tran.min ?? 0)
		.max(tran.max);
}

export const dongSoLieuHoiY = z.object({
	nhan: chu(OKR_HOI_Y.soLieu.nhan),
	giaTri: chu(OKR_HOI_Y.soLieu.giaTri),
	ghiChu: chu(OKR_HOI_Y.soLieu.ghiChu),
});
export type DongSoLieuHoiY = z.infer<typeof dongSoLieuHoiY>;

export const soLieuHoiY = z
	.array(dongSoLieuHoiY)
	.min(OKR_HOI_Y.soLieu.min)
	.max(OKR_HOI_Y.soLieu.max);
export type SoLieuHoiY = z.infer<typeof soLieuHoiY>;

export function parseSoLieuHoiY(value: unknown): SoLieuHoiY {
	const r = soLieuHoiY.safeParse(value);
	if (!r.success) {
		const duongDan = r.error.issues
			.map((i) => i.path.join(".") || "(gốc)")
			.join(", ");
		throw new Error(`Con số của lần lấy ý kiến không đọc được: ${duongDan}`);
	}
	return r.data;
}

const cauHoi = chu(OKR_HOI_Y.cauHoi);
const loiMo = chu(OKR_HOI_Y.loiMo);
const hanLuc = z.iso.datetime({ offset: true });
const noiDung = chu(OKR_HOI_Y.noiDung);
const viSao = chu(OKR_HOI_Y.viSao);
const doBangGi = chu(OKR_HOI_Y.doBangGi);
const tenChuDe = chu(OKR_HOI_Y.tenChuDe);
const lyDo = chu(OKR_HOI_Y.lyDo);
const cauBanTruoc = chu(OKR_HOI_Y.banTruoc.cau);

function tranCauMucTieu(): number {
	const max = mucTieuInput.shape.title.maxLength;
	if (max === null)
		throw new Error("Khuôn tên mục tiêu phải khai độ dài tối đa.");
	return max;
}

const cauMucTieu = z.string().trim().max(tranCauMucTieu());

export const moHoiYInput = z.object({
	cycleId: ma,
	cauHoi,
	loiMo,
	soLieu: soLieuHoiY,
	hanLuc,
	nguoiChonUserId: ma,
});
export type MoHoiYInput = z.infer<typeof moHoiYInput>;

export const suaHoiYInput = z
	.object({
		hoiYId: ma,
		cauHoi: cauHoi.optional(),
		loiMo: loiMo.optional(),
		soLieu: soLieuHoiY.optional(),
		hanLuc: hanLuc.optional(),
		dongNgay: z.literal(true).optional(),
		nguoiChonUserId: ma.optional(),
	})
	.refine((v) => v.dongNgay === undefined || v.hanLuc === undefined, {
		message: OKR_HOI_Y.dongNgay.motTrongHai,
		path: ["dongNgay"],
	});
export type SuaHoiYInput = z.infer<typeof suaHoiYInput>;

export const gopYInput = z.object({ hoiYId: ma, noiDung, viSao, doBangGi });
export type GopYInput = z.infer<typeof gopYInput>;

export const suaYInput = z.object({ yId: ma, noiDung, viSao, doBangGi });
export type SuaYInput = z.infer<typeof suaYInput>;

export const yIdInput = z.object({ yId: ma });
export type YIdInput = z.infer<typeof yIdInput>;

export const dongYInput = z.object({ yId: ma, bat: z.boolean() });
export type DongYInput = z.infer<typeof dongYInput>;

export const niemPhongInput = z
	.object({
		hoiYId: ma,
		cau: z
			.array(cauBanTruoc)
			.min(OKR_HOI_Y.banTruoc.min)
			.max(OKR_HOI_Y.banTruoc.max)
			.optional(),
		boQua: z.literal(true).optional(),
	})
	.strict()
	.refine((v) => (v.cau === undefined) !== (v.boQua === undefined), {
		message: OKR_HOI_Y.banTruoc.motTrongHai,
	});
export type NiemPhongInput = z.infer<typeof niemPhongInput>;

export const taoChuDeInput = z.object({ hoiYId: ma, ten: tenChuDe });
export type TaoChuDeInput = z.infer<typeof taoChuDeInput>;

export const suaChuDeInput = z.object({ chuDeId: ma, ten: tenChuDe });
export type SuaChuDeInput = z.infer<typeof suaChuDeInput>;

export const chuDeIdInput = z.object({ chuDeId: ma });
export type ChuDeIdInput = z.infer<typeof chuDeIdInput>;

export const ganYInput = z
	.object({
		yIds: z.array(ma).min(1).max(OKR_HOI_Y.ganToiDa),
		chuDeId: ma.optional(),
		yLa: z.literal(true).optional(),
	})
	.strict()
	.refine((v) => (v.chuDeId === undefined) !== (v.yLa === undefined), {
		message: OKR_HOI_Y.gan.motTrongHai,
	})
	.refine((v) => v.yLa === undefined || v.yIds.length === 1, {
		message: OKR_HOI_Y.gan.yLaMotY,
	});
export type GanYInput = z.infer<typeof ganYInput>;

export const ketLuanInput = z
	.object({
		chuDeId: ma,
		ketLuan: ketLuanChuDe,
		lyDo,
		cauMucTieu,
		noiBanTruoc: noiBanTruoc.nullable(),
	})
	.refine(
		(v) =>
			v.ketLuan !== KET_LUAN_CHON ||
			mucTieuInput.shape.title.safeParse(v.cauMucTieu).success,
		{ message: OKR_HOI_Y.ketLuan.canCauMucTieu, path: ["cauMucTieu"] },
	)
	.refine(
		(v) =>
			v.ketLuan !== KET_LUAN_CHON ||
			v.lyDo.length <= OKR_HOI_Y.ketLuan.lyDoChonMax,
		{ message: OKR_HOI_Y.ketLuan.lyDoChonQuaDai, path: ["lyDo"] },
	);
export type KetLuanInput = z.infer<typeof ketLuanInput>;

export const hoiYIdInput = z.object({ hoiYId: ma });
export type HoiYIdInput = z.infer<typeof hoiYIdInput>;

export const cycleIdInput = z.object({ cycleId: ma });
export type CycleIdInput = z.infer<typeof cycleIdInput>;

function fnv1a(s: string): number {
	let h = 0x811c9dc5;
	for (const c of s) {
		h ^= c.codePointAt(0) ?? 0;
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}

export function thuTuXao(ids: string[], hat: string): string[] {
	return ids
		.map((id) => ({ id, bam: fnv1a(`${hat}:${id}`) }))
		.sort((a, b) =>
			a.bam !== b.bam ? a.bam - b.bam : a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
		)
		.map((x) => x.id);
}

export function chuanCau(s: string): string {
	return s.replace(/\s+/g, " ").trim().toLocaleLowerCase("vi");
}

export const SO_PHAN_BAN_TRUOC = ["giu", "doi", "bo"] as const;
export type SoPhanBanTruoc = (typeof SO_PHAN_BAN_TRUOC)[number];

export type KetQuaBanTruoc = {
	cau: SoPhanBanTruoc[];
	doi: number;
	them: number;
	boQua: boolean;
};

export function ketQuaBanTruoc(
	ban: { cau: string[]; boQua: boolean },
	chon: { noiBanTruoc: string; cauMucTieu: string }[],
): KetQuaBanTruoc {
	const them = chon.filter((c) => c.noiBanTruoc === NOI_MOI).length;
	if (ban.boQua) {
		return { cau: [], doi: 0, them: chon.length, boQua: true };
	}
	const cau = ban.cau.map((chu, i): SoPhanBanTruoc => {
		const noi = chon.filter((c) => c.noiBanTruoc === noiTuSoCau(i + 1));
		if (noi.length === 0) return "bo";
		const chuan = chuanCau(chu);
		return noi.some((c) => chuanCau(c.cauMucTieu) === chuan) ? "giu" : "doi";
	});
	return {
		cau,
		doi: cau.filter((c) => c === "doi").length,
		them,
		boQua: false,
	};
}
