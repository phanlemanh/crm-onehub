import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	docLoiZalo,
	type LoiThanZalo,
	parseZaloSend,
	ZaloHinhDangLa,
	ZaloTuChoi,
} from "@crm/validation/zalo-update";
import { z } from "zod";
import { ZALO } from "./zalo-config";

async function docCaiDat() {
	return db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloBotToken: true, zaloWebhookSecret: true },
	});
}

export async function zaloToken(): Promise<string | null> {
	const caiDat = await docCaiDat();
	return (
		caiDat?.zaloBotToken?.trim() || process.env.ZALO_BOT_TOKEN?.trim() || null
	);
}

export async function zaloKhoaWebhook(): Promise<string | null> {
	const caiDat = await docCaiDat();
	return (
		caiDat?.zaloWebhookSecret?.trim() ||
		process.env.ZALO_WEBHOOK_SECRET?.trim() ||
		null
	);
}

export class LoiHttpZalo extends Error {
	constructor(
		method: string,
		readonly status: number,
		readonly maLoi: number | null = null,
		readonly moTa: string | null = null,
	) {
		super(`Zalo ${method} tra HTTP ${status}.`);
	}
}

async function docThanLoi(res: Response): Promise<LoiThanZalo | null> {
	const chu = (await res.text().catch(() => "")).slice(0, ZALO.nhatKy.tranThan);
	try {
		return docLoiZalo(JSON.parse(chu));
	} catch {
		return null;
	}
}

const loiMangCo = z.object({ code: z.string().min(1) });

function cat(moTa: string | null): string {
	return moTa ? moTa.slice(0, ZALO.nhatKy.tranMoTa) : "-";
}

export function moTaTuChoi(maLoi: number | null, moTa: string | null): string {
	return `zalo-tu-choi ${maLoi ?? "-"} «${cat(moTa)}»`;
}

export function moTaLoiZalo(loi: Error): string {
	if (loi instanceof LoiHttpZalo) {
		const than =
			loi.maLoi !== null || loi.moTa !== null
				? ` ${moTaTuChoi(loi.maLoi, loi.moTa)}`
				: "";
		return `http-${loi.status}${than}`;
	}
	if (loi instanceof ZaloTuChoi) return moTaTuChoi(loi.maLoi, loi.moTa);
	if (loi instanceof ZaloHinhDangLa) {
		return `hinh-dang-la khoa=${loi.khoa.join(",")}`;
	}
	const mang = loiMangCo.safeParse(loi);
	if (mang.success) return `mang (${mang.data.code})`;
	return loi.name;
}

export function zaloApiGoc(): string {
	return process.env.ZALO_API_URL?.trim().replace(/\/+$/, "") || ZALO.api;
}

export async function zaloGoi(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<unknown> {
	const res = await fetcher(`${zaloApiGoc()}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(body),
	});
	const hetTin =
		method === ZALO.poll.lenhKeo && res.status === ZALO.http.hetTin;
	if (!res.ok && !hetTin) {
		const loi = await docThanLoi(res);
		throw new LoiHttpZalo(
			method,
			res.status,
			loi?.maLoi ?? null,
			loi?.moTa ?? null,
		);
	}
	return res.json();
}

export async function guiZalo(
	token: string,
	chatId: string,
	text: string,
	chon: { fetcher?: typeof fetch } = {},
): Promise<{ messageId: string }> {
	return parseZaloSend(
		await zaloGoi(chon.fetcher ?? fetch, token, "sendMessage", {
			chat_id: chatId,
			text,
		}),
	);
}

export async function zaloGoiTho(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<{ status: number; than: unknown }> {
	const res = await fetcher(`${zaloApiGoc()}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(body),
	});
	const than: unknown = await res.json().catch(() => null);
	return { status: res.status, than };
}
