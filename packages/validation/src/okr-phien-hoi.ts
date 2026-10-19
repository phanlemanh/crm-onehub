import { z } from "zod";
import { WORKSPACE_ROLES } from "./vai-workspace";

export const OKR_PHIEN_HOI = {
	purpose: "okr-hoi",
	issuer: "crm-app",
	audience: "crm-okr-agent",
} as const;

export const thuocTinhPhienHoi = z.object({
	purpose: z.literal(OKR_PHIEN_HOI.purpose),
	cuocHoiId: z.string().trim().min(1),
	vai: z.enum(WORKSPACE_ROLES),
	email: z.string().optional(),
	name: z.string().optional(),
});

export const theCuaPhienHoi = thuocTinhPhienHoi.omit({ vai: true });

export type ThuocTinhPhienHoi = z.infer<typeof thuocTinhPhienHoi>;
export type TheCuaPhienHoi = z.infer<typeof theCuaPhienHoi>;

export function parseThuocTinhPhienHoi(value: unknown): ThuocTinhPhienHoi {
	const r = thuocTinhPhienHoi.safeParse(value);
	if (!r.success)
		throw new Error(`thuộc tính phiên hỏi không đọc được: ${r.error.message}`);
	return r.data;
}
