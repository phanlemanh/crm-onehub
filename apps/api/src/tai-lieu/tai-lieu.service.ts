import { createHash } from "node:crypto";
import { WORKSPACE_ID } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import {
	chuanNfc,
	coChuHaySo,
	gocSlug,
	LOAI_TRANG,
	type LoaiTrang,
	type SuKienChiTiet,
	sinhSlug,
	slugTuDuongDan,
	TAI_LIEU,
	type TrangThaiDeXuat,
} from "@crm/validation/tai-lieu";
import { diffHash, soSanh } from "@crm/validation/tai-lieu-diff";
import { chuanHoa, rutLienKet } from "@crm/validation/tai-lieu-markdown";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import {
	dieuKienDuyetDuoc,
	dieuKienThay,
	dieuKienThayDeXuat,
	duyetDuoc,
	type NguoiGoi,
	thayDeXuat,
	thayTrang,
} from "./quyen";
import type {
	TaiLieuApproveInput,
	TaiLieuCreateInput,
	TaiLieuGetOutput,
	TaiLieuListInput,
	TaiLieuListOutput,
	TaiLieuProposalOutput,
	TaiLieuProposalsOutput,
	TaiLieuProposeInput,
	TaiLieuRejectInput,
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

function bam(noiDung: string): string {
	return createHash("sha256").update(noiDung).digest("hex");
}

function laCu(
	trangThai: string,
	banGocId: string | null,
	banDangDungId: string | null,
): boolean {
	return (
		trangThai === "CU" ||
		(trangThai === "CHO_DUYET" && banGocId !== banDangDungId)
	);
}

function lienKetTrang(noiDung: string) {
	return rutLienKet(noiDung).flatMap((l) => {
		const denSlug = slugTuDuongDan(l.den);
		return denSlug ? [{ denSlug, vanBan: l.vanBan }] : [];
	});
}

type TrangKhoa = {
	id: string;
	slug: string;
	chuTrangId: string;
	banDangDungId: string | null;
};

type KetQuaDuyet = { loai: "cu" } | { loai: "xong"; slug: string; so: number };

function tuChoiTrangThai(trangThai: string): ConflictException {
	return new ConflictException(trangThai === "CU" ? T.cu : T.daXuLy);
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
		const t = await this.db.taiLieuTrang.findUnique({
			where: { slug },
			select: {
				slug: true,
				ten: true,
				loai: true,
				chuTrangId: true,
				banDangDungId: true,
				chuTrang: NGUOI,
				department: DON_VI,
				banDangDung: {
					select: { so: true, duyetLuc: true, noiDung: true },
				},
				deXuat: { distinct: ["taoBoiId"], select: { taoBoiId: true } },
				_count: { select: { deXuat: { where: this.coBanCho(nguoi) } } },
			},
		});
		if (!t || !thayTrang(nguoi, t, t.deXuat)) throw khongCo();
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
			const goc = gocSlug(ten);
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
			await taoDeXuatTaiLieu(tx, {
				trangId: trang.id,
				banGocId: null,
				ten,
				noiDung,
				taoBoiId: nguoi.id,
				suKien: "TAO",
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
			return taoDeXuatTaiLieu(tx, {
				trangId: trang.id,
				banGocId: trang.banDangDungId,
				ten,
				noiDung,
				taoBoiId: nguoi.id,
				suKien: "DE_XUAT",
			});
		});
	}

	async proposals(nguoi: NguoiGoi): Promise<TaiLieuProposalsOutput> {
		const [rows, choToiDuyet] = await Promise.all([
			this.db.taiLieuDeXuat.findMany({
				where: {
					AND: [dieuKienThayDeXuat(nguoi), { trangThai: { not: "DA_DUYET" } }],
				},
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
				take: TAI_LIEU_API.deXuat.coTrang,
				select: {
					id: true,
					ten: true,
					trangThai: true,
					banGocId: true,
					createdAt: true,
					taoBoi: NGUOI,
					trang: { select: { slug: true, banDangDungId: true } },
				},
			}),
			this.db.taiLieuDeXuat.count({
				where: { AND: [dieuKienDuyetDuoc(nguoi), { trangThai: "CHO_DUYET" }] },
			}),
		]);
		return {
			rows: rows.map((r) => ({
				id: r.id,
				slug: r.trang.slug,
				ten: r.ten,
				taoBoi: r.taoBoi,
				luc: r.createdAt.toISOString(),
				trangThai: r.trangThai as TrangThaiDeXuat,
				cu: laCu(r.trangThai, r.banGocId, r.trang.banDangDungId),
			})),
			choToiDuyet,
		};
	}

	async proposal(nguoi: NguoiGoi, id: string): Promise<TaiLieuProposalOutput> {
		const dx = await this.db.taiLieuDeXuat.findUnique({
			where: { id },
			select: {
				id: true,
				ten: true,
				trangThai: true,
				lyDo: true,
				noiDung: true,
				banGocId: true,
				taoBoiId: true,
				taoBoi: NGUOI,
				createdAt: true,
				banGoc: { select: { noiDung: true } },
				trang: {
					select: { slug: true, chuTrangId: true, banDangDungId: true },
				},
			},
		});
		if (!dx || !thayDeXuat(nguoi, dx, dx.trang)) throw khongCo();
		const banGoc = dx.banGoc?.noiDung ?? "";
		return {
			id: dx.id,
			slug: dx.trang.slug,
			ten: dx.ten,
			trangThai: dx.trangThai as TrangThaiDeXuat,
			lyDo: dx.lyDo,
			taoBoi: dx.taoBoi,
			taoLuc: dx.createdAt.toISOString(),
			banGoc,
			noiDung: dx.noiDung,
			diffHash: await diffHash(soSanh(banGoc, dx.noiDung)),
			cu: laCu(dx.trangThai, dx.banGocId, dx.trang.banDangDungId),
			duyetDuoc: duyetDuoc(nguoi, dx.trang),
		};
	}

	private async khoa(tx: Tx, deXuatId: string) {
		const dau = await tx.taiLieuDeXuat.findUnique({
			where: { id: deXuatId },
			select: { trangId: true },
		});
		if (!dau) throw khongCo();
		const [trang] = await tx.$queryRaw<TrangKhoa[]>`
			SELECT id, slug, "chuTrangId", "banDangDungId"
			FROM "taiLieuTrang" WHERE id = ${dau.trangId} FOR UPDATE
		`;
		if (!trang) throw khongCo();
		const dx = await tx.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
			select: {
				id: true,
				ten: true,
				noiDung: true,
				trangThai: true,
				banGocId: true,
			},
		});
		return { trang, dx };
	}

	private async yeuCauDuyet(nguoi: NguoiGoi, deXuatId: string) {
		const dx = await this.db.taiLieuDeXuat.findUnique({
			where: { id: deXuatId },
			select: {
				noiDung: true,
				banGoc: { select: { noiDung: true } },
				trang: { select: { chuTrangId: true } },
			},
		});
		if (!dx) throw khongCo();
		if (!duyetDuoc(nguoi, dx.trang))
			throw new ForbiddenException(T.khongDuocDuyet);
		return dx;
	}

	async approve(
		nguoi: NguoiGoi,
		input: TaiLieuApproveInput,
	): Promise<{ slug: string; so: number }> {
		const truoc = await this.yeuCauDuyet(nguoi, input.id);
		const hash = await diffHash(
			soSanh(truoc.banGoc?.noiDung ?? "", truoc.noiDung),
		);
		const ket = await this.db.$transaction(async (tx): Promise<KetQuaDuyet> => {
			const { trang, dx } = await this.khoa(tx, input.id);
			if (dx.trangThai !== "CHO_DUYET") throw tuChoiTrangThai(dx.trangThai);
			const luc = new Date();
			if (dx.banGocId !== trang.banDangDungId) {
				await tx.taiLieuDeXuat.update({
					where: { id: dx.id },
					data: { trangThai: "CU", xuLyLuc: luc },
				});
				await ghiSuKien(tx, trang.id, nguoi.id, {
					loai: "CU",
					deXuatId: dx.id,
					vi: TAI_LIEU_API.suKienCu,
				});
				return { loai: "cu" };
			}
			if (hash !== input.diffHash) throw new ConflictException(T.daDoi);
			const lon = await tx.taiLieuPhienBan.aggregate({
				where: { trangId: trang.id },
				_max: { so: true },
			});
			const so = (lon._max.so ?? 0) + 1;
			const ban = await tx.taiLieuPhienBan.create({
				data: {
					trangId: trang.id,
					so,
					ten: dx.ten,
					noiDung: dx.noiDung,
					noiDungHash: bam(dx.noiDung),
					deXuatId: dx.id,
					duyetBoiId: nguoi.id,
					duyetLuc: luc,
				},
				select: { id: true },
			});
			await tx.taiLieuTrang.update({
				where: { id: trang.id },
				data: { banDangDungId: ban.id, ten: dx.ten },
			});
			await tx.taiLieuDeXuat.update({
				where: { id: dx.id },
				data: { trangThai: "DA_DUYET", xuLyBoiId: nguoi.id, xuLyLuc: luc },
			});
			const conCho = await tx.taiLieuDeXuat.findMany({
				where: {
					trangId: trang.id,
					trangThai: "CHO_DUYET",
					banGocId: dx.banGocId,
					id: { not: dx.id },
				},
				select: { id: true },
			});
			await tx.taiLieuDeXuat.updateMany({
				where: { id: { in: conCho.map((c) => c.id) } },
				data: { trangThai: "CU", xuLyLuc: luc },
			});
			await ghiSuKien(tx, trang.id, nguoi.id, {
				loai: "DUYET",
				deXuatId: dx.id,
				phienBan: so,
				diffHash: hash,
			});
			for (const c of conCho)
				await ghiSuKien(tx, trang.id, nguoi.id, {
					loai: "CU",
					deXuatId: c.id,
					vi: TAI_LIEU_API.suKienCu,
				});
			await tx.taiLieuLienKet.deleteMany({ where: { tuTrangId: trang.id } });
			await tx.taiLieuLienKet.createMany({
				data: lienKetTrang(dx.noiDung).map((l) => ({
					tuTrangId: trang.id,
					...l,
				})),
			});
			await tx.$executeRaw`
					UPDATE "taiLieuTrang"
					SET "timKiem" = to_tsvector('simple', unaccent(${dx.ten}::text || ' ' || ${dx.noiDung}::text))
					WHERE id = ${trang.id}
				`;
			return { loai: "xong", slug: trang.slug, so };
		});
		if (ket.loai === "cu") throw new ConflictException(T.cu);
		return { slug: ket.slug, so: ket.so };
	}

	async reject(
		nguoi: NguoiGoi,
		input: TaiLieuRejectInput,
	): Promise<{ ok: true }> {
		await this.yeuCauDuyet(nguoi, input.id);
		await this.db.$transaction(async (tx) => {
			const { trang, dx } = await this.khoa(tx, input.id);
			if (dx.trangThai !== "CHO_DUYET") throw tuChoiTrangThai(dx.trangThai);
			await tx.taiLieuDeXuat.update({
				where: { id: dx.id },
				data: {
					trangThai: "TRA_LAI",
					lyDo: input.lyDo,
					xuLyBoiId: nguoi.id,
					xuLyLuc: new Date(),
				},
			});
			await ghiSuKien(tx, trang.id, nguoi.id, {
				loai: "TRA_LAI",
				deXuatId: dx.id,
				lyDo: input.lyDo,
			});
		});
		return { ok: true };
	}
}
