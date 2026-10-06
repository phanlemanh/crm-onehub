import { createHash } from "node:crypto";

export const ZALO_GETME = {
	loai: "zalo.getme-loi",
	phien: "zalo-bot",
	vanTayKyTu: 12,
} as const;

export function vanTay(token: string): string {
	return createHash("sha256")
		.update(token)
		.digest("hex")
		.slice(0, ZALO_GETME.vanTayKyTu);
}
