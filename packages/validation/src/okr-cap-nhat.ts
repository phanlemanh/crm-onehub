import { z } from "zod";
import { type KieuKr, soKr } from "./okr-kr";

export const MUC_TU_TIN = ["cao", "vua", "thap"] as const;
export type MucTuTin = (typeof MUC_TU_TIN)[number];
export const LOI_VAO = ["nhac", "viec-cua-toi", "tab", "sheet"] as const;
export type LoiVao = (typeof LOI_VAO)[number];
export const KENH_CAP_NHAT = ["web"] as const;
export const GHI_CHU_TOI_DA = 200;
const ma = z.string().trim().min(1).max(120);

export const mucCapNhat = z
	.object({
		keyResultId: ma,
		value: soKr,
		confidence: z.enum(MUC_TU_TIN),
		note: z.string().trim().max(GHI_CHU_TOI_DA),
	})
	.strict();
export const moCapNhatInput = z.object({ entry: z.enum(LOI_VAO) }).strict();
export const guiCapNhatInput = z
	.object({ sessionId: ma, items: z.array(mucCapNhat).min(1).max(50) })
	.strict();
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
