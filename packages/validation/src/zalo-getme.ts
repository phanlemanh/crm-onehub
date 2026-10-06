import { z } from "zod";

export const suKienGetMe = z.object({
	noi: z.enum(["dat-bot", "kiem-bot"]),
	lop: z.string().min(1),
	http: z.number().int().nullable(),
	maThan: z.number().int().nullable(),
	ketLuan: z.enum(["tam-loi", "token-sai"]),
	vanTay: z.string().regex(/^[0-9a-f]{12}$/),
});

export type SuKienGetMe = z.infer<typeof suKienGetMe>;
