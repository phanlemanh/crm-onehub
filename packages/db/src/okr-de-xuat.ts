import type { Db } from "./client";
import type { OkrDeXuat, Prisma } from "./generated/prisma/client";
import { motTrong } from "./okr-tro-ly-danh-muc";

type DbHoacTx = Db | Prisma.TransactionClient;

const TRUONG_VIET_LAI = ["title", "whyNow", "kr.title"] as const;

export type KiemLai = (
	hang: OkrDeXuat,
) => { qua: true } | { qua: false; maLoai: string };

export type DanhSachDeXuat = {
	dong: OkrDeXuat[];
	dangSoan: boolean;
	maKetThuc: string | null;
};

type MucTieuHienTai = {
	title: string;
	whyNow: string;
	keyResults: { id: string; title: string }[];
};

function giaTriHienTai(mt: MucTieuHienTai, hang: OkrDeXuat): string | null {
	const truong = motTrong(
		TRUONG_VIET_LAI,
		hang.truong ?? "",
		"okrDeXuat.truong",
	);
	if (truong === "title") return mt.title;
	if (truong === "whyNow") return mt.whyNow;
	return mt.keyResults.find((k) => k.id === hang.keyResultId)?.title ?? null;
}

export async function danhSachDeXuat(
	db: DbHoacTx,
	v: {
		objectiveId: string;
		keyResultIds: readonly string[] | "moi";
		nac: "bat";
		now: Date;
		kiemLai: KiemLai;
	},
): Promise<DanhSachDeXuat> {
	const [mt, hang, viec] = await Promise.all([
		db.okrObjective.findUnique({
			where: { id: v.objectiveId },
			select: {
				title: true,
				whyNow: true,
				keyResults: { select: { id: true, title: true } },
			},
		}),
		db.okrDeXuat.findMany({
			where: {
				objectiveId: v.objectiveId,
				nac: v.nac,
				trangThai: "cho",
				keyResultId:
					v.keyResultIds === "moi" ? undefined : { in: [...v.keyResultIds] },
			},
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		}),
		db.agentTask.findFirst({
			where: {
				kind: "okr-de-xuat",
				AND: [
					{ payload: { path: ["objectiveId"], equals: v.objectiveId } },
					{ payload: { path: ["nac"], equals: v.nac } },
				],
			},
			orderBy: { createdAt: "desc" },
			select: { finishedAt: true, outcome: true },
		}),
	]);
	const trangThaiViec = {
		dangSoan: viec !== null && viec.finishedAt === null,
		maKetThuc: viec?.outcome ?? null,
	};
	if (!mt) return { dong: [], ...trangThaiViec };
	const hetHan = hang.filter(
		(h) => h.loai === "viet-lai" && giaTriHienTai(mt, h) !== h.truoc,
	);
	if (hetHan.length > 0) {
		await db.okrDeXuat.updateMany({
			where: { id: { in: hetHan.map((h) => h.id) }, trangThai: "cho" },
			data: { trangThai: "het-han" },
		});
	}
	const hetHanId = new Set(hetHan.map((h) => h.id));
	const qua = hang.filter((h) => !hetHanId.has(h.id) && v.kiemLai(h).qua);
	const lanDau = qua.filter((h) => h.hienLuc === null).map((h) => h.id);
	if (lanDau.length > 0) {
		await db.okrDeXuat.updateMany({
			where: { id: { in: lanDau }, hienLuc: null },
			data: { hienLuc: v.now },
		});
	}
	return {
		dong: qua.map((h) => (h.hienLuc === null ? { ...h, hienLuc: v.now } : h)),
		...trangThaiViec,
	};
}
