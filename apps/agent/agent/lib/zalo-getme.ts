import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { vanTay, ZALO_GETME } from "@crm/db/zalo-getme";
import { maLoiZalo, parseZaloGetMe } from "@crm/validation/zalo-update";
import { ZALO } from "./zalo-config";

export type KetLuanGetMe = "tam-loi" | "token-sai";

export type NoiGetMe = "dat-bot" | "kiem-bot";

export type LoiGetMe = {
	lop: string;
	http: number | null;
	maThan: number | null;
	ketLuan: KetLuanGetMe;
};

export type KetGetMe =
	| { loai: "duoc"; tenBot: string }
	| { loai: "loi"; loi: LoiGetMe };

export type PhanGetMe = { status: number; than: unknown };

export type GhiGetMe = (
	noi: NoiGetMe,
	token: string,
	loi: LoiGetMe,
) => Promise<void>;

function laTam(ma: number | null): boolean {
	if (ma === null) return false;
	return ZALO.http.tamLoi.some((m) => m === ma) || ma >= ZALO.http.loiMayChu;
}

function laTuChoi(ma: number | null): boolean {
	return ma !== null && ma >= ZALO.http.tuChoi.tu && ma < ZALO.http.tuChoi.den;
}

function loiGetMe(
	lop: string,
	http: number | null,
	maThan: number | null,
	tuChoi: boolean,
): KetGetMe {
	return {
		loai: "loi",
		loi: { lop, http, maThan, ketLuan: tuChoi ? "token-sai" : "tam-loi" },
	};
}

export function phanLopGetMe(phan: PhanGetMe | null): KetGetMe {
	if (phan === null) return loiGetMe("mang", null, null, false);
	const maThan = maLoiZalo(phan.than);
	if (phan.status !== ZALO.http.ok) {
		const tuChoi =
			laTuChoi(phan.status) && !laTam(phan.status) && !laTam(maThan);
		return loiGetMe(`http-${phan.status}`, phan.status, maThan, tuChoi);
	}
	if (maThan !== null) {
		return loiGetMe(
			`ok-false-${maThan}`,
			phan.status,
			maThan,
			laTuChoi(maThan) && !laTam(maThan),
		);
	}
	try {
		return { loai: "duoc", tenBot: parseZaloGetMe(phan.than).tenBot };
	} catch {
		return loiGetMe("sai-khuon", phan.status, null, false);
	}
}

export const ghiGetMeLoi: GhiGetMe = async (noi, token, loi) => {
	await db.agentEvent.create({
		data: {
			id: randomUUID(),
			sessionId: ZALO_GETME.phien,
			type: ZALO_GETME.loai,
			data: { noi, ...loi, vanTay: vanTay(token) },
			emittedAt: new Date(),
		},
	});
};

export async function ghiAnToan(
	ghi: GhiGetMe,
	noi: NoiGetMe,
	token: string,
	loi: LoiGetMe,
): Promise<void> {
	try {
		await ghi(noi, token, loi);
	} catch (e) {
		console.error(
			`[zalo] ghi su kien getMe hong: ${e instanceof Error ? e.message : String(e)}`,
		);
	}
}
