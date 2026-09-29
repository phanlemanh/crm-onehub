import { isWorkspaceAdmin, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
import {
	type CycleIdInput,
	type DongYInput,
	type GopYInput,
	type MoHoiYInput,
	OKR_HOI_Y,
	parseSoLieuHoiY,
	type SuaHoiYInput,
	type SuaYInput,
	type TrangThaiHoiY,
	trangThaiHoiY,
	type YIdInput,
} from "@crm/validation/okr-hoi-y";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { DONG_HO_HOI_Y, type DongHo } from "./dong-ho";
import {
	chieuYChoNguoiXem,
	docBanTruoc,
	type YChieu,
	type YTho,
} from "./hoi-y";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import type {
	HoiYGhiOutput,
	HoiYNhanOutput,
	HoiYOutput,
	YChieuOutput,
} from "./okr-hoi-y.contracts";

type Tx = Prisma.TransactionClient;

const T = OKR.thongDiep.hoiY;
const phaChuKy = z.enum(PHA_CHU_KY);

function sauGio(tu: Date, soGio: number): Date {
	return new Date(tu.getTime() + soGio * OKR.thoiGian.gioMs);
}

type HoiYKhoa = {
	id: string;
	hanLuc: Date;
	congBoLuc: Date | null;
	nguoiChonUserId: string;
};

function kiemDangMo(h: HoiYKhoa, now: Date): void {
	const trangThai = trangThaiHoiY(h, now);
	if (trangThai === "da-cong-bo") throw new BadRequestException(T.daCongBo);
	if (trangThai === "dang-gom") throw new BadRequestException(T.hetHan);
}

function raY(y: YChieu): YChieuOutput {
	return "tacGia" in y ? { ...y, createdAt: y.createdAt.toISOString() } : y;
}

function kiemHan(han: Date, tu: Date, den: Date, cau: string): void {
	if (han.getTime() < tu.getTime() || han.getTime() > den.getTime())
		throw new BadRequestException(cau);
}

@Injectable()
export class OkrHoiYService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(DONG_HO_HOI_Y) private readonly dongHo: DongHo,
	) {}

	private async assertQuanTri(userId: string): Promise<void> {
		const q = await this.quyenOkr.quyen(userId);
		if (!q.quanTri) throw new ForbiddenException(T.chiQuanTri);
	}

	private async laQuanTri(tx: Tx, userId: string): Promise<boolean> {
		return isWorkspaceAdmin(await workspaceRoleOf(userId, tx));
	}

	async moHoiY(userId: string, input: MoHoiYInput): Promise<HoiYGhiOutput> {
		await this.assertQuanTri(userId);
		const now = this.dongHo();
		const hanLuc = new Date(input.hanLuc);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.cycleId} FOR UPDATE`;
			const c = await tx.okrCycle.findUnique({
				where: { id: input.cycleId },
				select: { phase: true },
			});
			if (!c)
				throw new NotFoundException(OKR.thongDiep.khongCoChuKy(input.cycleId));
			if (phaChuKy.parse(c.phase) !== "lap-ke-hoach")
				throw new BadRequestException(T.kyKhongLapKeHoach);
			const co = await tx.okrHoiY.findUnique({
				where: { cycleId: input.cycleId },
				select: { id: true },
			});
			if (co) throw new BadRequestException(T.daCoHoiY);
			kiemHan(
				hanLuc,
				sauGio(now, OKR_HOI_Y.hanGio.min),
				sauGio(now, OKR_HOI_Y.hanGio.max),
				T.hanNgoaiKhoang,
			);
			if (!(await this.laQuanTri(tx, input.nguoiChonUserId)))
				throw new BadRequestException(T.nguoiChonPhaiQuanTri);
			const h = await tx.okrHoiY.create({
				data: {
					cycleId: input.cycleId,
					cauHoi: input.cauHoi,
					loiMo: input.loiMo,
					soLieu: input.soLieu,
					hanLuc,
					nguoiChonUserId: input.nguoiChonUserId,
					taoBoiUserId: userId,
					createdAt: now,
				},
				select: { id: true },
			});
			await this.okr.vet(
				tx,
				userId,
				"mo-hoi-y",
				{ cycleId: input.cycleId },
				null,
				{
					hoiYId: h.id,
					hanLuc: hanLuc.toISOString(),
					nguoiChonUserId: input.nguoiChonUserId,
					soLieu: input.soLieu.length,
				},
			);
			return { id: h.id };
		});
	}

	async suaHoiY(userId: string, input: SuaHoiYInput): Promise<HoiYGhiOutput> {
		await this.assertQuanTri(userId);
		const now = this.dongHo();
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrHoiY" WHERE id = ${input.hoiYId} FOR UPDATE`;
			const h = await tx.okrHoiY.findUnique({
				where: { id: input.hoiYId },
				include: { banTruoc: { select: { id: true } } },
			});
			if (!h) throw new NotFoundException(T.khongCoHoiY(input.hoiYId));
			const trangThai = trangThaiHoiY(h, now);
			if (trangThai === "da-cong-bo") throw new BadRequestException(T.daCongBo);

			const truoc: OkrVetSnapshot = {};
			const sau: OkrVetSnapshot = {};
			const data: Prisma.OkrHoiYUpdateInput = {};
			if (input.cauHoi !== undefined && input.cauHoi !== h.cauHoi) {
				truoc.cauHoi = h.cauHoi;
				sau.cauHoi = input.cauHoi;
				data.cauHoi = input.cauHoi;
			}
			if (input.loiMo !== undefined && input.loiMo !== h.loiMo) {
				truoc.loiMo = h.loiMo;
				sau.loiMo = input.loiMo;
				data.loiMo = input.loiMo;
			}
			if (input.soLieu !== undefined) {
				const cu = parseSoLieuHoiY(h.soLieu);
				if (JSON.stringify(cu) !== JSON.stringify(input.soLieu)) {
					truoc.soLieu = cu.length;
					sau.soLieu = input.soLieu.length;
					data.soLieu = input.soLieu;
				}
			}
			const han = input.hanLuc === undefined ? null : new Date(input.hanLuc);
			const doiHan =
				han !== null && han.getTime() !== h.hanLuc.getTime() ? han : null;
			if (doiHan) {
				truoc.hanLuc = h.hanLuc.toISOString();
				sau.hanLuc = doiHan.toISOString();
				data.hanLuc = doiHan;
			}
			const doiNoiDung = Object.keys(sau).length > 0;
			if (doiNoiDung && trangThai !== "dang-mo")
				throw new BadRequestException(T.chiKhiDangMo);
			if (doiHan)
				kiemHan(
					doiHan,
					now,
					sauGio(h.createdAt, OKR_HOI_Y.hanGio.max),
					T.hanSuaNgoaiKhoang,
				);
			if (data.cauHoi !== undefined) {
				const soY = await tx.okrY.count({ where: { hoiYId: h.id } });
				if (soY > 0) throw new BadRequestException(T.cauHoiDaKhoa);
			}

			const moi = input.nguoiChonUserId;
			const doiNguoiChon = moi !== undefined && moi !== h.nguoiChonUserId;
			if (doiNguoiChon) {
				if (!(await this.laQuanTri(tx, moi)))
					throw new BadRequestException(T.nguoiChonPhaiQuanTri);
				const daGop = await tx.okrY.count({
					where: { hoiYId: h.id, tacGiaUserId: moi },
				});
				if (daGop > 0) throw new BadRequestException(T.nguoiChonDaGop);
				if (h.banTruoc && (await this.laQuanTri(tx, h.nguoiChonUserId)))
					throw new BadRequestException(T.daNiemPhong);
				data.nguoiChon = { connect: { id: moi } };
			}

			if (!doiNoiDung && !doiNguoiChon) return { id: h.id };
			await tx.okrHoiY.update({ where: { id: h.id }, data });
			if (doiNoiDung)
				await this.okr.vet(
					tx,
					userId,
					"sua-hoi-y",
					{ cycleId: h.cycleId },
					truoc,
					sau,
				);
			if (doiNguoiChon)
				await this.okr.vet(
					tx,
					userId,
					"doi-nguoi-chon",
					{ cycleId: h.cycleId },
					null,
					{ tu: h.nguoiChonUserId, sang: moi },
				);
			return { id: h.id };
		});
	}

	private async khoaHoiY(tx: Tx, hoiYId: string): Promise<HoiYKhoa> {
		await tx.$queryRaw`SELECT id FROM "okrHoiY" WHERE id = ${hoiYId} FOR UPDATE`;
		const h = await tx.okrHoiY.findUnique({
			where: { id: hoiYId },
			select: {
				id: true,
				hanLuc: true,
				congBoLuc: true,
				nguoiChonUserId: true,
			},
		});
		if (!h) throw new NotFoundException(T.khongCoHoiY(hoiYId));
		return h;
	}

	private async khoaTheoY(
		tx: Tx,
		yId: string,
	): Promise<{ h: HoiYKhoa; tacGiaUserId: string; now: Date }> {
		const truoc = await tx.okrY.findUnique({
			where: { id: yId },
			select: { hoiYId: true },
		});
		if (!truoc) throw new NotFoundException(T.khongCoY(yId));
		const h = await this.khoaHoiY(tx, truoc.hoiYId);
		const y = await tx.okrY.findUnique({
			where: { id: yId },
			select: { tacGiaUserId: true },
		});
		if (!y) throw new NotFoundException(T.khongCoY(yId));
		return { h, tacGiaUserId: y.tacGiaUserId, now: this.dongHo() };
	}

	private async khoaYCuaMinh(tx: Tx, userId: string, yId: string) {
		const k = await this.khoaTheoY(tx, yId);
		if (k.tacGiaUserId !== userId) throw new ForbiddenException(T.chiYCuaMinh);
		kiemDangMo(k.h, k.now);
	}

	async gopY(userId: string, input: GopYInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const h = await this.khoaHoiY(tx, input.hoiYId);
			const now = this.dongHo();
			kiemDangMo(h, now);
			if (h.nguoiChonUserId === userId)
				throw new BadRequestException(T.nguoiChonKhongGop);
			const soY = await tx.okrY.count({
				where: { hoiYId: h.id, tacGiaUserId: userId },
			});
			if (soY >= OKR_HOI_Y.yMoiNguoi) throw new BadRequestException(T.quaBaY);
			const y = await tx.okrY.create({
				data: {
					hoiYId: h.id,
					tacGiaUserId: userId,
					noiDung: input.noiDung,
					viSao: input.viSao,
					doBangGi: input.doBangGi,
					createdAt: now,
				},
				select: { id: true },
			});
			return { id: y.id };
		});
	}

	async suaY(userId: string, input: SuaYInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			await this.khoaYCuaMinh(tx, userId, input.yId);
			await tx.okrY.update({
				where: { id: input.yId },
				data: {
					noiDung: input.noiDung,
					viSao: input.viSao,
					doBangGi: input.doBangGi,
				},
			});
			return { id: input.yId };
		});
	}

	async goY(userId: string, input: YIdInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			await this.khoaYCuaMinh(tx, userId, input.yId);
			await tx.okrY.delete({ where: { id: input.yId } });
			return { id: input.yId };
		});
	}

	async dongY(userId: string, input: DongYInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const k = await this.khoaTheoY(tx, input.yId);
			kiemDangMo(k.h, k.now);
			if (k.tacGiaUserId === userId) throw new BadRequestException(T.yCuaMinh);
			if (input.bat)
				await tx.okrYDongY.createMany({
					data: [{ yId: input.yId, userId, createdAt: k.now }],
					skipDuplicates: true,
				});
			else await tx.okrYDongY.deleteMany({ where: { yId: input.yId, userId } });
			return { id: input.yId };
		});
	}

	async hoiY(userId: string, input: CycleIdInput): Promise<HoiYOutput | null> {
		const q = await this.quyenOkr.quyen(userId);
		const now = this.dongHo();
		const h = await this.db.okrHoiY.findUnique({
			where: { cycleId: input.cycleId },
			include: {
				nguoiChon: { select: { id: true, name: true } },
				banTruoc: { include: { vietBoi: { select: { name: true } } } },
				y: {
					orderBy: [{ createdAt: "asc" }, { id: "asc" }],
					include: {
						tacGia: { select: { name: true } },
						_count: { select: { dongY: true } },
						dongY: { where: { userId }, select: { userId: true } },
					},
				},
				hieu: { where: { userId }, select: { userId: true } },
			},
		});
		if (!h) return null;
		const trangThai: TrangThaiHoiY = trangThaiHoiY(h, now);
		const laNguoiChon = h.nguoiChonUserId === userId;
		const tho: YTho[] = h.y.map((y) => ({
			id: y.id,
			noiDung: y.noiDung,
			viSao: y.viSao,
			doBangGi: y.doBangGi,
			chuDeId: y.chuDeId,
			tacGiaUserId: y.tacGiaUserId,
			tacGiaTen: y.tacGia.name,
			soDongY: y._count.dongY,
			daDongY: y.dongY.length > 0,
			createdAt: y.createdAt,
		}));
		const chieu = chieuYChoNguoiXem(tho, {
			userId,
			laQuanTri: q.quanTri,
			laNguoiChon,
			daNiemPhong: h.banTruoc !== null,
			hoiYId: h.id,
			trangThai,
		});
		const banTruoc = docBanTruoc(
			h.banTruoc && {
				cau: h.banTruoc.cau,
				boQua: h.banTruoc.boQua,
				vietBoi: h.banTruoc.vietBoi.name,
			},
			{ laNguoiChon, trangThai },
		);
		const cuaToi = h.y.filter((y) => y.tacGiaUserId === userId);
		const chonDuoc = trangThai === "dang-gom" && laNguoiChon && q.quanTri;
		return {
			hoiY: {
				id: h.id,
				cauHoi: h.cauHoi,
				loiMo: h.loiMo,
				soLieu: parseSoLieuHoiY(h.soLieu),
				hanLuc: h.hanLuc.toISOString(),
				createdAt: h.createdAt.toISOString(),
				congBoLuc: h.congBoLuc?.toISOString() ?? null,
			},
			trangThai,
			nguoiChon: h.nguoiChon,
			cuaToi: {
				y: cuaToi.map((y) => ({
					id: y.id,
					noiDung: y.noiDung,
					viSao: y.viSao,
					doBangGi: y.doBangGi,
					createdAt: y.createdAt.toISOString(),
				})),
				daHieu: h.hieu.length > 0,
			},
			y: { khoa: chieu.khoa, ds: chieu.y.map(raY) },
			chuDe: null,
			banTruoc,
			ketQua: null,
			quyen: {
				moDuoc: q.quanTri && trangThai !== "da-cong-bo",
				gopDuoc:
					trangThai === "dang-mo" &&
					!laNguoiChon &&
					cuaToi.length < OKR_HOI_Y.yMoiNguoi,
				gomDuoc: trangThai === "dang-gom" && q.quanTri,
				chonDuoc,
				congBoDuoc: false,
				lyDoChuaCongBo: [],
			},
		};
	}

	async hoiYNhan(userId: string, input: CycleIdInput): Promise<HoiYNhanOutput> {
		const now = this.dongHo();
		const h = await this.db.okrHoiY.findUnique({
			where: { cycleId: input.cycleId },
			select: {
				hanLuc: true,
				congBoLuc: true,
				nguoiChonUserId: true,
				_count: {
					select: {
						y: { where: { tacGiaUserId: userId } },
						chuDe: { where: { ketLuan: null } },
					},
				},
			},
		});
		if (!h)
			return {
				coHoiY: false,
				trangThai: null,
				canGop: false,
				soChuDeChuaKetLuan: null,
			};
		const trangThai = trangThaiHoiY(h, now);
		const laNguoiChon = h.nguoiChonUserId === userId;
		return {
			coHoiY: true,
			trangThai,
			canGop: trangThai === "dang-mo" && !laNguoiChon && h._count.y === 0,
			soChuDeChuaKetLuan:
				laNguoiChon && trangThai === "dang-gom" ? h._count.chuDe : null,
		};
	}
}
