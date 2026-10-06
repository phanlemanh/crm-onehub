import { randomBytes } from "node:crypto";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { NHAC } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import type {
	DatBotPhanHoi,
	DatBotYeuCau,
	GuiThuPhanHoi,
} from "@crm/validation/zalo-cau-noi";
import { parseZaloSetWebhook } from "@crm/validation/zalo-update";
import { z } from "zod";
import { guiQuaSlackThu } from "./nhac-ke-hoach";
import {
	guiZalo,
	LoiHttpZalo,
	zaloGoi,
	zaloGoiTho,
	zaloToken,
} from "./zalo-api";
import { ZALO } from "./zalo-config";
import {
	type GhiGetMe,
	ghiAnToan,
	ghiGetMeLoi,
	type KetGetMe,
	type PhanGetMe,
	phanLopGetMe,
} from "./zalo-getme";

const CHU_SO_GIO = 2;

export function gioNhac(): string {
	const hai = (n: number) => String(n).padStart(CHU_SO_GIO, "0");
	return `${hai(NHAC.gio.gio)}:${hai(NHAC.gio.phut)}`;
}

type CotZalo = {
	zaloBotToken: string | null;
	zaloWebhookSecret: string | null;
	zaloBotName: string | null;
	zaloWebhookUrl: string | null;
	zaloWebhookLyDo: string | null;
};

async function chupCot(): Promise<CotZalo> {
	const s = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: {
			zaloBotToken: true,
			zaloWebhookSecret: true,
			zaloBotName: true,
			zaloWebhookUrl: true,
			zaloWebhookLyDo: true,
		},
	});
	return (
		s ?? {
			zaloBotToken: null,
			zaloWebhookSecret: null,
			zaloBotName: null,
			zaloWebhookUrl: null,
			zaloWebhookLyDo: null,
		}
	);
}

async function ghiCot(cot: Partial<CotZalo>): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...cot },
		update: cot,
	});
}

function baoLoiZalo(method: string, lop: string): void {
	console.error(`[zalo] ${method} hong: ${lop}`);
}

const loiMang = z.object({ code: z.string().min(1) });

function lopLoi(loi: Error): string {
	if (loi instanceof LoiHttpZalo) return `http-${loi.status}`;
	const mang = loiMang.safeParse(loi);
	if (mang.success) return `mang (${mang.data.code})`;
	return `tra-loi-la (${loi.name})`;
}

async function docBot(
	fetcher: typeof fetch,
	token: string,
	ghi: GhiGetMe,
): Promise<KetGetMe> {
	let phan: PhanGetMe | null = null;
	try {
		phan = await zaloGoiTho(fetcher, token, "getMe", {});
	} catch (loi) {
		baoLoiZalo(
			"getMe",
			`mang (${loi instanceof Error ? loi.name : "khong-ro"})`,
		);
	}
	const ket = phanLopGetMe(phan);
	if (ket.loai === "duoc") return ket;
	if (phan !== null && ket.loi.ketLuan === "tam-loi") {
		baoLoiZalo("getMe", ket.loi.lop);
	}
	await ghiAnToan(ghi, "dat-bot", token, ket.loi);
	return ket;
}

type KetDangKy = "duoc" | "tu-choi" | "xac-minh-hong";

async function dangKy(
	fetcher: typeof fetch,
	token: string,
	url: string,
	khoa: string,
): Promise<KetDangKy> {
	try {
		const ket = parseZaloSetWebhook(
			await zaloGoi(fetcher, token, "setWebhook", { url, secret_token: khoa }),
		);
		if (ket.outcome !== null && ket.outcome !== ZALO.webhook.xacMinhOk) {
			console.error(`[zalo] setWebhook xac minh hong outcome=${ket.outcome}`);
			return "xac-minh-hong";
		}
		return "duoc";
	} catch (loi) {
		console.error(`[zalo] setWebhook loi: ${String(loi)}`);
		return "tu-choi";
	}
}

export async function datBot(
	yeuCau: DatBotYeuCau,
	goc: URL,
	deps: { fetcher?: typeof fetch; ghi?: GhiGetMe } = {},
): Promise<DatBotPhanHoi> {
	const fetcher = deps.fetcher ?? fetch;
	const token = yeuCau.token ?? (await zaloToken());
	if (!token)
		return { outcome: "khong-co-token", reason: ZALO.loi.khongCoToken };
	const bot = await docBot(fetcher, token, deps.ghi ?? ghiGetMeLoi);
	if (bot.loai === "loi") {
		return bot.loi.ketLuan === "token-sai"
			? { outcome: "invalid", reason: ZALO.loi.tokenSai }
			: { outcome: "zalo-loi", reason: ZALO.loi.zaloKhongTraLoi };
	}
	const { tenBot } = bot;
	if (goc.protocol !== ZALO.webhook.giaoThucAnToan) {
		await ghiCot({
			zaloBotToken: token,
			zaloWebhookSecret: null,
			zaloBotName: tenBot,
			zaloWebhookUrl: null,
			zaloWebhookLyDo: "can-https",
		});
		return { outcome: "valid", tenBot, webhook: "can-https" };
	}
	const khoa = randomBytes(ZALO.webhook.khoa.sinhByte).toString("hex");
	const url = new URL(ZALO.webhook.duong, goc).toString();
	const truoc = await chupCot();
	await ghiCot({
		zaloBotToken: token,
		zaloWebhookSecret: khoa,
		zaloBotName: tenBot,
	});
	const ket = await dangKy(fetcher, token, url, khoa);
	if (ket === "tu-choi") {
		await ghiCot({ ...truoc, zaloWebhookLyDo: "zalo-tu-choi" });
		return { outcome: "invalid", reason: ZALO.loi.dangKyHong };
	}
	if (ket === "xac-minh-hong") {
		await ghiCot({ zaloWebhookUrl: null, zaloWebhookLyDo: "zalo-tu-choi" });
		return { outcome: "valid", tenBot, webhook: "zalo-tu-choi" };
	}
	await ghiCot({ zaloWebhookUrl: url, zaloWebhookLyDo: null });
	return { outcome: "valid", tenBot, webhook: "da-dang-ky" };
}

async function guiDuocKhong(
	method: string,
	gui: () => Promise<unknown>,
): Promise<boolean> {
	try {
		await gui();
		return true;
	} catch (loi) {
		baoLoiZalo(method, loi instanceof Error ? lopLoi(loi) : "khong-ro");
		return false;
	}
}

export async function guiThu(
	userId: string,
	deps: { fetcher?: typeof fetch; slackFetcher?: typeof fetch } = {},
): Promise<GuiThuPhanHoi> {
	const token = await zaloToken();
	const kenh = await kenhSeDungCua(db, userId, { coToken: token !== null });
	const cau = ZALO.loi.guiThu(gioNhac());
	let guiDuoc = true;
	if (kenh.kenh === "zalo" && token && kenh.zaloUserId) {
		const zaloUserId = kenh.zaloUserId;
		guiDuoc = await guiDuocKhong("sendMessage", () =>
			guiZalo(token, zaloUserId, cau, { fetcher: deps.fetcher }),
		);
	}
	if (kenh.kenh === "slack" && kenh.slackUserId) {
		const slackUserId = kenh.slackUserId;
		guiDuoc = await guiDuocKhong("slack", () =>
			guiQuaSlackThu(slackUserId, cau, {
				fetcher: deps.slackFetcher,
				maTin: `nhac-thu-${userId}-${Date.now()}`,
			}),
		);
	}
	return { kenh: kenh.kenh, lech: kenh.lech, guiDuoc };
}
