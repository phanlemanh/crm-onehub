import type { Db } from "./client";
import { jsonObject, jsonText } from "./json";
import { dauNgayVN, dauTuanVN, ngayVN, soNgayVN } from "./onboarding-nhac";

export const OKR_NHAC = {
	imNgay: 14,
	imNgayTruong: 21,
	suKienGio: 24,
} as const;

export const LOAI_NHAC_OKR = [
	"okr-cap-nhat",
	"okr-kr-im",
	"okr-duoc-giao",
	"okr-nhac-ten",
	"okr-theo-doi",
] as const;

export type LoaiNhacOkr = (typeof LOAI_NHAC_OKR)[number];

export type ViecOkr =
	| { loai: "okr-cap-nhat"; krIds: string[]; nhan: string; soKr: number }
	| {
			loai: "okr-kr-im";
			keyResultId: string;
			objectiveId: string;
			nhan: string;
			soNgay: number;
			chuTen: string | null;
	  }
	| {
			loai: "okr-duoc-giao";
			objectiveId: string;
			keyResultId?: string;
			nhan: string;
	  }
	| {
			loai: "okr-nhac-ten";
			commentId: string;
			objectiveId: string;
			nhan: string;
			nguoiTen: string;
	  }
	| {
			loai: "okr-theo-doi";
			objectiveId: string;
			nhan: string;
			capNhat: number;
			binhLuan: number;
	  };

const PHUT_MS = 60 * 1000;

const GIO_MS = 60 * PHUT_MS;

const NGAY_MOI_TUAN = 7;

const CHAY = { phase: "dang-chay" };

const CONG_BO = "cong-bo";

const DA_BO = "da-bo";

const VET_GIAO = ["tao", "sua", "tao-kr", "sua-kr", "chuyen-viec"];

const VET_TAO = ["tao", "tao-kr"];

type Gui = { userId: string; viec: ViecOkr };

function thuTrongTuan(now: Date): number {
	const thu = new Date(`${ngayVN(now)}T00:00:00Z`).getUTCDay();
	return ((thu + NGAY_MOI_TUAN - 1) % NGAY_MOI_TUAN) + 1;
}

const DON_VI = {
	archivedAt: true,
	headUserId: true,
} as const;

function docKr(db: Db) {
	return db.okrKeyResult.findMany({
		where: { objective: { status: CONG_BO, cycle: CHAY } },
		select: {
			id: true,
			title: true,
			ownerUserId: true,
			objectiveId: true,
			startLockedAt: true,
			owner: {
				select: {
					name: true,
					orgPlacement: {
						select: {
							primaryDepartment: {
								select: { ...DON_VI, division: { select: DON_VI } },
							},
						},
					},
				},
			},
			objective: {
				select: {
					level: true,
					publishedAt: true,
					department: {
						select: { ...DON_VI, division: { select: DON_VI } },
					},
					division: { select: DON_VI },
					cycle: { select: { updateWeekday: true } },
				},
			},
		},
		orderBy: [
			{ objective: { createdAt: "asc" } },
			{ objectiveId: "asc" },
			{ position: "asc" },
		],
	});
}

type Kr = Awaited<ReturnType<typeof docKr>>[number];

type DonVi = { archivedAt: Date | null; headUserId: string | null };

function truongCua(dv: DonVi | null | undefined): string | null {
	return dv && dv.archivedAt === null ? dv.headUserId : null;
}

function truongKr(kr: Kr): string | null {
	const o = kr.objective;
	const phongBan =
		o.level === "phong-ban"
			? o.department
			: o.level === "ca-nhan"
				? kr.owner.orgPlacement?.primaryDepartment
				: null;
	return truongCua(phongBan) ?? truongCua(phongBan?.division ?? o.division);
}

function congBoLuc(kr: Kr): Date | null {
	return kr.startLockedAt ?? kr.objective.publishedAt;
}

async function viecKr(db: Db, now: Date): Promise<Gui[]> {
	const krs = await docKr(db);
	const ids = krs.map((k) => k.id);
	const tuan = dauTuanVN(now);
	const [cuoi, trongTuan] = await Promise.all([
		db.okrCheckIn.findMany({
			where: { keyResultId: { in: ids }, createdAt: { lte: now } },
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			distinct: ["keyResultId"],
			select: { keyResultId: true, createdAt: true },
		}),
		db.okrCheckIn.findMany({
			where: {
				keyResultId: { in: ids },
				weekStart: new Date(`${tuan}T00:00:00Z`),
				createdAt: { lte: now },
			},
			distinct: ["keyResultId"],
			select: { keyResultId: true },
		}),
	]);
	const daCapNhat = new Set(trongTuan.map((c) => c.keyResultId));
	const dauHomNay = dauNgayVN(now);
	const thu = thuTrongTuan(now);
	const cho = krs.filter((k) => {
		const luc = congBoLuc(k);
		return (
			thu >= k.objective.cycle.updateWeekday &&
			luc !== null &&
			luc < dauHomNay &&
			!daCapNhat.has(k.id)
		);
	});
	const chuCho = [...new Set(cho.map((k) => k.ownerUserId))];
	const capNhat: Gui[] = chuCho.map((userId) => {
		const cua = cho.filter((k) => k.ownerUserId === userId);
		return {
			userId,
			viec: {
				loai: "okr-cap-nhat",
				krIds: cua.map((k) => k.id),
				nhan: cua.map((k) => k.title).join(", "),
				soKr: cua.length,
			},
		};
	});
	const im = krs.flatMap((k): Gui[] => {
		const moc =
			cuoi.find((c) => c.keyResultId === k.id)?.createdAt ?? congBoLuc(k);
		if (moc === null) return [];
		const soNgay = soNgayVN(moc, now);
		if (soNgay < OKR_NHAC.imNgay) return [];
		const chung = {
			loai: "okr-kr-im" as const,
			keyResultId: k.id,
			objectiveId: k.objectiveId,
			nhan: k.title,
			soNgay,
		};
		const truong = truongKr(k);
		return [
			{ userId: k.ownerUserId, viec: { ...chung, chuTen: null } },
			...(soNgay >= OKR_NHAC.imNgayTruong &&
			truong !== null &&
			truong !== k.ownerUserId
				? [{ userId: truong, viec: { ...chung, chuTen: k.owner.name } }]
				: []),
		];
	});
	return [...capNhat, ...im];
}

async function viecGiao(
	db: Db,
	cuaSo: { gt: Date; lte: Date },
): Promise<Gui[]> {
	const vet = await db.okrTrail.findMany({
		where: { at: cuaSo, action: { in: VET_GIAO } },
		orderBy: [{ at: "asc" }, { id: "asc" }],
		select: {
			action: true,
			actorUserId: true,
			objectiveId: true,
			keyResultId: true,
			after: true,
		},
	});
	const krIds = vet.flatMap((v) => (v.keyResultId ? [v.keyResultId] : []));
	const mtIds = vet.flatMap((v) =>
		!v.keyResultId && v.objectiveId ? [v.objectiveId] : [],
	);
	const [krs, mts] = await Promise.all([
		db.okrKeyResult.findMany({
			where: { id: { in: krIds }, objective: { status: { not: DA_BO } } },
			select: { id: true, title: true, ownerUserId: true, objectiveId: true },
		}),
		db.okrObjective.findMany({
			where: { id: { in: mtIds }, status: { not: DA_BO } },
			select: { id: true, title: true, ownerUserId: true },
		}),
	]);
	const giao = vet.flatMap((v) => {
		const kr = v.keyResultId
			? krs.find((k) => k.id === v.keyResultId)
			: undefined;
		const mt = v.keyResultId
			? undefined
			: mts.find((m) => m.id === v.objectiveId);
		const dich = kr ?? mt;
		if (!dich) return [];
		const nguoiSau =
			jsonText(jsonObject(v.after).ownerUserId) ??
			(VET_TAO.includes(v.action) ? dich.ownerUserId : null);
		if (
			nguoiSau === null ||
			nguoiSau !== dich.ownerUserId ||
			nguoiSau === v.actorUserId
		)
			return [];
		return [
			{
				userId: nguoiSau,
				khoa: `${nguoiSau}:${kr ? `kr:${kr.id}` : `mt:${dich.id}`}`,
				viec: kr
					? {
							loai: "okr-duoc-giao" as const,
							objectiveId: kr.objectiveId,
							keyResultId: kr.id,
							nhan: kr.title,
						}
					: {
							loai: "okr-duoc-giao" as const,
							objectiveId: dich.id,
							nhan: dich.title,
						},
			},
		];
	});
	return giao
		.filter((g, i) => giao.findIndex((h) => h.khoa === g.khoa) === i)
		.map(({ userId, viec }) => ({ userId, viec }));
}

async function viecTraoDoi(
	db: Db,
	cuaSo: { gt: Date; lte: Date },
): Promise<Gui[]> {
	const [binhLuan, capNhat] = await Promise.all([
		db.okrComment.findMany({
			where: { createdAt: cuaSo, objective: { status: { not: DA_BO } } },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			select: {
				id: true,
				objectiveId: true,
				authorUserId: true,
				objective: { select: { title: true } },
				keyResult: { select: { title: true } },
				mentions: { select: { userId: true } },
			},
		}),
		db.okrCheckIn.findMany({
			where: {
				createdAt: cuaSo,
				keyResult: { objective: { status: { not: DA_BO } } },
			},
			select: {
				authorUserId: true,
				keyResult: { select: { objectiveId: true } },
			},
		}),
	]);
	const mucTieu = [
		...new Set([
			...binhLuan.map((b) => b.objectiveId),
			...capNhat.map((c) => c.keyResult.objectiveId),
		]),
	];
	const [theoDoi, tacGia] = await Promise.all([
		db.okrFollow.findMany({
			where: { objectiveId: { in: mucTieu } },
			orderBy: [{ createdAt: "asc" }, { objectiveId: "asc" }],
			select: {
				objectiveId: true,
				userId: true,
				objective: { select: { title: true } },
			},
		}),
		db.user.findMany({
			where: { id: { in: [...new Set(binhLuan.map((b) => b.authorUserId))] } },
			select: { id: true, name: true },
		}),
	]);
	const nhacTen = binhLuan.flatMap((b) =>
		b.mentions
			.filter((m) => m.userId !== b.authorUserId)
			.map(
				(m): Gui => ({
					userId: m.userId,
					viec: {
						loai: "okr-nhac-ten",
						commentId: b.id,
						objectiveId: b.objectiveId,
						nhan: b.keyResult?.title ?? b.objective.title,
						nguoiTen: tacGia.find((t) => t.id === b.authorUserId)?.name ?? "",
					},
				}),
			),
	);
	const theo = theoDoi.flatMap((f): Gui[] => {
		const soCapNhat = capNhat.filter(
			(c) =>
				c.keyResult.objectiveId === f.objectiveId &&
				c.authorUserId !== f.userId,
		).length;
		const soBinhLuan = binhLuan.filter(
			(b) => b.objectiveId === f.objectiveId && b.authorUserId !== f.userId,
		).length;
		if (soCapNhat + soBinhLuan === 0) return [];
		return [
			{
				userId: f.userId,
				viec: {
					loai: "okr-theo-doi",
					objectiveId: f.objectiveId,
					nhan: f.objective.title,
					capNhat: soCapNhat,
					binhLuan: soBinhLuan,
				},
			},
		];
	});
	return [...nhacTen, ...theo];
}

export async function viecOkrCanNhac(
	db: Db,
	chon: { now: Date; userId?: string },
): Promise<Map<string, ViecOkr[]>> {
	const cuaSo = {
		gt: new Date(chon.now.getTime() - OKR_NHAC.suKienGio * GIO_MS),
		lte: chon.now,
	};
	const phan = await Promise.all([
		viecKr(db, chon.now),
		viecGiao(db, cuaSo),
		viecTraoDoi(db, cuaSo),
	]);
	const ket = new Map<string, ViecOkr[]>();
	for (const g of phan.flat()) {
		if (chon.userId !== undefined && g.userId !== chon.userId) continue;
		ket.set(g.userId, [...(ket.get(g.userId) ?? []), g.viec]);
	}
	return ket;
}

export async function lienQuanOkr(db: Db, userId: string): Promise<boolean> {
	const chay = { phase: "dang-chay" };
	const [coChuKy, kr, mt, theo, truong] = await Promise.all([
		db.okrCycle.count({ where: chay }),
		db.okrKeyResult.count({
			where: {
				ownerUserId: userId,
				objective: { status: { not: "da-bo" }, cycle: chay },
			},
		}),
		db.okrObjective.count({
			where: { ownerUserId: userId, status: { not: "da-bo" }, cycle: chay },
		}),
		db.okrFollow.count({ where: { userId, objective: { cycle: chay } } }),
		Promise.all([
			db.department.count({ where: { headUserId: userId, archivedAt: null } }),
			db.division.count({ where: { headUserId: userId, archivedAt: null } }),
		]).then(([a, b]) => a + b),
	]);
	return kr + mt + theo > 0 || (coChuKy > 0 && truong > 0);
}
