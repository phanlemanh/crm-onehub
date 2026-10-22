import { z } from "zod";

export const mucBoTri = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("standard"),
		key: z.string().min(1),
		hidden: z.boolean(),
		required: z.boolean(),
	}),
	z.object({
		kind: z.literal("custom"),
		id: z.string().min(1),
		key: z.string().min(1),
	}),
]);

export const boTriTruong = z.array(mucBoTri);

export type MucBoTriTruong = z.infer<typeof mucBoTri>;

export type BoTriTruong = z.infer<typeof boTriTruong>;

export const mucSapLai = z.union([
	z.object({ standard: z.string().min(1) }).strict(),
	z.object({ custom: z.string().min(1) }).strict(),
]);

export type MucSapLai = z.infer<typeof mucSapLai>;

export function parseBoTriTruong(value: unknown): BoTriTruong {
	const ket = boTriTruong.safeParse(value);
	if (!ket.success) {
		throw new Error(`Bố trí trường không đọc được: ${ket.error.message}`);
	}
	return ket.data;
}
