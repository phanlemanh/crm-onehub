import { type Db, Prisma } from "@crm/db";
import { khungThangVN } from "@crm/db/ai-chi-phi";
import {
	daNhanDeXuat,
	MINUTE_MS,
	NGAY_MS,
	TRO_LY_OKR_TRAN,
} from "@crm/db/okr-tro-ly-danh-muc";
import { maLoaiDeXuat } from "@crm/validation/okr-tro-ly";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { z } from "zod";
import type { SoDoNac } from "./okr.contracts";
import { OKR } from "./okr-config";

type DbHoacTx = Db | Prisma.TransactionClient;
type OkrDeXuat = Prisma.OkrDeXuatModel;

export const NAC_LUOT = ["bat", "an"] as const;

export type NacLuot = (typeof NAC_LUOT)[number];

export type LuotThang = {
	id: string;
	nac: NacLuot;
	payload: Prisma.JsonValue;
	taoLuc: Date;
	xongLuc: Date | null;
	ketQua: string | null;
	sessionId: string | null;
	dong: OkrDeXuat[];
	tien: Prisma.Decimal;
};

export type SoThang = { luot: LuotThang[]; hoanTac: ReadonlySet<string> };

const HAN_HOAN_TAC_MS = TRO_LY_OKR_TRAN.hoanTacNgay * NGAY_MS;
const CHU_SO_TY_LE = 4;
const CHU_SO_TIEN = 6;
const CHU_SO_THUC = 15;

const nacTho = z.object({
	nac: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

function nacCuaPayload(payload: Prisma.JsonValue): string {
	const doc = nacTho.safeParse(payload);
	if (!doc.success || doc.data.nac === undefined) return "bat";
	return String(doc.data.nac);
}

const laNacLuot = (nac: string): nac is NacLuot =>
	(NAC_LUOT as readonly string[]).includes(nac);

export const ghiChuVet = (deXuatId: string) =>
	`${OKR.troLy.ghiChuVet}${deXuatId}`;

type ChiPhi = {
	taskId: string | null;
	sessionId: string;
	phienCha: string | null;
	costUsd: Prisma.Decimal | null;
};

function khopChiPhi(c: ChiPhi, l: { id: string; sessionId: string | null }) {
	if (c.taskId === l.id) return true;
	return (
		c.taskId === null &&
		l.sessionId !== null &&
		(c.sessionId === l.sessionId || c.phienCha === l.sessionId)
	);
}

const chuoiVet = z.string();

function giaTriVet(after: Prisma.JsonValue, khoa: string): string | null {
	const doc = chuoiVet.safeParse(parseOkrVet(after)?.[khoa]);
	return doc.success ? doc.data : null;
}

async function hoanTacTrong(
	db: DbHoacTx,
	daNhan: OkrDeXuat[],
): Promise<Set<string>> {
	const vietLai = daNhan.filter((d) => d.loai === "viet-lai");
	if (vietLai.length === 0) return new Set();
	const vetNhan = await db.okrTrail.findMany({
		where: { note: { in: vietLai.map((d) => ghiChuVet(d.id)) } },
		select: { note: true, at: true },
	});
	if (vetNhan.length === 0) return new Set();
	const tuLuc = new Date(Math.min(...vetNhan.map((v) => v.at.getTime())));
	const sau = await db.okrTrail.findMany({
		where: {
			action: { in: ["sua", "sua-kr"] },
			at: { gt: tuLuc },
			OR: [
				{ objectiveId: { in: vietLai.map((d) => d.objectiveId) } },
				{
					keyResultId: {
						in: vietLai.flatMap((d) => (d.keyResultId ? [d.keyResultId] : [])),
					},
				},
			],
		},
		select: {
			action: true,
			objectiveId: true,
			keyResultId: true,
			at: true,
			after: true,
		},
	});
	const veTruoc = (d: OkrDeXuat, h: (typeof sau)[number]) => {
		if (d.truong === "kr.title")
			return (
				h.action === "sua-kr" &&
				h.keyResultId === d.keyResultId &&
				giaTriVet(h.after, "title") === d.truoc
			);
		return (
			h.action === "sua" &&
			h.objectiveId === d.objectiveId &&
			d.truong !== null &&
			giaTriVet(h.after, d.truong) === d.truoc
		);
	};
	return new Set(
		vietLai
			.filter((d) =>
				vetNhan
					.filter((n) => n.note === ghiChuVet(d.id))
					.some((n) =>
						sau.some(
							(h) =>
								h.at > n.at &&
								h.at.getTime() <= n.at.getTime() + HAN_HOAN_TAC_MS &&
								veTruoc(d, h),
						),
					),
			)
			.map((d) => d.id),
	);
}

export async function docThang(db: DbHoacTx, thang: string): Promise<SoThang> {
	const { tu, den } = khungThangVN(thang);
	const viec = await db.agentTask.findMany({
		where: { kind: "okr-de-xuat", createdAt: { gte: tu, lt: den } },
		orderBy: [{ createdAt: "desc" }, { id: "asc" }],
		select: {
			id: true,
			payload: true,
			createdAt: true,
			finishedAt: true,
			outcome: true,
			sessionId: true,
		},
	});
	const luot = viec.flatMap((v) => {
		const nac = nacCuaPayload(v.payload);
		return laNacLuot(nac) ? [{ ...v, nac }] : [];
	});
	const ids = luot.map((l) => l.id);
	const phien = luot.flatMap((l) => (l.sessionId ? [l.sessionId] : []));
	const [dong, chi] = await Promise.all([
		db.okrDeXuat.findMany({
			where: { taskId: { in: ids } },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		}),
		db.aiChiPhi.findMany({
			where: {
				OR: [
					{ taskId: { in: ids } },
					{ taskId: null, sessionId: { in: phien } },
					{ taskId: null, phienCha: { in: phien } },
				],
			},
			select: { taskId: true, sessionId: true, phienCha: true, costUsd: true },
		}),
	]);
	const hoanTac = await hoanTacTrong(
		db,
		dong.filter((d) => daNhanDeXuat(d.trangThai)),
	);
	return {
		hoanTac,
		luot: luot.map((l) => ({
			id: l.id,
			nac: l.nac,
			payload: l.payload,
			taoLuc: l.createdAt,
			xongLuc: l.finishedAt,
			ketQua: l.outcome,
			sessionId: l.sessionId,
			dong: dong.filter((d) => d.taskId === l.id),
			tien: chi
				.filter((c) => khopChiPhi(c, l))
				.reduce((s, c) => s.plus(c.costUsd ?? 0), new Prisma.Decimal(0)),
		})),
	};
}

export function doTreMs(l: LuotThang): number | null {
	const dau = l.dong.reduce<Date | null>(
		(min, d) => (min === null || d.createdAt < min ? d.createdAt : min),
		null,
	);
	const moc = dau ?? l.xongLuc;
	return moc === null ? null : moc.getTime() - l.taoLuc.getTime();
}

export function phanVi(so: readonly number[], p: number): number | null {
	if (so.length === 0) return null;
	const xep = [...so].sort((a, b) => a - b);
	const viTri = p * (xep.length - 1);
	const duoi = Math.floor(viTri);
	const a = xep[duoi] ?? 0;
	const b = xep[Math.ceil(viTri)] ?? a;
	return Math.round(
		Number((a + (viTri - duoi) * (b - a)).toPrecision(CHU_SO_THUC)),
	);
}

export const tyLe = (tu: number, mau: number) =>
	mau === 0
		? null
		: new Prisma.Decimal(tu).div(mau).toDecimalPlaces(CHU_SO_TY_LE).toNumber();

export const chiaTien = (tien: Prisma.Decimal, mau: number) =>
	mau === 0 ? null : tien.div(mau).toDecimalPlaces(CHU_SO_TIEN).toNumber();

export const lamTronTien = (tien: Prisma.Decimal) =>
	tien.toDecimalPlaces(CHU_SO_TIEN).toNumber();

const PHAN_VI = { giua: 0.5, cao: 0.9 } as const;

export function soDoCua(so: SoThang, nac: NacLuot): SoDoNac {
	const cua = so.luot.filter((l) => l.nac === nac);
	const dong = cua.flatMap((l) => l.dong);
	const daHien = dong.filter((d) => d.hienLuc !== null);
	const dem = (trangThai: string) =>
		daHien.filter((d) => d.trangThai === trangThai).length;
	const [nhan, sua, bac, boQua] = [
		dem("nhan"),
		dem("sua"),
		dem("bac"),
		dem("bo-qua"),
	];
	const daNhan = dong.filter((d) => daNhanDeXuat(d.trangThai));
	const hoanTac = daNhan.filter((d) => so.hoanTac.has(d.id)).length;
	const tre = cua.flatMap((l) => {
		const ms = doTreMs(l);
		return ms === null ? [] : [ms];
	});
	const biLoai = dong.filter((d) => d.trangThai === "bi-loai");
	const theoMa = new Map<string, number>();
	for (const d of biLoai) {
		const ma = maLoaiDeXuat.parse(d.maLoai);
		theoMa.set(ma, (theoMa.get(ma) ?? 0) + 1);
	}
	const tien = cua.reduce((s, l) => s.plus(l.tien), new Prisma.Decimal(0));
	return {
		soLuot: cua.length,
		sinhRa: dong.filter((d) => d.trangThai !== "bi-loai").length,
		daHien: daHien.length,
		nhan,
		sua,
		bac,
		boQua,
		tyLeNhan: tyLe(nhan, daHien.length),
		tyLeSua: tyLe(sua, daHien.length),
		tyLeBac: tyLe(bac, daHien.length),
		tyLeBoQua: tyLe(boQua, daHien.length),
		tyLeDuocNhan: tyLe(nhan + sua, daHien.length),
		daNhan: daNhan.length,
		hoanTac,
		tyLeHoanTac: tyLe(hoanTac, daNhan.length),
		soLuotDo: tre.length,
		p50Ms: phanVi(tre, PHAN_VI.giua),
		p90Ms: phanVi(tre, PHAN_VI.cao),
		tongCau: dong.length,
		biLoai: biLoai.length,
		tyLeBiLoai: tyLe(biLoai.length, dong.length),
		theoMa: [...theoMa.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([ma, soDong]) => ({ maLoai: maLoaiDeXuat.parse(ma), so: soDong })),
		tienUsd: lamTronTien(tien),
		chiPhiMoiNhanUsd: chiaTien(tien, daNhan.length),
		chiPhiMoiLuotUsd: chiaTien(tien, cua.length),
	};
}
