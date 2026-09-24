import { db } from "@crm/db";
import {
	chuanHoaMa,
	dangBiChan,
	ghiSai,
	noiBangMa,
} from "@crm/db/zalo-lien-ket";
import type { ZaloMessage } from "@crm/validation/zalo-update";
import { guiZalo } from "./zalo-api";
import { ZALO } from "./zalo-config";

export type PhuThuocNhan = { fetcher: typeof fetch; now: Date };

export type KetQuaTin = "bo-qua" | "xong" | "loi";

async function xuLyTin(
	token: string,
	tin: ZaloMessage,
	deps: PhuThuocNhan,
): Promise<void> {
	const tu = tin.from.id;
	if (await dangBiChan(db, tu, deps.now)) return;
	const ma = chuanHoaMa(tin.text ?? "");
	if (!ma) {
		await guiZalo(token, tin.chat.id, ZALO.loi.huongDan, {
			fetcher: deps.fetcher,
		});
		return;
	}
	const ket = await noiBangMa(db, {
		ma,
		zaloUserId: tu,
		tenZalo: tin.from.display_name,
		now: deps.now,
	});
	if (ket.loai === "da-noi") {
		await guiZalo(token, tin.chat.id, ZALO.loi.daNoi(ket.tenCrm), {
			fetcher: deps.fetcher,
		});
		return;
	}
	await ghiSai(db, tu, deps.now);
	await guiZalo(token, tin.chat.id, ZALO.loi.huongDan, {
		fetcher: deps.fetcher,
	});
}

function laTinRieng(tin: ZaloMessage): boolean {
	return !tin.from.is_bot && tin.chat.chat_type === ZALO.chatRieng;
}

async function laTinMoi(tin: ZaloMessage, now: Date): Promise<boolean> {
	const { count } = await db.zaloUpdateSeen.createMany({
		data: [{ messageId: tin.message_id, seenAt: now }],
		skipDuplicates: true,
	});
	return count > 0;
}

export async function xuLyTinDen(
	token: string,
	tin: ZaloMessage,
	deps: PhuThuocNhan,
): Promise<KetQuaTin> {
	if (!laTinRieng(tin)) return "bo-qua";
	if (!(await laTinMoi(tin, deps.now))) return "bo-qua";
	try {
		await xuLyTin(token, tin, deps);
		return "xong";
	} catch (loi) {
		console.error(
			`[zalo] khong xu ly duoc message_id=${tin.message_id}: ${String(loi)}`,
		);
		return "loi";
	}
}
