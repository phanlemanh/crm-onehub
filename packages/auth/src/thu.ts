import * as z from "zod";
import { env } from "./env";

export const THU = {
	goc: "https://api.resend.com/emails",
	hetGioMs: 8000,
} as const;

const traLoiGui = z.object({ id: z.string() });

export type ThuCanGui = {
	den: string;
	tieuDe: string;
	than: string;
};

export async function guiThu(thu: ThuCanGui): Promise<boolean> {
	const cauHinh = env.thu;

	if (!cauHinh) {
		console.warn("[auth] chua khai RESEND_API_KEY, khong gui duoc thu");
		return false;
	}

	try {
		const traLoi = await fetch(THU.goc, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${cauHinh.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: cauHinh.from,
				to: [thu.den],
				subject: thu.tieuDe,
				text: thu.than,
			}),
			signal: AbortSignal.timeout(THU.hetGioMs),
		});

		if (!traLoi.ok) {
			console.warn(
				`[auth] gui thu that bai: ${traLoi.status} ${(await traLoi.text()).slice(0, 200)}`,
			);
			return false;
		}

		const than = traLoiGui.safeParse(await traLoi.json());

		if (!than.success) {
			console.warn("[auth] gui thu tra ve than khong doc duoc");
			return false;
		}

		return true;
	} catch (loi) {
		console.warn(
			`[auth] khong voi toi duoc dich vu gui thu: ${String((loi as Error)?.message ?? loi)}`,
		);
		return false;
	}
}
