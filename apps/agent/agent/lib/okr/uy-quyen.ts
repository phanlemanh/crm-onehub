import { z } from "zod";
import type { SessionPurpose } from "../session-purpose";
import { TRO_LY_OKR } from "./config";

export const SUBAGENT_TRO_LY_OKR = "tro_ly_okr";

export const LOI_UY_QUYEN = {
	khacTroLy: "An OKR session may only call tro_ly_okr.",
	lanHai: "tro_ly_okr may be called only once per OKR session.",
} as const;

export type HanhDongYeuCau = {
	kind: string;
	callId: string;
	subagentName?: string;
	toolName?: string;
};

export type QuyetUyQuyen =
	| { cho: true; daGoi: string[] }
	| { cho: false; loi: (typeof LOI_UY_QUYEN)[keyof typeof LOI_UY_QUYEN] };

export const laGoiTroLy = (a: HanhDongYeuCau) =>
	a.kind === "subagent-call" && a.subagentName === SUBAGENT_TRO_LY_OKR;

export function quyetUyQuyen(
	purpose: SessionPurpose,
	daGoi: readonly string[],
	moi: readonly HanhDongYeuCau[],
): QuyetUyQuyen {
	if (purpose !== "okr") return { cho: true, daGoi: [...daGoi] };
	if (moi.some((a) => !laGoiTroLy(a))) {
		return { cho: false, loi: LOI_UY_QUYEN.khacTroLy };
	}
	const them = moi.map((a) => a.callId).filter((id) => !daGoi.includes(id));
	if (daGoi.length + new Set(them).size > 1) {
		return { cho: false, loi: LOI_UY_QUYEN.lanHai };
	}
	return { cho: true, daGoi: [...daGoi, ...new Set(them)] };
}

const ketQuaLoi = z
	.object({
		code: z
			.string()
			.regex(/^[A-Z_]{1,60}$/)
			.catch("SUBAGENT_ERROR"),
	})
	.catch({ code: "SUBAGENT_ERROR" });

export type KetQuaCon = {
	kind: string;
	subagentName?: string;
	isError?: boolean;
	output?: unknown;
};

export function ketThucTuKetQua(r: KetQuaCon): string | null {
	if (r.kind !== "subagent-result" || r.subagentName !== SUBAGENT_TRO_LY_OKR) {
		return null;
	}
	if (r.isError) return `hong:${ketQuaLoi.parse(r.output).code}`;
	return TRO_LY_OKR.ketThuc.khongNop;
}
