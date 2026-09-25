import { z } from "zod";

export const traLoiKhoaNghienCuu = z
	.object({
		configured: z.boolean().nullable().catch(null),
		canManage: z.boolean().nullable().catch(null),
	})
	.catch({ configured: null, canManage: null });

export type CongNghienCuu = "settled" | "required" | "unknown";

export function congNghienCuu(data: unknown): CongNghienCuu {
	const { configured, canManage } = traLoiKhoaNghienCuu.parse(data ?? {});

	if (configured === null) return "unknown";

	return configured || canManage !== true ? "settled" : "required";
}
