import { appendFileSync } from "node:fs";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";

export const dongTongKet = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("soan"),
		ca: z.string(),
		cuocSoanId: z.string(),
		usd: z.number(),
		banNhap: z.string(),
		biLoai: z.array(z.object({ khoa: z.string(), maLoai: z.string() })),
	}),
	z.object({
		loai: z.literal("boi-canh"),
		ca: z.string(),
		A: z.string(),
		B: z.string(),
		phiaCoGoi: z.enum(["A", "B"]),
	}),
	z.object({
		loai: z.literal("do-tre"),
		ca: z.string(),
		cuoc: z.number().int(),
		ms: z.array(z.number()),
		usd: z.number(),
	}),
]);

export type DongTongKet = z.infer<typeof dongTongKet>;

export function ghiTongKet(dong: DongTongKet): void {
	const tep = process.env[TRO_LY_OKR_SOAN.danhGia.env.tongKet]?.trim();
	if (tep) appendFileSync(tep, `${JSON.stringify(dongTongKet.parse(dong))}\n`);
}

export function docTongKet(chu: string): DongTongKet[] {
	return chu
		.split("\n")
		.filter((d) => d.trim() !== "")
		.map((d) => dongTongKet.parse(JSON.parse(d)));
}

const tomTatChay = z.object({
	totalEvals: z.number(),
	passed: z.number(),
	failed: z.number(),
	scored: z.number(),
	skipped: z.number(),
	evals: z.array(
		z.object({
			id: z.string(),
			verdict: z.string(),
			assertions: z.array(
				z.object({ name: z.string(), score: z.number(), passed: z.boolean() }),
			),
			error: z.string().optional(),
			skipReason: z.string().optional(),
		}),
	),
});

export type TomTatChay = z.infer<typeof tomTatChay>;

export function docTomTat(chu: string): TomTatChay {
	return tomTatChay.parse(JSON.parse(chu));
}
