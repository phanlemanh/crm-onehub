import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseZaloGetMe } from "@crm/validation/zalo-update";
import { zaloGoi, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export type PhuThuocBot = { fetcher?: typeof fetch; now?: () => Date };

export type TrangThaiBot = "tat" | "song" | "loi";

async function ghiBot(data: {
	zaloBotName: string | null;
	zaloPolledAt?: Date;
}): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data,
	});
}

async function docBot(
	token: string,
	fetcher: typeof fetch,
	now: Date,
): Promise<boolean> {
	try {
		const { tenBot } = parseZaloGetMe(
			await zaloGoi(fetcher, token, "getMe", {}),
		);
		await ghiBot({ zaloBotName: tenBot, zaloPolledAt: now });
		return true;
	} catch (loi) {
		console.error(`[zalo] getMe loi, coi Zalo la tat: ${String(loi)}`);
		await ghiBot({ zaloBotName: null });
		return false;
	}
}

export async function kiemBot(deps: PhuThuocBot = {}): Promise<TrangThaiBot> {
	const fetcher = deps.fetcher ?? fetch;
	const now = (deps.now ?? (() => new Date()))();
	const token = zaloToken();
	if (!token) {
		await ghiBot({ zaloBotName: null });
		return "tat";
	}
	if (!(await docBot(token, fetcher, now))) return "loi";
	await db.zaloUpdateSeen.deleteMany({
		where: { seenAt: { lt: new Date(now.getTime() - ZALO.poll.giuDauMs) } },
	});
	return "song";
}
