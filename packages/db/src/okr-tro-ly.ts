import { createHash } from "node:crypto";
import { PRIORITY } from "./agent-tasks";
import { chiTieuThang, khungThangUTC, thangVN } from "./ai-chi-phi";
import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { lockIdempotencyKey } from "./idempotency";
import { KY_CON_HIEN } from "./okr-chu-ky-hien";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "./okr-hien-thi";
import {
	AI_PHAM_VI,
	type CauHinhAi,
	type DonViMucTieu,
	KET_QUA_KIEM_SAN_SANG,
	type KetQuaKiemSanSang,
	type LyDoKhongSanSang,
	motTrong,
	type NacCuaDonVi,
	nacCuaDonVi,
	nacCuaViec,
	TRO_LY_OKR_TRAN,
	type TroLySanSang,
	type ViecTroLy,
} from "./okr-tro-ly-danh-muc";
import { dauNgayVN } from "./onboarding-nhac";

type DbHoacTx = Db | Prisma.TransactionClient;

export const CAU_HINH_AI_MAC_DINH: CauHinhAi = {
	aiOn: false,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiDeXuatAnPhamVi: "tat",
	aiDeXuatAnDonVi: [],
	aiTomTatAnPhamVi: "tat",
	aiTomTatAnDonVi: [],
	aiSoanPhamVi: "tat",
	aiSoanDonVi: [],
	aiSoanAnPhamVi: "tat",
	aiSoanAnDonVi: [],
	aiTranThangUsd: TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
	aiTranThangDatOkrUsd: null,
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
			aiDeXuatAnPhamVi: true,
			aiDeXuatAnDonVi: true,
			aiTomTatAnPhamVi: true,
			aiTomTatAnDonVi: true,
			aiSoanPhamVi: true,
			aiSoanDonVi: true,
			aiSoanAnPhamVi: true,
			aiSoanAnDonVi: true,
			aiTranThangUsd: true,
			aiTranThangDatOkrUsd: true,
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
		aiDeXuatAnPhamVi: motTrong(
			AI_PHAM_VI,
			row.aiDeXuatAnPhamVi,
			"aiDeXuatAnPhamVi",
		),
		aiDeXuatAnDonVi: row.aiDeXuatAnDonVi,
		aiTomTatAnPhamVi: motTrong(
			AI_PHAM_VI,
			row.aiTomTatAnPhamVi,
			"aiTomTatAnPhamVi",
		),
		aiTomTatAnDonVi: row.aiTomTatAnDonVi,
		aiSoanPhamVi: motTrong(AI_PHAM_VI, row.aiSoanPhamVi, "aiSoanPhamVi"),
		aiSoanDonVi: row.aiSoanDonVi,
		aiSoanAnPhamVi: motTrong(AI_PHAM_VI, row.aiSoanAnPhamVi, "aiSoanAnPhamVi"),
		aiSoanAnDonVi: row.aiSoanAnDonVi,
		aiTranThangUsd: row.aiTranThangUsd.toNumber(),
		aiTranThangDatOkrUsd:
			row.aiTranThangDatOkrUsd === null
				? null
				: row.aiTranThangDatOkrUsd.toNumber(),
	};
}

export const chonDonViMucTieu = {
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
} as const;

type PhongCuaDonVi = { id: string; divisionId: string | null } | null;

export type HangDonViMucTieu = {
	level: string;
	divisionId: string | null;
	department: PhongCuaDonVi;
	person: {
		orgPlacement: { primaryDepartment: PhongCuaDonVi } | null;
	} | null;
};

export async function donViCuaMucTieu(
	db: DbHoacTx,
	objectiveId: string,
): Promise<DonViMucTieu> {
	const mt = await db.okrObjective.findUniqueOrThrow({
		where: { id: objectiveId },
		select: chonDonViMucTieu,
	});
	return donViTuHang(mt);
}

export function donViTuHang(mt: HangDonViMucTieu): DonViMucTieu {
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

export type KetQuaKiem = { ketQua: KetQuaKiemSanSang; luc: Date };

export async function ketQuaKiemGanNhat(
	db: DbHoacTx,
	luc: Date = new Date(),
): Promise<KetQuaKiem | null> {
	const row = await db.agentTask.findFirst({
		where: { kind: "okr-kiem-san-sang", finishedAt: { not: null, lte: luc } },
		orderBy: { finishedAt: "desc" },
		select: { outcome: true, finishedAt: true },
	});
	if (!row?.outcome || !row.finishedAt) return null;
	return {
		ketQua: motTrong(
			KET_QUA_KIEM_SAN_SANG,
			row.outcome,
			"okr-kiem-san-sang.outcome",
		),
		luc: row.finishedAt,
	};
}

export async function canKiemLaiKhoa(
	db: DbHoacTx,
	now: Date,
	hienTai: KetQuaKiemSanSang,
): Promise<boolean> {
	if (!(await cauHinhAiLuc(db, now)).aiOn) return false;
	const kq = await ketQuaKiemGanNhat(db, now);
	if (!kq || kq.ketQua === hienTai) return false;
	if (now.getTime() - kq.luc.getTime() <= TRO_LY_OKR_TRAN.hanKiemKhoaMs) {
		return false;
	}
	const dangCho = await db.agentTask.count({
		where: { kind: "okr-kiem-san-sang", finishedAt: null },
	});
	return dangCho === 0;
}

type NacXep = "bat" | "an";

const khong = (lyDo: LyDoKhongSanSang): TroLySanSang => ({ bat: false, lyDo });

async function nacCuaMucTieu(
	db: DbHoacTx,
	ct: CauHinhAi,
	viec: ViecTroLy,
	v: { objectiveId?: string; keyResultId?: string; donVi?: DonViMucTieu },
): Promise<NacCuaDonVi> {
	const objectiveId =
		v.objectiveId ??
		(v.keyResultId
			? (
					await db.okrKeyResult.findUniqueOrThrow({
						where: { id: v.keyResultId },
						select: { objectiveId: true },
					})
				).objectiveId
			: undefined);
	const donVi =
		v.donVi ?? (objectiveId ? await donViCuaMucTieu(db, objectiveId) : null);
	if (donVi) return nacCuaDonVi(ct, viec, donVi);
	return nacCuaViec(ct, viec);
}

export function tranThangApDung(
	ct: CauHinhAi,
	coChuKyLapKeHoach: boolean,
): number {
	return coChuKyLapKeHoach && ct.aiTranThangDatOkrUsd !== null
		? ct.aiTranThangDatOkrUsd
		: ct.aiTranThangUsd;
}

export async function coChuKyLapKeHoachTrongThang(
	db: DbHoacTx,
	thang: string,
): Promise<boolean> {
	const { tu } = khungThangUTC(thang);
	const so = await db.okrCycle.count({
		where: {
			phase: "lap-ke-hoach",
			...KY_CON_HIEN,
			endsOn: { gte: tu },
			startsOn: {
				lt: dauThangUTCSau(thang, TRO_LY_OKR_TRAN.thangLapKeHoachTruocKy + 1),
			},
		},
	});
	return so > 0;
}

function dauThangUTCSau(thang: string, soThang: number): Date {
	const [nam, t] = thang.split("-").map(Number) as [number, number];
	return new Date(Date.UTC(nam, t - 1 + soThang, 1));
}

export async function tranThangCuaThang(
	db: DbHoacTx,
	ct: CauHinhAi,
	thang: string,
): Promise<number> {
	return tranThangApDung(ct, await coChuKyLapKeHoachTrongThang(db, thang));
}

export async function quaTranChung(
	db: DbHoacTx,
	ct: CauHinhAi,
	now: Date,
): Promise<TroLySanSang> {
	const thang = thangVN(now);
	const tran = await tranThangCuaThang(db, ct, thang);
	const chi = (await chiTieuThang(db, thang, now)).troLyOkrUsd;
	if (chi >= tran) return khong("het-tran-thang");
	if ((await ketQuaKiemGanNhat(db, now))?.ketQua === "chua-co-khoa-mo-hinh") {
		return khong("chua-co-khoa-mo-hinh");
	}
	return { bat: true, conLaiUsd: Math.round((tran - chi) * 1e6) / 1e6 };
}

async function soLuotDeXuatTrongNgay(
	db: DbHoacTx,
	nguoiYeuCau: string,
	now: Date,
): Promise<number> {
	return db.agentTask.count({
		where: {
			kind: "okr-de-xuat",
			createdAt: { gte: dauNgayVN(now) },
			AND: [
				{ payload: { path: ["nguoiYeuCau"], equals: nguoiYeuCau } },
				{ payload: { path: ["nac"], equals: "bat" } },
			],
		},
	});
}

export async function troLyOkrSanSang(
	db: DbHoacTx,
	v: {
		viec: ViecTroLy;
		objectiveId?: string;
		keyResultId?: string;
		donVi?: DonViMucTieu;
		nguoiYeuCau?: string;
		nacViec?: NacXep;
		now?: Date;
		coTacTu?: boolean;
	},
): Promise<TroLySanSang> {
	const now = v.now ?? new Date();
	const ct = await cauHinhAiLuc(db, now);
	const nac = await nacCuaMucTieu(db, ct, v.viec, v);
	if (nac === "an" && v.nacViec !== "an") return khong("don-vi-chua-bat");
	if (nac !== "bat" && nac !== "an") return khong(nac);
	const chung = await quaTranChung(db, ct, now);
	if (!chung.bat) return chung;
	if (
		v.viec === "de-xuat" &&
		v.nguoiYeuCau &&
		(await soLuotDeXuatTrongNgay(db, v.nguoiYeuCau, now)) >=
			TRO_LY_OKR_TRAN.troLyNgayMoiNguoi
	) {
		return khong("het-tran-ngay");
	}
	if (v.coTacTu === false) return khong("chua-noi-tac-tu");
	return chung;
}

export const LY_DO_VIEC_OKR = {
	"okr-de-xuat": "okr-de-xuat",
	"okr-tom-tat-tuan": "okr-tom-tat-tuan",
	"okr-kiem-san-sang": "okr-kiem-san-sang",
	"okr-tom-tat-xep": "okr-tom-tat-xep",
	"ai-doi-soat": "ai-doi-soat",
} as const;

type KetQuaTao<L extends string> =
	| { tao: true; taskId: string; dungLai: boolean }
	| { tao: false; lyDo: L };

async function taoViecDeXuat<L extends string>(
	db: Db,
	v: {
		objectiveId: string;
		keyResultId: string | null;
		nguoiYeuCau: string;
		nac: NacXep;
		now: Date;
	},
	chan: (tx: Prisma.TransactionClient) => Promise<L | null>,
): Promise<KetQuaTao<L>> {
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, `agent-task:okr-de-xuat:${v.objectiveId}`);
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
		const co = await tx.agentTask.findFirst({
			where: {
				kind: "okr-de-xuat",
				OR: [{ finishedAt: null }, { outcome: "da-nop" }],
				AND: [
					{ payload: { path: ["inputHash"], equals: inputHash } },
					{ payload: { path: ["nac"], equals: v.nac } },
				],
			},
			orderBy: { createdAt: "desc" },
			select: { id: true },
		});
		if (co) return { tao: true, taskId: co.id, dungLai: true } as const;
		const lyDo = await chan(tx);
		if (lyDo !== null) return { tao: false, lyDo } as const;
		const hang = await tx.agentTask.create({
			data: {
				kind: "okr-de-xuat",
				reason: LY_DO_VIEC_OKR["okr-de-xuat"],
				priority: v.nac === "bat" ? PRIORITY.okrBam : PRIORITY.okrNen,
				budget: 0,
				dueAt: v.now,
				createdAt: v.now,
				payload: {
					viec: "de-xuat",
					objectiveId: v.objectiveId,
					keyResultId: v.keyResultId,
					nguoiYeuCau: v.nguoiYeuCau,
					inputHash,
					nac: v.nac,
				},
			},
			select: { id: true },
		});
		return { tao: true, taskId: hang.id, dungLai: false } as const;
	});
}

export const KHONG_XEM_DUOC = "khong-xem-duoc" as const;

export type XepViec =
	| { bat: true; taskId: string; dungLai: boolean }
	| { bat: false; lyDo: LyDoKhongSanSang | typeof KHONG_XEM_DUOC };

async function nguoiXemDuocMucTieu(
	db: DbHoacTx,
	objectiveId: string,
	userId: string,
): Promise<boolean> {
	const nc = (await nguCanhXemOkr(db, [userId])).get(userId);
	if (!nc) return false;
	return (
		(await db.okrObjective.count({
			where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
		})) > 0
	);
}

export async function xepViecTroLy(
	db: Db,
	v: {
		viec: "de-xuat";
		objectiveId: string;
		keyResultId: string | null;
		nguoiYeuCau: string;
		nac: "bat";
		now?: Date;
	},
): Promise<XepViec> {
	const now = v.now ?? new Date();
	if (!(await nguoiXemDuocMucTieu(db, v.objectiveId, v.nguoiYeuCau)))
		return { bat: false, lyDo: KHONG_XEM_DUOC };
	const ct = await cauHinhAiLuc(db, now);
	const nac = await nacCuaMucTieu(db, ct, v.viec, {
		objectiveId: v.objectiveId,
	});
	if (nac !== "bat") {
		return { bat: false, lyDo: nac === "an" ? "don-vi-chua-bat" : nac };
	}
	const chung = await quaTranChung(db, ct, now);
	if (!chung.bat) return chung;
	const kq = await taoViecDeXuat(
		db,
		{ ...v, now },
		async (tx): Promise<LyDoKhongSanSang | null> => {
			await lockIdempotencyKey(tx, `okr-de-xuat-ngay:${v.nguoiYeuCau}`);
			const da = await soLuotDeXuatTrongNgay(tx, v.nguoiYeuCau, now);
			return da >= TRO_LY_OKR_TRAN.troLyNgayMoiNguoi ? "het-tran-ngay" : null;
		},
	);
	return kq.tao
		? { bat: true, taskId: kq.taskId, dungLai: kq.dungLai }
		: { bat: false, lyDo: kq.lyDo };
}

export type LyDoBoLuotAn =
	| "khong-doi-chu"
	| "khong-o-che-do-an"
	| "nhip-muc-tieu"
	| "het-luot-an-ngay"
	| "het-tran-thang"
	| "chua-co-khoa-mo-hinh";

export type XepLuotAn =
	| { xep: true; taskId: string; dungLai: boolean }
	| { xep: false; lyDo: LyDoBoLuotAn };

export async function xepLuotAnSauKhiLuu(
	db: Db,
	v: {
		objectiveId: string;
		keyResultId: string | null;
		nguoiLuu: string;
		doiChu: boolean;
		now: Date;
	},
): Promise<XepLuotAn> {
	const bo = (lyDo: LyDoBoLuotAn): XepLuotAn => ({ xep: false, lyDo });
	if (!v.doiChu) return bo("khong-doi-chu");
	const ct = await cauHinhAiLuc(db, v.now);
	const nac = await nacCuaMucTieu(db, ct, "de-xuat", {
		objectiveId: v.objectiveId,
	});
	if (nac !== "an") {
		return bo("khong-o-che-do-an");
	}
	const chung = await quaTranChung(db, ct, v.now);
	if (!chung.bat) {
		return bo(
			chung.lyDo === "het-tran-thang"
				? "het-tran-thang"
				: "chua-co-khoa-mo-hinh",
		);
	}
	const kq = await taoViecDeXuat(
		db,
		{
			objectiveId: v.objectiveId,
			keyResultId: v.keyResultId,
			nguoiYeuCau: v.nguoiLuu,
			nac: "an",
			now: v.now,
		},
		async (tx): Promise<LyDoBoLuotAn | null> => {
			await lockIdempotencyKey(tx, "okr-de-xuat-an-ngay");
			const ganDay = await tx.agentTask.count({
				where: {
					kind: "okr-de-xuat",
					createdAt: {
						gt: new Date(v.now.getTime() - TRO_LY_OKR_TRAN.nhipAnMucTieuMs),
					},
					AND: [
						{ payload: { path: ["objectiveId"], equals: v.objectiveId } },
						{ payload: { path: ["nac"], equals: "an" } },
					],
				},
			});
			if (ganDay > 0) return "nhip-muc-tieu";
			const homNay = await tx.agentTask.count({
				where: {
					kind: "okr-de-xuat",
					createdAt: { gte: dauNgayVN(v.now) },
					payload: { path: ["nac"], equals: "an" },
				},
			});
			return homNay >= TRO_LY_OKR_TRAN.luotAnMoiNgay
				? "het-luot-an-ngay"
				: null;
		},
	);
	return kq.tao
		? { xep: true, taskId: kq.taskId, dungLai: kq.dungLai }
		: bo(kq.lyDo);
}
