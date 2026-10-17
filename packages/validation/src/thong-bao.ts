import { z } from "zod";
import { homNayVN } from "./ngay-vn";

const GIAY_MS = 1000;
const NGAY_MS = 24 * 60 * 60 * GIAY_MS;

export const THONG_BAO = {
	soTrenChuong: 20,
	moiTrang: 30,
	hoiLaiMs: 60 * GIAY_MS,
	giuNgay: 90,
	tranSo: 99,
	nguon: { nhacBuoiSang: "nhac-buoi-sang" },
	doiChieu: { tranGiaoDichMs: 10 * 60 * GIAY_MS },
	loi: { khongCo: "Không có thông báo này." },
} as const;

export const LOAI_THONG_BAO = [
	"okr-cap-nhat",
	"okr-cho-duyet",
	"okr-tra-lai",
	"okr-hoi-y-gop",
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
	"goi-y-ke-hoach",
	"viec-qua-han",
	"viec-sap-han",
	"viec-cho-danh-gia",
	"okr-kr-im",
	"okr-duoc-giao",
	"okr-nhac-ten",
	"okr-ghi-nhan",
	"okr-hoi-y-cong-bo",
	"okr-theo-doi",
	"tai-lieu-cho-duyet",
	"okr-tom-tat",
	"ai-tran",
	"ai-doi-soat-lech",
] as const;

export type LoaiThongBao = (typeof LOAI_THONG_BAO)[number];

const ma = z.string().min(1);

const keHoach = <
	L extends "buoc-qua-han" | "buoc-sap-han" | "ke-hoach-im" | "moc-ngay",
>(
	loai: L,
) =>
	z.object({
		loai: z.literal(loai),
		planId: ma,
		stepId: ma.optional(),
		companyName: z.string(),
		nhan: z.string(),
		goiY: z.string(),
		han: z.string().optional(),
		soNgay: z.number().optional(),
		soBuocXong: z.number().optional(),
		soBuocTong: z.number().optional(),
		targetDays: z.number().optional(),
	});

const viec = <L extends "viec-qua-han" | "viec-sap-han" | "viec-cho-danh-gia">(
	loai: L,
) =>
	z.object({
		loai: z.literal(loai),
		viecId: ma,
		tieuDe: z.string(),
		han: z.string().optional(),
		soNgay: z.number().optional(),
		banGhi: z.string().nullable(),
	});

export const noiDungThongBao = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("okr-cap-nhat"),
		krIds: z.array(ma).min(1),
		nhan: z.string(),
		soKr: z.number(),
	}),
	z.object({
		loai: z.literal("okr-cho-duyet"),
		objectiveId: ma,
		nhan: z.string(),
		nguoiGui: z.string().nullable(),
	}),
	z.object({
		loai: z.literal("okr-tra-lai"),
		objectiveId: ma,
		nhan: z.string(),
		nguoiTraLai: z.string(),
		lyDo: z.string(),
	}),
	z.object({
		loai: z.literal("okr-hoi-y-gop"),
		hoiYId: ma,
		cycleId: ma,
		nhan: z.string(),
		hanLuc: z.iso.datetime(),
	}),
	keHoach("buoc-qua-han"),
	keHoach("buoc-sap-han"),
	keHoach("ke-hoach-im"),
	keHoach("moc-ngay"),
	viec("viec-qua-han"),
	viec("viec-sap-han"),
	viec("viec-cho-danh-gia"),
	z.object({
		loai: z.literal("okr-kr-im"),
		keyResultId: ma,
		objectiveId: ma,
		nhan: z.string(),
		soNgay: z.number(),
		chuTen: z.string().nullable(),
	}),
	z.object({
		loai: z.literal("okr-duoc-giao"),
		objectiveId: ma,
		keyResultId: ma.optional(),
		nhan: z.string(),
	}),
	z.object({
		loai: z.literal("okr-nhac-ten"),
		commentId: ma,
		objectiveId: ma,
		nhan: z.string(),
		nguoiTen: z.string(),
	}),
	z.object({
		loai: z.literal("okr-ghi-nhan"),
		ghiNhanId: ma,
		objectiveId: ma,
		nhan: z.string(),
		nguoiGui: z.string(),
	}),
	z.object({
		loai: z.literal("okr-hoi-y-cong-bo"),
		hoiYId: ma,
		cycleId: ma,
		nhan: z.string(),
	}),
	z.object({
		loai: z.literal("okr-theo-doi"),
		objectiveId: ma,
		nhan: z.string(),
		capNhat: z.number(),
		binhLuan: z.number(),
	}),
	z.object({
		loai: z.literal("tai-lieu-cho-duyet"),
		so: z.number().int().positive(),
	}),
	z.object({
		loai: z.literal("goi-y-ke-hoach"),
		goiYId: ma,
		dealId: ma,
		dealName: z.string(),
		companyName: z.string(),
	}),
	z.object({
		loai: z.literal("okr-tom-tat"),
		tomTatId: ma,
		departmentId: ma,
		cycleId: ma,
		phongTen: z.string(),
		krDangBan: z.array(ma),
		soKrDangBan: z.number().int().nonnegative(),
	}),
	z.object({
		loai: z.literal("ai-tran"),
		thang: z.string(),
		muc: z.union([z.literal(80), z.literal(100)]),
		chiUsd: z.number(),
		tranUsd: z.number(),
	}),
	z.object({
		loai: z.literal("ai-doi-soat-lech"),
		thang: z.string(),
		soSoUsd: z.number(),
		soGatewayUsd: z.number(),
		lechPhanTram: z.number(),
	}),
]);

export type NoiDungThongBao = z.infer<typeof noiDungThongBao>;

export function parseNoiDungThongBao(value: unknown): NoiDungThongBao {
	const kq = noiDungThongBao.safeParse(value);
	if (!kq.success) {
		throw new Error(
			`noiDung thong bao sai khuon: ${kq.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`,
		);
	}
	return kq.data;
}

function thuHaiVN(now: Date): string {
	const ngay = homNayVN(now);
	const goc = Date.parse(`${ngay}T00:00:00Z`);
	const lui = (new Date(goc).getUTCDay() + 6) % 7;
	return new Date(goc - lui * NGAY_MS).toISOString().slice(0, 10);
}

export function khoaThongBao(nd: NoiDungThongBao, now: Date): string {
	switch (nd.loai) {
		case "viec-qua-han":
		case "viec-sap-han":
		case "viec-cho-danh-gia":
			return `${nd.loai}:${nd.viecId}`;
		case "buoc-qua-han":
		case "buoc-sap-han":
			return `${nd.loai}:${nd.planId}:${nd.stepId ?? ""}`;
		case "ke-hoach-im":
			return `${nd.loai}:${nd.planId}`;
		case "moc-ngay":
			return `${nd.loai}:${nd.planId}:${nd.soNgay ?? ""}`;
		case "okr-cap-nhat":
			return `${nd.loai}:${thuHaiVN(now)}`;
		case "okr-kr-im":
			return `${nd.loai}:${nd.keyResultId}`;
		case "okr-duoc-giao":
			return `${nd.loai}:${nd.objectiveId}:${nd.keyResultId ?? ""}`;
		case "okr-nhac-ten":
			return `${nd.loai}:${nd.commentId}`;
		case "okr-ghi-nhan":
			return `${nd.loai}:${nd.ghiNhanId}`;
		case "okr-theo-doi":
		case "okr-cho-duyet":
		case "okr-tra-lai":
			return `${nd.loai}:${nd.objectiveId}`;
		case "okr-hoi-y-gop":
		case "okr-hoi-y-cong-bo":
			return `${nd.loai}:${nd.hoiYId}`;
		case "tai-lieu-cho-duyet":
			return nd.loai;
		case "goi-y-ke-hoach":
			return `${nd.loai}:${nd.goiYId}`;
		case "okr-tom-tat":
			return `${nd.loai}:${nd.tomTatId}`;
		case "ai-tran":
			return `${nd.loai}:${nd.thang}:${nd.muc}`;
		case "ai-doi-soat-lech":
			return `${nd.loai}:${nd.thang}`;
	}
}

export const moThongBaoInput = z.object({ id: z.string().min(1) });

export const danhSachThongBaoInput = z.object({
	chiChuaDoc: z.boolean(),
	cursor: z.string().min(1).optional(),
});
