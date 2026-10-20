import { isWorkspaceAdmin, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { readTenGoc } from "@crm/db/workspace";
import { PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
import {
	type ChuDeIdInput,
	type CycleIdInput,
	type DongYInput,
	type GanYInput,
	type GopYInput,
	type HoiYIdInput,
	KET_LUAN_CHON,
	type KetLuanInput,
	ketLuanChuDe,
	type LoaiChuDe,
	loaiChuDe,
	type MoHoiYInput,
	type NiemPhongInput,
	type NoiBanTruoc,
	noiBanTruoc,
	OKR_HOI_Y,
	parseSoLieuHoiY,
	type SuaChuDeInput,
	type SuaHoiYInput,
	type SuaYInput,
	soCauCuaNoi,
	type TaoChuDeInput,
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
	bangDoPhu,
	type ChuDeTho,
	chieuChuDeChoNguoiXem,
	chieuYChoNguoiXem,
	chieuYCuaToi,
	docBanTruoc,
	donViTuCay,
	ketQuaCongBo,
	lyDoChuaCongBo,
	type MaThieu,
	nguoiTinhDoPhu,
	type TinhTrangCongBo,
	tenYLa,
	tinhTrangCongBo,
	type YChieu,
	type YTho,
} from "./hoi-y";
import { donViCua, OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import type {
	CongBoOutput,
	HieuViSaoOutput,
	HoiYDoPhuOutput,
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
	cycleId: string;
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

const ketLuanHoacNull = ketLuanChuDe.nullable();
const noiHoacNull = noiBanTruoc.nullable();

function kiemNoiBanTruoc(
	ban: { cau: string[]; boQua: boolean },
	noi: NoiBanTruoc,
): void {
	const soCau = soCauCuaNoi(noi);
	if (soCau === null) return;
	if (ban.boQua) throw new BadRequestException(T.noiBanTruocBoQua);
	if (soCau > ban.cau.length)
		throw new BadRequestException(T.noiBanTruocKhongCo(ban.cau.length));
}

function cauLyDo(ma: MaThieu, tt: TinhTrangCongBo): string {
	return ma === "vuot-tran"
		? T.congBoVuotTran(tt.objectiveCap, tt.tongOneHubSau)
		: T.congBoThieu[ma];
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

	private kiemKyChuaAn(tx: Tx, cycleId: string): Promise<void> {
		return this.okr.assertKyChuaAn(tx, cycleId);
	}

	async moHoiY(userId: string, input: MoHoiYInput): Promise<HoiYGhiOutput> {
		await this.assertQuanTri(userId);
		const hanLuc = new Date(input.hanLuc);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.cycleId} FOR UPDATE`;
			await this.kiemKyChuaAn(tx, input.cycleId);
			const now = this.dongHo();
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
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrHoiY" WHERE id = ${input.hoiYId} FOR UPDATE`;
			const now = this.dongHo();
			const h = await tx.okrHoiY.findUnique({
				where: { id: input.hoiYId },
				include: { banTruoc: { select: { id: true } } },
			});
			if (!h) throw new NotFoundException(T.khongCoHoiY(input.hoiYId));
			await this.kiemKyChuaAn(tx, h.cycleId);
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
			const han = input.dongNgay
				? now
				: input.hanLuc === undefined
					? null
					: new Date(input.hanLuc);
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
				cycleId: true,
				hanLuc: true,
				congBoLuc: true,
				nguoiChonUserId: true,
			},
		});
		if (!h) throw new NotFoundException(T.khongCoHoiY(hoiYId));
		await this.kiemKyChuaAn(tx, h.cycleId);
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
			if (k.h.nguoiChonUserId === userId)
				throw new BadRequestException(T.nguoiChonKhongDongY);
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

	async niemPhong(
		userId: string,
		input: NiemPhongInput,
	): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const h = await this.khoaHoiY(tx, input.hoiYId);
			const now = this.dongHo();
			if (h.nguoiChonUserId !== userId)
				throw new ForbiddenException(T.chiNguoiChon);
			if (!(await this.laQuanTri(tx, userId)))
				throw new ForbiddenException(T.nguoiChonPhaiQuanTri);
			if (trangThaiHoiY(h, now) === "da-cong-bo")
				throw new BadRequestException(T.daCongBo);
			const daCo = await tx.okrHoiYBanTruoc.findUnique({
				where: { hoiYId: h.id },
				select: { id: true },
			});
			if (daCo) throw new BadRequestException(T.daCoBanTruoc);
			const boQua = input.boQua === true;
			const cau = input.cau ?? [];
			const ban = await tx.okrHoiYBanTruoc.create({
				data: {
					hoiYId: h.id,
					cau,
					boQua,
					vietBoiUserId: userId,
					niemPhongLuc: now,
				},
				select: { id: true },
			});
			await this.okr.vet(
				tx,
				userId,
				"niem-phong",
				{ cycleId: h.cycleId },
				null,
				{ soCau: cau.length, boQua },
			);
			return { id: ban.id };
		});
	}

	private async kiemGom(
		tx: Tx,
		h: HoiYKhoa,
		userId: string,
		cach: "gom" | "ket-luan" | "cong-bo",
	): Promise<{ now: Date; ban: { cau: string[]; boQua: boolean } | null }> {
		const laNguoiChon = h.nguoiChonUserId === userId;
		const quanTri = await this.laQuanTri(tx, userId);
		if (laNguoiChon && !quanTri)
			throw new ForbiddenException(T.nguoiChonPhaiQuanTri);
		if (cach !== "gom" && !laNguoiChon)
			throw new ForbiddenException(T.chiNguoiChon);
		if (!laNguoiChon && !quanTri) throw new ForbiddenException(T.chiGom);
		const now = this.dongHo();
		const trangThai = trangThaiHoiY(h, now);
		if (trangThai === "da-cong-bo") throw new BadRequestException(T.daCongBo);
		if (trangThai === "dang-mo")
			throw new BadRequestException(
				cach === "cong-bo" ? T.congBoChuaHetHan : T.chuaHetHan,
			);
		const ban = await tx.okrHoiYBanTruoc.findUnique({
			where: { hoiYId: h.id },
			select: { cau: true, boQua: true },
		});
		if (laNguoiChon && !ban && cach !== "cong-bo")
			throw new BadRequestException(T.nguoiChonChuaNiemPhong);
		return { now, ban };
	}

	private async khoaTheoChuDe(
		tx: Tx,
		chuDeId: string,
	): Promise<{ h: HoiYKhoa; loai: LoaiChuDe }> {
		const truoc = await tx.okrChuDe.findUnique({
			where: { id: chuDeId },
			select: { hoiYId: true },
		});
		if (!truoc) throw new NotFoundException(T.khongCoChuDe(chuDeId));
		const h = await this.khoaHoiY(tx, truoc.hoiYId);
		const c = await tx.okrChuDe.findUnique({
			where: { id: chuDeId },
			select: { loai: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuDe(chuDeId));
		return { h, loai: loaiChuDe.parse(c.loai) };
	}

	private async chuDeMoi(
		tx: Tx,
		hoiYId: string,
		loai: LoaiChuDe,
		ten: string,
		now: Date,
	): Promise<string> {
		const { _max } = await tx.okrChuDe.aggregate({
			where: { hoiYId },
			_max: { viTri: true },
		});
		const c = await tx.okrChuDe.create({
			data: {
				hoiYId,
				loai,
				ten,
				viTri: _max.viTri === null ? 0 : _max.viTri + 1,
				createdAt: now,
			},
			select: { id: true },
		});
		return c.id;
	}

	async taoChuDe(userId: string, input: TaoChuDeInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const h = await this.khoaHoiY(tx, input.hoiYId);
			const { now } = await this.kiemGom(tx, h, userId, "gom");
			return {
				id: await this.chuDeMoi(tx, h.id, "chu-de", input.ten, now),
			};
		});
	}

	async suaChuDe(userId: string, input: SuaChuDeInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const { h, loai } = await this.khoaTheoChuDe(tx, input.chuDeId);
			await this.kiemGom(tx, h, userId, "gom");
			if (loai === "y-la") throw new BadRequestException(T.yLaKhongDoiTen);
			await tx.okrChuDe.update({
				where: { id: input.chuDeId },
				data: { ten: input.ten },
			});
			return { id: input.chuDeId };
		});
	}

	async goChuDe(userId: string, input: ChuDeIdInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const { h } = await this.khoaTheoChuDe(tx, input.chuDeId);
			await this.kiemGom(tx, h, userId, "gom");
			const conY = await tx.okrY.count({ where: { chuDeId: input.chuDeId } });
			if (conY > 0) throw new BadRequestException(T.chuDeConY);
			await tx.okrChuDe.delete({ where: { id: input.chuDeId } });
			return { id: input.chuDeId };
		});
	}

	private async hoiYCuaGan(
		tx: Tx,
		input: GanYInput,
		yIds: string[],
	): Promise<string> {
		if (input.chuDeId !== undefined) {
			const c = await tx.okrChuDe.findUnique({
				where: { id: input.chuDeId },
				select: { hoiYId: true },
			});
			if (!c) throw new NotFoundException(T.khongCoChuDe(input.chuDeId));
			return c.hoiYId;
		}
		const dau = yIds[0] ?? "";
		const y = await tx.okrY.findUnique({
			where: { id: dau },
			select: { hoiYId: true },
		});
		if (!y) throw new NotFoundException(T.khongCoY(dau));
		return y.hoiYId;
	}

	async ganY(userId: string, input: GanYInput): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const yIds = [...new Set(input.yIds)];
			const h = await this.khoaHoiY(tx, await this.hoiYCuaGan(tx, input, yIds));
			const { now } = await this.kiemGom(tx, h, userId, "gom");
			const y = await tx.okrY.findMany({
				where: { id: { in: yIds } },
				select: { id: true, hoiYId: true, chuDeId: true, noiDung: true },
			});
			const thieu = yIds.find((id) => !y.some((x) => x.id === id));
			if (thieu !== undefined) throw new NotFoundException(T.khongCoY(thieu));
			if (y.some((x) => x.hoiYId !== h.id))
				throw new BadRequestException(T.yKhacHoiY);

			let dich: string;
			if (input.chuDeId !== undefined) {
				const c = await tx.okrChuDe.findUnique({
					where: { id: input.chuDeId },
					select: { id: true, loai: true },
				});
				if (!c) throw new NotFoundException(T.khongCoChuDe(input.chuDeId));
				if (loaiChuDe.parse(c.loai) === "y-la")
					throw new BadRequestException(T.chuDeYLa);
				dich = c.id;
			} else {
				const motY = y[0];
				if (!motY) throw new NotFoundException(T.khongCoY(""));
				const hienTai =
					motY.chuDeId === null
						? null
						: await tx.okrChuDe.findUnique({
								where: { id: motY.chuDeId },
								select: { id: true, loai: true },
							});
				if (hienTai && loaiChuDe.parse(hienTai.loai) === "y-la")
					return { id: hienTai.id };
				dich = await this.chuDeMoi(tx, h.id, "y-la", tenYLa(motY.noiDung), now);
			}
			const doi = y.filter((x) => x.chuDeId !== dich).map((x) => x.id);
			if (doi.length > 0) {
				await tx.okrY.updateMany({
					where: { id: { in: doi } },
					data: { chuDeId: dich, ganLuc: now },
				});
				const cu = [
					...new Set(
						y.flatMap((x) =>
							x.chuDeId !== null && x.chuDeId !== dich ? [x.chuDeId] : [],
						),
					),
				];
				await tx.okrChuDe.deleteMany({
					where: { id: { in: cu }, loai: "y-la", y: { none: {} } },
				});
			}
			return { id: dich };
		});
	}

	async ketLuanChuDe(
		userId: string,
		input: KetLuanInput,
	): Promise<HoiYGhiOutput> {
		return this.db.$transaction(async (tx) => {
			const { h } = await this.khoaTheoChuDe(tx, input.chuDeId);
			const { ban } = await this.kiemGom(tx, h, userId, "ket-luan");
			const chon = input.ketLuan === KET_LUAN_CHON;
			if (chon && ban && input.noiBanTruoc !== null)
				kiemNoiBanTruoc(ban, input.noiBanTruoc);
			await tx.okrChuDe.update({
				where: { id: input.chuDeId },
				data: {
					ketLuan: input.ketLuan,
					lyDo: input.lyDo,
					cauMucTieu: chon ? input.cauMucTieu : "",
					noiBanTruoc: chon ? input.noiBanTruoc : null,
				},
			});
			return { id: input.chuDeId };
		});
	}

	private async tinhTrangCongBo(
		tx: Tx | Db,
		h: { id: string; cycleId: string },
	): Promise<TinhTrangCongBo> {
		const ban = await tx.okrHoiYBanTruoc.findUnique({
			where: { hoiYId: h.id },
			select: { boQua: true },
		});
		const yChuaGom = await tx.okrY.count({
			where: { hoiYId: h.id, chuDeId: null },
		});
		const chuDe = await tx.okrChuDe.findMany({
			where: { hoiYId: h.id },
			orderBy: [{ viTri: "asc" }, { id: "asc" }],
			select: {
				id: true,
				loai: true,
				ten: true,
				ketLuan: true,
				lyDo: true,
				cauMucTieu: true,
				noiBanTruoc: true,
				_count: { select: { y: true } },
			},
		});
		const ct = await this.okr.program(tx);
		const soMucTieuHienCo = await tx.okrObjective.count({
			where: {
				cycleId: h.cycleId,
				...donViCua({ level: "onehub" }),
				status: { not: "da-bo" },
			},
		});
		return tinhTrangCongBo({
			ban,
			yChuaGom,
			chuDe: chuDe.map((c) => ({
				id: c.id,
				loai: loaiChuDe.parse(c.loai),
				ten: c.ten,
				soY: c._count.y,
				ketLuan: c.ketLuan,
				lyDo: c.lyDo,
				cauMucTieu: c.cauMucTieu,
				noiBanTruoc: c.noiBanTruoc,
			})),
			soMucTieuHienCo,
			objectiveCap: ct.objectiveCap,
			capMode: ct.capMode,
		});
	}

	async congBo(userId: string, input: HoiYIdInput): Promise<CongBoOutput> {
		return this.db.$transaction(async (tx) => {
			const h = await this.khoaHoiY(tx, input.hoiYId);
			const { now } = await this.kiemGom(tx, h, userId, "cong-bo");
			const ky = await tx.okrCycle.findUnique({
				where: { id: h.cycleId },
				select: { phase: true },
			});
			if (!ky || phaChuKy.parse(ky.phase) !== "lap-ke-hoach")
				throw new BadRequestException(T.congBoKyKhongLapKeHoach);
			const tinhTrang = await this.tinhTrangCongBo(tx, h);
			const [dau] = lyDoChuaCongBo(tinhTrang);
			if (dau) throw new BadRequestException(cauLyDo(dau.ma, tinhTrang));
			const chon = await tx.okrChuDe.findMany({
				where: { hoiYId: h.id, ketLuan: KET_LUAN_CHON },
				orderBy: [{ viTri: "asc" }, { id: "asc" }],
				select: { id: true, cauMucTieu: true, lyDo: true },
			});
			const mucTieuIds: string[] = [];
			let canhBao: string | null = null;
			for (const c of chon) {
				const mt = await this.okr.taoMucTieuTrongTx(
					tx,
					userId,
					{
						cycleId: h.cycleId,
						unit: { level: "onehub" },
						ownerUserId: h.nguoiChonUserId,
						kind: "cam-ket",
						title: c.cauMucTieu,
						whyNow: c.lyDo,
						participantIds: [],
						hienThi: "cong-khai",
					},
					{ tuHoiY: h.id },
				);
				await tx.okrChuDe.update({
					where: { id: c.id },
					data: { objectiveId: mt.id },
				});
				mucTieuIds.push(mt.id);
				canhBao = mt.canhBao ?? canhBao;
			}
			await tx.okrHoiY.update({
				where: { id: h.id },
				data: { congBoLuc: now },
			});
			await this.okr.vet(
				tx,
				userId,
				"cong-bo-hoi-y",
				{ cycleId: h.cycleId },
				null,
				{ hoiYId: h.id, soMucTieu: mucTieuIds.length },
			);
			return { mucTieuIds, canhBao };
		});
	}

	async hieuViSao(
		userId: string,
		input: HoiYIdInput,
	): Promise<HieuViSaoOutput> {
		return this.db.$transaction(async (tx) => {
			const h = await this.khoaHoiY(tx, input.hoiYId);
			const now = this.dongHo();
			if (trangThaiHoiY(h, now) !== "da-cong-bo")
				throw new BadRequestException(T.chuaCongBo);
			const soY = await tx.okrY.count({
				where: { hoiYId: h.id, tacGiaUserId: userId },
			});
			if (soY === 0) throw new BadRequestException(T.chuaGop);
			await tx.okrHoiYHieu.createMany({
				data: [{ hoiYId: h.id, userId, luc: now }],
				skipDuplicates: true,
			});
			return { ok: true };
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
				chuDe: true,
				cycle: { select: { phase: true } },
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
			phongBanId: q.phongBanChinh.get(y.tacGiaUserId) ?? null,
			soDongY: y._count.dongY,
			daDongY: y.dongY.length > 0,
			createdAt: y.createdAt,
		}));
		const daNiemPhong = h.banTruoc !== null;
		const xem = {
			userId,
			laQuanTri: q.quanTri,
			laNguoiChon,
			daNiemPhong,
			hoiYId: h.id,
			trangThai,
		};
		const chieu = chieuYChoNguoiXem(tho, xem);
		const chuDeTho: ChuDeTho[] = h.chuDe.map((c) => ({
			id: c.id,
			loai: loaiChuDe.parse(c.loai),
			ten: c.ten,
			ketLuan: ketLuanHoacNull.parse(c.ketLuan),
			lyDo: c.lyDo,
			cauMucTieu: c.cauMucTieu,
			noiBanTruoc: noiHoacNull.parse(c.noiBanTruoc),
			objectiveId: c.objectiveId,
			viTri: c.viTri,
		}));
		const chuDe = chieuChuDeChoNguoiXem(chuDeTho, tho, xem);
		const banTho = h.banTruoc && {
			cau: h.banTruoc.cau,
			boQua: h.banTruoc.boQua,
			vietBoi: h.banTruoc.vietBoi.name,
		};
		const banTruoc = docBanTruoc(banTho, { laNguoiChon, trangThai });
		const cuaToi = h.y.filter((y) => y.tacGiaUserId === userId);
		const duocGom = !laNguoiChon || daNiemPhong;
		const nguoiChonHieuLuc = laNguoiChon && q.quanTri;
		const chonDuoc =
			trangThai === "dang-gom" && nguoiChonHieuLuc && daNiemPhong;
		const dieuThieu =
			trangThai === "dang-gom" && nguoiChonHieuLuc
				? lyDoChuaCongBo(await this.tinhTrangCongBo(this.db, h)).filter(
						(d) => daNiemPhong || d.chuDeId === null,
					)
				: [];
		const congBoDuoc =
			trangThai === "dang-gom" &&
			nguoiChonHieuLuc &&
			phaChuKy.parse(h.cycle.phase) === "lap-ke-hoach" &&
			dieuThieu.length === 0;
		const nguoiChonKhoa =
			q.quanTri &&
			daNiemPhong &&
			trangThai !== "da-cong-bo" &&
			(laNguoiChon || (await this.laQuanTri(this.db, h.nguoiChonUserId)));
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
				y: chieuYCuaToi(cuaToi, chuDeTho, {
					trangThai,
					congBoLuc: h.congBoLuc,
				}),
				daHieu: h.hieu.length > 0,
			},
			y: {
				khoa: chieu.khoa,
				lyDoKhoa: chieu.khoa
					? q.quanTri
						? "chua-niem-phong"
						: "het-quyen-chon"
					: null,
				ds: chieu.y.map(raY),
			},
			chuDe: chuDe?.map((c) => ({ ...c, y: c.y.map(raY) })) ?? null,
			banTruoc,
			ketQua: ketQuaCongBo(banTruoc, chuDeTho, trangThai),
			quyen: {
				moDuoc: q.quanTri && trangThai !== "da-cong-bo",
				gopDuoc:
					trangThai === "dang-mo" &&
					!laNguoiChon &&
					cuaToi.length < OKR_HOI_Y.yMoiNguoi,
				gomDuoc: trangThai === "dang-gom" && q.quanTri && duocGom,
				chonDuoc,
				congBoDuoc,
				niemPhongDuoc:
					nguoiChonHieuLuc && !daNiemPhong && trangThai !== "da-cong-bo",
				dongYDuoc: trangThai === "dang-mo" && !laNguoiChon,
				cauHoiKhoa: h.y.length > 0,
				nguoiChonKhoa,
				lyDoChuaCongBo: dieuThieu,
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
		const demChuDe =
			laNguoiChon &&
			trangThai === "dang-gom" &&
			isWorkspaceAdmin(await workspaceRoleOf(userId, this.db));
		return {
			coHoiY: true,
			trangThai,
			canGop: trangThai === "dang-mo" && !laNguoiChon && h._count.y === 0,
			soChuDeChuaKetLuan: demChuDe ? h._count.chuDe : null,
		};
	}

	async hoiYDoPhu(
		userId: string,
		input: HoiYIdInput,
	): Promise<HoiYDoPhuOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const now = this.dongHo();
		const [h, gop] = await Promise.all([
			this.db.okrHoiY.findUnique({
				where: { id: input.hoiYId },
				select: { createdAt: true, hanLuc: true, nguoiChonUserId: true },
			}),
			this.db.okrY.groupBy({
				by: ["tacGiaUserId"],
				where: { hoiYId: input.hoiYId },
				_min: { createdAt: true },
			}),
		]);
		if (!h) throw new NotFoundException(T.khongCoHoiY(input.hoiYId));
		return bangDoPhu({
			tu: h.createdAt,
			den: h.hanLuc.getTime() < now.getTime() ? h.hanLuc : now,
			donVi: donViTuCay(q.cay, await readTenGoc(this.db)),
			nguoi: nguoiTinhDoPhu(q.cay.people, h.nguoiChonUserId),
			gop: gop.flatMap((g) =>
				g._min.createdAt === null
					? []
					: [{ tacGiaUserId: g.tacGiaUserId, luc: g._min.createdAt }],
			),
		});
	}
}
