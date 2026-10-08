import { canManageSettings, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { GIAI_DOAN, type LoaiGiaiDoan } from "@crm/db/giai-doan";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import { DealsService } from "../deals/deals.service";
import {
	type GiaiDoanArchived,
	type GiaiDoanArchiveInput,
	type GiaiDoanCreateInput,
	type GiaiDoanList,
	type GiaiDoanRenameInput,
	type GiaiDoanReorderInput,
	type GiaiDoanRestoreInput,
	giaiDoanArchiveInput,
	giaiDoanCreateInput,
	giaiDoanRenameInput,
	giaiDoanReorderInput,
	giaiDoanRestoreInput,
} from "./giai-doan.contracts";
import { GIAI_DOAN_API } from "./giai-doan-config";

type GiaiDoanSong = {
	id: string;
	label: string;
	kind: LoaiGiaiDoan;
	position: number;
};

const M = GIAI_DOAN_API.messages;

function chuanNhan(label: string): string {
	return label.trim().toLocaleLowerCase("vi");
}

@Injectable()
export class GiaiDoanService {
	private readonly logger = new Logger(GiaiDoanService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly agent: AgentTriggerService,
		private readonly deals: DealsService,
	) {}

	async list(userId: string): Promise<GiaiDoanList> {
		const [canManage, rows, dem] = await Promise.all([
			this.canManage(userId),
			this.db.dealStage.findMany({
				where: { archivedAt: null },
				orderBy: [{ kind: "asc" }, { position: "asc" }],
				select: { id: true, label: true, kind: true, position: true },
			}),
			this.db.deal.groupBy({ by: ["stage"], _count: { _all: true } }),
		]);
		const theoId = new Map(dem.map((d) => [d.stage, d._count._all]));
		return {
			canManage,
			tran: GIAI_DOAN.tran.tong,
			stages: rows.map((g) => ({ ...g, dealCount: theoId.get(g.id) ?? 0 })),
		};
	}

	async create(userId: string, raw: GiaiDoanCreateInput) {
		await this.requireManager(userId);
		const input = giaiDoanCreateInput.parse(raw);
		const created = await this.db.$transaction(async (tx) => {
			const song = await this.khoaSong(tx);
			if (song.length >= GIAI_DOAN.tran.tong) {
				throw new BadRequestException(M.tran);
			}
			if (this.nhanTrung(song, input.label)) {
				throw new BadRequestException(M.trung);
			}
			const cung = song.filter((g) => g.kind === input.kind);
			const position =
				cung.length === 0 ? 0 : Math.max(...cung.map((g) => g.position)) + 1;
			return tx.dealStage.create({
				data: { label: input.label, kind: input.kind, position },
				select: { id: true },
			});
		});
		this.logger.log({ message: "Deal stage created", stageId: created.id });
		return created;
	}

	async rename(userId: string, raw: GiaiDoanRenameInput) {
		await this.requireManager(userId);
		const input = giaiDoanRenameInput.parse(raw);
		return this.db.$transaction(async (tx) => {
			const song = await this.khoaSong(tx);
			if (!song.some((g) => g.id === input.id)) {
				throw new NotFoundException(M.khongCo);
			}
			if (this.nhanTrung(song, input.label, input.id)) {
				throw new BadRequestException(M.trung);
			}
			return tx.dealStage.update({
				where: { id: input.id },
				data: { label: input.label },
				select: { id: true },
			});
		});
	}

	async reorder(userId: string, raw: GiaiDoanReorderInput) {
		await this.requireManager(userId);
		const input = giaiDoanReorderInput.parse(raw);
		await this.db.$transaction(async (tx) => {
			const song = await this.khoaSong(tx);
			const cua = song.filter((g) => g.kind === input.kind).map((g) => g.id);
			const dung =
				new Set(input.ids).size === input.ids.length &&
				input.ids.length === cua.length &&
				input.ids.every((id) => cua.includes(id));
			if (!dung) throw new BadRequestException(M.danhSachLech);
			for (const [position, id] of input.ids.entries()) {
				await tx.dealStage.update({ where: { id }, data: { position } });
			}
		});
		return { id: input.ids[0] as string };
	}

	async archive(userId: string, raw: GiaiDoanArchiveInput) {
		await this.requireManager(userId);
		const input = giaiDoanArchiveInput.parse(raw);
		const now = new Date();
		const ketQua = await this.agent.withCrmEvents(
			async (tx, emit) => {
				const song = await this.khoaSong(tx);
				const nguon = song.find((g) => g.id === input.id);
				if (!nguon) throw new NotFoundException(M.khongCo);
				if (song.filter((g) => g.kind === nguon.kind).length === 1) {
					throw new BadRequestException(M.cuoiCung);
				}
				const conLai = await tx.deal.findMany({
					where: { stage: nguon.id },
					select: { id: true },
					orderBy: { id: "asc" },
				});
				if (conLai.length > 0) {
					if (!input.moveTo) throw new BadRequestException(M.conThoaThuan);
					const dich = song.find((g) => g.id === input.moveTo);
					if (!dich || dich.id === nguon.id || dich.kind !== nguon.kind) {
						throw new BadRequestException(M.dichSai);
					}
					for (const { id } of conLai) {
						await this.deals.chuyenGiaiDoanTrongTx(tx, emit, {
							dealId: id,
							toStageId: dich.id,
							actingUserId: userId,
							now,
							giuNguyenDong: true,
						});
					}
				}
				await tx.dealStage.update({
					where: { id: nguon.id },
					data: { archivedAt: now },
				});
				return { id: nguon.id, moved: conLai.length };
			},
			{ timeout: GIAI_DOAN_API.thoiHan.xoaMs },
		);
		this.logger.log({
			message: "Deal stage archived",
			stageId: ketQua.id,
			moved: ketQua.moved,
		});
		return { id: ketQua.id };
	}

	async archived(): Promise<GiaiDoanArchived> {
		const rows = await this.db.dealStage.findMany({
			where: { archivedAt: { not: null } },
			orderBy: [{ archivedAt: "desc" }, { id: "asc" }],
			select: { id: true, label: true, kind: true, archivedAt: true },
		});
		return rows.flatMap((g) =>
			g.archivedAt === null
				? []
				: [{ ...g, archivedAt: g.archivedAt.toISOString() }],
		);
	}

	async restore(userId: string, raw: GiaiDoanRestoreInput) {
		await this.requireManager(userId);
		const input = giaiDoanRestoreInput.parse(raw);
		const ketQua = await this.db.$transaction(async (tx) => {
			const song = await this.khoaSong(tx);
			const g = await tx.dealStage.findUnique({
				where: { id: input.id },
				select: { id: true, label: true, kind: true, archivedAt: true },
			});
			if (!g) throw new NotFoundException(M.khongCo);
			if (g.archivedAt === null) throw new BadRequestException(M.chuaLuuTru);
			if (song.length >= GIAI_DOAN.tran.tong) {
				throw new BadRequestException(M.tran);
			}
			if (this.nhanTrung(song, g.label)) {
				throw new BadRequestException(M.trung);
			}
			const cung = song.filter((s) => s.kind === g.kind);
			const position =
				cung.length === 0 ? 0 : Math.max(...cung.map((s) => s.position)) + 1;
			return tx.dealStage.update({
				where: { id: g.id },
				data: { archivedAt: null, position },
				select: { id: true },
			});
		});
		this.logger.log({ message: "Deal stage restored", stageId: ketQua.id });
		return ketQua;
	}

	private async canManage(userId: string): Promise<boolean> {
		return canManageSettings(await workspaceRoleOf(userId));
	}

	private async requireManager(userId: string): Promise<void> {
		if (!(await this.canManage(userId))) {
			throw new ForbiddenException(M.forbidden);
		}
	}

	private async khoaSong(
		tx: Prisma.TransactionClient,
	): Promise<GiaiDoanSong[]> {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('dealStage'))`;
		return tx.$queryRaw<GiaiDoanSong[]>`
			SELECT id, label, kind::text AS kind, position
			FROM "dealStage"
			WHERE "archivedAt" IS NULL
			ORDER BY kind, position
			FOR UPDATE
		`;
	}

	private nhanTrung(song: GiaiDoanSong[], label: string, boQua?: string) {
		const khoa = chuanNhan(label);
		return song.some((g) => g.id !== boQua && chuanNhan(g.label) === khoa);
	}
}
