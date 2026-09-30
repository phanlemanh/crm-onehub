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
	donViCuoc,
	moCuoc,
	tangLuot as tangLuotCuoc,
} from "@crm/db/okr-cuoc-soan";
import { cauHinhAiLuc, quaTranChung } from "@crm/db/okr-tro-ly";
import {
	type CauHinhAi,
	type DonViMucTieu,
	nacCuaDonVi,
	TRO_LY_OKR_TRAN,
} from "@crm/db/okr-tro-ly-danh-muc";
import { docTrangChienLuocDangDung } from "@crm/db/tai-lieu-chien-luoc";
import { PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
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
	SoanDanhSachCuocOutput,
	SoanDanhSachOutput,
	SoanMoOutput,
	SoanMoVao,
	SoanQuyetInput,
	SoanQuyetOutput,
	SoanSanSangOutput,
	SoanTangLuotOutput,
} from "./okr.contracts";
import { OkrAccessService, type Quyen } from "./okr-access.service";
import { OKR } from "./okr-config";
import {
	cuocCuaDong,
	docBanNhapHien,
	docMoiDongCuaCuoc,
	dongHienTu,
	ghiHienLuc,
	ghiQuyet,
	tapHien,
	tenDichCua,
} from "./soan-ban-nhap";

type Tx = Prisma.TransactionClient;
type DbHoacTx = Db | Tx;
type NacMo = CuocSoan["nac"];

const T = OKR.thongDiep;
const TRAN = TRO_LY_OKR_TRAN.soan;
const phaChuKy = z.enum(PHA_CHU_KY);
const DA_NHAN: ReadonlySet<string> = new Set(["nhan", "sua"]);

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

export function donViAi(dv: DonViCuocSoan, q: Quyen): DonViMucTieu {
	if (dv.level === "onehub")
		return { onehub: true, boPhanId: null, phongBanId: null };
	if (dv.level === "bo-phan")
		return { onehub: false, boPhanId: dv.divisionId, phongBanId: null };
	return {
		onehub: false,
		boPhanId: q.boPhanCua.get(dv.departmentId ?? "") ?? null,
		phongBanId: dv.departmentId,
	};
}

export const khoaDonVi = (dv: DonViCuocSoan) =>
	`okr-soan:${dv.cycleId}:${dv.level}:${dv.divisionId ?? "-"}:${dv.departmentId ?? "-"}`;

const cungDonVi = (dv: DonViCuocSoan, cuoc: CuocSoan) =>
	khoaDonVi(dv) === khoaDonVi(donViTuVao(donViCuoc(cuoc)));

const thayDuoc = (q: Quyen, cuoc: CuocSoan) => q.quanTri || cuoc.nac === "bat";

export type CongDonVi =
	| { qua: true; q: Quyen; nac: NacMo; ct: CauHinhAi }
	| { qua: false; lyDo: "don-vi-chua-bat" | "don-vi-che-do-an" };

export type CongCuoc =
	| { qua: true; cuoc: CuocSoan; q: Quyen; ct: CauHinhAi }
	| { qua: false; cuoc: CuocSoan; lyDo: "don-vi-chua-bat" };

type TranChung =
	| { bat: true }
	| { bat: false; lyDo: "het-tran-thang" | "chua-co-khoa-mo-hinh" };

type KetQuaMo =
	| { ok: true; cuoc: CuocSoan }
	| {
			ok: false;
			lyDo: "con-cuoc-dang" | "het-cuoc-ky" | "don-vi-chua-bat";
			cuocDang: CuocSoan | null;
	  };

@Injectable()
export class SoanService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	private quyenDonVi(userId: string, dv: DonViCuocSoan): Promise<Quyen> {
		return this.quyenOkr.assertNhapDuoc(userId, { ...dv, personUserId: null });
	}

	private async nacSoan(
		client: DbHoacTx,
		dv: DonViCuocSoan,
		q: Quyen,
		now: Date,
	): Promise<{ ct: CauHinhAi; nac: NacMo | "tat" }> {
		const ct = await cauHinhAiLuc(client, now);
		const nac = nacCuaDonVi(ct, "soan", donViAi(dv, q));
		return { ct, nac: nac === "bat" || nac === "an" ? nac : "tat" };
	}

	async congDonVi(
		client: DbHoacTx,
		userId: string,
		dv: DonViCuocSoan,
		now: Date,
	): Promise<CongDonVi> {
		const q = await this.quyenDonVi(userId, dv);
		const { ct, nac } = await this.nacSoan(client, dv, q, now);
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
	): Promise<CongCuoc> {
		const cuoc = await docCuoc(client, cuocSoanId);
		if (!cuoc) throw new NotFoundException(T.soan.khongCoCuoc(cuocSoanId));
		const dv = donViCuoc(cuoc);
		const q = await this.quyenDonVi(userId, dv);
		const { ct, nac } = await this.nacSoan(client, dv, q, now);
		if (nac === "tat") return { qua: false, cuoc, lyDo: "don-vi-chua-bat" };
		if ((nac === "an" || cuoc.nac === "an") && !q.quanTri)
			throw new ForbiddenException(T.soan.cuocAn);
		return { qua: true, cuoc, q, ct };
	}

	private async assertLapKeHoach(
		client: DbHoacTx,
		cycleId: string,
	): Promise<void> {
		const c = await client.okrCycle.findUnique({
			where: { id: cycleId },
			select: { phase: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(cycleId));
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
		if (dang === null && da >= TRAN.cuocMoiDonViMoiKy)
			return { bat: false, lyDo: "het-cuoc-ky" };
		return {
			bat: true,
			nac: cong.nac,
			cuocDang: await this.cuocDangHien(cong.q, dang),
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
		const { thuLaiCuocId } = vao;
		const kq = await this.db.$transaction(async (tx): Promise<KetQuaMo> => {
			await lockIdempotencyKey(tx, khoaDonVi(dv));
			await this.assertLapKeHoach(tx, dv.cycleId);
			if (thuLaiCuocId) return this.thuLai(tx, userId, dv, thuLaiCuocId, now);
			const dang = await cuocDang(tx, dv);
			if (dang) return { ok: false, lyDo: "con-cuoc-dang", cuocDang: dang };
			if ((await demCuocTrongKy(tx, dv)) >= TRAN.cuocMoiDonViMoiKy)
				return { ok: false, lyDo: "het-cuoc-ky", cuocDang: null };
			const cuoc = await moCuoc(tx, {
				...dv,
				nguoiMoUserId: userId,
				sessionId: randomUUID(),
				nac: cong.nac,
			});
			return { ok: true, cuoc };
		});
		if (kq.ok)
			return { ok: true, cuoc: await this.motCuocHien(this.db, kq.cuoc) };
		return {
			ok: false,
			lyDo: kq.lyDo,
			cuocDang: await this.cuocDangHien(cong.q, kq.cuocDang),
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
		const { doi } = await capNhatPhien(tx, cuocSoanId, randomUUID());
		if (!doi) throw new ConflictException(T.soan.cuocKhongDang);
		const cuoc = await docCuoc(tx, cuocSoanId);
		if (!cuoc) throw new NotFoundException(T.soan.khongCoCuoc(cuocSoanId));
		return { ok: true, cuoc };
	}

	private async cuocDangHien(
		q: Quyen,
		dang: CuocSoan | null,
	): Promise<CuocSoanOutput | null> {
		if (!dang || !thayDuoc(q, dang)) return null;
		return this.motCuocHien(this.db, dang);
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
		const hienCua = new Map(
			[...dem].map(([id, ds]) => [id, tapHien(ds)] as const),
		);
		const demCua = (id: string, chiNhan: boolean) =>
			(hienCua.get(id) ?? []).filter(
				(d) => !chiNhan || DA_NHAN.has(d.hang.trangThai),
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
		const ds = await docBanNhapHien(this.db, cuocSoanId);
		await ghiHienLuc(this.db, ds, now);
		const [cuoc, tenDich] = await Promise.all([
			this.motCuocHien(this.db, cong.cuoc),
			tenDichCua(this.db, ds),
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
			const cong = await this.congCuoc(tx, userId, cuocSoanId, now);
			if (!cong.qua) return { ok: false, lyDo: cong.lyDo, chiTiet: null };
			if (cong.cuoc.trangThai !== "dang")
				throw new ConflictException(T.soan.cuocKhongDang);
			return ghiQuyet(tx, { ...input, cuocSoanId, userId, now });
		});
	}
}
