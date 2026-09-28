import { createHash } from "node:crypto";
import { PRIORITY } from "./agent-tasks";
import { chiTieuThang, thangVN } from "./ai-chi-phi";
import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { lockIdempotencyKey } from "./idempotency";
import {
	AI_PHAM_VI,
	type CauHinhAi,
	type DonViMucTieu,
	donViDuocBat,
	KET_QUA_KIEM_SAN_SANG,
	type KetQuaKiemSanSang,
	type LyDoKhongSanSang,
	motTrong,
	phamViCuaViec,
	TRO_LY_OKR_TRAN,
	type TroLySanSang,
	type ViecTroLy,
} from "./okr-tro-ly-danh-muc";

type DbHoacTx = Db | Prisma.TransactionClient;

export const CAU_HINH_AI_MAC_DINH: CauHinhAi = {
	aiOn: false,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiTranThangUsd: TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
};

export async function cauHinhAiLuc(
	db: DbHoacTx,
	luc?: Date,
): Promise<CauHinhAi & { version: number }> {
	const row = await db.okrProgramConfig.findFirst({
		where: luc ? { createdAt: { lte: luc } } : undefined,
		orderBy: [{ createdAt: "desc" }, { version: "desc" }],
		select: {
			version: true,
			aiOn: true,
			aiDeXuatPhamVi: true,
			aiDeXuatDonVi: true,
			aiTomTatPhamVi: true,
			aiTomTatDonVi: true,
			aiTranThangUsd: true,
		},
	});
	if (!row) return { ...CAU_HINH_AI_MAC_DINH, version: 0 };
	return {
		version: row.version,
		aiOn: row.aiOn,
		aiDeXuatPhamVi: motTrong(AI_PHAM_VI, row.aiDeXuatPhamVi, "aiDeXuatPhamVi"),
		aiDeXuatDonVi: row.aiDeXuatDonVi,
		aiTomTatPhamVi: motTrong(AI_PHAM_VI, row.aiTomTatPhamVi, "aiTomTatPhamVi"),
		aiTomTatDonVi: row.aiTomTatDonVi,
		aiTranThangUsd: row.aiTranThangUsd.toNumber(),
	};
}

export async function donViCuaMucTieu(
	db: DbHoacTx,
	objectiveId: string,
): Promise<DonViMucTieu> {
	const mt = await db.okrObjective.findUniqueOrThrow({
		where: { id: objectiveId },
		select: {
			level: true,
			divisionId: true,
			department: { select: { id: true, divisionId: true } },
			person: {
				select: {
					orgPlacement: {
						select: {
							primaryDepartment: { select: { id: true, divisionId: true } },
						},
					},
				},
			},
		},
	});
	if (mt.level === "onehub") {
		return { onehub: true, boPhanId: null, phongBanId: null };
	}
	if (mt.level === "bo-phan") {
		return { onehub: false, boPhanId: mt.divisionId, phongBanId: null };
	}
	const phong =
		mt.level === "phong-ban"
			? mt.department
			: (mt.person?.orgPlacement?.primaryDepartment ?? null);
	return {
		onehub: false,
		boPhanId: phong?.divisionId ?? null,
		phongBanId: phong?.id ?? null,
	};
}

export async function ketQuaKiemGanNhat(
	db: DbHoacTx,
	luc: Date = new Date(),
): Promise<KetQuaKiemSanSang | null> {
	const row = await db.agentTask.findFirst({
		where: { kind: "okr-kiem-san-sang", finishedAt: { not: null, lte: luc } },
		orderBy: { finishedAt: "desc" },
		select: { outcome: true },
	});
	if (!row?.outcome) return null;
	return motTrong(
		KET_QUA_KIEM_SAN_SANG,
		row.outcome,
		"okr-kiem-san-sang.outcome",
	);
}

export async function troLyOkrSanSang(
	db: DbHoacTx,
	v: {
		viec: ViecTroLy;
		objectiveId?: string;
		donVi?: DonViMucTieu;
		now?: Date;
		coTacTu?: boolean;
	},
): Promise<TroLySanSang> {
	const now = v.now ?? new Date();
	const ct = await cauHinhAiLuc(db, now);
	const khong = (lyDo: LyDoKhongSanSang): TroLySanSang => ({
		bat: false,
		lyDo,
	});
	const donVi =
		v.donVi ??
		(v.objectiveId ? await donViCuaMucTieu(db, v.objectiveId) : null);
	const bat = donVi
		? donViDuocBat(ct, v.viec, donVi)
		: !ct.aiOn
			? "tat"
			: phamViCuaViec(ct, v.viec).phamVi === "tat"
				? "viec-tat"
				: "bat";
	if (bat !== "bat") return khong(bat);
	const chi = (await chiTieuThang(db, thangVN(now), now)).troLyOkrUsd;
	if (chi >= ct.aiTranThangUsd) return khong("het-tran-thang");
	if ((await ketQuaKiemGanNhat(db, now)) === "chua-co-khoa-mo-hinh") {
		return khong("chua-co-khoa-mo-hinh");
	}
	if (v.coTacTu === false) return khong("chua-noi-tac-tu");
	return {
		bat: true,
		conLaiUsd: Math.round((ct.aiTranThangUsd - chi) * 1e6) / 1e6,
	};
}

export const LY_DO_VIEC_OKR = {
	"okr-de-xuat": "okr-de-xuat",
	"okr-tom-tat-tuan": "okr-tom-tat-tuan",
	"okr-kiem-san-sang": "okr-kiem-san-sang",
	"okr-tom-tat-xep": "okr-tom-tat-xep",
	"ai-doi-soat": "ai-doi-soat",
} as const;

export type XepViec =
	| { xep: true; taskId: string; moi: boolean }
	| { xep: false; lyDo: LyDoKhongSanSang };

export async function xepViecTroLy(
	db: Db,
	v: {
		viec: "de-xuat";
		objectiveId: string;
		keyResultId: string | null;
		nguoiYeuCau: string;
		now?: Date;
	},
): Promise<XepViec> {
	const now = v.now ?? new Date();
	const san = await troLyOkrSanSang(db, {
		viec: v.viec,
		objectiveId: v.objectiveId,
		now,
	});
	if (!san.bat) return { xep: false, lyDo: san.lyDo };
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, `agent-task:okr-de-xuat:${v.objectiveId}`);
		const co = await tx.agentTask.findFirst({
			where: {
				kind: "okr-de-xuat",
				finishedAt: null,
				payload: { path: ["objectiveId"], equals: v.objectiveId },
			},
			select: { id: true },
		});
		if (co) return { xep: true, taskId: co.id, moi: false } as const;
		const mt = await tx.okrObjective.findUniqueOrThrow({
			where: { id: v.objectiveId },
			select: {
				updatedAt: true,
				keyResults: {
					select: { id: true, updatedAt: true },
					orderBy: { id: "asc" },
				},
			},
		});
		const inputHash = createHash("sha256")
			.update(
				[
					v.objectiveId,
					v.keyResultId ?? "",
					mt.updatedAt.toISOString(),
					...mt.keyResults.map((k) => `${k.id}@${k.updatedAt.toISOString()}`),
				].join("|"),
			)
			.digest("hex");
		const hang = await tx.agentTask.create({
			data: {
				kind: "okr-de-xuat",
				reason: LY_DO_VIEC_OKR["okr-de-xuat"],
				priority: PRIORITY.okrBam,
				budget: 0,
				dueAt: now,
				payload: {
					viec: "de-xuat",
					objectiveId: v.objectiveId,
					keyResultId: v.keyResultId,
					nguoiYeuCau: v.nguoiYeuCau,
					inputHash,
				},
			},
			select: { id: true },
		});
		return { xep: true, taskId: hang.id, moi: true } as const;
	});
}
