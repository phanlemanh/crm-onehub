import {
	KET_QUA_DOI_SOAT,
	type KetQuaDoiSoat,
	TINH_NANG,
	TINH_NANG_TRO_LY_OKR,
	type TinhNang,
} from "./ai-chi-phi-danh-muc";
import type { Db } from "./client";
import { Prisma } from "./generated/prisma/client";
import { motTrong } from "./okr-tro-ly-danh-muc";
import { dauNgayVN, ngayVN } from "./onboarding-nhac";

type DbHoacTx = Db | Prisma.TransactionClient;

export type DongChiPhi = {
	id: string;
	at: Date;
	sessionId: string;
	phienCha: string | null;
	kenh: string | null;
	tinhNang: TinhNang;
	taskId: string | null;
	modelId: string | null;
	inputTokens: number | null;
	cacheReadTokens: number | null;
	outputTokens: number | null;
	costUsd: number | null;
};

export async function ghiChiPhi(db: DbHoacTx, dong: DongChiPhi): Promise<void> {
	await db.aiChiPhi.createMany({
		data: [
			{
				...dong,
				costUsd:
					dong.costUsd === null ? null : new Prisma.Decimal(dong.costUsd),
			},
		],
		skipDuplicates: true,
	});
}

export function thangVN(at: Date): string {
	return ngayVN(at).slice(0, 7);
}

export function thangSau(thang: string): string {
	const [nam, t] = thang.split("-").map(Number) as [number, number];
	return t === 12
		? `${nam + 1}-01`
		: `${nam}-${String(t + 1).padStart(2, "0")}`;
}

export function thangTruoc(thang: string): string {
	const [nam, t] = thang.split("-").map(Number) as [number, number];
	return t === 1 ? `${nam - 1}-12` : `${nam}-${String(t - 1).padStart(2, "0")}`;
}

function dauThangVN(thang: string): Date {
	return dauNgayVN(new Date(`${thang}-01T12:00:00+07:00`));
}

export type KhungThang = { tu: Date; den: Date };

export function khungThangVN(thang: string): KhungThang {
	return { tu: dauThangVN(thang), den: dauThangVN(thangSau(thang)) };
}

export function khungThangUTC(thang: string): KhungThang {
	return {
		tu: new Date(`${thang}-01T00:00:00Z`),
		den: new Date(`${thangSau(thang)}-01T00:00:00Z`),
	};
}

export type ChiTieuThang = {
	thang: string;
	theoTinhNang: Record<TinhNang, { soBuoc: number; usd: number }>;
	troLyOkrUsd: number;
	tongUsd: number;
};

export async function chiTieuKhung(
	db: DbHoacTx,
	tu: Date,
	den: Date,
): Promise<Omit<ChiTieuThang, "thang">> {
	const nhom = await db.aiChiPhi.groupBy({
		by: ["tinhNang"],
		where: { at: { gte: tu, lt: den } },
		_sum: { costUsd: true },
		_count: { _all: true },
	});
	const theoTinhNang = Object.fromEntries(
		TINH_NANG.map((t) => [t, { soBuoc: 0, usd: 0 }]),
	) as Record<TinhNang, { soBuoc: number; usd: number }>;
	for (const n of nhom) {
		const t = motTrong(TINH_NANG, n.tinhNang, "aiChiPhi.tinhNang");
		theoTinhNang[t] = {
			soBuoc: n._count._all,
			usd: n._sum.costUsd?.toNumber() ?? 0,
		};
	}
	const cong = (ds: readonly TinhNang[]) =>
		ds.reduce((s, t) => s + theoTinhNang[t].usd, 0);
	return {
		theoTinhNang,
		troLyOkrUsd: cong(TINH_NANG_TRO_LY_OKR),
		tongUsd: cong(TINH_NANG),
	};
}

export async function chiTieuThang(
	db: DbHoacTx,
	thang: string,
	truocLuc?: Date,
): Promise<ChiTieuThang> {
	const { tu, den } = khungThangVN(thang);
	const cuoi = truocLuc && truocLuc < den ? truocLuc : den;
	return { thang, ...(await chiTieuKhung(db, tu, cuoi)) };
}

export type DoiSoatDoc = {
	thang: string;
	soSoUsd: number;
	soGatewayUsd: number | null;
	lechPhanTram: number | null;
	ketQua: KetQuaDoiSoat;
	lyDo: string | null;
	luc: Date;
};

export async function ghiDoiSoat(
	db: DbHoacTx,
	v: Omit<DoiSoatDoc, "luc">,
): Promise<void> {
	const { tu, den } = khungThangUTC(v.thang);
	const du = {
		tuNgay: tu,
		denNgay: new Date(den.getTime() - 24 * 60 * 60 * 1000),
		soSoUsd: new Prisma.Decimal(v.soSoUsd),
		soGatewayUsd:
			v.soGatewayUsd === null ? null : new Prisma.Decimal(v.soGatewayUsd),
		lechPhanTram:
			v.lechPhanTram === null ? null : new Prisma.Decimal(v.lechPhanTram),
		ketQua: v.ketQua,
		lyDo: v.lyDo,
		luc: new Date(),
	};
	await db.aiDoiSoat.upsert({
		where: { thang: v.thang },
		create: { thang: v.thang, ...du },
		update: du,
	});
}

export async function doiSoatGanNhat(
	db: DbHoacTx,
	now: Date = new Date(),
): Promise<DoiSoatDoc | null> {
	const row = await db.aiDoiSoat.findFirst({
		where: { thang: { lt: thangVN(now) } },
		orderBy: { thang: "desc" },
	});
	if (!row) return null;
	return {
		thang: row.thang,
		soSoUsd: row.soSoUsd.toNumber(),
		soGatewayUsd: row.soGatewayUsd?.toNumber() ?? null,
		lechPhanTram: row.lechPhanTram?.toNumber() ?? null,
		ketQua: motTrong(KET_QUA_DOI_SOAT, row.ketQua, "aiDoiSoat.ketQua"),
		lyDo: row.lyDo,
		luc: row.luc,
	};
}
