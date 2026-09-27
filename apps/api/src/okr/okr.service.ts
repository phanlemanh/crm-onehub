import type { Db, Prisma } from "@crm/db";
import {
	chonChuKyHienTai,
	kyVongTheoNgay,
	tienDoMucTieu,
} from "@crm/db/okr-tien-do";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	capDichCanChinh,
	chuKyDichCanChinh,
} from "@crm/validation/okr-can-chinh";
import {
	type ChuKyInput,
	ghiDuocOPha,
	LOAI_CHU_KY,
	PHA_CHU_KY,
	type PhaChuKy,
} from "@crm/validation/okr-chu-ky";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgram,
	okrProgram,
} from "@crm/validation/okr-chuong-trinh";
import {
	type KieuKr,
	kiemSoTheoKieu,
	kieuKr,
	NGUON_KR,
	tienDoKr,
} from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	type DonViMucTieu,
	HANG_CAP,
	LOAI_MUC_TIEU,
	type MucTieuInput,
	type MucTieuUpdate,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import {
	crmHopKieu,
	LOAI_NGUON_MAY,
	parseOkrNguon,
} from "@crm/validation/okr-nguon";
import {
	HANH_DONG_VET,
	type HanhDongVet,
	type OkrVetSnapshot,
	parseOkrVet,
} from "@crm/validation/okr-vet";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { khoa } from "../to-chuc/nhap";
import { dungCayCanChinh } from "./can-chinh";
import { dongLoOkr, phanTichLoOkr } from "./nhap";
import type {
	ChuKyOutput,
	CreateKrInput,
	DonViChon,
	KrOutput,
	MucTieuOutput,
	ObjectiveOutput,
	UpdateKrInput,
} from "./okr.contracts";
import {
	type DonViCuaMucTieu,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;

const loaiChuKy = z.enum(LOAI_CHU_KY);
const phaChuKy = z.enum(PHA_CHU_KY);
const capMucTieu = z.enum(CAP_MUC_TIEU);
const loaiMucTieu = z.enum(LOAI_MUC_TIEU);
const trangThaiMucTieu = z.enum(TRANG_THAI_MUC_TIEU);
const nguonKr = z.enum(NGUON_KR);
const loaiNguonMay = z.enum(LOAI_NGUON_MAY);
const hanhDongVet = z.enum(HANH_DONG_VET);

const chonNguoi = { id: true, name: true, email: true } as const;
const quanHeDonVi = {
	division: { select: { name: true } },
	department: { select: { name: true } },
	person: { select: { name: true } },
} as const;
export const chonTenDonVi = { level: true, ...quanHeDonVi } as const;
export const chonSoMay = {
	nguonMay: {
		select: {
			loai: true,
			chiSo: true,
			phamVi: true,
			bac: true,
			sheetId: true,
			sheetO: true,
			docLuc: true,
			docGiaTri: true,
			docLoi: true,
		},
	},
	soChup: {
		orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }],
		take: 1,
		select: { ngay: true, giaTri: true, nguon: true },
	},
} satisfies Prisma.OkrKeyResultInclude;
const chonMucTieu = {
	owner: { select: chonNguoi },
	participants: {
		include: { user: { select: chonNguoi } },
		orderBy: { createdAt: "asc" },
	},
	keyResults: {
		include: {
			owner: { select: chonNguoi },
			...chonSoMay,
		},
		orderBy: { position: "asc" },
	},
	alignments: {
		include: {
			targetObjective: { select: { title: true, ...chonTenDonVi } },
			targetKeyResult: {
				select: {
					title: true,
					objectiveId: true,
					objective: { select: { title: true, ...chonTenDonVi } },
				},
			},
		},
		orderBy: { createdAt: "asc" },
	},
	cycle: {
		select: {
			endsOn: true,
			breakStartsOn: true,
			breakEndsOn: true,
			phase: true,
		},
	},
	...quanHeDonVi,
} satisfies Prisma.OkrObjectiveInclude;

type TenDonVi = {
	level: string;
	division: { name: string } | null;
	department: { name: string } | null;
	person: { name: string } | null;
};

export function tenDonVi(r: TenDonVi): string {
	switch (capMucTieu.parse(r.level)) {
		case "onehub":
			return OKR.tenGoc;
		case "bo-phan":
			return r.division?.name ?? "";
		case "phong-ban":
			return r.department?.name ?? "";
		case "ca-nhan":
			return r.person?.name ?? "";
	}
}

function donViCua(unit: DonViMucTieu): DonViCuaMucTieu {
	return {
		level: unit.level,
		divisionId: unit.level === "bo-phan" ? unit.divisionId : null,
		departmentId: unit.level === "phong-ban" ? unit.departmentId : null,
		personUserId: unit.level === "ca-nhan" ? unit.personUserId : null,
	};
}

function donViChon(unit: DonViChon): DonViCuaMucTieu {
	switch (unit.loai) {
		case "goc":
			return donViCua({ level: "onehub" });
		case "bp":
			return donViCua({ level: "bo-phan", divisionId: unit.id });
		case "pb":
			return donViCua({ level: "phong-ban", departmentId: unit.id });
		case "nguoi":
			return donViCua({ level: "ca-nhan", personUserId: unit.id });
	}
}

function khoaDonVi(unit: DonViChon): string {
	return unit.loai === "goc" ? unit.loai : `${unit.loai}:${unit.id}`;
}

function khoaDonViDong(r: {
	level: string;
	divisionId: string | null;
	departmentId: string | null;
	personUserId: string | null;
}): string {
	switch (capMucTieu.parse(r.level)) {
		case "onehub":
			return "goc";
		case "bo-phan":
			return `bp:${r.divisionId}`;
		case "phong-ban":
			return `pb:${r.departmentId}`;
		case "ca-nhan":
			return `nguoi:${r.personUserId}`;
	}
}

const soKr = (d: Prisma.Decimal | number) => Number(d);

function ghiKhac(
	truoc: OkrVetSnapshot,
	sau: OkrVetSnapshot,
	o: string,
	cu: string | number | null | string[],
	moi: string | number | null | string[] | undefined,
) {
	if (moi === undefined) return;
	if (JSON.stringify(cu) === JSON.stringify(moi)) return;
	truoc[o] = cu;
	sau[o] = moi;
}

const ngay = (d: Date) => ngayVN(d);
const toDate = (s: string) => new Date(`${s}T00:00:00Z`);

type ChupGanNhat = {
	ngay: Date;
	giaTri: Prisma.Decimal | number;
	nguon: string;
};

export function doCanhVaSoMay(
	nguon: string,
	nguonMay: { loai: string } | null,
	chup: ChupGanNhat | undefined,
) {
	return {
		doCanh: nguon === "tay" && nguonMay !== null,
		soMay:
			nguonMay !== null && chup && chup.nguon === nguonMay.loai
				? {
						giaTri: soKr(chup.giaTri),
						ngay: ngay(chup.ngay),
						nguon: loaiNguonMay.parse(chup.nguon),
					}
				: null,
	};
}

type ChuKyDong = {
	id: string;
	kind: string;
	name: string;
	parentId: string | null;
	startsOn: Date;
	endsOn: Date;
	phase: string;
	breakStartsOn: Date | null;
	breakEndsOn: Date | null;
	updateWeekday: number;
};

@Injectable()
export class OkrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	async access(userId: string) {
		const q = await this.quyenOkr.quyen(userId);
		return {
			canManageProgram: q.quanTriChuongTrinh,
			headOf: {
				divisions: [...q.truongBoPhan],
				departments: [...q.truongPhongBan],
			},
		};
	}

	private chuKyRa(c: ChuKyDong): ChuKyOutput {
		return {
			id: c.id,
			kind: loaiChuKy.parse(c.kind),
			name: c.name,
			parentId: c.parentId,
			startsOn: ngay(c.startsOn),
			endsOn: ngay(c.endsOn),
			phase: phaChuKy.parse(c.phase),
			breakStartsOn: c.breakStartsOn ? ngay(c.breakStartsOn) : null,
			breakEndsOn: c.breakEndsOn ? ngay(c.breakEndsOn) : null,
			updateWeekday: c.updateWeekday,
		};
	}

	async cycles(homNay = new Date()) {
		const rows = await this.db.okrCycle.findMany({
			orderBy: [{ startsOn: "desc" }, { kind: "asc" }],
		});
		const cycles = rows.map((c) => this.chuKyRa(c));
		return {
			cycles,
			currentId: chonChuKyHienTai(cycles, ngay(homNay))?.id ?? null,
		};
	}

	async createCycle(userId: string, input: ChuKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			if (input.kind === "nam" && input.parentId !== null)
				throw new BadRequestException(T.namKhongCoCha);
			if (input.kind === "quy") {
				if (input.parentId === null)
					throw new BadRequestException(T.namKhongCoCha);
				const cha = await tx.okrCycle.findUnique({
					where: { id: input.parentId },
				});
				if (cha?.kind !== "nam")
					throw new NotFoundException(T.khongCoChuKy(input.parentId));
				if (
					input.startsOn < ngay(cha.startsOn) ||
					input.endsOn > ngay(cha.endsOn)
				)
					throw new BadRequestException(T.quyNgoaiNam);
				const anhEm = await tx.okrCycle.findMany({
					where: { parentId: cha.id },
				});
				const chong = anhEm.find(
					(q) =>
						ngay(q.startsOn) <= input.endsOn &&
						input.startsOn <= ngay(q.endsOn),
				);
				if (chong) throw new BadRequestException(T.quyChong(chong.name));
			}
			const c = await tx.okrCycle.create({
				data: {
					kind: input.kind,
					name: input.name,
					parentId: input.parentId,
					startsOn: toDate(input.startsOn),
					endsOn: toDate(input.endsOn),
					breakStartsOn: input.breakStartsOn
						? toDate(input.breakStartsOn)
						: null,
					breakEndsOn: input.breakEndsOn ? toDate(input.breakEndsOn) : null,
					updateWeekday: input.updateWeekday,
				},
			});
			await this.vet(tx, userId, "tao-chu-ky", { cycleId: c.id }, null, {
				name: c.name,
				kind: c.kind,
			});
			return { id: c.id, canhBao: null };
		});
	}

	async setCyclePhase(userId: string, id: string, phase: PhaChuKy) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const c = await tx.okrCycle.findUnique({ where: { id } });
			if (!c) throw new NotFoundException(T.khongCoChuKy(id));
			const phaCu = phaChuKy.parse(c.phase);
			if (phaCu === "da-dong") throw new BadRequestException(T.phaCuoi);
			if (PHA_CHU_KY.indexOf(phase) <= PHA_CHU_KY.indexOf(phaCu))
				throw new BadRequestException(T.phaChiDiToi);
			await tx.okrCycle.update({ where: { id }, data: { phase } });
			await this.vet(
				tx,
				userId,
				"doi-pha",
				{ cycleId: id },
				{ phase: phaCu },
				{ phase },
			);
			return { id, canhBao: null };
		});
	}

	async programFor(userId: string) {
		const [ct, canManage] = await Promise.all([
			this.program(),
			this.quyenOkr.quanTriChuongTrinh(userId),
		]);
		return { ...ct, canManage };
	}

	async program(
		tx: Tx | Db = this.db,
	): Promise<OkrProgram & { version: number }> {
		const row = await tx.okrProgramConfig.findFirst({
			orderBy: { version: "desc" },
		});
		if (!row) return { ...OKR_PROGRAM_MAC_DINH, version: 0 };
		return {
			...okrProgram.parse({
				objectiveCap: row.objectiveCap,
				krCap: row.krCap,
				capMode: row.capMode,
				scoreScale: row.scoreScale,
				weightsOn: row.weightsOn,
				personalOn: row.personalOn,
			}),
			version: row.version,
		};
	}

	async setProgram(userId: string, input: OkrProgram) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const cu = await this.program(tx);
			const row = await tx.okrProgramConfig.create({
				data: { ...input, version: cu.version + 1, createdById: userId },
			});
			await this.vet(
				tx,
				userId,
				"cau-hinh",
				{},
				{ version: cu.version },
				{ ...input, version: row.version },
			);
			return { ...input, version: row.version, canManage: true };
		});
	}

	async assertKyGhiDuoc(tx: Tx | Db, cycleId: string) {
		const c = await tx.okrCycle.findUnique({
			where: { id: cycleId },
			select: { phase: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(cycleId));
		if (!ghiDuocOPha(phaChuKy.parse(c.phase)))
			throw new BadRequestException(T.kyDaKhoa);
	}

	async vet(
		tx: Tx,
		actorUserId: string,
		action: HanhDongVet,
		dich: { cycleId?: string; objectiveId?: string; keyResultId?: string },
		before: OkrVetSnapshot | null,
		after: OkrVetSnapshot | null,
		note: string | null = null,
	) {
		await tx.okrTrail.create({
			data: {
				actorUserId,
				action,
				note,
				cycleId: dich.cycleId ?? null,
				objectiveId: dich.objectiveId ?? null,
				keyResultId: dich.keyResultId ?? null,
				before: before === null ? undefined : before,
				after: after === null ? undefined : after,
			},
		});
	}

	async assertThanhVien(
		tx: Tx | Db,
		ids: string[],
		loi: (id: string) => string = T.khongPhaiThanhVien,
	) {
		const can = [...new Set(ids)];
		const co = await tx.member.findMany({
			where: { organizationId: WORKSPACE_ID, userId: { in: can } },
			select: { userId: true },
		});
		const thieu = can.find((id) => !co.some((m) => m.userId === id));
		if (thieu) throw new BadRequestException(loi(thieu));
	}

	private async kiemTranMucTieu(
		tx: Tx,
		cycleId: string,
		dv: DonViCuaMucTieu,
		them: number,
	) {
		const ct = await this.program(tx);
		const dem = await tx.okrObjective.count({
			where: {
				cycleId,
				level: dv.level,
				divisionId: dv.divisionId,
				departmentId: dv.departmentId,
				personUserId: dv.personUserId,
				status: { not: "da-bo" },
			},
		});
		if (dem + them <= ct.objectiveCap) return null;
		if (ct.capMode === "chan")
			throw new BadRequestException(T.vuotTranMucTieu(dem));
		return T.vuotTranMucTieu(dem);
	}

	private async trangThai(tx: Tx, id: string) {
		const mt = await tx.okrObjective.findUnique({
			where: { id },
			select: { status: true },
		});
		if (!mt) throw new NotFoundException(T.khongCoMucTieu(id));
		return trangThaiMucTieu.parse(mt.status);
	}

	private async phaCua(tx: Tx, objectiveId: string) {
		const mt = await tx.okrObjective.findUniqueOrThrow({
			where: { id: objectiveId },
			select: { cycle: { select: { phase: true } } },
		});
		return phaChuKy.parse(mt.cycle.phase);
	}

	async createObjective(userId: string, input: MucTieuInput) {
		const dv = donViCua(input.unit);
		await this.quyenOkr.assertSuaDonVi(userId, dv);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, input.cycleId);
			if (dv.level === "ca-nhan" && !(await this.program(tx)).personalOn)
				throw new BadRequestException(T.caNhanTat);
			const thamGia = [...new Set(input.participantIds)];
			await this.assertThanhVien(tx, [
				input.ownerUserId,
				...thamGia,
				...(dv.personUserId ? [dv.personUserId] : []),
			]);
			const canhBao = await this.kiemTranMucTieu(tx, input.cycleId, dv, 1);
			const viTri = await tx.okrObjective.count({
				where: { cycleId: input.cycleId },
			});
			const mt = await tx.okrObjective.create({
				data: {
					cycleId: input.cycleId,
					...dv,
					ownerUserId: input.ownerUserId,
					kind: input.kind,
					title: input.title,
					whyNow: input.whyNow,
					position: viTri,
					participants: { create: thamGia.map((u) => ({ userId: u })) },
				},
			});
			await this.vet(
				tx,
				userId,
				"tao",
				{ objectiveId: mt.id, cycleId: mt.cycleId },
				null,
				{ title: mt.title, kind: mt.kind, level: mt.level, status: mt.status },
			);
			return { id: mt.id, canhBao };
		});
	}

	async updateObjective(userId: string, input: MucTieuUpdate) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, input.id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const cu = await tx.okrObjective.findUniqueOrThrow({
				where: { id: mt.id },
				include: { participants: { select: { userId: true } } },
			});
			if (cu.status === "da-bo") throw new BadRequestException(T.daBo);
			const thamGia = input.participantIds
				? [...new Set(input.participantIds)].sort()
				: undefined;
			await this.assertThanhVien(tx, [
				...(input.ownerUserId ? [input.ownerUserId] : []),
				...(thamGia ?? []),
			]);
			const truoc: OkrVetSnapshot = {};
			const sau: OkrVetSnapshot = {};
			ghiKhac(truoc, sau, "title", cu.title, input.title);
			ghiKhac(truoc, sau, "kind", cu.kind, input.kind);
			ghiKhac(truoc, sau, "ownerUserId", cu.ownerUserId, input.ownerUserId);
			ghiKhac(truoc, sau, "whyNow", cu.whyNow, input.whyNow);
			ghiKhac(
				truoc,
				sau,
				"participantIds",
				cu.participants.map((p) => p.userId).sort(),
				thamGia,
			);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: {
					title: input.title,
					kind: input.kind,
					ownerUserId: input.ownerUserId,
					whyNow: input.whyNow,
					participants: thamGia
						? {
								deleteMany: {},
								create: thamGia.map((u) => ({ userId: u })),
							}
						: undefined,
				},
			});
			await this.vet(tx, userId, "sua", { objectiveId: mt.id }, truoc, sau);
			return { id: mt.id, canhBao: null };
		});
	}

	async publishObjective(userId: string, id: string) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.trangThai(tx, mt.id);
			if (trangThai === "cong-bo") throw new BadRequestException(T.daCongBo);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			if (
				(await tx.okrKeyResult.count({ where: { objectiveId: mt.id } })) === 0
			)
				throw new BadRequestException(T.congBoCanKr);
			const luc = new Date();
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: "cong-bo", publishedAt: luc },
			});
			await tx.okrKeyResult.updateMany({
				where: { objectiveId: mt.id, startLockedAt: null },
				data: { startLockedAt: luc },
			});
			await this.vet(
				tx,
				userId,
				"cong-bo",
				{ objectiveId: mt.id },
				{ status: "nhap" },
				{ status: "cong-bo" },
			);
			return { id: mt.id, canhBao: null };
		});
	}

	async dropObjective(userId: string, id: string) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.trangThai(tx, mt.id);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: "da-bo", droppedAt: new Date() },
			});
			await this.vet(
				tx,
				userId,
				"bo",
				{ objectiveId: mt.id },
				{ status: trangThai },
				{ status: "da-bo" },
			);
			return { id: mt.id, canhBao: null };
		});
	}

	private assertSoTheoKieu(kind: KieuKr, khoi: number, dich: number) {
		const loi = kiemSoTheoKieu(kind, khoi, dich);
		if (loi) throw new BadRequestException(T.soTheoKieu[loi]);
	}

	async createKeyResult(userId: string, input: CreateKrInput) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, input.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.trangThai(tx, mt.id);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			this.assertSoTheoKieu(input.kind, input.startValue, input.targetValue);
			await this.assertThanhVien(tx, [input.ownerUserId]);
			const ct = await this.program(tx);
			const dem = await tx.okrKeyResult.count({
				where: { objectiveId: mt.id },
			});
			const cuoi = await tx.okrKeyResult.aggregate({
				where: { objectiveId: mt.id },
				_max: { position: true },
			});
			let canhBao: string | null = null;
			if (dem + 1 > ct.krCap) {
				if (ct.capMode === "chan")
					throw new BadRequestException(T.vuotTranKr(dem));
				canhBao = T.vuotTranKr(dem);
			}
			const kr = await tx.okrKeyResult.create({
				data: {
					objectiveId: mt.id,
					title: input.title,
					kind: input.kind,
					ownerUserId: input.ownerUserId,
					startValue: input.startValue,
					targetValue: input.targetValue,
					currentValue: input.currentValue,
					unit: input.unit,
					dueOn: input.dueOn ? toDate(input.dueOn) : null,
					weight: input.weight,
					position: (cuoi._max.position ?? -1) + 1,
					startLockedAt: trangThai === "cong-bo" ? new Date() : null,
				},
			});
			await this.vet(
				tx,
				userId,
				"tao-kr",
				{ objectiveId: mt.id, keyResultId: kr.id },
				null,
				{
					title: kr.title,
					kind: kr.kind,
					startValue: input.startValue,
					targetValue: input.targetValue,
				},
			);
			return { id: kr.id, canhBao };
		});
	}

	async updateKeyResult(userId: string, input: UpdateKrInput) {
		const quyen = await this.quyenOkr.assertSuaKr(userId, input.id);
		const doiCot =
			input.kind !== undefined ||
			input.ownerUserId !== undefined ||
			input.startValue !== undefined;
		if (doiCot && quyen.ownerUserId === userId) {
			const q = await this.quyenOkr.quyen(userId);
			if (!this.quyenOkr.suaDuocDonVi(q, userId, quyen.objective))
				throw new ForbiddenException(T.khongSuaDuocKr);
		}
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, quyen.objective.cycleId);
			await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${quyen.id} FOR UPDATE`;
			const kr = await tx.okrKeyResult.findUnique({ where: { id: quyen.id } });
			if (!kr) throw new NotFoundException(T.khongCoKr(quyen.id));
			if (
				input.currentValue !== undefined &&
				input.currentValue !== soKr(kr.currentValue) &&
				nguonKr.parse(kr.source) !== "tay"
			)
				throw new BadRequestException(T.so.hienTaiCuaMay);
			if (input.kind !== undefined && !crmHopKieu(input.kind)) {
				const may = await tx.okrNguonKr.findUnique({
					where: { keyResultId: kr.id },
					select: { loai: true },
				});
				if (kr.source === "crm" || may?.loai === "crm")
					throw new BadRequestException(T.so.crmKhongHopKieu);
			}
			const trangThai = await this.trangThai(tx, kr.objectiveId);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			const dangChay =
				trangThai === "cong-bo" &&
				(await this.phaCua(tx, kr.objectiveId)) === "dang-chay";
			if (
				dangChay &&
				input.currentValue !== undefined &&
				input.currentValue !== soKr(kr.currentValue)
			)
				throw new BadRequestException(T.hienTaiQuaCapNhat);
			const khoi = soKr(kr.startValue);
			if (
				input.startValue !== undefined &&
				kr.startLockedAt !== null &&
				input.startValue !== khoi
			)
				throw new BadRequestException(T.khoiDiemDaKhoa);
			const kind = input.kind ?? kieuKr.parse(kr.kind);
			this.assertSoTheoKieu(
				kind,
				input.startValue ?? khoi,
				input.targetValue ?? soKr(kr.targetValue),
			);
			if (input.ownerUserId)
				await this.assertThanhVien(tx, [input.ownerUserId]);
			const truoc: OkrVetSnapshot = {};
			const sau: OkrVetSnapshot = {};
			ghiKhac(truoc, sau, "title", kr.title, input.title);
			ghiKhac(truoc, sau, "kind", kr.kind, input.kind);
			ghiKhac(truoc, sau, "ownerUserId", kr.ownerUserId, input.ownerUserId);
			ghiKhac(truoc, sau, "startValue", khoi, input.startValue);
			ghiKhac(
				truoc,
				sau,
				"targetValue",
				soKr(kr.targetValue),
				input.targetValue,
			);
			ghiKhac(
				truoc,
				sau,
				"currentValue",
				soKr(kr.currentValue),
				input.currentValue,
			);
			ghiKhac(truoc, sau, "unit", kr.unit, input.unit);
			ghiKhac(
				truoc,
				sau,
				"dueOn",
				kr.dueOn ? ngay(kr.dueOn) : null,
				input.dueOn,
			);
			ghiKhac(truoc, sau, "weight", soKr(kr.weight), input.weight);
			await tx.okrKeyResult.update({
				where: { id: kr.id },
				data: {
					title: input.title,
					kind: input.kind,
					ownerUserId: input.ownerUserId,
					startValue: input.startValue,
					targetValue: input.targetValue,
					currentValue: input.currentValue,
					unit: input.unit,
					dueOn:
						input.dueOn === undefined
							? undefined
							: input.dueOn === null
								? null
								: toDate(input.dueOn),
					weight: input.weight,
				},
			});
			await this.vet(
				tx,
				userId,
				"sua-kr",
				{ objectiveId: kr.objectiveId, keyResultId: kr.id },
				truoc,
				sau,
			);
			return { id: kr.id, canhBao: null };
		});
	}

	async removeKeyResult(userId: string, id: string) {
		const kr = await this.db.okrKeyResult.findUnique({
			where: { id },
			select: { id: true, objectiveId: true, title: true },
		});
		if (!kr) throw new NotFoundException(T.khongCoKr(id));
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, kr.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			if ((await this.trangThai(tx, mt.id)) === "da-bo")
				throw new BadRequestException(T.daBo);
			await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${kr.id} FOR UPDATE`;
			if (
				(await tx.okrAlignment.count({
					where: { targetKeyResultId: kr.id },
				})) > 0
			)
				throw new BadRequestException(T.krDangLaDich);
			if ((await tx.okrCheckIn.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.krDaCapNhat);
			if ((await tx.okrSoChup.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.so.krDaCoSoChup);
			await tx.okrNguonKr.deleteMany({ where: { keyResultId: kr.id } });
			await tx.okrKeyResult.delete({ where: { id: kr.id } });
			await this.vet(
				tx,
				userId,
				"xoa-kr",
				{ objectiveId: mt.id, keyResultId: kr.id },
				{ title: kr.title },
				null,
			);
			return { id: kr.id, canhBao: null };
		});
	}

	private async dichCanChinh(
		tx: Tx,
		dich: { objectiveId: string | null; keyResultId: string | null },
	) {
		const chon = {
			id: true,
			level: true,
			status: true,
			cycleId: true,
		} as const;
		if (dich.keyResultId !== null) {
			const kr = await tx.okrKeyResult.findUnique({
				where: { id: dich.keyResultId },
				select: { objective: { select: chon } },
			});
			if (!kr) throw new NotFoundException(T.khongCoKr(dich.keyResultId));
			return kr.objective;
		}
		const id = dich.objectiveId ?? "";
		const mt = await tx.okrObjective.findUnique({
			where: { id },
			select: chon,
		});
		if (!mt) throw new NotFoundException(T.khongCoMucTieu(id));
		return mt;
	}

	async addAlignment(
		userId: string,
		input: {
			objectiveId: string;
			targetObjectiveId: string | null;
			targetKeyResultId: string | null;
		},
	) {
		const nguon = await this.quyenOkr.assertSuaMucTieu(
			userId,
			input.objectiveId,
		);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, nguon.cycleId);
			await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ${nguon.id} FOR UPDATE`;
			if ((await this.trangThai(tx, nguon.id)) === "da-bo")
				throw new BadRequestException(T.daBo);
			if (
				(input.targetObjectiveId === null) ===
				(input.targetKeyResultId === null)
			)
				throw new BadRequestException(T.canChinh.khongCoDich);
			if (input.targetKeyResultId !== null)
				await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${input.targetKeyResultId} FOR SHARE`;
			const dich = await this.dichCanChinh(tx, {
				objectiveId: input.targetObjectiveId,
				keyResultId: input.targetKeyResultId,
			});
			if (dich.id === nguon.id)
				throw new BadRequestException(T.canChinh.chinhNo);
			if (HANG_CAP[capMucTieu.parse(dich.level)] >= HANG_CAP[nguon.level])
				throw new BadRequestException(T.canChinh.cungCap);
			if (dich.status !== "cong-bo")
				throw new BadRequestException(T.canChinh.chuaCongBo);
			const ky = await tx.okrCycle.findUniqueOrThrow({
				where: { id: nguon.cycleId },
				select: { parentId: true },
			});
			if (dich.cycleId !== nguon.cycleId && dich.cycleId !== ky.parentId)
				throw new BadRequestException(T.canChinh.khacChuKy);
			const noi = {
				objectiveId: nguon.id,
				targetObjectiveId: input.targetObjectiveId,
				targetKeyResultId: input.targetKeyResultId,
			};
			if (await tx.okrAlignment.findFirst({ where: noi }))
				throw new BadRequestException(T.canChinh.daGan);
			const g = await tx.okrAlignment.create({ data: noi });
			await this.vet(
				tx,
				userId,
				"gan-can-chinh",
				{ objectiveId: nguon.id },
				null,
				{
					alignmentId: g.id,
					targetObjectiveId: g.targetObjectiveId,
					targetKeyResultId: g.targetKeyResultId,
				},
			);
			return { id: g.id, canhBao: null };
		});
	}

	async removeAlignment(userId: string, id: string) {
		const g = await this.db.okrAlignment.findUnique({ where: { id } });
		if (!g) throw new NotFoundException(T.canChinh.khongCo(id));
		const nguon = await this.quyenOkr.assertSuaMucTieu(userId, g.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, nguon.cycleId);
			if ((await this.trangThai(tx, nguon.id)) === "da-bo")
				throw new BadRequestException(T.daBo);
			const xoa = await tx.okrAlignment.deleteMany({ where: { id: g.id } });
			if (xoa.count === 0) throw new NotFoundException(T.canChinh.khongCo(id));
			await this.vet(
				tx,
				userId,
				"go-can-chinh",
				{ objectiveId: nguon.id },
				{
					alignmentId: g.id,
					targetObjectiveId: g.targetObjectiveId,
					targetKeyResultId: g.targetKeyResultId,
				},
				null,
			);
			return { id: g.id, canhBao: null };
		});
	}

	async alignmentTargets(objectiveId: string) {
		const nguon = await this.db.okrObjective.findUnique({
			where: { id: objectiveId },
			select: {
				level: true,
				cycleId: true,
				cycle: { select: { parentId: true } },
			},
		});
		if (!nguon) throw new NotFoundException(T.khongCoMucTieu(objectiveId));
		const nguonCanChinh = {
			level: capMucTieu.parse(nguon.level),
			cycleId: nguon.cycleId,
			cycleParentId: nguon.cycle.parentId,
		};
		const rows = await this.db.okrObjective.findMany({
			where: {
				status: "cong-bo",
				level: { in: capDichCanChinh(nguonCanChinh.level) },
				cycleId: { in: chuKyDichCanChinh(nguonCanChinh) },
			},
			select: {
				id: true,
				title: true,
				...chonTenDonVi,
				keyResults: {
					select: { id: true, title: true },
					orderBy: { position: "asc" },
				},
			},
			orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		});
		const theoCap = [...rows].sort(
			(a, b) =>
				HANG_CAP[capMucTieu.parse(a.level)] -
				HANG_CAP[capMucTieu.parse(b.level)],
		);
		return {
			targets: theoCap.flatMap((r) => {
				const unitName = tenDonVi(r);
				return [
					{ objectiveId: r.id, keyResultId: null, label: r.title, unitName },
					...r.keyResults.map((k) => ({
						objectiveId: r.id,
						keyResultId: k.id,
						label: k.title,
						unitName,
					})),
				];
			}),
		};
	}

	async alignmentTree(userId: string, cycleId: string) {
		return dungCayCanChinh(await this.mucTieuCuaCay(userId, cycleId));
	}

	async mucTieuCuaCay(userId: string, cycleId: string) {
		const q = await this.quyenOkr.quyen(userId);
		const ky = await this.db.okrCycle.findUnique({
			where: { id: cycleId },
			select: { parentId: true },
		});
		if (!ky) throw new NotFoundException(T.khongCoChuKy(cycleId));
		const cha = ky.parentId
			? await this.docMucTieu(this.db, { cycleId: ky.parentId }, userId, q)
			: [];
		const cua = await this.docMucTieu(this.db, { cycleId }, userId, q);
		const con = ky.parentId
			? []
			: await this.docMucTieu(
					this.db,
					{
						cycle: { parentId: cycleId },
						alignments: {
							some: {
								OR: [
									{ targetObjective: { cycleId } },
									{ targetKeyResult: { objective: { cycleId } } },
								],
							},
						},
					},
					userId,
					q,
				);
		return [...cha, ...cua, ...con];
	}

	async docMucTieu(
		tx: Tx | Db,
		where: Prisma.OkrObjectiveWhereInput,
		viewerId: string,
		q: Quyen,
		homNay = new Date(),
	): Promise<MucTieuOutput[]> {
		const ct = await this.program(tx);
		const rows = await tx.okrObjective.findMany({
			where,
			include: {
				...chonMucTieu,
				followers: { where: { userId: viewerId }, select: { userId: true } },
				_count: { select: { followers: true } },
			},
			orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		});
		return rows.map((r) => {
			const level = capMucTieu.parse(r.level);
			const hienTaiQuaCapNhat =
				r.status === "cong-bo" && r.cycle.phase === "dang-chay";
			const keyResults: KrOutput[] = r.keyResults.map((k) => {
				const kind = kieuKr.parse(k.kind);
				const startValue = soKr(k.startValue);
				const targetValue = soKr(k.targetValue);
				const currentValue = soKr(k.currentValue);
				const source = nguonKr.parse(k.source);
				const chup = k.soChup[0];
				return {
					id: k.id,
					objectiveId: k.objectiveId,
					title: k.title,
					kind,
					owner: k.owner,
					startValue,
					targetValue,
					currentValue,
					unit: k.unit,
					dueOn: k.dueOn ? ngay(k.dueOn) : null,
					weight: soKr(k.weight),
					source,
					...doCanhVaSoMay(source, k.nguonMay, chup),
					nguonMay: k.nguonMay
						? {
								...parseOkrNguon(k.nguonMay),
								docLuc: k.nguonMay.docLuc?.toISOString() ?? null,
								docGiaTri:
									k.nguonMay.docGiaTri === null
										? null
										: soKr(k.nguonMay.docGiaTri),
							}
						: null,
					startLocked: k.startLockedAt !== null,
					progress: tienDoKr(kind, startValue, targetValue, currentValue),
					laCuaToi: k.ownerUserId === viewerId,
					hienTaiQuaCapNhat,
				};
			});
			const following = r.followers.length > 0;
			const nghi =
				r.cycle.breakStartsOn && r.cycle.breakEndsOn
					? { tu: r.cycle.breakStartsOn, den: r.cycle.breakEndsOn }
					: null;
			return {
				id: r.id,
				cycleId: r.cycleId,
				level,
				unitId: r.divisionId ?? r.departmentId ?? r.personUserId,
				unitName: tenDonVi(r),
				title: r.title,
				kind: loaiMucTieu.parse(r.kind),
				status: trangThaiMucTieu.parse(r.status),
				owner: r.owner,
				participants: r.participants.map((p) => p.user),
				whyNow: r.whyNow,
				publishedAt: r.publishedAt?.toISOString() ?? null,
				droppedAt: r.droppedAt?.toISOString() ?? null,
				progress: tienDoMucTieu(keyResults, ct.weightsOn),
				expected: kyVongTheoNgay(r.publishedAt, r.cycle.endsOn, homNay, nghi),
				keyResults,
				alignments: r.alignments.map((g) => {
					const dich = g.targetKeyResult?.objective ?? g.targetObjective;
					const dichId = g.targetKeyResult?.objectiveId ?? g.targetObjectiveId;
					if (!dich || !dichId)
						throw new Error(`Căn chỉnh ${g.id} không có đích.`);
					return {
						alignmentId: g.id,
						targetObjectiveId: dichId,
						targetKeyResultId: g.targetKeyResultId,
						unitName: tenDonVi(dich),
						objectiveTitle: dich.title,
						keyResultTitle: g.targetKeyResult?.title ?? null,
					};
				}),
				canEdit: this.quyenOkr.suaDuocDonVi(q, viewerId, {
					level,
					divisionId: r.divisionId,
					departmentId: r.departmentId,
					personUserId: r.personUserId,
				}),
				following,
				followerCount: r._count.followers,
				theoDoi: following,
			};
		});
	}

	private kiemLoNhap(chu: string) {
		const soDong = dongLoOkr(chu).length;
		if (soDong === 0) throw new BadRequestException(T.nhap.loRong);
		if (soDong > OKR.lo.toiDaDong)
			throw new BadRequestException(T.nhap.loQuaDai(OKR.lo.toiDaDong));
	}

	private chuDonViNhap(q: Quyen, userId: string, dv: DonViCuaMucTieu) {
		const moiPb = [
			...q.cay.divisions.flatMap((b) => b.departments),
			...q.cay.chuaXep,
		];
		switch (dv.level) {
			case "onehub":
				return userId;
			case "ca-nhan":
				return dv.personUserId ?? userId;
			case "bo-phan": {
				const b = q.cay.divisions.find((x) => x.id === dv.divisionId);
				if (!b)
					throw new NotFoundException(T.khongCoDonVi(dv.divisionId ?? ""));
				return b.head?.id ?? userId;
			}
			case "phong-ban": {
				const pb = moiPb.find((x) => x.id === dv.departmentId);
				if (!pb)
					throw new NotFoundException(T.khongCoDonVi(dv.departmentId ?? ""));
				return pb.head?.id ?? userId;
			}
		}
	}

	private async phanTichNhap(
		tx: Tx | Db,
		cycleId: string,
		dv: DonViCuaMucTieu,
		chu: string,
	) {
		await this.assertKyGhiDuoc(tx, cycleId);
		const ct = await this.program(tx);
		if (dv.level === "ca-nhan" && !ct.personalOn)
			throw new BadRequestException(T.caNhanTat);
		const [members, coSan] = await Promise.all([
			tx.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: { user: { select: { id: true, email: true } } },
			}),
			tx.okrObjective.findMany({
				where: { cycleId, ...dv, status: { not: "da-bo" } },
				select: { title: true },
			}),
		]);
		const kq = phanTichLoOkr(chu, {
			members: members.map((m) => m.user),
			daCo: coSan.map((m) => khoa(m.title)),
			tranConLai: ct.capMode === "chan" ? ct.objectiveCap - coSan.length : null,
			tranKr: ct.capMode === "chan" ? ct.krCap : null,
		});
		if (kq.vuotTran)
			throw new BadRequestException(T.nhap.vuotTran(ct.objectiveCap));
		if (kq.vuotTranKr) throw new BadRequestException(T.vuotTranKr(ct.krCap));
		return kq;
	}

	async previewImport(
		userId: string,
		input: { cycleId: string; unit: DonViChon; text: string },
	) {
		const dv = donViChon(input.unit);
		const q = await this.quyenOkr.assertNhapDuoc(userId, dv);
		this.kiemLoNhap(input.text);
		this.chuDonViNhap(q, userId, dv);
		const kq = await this.phanTichNhap(this.db, input.cycleId, dv, input.text);
		return { rows: kq.rows, summary: kq.summary };
	}

	async applyImport(
		userId: string,
		input: { cycleId: string; unit: DonViChon; text: string; congBo: boolean },
	) {
		const dv = donViChon(input.unit);
		const q = await this.quyenOkr.assertNhapDuoc(userId, dv);
		this.kiemLoNhap(input.text);
		const chu = this.chuDonViNhap(q, userId, dv);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.cycleId} FOR UPDATE`;
			const kq = await this.phanTichNhap(tx, input.cycleId, dv, input.text);
			if (kq.mucTieu.length === 0) {
				if (kq.rows.some((r) => r.error === T.nhap.daCo))
					return { written: 0, objectives: 0, keyResults: 0 };
				throw new BadRequestException(T.nhap.khongDongHopLe);
			}
			await this.assertThanhVien(tx, [chu]);
			const luc = input.congBo ? new Date() : null;
			const status = luc ? "cong-bo" : "nhap";
			let viTri = await tx.okrObjective.count({
				where: { cycleId: input.cycleId },
			});
			let demKr = 0;
			for (const m of kq.mucTieu) {
				const mt = await tx.okrObjective.create({
					data: {
						cycleId: input.cycleId,
						...dv,
						ownerUserId: chu,
						kind: "cam-ket",
						title: m.title,
						whyNow: "",
						position: viTri,
						status,
						publishedAt: luc,
						keyResults: {
							create: m.keyResults.map((k, i) => ({
								title: k.title,
								kind: k.kind,
								ownerUserId: k.ownerUserId,
								startValue: k.startValue,
								targetValue: k.targetValue,
								currentValue: k.startValue,
								unit: k.unit,
								source: "tay",
								position: i,
								startLockedAt: luc,
							})),
						},
					},
				});
				viTri += 1;
				demKr += m.keyResults.length;
				await this.vet(
					tx,
					userId,
					"tao",
					{ objectiveId: mt.id, cycleId: mt.cycleId },
					null,
					{
						title: mt.title,
						kind: mt.kind,
						level: mt.level,
						status: mt.status,
					},
				);
			}
			await this.vet(
				tx,
				userId,
				"nhap-bang-tinh",
				{ cycleId: input.cycleId },
				null,
				{
					unit: khoaDonVi(input.unit),
					cycleId: input.cycleId,
					objectives: kq.mucTieu.length,
					keyResults: demKr,
				},
			);
			return {
				written: demKr,
				objectives: kq.mucTieu.length,
				keyResults: demKr,
			};
		});
	}

	async byUnit(userId: string, cycleId: string, unit: DonViChon) {
		const q = await this.quyenOkr.quyen(userId);
		const dv = donViChon(unit);
		const objectives = await this.docMucTieu(
			this.db,
			{ cycleId, ...dv },
			userId,
			q,
		);
		return {
			objectives,
			canEdit: this.quyenOkr.suaDuocDonVi(q, userId, dv),
			canhBao: null,
		};
	}

	async countByUnit(cycleId: string): Promise<Record<string, number>> {
		const nhom = await this.db.okrObjective.groupBy({
			by: ["level", "divisionId", "departmentId", "personUserId"],
			where: { cycleId, status: "cong-bo" },
			_count: { _all: true },
		});
		const dem: Record<string, number> = {};
		for (const n of nhom) {
			const khoa = khoaDonViDong(n);
			dem[khoa] = (dem[khoa] ?? 0) + n._count._all;
		}
		return dem;
	}

	async mine(userId: string, cycleId: string) {
		const q = await this.quyenOkr.quyen(userId);
		const objectives = await this.docMucTieu(
			this.db,
			{
				cycleId,
				OR: [
					{ ownerUserId: userId },
					{ personUserId: userId },
					{ participants: { some: { userId } } },
					{ keyResults: { some: { ownerUserId: userId } } },
					{ followers: { some: { userId } } },
				],
			},
			userId,
			q,
		);
		return { objectives };
	}

	async objective(userId: string, id: string): Promise<ObjectiveOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const [mt] = await this.docMucTieu(this.db, { id }, userId, q);
		if (!mt) throw new NotFoundException(T.khongCoMucTieu(id));
		const [vet, ky] = await Promise.all([
			this.db.okrTrail.findMany({
				where: { objectiveId: id },
				orderBy: [{ at: "asc" }, { id: "asc" }],
			}),
			this.db.okrCycle.findUniqueOrThrow({
				where: { id: mt.cycleId },
				select: { name: true },
			}),
		]);
		const nguoi = await this.db.user.findMany({
			where: { id: { in: [...new Set(vet.map((v) => v.actorUserId))] } },
			select: chonNguoi,
		});
		return {
			...mt,
			cycleName: ky.name,
			trail: vet.map((v) => ({
				id: v.id,
				at: v.at.toISOString(),
				actor: nguoi.find((n) => n.id === v.actorUserId) ?? null,
				action: hanhDongVet.parse(v.action),
				keyResultId: v.keyResultId,
				before: parseOkrVet(v.before),
				after: parseOkrVet(v.after),
				note: v.note,
			})),
			canEditKr: mt.keyResults
				.filter((k) => mt.canEdit || k.laCuaToi)
				.map((k) => k.id),
		};
	}
}
