import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { motTrong, TRO_LY_OKR_TRAN } from "./okr-tro-ly-danh-muc";

type DbHoacTx = Db | Prisma.TransactionClient;

export const CAP_CUOC = ["onehub", "bo-phan", "phong-ban"] as const;
export const NAC_CUOC = ["an", "bat"] as const;
export const TRANG_THAI_CUOC = ["dang", "da-dua-vao", "bo"] as const;

export type CuocSoan = {
	id: string;
	cycleId: string;
	level: (typeof CAP_CUOC)[number];
	divisionId: string | null;
	departmentId: string | null;
	nguoiMoUserId: string;
	sessionId: string;
	cacPhien: string[];
	nac: (typeof NAC_CUOC)[number];
	trangThai: (typeof TRANG_THAI_CUOC)[number];
	soLuot: number;
	streamIndex: number;
	continuationToken: string | null;
	daCat: Prisma.JsonValue | null;
	duaVaoLuc: Date | null;
	createdAt: Date;
};

const COT = {
	id: true,
	cycleId: true,
	level: true,
	divisionId: true,
	departmentId: true,
	nguoiMoUserId: true,
	sessionId: true,
	cacPhien: true,
	nac: true,
	trangThai: true,
	soLuot: true,
	streamIndex: true,
	continuationToken: true,
	daCat: true,
	duaVaoLuc: true,
	createdAt: true,
} as const;

type Hang = Prisma.OkrCuocSoanGetPayload<{ select: typeof COT }>;

function docHang(h: Hang): CuocSoan {
	return {
		...h,
		level: motTrong(CAP_CUOC, h.level, "okrCuocSoan.level"),
		nac: motTrong(NAC_CUOC, h.nac, "okrCuocSoan.nac"),
		trangThai: motTrong(TRANG_THAI_CUOC, h.trangThai, "okrCuocSoan.trangThai"),
	};
}

export type DonViCuocSoan = {
	cycleId: string;
	level: CuocSoan["level"];
	divisionId: string | null;
	departmentId: string | null;
};

export async function moCuoc(
	db: DbHoacTx,
	v: DonViCuocSoan & {
		nguoiMoUserId: string;
		sessionId: string;
		nac: CuocSoan["nac"];
	},
): Promise<CuocSoan> {
	return docHang(
		await db.okrCuocSoan.create({
			data: { ...v, cacPhien: [v.sessionId] },
			select: COT,
		}),
	);
}

export async function docCuoc(
	db: DbHoacTx,
	id: string,
): Promise<CuocSoan | null> {
	const h = await db.okrCuocSoan.findUnique({
		where: { id },
		select: COT,
	});
	return h ? docHang(h) : null;
}

export async function docCuocTheoDonVi(
	db: DbHoacTx,
	v: DonViCuocSoan,
): Promise<CuocSoan[]> {
	const hs = await db.okrCuocSoan.findMany({
		where: {
			cycleId: v.cycleId,
			level: v.level,
			divisionId: v.divisionId,
			departmentId: v.departmentId,
		},
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		select: COT,
	});
	return hs.map(docHang);
}

export async function capNhatPhien(
	db: DbHoacTx,
	cuocId: string,
	sessionId: string,
): Promise<{ doi: boolean }> {
	const cu = await db.okrCuocSoan.findUnique({
		where: { id: cuocId },
		select: { sessionId: true, cacPhien: true },
	});
	if (!cu || cu.sessionId === sessionId) return { doi: false };
	const { count } = await db.okrCuocSoan.updateMany({
		where: { id: cuocId, sessionId: cu.sessionId, trangThai: "dang" },
		data: {
			sessionId,
			cacPhien: [...new Set([...cu.cacPhien, cu.sessionId, sessionId])],
			continuationToken: null,
			streamIndex: 0,
		},
	});
	return { doi: count === 1 };
}

export const LY_DO_TANG_LUOT = ["het-luot-cuoc", "cuoc-khong-dang"] as const;

export type KetQuaTangLuot =
	| { ok: true; soLuot: number }
	| { ok: false; lyDo: (typeof LY_DO_TANG_LUOT)[number] };

export async function tangLuot(
	db: DbHoacTx,
	cuocId: string,
	tran: number = TRO_LY_OKR_TRAN.soan.luotMoiCuoc,
): Promise<KetQuaTangLuot> {
	const { count } = await db.okrCuocSoan.updateMany({
		where: { id: cuocId, trangThai: "dang", soLuot: { lt: tran } },
		data: { soLuot: { increment: 1 } },
	});
	const sau = await db.okrCuocSoan.findUnique({
		where: { id: cuocId },
		select: { soLuot: true, trangThai: true },
	});
	if (!sau) throw new Error(`okrCuocSoan không có: ${cuocId}`);
	if (count === 1) return { ok: true, soLuot: sau.soLuot };
	return {
		ok: false,
		lyDo: sau.trangThai === "dang" ? "het-luot-cuoc" : "cuoc-khong-dang",
	};
}

export async function daCat(
	db: DbHoacTx,
	cuocId: string,
	bang: Prisma.InputJsonValue,
): Promise<void> {
	await db.okrCuocSoan.update({ where: { id: cuocId }, data: { daCat: bang } });
}
