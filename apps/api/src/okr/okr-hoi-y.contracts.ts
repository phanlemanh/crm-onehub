import { soLieuHoiY, trangThaiHoiYKhuon } from "@crm/validation/okr-hoi-y";
import { z } from "zod";
import { MA_THIEU } from "./hoi-y";

export const hoiYGhiOutput = z.object({ id: z.string() });
export type HoiYGhiOutput = z.infer<typeof hoiYGhiOutput>;

const yChieuAn = z.object({
	id: z.string(),
	noiDung: z.string(),
	viSao: z.string(),
	doBangGi: z.string(),
	chuDeId: z.string().nullable(),
	daDongY: z.boolean(),
});

const yChieuDayDu = yChieuAn.extend({
	tacGia: z.object({ id: z.string(), ten: z.string() }),
	soDongY: z.number().int(),
	createdAt: z.string(),
});

export const yChieuOutput = z.union([yChieuDayDu, yChieuAn]);
export type YChieuOutput = z.infer<typeof yChieuOutput>;

const yCuaToi = z.object({
	id: z.string(),
	noiDung: z.string(),
	viSao: z.string(),
	doBangGi: z.string(),
	createdAt: z.string(),
});

const banTruocChieu = z.object({
	cau: z.array(z.string()),
	boQua: z.boolean(),
	vietBoi: z.string(),
});

export const hoiYChiTiet = z.object({
	hoiY: z.object({
		id: z.string(),
		cauHoi: z.string(),
		loiMo: z.string(),
		soLieu: soLieuHoiY,
		hanLuc: z.string(),
		createdAt: z.string(),
		congBoLuc: z.string().nullable(),
	}),
	trangThai: trangThaiHoiYKhuon,
	nguoiChon: z.object({ id: z.string(), name: z.string() }),
	cuaToi: z.object({ y: z.array(yCuaToi), daHieu: z.boolean() }),
	y: z.object({
		khoa: z.boolean(),
		lyDoKhoa: z.string(),
		ds: z.array(yChieuOutput),
	}),
	chuDe: z.null(),
	banTruoc: banTruocChieu.nullable(),
	ketQua: z.null(),
	quyen: z.object({
		moDuoc: z.boolean(),
		gopDuoc: z.boolean(),
		gomDuoc: z.boolean(),
		chonDuoc: z.boolean(),
		congBoDuoc: z.boolean(),
		lyDoChuaCongBo: z.array(
			z.object({ ma: z.enum(MA_THIEU), chuDeId: z.string().nullable() }),
		),
	}),
});
export type HoiYOutput = z.infer<typeof hoiYChiTiet>;

export const hoiYDocOutput = hoiYChiTiet.nullable();

export const hoiYNhanOutput = z.object({
	coHoiY: z.boolean(),
	trangThai: trangThaiHoiYKhuon.nullable(),
	canGop: z.boolean(),
	soChuDeChuaKetLuan: z.number().int().nullable(),
});
export type HoiYNhanOutput = z.infer<typeof hoiYNhanOutput>;
