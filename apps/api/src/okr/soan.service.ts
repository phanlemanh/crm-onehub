import { randomUUID } from "node:crypto";
import type { Db, Prisma } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import {
	type CuocSoan,
	capNhatPhien,
	cuocDang,
	type DonViCuocSoan,
	demCuocTrongKy,
	docCuoc,
	docCuocTheoDonVi,
	donViAiCuaCuoc,
	donViCuoc,
	moCuoc,
	tangLuot as tangLuotCuoc,
} from "@crm/db/okr-cuoc-soan";
import { cauHinhAiLuc, quaTranChung } from "@crm/db/okr-tro-ly";
import {
	type CauHinhAi,
	daNhanDeXuat,
	nacCuaDonVi,
	TRO_LY_OKR_TRAN,
} from "@crm/db/okr-tro-ly-danh-muc";
import { docTrangChienLuocDangDung } from "@crm/db/tai-lieu-chien-luoc";
import { PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
import {
	PHIEN_CHO_EVE,
	parseDaCat,
	type SoanDuaVaoInput,
} from "@crm/validation/okr-cuoc-soan";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type {
	CuocSoanOutput,
	DonViSoanVao,
	SoanAnOutput,
	SoanDanhSachCuocOutput,
	SoanDanhSachOutput,
	SoanDuaVaoOutput,
	SoanMoOutput,
	SoanMoVao,
	SoanQuyetInput,
	SoanQuyetOutput,
	SoanSanSangOutput,
	SoanSoDoOutput,
	SoanTangLuotOutput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { OkrAccessService, type Quyen } from "./okr-access.service";
import { OKR } from "./okr-config";
import {
	cuocCuaDong,
	docBanNhapHien,
	docMoiDong,
	docMoiDongCuaCuoc,
	dongHienTu,
	ghiHienLuc,
	ghiQuyet,
	tapHien,
	tenDichCua,
} from "./soan-ban-nhap";
import { duaVaoTrong } from "./soan-dua-vao";
import {
	docKySoan,
	soDoSoanCua,
	tienCua,
	tienTheoCuoc,
} from "./soan-so-do.service";

type Tx = Prisma.TransactionClient;
type DbHoacTx = Db | Tx;
type NacMo = CuocSoan["nac"];

const T = OKR.thongDiep;
const TRAN = TRO_LY_OKR_TRAN.soan;
const phaChuKy = z.enum(PHA_CHU_KY);

async function boCuoc(tx: Tx, id: string): Promise<void> {
	const { count } = await tx.okrCuocSoan.updateMany({
		where: { id, trangThai: "dang" },
		data: { trangThai: "bo" },
	});
	if (count !== 1) throw new ConflictException(T.soan.cuocKhongDang);
}

export function donViTuVao(v: DonViSoanVao): DonViCuocSoan {
	const goc = { cycleId: v.cycleId, divisionId: null, departmentId: null };
	if (v.level === "onehub") return { ...goc, level: v.level };
	if (v.level === "bo-phan") {
		if (!v.divisionId) throw new BadRequestException(T.soan.donViThieuId);
		return { ...goc, level: v.level, divisionId: v.divisionId };
	}
	if (!v.departmentId) throw new BadRequestException(T.soan.donViThieuId);
	return { ...goc, level: v.level, departmentId: v.departmentId };
}

export const khoaDonVi = (dv: DonViCuocSoan) =>
	`okr-soan:${dv.cycleId}:${dv.level}:${dv.divisionId ?? "-"}:${dv.departmentId ?? "-"}`;

const cungDonVi = (dv: DonViCuocSoan, cuoc: CuocSoan) =>
	khoaDonVi(dv) === khoaDonVi(donViTuVao(donViCuoc(cuoc)));

const thayDuoc = (q: Quyen, cuoc: CuocSoan) => q.quanTri || cuoc.nac === "bat";

function assertNguoiMo(q: Quyen, userId: string, cuoc: CuocSoan): void {
	if (cuoc.nguoiMoUserId !== userId && !q.quanTri)
		throw new ForbiddenException(T.soan.khongPhaiNguoiMo);
}

export type CongDonVi =
	| { qua: true; q: Quyen; nac: NacMo; ct: CauHinhAi }
	| {
			qua: false;
			lyDo: "don-vi-luu-tru" | "don-vi-chua-bat" | "don-vi-che-do-an";
	  };

export type CongCuoc =
	| { qua: true; cuoc: CuocSoan; q: Quyen; ct: CauHinhAi }
	| {
			qua: false;
			cuoc: CuocSoan;
			lyDo: "don-vi-luu-tru" | "don-vi-chua-bat";
	  };

type TranChung =
	| { bat: true }
	| { bat: false; lyDo: "het-tran-thang" | "chua-co-khoa-mo-hinh" };

type KetQuaMo =
	| { ok: true; cuoc: CuocSoan }
	| {
			ok: false;
			lyDo:
				| "con-cuoc-dang"
				| "het-cuoc-ky"
				| "don-vi-chua-bat"
				| "don-vi-luu-tru";
			cuocDang: CuocSoan | null;
	  };

@Injectable()
export class SoanService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
	) {}

	private quyenDonVi(userId: string, dv: DonViCuocSoan): Promise<Quyen> {
		return this.quyenOkr.assertNhapDuoc(userId, { ...dv, personUserId: null });
	}

	private async luuTru(client: DbHoacTx, dv: DonViCuocSoan): Promise<boolean> {
		const daLuuTru = { archivedAt: { not: null } };
		if (dv.level === "bo-phan")
			return (
				(await client.division.count({
					where: { id: dv.divisionId ?? "", ...daLuuTru },
				})) > 0
			);
		if (dv.level === "phong-ban")
			return (
				(await client.department.count({
					where: { id: dv.departmentId ?? "", ...daLuuTru },
				})) > 0
			);
		return false;
	}

	private async nacSoan(
		client: DbHoacTx,
		dv: DonViCuocSoan,
		now: Date,
	): Promise<{ ct: CauHinhAi; nac: NacMo | "tat" }> {
		const ct = await cauHinhAiLuc(client, now);
		const nac = nacCuaDonVi(ct, "soan", await donViAiCuaCuoc(client, dv));
		return { ct, nac: nac === "bat" || nac === "an" ? nac : "tat" };
	}

	async congDonVi(
		client: DbHoacTx,
		userId: string,
		dv: DonViCuocSoan,
		now: Date,
	): Promise<CongDonVi> {
		const q = await this.quyenDonVi(userId, dv);
		await this.okr.assertKyChuaAn(client, dv.cycleId);
		if (await this.luuTru(client, dv))
			return { qua: false, lyDo: "don-vi-luu-tru" };
		const { ct, nac } = await this.nacSoan(client, dv, now);
		if (nac === "tat") return { qua: false, lyDo: "don-vi-chua-bat" };
		if (nac === "an" && !q.quanTri)
			return { qua: false, lyDo: "don-vi-che-do-an" };
		return { qua: true, q, nac, ct };
	}

	async congCuoc(
		client: DbHoacTx,
		userId: string,
		cuocSoanId: string,
		now: Date,
		khongThay: () => NotFoundException = () =>
			new NotFoundException(T.soan.khongCoCuoc),
	): Promise<CongCuoc> {
		const cuoc = await docCuoc(client, cuocSoanId);
		if (!cuoc) throw khongThay();
		const dv = donViCuoc(cuoc);
		const q = await this.quyenOkr.quyen(userId);
		const suaDuoc = this.quyenOkr.nhapDuoc(q, userId, {
			...dv,
			personUserId: null,
		});
		if (!suaDuoc || (cuoc.nac === "an" && !q.quanTri)) throw khongThay();
		await this.okr.assertKyChuaAn(client, cuoc.cycleId);
		if (await this.luuTru(client, dv))
			return { qua: false, cuoc, lyDo: "don-vi-luu-tru" };
		const { ct, nac } = await this.nacSoan(client, dv, now);
		if (nac === "tat") return { qua: false, cuoc, lyDo: "don-vi-chua-bat" };
		if (nac === "an" && !q.quanTri) throw khongThay();
		return { qua: true, cuoc, q, ct };
	}

	private async assertLapKeHoach(
		client: DbHoacTx,
		cycleId: string,
	): Promise<void> {
		const c = await client.okrCycle.findUnique({
			where: { id: cycleId },
			select: { phase: true, anLuc: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(cycleId));
		if (c.anLuc !== null) throw new BadRequestException(T.chuKy.kyDaAn);
		if (phaChuKy.parse(c.phase) !== "lap-ke-hoach")
			throw new BadRequestException(T.soan.kyKhongLapKeHoach);
	}

	async tranChung(
		client: DbHoacTx,
		ct: CauHinhAi,
		now: Date,
	): Promise<TranChung> {
		const kq = await quaTranChung(client, ct, now);
		if (kq.bat) return { bat: true };
		if (kq.lyDo === "het-tran-thang" || kq.lyDo === "chua-co-khoa-mo-hinh")
			return { bat: false, lyDo: kq.lyDo };
		throw new Error(`quaTranChung tra ly do la: ${kq.lyDo}`);
	}

	async sanSang(
		userId: string,
		vao: DonViSoanVao,
		now = new Date(),
	): Promise<SoanSanSangOutput> {
		const dv = donViTuVao(vao);
		const cong = await this.congDonVi(this.db, userId, dv, now);
		if (!cong.qua) return { bat: false, lyDo: cong.lyDo };
		const tran = await this.tranChung(this.db, cong.ct, now);
		if (!tran.bat) return tran;
		await this.assertLapKeHoach(this.db, dv.cycleId);
		const [dang, da, trang] = await Promise.all([
			cuocDang(this.db, dv),
			demCuocTrongKy(this.db, dv),
			docTrangChienLuocDangDung(this.db),
		]);
		if (dang !== null && !thayDuoc(cong.q, dang))
			return { bat: false, lyDo: "cuoc-an-dang-mo" };
		if (dang === null && da >= TRAN.cuocMoiDonViMoiKy)
			return { bat: false, lyDo: "het-cuoc-ky" };
		return {
			bat: true,
			nac: cong.nac,
			cuocDang: await this.cuocDangHien(dang),
			soCuocDaDung: da,
			tranCuoc: TRAN.cuocMoiDonViMoiKy,
			thieuBoiCanh: trang.length === 0,
		};
	}

	async mo(
		userId: string,
		vao: SoanMoVao,
		now = new Date(),
	): Promise<SoanMoOutput> {
		const dv = donViTuVao(vao);
		const cong = await this.congDonVi(this.db, userId, dv, now);
		if (!cong.qua) return { ok: false, lyDo: cong.lyDo, cuocDang: null };
		const tran = await this.tranChung(this.db, cong.ct, now);
		if (!tran.bat) return { ok: false, lyDo: tran.lyDo, cuocDang: null };
		const { thuLaiCuocId, boCuocDangId } = vao;
		if (thuLaiCuocId && boCuocDangId)
			throw new BadRequestException(T.soan.thuLaiHayBo);
		const kq = await this.db.$transaction(async (tx): Promise<KetQuaMo> => {
			await lockIdempotencyKey(tx, khoaDonVi(dv));
			await this.assertLapKeHoach(tx, dv.cycleId);
			if (thuLaiCuocId) return this.thuLai(tx, userId, dv, thuLaiCuocId, now);
			const dang = await cuocDang(tx, dv);
			const boDuoc =
				boCuocDangId !== undefined &&
				dang !== null &&
				dang.id === boCuocDangId &&
				(dang.nguoiMoUserId === userId || cong.q.quanTri);
			if (boCuocDangId !== undefined && !boDuoc)
				throw new BadRequestException(T.soan.khongBoDuocCuoc);
			if (dang && !boDuoc)
				return { ok: false, lyDo: "con-cuoc-dang", cuocDang: dang };
			if ((await demCuocTrongKy(tx, dv)) >= TRAN.cuocMoiDonViMoiKy)
				return { ok: false, lyDo: "het-cuoc-ky", cuocDang: null };
			if (dang && boDuoc) await boCuoc(tx, dang.id);
			const cuoc = await moCuoc(tx, {
				...dv,
				nguoiMoUserId: userId,
				sessionId: `${PHIEN_CHO_EVE}${randomUUID()}`,
				nac: cong.nac,
			});
			return { ok: true, cuoc };
		});
		if (kq.ok)
			return { ok: true, cuoc: await this.motCuocHien(this.db, kq.cuoc) };
		if (kq.cuocDang && !thayDuoc(cong.q, kq.cuocDang))
			return { ok: false, lyDo: "cuoc-an-dang-mo", cuocDang: null };
		return {
			ok: false,
			lyDo: kq.lyDo,
			cuocDang: await this.cuocDangHien(kq.cuocDang),
		};
	}

	private async thuLai(
		tx: Tx,
		userId: string,
		dv: DonViCuocSoan,
		cuocSoanId: string,
		now: Date,
	): Promise<KetQuaMo> {
		const cong = await this.congCuoc(tx, userId, cuocSoanId, now);
		if (!cungDonVi(dv, cong.cuoc))
			throw new BadRequestException(T.soan.cuocKhacDonVi);
		if (!cong.qua) return { ok: false, lyDo: cong.lyDo, cuocDang: null };
		assertNguoiMo(cong.q, userId, cong.cuoc);
		const { doi } = await capNhatPhien(
			tx,
			cuocSoanId,
			`${PHIEN_CHO_EVE}${randomUUID()}`,
		);
		if (!doi) throw new ConflictException(T.soan.cuocKhongDang);
		const cuoc = await docCuoc(tx, cuocSoanId);
		if (!cuoc) throw new NotFoundException(T.soan.khongCoCuoc);
		return { ok: true, cuoc };
	}

	private async cuocDangHien(
		dang: CuocSoan | null,
	): Promise<CuocSoanOutput | null> {
		return dang ? this.motCuocHien(this.db, dang) : null;
	}

	async motCuocHien(client: DbHoacTx, cuoc: CuocSoan): Promise<CuocSoanOutput> {
		return (await this.boHien(client, [cuoc]))(cuoc);
	}

	async cuocHien(
		client: DbHoacTx,
		cuoc: CuocSoan[],
	): Promise<CuocSoanOutput[]> {
		if (cuoc.length === 0) return [];
		return cuoc.map(await this.boHien(client, cuoc));
	}

	private async boHien(
		client: DbHoacTx,
		cuoc: CuocSoan[],
	): Promise<(c: CuocSoan) => CuocSoanOutput> {
		const idCua = (lay: (c: CuocSoan) => string | null) => [
			...new Set(
				cuoc.flatMap((c) => {
					const id = lay(c);
					return id === null ? [] : [id];
				}),
			),
		];
		const theoId = { select: { id: true, name: true } } as const;
		const [nguoi, ky, boPhan, phongBan, dem] = await Promise.all([
			client.user.findMany({
				where: { id: { in: idCua((c) => c.nguoiMoUserId) } },
				...theoId,
			}),
			client.okrCycle.findMany({
				where: { id: { in: idCua((c) => c.cycleId) } },
				...theoId,
			}),
			client.division.findMany({
				where: { id: { in: idCua((c) => c.divisionId) } },
				...theoId,
			}),
			client.department.findMany({
				where: { id: { in: idCua((c) => c.departmentId) } },
				...theoId,
			}),
			docMoiDongCuaCuoc(
				client,
				cuoc.map((c) => c.id),
			),
		]);
		const ten = (ds: { id: string; name: string }[]) =>
			new Map(ds.map((d) => [d.id, d.name]));
		const tenNguoi = ten(nguoi);
		const tenKy = ten(ky);
		const tenBoPhan = ten(boPhan);
		const tenPhongBan = ten(phongBan);
		const lanNopCua = new Map(cuoc.map((c) => [c.id, c] as const));
		const hienCua = new Map(
			[...dem].map(
				([id, ds]) =>
					[
						id,
						tapHien(ds, lanNopCua.get(id) ?? { lanNopMoiNhat: null }),
					] as const,
			),
		);
		const demCua = (id: string, chiNhan: boolean) =>
			(hienCua.get(id) ?? []).filter(
				(d) => !chiNhan || daNhanDeXuat(d.hang.trangThai),
			).length;
		const tenDonVi = (c: CuocSoan) => {
			if (c.level === "onehub") return OKR.tenGoc;
			if (c.level === "bo-phan") return tenBoPhan.get(c.divisionId ?? "") ?? "";
			return tenPhongBan.get(c.departmentId ?? "") ?? "";
		};
		return (c) => ({
			id: c.id,
			cycleId: c.cycleId,
			level: c.level,
			divisionId: c.divisionId,
			departmentId: c.departmentId,
			tenDonVi: tenDonVi(c),
			tenChuKy: tenKy.get(c.cycleId) ?? "",
			nguoiMo: {
				id: c.nguoiMoUserId,
				name: tenNguoi.get(c.nguoiMoUserId) ?? "",
			},
			sessionId: c.sessionId,
			nac: c.nac,
			trangThai: c.trangThai,
			soLuot: c.soLuot,
			tranLuot: TRAN.luotMoiCuoc,
			moLuc: c.createdAt.toISOString(),
			duaVaoLuc: c.duaVaoLuc?.toISOString() ?? null,
			soDongNhan: demCua(c.id, true),
			soDongTong: demCua(c.id, false),
		});
	}

	async danhSachCuoc(
		userId: string,
		vao: DonViSoanVao,
	): Promise<SoanDanhSachCuocOutput> {
		const dv = donViTuVao(vao);
		const q = await this.quyenDonVi(userId, dv);
		const tatCa = await docCuocTheoDonVi(this.db, dv);
		return {
			cuoc: await this.cuocHien(
				this.db,
				tatCa.filter((c) => thayDuoc(q, c)),
			),
			soCuocDaDung: await demCuocTrongKy(this.db, dv),
			tranCuoc: TRAN.cuocMoiDonViMoiKy,
		};
	}

	async tangLuot(
		userId: string,
		cuocSoanId: string,
		now = new Date(),
	): Promise<SoanTangLuotOutput> {
		const cong = await this.congCuoc(this.db, userId, cuocSoanId, now);
		if (!cong.qua) return { ok: false, lyDo: cong.lyDo };
		assertNguoiMo(cong.q, userId, cong.cuoc);
		const tran = await this.tranChung(this.db, cong.ct, now);
		if (!tran.bat) return { ok: false, lyDo: tran.lyDo };
		return tangLuotCuoc(this.db, cuocSoanId);
	}

	async danhSach(
		userId: string,
		cuocSoanId: string,
		now = new Date(),
	): Promise<SoanDanhSachOutput> {
		const cong = await this.congCuoc(this.db, userId, cuocSoanId, now);
		const thieuBoiCanh =
			(await docTrangChienLuocDangDung(this.db)).length === 0;
		if (!cong.qua)
			return {
				cuoc: await this.motCuocHien(this.db, cong.cuoc),
				dong: [],
				thieuBoiCanh,
				lyDo: cong.lyDo,
			};
		const ds = await docBanNhapHien(this.db, cong.cuoc);
		await ghiHienLuc(this.db, ds, now);
		const [cuoc, tenDich] = await Promise.all([
			this.motCuocHien(this.db, cong.cuoc),
			tenDichCua(this.db, ds, this.quyenOkr.nguCanhXem(cong.q, userId)),
		]);
		return {
			cuoc,
			dong: ds.map((d) => dongHienTu(d, tenDich)),
			thieuBoiCanh,
			lyDo: null,
		};
	}

	async quyet(
		userId: string,
		input: SoanQuyetInput,
		now = new Date(),
	): Promise<SoanQuyetOutput> {
		return this.db.$transaction(async (tx): Promise<SoanQuyetOutput> => {
			const cuocSoanId = await cuocCuaDong(tx, input.deXuatId);
			await tx.$queryRaw`SELECT id FROM "okrCuocSoan" WHERE id = ${cuocSoanId} FOR UPDATE`;
			const cong = await this.congCuoc(
				tx,
				userId,
				cuocSoanId,
				now,
				() => new NotFoundException(T.soan.khongCoDong(input.deXuatId)),
			);
			if (!cong.qua) return { ok: false, lyDo: cong.lyDo, chiTiet: null };
			if (cong.cuoc.trangThai !== "dang")
				throw new ConflictException(T.soan.cuocKhongDang);
			return ghiQuyet(tx, { ...input, cuoc: cong.cuoc, userId, now });
		});
	}

	async an(userId: string, cuocSoanId: string): Promise<SoanAnOutput> {
		await this.quyenOkr.assertQuanTri(userId);
		const cuoc = await docCuoc(this.db, cuocSoanId);
		if (!cuoc) throw new NotFoundException(T.soan.khongCoCuoc);
		const [hien, ds, tien, q] = await Promise.all([
			this.motCuocHien(this.db, cuoc),
			docMoiDong(this.db, cuocSoanId),
			tienTheoCuoc(this.db, [cuoc]),
			this.quyenOkr.quyen(userId),
		]);
		const tenDich = await tenDichCua(
			this.db,
			ds,
			this.quyenOkr.nguCanhXem(q, userId),
		);
		return {
			cuoc: { ...hien, chiPhiUsd: tienCua(tien, cuoc.id) },
			dong: ds.map((d) => dongHienTu(d, tenDich)),
			daCat: cuoc.daCat === null ? null : parseDaCat(cuoc.daCat),
		};
	}

	async soDo(userId: string, cycleId: string): Promise<SoanSoDoOutput> {
		await this.quyenOkr.assertQuanTri(userId);
		const so = await docKySoan(this.db, cycleId);
		const ganDay = await this.cuocHien(
			this.db,
			so.cuoc.slice(0, OKR.soan.soCuocGanDay),
		);
		return {
			cycleId,
			bat: soDoSoanCua(so, "bat"),
			an: soDoSoanCua(so, "an"),
			cuocGanDay: ganDay.map((c) => ({
				...c,
				chiPhiUsd: tienCua(so.tien, c.id),
			})),
		};
	}

	async duaVao(
		userId: string,
		input: SoanDuaVaoInput,
		now = new Date(),
	): Promise<SoanDuaVaoOutput> {
		return this.db.$transaction(async (tx): Promise<SoanDuaVaoOutput> => {
			await tx.$queryRaw`SELECT id FROM "okrCuocSoan" WHERE id = ${input.cuocSoanId} FOR UPDATE`;
			const cong = await this.congCuoc(tx, userId, input.cuocSoanId, now);
			if (!cong.qua) return { ok: false, lyDo: cong.lyDo, chiTiet: null };
			return duaVaoTrong(tx, this.okr, {
				cuoc: cong.cuoc,
				userId,
				nc: this.quyenOkr.nguCanhXem(cong.q, userId),
				kr: input.kr,
				now,
			});
		});
	}
}
