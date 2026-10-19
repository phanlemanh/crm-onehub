import type { Db } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { demTinHieuTrongNgay } from "@crm/db/tin-hieu";
import {
	bocPhanHoiKeoVe,
	dungNoiDung,
	type GuiTinHieuInput,
	idTep,
	type KeoVeOutput,
	type LoaiVetTinHieu,
	lamSachMan,
	TIN_HIEU,
	tepTuBanGhi,
} from "@crm/validation/tin-hieu";
import {
	laQuanTriWorkspace,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";
import {
	ConflictException,
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { archivedFilter } from "../trpc/list-input";
import type {
	GuiTinHieuOutput,
	LuuTruTinHieuOutput,
	TinHieuCuaToiOutput,
	TinHieuTatCaOutput,
} from "./tin-hieu.contracts";

const CHON_TAT_CA = {
	id: true,
	so: true,
	tieuDe: true,
	muonLam: true,
	man: true,
	guiLuc: true,
	keoVeLuc: true,
	archivedAt: true,
	nguoiGui: { select: { id: true, name: true } },
	phongBan: { select: { id: true, name: true } },
	archivedBy: { select: { id: true, name: true } },
} as const;

export type NguoiGoiTinHieu = { id: string; role: WorkspaceRole | null };

@Injectable()
export class TinHieuService {
	private readonly logger = new Logger(TinHieuService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	async gui(
		nguoi: NguoiGoiTinHieu,
		input: GuiTinHieuInput,
	): Promise<GuiTinHieuOutput> {
		const now = new Date();
		const noiDung = dungNoiDung(input);
		const hang = await this.db.$transaction(async (tx) => {
			await lockIdempotencyKey(tx, `tin-hieu:${nguoi.id}`);
			const daGui = await demTinHieuTrongNgay(tx, nguoi.id, now);
			if (daGui >= TIN_HIEU.tranMoiNgay)
				throw new HttpException(
					TIN_HIEU.loi.quaTran.replace("{tran}", String(TIN_HIEU.tranMoiNgay)),
					HttpStatus.TOO_MANY_REQUESTS,
				);
			const cho = await tx.orgPlacement.findUnique({
				where: { userId: nguoi.id },
				select: {
					primaryDepartment: { select: { id: true, archivedAt: true } },
				},
			});
			const pb = cho?.primaryDepartment;
			return tx.tinHieu.create({
				data: {
					nguoiGuiId: nguoi.id,
					phongBanId: pb && !pb.archivedAt ? pb.id : null,
					...noiDung,
					man: lamSachMan(input.man),
					guiLuc: now,
				},
				select: { id: true, so: true },
			});
		});
		this.logger.log({ message: "tin-hieu.gui", userId: nguoi.id, so: hang.so });
		return { id: hang.id, ma: idTep(hang.so) };
	}

	async cuaToi(nguoi: NguoiGoiTinHieu): Promise<TinHieuCuaToiOutput> {
		const rows = await this.db.tinHieu.findMany({
			where: { nguoiGuiId: nguoi.id },
			orderBy: { guiLuc: "desc" },
			select: {
				id: true,
				so: true,
				tieuDe: true,
				muonLam: true,
				man: true,
				guiLuc: true,
				keoVeLuc: true,
				archivedAt: true,
			},
		});
		return {
			rows: rows.map(({ keoVeLuc, archivedAt, ...r }) => ({
				...r,
				ma: idTep(r.so),
				daKeoVe: keoVeLuc !== null,
				daLuuTru: archivedAt !== null,
			})),
		};
	}

	async tatCa(
		nguoi: NguoiGoiTinHieu,
		daLuuTru = false,
	): Promise<TinHieuTatCaOutput> {
		if (!laQuanTriWorkspace(nguoi.role)) throw new ForbiddenException();
		const rows = await this.db.tinHieu.findMany({
			where: archivedFilter(daLuuTru),
			orderBy: daLuuTru ? { archivedAt: "desc" } : { guiLuc: "desc" },
			select: CHON_TAT_CA,
		});
		this.logger.log({
			message: daLuuTru ? "tin-hieu.da-luu-tru" : "tin-hieu.tat-ca",
			userId: nguoi.id,
			so: rows.length,
		});
		const thamChieu = (x: { id: string; name: string } | null) =>
			x ? { id: x.id, ten: x.name } : null;
		return {
			rows: rows.map(({ keoVeLuc, nguoiGui, phongBan, archivedBy, ...r }) => ({
				...r,
				ma: idTep(r.so),
				daKeoVe: keoVeLuc !== null,
				daLuuTru: r.archivedAt !== null,
				nguoiGui: thamChieu(nguoiGui),
				phongBan: thamChieu(phongBan),
				nguoiLuuTru: thamChieu(archivedBy),
			})),
		};
	}

	async luuTru(
		nguoi: NguoiGoiTinHieu,
		id: string,
	): Promise<LuuTruTinHieuOutput> {
		if (!laQuanTriWorkspace(nguoi.role)) throw new ForbiddenException();
		const kq = await this.db.$transaction(async (tx) => {
			await tx.$executeRaw`LOCK TABLE "tinHieu" IN ROW EXCLUSIVE MODE`;
			const luc = new Date();
			const doi = await tx.tinHieu.updateMany({
				where: { id, archivedAt: null, keoVeLuc: null },
				data: { archivedAt: luc, archivedById: nguoi.id },
			});
			const hang = await tx.tinHieu.findUnique({
				where: { id },
				select: { so: true, keoVeLuc: true, archivedAt: true },
			});
			if (!hang) throw new NotFoundException(TIN_HIEU.loi.khongCo);
			if (doi.count === 0 && !hang.archivedAt)
				throw new ConflictException(TIN_HIEU.loi.luuTruDaLayVe);
			if (doi.count === 1)
				await this.ghiVet(tx, id, hang.so, nguoi.id, "luu-tru");
			return { so: hang.so, luc: hang.archivedAt ?? luc, doi: doi.count };
		});
		this.logger.log({
			message: "tin-hieu.luu-tru",
			userId: nguoi.id,
			so: kq.so,
			doi: kq.doi,
		});
		return { ok: true, daLuuTruLuc: kq.luc };
	}

	async khoiPhuc(nguoi: NguoiGoiTinHieu, id: string): Promise<{ ok: true }> {
		if (!laQuanTriWorkspace(nguoi.role)) throw new ForbiddenException();
		const kq = await this.db.$transaction(async (tx) => {
			await tx.$executeRaw`LOCK TABLE "tinHieu" IN ROW EXCLUSIVE MODE`;
			const doi = await tx.tinHieu.updateMany({
				where: { id, archivedAt: { not: null } },
				data: { archivedAt: null, archivedById: null },
			});
			const hang = await tx.tinHieu.findUnique({
				where: { id },
				select: { so: true },
			});
			if (!hang) throw new NotFoundException(TIN_HIEU.loi.khongCo);
			if (doi.count === 1)
				await this.ghiVet(tx, id, hang.so, nguoi.id, "khoi-phuc");
			return { so: hang.so, doi: doi.count };
		});
		this.logger.log({
			message: "tin-hieu.khoi-phuc",
			userId: nguoi.id,
			so: kq.so,
			doi: kq.doi,
		});
		return { ok: true };
	}

	private ghiVet(
		tx: Parameters<Parameters<Db["$transaction"]>[0]>[0],
		tinHieuId: string,
		so: number,
		nguoiId: string,
		loai: LoaiVetTinHieu,
	) {
		return tx.tinHieuVet.create({
			data: { tinHieuId, so, nguoiId, loai },
		});
	}

	async xoa(nguoi: NguoiGoiTinHieu, id: string): Promise<{ ok: true }> {
		const so = await this.db.$transaction(async (tx) => {
			await tx.$executeRaw`LOCK TABLE "tinHieu" IN ROW EXCLUSIVE MODE`;
			const hang = await tx.tinHieu.findFirst({
				where: { id, nguoiGuiId: nguoi.id },
				select: { so: true, keoVeLuc: true },
			});
			if (!hang) throw new NotFoundException(TIN_HIEU.loi.khongCo);
			if (hang.keoVeLuc) throw new ConflictException(TIN_HIEU.loi.daLayVe);
			await tx.tinHieu.delete({ where: { id } });
			return hang.so;
		});
		this.logger.log({ message: "tin-hieu.xoa", userId: nguoi.id, so });
		return { ok: true };
	}

	async keoVe(nguoi: NguoiGoiTinHieu): Promise<KeoVeOutput> {
		if (!laQuanTriWorkspace(nguoi.role)) throw new ForbiddenException();
		const luc = new Date();
		const { hang, soDau } = await this.db.$transaction(async (tx) => {
			await tx.$executeRaw`LOCK TABLE "tinHieu" IN SHARE ROW EXCLUSIVE MODE`;
			const dau = await tx.tinHieu.updateMany({
				where: { keoVeLuc: null, archivedAt: null },
				data: { keoVeLuc: luc },
			});
			const rows = await tx.tinHieu.findMany({
				where: { archivedAt: null },
				orderBy: { so: "asc" },
				include: { phongBan: { select: { name: true } } },
			});
			return { hang: rows, soDau: dau.count };
		});
		this.logger.log({
			message: "tin-hieu.keo-ve",
			userId: nguoi.id,
			so: hang.length,
		});
		return bocPhanHoiKeoVe(
			hang.map((h) => ({
				id: idTep(h.so),
				tep: tepTuBanGhi(h),
				phongBan: h.phongBan?.name ?? null,
				phongBanId: h.phongBanId,
				keoVeLuc: (h.keoVeLuc ?? luc).toISOString(),
			})),
			soDau > 0 ? luc.toISOString() : null,
		);
	}
}
