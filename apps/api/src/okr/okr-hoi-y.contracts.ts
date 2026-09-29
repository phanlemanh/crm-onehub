import {
	ketLuanChuDe,
	loaiChuDe,
	lyDoKhoaYKhuon,
	noiBanTruoc,
	soLieuHoiY,
	trangThaiHoiYKhuon,
} from "@crm/validation/okr-hoi-y";
import { z } from "zod";
import { MA_THIEU, SO_PHAN_BAN_TRUOC } from "./hoi-y";

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

const chuDeChieu = z.object({
	id: z.string(),
	loai: loaiChuDe,
	ten: z.string(),
	ketLuan: ketLuanChuDe.nullable(),
	lyDo: z.string(),
	cauMucTieu: z.string().nullable(),
	noiBanTruoc: noiBanTruoc.nullable(),
	objectiveId: z.string().nullable(),
	bangChung: z.object({
		soNguoi: z.number().int(),
		soDonVi: z.number().int(),
		soDongY: z.number().int().optional(),
		trich: z.array(z.string()),
	}),
	y: z.array(yChieuOutput),
});

const yCuaToi = z.object({
	id: z.string(),
	noiDung: z.string(),
	viSao: z.string(),
	doBangGi: z.string(),
	createdAt: z.string(),
	chuDe: z.object({ id: z.string(), ten: z.string() }).nullable(),
	ketLuan: ketLuanChuDe.nullable(),
	lyDo: z.string().nullable(),
	objectiveId: z.string().nullable(),
	hanhTrinh: z.object({
		gopLuc: z.string(),
		vaoChuDeLuc: z.string().nullable(),
		ketLuanLuc: z.string().nullable(),
	}),
});

const banTruocChieu = z.object({
	cau: z.array(z.string()),
	boQua: z.boolean(),
	vietBoi: z.string(),
});

const ketQuaChieu = z.object({
	cau: z.array(z.enum(SO_PHAN_BAN_TRUOC)),
	doi: z.number().int(),
	them: z.number().int(),
	boQua: z.boolean(),
	vietBoi: z.string(),
	chon: z.array(
		z.object({
			chuDeId: z.string(),
			ten: z.string(),
			cauMucTieu: z.string(),
			noiBanTruoc,
			objectiveId: z.string().nullable(),
		}),
	),
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
		lyDoKhoa: lyDoKhoaYKhuon.nullable(),
		ds: z.array(yChieuOutput),
	}),
	chuDe: z.array(chuDeChieu).nullable(),
	banTruoc: banTruocChieu.nullable(),
	ketQua: ketQuaChieu.nullable(),
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

export const congBoOutput = z.object({
	mucTieuIds: z.array(z.string()),
	canhBao: z.string().nullable(),
});
export type CongBoOutput = z.infer<typeof congBoOutput>;

export const hieuViSaoOutput = z.object({ ok: z.literal(true) });
export type HieuViSaoOutput = z.infer<typeof hieuViSaoOutput>;

export const hoiYNhanOutput = z.object({
	coHoiY: z.boolean(),
	trangThai: trangThaiHoiYKhuon.nullable(),
	canGop: z.boolean(),
	soChuDeChuaKetLuan: z.number().int().nullable(),
});
export type HoiYNhanOutput = z.infer<typeof hoiYNhanOutput>;
