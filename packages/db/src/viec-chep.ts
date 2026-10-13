import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { ActivityType } from "./generated/prisma/enums";
import { docDuocDoiTac } from "./vai-doi-tac";
import { type NguoiVet, VIEC } from "./viec";
import { chepViecCanLam, LoiViec, xoaBanChep } from "./viec-ghi";
import { WORKSPACE_ID } from "./workspace";
import type { DbGhi } from "./zalo-lien-ket";

export type SoDemViecCanLam = {
	taskTong: number;
	taskMo: number;
	taskXong: number;
	daChep: number;
	chuaChep: number;
	banChep: number;
	banChepDaDoi: number;
	nguoiTaoKhongNhan: number;
	taskTaoSau?: number;
};

export type ChepMot = typeof chepViecCanLam;

export type LoiChep = { id: string; lyDo: string };

export type KetQuaChep = {
	thu: boolean;
	truoc: SoDemViecCanLam;
	chep: number;
	loi: LoiChep[];
	sau: SoDemViecCanLam;
};

export type KetQuaDao = {
	truoc: SoDemViecCanLam;
	xoa: number;
	giuLai: string[];
	sau: SoDemViecCanLam;
};

const VIEC_CAN_LAM = {
	type: ActivityType.TASK,
} satisfies Prisma.ActivityWhereInput;

const CHUA_CHEP = {
	...VIEC_CAN_LAM,
	viecChep: { is: null },
} satisfies Prisma.ActivityWhereInput;

const BAN_CHEP = {
	vet: { some: { loai: "tao", nguon: "chep-cu" } },
} satisfies Prisma.ViecWhereInput;

const BAN_CHEP_DA_DOI = {
	AND: [BAN_CHEP, { vet: { some: { loai: { not: "tao" } } } }],
} satisfies Prisma.ViecWhereInput;

class DungChayThu extends Error {
	constructor(readonly ketQua: KetQuaChep) {
		super("chay thu");
	}
}

function loiChu(loi: unknown): string {
	return loi instanceof Error ? loi.message : String(loi);
}

async function demNguoiTaoKhongNhan(tx: DbGhi): Promise<number> {
	const nhom = await tx.activity.groupBy({
		by: ["createdById"],
		where: { ...CHUA_CHEP, completedAt: null },
		_count: { _all: true },
	});
	if (nhom.length === 0) return 0;
	const thanhVien = await tx.member.findMany({
		where: {
			organizationId: WORKSPACE_ID,
			userId: { in: nhom.map((n) => n.createdById) },
		},
		select: { userId: true, role: true },
	});
	const nhanDuoc = new Set(
		thanhVien.filter((m) => docDuocDoiTac(m.role)).map((m) => m.userId),
	);
	return nhom
		.filter((n) => !nhanDuoc.has(n.createdById))
		.reduce((tong, n) => tong + n._count._all, 0);
}

async function demTrong(
	tx: DbGhi,
	input: { tu?: Date },
): Promise<SoDemViecCanLam> {
	const taskTong = await tx.activity.count({ where: VIEC_CAN_LAM });
	const taskMo = await tx.activity.count({
		where: { ...VIEC_CAN_LAM, completedAt: null },
	});
	const daChep = await tx.activity.count({
		where: { ...VIEC_CAN_LAM, viecChep: { isNot: null } },
	});
	const banChep = await tx.viec.count({ where: BAN_CHEP });
	const banChepDaDoi = await tx.viec.count({ where: BAN_CHEP_DA_DOI });
	const nguoiTaoKhongNhan = await demNguoiTaoKhongNhan(tx);
	const taskTaoSau = input.tu
		? await tx.activity.count({
				where: { ...VIEC_CAN_LAM, createdAt: { gte: input.tu } },
			})
		: undefined;
	return {
		taskTong,
		taskMo,
		taskXong: taskTong - taskMo,
		daChep,
		chuaChep: taskTong - daChep,
		banChep,
		banChepDaDoi,
		nguoiTaoKhongNhan,
		...(taskTaoSau === undefined ? {} : { taskTaoSau }),
	};
}

export function demViecCanLam(
	db: Db,
	input: { tu?: Date } = {},
): Promise<SoDemViecCanLam> {
	return db.$transaction(async (tx) => {
		await tx.$executeRaw`SET TRANSACTION READ ONLY`;
		return demTrong(tx, input);
	});
}

async function nguoiChayQuanTri(
	db: Db,
	nguoiChayId: string | null,
): Promise<NguoiVet> {
	const loi = () => new LoiViec("khong-quyen", VIEC.thongDiep.chiQuanTriChep);
	if (!nguoiChayId) throw loi();
	const nguoi = await db.user.findFirst({
		where: {
			id: nguoiChayId,
			members: {
				some: {
					organizationId: WORKSPACE_ID,
					role: { in: [...VIEC.vaiChepDuoc] },
				},
			},
		},
		select: { id: true, name: true },
	});
	if (nguoi === null) throw loi();
	return { id: nguoi.id, ten: nguoi.name };
}

function danhSachChuaChep(tx: DbGhi): Promise<{ id: string }[]> {
	return tx.activity.findMany({
		where: CHUA_CHEP,
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true },
	});
}

export async function chepTatCa(
	db: Db,
	input: {
		nguoiChayId: string | null;
		now: Date;
		thu?: boolean;
		chepMot?: ChepMot;
	},
): Promise<KetQuaChep> {
	const nguoiChay = await nguoiChayQuanTri(db, input.nguoiChayId);
	const chepMot = input.chepMot ?? chepViecCanLam;
	const mot = { nguoiChay, now: input.now };
	if (input.thu) {
		try {
			await db.$transaction(
				async (tx) => {
					const truoc = await demTrong(tx, {});
					const loi: LoiChep[] = [];
					let chep = 0;
					for (const { id } of await danhSachChuaChep(tx)) {
						await tx.$executeRawUnsafe("SAVEPOINT chep_thu");
						try {
							if (await chepMot(tx, { activityId: id, ...mot })) chep += 1;
							await tx.$executeRawUnsafe("RELEASE SAVEPOINT chep_thu");
						} catch (e) {
							await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT chep_thu");
							loi.push({ id, lyDo: loiChu(e) });
						}
					}
					const sau = await demTrong(tx, {});
					throw new DungChayThu({ thu: true, truoc, chep, loi, sau });
				},
				{ timeout: VIEC.chepThuTranMs, maxWait: VIEC.chepThuTranMs },
			);
		} catch (e) {
			if (e instanceof DungChayThu) return e.ketQua;
			throw e;
		}
	}
	const truoc = await demViecCanLam(db);
	const loi: LoiChep[] = [];
	let chep = 0;
	for (const { id } of await danhSachChuaChep(db)) {
		try {
			const ket = await db.$transaction((tx) =>
				chepMot(tx, { activityId: id, ...mot }),
			);
			if (ket) chep += 1;
		} catch (e) {
			loi.push({ id, lyDo: loiChu(e) });
		}
	}
	const sau = await demViecCanLam(db);
	return { thu: false, truoc, chep, loi, sau };
}

export async function daoTatCa(
	db: Db,
	input: { caBanDaDoi: boolean },
): Promise<KetQuaDao> {
	const truoc = await demViecCanLam(db);
	const [ban, daDoi] = await Promise.all([
		db.viec.findMany({
			where: BAN_CHEP,
			orderBy: { id: "asc" },
			select: { id: true },
		}),
		db.viec.findMany({ where: BAN_CHEP_DA_DOI, select: { id: true } }),
	]);
	const doi = new Set(daDoi.map((v) => v.id));
	const giuLai: string[] = [];
	let xoa = 0;
	for (const { id } of ban) {
		if (doi.has(id) && !input.caBanDaDoi) {
			giuLai.push(id);
			continue;
		}
		await db.$transaction((tx) => xoaBanChep(tx, id));
		xoa += 1;
	}
	const sau = await demViecCanLam(db);
	return { truoc, xoa, giuLai, sau };
}
