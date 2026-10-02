import { z } from "zod";
import type { SessionPurpose } from "./phien-tac-tu";
import { WORKSPACE_ROLES } from "./vai-workspace";

export const OKR_PHIEN_SOAN = {
	purpose: "okr-soan",
	issuer: "crm-app",
	audience: "crm-okr-agent",
} as const satisfies {
	purpose: SessionPurpose;
	issuer: string;
	audience: string;
};

export const thuocTinhPhienSoan = z.object({
	purpose: z.literal(OKR_PHIEN_SOAN.purpose),
	cuocSoanId: z.string().trim().min(1),
	vai: z.enum(WORKSPACE_ROLES),
	email: z.string().optional(),
	name: z.string().optional(),
});

export const theCuaPhienSoan = thuocTinhPhienSoan.omit({ vai: true });

export type ThuocTinhPhienSoan = z.infer<typeof thuocTinhPhienSoan>;
export type TheCuaPhienSoan = z.infer<typeof theCuaPhienSoan>;

export function parseThuocTinhPhienSoan(value: unknown): ThuocTinhPhienSoan {
	const r = thuocTinhPhienSoan.safeParse(value);
	if (!r.success)
		throw new Error(`thuộc tính phiên soạn không đọc được: ${r.error.message}`);
	return r.data;
}
