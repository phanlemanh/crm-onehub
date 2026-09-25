import type { Db, Prisma } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
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
import type { HanhDongVet, OkrVetSnapshot } from "@crm/validation/okr-vet";
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type { ChuKyOutput } from "./okr.contracts";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import { chonChuKyHienTai } from "./tien-do";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;

const loaiChuKy = z.enum(LOAI_CHU_KY);
const phaChuKy = z.enum(PHA_CHU_KY);

const ngay = (d: Date) => ngayVN(d);
const toDate = (s: string) => new Date(`${s}T00:00:00Z`);

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
			canManageProgram: q.quanTri,
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
			return { ...input, version: row.version };
		});
	}

	async assertKyGhiDuoc(tx: Tx, cycleId: string) {
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
}
