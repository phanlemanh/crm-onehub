import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	chuanHoaMa,
	dangBiChan,
	ghiSai,
	noiBangMa,
} from "@crm/db/zalo-lien-ket";
import {
	messageIdCua,
	parseZaloGetMe,
	parseZaloGetUpdates,
	type ZaloMessage,
	type ZaloUpdate,
} from "@crm/validation/zalo-update";
import { guiZalo, zaloGoi, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export type PhuThuocPoll = { fetcher?: typeof fetch; now?: () => Date };

export type KetQuaPoll = { xuLy: number; loi: number };

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

async function xuLyTin(
	token: string,
	tin: ZaloMessage,
	fetcher: typeof fetch,
	now: Date,
): Promise<void> {
	const tu = tin.from.id;
	if (await dangBiChan(db, tu, now)) return;
	const ma = chuanHoaMa(tin.text ?? "");
	if (!ma) {
		await guiZalo(token, tin.chat.id, ZALO.loi.huongDan, { fetcher });
		return;
	}
	const ket = await noiBangMa(db, {
		ma,
		zaloUserId: tu,
		tenZalo: tin.from.display_name,
		now,
	});
	if (ket.loai === "da-noi") {
		await guiZalo(token, tin.chat.id, ZALO.loi.daNoi(ket.tenCrm), { fetcher });
		return;
	}
	await ghiSai(db, tu, now);
	await guiZalo(token, tin.chat.id, ZALO.loi.huongDan, { fetcher });
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

async function nhanTin(
	token: string,
	fetcher: typeof fetch,
): Promise<ZaloUpdate | "loi"> {
	const tho = await zaloGoi(fetcher, token, "getUpdates", {
		timeout: String(ZALO.poll.timeoutGiay),
	});
	try {
		return parseZaloGetUpdates(tho);
	} catch (loi) {
		console.error(
			`[zalo] tin hong message_id=${messageIdCua(tho) ?? "?"}: ${String(loi)}`,
		);
		return "loi";
	}
}

async function laTinMoi(tin: ZaloMessage, now: Date): Promise<boolean> {
	if (tin.from.is_bot) return false;
	const { count } = await db.zaloUpdateSeen.createMany({
		data: [{ messageId: tin.message_id, seenAt: now }],
		skipDuplicates: true,
	});
	return count > 0;
}

async function xuLyMotTin(
	token: string,
	tin: ZaloMessage,
	fetcher: typeof fetch,
	now: Date,
): Promise<boolean> {
	try {
		await xuLyTin(token, tin, fetcher, now);
		return true;
	} catch (loi) {
		console.error(
			`[zalo] khong xu ly duoc message_id=${tin.message_id}: ${String(loi)}`,
		);
		return false;
	}
}

export async function pollZalo(deps: PhuThuocPoll = {}): Promise<KetQuaPoll> {
	const fetcher = deps.fetcher ?? fetch;
	const now = (deps.now ?? (() => new Date()))();
	const token = zaloToken();
	if (!token) {
		await ghiBot({ zaloBotName: null });
		return { xuLy: 0, loi: 0 };
	}
	if (!(await docBot(token, fetcher, now))) return { xuLy: 0, loi: 1 };
	await db.zaloUpdateSeen.deleteMany({
		where: { seenAt: { lt: new Date(now.getTime() - ZALO.poll.giuDauMs) } },
	});
	let xuLy = 0;
	let loi = 0;
	for (let lan = 0; lan < ZALO.poll.toiDaMoiNhip; lan++) {
		const cap = await nhanTin(token, fetcher);
		if (cap === "loi") {
			loi++;
			continue;
		}
		if (cap.loai === "het") break;
		if (!(await laTinMoi(cap.message, now))) continue;
		if (await xuLyMotTin(token, cap.message, fetcher, now)) xuLy++;
		else loi++;
	}
	return { xuLy, loi };
}
