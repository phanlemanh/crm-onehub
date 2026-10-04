import {
	chiTieuThang,
	doiSoatGanNhat,
	thangTruoc,
	thangVN,
} from "./ai-chi-phi";
import { mocBaoTran } from "./ai-chi-phi-danh-muc";
import type { Db } from "./client";
import { cauHinhAiLuc, tranThangCuaThang } from "./okr-tro-ly";
import { WORKSPACE_ID } from "./workspace";

export const LOAI_NHAC_AI = ["ai-tran", "ai-doi-soat-lech"] as const;

export type LoaiNhacAi = (typeof LOAI_NHAC_AI)[number];

export const VAI_NHAN_BAO_AI = ["owner", "admin"] as const;

export const MUC_BAO_DOI_SOAT = 0;

export type ViecAi =
	| {
			loai: "ai-tran";
			thang: string;
			muc: 80 | 100;
			chiUsd: number;
			tranUsd: number;
	  }
	| {
			loai: "ai-doi-soat-lech";
			thang: string;
			soSoUsd: number;
			soGatewayUsd: number;
			lechPhanTram: number;
	  };

export function mucCuaViecAi(v: ViecAi): number {
	return v.loai === "ai-tran" ? v.muc : MUC_BAO_DOI_SOAT;
}

async function viecChung(db: Db, now: Date): Promise<ViecAi[]> {
	const thang = thangVN(now);
	const [cauHinh, chi, doiSoat] = await Promise.all([
		cauHinhAiLuc(db, now),
		chiTieuThang(db, thang, now),
		doiSoatGanNhat(db, now),
	]);
	const ds: ViecAi[] = [];
	const tran = await tranThangCuaThang(db, cauHinh, thang);
	const muc = mocBaoTran(chi.troLyOkrUsd, tran);
	if (muc !== 0) {
		ds.push({
			loai: "ai-tran",
			thang,
			muc,
			chiUsd: chi.troLyOkrUsd,
			tranUsd: tran,
		});
	}
	if (
		doiSoat?.ketQua === "lech" &&
		doiSoat.thang === thangTruoc(thang) &&
		doiSoat.soGatewayUsd !== null &&
		doiSoat.lechPhanTram !== null
	) {
		ds.push({
			loai: "ai-doi-soat-lech",
			thang: doiSoat.thang,
			soSoUsd: doiSoat.soSoUsd,
			soGatewayUsd: doiSoat.soGatewayUsd,
			lechPhanTram: doiSoat.lechPhanTram,
		});
	}
	return ds;
}

export async function viecAiCanNhac(
	db: Db,
	chon: { now: Date; userId?: string },
): Promise<Map<string, ViecAi[]>> {
	const [quanTri, chung] = await Promise.all([
		db.member.findMany({
			where: {
				organizationId: WORKSPACE_ID,
				userId: chon.userId,
				role: { in: [...VAI_NHAN_BAO_AI] },
			},
			select: { userId: true },
		}),
		viecChung(db, chon.now),
	]);
	if (chung.length === 0 || quanTri.length === 0) return new Map();
	const daBao = await db.aiBaoTran.findMany({
		where: {
			userId: { in: quanTri.map((m) => m.userId) },
			OR: chung.map((v) => ({ thang: v.thang, muc: mucCuaViecAi(v) })),
		},
		select: { thang: true, muc: true, userId: true },
	});
	const da = new Set(daBao.map((b) => `${b.userId}|${b.thang}|${b.muc}`));
	return new Map(
		quanTri.flatMap(({ userId }) => {
			const ds = chung.filter(
				(v) => !da.has(`${userId}|${v.thang}|${mucCuaViecAi(v)}`),
			);
			return ds.length === 0 ? [] : [[userId, ds] as const];
		}),
	);
}

export async function ghiDaBaoAi(
	db: Db,
	userId: string,
	ds: readonly ViecAi[],
): Promise<void> {
	if (ds.length === 0) return;
	await db.aiBaoTran.createMany({
		data: ds.map((v) => ({ thang: v.thang, muc: mucCuaViecAi(v), userId })),
		skipDuplicates: true,
	});
}
