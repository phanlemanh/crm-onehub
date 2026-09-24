import { randomBytes } from "node:crypto";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { NHAC } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import type {
	DatBotPhanHoi,
	DatBotYeuCau,
	GuiThuPhanHoi,
	WebhookKet,
} from "@crm/validation/zalo-cau-noi";
import {
	parseZaloGetMe,
	parseZaloSetWebhook,
} from "@crm/validation/zalo-update";
import { guiQuaSlackThu } from "./nhac-ke-hoach";
import { guiZalo, zaloGoi, zaloGoiTho, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

const CHU_SO_GIO = 2;

export function gioNhac(): string {
	const hai = (n: number) => String(n).padStart(CHU_SO_GIO, "0");
	return `${hai(NHAC.gio.gio)}:${hai(NHAC.gio.phut)}`;
}

async function dangKy(
	fetcher: typeof fetch,
	token: string,
	url: string,
	khoa: string,
): Promise<WebhookKet> {
	try {
		parseZaloSetWebhook(
			await zaloGoi(fetcher, token, "setWebhook", { url, secret_token: khoa }),
		);
		return "da-dang-ky";
	} catch (loi) {
		console.error(`[zalo] setWebhook loi: ${String(loi)}`);
		return "zalo-tu-choi";
	}
}

function cotGhi(
	token: string,
	khoa: string,
	tenBot: string,
	url: string,
	webhook: WebhookKet,
) {
	const daDangKy = webhook === "da-dang-ky";
	return {
		zaloBotToken: token,
		zaloWebhookSecret: daDangKy ? khoa : null,
		zaloBotName: tenBot,
		zaloWebhookUrl: daDangKy ? url : null,
		zaloWebhookLyDo: daDangKy ? null : webhook,
	};
}

export async function datBot(
	yeuCau: DatBotYeuCau,
	goc: URL,
	deps: { fetcher?: typeof fetch } = {},
): Promise<DatBotPhanHoi> {
	const fetcher = deps.fetcher ?? fetch;
	const token = yeuCau.token ?? (await zaloToken());
	if (!token)
		return { outcome: "khong-co-token", reason: ZALO.loi.khongCoToken };
	const me = await zaloGoiTho(fetcher, token, "getMe", {});
	if (me.status !== ZALO.http.ok) {
		return { outcome: "invalid", reason: ZALO.loi.tokenSai };
	}
	const { tenBot } = parseZaloGetMe(me.than);
	const khoa = randomBytes(ZALO.webhook.khoa.sinhByte).toString("hex");
	const url = new URL(ZALO.webhook.duong, goc).toString();
	const anToan = goc.protocol === ZALO.webhook.giaoThucAnToan;
	const webhook = anToan
		? await dangKy(fetcher, token, url, khoa)
		: "can-https";
	const cot = cotGhi(token, khoa, tenBot, url, webhook);
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...cot },
		update: cot,
	});
	return { outcome: "valid", tenBot, webhook };
}

export async function guiThu(
	userId: string,
	deps: { fetcher?: typeof fetch; slackFetcher?: typeof fetch } = {},
): Promise<GuiThuPhanHoi> {
	const token = await zaloToken();
	const kenh = await kenhSeDungCua(db, userId, { coToken: token !== null });
	const cau = ZALO.loi.guiThu(gioNhac());
	if (kenh.kenh === "zalo" && token && kenh.zaloUserId) {
		await guiZalo(token, kenh.zaloUserId, cau, { fetcher: deps.fetcher });
	}
	if (kenh.kenh === "slack" && kenh.slackUserId) {
		await guiQuaSlackThu(kenh.slackUserId, cau, {
			fetcher: deps.slackFetcher,
			maTin: `nhac-thu-${userId}-${Date.now()}`,
		});
	}
	return { kenh: kenh.kenh, lech: kenh.lech };
}
