import {
	docByteHopDongMau,
	docDapAnThoHopDongMau,
	THU_MUC_HOP_DONG_MAU,
} from "@crm/db/hop-dong-mau";
import { z } from "zod";

export const MA_HOP_DONG_MAU = [
	"HD1",
	"HD2",
	"HD3",
	"HD4",
	"HD5",
	"HD6",
] as const;

export const NHAN_HOP_DONG_MAU = {
	tienToTen: "MAU-",
	sieuDuLieu: "Bản mẫu — không phải hợp đồng thật",
	dongDau: "BẢN MẪU — KHÔNG PHẢI HỢP ĐỒNG THẬT",
} as const;

const ngay = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải dạng YYYY-MM-DD.");

export const dongDapAnHopDongMau = z
	.object({
		ma: z.enum(MA_HOP_DONG_MAU),
		tenTep: z.string().startsWith(NHAN_HOP_DONG_MAU.tienToTen),
		kieu: z.enum(["pdf", "docx"]),
		sha256: z.string().regex(/^[0-9a-f]{64}$/),
		thoaThuan: z.string().min(1),
		coChu: z.boolean(),
		ngayKy: ngay.nullable(),
		ngayHetHan: ngay.nullable(),
		giaTri: z.number().int().positive().nullable(),
		doan: z.object({
			ngayKy: z.string().min(1).optional(),
			ngayHetHan: z.string().min(1).optional(),
			giaTri: z.string().min(1).optional(),
		}),
		suyTu: z.string().min(1).optional(),
	})
	.superRefine((dong, ctx) => {
		for (const khoa of ["ngayKy", "ngayHetHan", "giaTri"] as const) {
			const coDoan = dong.doan[khoa] !== undefined;
			const canDoan = dong.coChu && dong[khoa] !== null;
			if (coDoan !== canDoan) {
				ctx.addIssue({
					code: "custom",
					path: ["doan", khoa],
					message: canDoan
						? `${dong.ma}: thuộc tính ${khoa} có giá trị thì phải có đoạn chữ nguyên văn.`
						: `${dong.ma}: thuộc tính ${khoa} không có đoạn chữ khi giá trị trống hay tệp không có chữ.`,
				});
			}
		}
	});

export const dapAnHopDongMau = z
	.array(dongDapAnHopDongMau)
	.length(MA_HOP_DONG_MAU.length)
	.superRefine((dong, ctx) => {
		const ma = dong.map((d) => d.ma);
		if (new Set(ma).size !== ma.length) {
			ctx.addIssue({ code: "custom", message: `Mã trùng: ${ma.join(", ")}.` });
		}
	});

export type DongDapAnHopDongMau = z.infer<typeof dongDapAnHopDongMau>;
export type DapAnHopDongMau = z.infer<typeof dapAnHopDongMau>;

export function docDapAnHopDongMau(chu: string): DapAnHopDongMau {
	let tho: unknown;
	try {
		tho = JSON.parse(chu);
	} catch (loi) {
		throw new Error(
			`dap-an.json không phải JSON: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
	const kq = dapAnHopDongMau.safeParse(tho);
	if (!kq.success) {
		throw new Error(
			`dap-an.json sai khuôn:\n${kq.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
		);
	}
	return kq.data;
}

export type TepHopDongMau = DongDapAnHopDongMau & { byte: Uint8Array };

export type BoHopDongMau = { thuMuc: string; tep: TepHopDongMau[] };

export function boHopDongMau(
	thuMuc: string = THU_MUC_HOP_DONG_MAU,
): BoHopDongMau {
	const dapAn = docDapAnHopDongMau(docDapAnThoHopDongMau(thuMuc));
	return {
		thuMuc,
		tep: dapAn.map((d) => ({
			...d,
			byte: docByteHopDongMau(d.tenTep, thuMuc),
		})),
	};
}
