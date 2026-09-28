import { docDuocPhamVi } from "@crm/auth";
import { type Db, Prisma } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	type BangChungVao,
	type DanhDauViecInput,
	type GanSangKienInput,
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
	cotNgay,
	dongViecTu,
	type HangViec,
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

const loaiViecKr = z.enum(LOAI_VIEC_KR);
const phaChuKy = z.enum(PHA_CHU_KY);

const chonHangViec = {
	id: true,
	keyResultId: true,
	loai: true,
	tieuDe: true,
	nguoiLamUserId: true,
	hanNgay: true,
	xongLuc: true,
	campaignId: true,
	planId: true,
} as const;

type HangViecDb = Prisma.OkrViecKrGetPayload<{ select: typeof chonHangViec }>;

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

function hangViec(h: HangViecDb): HangViec & { keyResultId: string } {
	return { ...h, loai: loaiViecKr.parse(h.loai) };
}

@Injectable()
export class OkrCanhKrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly access: OkrAccessService,
	) {}

	private async krDeGhi(tx: Tx, keyResultId: string) {
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
		const kr = await this.db.okrKeyResult.findUnique({
			where: { id: keyResultId },
			select: {
				id: true,
				title: true,
				kind: true,
				objectiveId: true,
				ownerUserId: true,
				owner: { select: { name: true } },
				objective: {
					select: { ...chonDonVi, cycle: { select: { phase: true } } },
				},
			},
		});
		if (!kr) throw new NotFoundException(T.khongCoKr(keyResultId));
		const [q, viec, bangChung] = await Promise.all([
			this.access.quyen(userId),
			this.db.okrViecKr.findMany({
				where: { keyResultId },
				orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
				select: chonHangCanh,
			}),
			this.db.okrBangChung.findMany({
				where: { keyResultId },
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
		return {
			kr: {
				id: kr.id,
				title: kr.title,
				kind: kieuKr.parse(kr.kind),
				objectiveId: kr.objectiveId,
				ownerName: kr.owner.name,
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
			const kr = await this.krDeGhi(tx, cu.keyResultId);
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
