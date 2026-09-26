import { db } from "@crm/db";
import {
	chuanHoaMa,
	type DbGhi,
	dangBiChan,
	ghiSai,
	noiBangMa,
} from "@crm/db/zalo-lien-ket";
import type { ZaloMessage } from "@crm/validation/zalo-update";
import { lienKetKeHoach } from "./nhac-ke-hoach";
import { BuocDoi, cauTraLoi, xongTheoTinNhac } from "./tra-loi-nhac";
import { guiZalo } from "./zalo-api";
import { gioNhac } from "./zalo-bot-xuong";
import { ZALO } from "./zalo-config";
import { docLenh } from "./zalo-lenh";

export type PhuThuocNhan = { fetcher: typeof fetch; now: Date };

export type KetQuaTin = "bo-qua" | "xong" | "loi";

type TraLoi = { chatId: string; text: string };

async function cauKhongMa(
	tx: DbGhi,
	zaloUserId: string,
	text: string,
	now: Date,
): Promise<string> {
	const lienKet = await tx.zaloLink.findUnique({
		where: { zaloUserId },
		include: { crmUser: { select: { name: true } } },
	});
	if (!lienKet) return ZALO.loi.huongDan;
	const lenh = docLenh(text);
	if (!lenh) {
		return `${ZALO.loi.daNoiRoi(lienKet.crmUser.name, gioNhac())} ${ZALO.loi.goiY}`;
	}
	if (lenh.lenh === "xong-thieu-so") return ZALO.loi.thieuSo;
	const ket = await xongTheoTinNhac(tx, {
		userId: lienKet.crmUserId,
		so: lenh.so,
		now,
		lienKet: await lienKetKeHoach(),
	});
	return cauTraLoi(ket);
}

async function ghiDaThay(
	tin: ZaloMessage,
	now: Date,
	loi: BuocDoi,
): Promise<TraLoi | null> {
	const { count } = await db.zaloUpdateSeen.createMany({
		data: [{ messageId: tin.message_id, seenAt: now }],
		skipDuplicates: true,
	});
	if (count === 0) return null;
	return {
		chatId: tin.chat.id,
		text: cauTraLoi({ loai: "buoc-doi", muc: loi.muc }),
	};
}

async function xuLyDb(
	tx: DbGhi,
	tin: ZaloMessage,
	now: Date,
): Promise<TraLoi | null> {
	const { count } = await tx.zaloUpdateSeen.createMany({
		data: [{ messageId: tin.message_id, seenAt: now }],
		skipDuplicates: true,
	});
	if (count === 0) return null;
	const tu = tin.from.id;
	if (await dangBiChan(tx, tu, now)) return null;
	const ma = chuanHoaMa(tin.text ?? "");
	if (!ma) {
		return {
			chatId: tin.chat.id,
			text: await cauKhongMa(tx, tu, tin.text ?? "", now),
		};
	}
	const ket = await noiBangMa(tx, {
		ma,
		zaloUserId: tu,
		tenZalo: tin.from.display_name,
		now,
	});
	if (ket.loai === "da-noi") {
		return { chatId: tin.chat.id, text: ZALO.loi.daNoi(ket.tenCrm) };
	}
	await ghiSai(tx, tu, now);
	return { chatId: tin.chat.id, text: ZALO.loi.huongDan };
}

async function ghiTin(tin: ZaloMessage, now: Date): Promise<TraLoi | null> {
	try {
		return await db.$transaction((tx) => xuLyDb(tx, tin, now));
	} catch (loi) {
		if (loi instanceof BuocDoi) return ghiDaThay(tin, now, loi);
		throw loi;
	}
}

function laTinRieng(tin: ZaloMessage): boolean {
	return !tin.from.is_bot && tin.chat.chat_type === ZALO.chatRieng;
}

export async function xuLyTinDen(
	token: string,
	tin: ZaloMessage,
	deps: PhuThuocNhan,
): Promise<KetQuaTin> {
	if (!laTinRieng(tin)) return "bo-qua";
	let traLoi: TraLoi | null;
	try {
		traLoi = await ghiTin(tin, deps.now);
	} catch (loi) {
		console.error(
			`[zalo] khong ghi duoc message_id=${tin.message_id}: ${String(loi)}`,
		);
		return "loi";
	}
	if (!traLoi) return "bo-qua";
	try {
		await guiZalo(token, traLoi.chatId, traLoi.text, {
			fetcher: deps.fetcher,
		});
	} catch (loi) {
		console.error(
			`[zalo] gui tra loi hong message_id=${tin.message_id}: ${String(loi)}`,
		);
	}
	return "xong";
}
