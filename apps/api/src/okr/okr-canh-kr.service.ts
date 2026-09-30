import { docDuocPhamVi } from "@crm/auth";
import { type Db, Prisma } from "@crm/db";
import { dieuKienXemMucTieu } from "@crm/db/okr-hien-thi";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	type BangChungVao,
	type DanhDauViecInput,
	type GanSangKienInput,
	type GuiGhiNhanInput,
	type IdInput,
	LOAI_VIEC_KR,
	type SuaViecInput,
	type ThemBangChungInput,
	type ThemViecInput,
} from "@crm/validation/okr-canh-kr";
import { ghiDuocOPha, PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
import { type KieuKr, kieuKr } from "@crm/validation/okr-kr";
import type { CapMucTieu } from "@crm/validation/okr-muc-tieu";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import {
	anhVetViec,
	chonHangViec,
	cotNgay,
	dongViecTu,
	hangViec,
	lienKetChoVai,
} from "./canh-kr";
import { OkrService } from "./okr.service";
import {
	chonDonVi,
	donViCua,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import type { CanhKrOutput, DongCanh } from "./okr-canh-kr.contracts";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;

const phaChuKy = z.enum(PHA_CHU_KY);

const chonHangCanh = {
	...chonHangViec,
	campaign: { select: { id: true, name: true, status: true } },
	plan: {
		select: {
			id: true,
			closedAt: true,
			company: { select: { name: true, archivedAt: true } },
		},
	},
} as const;

@Injectable()
export class OkrCanhKrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly access: OkrAccessService,
	) {}

	private async krDeGhi(
		tx: Tx,
		keyResultId: string,
		ghi: "noi-dung" | "tien-do" = "noi-dung",
	) {
		const kr = await tx.okrKeyResult.findUnique({
			where: { id: keyResultId },
			select: {
				id: true,
				ownerUserId: true,
				objective: { select: chonDonVi },
			},
		});
		if (!kr) throw new NotFoundException(T.khongCoKr(keyResultId));
		await this.okr.assertKyGhiDuoc(tx, kr.objective.cycleId);
		if (kr.objective.status === "da-bo")
			throw new BadRequestException(T.canhKr.mucTieuDaBo);
		if (ghi === "noi-dung" && kr.objective.status === "cho-duyet")
			throw new BadRequestException(T.dangChoDuyet);
		return { ...kr, objective: donViCua(kr.objective) };
	}

	private assertGhiDuoc(
		q: Quyen,
		userId: string,
		kr: Awaited<ReturnType<OkrCanhKrService["krDeGhi"]>>,
	) {
		if (!this.access.ghiDuocKr(q, userId, kr))
			throw new ForbiddenException(T.canhKr.khongSuaDuoc);
	}

	private async viecCo(tx: Tx, id: string) {
		const row = await tx.okrViecKr.findUnique({
			where: { id },
			select: chonHangViec,
		});
		if (!row) throw new NotFoundException(T.canhKr.khongCoViec(id));
		return hangViec(row);
	}

	private async viecTuGo(tx: Tx, id: string) {
		const v = await this.viecCo(tx, id);
		if (v.loai !== "viec") throw new BadRequestException(T.canhKr.chiViecTuGo);
		return v;
	}

	private assertNguoiLam(tx: Tx, userId: string) {
		return this.okr.assertThanhVien(
			tx,
			[userId],
			() => T.canhKr.nguoiLamKhongPhaiThanhVien,
		);
	}

	async canhKr(
		userId: string,
		keyResultId: string,
		now = new Date(),
	): Promise<CanhKrOutput> {
		const q = await this.access.quyen(userId);
		const nc = this.access.nguCanhXem(q, userId);
		const kr = await this.db.okrKeyResult.findFirst({
			where: { id: keyResultId, objective: dieuKienXemMucTieu(nc) },
			select: {
				id: true,
				title: true,
				kind: true,
				currentValue: true,
				objectiveId: true,
				ownerUserId: true,
				owner: { select: { name: true } },
				objective: {
					select: { ...chonDonVi, cycle: { select: { phase: true } } },
				},
			},
		});
		if (!kr) throw new NotFoundException(T.khongThayMucTieu);
		const [viec, bangChung] = await Promise.all([
			this.db.okrViecKr.findMany({
				where: {
					keyResultId,
					keyResult: { objective: dieuKienXemMucTieu(nc) },
				},
				orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
				select: chonHangCanh,
			}),
			this.db.okrBangChung.findMany({
				where: {
					keyResultId,
					keyResult: { objective: dieuKienXemMucTieu(nc) },
				},
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
				select: {
					id: true,
					url: true,
					ghiChu: true,
					createdAt: true,
					tacGia: { select: { id: true, name: true } },
				},
			}),
		]);
		const hang = viec.map((v) => ({
			...hangViec(v),
			campaign: v.campaign,
			plan: v.plan,
		}));
		const nguoiLamIds = [
			...new Set(hang.flatMap((h) => h.nguoiLamUserId ?? [])),
		];
		const [nguoi, thanhVien] = await Promise.all([
			this.db.user.findMany({
				where: { id: { in: nguoiLamIds } },
				select: { id: true, name: true },
			}),
			this.okr.locThanhVien(this.db, nguoiLamIds),
		]);
		const objective = donViCua(kr.objective);
		const suaDuoc = this.access.ghiDuocKr(q, userId, {
			ownerUserId: kr.ownerUserId,
			objective,
		});
		const boiCanh = {
			userId,
			homNay: ngayVN(now),
			tenNguoi: new Map(nguoi.map((n) => [n.id, n.name])),
			conThanhVien: new Set(thanhVien.giu),
		};
		const kind = kieuKr.parse(kr.kind);
		return {
			kr: {
				id: kr.id,
				title: kr.title,
				kind,
				objectiveId: kr.objectiveId,
				ownerName: kr.owner.name,
				xong: kind === "moc" && Number(kr.currentValue) === 1,
			},
			dong: hang.map(
				(h): DongCanh =>
					h.loai === "viec"
						? dongViecTu(h, boiCanh)
						: {
								id: h.id,
								loai: h.loai,
								lienKet: lienKetChoVai(q.role, { ...h, loai: h.loai }),
							},
			),
			bangChung: bangChung.map((b) => ({
				id: b.id,
				url: b.url,
				ghiChu: b.ghiChu,
				nguoiDinh: b.tacGia,
				dinhLuc: b.createdAt.toISOString(),
			})),
			quyen: {
				suaDuoc,
				ganDuoc: suaDuoc && docDuocPhamVi(q.role, "doi-tac"),
			},
			khoa:
				!ghiDuocOPha(phaChuKy.parse(kr.objective.cycle.phase)) ||
				objective.status === "da-bo",
			choDuyet: objective.status === "cho-duyet",
		};
	}

	async themViec(
		userId: string,
		input: ThemViecInput,
	): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		return this.db.$transaction(async (tx) => {
			const kr = await this.krDeGhi(tx, input.keyResultId);
			this.assertGhiDuoc(q, userId, kr);
			await this.assertNguoiLam(tx, input.nguoiLamUserId);
			const cuoi = await tx.okrViecKr.aggregate({
				where: { keyResultId: kr.id },
				_max: { position: true },
			});
			const row = await tx.okrViecKr.create({
				data: {
					keyResultId: kr.id,
					loai: "viec",
					tieuDe: input.tieuDe,
					nguoiLamUserId: input.nguoiLamUserId,
					hanNgay: input.hanNgay === null ? null : cotNgay(input.hanNgay),
					taoBoiUserId: userId,
					position: (cuoi._max.position ?? -1) + 1,
				},
				select: chonHangViec,
			});
			await this.okr.vet(
				tx,
				userId,
				"them-viec",
				{ objectiveId: kr.objective.id, keyResultId: kr.id },
				null,
				anhVetViec(hangViec(row)),
			);
			return { id: row.id };
		});
	}

	async ganSangKien(
		userId: string,
		input: GanSangKienInput,
	): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		try {
			return await this.db.$transaction(async (tx) => {
				const kr = await this.krDeGhi(tx, input.keyResultId);
				if (!docDuocPhamVi(q.role, "doi-tac"))
					throw new ForbiddenException(T.canhKr.khongGanDuoc);
				this.assertGhiDuoc(q, userId, kr);
				const nguon = await this.nguonSangKien(tx, input);
				const cuoi = await tx.okrViecKr.aggregate({
					where: { keyResultId: kr.id },
					_max: { position: true },
				});
				const row = await tx.okrViecKr.create({
					data: {
						keyResultId: kr.id,
						loai: input.loai,
						tieuDe: "",
						...nguon,
						taoBoiUserId: userId,
						position: (cuoi._max.position ?? -1) + 1,
					},
					select: chonHangViec,
				});
				await this.okr.vet(
					tx,
					userId,
					"gan-sang-kien",
					{ objectiveId: kr.objective.id, keyResultId: kr.id },
					null,
					anhVetViec(hangViec(row)),
				);
				return { id: row.id };
			});
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002"
			)
				throw new BadRequestException(T.canhKr.daGan);
			throw e;
		}
	}

	private async nguonSangKien(
		tx: Tx,
		input: GanSangKienInput,
	): Promise<{ campaignId: string } | { planId: string }> {
		if (input.loai === "chien-dich") {
			const c = await tx.campaign.findUnique({
				where: { id: input.banGhiId },
				select: { id: true },
			});
			if (!c)
				throw new NotFoundException(T.canhKr.khongCoChienDich(input.banGhiId));
			return { campaignId: c.id };
		}
		const p = await tx.onboardingPlan.findUnique({
			where: { id: input.banGhiId },
			select: { id: true },
		});
		if (!p)
			throw new NotFoundException(T.canhKr.khongCoKeHoach(input.banGhiId));
		return { planId: p.id };
	}

	async suaViec(userId: string, input: SuaViecInput): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		return this.db.$transaction(async (tx) => {
			const cu = await this.viecTuGo(tx, input.id);
			const kr = await this.krDeGhi(tx, cu.keyResultId);
			this.assertGhiDuoc(q, userId, kr);
			if (input.nguoiLamUserId !== undefined)
				await this.assertNguoiLam(tx, input.nguoiLamUserId);
			const moi = await tx.okrViecKr.update({
				where: { id: cu.id },
				data: {
					tieuDe: input.tieuDe,
					nguoiLamUserId: input.nguoiLamUserId,
					hanNgay:
						input.hanNgay === undefined
							? undefined
							: input.hanNgay === null
								? null
								: cotNgay(input.hanNgay),
				},
				select: chonHangViec,
			});
			await this.okr.vet(
				tx,
				userId,
				"sua-viec",
				{ objectiveId: kr.objective.id, keyResultId: kr.id },
				anhVetViec(cu),
				anhVetViec(hangViec(moi)),
			);
			return { id: cu.id };
		});
	}

	async danhDauViec(
		userId: string,
		input: DanhDauViecInput,
		now = new Date(),
	): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		return this.db.$transaction(async (tx) => {
			const cu = await this.viecTuGo(tx, input.id);
			const kr = await this.krDeGhi(tx, cu.keyResultId, "tien-do");
			if (cu.nguoiLamUserId !== userId) this.assertGhiDuoc(q, userId, kr);
			await tx.okrViecKr.update({
				where: { id: cu.id },
				data: { xongLuc: input.xong ? (cu.xongLuc ?? now) : null },
			});
			await this.okr.vet(
				tx,
				userId,
				"xong-viec",
				{ objectiveId: kr.objective.id, keyResultId: kr.id },
				{ viecId: cu.id, xong: cu.xongLuc !== null },
				{ viecId: cu.id, xong: input.xong },
			);
			return { id: cu.id };
		});
	}

	async goViec(userId: string, input: IdInput): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		return this.db.$transaction(async (tx) => {
			const cu = await this.viecCo(tx, input.id);
			const kr = await this.krDeGhi(tx, cu.keyResultId);
			this.assertGhiDuoc(q, userId, kr);
			await tx.okrViecKr.delete({ where: { id: cu.id } });
			await this.okr.vet(
				tx,
				userId,
				"go-viec",
				{ objectiveId: kr.objective.id, keyResultId: kr.id },
				anhVetViec(cu),
				null,
			);
			return { id: cu.id };
		});
	}

	async ghiBangChung(
		tx: Tx,
		userId: string,
		kr: KrChoBangChung,
		vao: BangChungVao,
	): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		this.assertGhiDuoc(q, userId, kr);
		if (kr.kind !== "moc" || !kr.xong)
			throw new BadRequestException(T.canhKr.chiMocXongDinhDuoc);
		const row = await tx.okrBangChung.create({
			data: {
				keyResultId: kr.id,
				url: vao.url,
				ghiChu: vao.ghiChu,
				tacGiaUserId: userId,
			},
			select: { id: true, url: true },
		});
		await this.okr.vet(
			tx,
			userId,
			"dinh-bang-chung",
			{ objectiveId: kr.objective.id, keyResultId: kr.id },
			null,
			{ bangChungId: row.id, url: row.url },
		);
		return { id: row.id };
	}

	async themBangChung(
		userId: string,
		input: ThemBangChungInput,
	): Promise<{ id: string }> {
		return this.db.$transaction(async (tx) => {
			const kr = await this.krDeGhi(tx, input.keyResultId);
			const full = await tx.okrKeyResult.findUniqueOrThrow({
				where: { id: kr.id },
				select: { kind: true, currentValue: true },
			});
			return this.ghiBangChung(
				tx,
				userId,
				{
					...kr,
					kind: kieuKr.parse(full.kind),
					xong: Number(full.currentValue) === 1,
				},
				input,
			);
		});
	}

	async guiGhiNhan(
		userId: string,
		input: GuiGhiNhanInput,
		now = new Date(),
	): Promise<{ id: string }> {
		const { q, nc, mt } = await this.access.assertXemMucTieu(
			userId,
			input.objectiveId,
		);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyChuaAn(tx, mt.cycleId);
			if (mt.status !== "cong-bo")
				throw new BadRequestException(T.canhKr.ghiNhanChiCongBo);
			if (input.nguoiNhan.includes(userId))
				throw new BadRequestException(T.canhKr.tuGhiNhan);
			if (input.keyResultId !== null) {
				const kr = await tx.okrKeyResult.findFirst({
					where: {
						id: input.keyResultId,
						objective: dieuKienXemMucTieu(nc),
					},
					select: { objectiveId: true },
				});
				if (!kr) throw new NotFoundException(T.khongCoKr(input.keyResultId));
				if (kr.objectiveId !== mt.id)
					throw new BadRequestException(T.traoDoi.krKhacMucTieu);
			}
			await this.okr.assertThanhVien(
				tx,
				input.nguoiNhan,
				() => T.canhKr.nguoiNhanKhongConThanhVien,
			);
			await this.access.assertXemDuocHet(
				q,
				mt.id,
				input.nguoiNhan,
				T.canhKr.nguoiNhanKhongXemDuoc,
			);
			const row = await tx.okrGhiNhan.create({
				data: {
					objectiveId: mt.id,
					keyResultId: input.keyResultId,
					loiNhan: input.loiNhan,
					tacGiaUserId: userId,
					createdAt: now,
					nhan: { create: input.nguoiNhan.map((id) => ({ userId: id })) },
				},
				select: { id: true },
			});
			await this.okr.vet(
				tx,
				userId,
				"ghi-nhan",
				{
					objectiveId: mt.id,
					keyResultId: input.keyResultId ?? undefined,
				},
				null,
				{ ghiNhanId: row.id, nguoiNhan: input.nguoiNhan },
			);
			return { id: row.id };
		});
	}

	async goGhiNhan(userId: string, input: IdInput): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		return this.db.$transaction(async (tx) => {
			const row = await tx.okrGhiNhan.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					objectiveId: true,
					keyResultId: true,
					tacGiaUserId: true,
					objective: { select: { cycleId: true } },
					nhan: { select: { userId: true }, orderBy: { userId: "asc" } },
				},
			});
			if (!row) throw new NotFoundException(T.canhKr.khongCoGhiNhan(input.id));
			await this.okr.assertKyChuaAn(tx, row.objective.cycleId);
			if (row.tacGiaUserId !== userId && !q.quanTri)
				throw new ForbiddenException(T.canhKr.khongGoDuocGhiNhan);
			await tx.okrGhiNhan.delete({ where: { id: row.id } });
			await this.okr.vet(
				tx,
				userId,
				"go-ghi-nhan",
				{
					objectiveId: row.objectiveId,
					keyResultId: row.keyResultId ?? undefined,
				},
				{ ghiNhanId: row.id, nguoiNhan: row.nhan.map((n) => n.userId) },
				null,
			);
			return { id: row.id };
		});
	}

	async goBangChung(userId: string, input: IdInput): Promise<{ id: string }> {
		const q = await this.access.quyen(userId);
		return this.db.$transaction(async (tx) => {
			const row = await tx.okrBangChung.findUnique({
				where: { id: input.id },
				select: { id: true, url: true, ghiChu: true, keyResultId: true },
			});
			if (!row)
				throw new NotFoundException(T.canhKr.khongCoBangChung(input.id));
			const kr = await this.krDeGhi(tx, row.keyResultId);
			this.assertGhiDuoc(q, userId, kr);
			await tx.okrBangChung.delete({ where: { id: row.id } });
			await this.okr.vet(
				tx,
				userId,
				"go-bang-chung",
				{ objectiveId: kr.objective.id, keyResultId: kr.id },
				{ bangChungId: row.id, url: row.url, ghiChu: row.ghiChu },
				null,
			);
			return { id: row.id };
		});
	}
}

export type KrChoBangChung = {
	id: string;
	ownerUserId: string;
	objective: {
		id: string;
		cycleId: string;
		level: CapMucTieu;
		divisionId: string | null;
		departmentId: string | null;
		personUserId: string | null;
		status: string;
	};
	kind: KieuKr;
	xong: boolean;
};
