import { type Db, type Prisma, TrangThaiViec } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	type BanGhiGan,
	banGhiCua,
	CHON_VIEC,
	dichDuoc,
	dieuKienNhomHayDuAn,
	dieuKienXemViec,
	docViecCuaBanGhi,
	type HangViec,
	NHOM_VIEC,
	ngayHan,
	parseHangVet,
	TRANG_THAI_MO,
	theoHan,
	VIEC,
	vaiCua,
} from "@crm/db/viec";
import {
	boTheoDoi,
	coLichSu,
	doiDuAn,
	doiLich,
	doiNguoiThucHien,
	doiTrangThai,
	ganBanGhi,
	goBanGhi,
	LoiViec,
	suaViec,
	taoViec,
	themTheoDoi,
	xoaViec,
} from "@crm/db/viec-ghi";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	ViecBanGhiInput,
	ViecChiTietOutput,
	ViecCreateInput,
	ViecCuaBanGhiOutput,
	ViecCuaToiInput,
	ViecCuaToiNhomOutput,
	ViecDaDoiOutput,
	ViecDoiDuAnInput,
	ViecDoiLichInput,
	ViecDoiNguoiInput,
	ViecDoiTrangThaiInput,
	ViecDongOutput,
	ViecGanInput,
	ViecSuaInput,
	ViecTheoDoiInput,
	ViecVetOutput,
} from "./viec.contracts";

export function dichLoi(loi: Error): never {
	if (!(loi instanceof LoiViec)) throw loi;
	switch (loi.ma) {
		case "khong-thay":
			throw new NotFoundException(loi.message);
		case "khong-quyen":
			throw new ForbiddenException(loi.message);
		case "co-lich-su":
			throw new ConflictException(loi.message);
		case "khong-hop-le":
		case "nguoi-nhan":
		case "ban-ghi":
			throw new BadRequestException(loi.message);
	}
}

export function banGhiTu(b: {
	companyId?: string;
	contactId?: string;
	dealId?: string;
	planId?: string;
}): BanGhiGan | null {
	if (b.companyId) return { loai: "company", id: b.companyId };
	if (b.contactId) return { loai: "contact", id: b.contactId };
	if (b.dealId) return { loai: "deal", id: b.dealId };
	if (b.planId) return { loai: "plan", id: b.planId };
	return null;
}

function laQuaHan(h: HangViec, now: Date): boolean {
	return (
		h.hanNgay !== null &&
		TRANG_THAI_MO.includes(h.trangThai) &&
		h.hanNgay < dauNgayVN(now)
	);
}

export function viecRa(h: HangViec, now: Date): ViecDongOutput {
	return {
		id: h.id,
		tieuDe: h.tieuDe,
		trangThai: h.trangThai,
		hanNgay: h.hanNgay ? ngayHan(h.hanNgay) : null,
		batDauNgay: h.batDauNgay ? ngayHan(h.batDauNgay) : null,
		duAn: h.duAn,
		quaHan: laQuaHan(h, now),
		nguoiGiao: h.nguoiGiao,
		nguoiThucHien: h.nguoiThucHien,
		banGhi: h.gan.map(banGhiCua),
	};
}

function chiaKhep(ds: HangViec[], now: Date): ViecCuaBanGhiOutput {
	const sap = [...ds].sort(theoHan);
	return {
		mo: sap
			.filter((v) => TRANG_THAI_MO.includes(v.trangThai))
			.map((v) => viecRa(v, now)),
		daXong: sap
			.filter((v) => v.trangThai === TrangThaiViec.XONG)
			.map((v) => viecRa(v, now)),
		daHuy: sap
			.filter((v) => v.trangThai === TrangThaiViec.HUY)
			.map((v) => viecRa(v, now)),
	};
}

@Injectable()
export class ViecService {
	private readonly logger = new Logger(ViecService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	private ghi<T>(lam: (tx: DbGhi) => Promise<T>): Promise<T> {
		return this.db.$transaction((tx) => lam(tx)).catch(dichLoi);
	}

	private async docThay(id: string, userId: string): Promise<HangViec> {
		const h = await this.db.viec.findFirst({
			where: { AND: [{ id }, dieuKienXemViec(userId)] },
			select: CHON_VIEC,
		});
		if (h === null) throw new NotFoundException(VIEC.thongDiep.khongCoViec(id));
		return h;
	}

	async get(id: string, userId: string): Promise<ViecChiTietOutput> {
		const h = await this.docThay(id, userId);
		const [daCoLichSu, phaiCho] = await Promise.all([
			coLichSu(this.db, h.id),
			this.db.viecPhuThuoc.findMany({
				where: { sauId: h.id },
				select: {
					truoc: {
						select: { id: true, tieuDe: true, batDauNgay: true, hanNgay: true },
					},
				},
				orderBy: { taoLuc: "asc" },
			}),
		]);
		const vai = vaiCua(h, userId);
		return {
			...viecRa(h, new Date()),
			moTa: h.moTa,
			nguoiTheoDoi: h.theoDoi.map((t) => t.user),
			phaiCho: phaiCho.map((p) => ({
				id: p.truoc.id,
				tieuDe: p.truoc.tieuDe,
				batDauNgay: p.truoc.batDauNgay ? ngayHan(p.truoc.batDauNgay) : null,
				hanNgay: p.truoc.hanNgay ? ngayHan(p.truoc.hanNgay) : null,
			})),
			coLichSu: daCoLichSu,
			quyen: {
				trangThai: dichDuoc(h.trangThai, vai),
				sua: vai.giao || vai.thucHien,
				doiNguoi: vai.giao,
				gan: vai.giao || vai.thucHien,
				theoDoiKhac: vai.giao || vai.thucHien,
				dangTheoDoi: vai.theoDoi,
				xoa: vai.giao && !daCoLichSu,
			},
		};
	}

	async lichSu(id: string, userId: string): Promise<ViecVetOutput> {
		await this.docThay(id, userId);
		const hang = await this.db.viecVet.findMany({
			where: { viecId: id },
			orderBy: [{ luc: "desc" }, { id: "desc" }],
			select: {
				id: true,
				luc: true,
				nguon: true,
				loai: true,
				truoc: true,
				sau: true,
				nguoi: { select: { id: true, name: true } },
			},
		});
		return hang.map((h) => {
			const { nguon, vet } = parseHangVet(h);
			return {
				id: h.id,
				luc: h.luc.toISOString(),
				nguon,
				loai: vet.loai,
				nguoi: h.nguoi,
				vet,
			};
		});
	}

	async cuaBanGhi(
		input: ViecBanGhiInput,
		userId: string,
	): Promise<ViecCuaBanGhiOutput> {
		const b = banGhiTu(input);
		if (b === null) throw new BadRequestException(VIEC.thongDiep.dungMotBanGhi);
		return chiaKhep(await docViecCuaBanGhi(this.db, b, userId), new Date());
	}

	async cuaToi(
		input: ViecCuaToiInput,
		userId: string,
	): Promise<ViecCuaToiNhomOutput> {
		const now = new Date();
		const loc = (
			nhom: ViecCuaToiInput["nhom"],
			trangThai: Prisma.ViecWhereInput,
		) => ({
			AND: [
				dieuKienNhomHayDuAn(nhom, userId, input.duAnId),
				dieuKienXemViec(userId),
				trangThai,
			],
		});
		const doc = (
			trangThai: Prisma.ViecWhereInput,
			orderBy: Prisma.ViecOrderByWithRelationInput[],
			take?: number,
		) =>
			this.db.viec.findMany({
				where: loc(input.nhom, trangThai),
				orderBy,
				take,
				select: CHON_VIEC,
			});
		const theoKhep: Prisma.ViecOrderByWithRelationInput[] = [
			{ khepLuc: { sort: "desc", nulls: "last" } },
			{ id: "asc" },
		];
		const moDem = { trangThai: { in: [...TRANG_THAI_MO] } };
		const [mo, daXong, daHuy, soXong, soHuy, dem] = await Promise.all([
			doc(moDem, [
				{ hanNgay: { sort: "asc", nulls: "last" } },
				{ taoLuc: "asc" },
				{ id: "asc" },
			]),
			doc({ trangThai: TrangThaiViec.XONG }, theoKhep, VIEC.tranKhep),
			doc({ trangThai: TrangThaiViec.HUY }, theoKhep, VIEC.tranKhep),
			this.db.viec.count({
				where: loc(input.nhom, { trangThai: TrangThaiViec.XONG }),
			}),
			this.db.viec.count({
				where: loc(input.nhom, { trangThai: TrangThaiViec.HUY }),
			}),
			Promise.all(
				NHOM_VIEC.map((nhom) =>
					this.db.viec.count({ where: loc(nhom, moDem) }),
				),
			),
		]);
		return {
			mo: mo.map((v) => viecRa(v, now)),
			daXong: daXong.map((v) => viecRa(v, now)),
			daHuy: daHuy.map((v) => viecRa(v, now)),
			soXong,
			soHuy,
			demNhom: {
				"giao-cho-toi": dem[0] ?? 0,
				"toi-giao": dem[1] ?? 0,
				"dang-theo-doi": dem[2] ?? 0,
			},
		};
	}

	create(input: ViecCreateInput, userId: string): Promise<{ id: string }> {
		const b = banGhiTu(input);
		return this.ghi((tx) =>
			taoViec(tx, {
				nguoiId: userId,
				tieuDe: input.tieuDe,
				moTa: input.moTa ?? null,
				hanNgay: input.hanNgay ?? null,
				batDauNgay: input.batDauNgay ?? null,
				nguoiThucHienId: input.nguoiThucHienId,
				nguoiTheoDoiIds: input.nguoiTheoDoiIds,
				gan: b ? [b] : [],
				duAnId: input.duAnId ?? null,
				nguon: "web",
				now: new Date(),
			}),
		);
	}

	doiLich(input: ViecDoiLichInput, userId: string): Promise<ViecDaDoiOutput> {
		return this.ghi((tx) =>
			doiLich(tx, {
				viecId: input.id,
				nguoiId: userId,
				batDauNgay: input.batDauNgay,
				hanNgay: input.hanNgay,
				nguon: "gantt",
				now: new Date(),
			}),
		);
	}

	async doiDuAn(
		input: ViecDoiDuAnInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			doiDuAn(tx, {
				viecId: input.id,
				nguoiId: userId,
				duAnId: input.duAnId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async doiTrangThai(
		input: ViecDoiTrangThaiInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			doiTrangThai(tx, {
				viecId: input.id,
				nguoiId: userId,
				den: input.den,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async sua(input: ViecSuaInput, userId: string): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			suaViec(tx, {
				viecId: input.id,
				nguoiId: userId,
				tieuDe: input.tieuDe,
				moTa: input.moTa,
				hanNgay: input.hanNgay,
				batDauNgay: input.batDauNgay,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async doiNguoiThucHien(
		input: ViecDoiNguoiInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			doiNguoiThucHien(tx, {
				viecId: input.id,
				nguoiId: userId,
				nguoiThucHienId: input.nguoiThucHienId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async gan(input: ViecGanInput, userId: string): Promise<ViecChiTietOutput> {
		const b = banGhiTu(input);
		if (b === null) throw new BadRequestException(VIEC.thongDiep.dungMotBanGhi);
		await this.ghi((tx) =>
			ganBanGhi(tx, {
				viecId: input.id,
				nguoiId: userId,
				banGhi: b,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async go(input: ViecGanInput, userId: string): Promise<ViecChiTietOutput> {
		const b = banGhiTu(input);
		if (b === null) throw new BadRequestException(VIEC.thongDiep.dungMotBanGhi);
		await this.ghi((tx) =>
			goBanGhi(tx, {
				viecId: input.id,
				nguoiId: userId,
				banGhi: b,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async theoDoi(
		input: ViecTheoDoiInput,
		userId: string,
	): Promise<ViecChiTietOutput> {
		await this.ghi((tx) =>
			themTheoDoi(tx, {
				viecId: input.id,
				nguoiId: userId,
				userId: input.userId ?? userId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return this.get(input.id, userId);
	}

	async boTheoDoi(
		input: ViecTheoDoiInput,
		userId: string,
	): Promise<{ id: string }> {
		await this.ghi((tx) =>
			boTheoDoi(tx, {
				viecId: input.id,
				nguoiId: userId,
				userId: input.userId ?? userId,
				nguon: "web",
				now: new Date(),
			}),
		);
		return { id: input.id };
	}

	async xoa(id: string, userId: string): Promise<{ id: string }> {
		const ket = await this.ghi((tx) =>
			xoaViec(tx, { viecId: id, nguoiId: userId }),
		);
		this.logger.log({ message: "viec.xoa", viecId: ket.id, userId });
		return ket;
	}
}
