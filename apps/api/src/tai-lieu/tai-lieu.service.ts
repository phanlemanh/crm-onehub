import { WORKSPACE_ID } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import {
	chuanNfc,
	coChuHaySo,
	LOAI_TRANG,
	type LoaiTrang,
	type SuKienChiTiet,
	sinhSlug,
	TAI_LIEU,
} from "@crm/validation/tai-lieu";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { dieuKienThay, dieuKienThayDeXuat, type NguoiGoi } from "./quyen";
import type {
	TaiLieuCreateInput,
	TaiLieuGetOutput,
	TaiLieuListInput,
	TaiLieuListOutput,
	TaiLieuProposeInput,
} from "./tai-lieu.contracts";
import { TAI_LIEU_API } from "./tai-lieu-config";

const T = TAI_LIEU_API.thongDiep;

type Tx = Prisma.TransactionClient;

const NGUOI = { select: { id: true, name: true } } as const;
const DON_VI = { select: { id: true, name: true } } as const;

export function kiemTen(ten: string): string {
	const sach = chuanNfc(ten).trim();
	if (sach.length < TAI_LIEU.ten.min) throw new BadRequestException(T.tenTrong);
	if (sach.length > TAI_LIEU.ten.max)
		throw new BadRequestException(T.tenDai(TAI_LIEU.ten.max));
	if (!coChuHaySo(sach)) throw new BadRequestException(T.tenKhongChu);
	return sach;
}

export function kiemNoiDung(noiDung: string): string {
	const sach = chuanHoa(noiDung);
	if (sach.length > TAI_LIEU.noiDung.max)
		throw new BadRequestException(T.noiDungDai(TAI_LIEU.noiDung.max));
	return sach;
}

function khongCo(): NotFoundException {
	return new NotFoundException(T.khongCo);
}

export async function ghiSuKien(
	tx: Tx,
	trangId: string,
	aiId: string,
	chiTiet: SuKienChiTiet,
): Promise<void> {
	await tx.taiLieuSuKien.create({
		data: { trangId, aiId, loai: chiTiet.loai, chiTiet },
	});
}

@Injectable()
export class TaiLieuService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	private coBanCho(nguoi: NguoiGoi): Prisma.TaiLieuDeXuatWhereInput {
		return { trangThai: "CHO_DUYET", ...dieuKienThayDeXuat(nguoi) };
	}

	async list(
		nguoi: NguoiGoi,
		input: TaiLieuListInput,
	): Promise<TaiLieuListOutput> {
		const thay = dieuKienThay(nguoi);
		const where: Prisma.TaiLieuTrangWhereInput = input.loai
			? { AND: [thay, { loai: input.loai }] }
			: thay;
		const coTrang = TAI_LIEU.danhSach.coTrang;
		const [trang, total, nhom] = await Promise.all([
			this.db.taiLieuTrang.findMany({
				where,
				orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
				skip: (input.page - 1) * coTrang,
				take: coTrang,
				select: {
					slug: true,
					ten: true,
					loai: true,
					createdAt: true,
					chuTrang: NGUOI,
					department: DON_VI,
					banDangDung: { select: { duyetLuc: true } },
					_count: { select: { deXuat: { where: this.coBanCho(nguoi) } } },
				},
			}),
			this.db.taiLieuTrang.count({ where }),
			this.db.taiLieuTrang.groupBy({
				by: ["loai"],
				where: thay,
				_count: { _all: true },
			}),
		]);
		const facetCounts = Object.fromEntries(
			LOAI_TRANG.map((l) => [l, 0]),
		) as Record<LoaiTrang, number>;
		for (const n of nhom) {
			if ((LOAI_TRANG as readonly string[]).includes(n.loai))
				facetCounts[n.loai as LoaiTrang] = n._count._all;
		}
		return {
			rows: trang.map((t) => ({
				slug: t.slug,
				ten: t.ten,
				loai: t.loai as LoaiTrang,
				chuTrang: t.chuTrang,
				donVi: t.department,
				capNhat: (t.banDangDung?.duyetLuc ?? t.createdAt).toISOString(),
				coBanCho: t._count.deXuat > 0,
			})),
			total,
			facetCounts,
		};
	}

	async get(nguoi: NguoiGoi, slug: string): Promise<TaiLieuGetOutput> {
		const t = await this.db.taiLieuTrang.findFirst({
			where: { AND: [{ slug }, dieuKienThay(nguoi)] },
			select: {
				slug: true,
				ten: true,
				loai: true,
				chuTrang: NGUOI,
				department: DON_VI,
				banDangDung: {
					select: { so: true, duyetLuc: true, noiDung: true },
				},
				_count: { select: { deXuat: { where: this.coBanCho(nguoi) } } },
			},
		});
		if (!t) throw khongCo();
		const ban = t.banDangDung;
		return {
			slug: t.slug,
			ten: t.ten,
			loai: t.loai as LoaiTrang,
			chuTrang: t.chuTrang,
			donVi: t.department,
			phienBan: ban
				? { so: ban.so, duyetLuc: ban.duyetLuc.toISOString() }
				: null,
			noiDung: ban?.noiDung ?? null,
			coBanCho: t._count.deXuat > 0,
			choLanDau: ban ? null : { chuTrang: t.chuTrang },
			suaDuoc: true,
		};
	}

	private async kiemChuTrang(userId: string): Promise<void> {
		const la = await this.db.member.findFirst({
			where: { organizationId: WORKSPACE_ID, userId },
			select: { id: true },
		});
		if (!la) throw new BadRequestException(T.chuTrangKhongCo);
	}

	private async kiemDonVi(departmentId: string): Promise<void> {
		const co = await this.db.department.findFirst({
			where: { id: departmentId, archivedAt: null },
			select: { id: true },
		});
		if (!co) throw new BadRequestException(T.donViKhongCo);
	}

	async create(
		nguoi: NguoiGoi,
		input: TaiLieuCreateInput,
	): Promise<{ slug: string }> {
		const ten = kiemTen(input.ten);
		const noiDung = kiemNoiDung(input.noiDung);
		const chuTrangId = input.chuTrangId ?? nguoi.id;
		const departmentId = input.departmentId ?? null;
		await this.kiemChuTrang(chuTrangId);
		if (departmentId) await this.kiemDonVi(departmentId);
		return this.db.$transaction(async (tx) => {
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${TAI_LIEU_API.khoaSlug}))`;
			const goc = sinhSlug(ten, new Set());
			const daCo = await tx.taiLieuTrang.findMany({
				where: { OR: [{ slug: goc }, { slug: { startsWith: `${goc}-` } }] },
				select: { slug: true },
			});
			const slug = sinhSlug(ten, new Set(daCo.map((d) => d.slug)));
			const trang = await tx.taiLieuTrang.create({
				data: {
					slug,
					ten,
					loai: input.loai,
					departmentId,
					chuTrangId,
					taoBoiId: nguoi.id,
				},
				select: { id: true },
			});
			const deXuat = await tx.taiLieuDeXuat.create({
				data: {
					trangId: trang.id,
					banGocId: null,
					ten,
					noiDung,
					taoBoiId: nguoi.id,
				},
				select: { id: true },
			});
			await ghiSuKien(tx, trang.id, nguoi.id, {
				loai: "TAO",
				deXuatId: deXuat.id,
			});
			return { slug };
		});
	}

	async propose(
		nguoi: NguoiGoi,
		input: TaiLieuProposeInput,
	): Promise<{ deXuatId: string }> {
		const noiDung = kiemNoiDung(input.noiDung);
		const tenMoi = input.ten === undefined ? null : kiemTen(input.ten);
		return this.db.$transaction(async (tx) => {
			const [khoa] = await tx.$queryRaw<{ id: string }[]>`
				SELECT id FROM "taiLieuTrang" WHERE slug = ${input.slug} FOR UPDATE
			`;
			if (!khoa) throw khongCo();
			const trang = await tx.taiLieuTrang.findFirst({
				where: { AND: [{ id: khoa.id }, dieuKienThay(nguoi)] },
				select: {
					id: true,
					ten: true,
					banDangDungId: true,
					banDangDung: { select: { ten: true, noiDung: true } },
				},
			});
			if (!trang) throw khongCo();
			const ten = tenMoi ?? trang.ten;
			const goc = trang.banDangDung;
			if (goc && goc.ten === ten && chuanHoa(goc.noiDung) === noiDung)
				throw new BadRequestException(T.chuaDoi);
			const deXuat = await tx.taiLieuDeXuat.create({
				data: {
					trangId: trang.id,
					banGocId: trang.banDangDungId,
					ten,
					noiDung,
					taoBoiId: nguoi.id,
				},
				select: { id: true },
			});
			await ghiSuKien(tx, trang.id, nguoi.id, {
				loai: "DE_XUAT",
				deXuatId: deXuat.id,
			});
			return { deXuatId: deXuat.id };
		});
	}
}
