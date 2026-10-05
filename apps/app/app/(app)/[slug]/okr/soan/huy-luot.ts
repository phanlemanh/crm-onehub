import type { MessageStreamEvent } from "eve/client";
import { z } from "zod";
import { CUA_OKR } from "@/lib/cua-okr-config";
import { OKR_SOAN_CUA, okrSoanHeader } from "@/lib/okr-soan-record";

const hoiAmHuy = z.object({
	ok: z.literal(true),
	sessionId: z.string(),
	status: z.enum(["accepted", "no_active_turn"]),
});

export type KieuKhep = "huy" | "thuong" | "loi";

type SuKien = MessageStreamEvent;

const maBatDau = (e: SuKien) =>
	e.type === "turn.started" ? e.data.turnId : undefined;
const maHuy = (e: SuKien) =>
	e.type === "turn.cancelled" ? e.data.turnId : undefined;

export function luotDangChay(suKien: readonly SuKien[]): string | undefined {
	const nhan = suKien.findLastIndex((e) => e.type === "message.received");
	const sau = suKien.slice(nhan + 1);
	return sau.map(maBatDau).findLast((ma) => ma !== undefined);
}

export function kieuKhep(
	suKien: readonly SuKien[],
	tu: number,
	luot: string | undefined,
): KieuKhep {
	const moi = suKien.slice(tu);
	const huy = moi.findIndex((e) => {
		const ma = maHuy(e);
		return ma !== undefined && (luot === undefined || ma === luot);
	});
	const doSau = (tuChiSo: number) =>
		moi.slice(tuChiSo).some((e) => e.type === "session.waiting");
	if (huy >= 0 && doSau(huy + 1)) return "huy";
	if (doSau(0)) return "thuong";
	return "loi";
}

export async function guiHuyLuot({
	phien,
	cuocSoanId,
	luot,
}: {
	phien: string;
	cuocSoanId: string;
	luot: string | undefined;
}): Promise<boolean> {
	try {
		const res = await fetch(
			`${OKR_SOAN_CUA.host}${CUA_OKR.tienToEve}/session/${encodeURIComponent(phien)}/cancel`,
			{
				method: "POST",
				headers: {
					...okrSoanHeader(cuocSoanId),
					"content-type": "application/json",
				},
				body: JSON.stringify(luot === undefined ? {} : { turnId: luot }),
			},
		);
		if (!res.ok) return false;
		const hoi = hoiAmHuy.safeParse(await res.json());
		return hoi.success && hoi.data.sessionId === phien;
	} catch {
		return false;
	}
}
