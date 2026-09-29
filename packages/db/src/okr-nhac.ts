import { z } from "zod";
import type { Db } from "./client";
import type { JsonValue } from "./json";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "./okr-hien-thi";
import { parseOkrVet } from "./okr-vet";
import {
	type CuaSoNhac,
	dauNgayVN,
	dauTuanVN,
	mocNhac,
	ngayVN,
	soNgayVN,
} from "./onboarding-nhac";

export const OKR_NHAC = {
	imNgay: 14,
	imNgayTruong: 21,
	suKienGio: 24,
} as const;

const maMuc = z.string().min(1);

export const viecOkr = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("okr-cap-nhat"),
		krIds: z.array(maMuc).min(1),
		nhan: z.string(),
		soKr: z.number(),
	}),
	z.object({
		loai: z.literal("okr-kr-im"),
		keyResultId: maMuc,
		objectiveId: maMuc,
		nhan: z.string(),
		soNgay: z.number(),
		chuTen: z.string().nullable(),
	}),
	z.object({
		loai: z.literal("okr-duoc-giao"),
		objectiveId: maMuc,
		keyResultId: maMuc.optional(),
		nhan: z.string(),
	}),
	z.object({
		loai: z.literal("okr-nhac-ten"),
		commentId: maMuc,
		objectiveId: maMuc,
		nhan: z.string(),
		nguoiTen: z.string(),
	}),
	z.object({
		loai: z.literal("okr-ghi-nhan"),
		ghiNhanId: maMuc,
		objectiveId: maMuc,
		nhan: z.string(),
		nguoiGui: z.string(),
	}),
	z.object({
		loai: z.literal("okr-theo-doi"),
		objectiveId: maMuc,
		nhan: z.string(),
		capNhat: z.number(),
		binhLuan: z.number(),
	}),
]);

export type ViecOkr = z.infer<typeof viecOkr>;

export type LoaiNhacOkr = ViecOkr["loai"];

export const KHOA_MUC_OKR = {
	"okr-cap-nhat": { loai: true, krIds: true },
	"okr-kr-im": { loai: true, keyResultId: true },
	"okr-duoc-giao": { loai: true, objectiveId: true, keyResultId: true },
	"okr-nhac-ten": { loai: true, commentId: true },
	"okr-ghi-nhan": { loai: true, ghiNhanId: true },
	"okr-theo-doi": { loai: true, objectiveId: true },
} as const satisfies {
	[K in LoaiNhacOkr]: {
		readonly [P in keyof Extract<ViecOkr, { loai: K }>]?: true;
	};
};

type ChonKhoa<T, K> = { [P in keyof T as P extends K ? P : never]: T[P] };

export type MucOkr = {
	[K in LoaiNhacOkr]: ChonKhoa<
		Extract<ViecOkr, { loai: K }>,
		keyof (typeof KHOA_MUC_OKR)[K]
	>;
}[LoaiNhacOkr];

export const LOAI_NHAC_OKR = Object.keys(KHOA_MUC_OKR) as LoaiNhacOkr[];

export function laViecOkr<T extends { loai: string }>(
	v: T,
): v is Extract<T, { loai: LoaiNhacOkr }> {
	return Object.hasOwn(KHOA_MUC_OKR, v.loai);
}

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

const nguoiSauVet = z.string().min(1).nullish();

function nguoiSauCua(v: {
	id: string;
	after: JsonValue | undefined;
}): string | null {
	try {
		return nguoiSauVet.parse(parseOkrVet(v.after)?.ownerUserId) ?? null;
	} catch (e) {
		throw new Error(
			`Vết OKR ${v.id} không đọc được: ${e instanceof Error ? e.message : String(e)}`,
		);
	}
}

async function viecGiao(
	db: Db,
	cuaSo: { gt: Date; lte: Date },
): Promise<Gui[]> {
	const vet = await db.okrTrail.findMany({
		where: { at: cuaSo, action: { in: VET_GIAO } },
		orderBy: [{ at: "asc" }, { id: "asc" }],
		select: {
			id: true,
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
			nguoiSauCua(v) ?? (VET_TAO.includes(v.action) ? dich.ownerUserId : null);
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
	const [binhLuan, capNhat, ghiNhan] = await Promise.all([
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
		db.okrGhiNhan.findMany({
			where: { createdAt: cuaSo, objective: { status: { not: DA_BO } } },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			select: {
				id: true,
				objectiveId: true,
				tacGiaUserId: true,
				objective: { select: { title: true } },
				tacGia: { select: { name: true } },
				nhan: { select: { userId: true }, orderBy: { userId: "asc" } },
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
	const duocGhiNhan = ghiNhan.flatMap((g) =>
		g.nhan
			.filter((n) => n.userId !== g.tacGiaUserId)
			.map(
				(n): Gui => ({
					userId: n.userId,
					viec: {
						loai: "okr-ghi-nhan",
						ghiNhanId: g.id,
						objectiveId: g.objectiveId,
						nhan: g.objective.title,
						nguoiGui: g.tacGia.name,
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
	return [...nhacTen, ...duocGhiNhan, ...theo];
}

export async function viecOkrCanNhac(
	db: Db,
	chon: { now: Date; userId?: string; cuaSo: CuaSoNhac },
): Promise<Map<string, ViecOkr[]>> {
	const den = chon.cuaSo === "buoi-sang" ? mocNhac(chon.now) : chon.now;
	const cuaSo = {
		gt: new Date(den.getTime() - OKR_NHAC.suKienGio * GIO_MS),
		lte: den,
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
	return locTheoQuyenXem(db, ket);
}

function mucTieuCua(v: ViecOkr): string | null {
	return v.loai === "okr-cap-nhat" ? null : v.objectiveId;
}

async function locTheoQuyenXem(
	db: Db,
	ket: Map<string, ViecOkr[]>,
): Promise<Map<string, ViecOkr[]>> {
	const nguoi = [...ket]
		.filter(([, ds]) => ds.some((v) => mucTieuCua(v) !== null))
		.map(([userId]) => userId);
	const nguCanh = await nguCanhXemOkr(db, nguoi);
	const xemDuoc = new Map(
		await Promise.all(
			nguoi.map(async (userId): Promise<[string, Set<string>]> => {
				const nc = nguCanh.get(userId);
				const ids = [
					...new Set(
						(ket.get(userId) ?? []).flatMap((v) => mucTieuCua(v) ?? []),
					),
				];
				if (!nc) return [userId, new Set()];
				const thay = await db.okrObjective.findMany({
					where: { AND: [{ id: { in: ids } }, dieuKienXemMucTieu(nc)] },
					select: { id: true },
				});
				return [userId, new Set(thay.map((m) => m.id))];
			}),
		),
	);
	const ra = new Map<string, ViecOkr[]>();
	for (const [userId, ds] of ket) {
		const thay = xemDuoc.get(userId);
		const giu = ds.filter((v) => {
			const mt = mucTieuCua(v);
			return mt === null || (thay?.has(mt) ?? false);
		});
		if (giu.length > 0) ra.set(userId, giu);
	}
	return ra;
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
