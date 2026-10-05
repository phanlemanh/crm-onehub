import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	parseZaloWebhookInfo,
	type ZaloLyDo,
} from "@crm/validation/zalo-update";
import { zaloGoiTho, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";
import {
	type GhiGetMe,
	ghiAnToan,
	ghiGetMeLoi,
	type PhanGetMe,
	phanLopGetMe,
} from "./zalo-getme";

export type PhuThuocBot = {
	fetcher?: typeof fetch;
	now?: () => Date;
	ghi?: GhiGetMe;
};

export type TrangThaiBot = "tat" | "song" | "loi";

type GhiBot = Partial<{
	zaloBotName: string | null;
	zaloPolledAt: Date;
	zaloWebhookUrl: string | null;
}>;

async function ghiBot(data: GhiBot): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data,
	});
}

const DANG_KY_HONG: ZaloLyDo = "zalo-tu-choi";

async function ghiUrlKhiKhongCoHong(url: string): Promise<void> {
	await db.appSetting.updateMany({
		where: {
			id: SETTINGS_ID,
			OR: [
				{ zaloWebhookLyDo: null },
				{ zaloWebhookLyDo: { not: DANG_KY_HONG } },
			],
		},
		data: { zaloWebhookUrl: url },
	});
}

async function docBot(
	token: string,
	fetcher: typeof fetch,
	now: Date,
	ghi: GhiGetMe,
): Promise<boolean> {
	let phan: PhanGetMe | null = null;
	try {
		phan = await zaloGoiTho(fetcher, token, "getMe", {});
	} catch (loi) {
		console.error(`[zalo] getMe loi mang: ${String(loi)}`);
	}
	const ket = phanLopGetMe(phan);
	if (ket.loai === "duoc") {
		await ghiBot({ zaloBotName: ket.tenBot, zaloPolledAt: now });
		return true;
	}
	console.error(`[zalo] getMe ${ket.loi.lop}, ${ket.loi.ketLuan}`);
	await ghiAnToan(ghi, "kiem-bot", token, ket.loi);
	if (ket.loi.ketLuan === "token-sai") {
		await ghiBot({ zaloBotName: null, zaloWebhookUrl: null });
	}
	return false;
}

async function docWebhook(token: string, fetcher: typeof fetch): Promise<void> {
	try {
		const { status, than } = await zaloGoiTho(
			fetcher,
			token,
			"getWebhookInfo",
			{},
		);
		if (status === ZALO.http.khongCo) {
			await ghiBot({ zaloWebhookUrl: null });
			return;
		}
		if (status !== ZALO.http.ok) return;
		const info = parseZaloWebhookInfo(than);
		if (info.loai === "la") {
			console.error(
				`[zalo] getWebhookInfo sai khuon khoa=${info.khoa} result=${info.khoaKetQua}`,
			);
			await ghiBot({ zaloWebhookUrl: null });
			return;
		}
		await ghiUrlKhiKhongCoHong(info.url);
	} catch (loi) {
		console.error(
			`[zalo] getWebhookInfo loi, giu trang thai cu: ${String(loi)}`,
		);
	}
}

export async function kiemBot(deps: PhuThuocBot = {}): Promise<TrangThaiBot> {
	const fetcher = deps.fetcher ?? fetch;
	const now = (deps.now ?? (() => new Date()))();
	const token = await zaloToken();
	if (!token) {
		await ghiBot({ zaloBotName: null });
		return "tat";
	}
	if (!(await docBot(token, fetcher, now, deps.ghi ?? ghiGetMeLoi)))
		return "loi";
	await docWebhook(token, fetcher);
	await db.zaloUpdateSeen.deleteMany({
		where: { seenAt: { lt: new Date(now.getTime() - ZALO.poll.giuDauMs) } },
	});
	return "song";
}
