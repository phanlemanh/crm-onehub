import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import {
	MINUTE_MS,
	motTrong,
	NGAY_MS,
	TRO_LY_OKR_TRAN,
} from "./okr-tro-ly-danh-muc";

type DbHoacTx = Db | Prisma.TransactionClient;

export const KIEU_KR = [
	"tang-toi",
	"giam-xuong",
	"giu-tren",
	"giu-duoi",
	"moc",
	"phan-tram",
] as const;

export type KieuKr = (typeof KIEU_KR)[number];

export type DiemXuHuong = { tuan: Date; giaTri: number };

export type XuHuong = { moiTuan: number; uocCuoiKy: number };

export type DiemCuaKr = {
	diem: DiemXuHuong[];
	ketThucKy: Date;
	kieu: KieuKr;
};

const TUAN_MS = 7 * NGAY_MS;

const TRAM = 100;

const haiSoLe = (n: number) => Math.round(n * TRAM) / TRAM + 0;

const trungBinh = (so: readonly number[]) =>
	so.reduce((s, n) => s + n, 0) / so.length;

export function xuHuongKr(
	diem: readonly DiemXuHuong[],
	ketThucKy: Date,
	kieu: KieuKr,
): XuHuong | null {
	if (kieu === "moc") return null;
	const theoTuan = [
		...new Map(diem.map((d) => [d.tuan.getTime(), d.giaTri])).entries(),
	].sort(([a], [b]) => a - b);
	const dau = theoTuan[0];
	if (!dau || theoTuan.length < TRO_LY_OKR_TRAN.diemXuHuongToiThieu) {
		return null;
	}
	const diemX = theoTuan.map(([t, giaTri]) => ({
		x: (t - dau[0]) / TUAN_MS,
		y: giaTri,
	}));
	const tbX = trungBinh(diemX.map((d) => d.x));
	const tbY = trungBinh(diemX.map((d) => d.y));
	const sxx = diemX.reduce((s, d) => s + (d.x - tbX) ** 2, 0);
	const sxy = diemX.reduce((s, d) => s + (d.x - tbX) * (d.y - tbY), 0);
	const moiTuan = sxy / sxx;
	const xCuoi = (ketThucKy.getTime() - dau[0]) / TUAN_MS;
	const uoc = tbY + moiTuan * (xCuoi - tbX);
	const uocCuoiKy =
		kieu === "phan-tram" ? Math.min(TRAM, Math.max(0, uoc)) : uoc;
	return { moiTuan: haiSoLe(moiTuan), uocCuoiKy: haiSoLe(uocCuoiKy) };
}

function dauTuan(ngay: Date): Date {
	return new Date(ngay.getTime() - ((ngay.getUTCDay() + 6) % 7) * NGAY_MS);
}

export async function docDiemXuHuong(
	db: DbHoacTx,
	keyResultId: string,
): Promise<DiemCuaKr | null> {
	const kr = await db.okrKeyResult.findUnique({
		where: { id: keyResultId },
		select: {
			title: true,
			kind: true,
			source: true,
			objective: {
				select: {
					cycle: { select: { endsOn: true } },
					mangSangTu: { select: { tuObjectiveId: true } },
				},
			},
		},
	});
	if (!kr) return null;
	const kieu = motTrong(KIEU_KR, kr.kind, "okrKeyResult.kind");
	const ketThucKy = kr.objective.cycle.endsOn;
	if (kr.source === "crm") {
		const chup = await db.okrSoChup.findMany({
			where: { keyResultId, nguon: "crm" },
			orderBy: [{ ngay: "asc" }, { chupLuc: "asc" }],
			select: { ngay: true, giaTri: true },
		});
		return {
			diem: chup.map((c) => ({
				tuan: dauTuan(c.ngay),
				giaTri: c.giaTri.toNumber(),
			})),
			ketThucKy,
			kieu,
		};
	}
	const tuMucTieu = kr.objective.mangSangTu?.tuObjectiveId;
	if (!tuMucTieu) return null;
	const krCu = await db.okrKeyResult.findMany({
		where: { objectiveId: tuMucTieu, title: kr.title, kind: kr.kind },
		select: { id: true },
	});
	const cu = krCu.length === 1 ? krCu[0] : undefined;
	if (!cu) return null;
	const lan = await db.okrCheckIn.findMany({
		where: { keyResultId: cu.id },
		orderBy: [{ weekStart: "asc" }, { createdAt: "asc" }],
		select: { weekStart: true, value: true },
	});
	return {
		diem: lan.map((l) => ({ tuan: l.weekStart, giaTri: l.value.toNumber() })),
		ketThucKy,
		kieu,
	};
}
