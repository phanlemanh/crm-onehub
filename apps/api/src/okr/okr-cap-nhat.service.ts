import type { Db, Prisma } from "@crm/db";
import { KY_CON_HIEN } from "@crm/db/okr-chu-ky-hien";
import { dieuKienXemMucTieu } from "@crm/db/okr-hien-thi";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { readTenGoc } from "@crm/db/workspace";
import {
	type GuiCapNhatInput,
	kiemGiaTriTheoKieu,
	type MoCapNhatInput,
	MUC_TU_TIN,
} from "@crm/validation/okr-cap-nhat";
import { kieuKr, NGUON_KR } from "@crm/validation/okr-kr";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { tenDonVi } from "./don-vi";
import type { CapNhatTuanOutput } from "./okr.contracts";
import {
	chonSoMay,
	chonTenDonVi,
	doCanhVaSoMay,
	OkrService,
} from "./okr.service";
import { chonDonVi, donViCua, OkrAccessService } from "./okr-access.service";
import { OkrCanhKrService } from "./okr-canh-kr.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
const mucTuTin = z.enum(MUC_TU_TIN);
const nguonKr = z.enum(NGUON_KR);
const soDb = (d: Prisma.Decimal | number) => Number(d);
const ngayDb = (s: string) => new Date(`${s}T00:00:00Z`);

@Injectable()
export class OkrCapNhatService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrCanhKrService) private readonly canhKr: OkrCanhKrService,
	) {}

	async capNhatTuan(
		userId: string,
		now = new Date(),
	): Promise<CapNhatTuanOutput> {
		const tuan = dauTuanVN(now);
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const krs = await this.db.okrKeyResult.findMany({
			where: {
				ownerUserId: userId,
				objective: {
					AND: [
						{
							status: "cong-bo",
							cycle: { phase: "dang-chay", ...KY_CON_HIEN },
						},
						dieuKienXemMucTieu(nc),
					],
				},
			},
			include: {
				objective: {
					select: {
						title: true,
						...chonTenDonVi,
						cycle: { select: { updateWeekday: true } },
					},
				},
				...chonSoMay,
			},
			orderBy: [
				{ objective: { createdAt: "asc" } },
				{ objectiveId: "asc" },
				{ position: "asc" },
			],
		});
		const lan = await this.db.okrCheckIn.findMany({
			where: {
				keyResultId: { in: krs.map((k) => k.id) },
				keyResult: { objective: dieuKienXemMucTieu(nc) },
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			distinct: ["keyResultId"],
		});
		const thu = [...new Set(krs.map((k) => k.objective.cycle.updateWeekday))];
		const tenGoc = await readTenGoc(this.db);
		return {
			items: krs.map((k) => {
				const cuoi = lan.find((l) => l.keyResultId === k.id);
				const nguon = nguonKr.parse(k.source);
				const chup = k.soChup[0];
				return {
					keyResultId: k.id,
					title: k.title,
					objectiveId: k.objectiveId,
					objectiveTitle: k.objective.title,
					unitName: tenDonVi(k.objective, tenGoc),
					kind: kieuKr.parse(k.kind),
					unit: k.unit,
					targetValue: soDb(k.targetValue),
					currentValue: soDb(k.currentValue),
					lastConfidence: cuoi ? mucTuTin.parse(cuoi.confidence) : null,
					lastAt: cuoi ? cuoi.createdAt.toISOString() : null,
					updatedThisWeek:
						cuoi !== undefined &&
						cuoi.weekStart.toISOString().slice(0, 10) === tuan,
					nguon,
					...doCanhVaSoMay(nguon, k.nguonMay, chup),
				};
			}),
			weekStart: tuan,
			dueWeekday: thu.length > 0 ? Math.min(...thu) : null,
		};
	}

	async moCapNhat(userId: string, input: MoCapNhatInput, now = new Date()) {
		const phien = await this.db.okrCheckInSession.create({
			data: { userId, entry: input.entry, openedAt: now },
		});
		return { sessionId: phien.id };
	}

	async guiCapNhat(userId: string, input: GuiCapNhatInput, now = new Date()) {
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCheckInSession" WHERE id = ${input.sessionId} FOR UPDATE`;
			const phien = await tx.okrCheckInSession.findUnique({
				where: { id: input.sessionId },
			});
			if (!phien || phien.userId !== userId)
				throw new ForbiddenException(T.capNhat.phienKhongCua);
			if (phien.submittedAt)
				throw new BadRequestException(T.capNhat.phienDaGui);
			const krs = await tx.okrKeyResult.findMany({
				where: { id: { in: input.items.map((m) => m.keyResultId) } },
				include: {
					objective: {
						select: { ...chonDonVi, cycle: { select: { phase: true } } },
					},
				},
			});
			for (const cycleId of [
				...new Set(krs.map((k) => k.objective.cycleId)),
			].sort())
				await this.okr.assertKyChuaAn(tx, cycleId);
			const q = await this.quyenOkr.quyen(userId);
			const ke = input.items.map((m) => {
				const kr = krs.find((k) => k.id === m.keyResultId);
				if (!kr) throw new NotFoundException(T.khongCoKr(m.keyResultId));
				if (kr.objective.status !== "cong-bo")
					throw new BadRequestException(T.capNhat.mucTieuChuaCongBo);
				if (kr.objective.cycle.phase !== "dang-chay")
					throw new BadRequestException(T.capNhat.kyKhongChay);
				const chu = kr.ownerUserId === userId;
				if (
					!this.quyenOkr.ghiDuocKr(q, userId, {
						ownerUserId: kr.ownerUserId,
						objective: donViCua(kr.objective),
					})
				)
					throw new ForbiddenException(T.capNhat.khongPhaiChuHayTruong);
				const may = kr.source !== "tay";
				if (!may) {
					const loi = kiemGiaTriTheoKieu(kieuKr.parse(kr.kind), m.value);
					if (loi) throw new BadRequestException(T.capNhat.giaTri[loi]);
				}
				return { kr, m, onBehalf: !chu, may };
			});
			const tuan = ngayDb(dauTuanVN(now));
			for (const { kr, m, onBehalf, may } of ke) {
				const giaTri = may ? soDb(kr.currentValue) : m.value;
				await tx.okrCheckIn.create({
					data: {
						keyResultId: kr.id,
						sessionId: phien.id,
						weekStart: tuan,
						value: giaTri,
						confidence: m.confidence,
						note: m.note,
						authorUserId: userId,
						ownerUserId: kr.ownerUserId,
						onBehalf,
					},
				});
				if (!may) {
					await tx.okrKeyResult.update({
						where: { id: kr.id },
						data: { currentValue: m.value },
					});
				}
				await this.okr.vet(
					tx,
					userId,
					"cap-nhat-tuan",
					{ objectiveId: kr.objectiveId, keyResultId: kr.id },
					{ currentValue: soDb(kr.currentValue) },
					{ currentValue: giaTri, confidence: m.confidence, onBehalf },
				);
				if (m.bangChung) {
					const kind = kieuKr.parse(kr.kind);
					await this.canhKr.ghiBangChung(
						tx,
						userId,
						{
							id: kr.id,
							ownerUserId: kr.ownerUserId,
							objective: donViCua(kr.objective),
							kind,
							xong: kind === "moc" && giaTri === 1,
						},
						m.bangChung,
					);
				}
			}
			const seconds = Math.max(
				0,
				Math.floor(
					(now.getTime() - phien.openedAt.getTime()) / OKR.thoiGian.giayMs,
				),
			);
			await tx.okrCheckInSession.update({
				where: { id: phien.id },
				data: { submittedAt: now, seconds },
			});
			return { written: ke.length, seconds };
		});
	}
}
