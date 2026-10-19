import { MUC_TU_TIN, type MucTuTin } from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";
import { bangChungVao } from "./okr-canh-kr";
import { type KieuKr, soKr } from "./okr-kr";

export { MUC_TU_TIN, type MucTuTin };
export const LOI_VAO = [
	"nhac",
	"viec-cua-toi",
	"tab",
	"sheet",
	"cua-toi",
] as const;
export type LoiVao = (typeof LOI_VAO)[number];
export const KENH_CAP_NHAT = ["web"] as const;
export const GHI_CHU_TOI_DA = 200;
const ma = z.string().trim().min(1).max(120);

export const LOI_KHUON_CAP_NHAT = {
	tuTin: "Chọn mức tự tin cho từng KR: cao, vừa hoặc thấp.",
	giaTri: "Giá trị của KR phải là một số.",
	ghiChu: `Ghi chú tối đa ${GHI_CHU_TOI_DA} ký tự.`,
	trungKr: "Mỗi KR chỉ gửi một lần trong một lần cập nhật.",
} as const;

export const mucCapNhat = z
	.object({
		keyResultId: ma,
		value: z.number({ error: LOI_KHUON_CAP_NHAT.giaTri }).pipe(soKr),
		confidence: z.enum(MUC_TU_TIN, { error: LOI_KHUON_CAP_NHAT.tuTin }),
		note: z
			.string()
			.trim()
			.max(GHI_CHU_TOI_DA, { error: LOI_KHUON_CAP_NHAT.ghiChu }),
		bangChung: bangChungVao.optional(),
	})
	.strict();
export const moCapNhatInput = z.object({ entry: z.enum(LOI_VAO) }).strict();
export type MoCapNhatInput = z.infer<typeof moCapNhatInput>;
export const guiCapNhatInput = z
	.object({ sessionId: ma, items: z.array(mucCapNhat).min(1).max(50) })
	.strict()
	.refine(
		(v) => new Set(v.items.map((m) => m.keyResultId)).size === v.items.length,
		{ error: LOI_KHUON_CAP_NHAT.trungKr, path: ["items"] },
	);
export type GuiCapNhatInput = z.infer<typeof guiCapNhatInput>;

export type LoiGiaTri = "moc-chi-0-1" | "phan-tram-ngoai-0-100";
export function kiemGiaTriTheoKieu(
	kind: KieuKr,
	value: number,
): LoiGiaTri | null {
	if (kind === "moc" && value !== 0 && value !== 1) return "moc-chi-0-1";
	if (kind === "phan-tram" && (value < 0 || value > 100))
		return "phan-tram-ngoai-0-100";
	return null;
}
