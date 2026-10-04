import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import {
	type DonViMucTieu,
	motTrong,
	TRO_LY_OKR_TRAN,
} from "./okr-tro-ly-danh-muc";

type DbHoacTx = Db | Prisma.TransactionClient;

export const CAP_CUOC = ["onehub", "bo-phan", "phong-ban"] as const;
export const NAC_CUOC = ["an", "bat"] as const;
export const TRANG_THAI_CUOC = ["dang", "da-dua-vao", "bo"] as const;
export const LOAI_DONG_NHAP = [
	"muc-tieu-moi",
	"kr-moi",
	"can-chinh-moi",
] as const;

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
	lanNopMoiNhat: string | null;
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
	lanNopMoiNhat: true,
	daCat: true,
	duaVaoLuc: true,
	createdAt: true,
} as const;

type Hang = Prisma.OkrCuocSoanGetPayload<{ select: typeof COT }>;

export function cuocTuHang(h: Hang): CuocSoan {
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

export function donViCuoc(cuoc: CuocSoan): DonViCuocSoan {
	return {
		cycleId: cuoc.cycleId,
		level: cuoc.level,
		divisionId: cuoc.divisionId,
		departmentId: cuoc.departmentId,
	};
}

export async function donViAiCuaCuoc(
	db: DbHoacTx,
	dv: DonViCuocSoan,
): Promise<DonViMucTieu> {
	if (dv.level === "onehub")
		return { onehub: true, boPhanId: null, phongBanId: null };
	if (dv.level === "bo-phan")
		return { onehub: false, boPhanId: dv.divisionId, phongBanId: null };
	const phong =
		dv.departmentId === null
			? null
			: await db.department.findUnique({
					where: { id: dv.departmentId },
					select: { divisionId: true },
				});
	return {
		onehub: false,
		boPhanId: phong?.divisionId ?? null,
		phongBanId: dv.departmentId,
	};
}

export function dieuKienDonVi(v: DonViCuocSoan): Prisma.OkrCuocSoanWhereInput {
	if (v.level === "onehub") return { cycleId: v.cycleId, level: "onehub" };
	if (v.level === "bo-phan")
		return { cycleId: v.cycleId, level: "bo-phan", divisionId: v.divisionId };
	return {
		cycleId: v.cycleId,
		level: "phong-ban",
		departmentId: v.departmentId,
	};
}

export async function moCuoc(
	db: DbHoacTx,
	v: DonViCuocSoan & {
		nguoiMoUserId: string;
		sessionId: string;
		nac: CuocSoan["nac"];
	},
): Promise<CuocSoan> {
	return cuocTuHang(
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
	return h ? cuocTuHang(h) : null;
}

export async function docCuocTheoDonVi(
	db: DbHoacTx,
	v: DonViCuocSoan,
): Promise<CuocSoan[]> {
	const hs = await db.okrCuocSoan.findMany({
		where: dieuKienDonVi(v),
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		select: COT,
	});
	return hs.map(cuocTuHang);
}

export async function cuocDang(
	db: DbHoacTx,
	v: DonViCuocSoan,
): Promise<CuocSoan | null> {
	const h = await db.okrCuocSoan.findFirst({
		where: { ...dieuKienDonVi(v), trangThai: "dang" },
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		select: COT,
	});
	return h ? cuocTuHang(h) : null;
}

export async function demCuocTrongKy(
	db: DbHoacTx,
	v: DonViCuocSoan,
): Promise<number> {
	return db.okrCuocSoan.count({
		where: { ...dieuKienDonVi(v), soLuot: { gt: 0 } },
	});
}

export async function capNhatPhien(
	db: DbHoacTx,
	cuocId: string,
	sessionId: string,
	tuPhien?: string,
): Promise<{ doi: boolean }> {
	const cu = await db.okrCuocSoan.findUnique({
		where: { id: cuocId },
		select: { sessionId: true, cacPhien: true },
	});
	if (!cu || cu.sessionId === sessionId) return { doi: false };
	if (tuPhien !== undefined && cu.sessionId !== tuPhien) return { doi: false };
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

export async function noiPhienMoCoi(
	db: DbHoacTx,
	cuocId: string,
	sessionId: string,
): Promise<{ noi: boolean }> {
	const { count } = await db.okrCuocSoan.updateMany({
		where: {
			id: cuocId,
			trangThai: "dang",
			NOT: { cacPhien: { has: sessionId } },
		},
		data: { cacPhien: { push: sessionId } },
	});
	return { noi: count === 1 };
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
