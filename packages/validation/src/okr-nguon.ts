import { z } from "zod";
import {
	bacGhiDanh,
	bacKhopChiSo,
	CAU_BAC_GHI_DANH,
	maChiSo,
	phamViChiSo,
} from "./okr-chi-so";
import type { KieuKr } from "./okr-kr";

export const LOAI_NGUON_MAY = ["crm", "api", "bang-tinh"] as const;
export type LoaiNguonMay = (typeof LOAI_NGUON_MAY)[number];

export const KIEU_KHONG_LAY_CRM = [
	"moc",
	"phan-tram",
] as const satisfies readonly KieuKr[];

export function crmHopKieu(kieu: KieuKr): boolean {
	return !KIEU_KHONG_LAY_CRM.some((k) => k === kieu);
}

const URL_SHEET =
	/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{1,200})(?:[/?#].*)?$/;

export function sheetIdTuUrl(url: string): string | null {
	return URL_SHEET.exec(url.trim())?.[1] ?? null;
}

export const oSheet = z
	.string()
	.trim()
	.regex(
		/^(?:[^!]{1,100}!)?[A-Z]{1,3}[1-9]\d{0,6}$/u,
		"Ô phải có dạng A1 hoặc Trang!A1",
	);

const ma = z.string().trim().min(1).max(120);

export const datNguonKrInput = z.discriminatedUnion("loai", [
	z.strictObject({ keyResultId: ma, loai: z.literal("tay") }),
	z
		.strictObject({
			keyResultId: ma,
			loai: z.literal("crm"),
			chiSo: maChiSo,
			phamVi: phamViChiSo,
			bac: bacGhiDanh.optional(),
		})
		.refine(bacKhopChiSo, { message: CAU_BAC_GHI_DANH, path: ["bac"] }),
	z.strictObject({ keyResultId: ma, loai: z.literal("api") }),
	z.strictObject({
		keyResultId: ma,
		loai: z.literal("bang-tinh"),
		url: z
			.string()
			.trim()
			.max(500)
			.refine(
				(u) => sheetIdTuUrl(u) !== null,
				"Đường dẫn phải là một bảng tính Google (docs.google.com/spreadsheets)",
			),
		o: oSheet,
	}),
]);
export type DatNguonKrInput = z.infer<typeof datNguonKrInput>;

export const LY_DO_DOC_SHEET = [
	"chua-chia-se",
	"khong-thay",
	"khong-phai-so",
	"o-trong",
	"google-loi",
	"tat",
	"khong-hop-kieu",
] as const;
export const lyDoDocSheet = z.enum(LY_DO_DOC_SHEET);
export type LyDoDocSheet = z.infer<typeof lyDoDocSheet>;

export const okrNguonDong = z.object({
	loai: z.enum(LOAI_NGUON_MAY),
	chiSo: maChiSo.nullable(),
	phamVi: phamViChiSo.nullable(),
	bac: bacGhiDanh.nullable(),
	sheetId: z.string().nullable(),
	sheetO: z.string().nullable(),
	docLoi: lyDoDocSheet.nullable(),
});
export type OkrNguonDong = z.infer<typeof okrNguonDong>;

export function parseOkrNguon(row: unknown): OkrNguonDong {
	const r = okrNguonDong.safeParse(row);
	if (!r.success)
		throw new Error(`Nguồn KR không đọc được: ${r.error.message}`);
	return r.data;
}

export const okrSoChupDong = z.object({
	nguon: z.enum(LOAI_NGUON_MAY),
	chiSo: maChiSo.nullable(),
	phamVi: phamViChiSo.nullable(),
	bac: bacGhiDanh.nullable(),
});
export type OkrSoChupDong = z.infer<typeof okrSoChupDong>;

export function parseOkrSoChup(row: unknown): OkrSoChupDong {
	const r = okrSoChupDong.safeParse(row);
	if (!r.success)
		throw new Error(`Bản chụp số KR không đọc được: ${r.error.message}`);
	return r.data;
}

export const docSheetPayload = z.strictObject({ keyResultId: ma });
export type DocSheetPayload = z.infer<typeof docSheetPayload>;

export function parseDocSheetPayload(v: unknown): DocSheetPayload {
	const r = docSheetPayload.safeParse(v);
	if (!r.success)
		throw new Error(`Việc okr-doc-sheet không đọc được: ${r.error.message}`);
	return r.data;
}
