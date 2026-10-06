import { db, type Prisma } from "@crm/db";
import {
	chuanHoaMa,
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
import { dangBan, hoiTacTu, tokenPhien, type YeuCauHoi } from "./zalo-hoi";
import { docLenh } from "./zalo-lenh";
import { moPhien } from "./zalo-tra-loi";

export type PhuThuocHoi = {
	hoi: (y: YeuCauHoi) => Promise<{ id: string }>;
	datLai: (continuationToken: string) => Promise<unknown>;
	waitUntil: (p: Promise<unknown>) => void;
};

export type PhuThuocNhan = {
	fetcher: typeof fetch;
	now: Date;
	hoi?: PhuThuocHoi;
};

export type KetQuaTin = "bo-qua" | "xong" | "loi";

type TraLoi =
	| { loai: "gui"; chatId: string; text: string }
	| { loai: "hoi"; chatId: string; yeuCau: YeuCauHoi }
	| { loai: "moi"; chatId: string; token: string };

type CoHoi = { coHoi: boolean };

async function khongMa(
	tx: Prisma.TransactionClient,
	tin: ZaloMessage,
	now: Date,
	chon: CoHoi,
): Promise<TraLoi> {
	const chatId = tin.chat.id;
	const text = tin.text ?? "";
	const gui = (t: string): TraLoi => ({ loai: "gui", chatId, text: t });
	const lienKet = await tx.zaloLink.findUnique({
		where: { zaloUserId: tin.from.id },
		include: { crmUser: { select: { name: true } } },
	});
	if (!lienKet) return gui(ZALO.loi.huongDan);
	const lenh = docLenh(text);
	if (lenh?.lenh === "xong-thieu-so") return gui(ZALO.loi.thieuSo);
	if (lenh?.lenh === "xong") {
		const ket = await xongTheoTinNhac(tx, {
			userId: lienKet.crmUserId,
			so: lenh.so,
			now,
			lienKet: await lienKetKeHoach(),
		});
		return gui(cauTraLoi(ket));
	}
	if (!chon.coHoi) {
		return gui(
			`${ZALO.loi.daNoiRoi(lienKet.crmUser.name, gioNhac())} ${ZALO.loi.goiY}`,
		);
	}
	if (lenh?.lenh === "moi") {
		if (await dangBan(tx, chatId, now)) return gui(ZALO.loi.dangTraLoi);
		return {
			loai: "moi",
			chatId,
			token: tokenPhien(chatId, lienKet.crmUserId, now),
		};
	}
	if (!text.trim()) return gui(ZALO.loi.chiDocChu);
	const ket = await hoiTacTu(
		tx,
		{ messageId: tin.message_id, chatId, text },
		lienKet.crmUserId,
		now,
	);
	return ket.loai === "hoi"
		? { loai: "hoi", chatId, yeuCau: ket.yeuCau }
		: gui(ket.text);
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
		loai: "gui",
		chatId: tin.chat.id,
		text: cauTraLoi({ loai: "buoc-doi", muc: loi.muc }),
	};
}

async function xuLyDb(
	tx: Prisma.TransactionClient,
	tin: ZaloMessage,
	now: Date,
	chon: CoHoi,
): Promise<TraLoi | null> {
	const { count } = await tx.zaloUpdateSeen.createMany({
		data: [{ messageId: tin.message_id, seenAt: now }],
		skipDuplicates: true,
	});
	if (count === 0) return null;
	const tu = tin.from.id;
	if (await dangBiChan(tx, tu, now)) return null;
	const ma = chuanHoaMa(tin.text ?? "");
	if (!ma) return khongMa(tx, tin, now, chon);
	const ket = await noiBangMa(tx, {
		ma,
		zaloUserId: tu,
		tenZalo: tin.from.display_name,
		now,
	});
	if (ket.loai === "da-noi") {
		return {
			loai: "gui",
			chatId: tin.chat.id,
			text: ZALO.loi.daNoi(ket.tenCrm),
		};
	}
	await ghiSai(tx, tu, now);
	return { loai: "gui", chatId: tin.chat.id, text: ZALO.loi.huongDan };
}

async function ghiTin(
	tin: ZaloMessage,
	now: Date,
	chon: CoHoi,
): Promise<TraLoi | null> {
	try {
		return await db.$transaction((tx) => xuLyDb(tx, tin, now, chon));
	} catch (loi) {
		if (loi instanceof BuocDoi) return ghiDaThay(tin, now, loi);
		throw loi;
	}
}

function laTinRieng(tin: ZaloMessage): boolean {
	return !tin.from.is_bot && tin.chat.chat_type === ZALO.chatRieng;
}

async function batDauLai(
	token: string,
	moi: { chatId: string; token: string },
	deps: PhuThuocNhan,
	messageId: string,
): Promise<void> {
	try {
		await deps.hoi?.datLai(moi.token);
		await guiZalo(token, moi.chatId, ZALO.loi.daMoi, { fetcher: deps.fetcher });
	} catch (loi) {
		console.error(
			`[zalo] bat dau lai hong message_id=${messageId}: ${loi instanceof Error ? loi.name : "loi"}`,
		);
	}
}

export async function xuLyTinDen(
	token: string,
	tin: ZaloMessage,
	deps: PhuThuocNhan,
): Promise<KetQuaTin> {
	if (!laTinRieng(tin)) return "bo-qua";
	let traLoi: TraLoi | null;
	try {
		traLoi = await ghiTin(tin, deps.now, { coHoi: deps.hoi !== undefined });
	} catch (loi) {
		console.error(
			`[zalo] khong ghi duoc message_id=${tin.message_id}: ${String(loi)}`,
		);
		return "loi";
	}
	if (!traLoi) return "bo-qua";
	if (traLoi.loai === "hoi" && deps.hoi) {
		deps.hoi.waitUntil(
			moPhien(traLoi.yeuCau, {
				hoi: deps.hoi.hoi,
				fetcher: deps.fetcher,
				token,
				messageId: tin.message_id,
			}),
		);
		return "xong";
	}
	if (traLoi.loai === "moi" && deps.hoi) {
		deps.hoi.waitUntil(batDauLai(token, traLoi, deps, tin.message_id));
		return "xong";
	}
	if (traLoi.loai !== "gui") return "xong";
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
