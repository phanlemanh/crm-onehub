import { db, type Prisma } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { dauNgayVN, ngayVN } from "@crm/db/onboarding-nhac";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import {
	KET_QUA_TINH_TRAN,
	type ZaloHoiKetQua,
} from "@crm/validation/zalo-hoi";
import { thanhVienPrincipal } from "./thanh-vien-principal";
import { guiZalo, moTaLoiZalo, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export type TinHoi = { messageId: string; chatId: string; text: string };

export type YeuCauHoi = {
	hoiId: string;
	chatId: string;
	text: string;
	auth: {
		authenticator: string;
		principalType: "user";
		principalId: string;
		attributes: {
			purpose: string;
			userId: string;
			zaloChatId: string;
			hoiId: string;
		};
	};
	continuationToken: string;
};

export type KetHoi =
	| { loai: "hoi"; yeuCau: YeuCauHoi }
	| { loai: "tra-loi"; text: string };

export type KetDong = {
	ketQua: Extract<ZaloHoiKetQua, "da-tra-loi" | "gui-hong" | "loi">;
	traLoiLuc?: Date;
	doTreMs?: number;
	tokenVao?: number | null;
	tokenRa?: number | null;
};

export type HangDangHoi = {
	id: string;
	messageId: string;
	zaloChatId: string;
	hoiLuc: Date;
	sessionId: string | null;
};

const DANG_HOI: ZaloHoiKetQua = "dang-hoi";
const TINH_TRAN: ZaloHoiKetQua[] = [...KET_QUA_TINH_TRAN];

export function tokenPhien(
	chatId: string,
	crmUserId: string,
	now: Date,
): string {
	return `${ZALO.hoi.tienToToken}${chatId}:${crmUserId}:${ngayVN(now)}`;
}

export function chatCuaToken(token: string | undefined): string | null {
	if (!token) return null;
	const vi = token.lastIndexOf(ZALO.hoi.tienToToken);
	if (vi === -1) return null;
	const chat = token.slice(vi + ZALO.hoi.tienToToken.length).split(":")[0];
	return chat ? chat : null;
}

function dauThangVN(now: Date): Date {
	const ngay = Number(ngayVN(now).slice(8, 10));
	return new Date(dauNgayVN(now).getTime() - (ngay - 1) * ZALO.hoi.ngayMs);
}

async function ghiHang(
	tx: DbGhi,
	tin: TinHoi,
	crmUserId: string,
	now: Date,
	ketQua: ZaloHoiKetQua,
): Promise<string> {
	const hang = await tx.zaloHoi.create({
		data: {
			messageId: tin.messageId,
			crmUserId,
			zaloChatId: tin.chatId,
			hoiLuc: now,
			ketQua,
		},
		select: { id: true },
	});
	return hang.id;
}

async function dem(
	tx: DbGhi,
	where: { crmUserId?: string; tu: Date; den: Date },
): Promise<number> {
	return tx.zaloHoi.count({
		where: {
			crmUserId: where.crmUserId,
			hoiLuc: { gte: where.tu, lte: where.den },
			ketQua: { in: TINH_TRAN },
		},
	});
}

async function chamTran(
	tx: DbGhi,
	crmUserId: string,
	now: Date,
): Promise<{ ketQua: ZaloHoiKetQua; text: string } | null> {
	const { phut, ngay, thang } = ZALO.hoi.tran;
	const tuPhut = new Date(now.getTime() - ZALO.hoi.cuaSoPhutMs);
	if ((await dem(tx, { crmUserId, tu: tuPhut, den: now })) >= phut) {
		return { ketQua: "tu-choi-tran-phut", text: ZALO.loi.hetTranPhut };
	}
	if ((await dem(tx, { crmUserId, tu: dauNgayVN(now), den: now })) >= ngay) {
		return { ketQua: "tu-choi-tran-ngay", text: ZALO.loi.hetTranNgay(ngay) };
	}
	if ((await dem(tx, { tu: dauThangVN(now), den: now })) >= thang) {
		return { ketQua: "tu-choi-tran-thang", text: ZALO.loi.hetTranThang };
	}
	return null;
}

export async function dangBan(
	tx: DbGhi,
	chatId: string,
	now: Date,
): Promise<boolean> {
	const hang = await tx.zaloHoi.findFirst({
		where: {
			zaloChatId: chatId,
			ketQua: DANG_HOI,
			hoiLuc: { gt: new Date(now.getTime() - ZALO.hoi.hanTraLoiMs) },
		},
		select: { id: true },
	});
	return hang !== null;
}

export async function hoiTacTu(
	tx: Prisma.TransactionClient,
	tin: TinHoi,
	crmUserId: string,
	now: Date,
): Promise<KetHoi> {
	await lockIdempotencyKey(tx, `${ZALO.hoi.khoaChat}${tin.chatId}`);
	const principal = await thanhVienPrincipal(
		crmUserId,
		ZALO.hoi.authenticator,
		tx,
	);
	if (!principal) {
		await ghiHang(tx, tin, crmUserId, now, "tu-choi-vai");
		return { loai: "tra-loi", text: ZALO.loi.hoiKhongQuyen };
	}
	const tran = await chamTran(tx, crmUserId, now);
	if (tran) {
		await ghiHang(tx, tin, crmUserId, now, tran.ketQua);
		return { loai: "tra-loi", text: tran.text };
	}
	if (await dangBan(tx, tin.chatId, now)) {
		await ghiHang(tx, tin, crmUserId, now, "dang-ban");
		return { loai: "tra-loi", text: ZALO.loi.dangTraLoi };
	}
	await tx.zaloHoi.updateMany({
		where: { zaloChatId: tin.chatId, ketQua: DANG_HOI },
		data: { ketQua: "loi" },
	});
	const hoiId = await ghiHang(tx, tin, crmUserId, now, DANG_HOI);
	return {
		loai: "hoi",
		yeuCau: {
			hoiId,
			chatId: tin.chatId,
			text: tin.text,
			auth: {
				...principal,
				attributes: {
					purpose: ZALO.hoi.purpose,
					userId: crmUserId,
					zaloChatId: tin.chatId,
					hoiId,
				},
			},
			continuationToken: tokenPhien(tin.chatId, crmUserId, now),
		},
	};
}

export async function hangDangHoi(chatId: string): Promise<HangDangHoi | null> {
	return db.zaloHoi.findFirst({
		where: { zaloChatId: chatId, ketQua: DANG_HOI },
		orderBy: { hoiLuc: "desc" },
		select: {
			id: true,
			messageId: true,
			zaloChatId: true,
			hoiLuc: true,
			sessionId: true,
		},
	});
}

export async function dongHoi(hoiId: string, ket: KetDong): Promise<boolean> {
	const { count } = await db.zaloHoi.updateMany({
		where: { id: hoiId, ketQua: DANG_HOI },
		data: ket,
	});
	return count === 1;
}

export type PhuThuocDong = {
	now?: () => Date;
	fetcher?: typeof fetch;
	token?: string | null;
};

export async function dongHoiQuaHan(deps: PhuThuocDong = {}): Promise<number> {
	const now = (deps.now ?? (() => new Date()))();
	const quaHan = await db.zaloHoi.findMany({
		where: {
			ketQua: DANG_HOI,
			hoiLuc: { lte: new Date(now.getTime() - ZALO.hoi.hanTraLoiMs) },
		},
		select: { id: true, messageId: true, zaloChatId: true },
	});
	const token = deps.token === undefined ? await zaloToken() : deps.token;
	let daDong = 0;
	for (const hang of quaHan) {
		if (!(await dongHoi(hang.id, { ketQua: "loi" }))) continue;
		daDong += 1;
		if (!token) continue;
		try {
			await guiZalo(token, hang.zaloChatId, ZALO.loi.tacTuLoi, {
				fetcher: deps.fetcher,
			});
		} catch (loi) {
			console.error(
				`[zalo] gui bao loi qua han hong message_id=${hang.messageId}: ${loi instanceof Error ? moTaLoiZalo(loi) : "khong-ro"}`,
			);
		}
	}
	return daDong;
}
