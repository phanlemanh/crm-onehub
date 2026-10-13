import { WORKSPACE_ID } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	kiemTrangChienLuoc,
	LOAI_TRANG_CHIEN_LUOC,
} from "@crm/db/tai-lieu-chien-luoc";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import {
	demChoDuyet,
	dieuKienThay,
	dieuKienThayDeXuat,
} from "@crm/db/tai-lieu-quyen";
import { DIEU_KIEN_DANG_DUNG } from "@crm/db/tai-lieu-tim";
import {
	gocSlug,
	LOAI_TRANG,
	type LoaiTrang,
	parseLoaiDeXuat,
	sinhSlug,
	TAI_LIEU,
	type TrangThaiDeXuat,
} from "@crm/validation/tai-lieu";
import { diffHash, soSanh } from "@crm/validation/tai-lieu-diff";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import { parseTrangThaiNguon } from "@crm/validation/tai-lieu-nguon";
import { soMoi } from "@crm/validation/tai-lieu-so";
import {
	danhSachTrichDoan,
	parseTrichDoan,
} from "@crm/validation/tai-lieu-trich-doan";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { archivedFilter } from "../trpc/list-input";
import {
	dieuKienThayNguon,
	duyetDuoc,
	type NguoiGoi,
	thayDeXuat,
} from "./quyen";
import { ghiSuKien } from "./su-kien";
import type {
	TaiLieuApproveInput,
	TaiLieuCreateInput,
	TaiLieuDangDungOutput,
	TaiLieuGetOutput,
	TaiLieuListInput,
	TaiLieuListOutput,
	TaiLieuProposalOutput,
	TaiLieuProposalsInput,
	TaiLieuProposalsOutput,
	TaiLieuProposeInput,
	TaiLieuRejectInput,
} from "./tai-lieu.contracts";
import {
	bam,
	dangChoCua,
	khongCo,
	kiemNoiDung,
	kiemTen,
	laCu,
	lienKetTrang,
	tuChoiTrangThai,
} from "./tai-lieu-chung";
import { TAI_LIEU_API } from "./tai-lieu-config";
import { duyetKhoiPhuc, duyetLuuTru } from "./tai-lieu-luu-tru";

const T = TAI_LIEU_API.thongDiep;

type Tx = Prisma.TransactionClient;

export type TrangMoiVao = {
	ten: string;
	loai: LoaiTrang;
	chuTrangId?: string | null;
	departmentId?: string | null;
};

export type TrangMoiSach = {
	ten: string;
	loai: LoaiTrang;
	chuTrangId: string;
	departmentId: string | null;
};

const NGUOI = { select: { id: true, name: true } } as const;
const DON_VI = { select: { id: true, name: true } } as const;
const NGUON_NGAN = { select: { id: true, tenTep: true } } as const;

const TRANG_THAI_NHOM = {
	"tat-ca": { trangThai: { not: "DA_DUYET" } },
	cho: { trangThai: "CHO_DUYET" },
	"da-xu-ly": { trangThai: { in: ["DA_DUYET", "TRA_LAI", "CU"] } },
} as const satisfies Record<
	NonNullable<TaiLieuProposalsInput>["nhom"],
	Prisma.TaiLieuDeXuatWhereInput
>;

type TrangKhoa = {
	id: string;
	slug: string;
	chuTrangId: string;
	banDangDungId: string | null;
	archivedAt: Date | null;
};

type KetQuaDuyet = { loai: "cu" } | { loai: "xong"; slug: string; so: number };

@Injectable()
export class TaiLieuService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	private coBanCho(nguoi: NguoiGoi): Prisma.TaiLieuDeXuatWhereInput {
		return {
			trangThai: "CHO_DUYET",
			loai: "NOI_DUNG",
			...dieuKienThayDeXuat(nguoi),
		};
	}

	async dangDung(nguoi: NguoiGoi): Promise<TaiLieuDangDungOutput> {
		const rows = await this.db.taiLieuTrang.findMany({
			where: { AND: [dieuKienThay(nguoi), DIEU_KIEN_DANG_DUNG] },
			orderBy: [{ ten: "asc" }, { id: "asc" }],
			take: TAI_LIEU_API.dangDung.toiDa,
			select: { slug: true, ten: true },
		});
		return { rows };
	}

	async list(
		nguoi: NguoiGoi,
		input: TaiLieuListInput,
	): Promise<TaiLieuListOutput> {
		const thay: Prisma.TaiLieuTrangWhereInput = {
			AND: [
				dieuKienThay(nguoi),
				archivedFilter(input.archived),
				...(input.donViId ? [{ departmentId: input.donViId }] : []),
				...(input.chuTrangId ? [{ chuTrangId: input.chuTrangId }] : []),
			],
		};
		const where: Prisma.TaiLieuTrangWhereInput = input.loai
			? { AND: [thay, { loai: input.loai }] }
			: thay;
		const coTrang = TAI_LIEU.danhSach.coTrang;
		const [trang, total, nhom, soDaLuuTru] = await Promise.all([
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
					archivedAt: true,
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
			this.db.taiLieuTrang.count({
				where: { AND: [dieuKienThay(nguoi), archivedFilter(true)] },
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
				luuTruLuc: t.archivedAt?.toISOString() ?? null,
			})),
			total,
			facetCounts,
			soDaLuuTru,
		};
	}

	async get(nguoi: NguoiGoi, slug: string): Promise<TaiLieuGetOutput> {
		const t = await this.db.taiLieuTrang.findFirst({
			where: { AND: [{ slug }, dieuKienThay(nguoi)] },
			select: {
				id: true,
				slug: true,
				ten: true,
				loai: true,
				chuTrang: NGUOI,
				department: DON_VI,
				xacMinhDen: true,
				archivedAt: true,
				banDangDung: {
					select: {
						so: true,
						duyetLuc: true,
						noiDung: true,
						deXuat: { select: { nguon: NGUON_NGAN } },
					},
				},
				_count: { select: { deXuat: { where: this.coBanCho(nguoi) } } },
			},
		});
		if (!t) throw khongCo();
		const ban = t.banDangDung;
		const choTheoLoai = await this.db.taiLieuDeXuat.findMany({
			where: {
				trangId: t.id,
				trangThai: "CHO_DUYET",
				loai: { in: ["LUU_TRU", "KHOI_PHUC"] },
			},
			distinct: ["loai"],
			select: { loai: true },
		});
		const coCho = (loai: string) => choTheoLoai.some((c) => c.loai === loai);
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
			choLanDau: ban ? null : await this.choLanDau(nguoi, t),
			suaDuoc: true,
			nguon: ban?.deXuat.nguon ?? null,
			xacMinhDen: t.xacMinhDen?.toISOString() ?? null,
			quaHanXacMinh:
				t.xacMinhDen !== null && t.xacMinhDen < dauNgayVN(new Date()),
			coQuyenXacMinh: duyetDuoc(nguoi, { chuTrangId: t.chuTrang.id }),
			daLuuTru: t.archivedAt ? { luc: t.archivedAt.toISOString() } : null,
			coLuuTruCho: coCho("LUU_TRU"),
			coKhoiPhucCho: coCho("KHOI_PHUC"),
		};
	}

	async datXacMinh(
		nguoi: NguoiGoi,
		input: { slug: string; den: string | null },
	): Promise<{ ok: true }> {
		const t = await this.db.taiLieuTrang.findFirst({
			where: { AND: [{ slug: input.slug }, dieuKienThay(nguoi)] },
			select: { id: true, chuTrangId: true },
		});
		if (!t) throw khongCo();
		if (!duyetDuoc(nguoi, t))
			throw new ForbiddenException(T.khongDuocDatXacMinh);
		const den =
			input.den === null
				? null
				: new Date(`${input.den}T${TAI_LIEU_API.gioXacMinh}`);
		await this.db.$transaction(async (tx) => {
			await tx.taiLieuTrang.update({
				where: { id: t.id },
				data: { xacMinhDen: den },
			});
			await ghiSuKien(tx, t.id, nguoi.id, { loai: "XAC_MINH", den: input.den });
		});
		return { ok: true };
	}

	private async choLanDau(
		nguoi: NguoiGoi,
		t: { id: string; chuTrang: { id: string; name: string } },
	): Promise<NonNullable<TaiLieuGetOutput["choLanDau"]>> {
		const [deXuat, moi] = await Promise.all([
			this.db.taiLieuDeXuat.findMany({
				where: { trangId: t.id, trangThai: { in: ["CHO_DUYET", "TRA_LAI"] } },
				distinct: ["trangThai"],
				select: { trangThai: true },
			}),
			this.db.taiLieuNguon.findFirst({
				where: { trangId: t.id },
				orderBy: [{ taiLuc: "desc" }, { id: "desc" }],
				select: { id: true, tenTep: true, trangThai: true, lyDo: true },
			}),
		]);
		const co = (tt: TrangThaiDeXuat) => deXuat.some((d) => d.trangThai === tt);
		const thayNguon =
			moi !== null &&
			(await this.db.taiLieuNguon.count({
				where: { AND: [{ id: moi.id }, dieuKienThayNguon(nguoi)] },
			})) > 0;
		return {
			chuTrang: t.chuTrang,
			dangCho: dangChoCua({
				coCho: co("CHO_DUYET"),
				coTraLai: co("TRA_LAI"),
				nguonMoi: moi ? parseTrangThaiNguon(moi.trangThai) : null,
			}),
			nguon:
				moi && thayNguon
					? { id: moi.id, tenTep: moi.tenTep, lyDo: moi.lyDo }
					: null,
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

	async kiemTrangMoi(nguoi: NguoiGoi, vao: TrangMoiVao): Promise<TrangMoiSach> {
		const ten = kiemTen(vao.ten);
		const chuTrangId = vao.chuTrangId ?? nguoi.id;
		const departmentId = vao.departmentId ?? null;
		await this.kiemChuTrang(chuTrangId);
		if (departmentId) await this.kiemDonVi(departmentId);
		return { ten, loai: vao.loai, chuTrangId, departmentId };
	}

	async taoTrangTrong(
		tx: Tx,
		nguoi: NguoiGoi,
		trang: TrangMoiSach,
	): Promise<{ id: string; slug: string }> {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${TAI_LIEU_API.khoaSlug}))`;
		const goc = gocSlug(trang.ten);
		const daCo = await tx.taiLieuTrang.findMany({
			where: { OR: [{ slug: goc }, { slug: { startsWith: `${goc}-` } }] },
			select: { slug: true },
		});
		const slug = sinhSlug(trang.ten, new Set(daCo.map((d) => d.slug)));
		const moi = await tx.taiLieuTrang.create({
			data: {
				slug,
				ten: trang.ten,
				loai: trang.loai,
				departmentId: trang.departmentId,
				chuTrangId: trang.chuTrangId,
				taoBoiId: nguoi.id,
			},
			select: { id: true },
		});
		return { id: moi.id, slug };
	}

	async create(
		nguoi: NguoiGoi,
		input: TaiLieuCreateInput,
	): Promise<{ slug: string }> {
		const trang = await this.kiemTrangMoi(nguoi, input);
		const noiDung = kiemNoiDung(input.noiDung);
		return this.db.$transaction(async (tx) => {
			const { id, slug } = await this.taoTrangTrong(tx, nguoi, trang);
			await taoDeXuatTaiLieu(tx, {
				trangId: id,
				banGocId: null,
				ten: trang.ten,
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
					archivedAt: true,
					banDangDungId: true,
					banDangDung: { select: { ten: true, noiDung: true } },
				},
			});
			if (!trang) throw khongCo();
			if (trang.archivedAt) throw new BadRequestException(T.daLuuTru);
			const ten = tenMoi ?? trang.ten;
			const goc = trang.banDangDung;
			if (goc && goc.ten === ten && chuanHoa(goc.noiDung) === noiDung)
				throw new BadRequestException(T.chuaDoi);
			const nguon = await this.nguonCuaBanSua(
				tx,
				nguoi,
				trang.id,
				input.tuDeXuatId,
			);
			return taoDeXuatTaiLieu(tx, {
				trangId: trang.id,
				banGocId: trang.banDangDungId,
				ten,
				noiDung,
				taoBoiId: nguoi.id,
				suKien: "DE_XUAT",
				...nguon,
			});
		});
	}

	private async nguonCuaBanSua(
		tx: Tx,
		nguoi: NguoiGoi,
		trangId: string,
		tuDeXuatId: string | undefined,
	): Promise<{
		nguonId: string | null;
		trichDoan: Prisma.InputJsonValue | null;
	}> {
		if (tuDeXuatId === undefined) return { nguonId: null, trichDoan: null };
		const goc = await tx.taiLieuDeXuat.findFirst({
			where: { AND: [{ id: tuDeXuatId, trangId }, dieuKienThayDeXuat(nguoi)] },
			select: { nguonId: true, trichDoan: true },
		});
		if (!goc) throw khongCo();
		if (!goc.nguonId) return { nguonId: null, trichDoan: null };
		return {
			nguonId: goc.nguonId,
			trichDoan: danhSachTrichDoan.parse(goc.trichDoan),
		};
	}

	async proposals(
		nguoi: NguoiGoi,
		input: TaiLieuProposalsInput,
	): Promise<TaiLieuProposalsOutput> {
		const nhom = input?.nhom ?? "tat-ca";
		const page = input?.page ?? 1;
		const where: Prisma.TaiLieuDeXuatWhereInput = {
			AND: [
				dieuKienThayDeXuat(nguoi),
				TRANG_THAI_NHOM[nhom],
				...(input?.slug ? [{ trang: { slug: input.slug } }] : []),
			],
		};
		const coTrang = TAI_LIEU_API.deXuat.coTrang;
		const [rows, total, choToiDuyet] = await Promise.all([
			this.db.taiLieuDeXuat.findMany({
				where,
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
				skip: (page - 1) * coTrang,
				take: coTrang,
				select: {
					id: true,
					ten: true,
					trangThai: true,
					loai: true,
					banGocId: true,
					createdAt: true,
					taoBoi: NGUOI,
					trang: { select: { slug: true, banDangDungId: true } },
				},
			}),
			this.db.taiLieuDeXuat.count({ where }),
			demChoDuyet(this.db, nguoi),
		]);
		return {
			rows: rows.map((r) => ({
				id: r.id,
				slug: r.trang.slug,
				ten: r.ten,
				taoBoi: r.taoBoi,
				luc: r.createdAt.toISOString(),
				trangThai: r.trangThai as TrangThaiDeXuat,
				loai: parseLoaiDeXuat(r.loai),
				cu: laCu(r, r.trang.banDangDungId),
			})),
			total,
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
				loai: true,
				lyDo: true,
				lyDoDeXuat: true,
				tuPhienBanSo: true,
				noiDung: true,
				banGocId: true,
				taoBoiId: true,
				taoBoi: NGUOI,
				createdAt: true,
				banGoc: { select: { noiDung: true } },
				trang: {
					select: {
						slug: true,
						chuTrangId: true,
						banDangDungId: true,
						loai: true,
					},
				},
				trichDoan: true,
				nguon: { select: { id: true, tenTep: true, chu: true } },
			},
		});
		if (!dx || !thayDeXuat(nguoi, dx, dx.trang)) throw khongCo();
		const banGoc = dx.banGoc?.noiDung ?? "";
		const nguon = dx.nguon;
		const chienLuoc =
			dx.trang.loai === LOAI_TRANG_CHIEN_LUOC
				? kiemTrangChienLuoc(dx.noiDung)
				: null;
		return {
			id: dx.id,
			slug: dx.trang.slug,
			ten: dx.ten,
			trangThai: dx.trangThai as TrangThaiDeXuat,
			loai: parseLoaiDeXuat(dx.loai),
			lyDo: dx.lyDo,
			lyDoDeXuat: dx.lyDoDeXuat,
			tuPhienBanSo: dx.tuPhienBanSo,
			taoBoi: dx.taoBoi,
			taoLuc: dx.createdAt.toISOString(),
			banGoc,
			noiDung: dx.noiDung,
			diffHash: await diffHash(soSanh(banGoc, dx.noiDung)),
			cu: laCu(dx, dx.trang.banDangDungId),
			duyetDuoc: duyetDuoc(nguoi, dx.trang),
			nguon: nguon ? { id: nguon.id, tenTep: nguon.tenTep } : null,
			trichDoan: nguon ? parseTrichDoan(dx.trichDoan) : [],
			chuNguon: nguon?.chu ?? null,
			soMoi: nguon ? soMoi(dx.noiDung, dx.banGoc?.noiDung ?? null) : [],
			chienLuoc: chienLuoc
				? {
						soKyTu: chienLuoc.soKyTu,
						tranKyTu: chienLuoc.tranKyTu,
						canhBaoTuCam: chienLuoc.canhBaoTuCam,
					}
				: null,
		};
	}

	private async khoa(tx: Tx, deXuatId: string) {
		const dau = await tx.taiLieuDeXuat.findUnique({
			where: { id: deXuatId },
			select: { trangId: true },
		});
		if (!dau) throw khongCo();
		const [trang] = await tx.$queryRaw<TrangKhoa[]>`
			SELECT id, slug, "chuTrangId", "banDangDungId", "archivedAt"
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
				loai: true,
				banGocId: true,
			},
		});
		return { trang, dx: { ...dx, loai: parseLoaiDeXuat(dx.loai) } };
	}

	private async yeuCauDuyet(nguoi: NguoiGoi, deXuatId: string) {
		const dx = await this.db.taiLieuDeXuat.findUnique({
			where: { id: deXuatId },
			select: {
				noiDung: true,
				nguonId: true,
				loai: true,
				banGoc: { select: { noiDung: true } },
				trang: { select: { chuTrangId: true, loai: true } },
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
	): Promise<{ slug: string; so: number; canhBaoTuCam: string[] }> {
		const truoc = await this.yeuCauDuyet(nguoi, input.id);
		if (truoc.loai !== "NOI_DUNG") return this.duyetViecTrang(nguoi, input.id);
		const chienLuoc =
			truoc.trang.loai === LOAI_TRANG_CHIEN_LUOC
				? kiemTrangChienLuoc(truoc.noiDung)
				: null;
		if (chienLuoc?.quaTran)
			throw new BadRequestException(
				T.chienLuocQuaTran(chienLuoc.tranKyTu, chienLuoc.soKyTu),
			);
		if (truoc.nguonId) {
			const canDoiChieu = soMoi(
				truoc.noiDung,
				truoc.banGoc?.noiDung ?? null,
			).length;
			if ((input.daDoiChieu ?? 0) < canDoiChieu) {
				throw new BadRequestException(T.chuaDoiChieu);
			}
		}
		const hash = await diffHash(
			soSanh(truoc.banGoc?.noiDung ?? "", truoc.noiDung),
		);
		const ket = await this.db.$transaction(async (tx): Promise<KetQuaDuyet> => {
			const { trang, dx } = await this.khoa(tx, input.id);
			if (dx.trangThai !== "CHO_DUYET") throw tuChoiTrangThai(dx.trangThai);
			if (trang.archivedAt) throw new BadRequestException(T.daLuuTru);
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
					loai: "NOI_DUNG",
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
		return {
			slug: ket.slug,
			so: ket.so,
			canhBaoTuCam: chienLuoc?.canhBaoTuCam ?? [],
		};
	}

	private async duyetViecTrang(
		nguoi: NguoiGoi,
		id: string,
	): Promise<{ slug: string; so: number; canhBaoTuCam: string[] }> {
		const ket = await this.db.$transaction(async (tx) => {
			const { trang, dx } = await this.khoa(tx, id);
			if (dx.trangThai !== "CHO_DUYET") throw tuChoiTrangThai(dx.trangThai);
			const viec = { trangId: trang.id, deXuatId: dx.id, nguoiId: nguoi.id };
			if (dx.loai === "LUU_TRU") await duyetLuuTru(tx, viec);
			else await duyetKhoiPhuc(tx, viec);
			const ban = trang.banDangDungId
				? await tx.taiLieuPhienBan.findUnique({
						where: { id: trang.banDangDungId },
						select: { so: true },
					})
				: null;
			return { slug: trang.slug, so: ban?.so ?? 0 };
		});
		return { ...ket, canhBaoTuCam: [] };
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
