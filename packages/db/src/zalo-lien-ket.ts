import { createHash, randomInt } from "node:crypto";
import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

export type DbGhi = Db | Prisma.TransactionClient;

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

export const ZALO_LIEN_KET = {
	ma: { soChuSo: 6, songMs: 15 * MINUTE_MS },
	doMa: { toiDa: 5, cuaSoMs: HOUR_MS },
	imSauMs: 5 * MINUTE_MS,
} as const;

const MA = new RegExp(`^\\d{${ZALO_LIEN_KET.ma.soChuSo}}$`);

export function chuanHoaMa(chu: string): string | null {
	const gon = chu.replace(/\s+/g, "");
	return MA.test(gon) ? gon : null;
}

export function bamMa(ma: string): string {
	return createHash("sha256").update(ma).digest("hex");
}

function sinhMa(): string {
	const tran = 10 ** ZALO_LIEN_KET.ma.soChuSo;
	return String(randomInt(0, tran)).padStart(ZALO_LIEN_KET.ma.soChuSo, "0");
}

export async function taoMaLienKet(
	db: Db,
	userId: string,
	now: Date = new Date(),
): Promise<{ ma: string; expiresAt: Date }> {
	const ma = sinhMa();
	const codeHash = bamMa(ma);
	const expiresAt = new Date(now.getTime() + ZALO_LIEN_KET.ma.songMs);
	await db.zaloLinkCode.upsert({
		where: { crmUserId: userId },
		create: { crmUserId: userId, codeHash, expiresAt, createdAt: now },
		update: { codeHash, expiresAt, usedAt: null, createdAt: now },
	});
	return { ma, expiresAt };
}

export type TrangThaiLienKet =
	| { loai: "chua-noi" }
	| { loai: "ma-cho"; expiresAt: Date }
	| { loai: "ma-het-han" }
	| { loai: "da-noi"; tenZalo: string };

export async function trangThaiLienKet(
	db: Db,
	userId: string,
	now: Date = new Date(),
): Promise<TrangThaiLienKet> {
	const [lienKet, ma] = await Promise.all([
		db.zaloLink.findUnique({ where: { crmUserId: userId } }),
		db.zaloLinkCode.findUnique({ where: { crmUserId: userId } }),
	]);
	if (lienKet) return { loai: "da-noi", tenZalo: lienKet.zaloDisplayName };
	if (!ma || ma.usedAt) return { loai: "chua-noi" };
	if (ma.expiresAt.getTime() <= now.getTime()) return { loai: "ma-het-han" };
	return { loai: "ma-cho", expiresAt: ma.expiresAt };
}

function veAutoNeuZalo(db: DbGhi, userId: string) {
	return db.notificationPreference.updateMany({
		where: { userId, channel: "ZALO" },
		data: { channel: "AUTO" },
	});
}

export async function goLienKet(db: Db, userId: string): Promise<void> {
	await db.$transaction([
		db.zaloLink.deleteMany({ where: { crmUserId: userId } }),
		veAutoNeuZalo(db, userId),
	]);
}

export function demLienKet(db: DbGhi): Promise<number> {
	return db.zaloLink.count();
}

export async function goHetLienKet(db: DbGhi): Promise<number> {
	const { count } = await db.zaloLink.deleteMany({});
	return count;
}

function conCuaSo(batDau: Date, now: Date): boolean {
	return now.getTime() - batDau.getTime() < ZALO_LIEN_KET.doMa.cuaSoMs;
}

export async function dangBiChan(
	db: DbGhi,
	zaloUserId: string,
	now: Date,
): Promise<boolean> {
	const dem = await db.zaloLinkAttempt.findUnique({ where: { zaloUserId } });
	if (!dem) return false;
	return (
		conCuaSo(dem.windowStartedAt, now) &&
		dem.failures >= ZALO_LIEN_KET.doMa.toiDa
	);
}

export async function ghiSai(
	db: DbGhi,
	zaloUserId: string,
	now: Date,
): Promise<void> {
	const dem = await db.zaloLinkAttempt.findUnique({ where: { zaloUserId } });
	const moCuaSoMoi = !dem || !conCuaSo(dem.windowStartedAt, now);
	await db.zaloLinkAttempt.upsert({
		where: { zaloUserId },
		create: { zaloUserId, failures: 1, windowStartedAt: now },
		update: moCuaSoMoi
			? { failures: 1, windowStartedAt: now }
			: { failures: { increment: 1 } },
	});
}

export type KetQuaNoi =
	| { loai: "da-noi"; crmUserId: string; tenCrm: string }
	| { loai: "ma-hong" };

export type ChonNoi = {
	ma: string;
	zaloUserId: string;
	tenZalo: string;
	now: Date;
};

async function noiTrong(
	db: Prisma.TransactionClient,
	chon: ChonNoi,
): Promise<KetQuaNoi> {
	const hang = await db.zaloLinkCode.findUnique({
		where: { codeHash: bamMa(chon.ma) },
		include: { crmUser: { select: { name: true } } },
	});
	if (!hang || hang.usedAt || hang.expiresAt.getTime() <= chon.now.getTime()) {
		return { loai: "ma-hong" };
	}
	const cu = await db.zaloLink.findUnique({
		where: { zaloUserId: chon.zaloUserId },
	});
	await db.zaloLink.deleteMany({
		where: {
			OR: [{ zaloUserId: chon.zaloUserId }, { crmUserId: hang.crmUserId }],
		},
	});
	await db.zaloLink.create({
		data: {
			crmUserId: hang.crmUserId,
			zaloUserId: chon.zaloUserId,
			zaloDisplayName: chon.tenZalo,
		},
	});
	await db.zaloLinkCode.update({
		where: { id: hang.id },
		data: { usedAt: chon.now },
	});
	if (cu && cu.crmUserId !== hang.crmUserId) {
		await veAutoNeuZalo(db, cu.crmUserId);
	}
	return {
		loai: "da-noi",
		crmUserId: hang.crmUserId,
		tenCrm: hang.crmUser.name,
	};
}

export async function noiBangMa(db: DbGhi, chon: ChonNoi): Promise<KetQuaNoi> {
	if ("$transaction" in db) return db.$transaction((tx) => noiTrong(tx, chon));
	return noiTrong(db, chon);
}
