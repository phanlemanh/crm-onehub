import { docDuocPhamVi } from "@crm/auth";
import { type Db, Prisma } from "@crm/db";
import {
	banGhiChiSo,
	demChiSo,
	type KhoangKy,
	khoangKy,
} from "@crm/db/okr-chi-so";
import { dieuKienXemMucTieu, type NguCanhXem } from "@crm/db/okr-hien-thi";
import { OKR_SO } from "@crm/db/okr-so-config";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { kiemGiaTriTheoKieu } from "@crm/validation/okr-cap-nhat";
import {
	BAC_GHI_DANH,
	type BacGhiDanh,
	type DinhNghiaChiSo,
	MA_CHI_SO,
	type MaChiSo,
	type PhamViChiSo,
} from "@crm/validation/okr-chi-so";
import { kieuKr, NGUON_KR, type NguonKr } from "@crm/validation/okr-kr";
import { TRANG_THAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import {
	crmHopKieu,
	type DatNguonKrInput,
	LOAI_NGUON_MAY,
	type OkrNguonDong,
	parseOkrNguon,
	parseOkrSoChup,
	sheetIdTuUrl,
} from "@crm/validation/okr-nguon";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import type {
	BanGhiChiSoInput,
	BanGhiChiSoOutput,
	GhiSoKrInput,
	XemTruocChiSoInput,
} from "./okr-so.contracts";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;
type CauHinh = Omit<OkrNguonDong, "docLoi">;
type NguonMoi = Exclude<DatNguonKrInput, { loai: "tay" }>;
type CoDinhNghia = {
	chiSo: MaChiSo | null;
	phamVi: PhamViChiSo | null;
	bac: BacGhiDanh | null;
};

const nguonKr = z.enum(NGUON_KR);
const loaiNguonMay = z.enum(LOAI_NGUON_MAY);
const trangThaiMucTieu = z.enum(TRANG_THAI_MUC_TIEU);

function emailSheets(): string | null {
	const email = process.env.GOOGLE_SHEETS_EMAIL?.trim();
	return email ? email : null;
}

export function sheetsBat(): boolean {
	return (
		emailSheets() !== null && Boolean(process.env.GOOGLE_SHEETS_KHOA?.trim())
	);
}

function khoaPhamVi(pv: PhamViChiSo | null): string | null {
	if (pv === null) return null;
	return pv.kieu === "toan-cong-ty" ? pv.kieu : `${pv.kieu}:${pv.id}`;
}

function cauHinhTu(vao: NguonMoi): CauHinh {
	const rong = {
		chiSo: null,
		phamVi: null,
		bac: null,
		sheetId: null,
		sheetO: null,
	};
	switch (vao.loai) {
		case "crm":
			return {
				...rong,
				loai: "crm",
				chiSo: vao.chiSo,
				phamVi: vao.phamVi,
				bac: vao.bac ?? null,
			};
		case "api":
			return { ...rong, loai: "api" };
		case "bang-tinh": {
			const sheetId = sheetIdTuUrl(vao.url);
			if (sheetId === null)
				throw new Error("Khuôn đã nhận đường dẫn mà không đọc được mã bảng");
			return { ...rong, loai: "bang-tinh", sheetId, sheetO: vao.o };
		}
	}
}

function giongNhau(cu: CauHinh | null, moi: CauHinh | null): boolean {
	if (cu === null || moi === null) return cu === moi;
	return (
		cu.loai === moi.loai &&
		cu.chiSo === moi.chiSo &&
		khoaPhamVi(cu.phamVi) === khoaPhamVi(moi.phamVi) &&
		cu.bac === moi.bac &&
		cu.sheetId === moi.sheetId &&
		cu.sheetO === moi.sheetO
	);
}

function vetNguon(nguon: NguonKr, ch: CauHinh | null): OkrVetSnapshot {
	if (ch === null) return { nguon };
	const day = {
		nguon,
		nguonMay: ch.loai,
		chiSo: ch.chiSo,
		phamVi: khoaPhamVi(ch.phamVi),
		bac: ch.bac,
		sheetId: ch.sheetId,
		sheetO: ch.sheetO,
	};
	return Object.fromEntries(Object.entries(day).filter(([, v]) => v !== null));
}

function dinhNghiaTu(x: CoDinhNghia | null): DinhNghiaChiSo | null {
	if (!x?.chiSo || !x.phamVi) return null;
	return { chiSo: x.chiSo, phamVi: x.phamVi, bac: x.bac ?? undefined };
}

function ngayKhoang(k: KhoangKy) {
	return { tu: ngayVN(k.tu), den: ngayVN(new Date(k.den.getTime() - 1)) };
}

const ngayDb = (ngay: string) => new Date(`${ngay}T00:00:00Z`);

@Injectable()
export class OkrSoService {
	private readonly logger = new Logger(OkrSoService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(AgentTriggerService) private readonly trigger: AgentTriggerService,
	) {}

	chiSo() {
		const bat = sheetsBat();
		return {
			chiSo: [...MA_CHI_SO],
			bac: [...BAC_GHI_DANH],
			sheetsBat: bat,
			emailSheets: bat ? emailSheets() : null,
		};
	}

	async xemTruocChiSo(input: XemTruocChiSoInput) {
		const ky = await this.db.okrCycle.findUnique({
			where: { id: input.cycleId },
			select: { startsOn: true, endsOn: true },
		});
		if (!ky) throw new NotFoundException(T.khongCoChuKy(input.cycleId));
		const k = khoangKy(ky.startsOn, ky.endsOn, ngayVN(new Date()));
		const giaTri = await demChiSo(
			this.db,
			{ chiSo: input.chiSo, phamVi: input.phamVi, bac: input.bac },
			k,
		);
		return { giaTri, ...ngayKhoang(k) };
	}

	private async kiemPhamVi(tx: Tx, pv: PhamViChiSo) {
		switch (pv.kieu) {
			case "toan-cong-ty":
				return;
			case "bo-phan": {
				const co = await tx.division.findFirst({
					where: { id: pv.id, archivedAt: null },
					select: { id: true },
				});
				if (!co) throw new BadRequestException(T.so.donViKhongCo);
				return;
			}
			case "phong-ban": {
				const co = await tx.department.findFirst({
					where: { id: pv.id, archivedAt: null },
					select: { id: true },
				});
				if (!co) throw new BadRequestException(T.so.donViKhongCo);
				return;
			}
			case "nguoi":
				await this.okr.assertThanhVien(
					tx,
					[pv.id],
					() => T.so.khongPhaiThanhVien,
				);
				return;
		}
	}

	async datNguonKr(userId: string, input: DatNguonKrInput) {
		const quyen = await this.quyenOkr.assertSuaKr(userId, input.keyResultId);
		if (input.loai === "bang-tinh" && !sheetsBat())
			throw new BadRequestException(T.so.sheetsTat);
		const kq = await this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, quyen.objective.cycleId);
			await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${input.keyResultId} FOR UPDATE`;
			const kr = await tx.okrKeyResult.findUniqueOrThrow({
				where: { id: input.keyResultId },
				include: { nguonMay: true, objective: { select: { status: true } } },
			});
			const trangThai = trangThaiMucTieu.parse(kr.objective.status);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			if (trangThai === "cho-duyet")
				throw new BadRequestException(T.dangChoDuyet);
			const congBo = trangThai === "cong-bo";
			const nguon = nguonKr.parse(kr.source);
			if (congBo && nguon !== "tay")
				throw new BadRequestException(T.so.nguonDaKhoa);
			if (input.loai === "crm" && !crmHopKieu(kieuKr.parse(kr.kind)))
				throw new BadRequestException(T.so.crmKhongHopKieu);
			if (input.loai === "crm") await this.kiemPhamVi(tx, input.phamVi);
			const cu = kr.nguonMay ? parseOkrNguon(kr.nguonMay) : null;
			const moi = input.loai === "tay" ? null : cauHinhTu(input);
			const nguonMoi = congBo ? nguon : input.loai;
			const ketQua = {
				id: kr.id,
				doCanh: congBo && moi !== null,
				docSheet: moi?.loai === "bang-tinh",
			};
			if (giongNhau(cu, moi) && nguonMoi === nguon) return ketQua;
			if (moi === null) {
				await tx.okrNguonKr.deleteMany({ where: { keyResultId: kr.id } });
			} else {
				const cot = { ...moi, phamVi: moi.phamVi ?? Prisma.DbNull };
				await tx.okrNguonKr.upsert({
					where: { keyResultId: kr.id },
					create: { keyResultId: kr.id, taoBoiUserId: userId, ...cot },
					update: {
						...cot,
						docLuc: null,
						docGiaTri: null,
						docLoi: null,
						thuLuc: null,
					},
				});
			}
			if (nguonMoi !== nguon)
				await tx.okrKeyResult.update({
					where: { id: kr.id },
					data: { source: nguonMoi },
				});
			await this.okr.vet(
				tx,
				userId,
				"doi-nguon",
				{ objectiveId: kr.objectiveId, keyResultId: kr.id },
				vetNguon(nguon, cu),
				vetNguon(nguonMoi, moi),
				ketQua.doCanh ? T.so.ghiChuDoCanh : null,
			);
			return ketQua;
		});
		if (kq.docSheet) await this.xepDocSheet(kq.id);
		return { id: kq.id, doCanh: kq.doCanh };
	}

	private async xepDocSheet(keyResultId: string) {
		try {
			await this.trigger.okrDocSheet(keyResultId);
		} catch (loi) {
			this.logger.error({
				message: "Không xếp được việc đọc Google Sheets; nhịp mỗi ngày vẫn đọc",
				keyResultId,
				loi: loi instanceof Error ? loi.name : "khong-ro",
			});
		}
	}

	async ghiSoKr(userId: string, input: GhiSoKrInput, now = new Date()) {
		const { nc } = await this.nguCanhCua(userId);
		await this.docKr(input.id, nc);
		const quyen = await this.quyenOkr.assertSuaKr(userId, input.id);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, quyen.objective.cycleId);
			const kr = await tx.okrKeyResult.findFirst({
				where: { id: input.id, objective: dieuKienXemMucTieu(nc) },
				include: {
					nguonMay: true,
					objective: {
						select: {
							status: true,
							cycle: { select: { startsOn: true, endsOn: true } },
						},
					},
				},
			});
			if (!kr) throw new NotFoundException(T.khongThayMucTieu);
			if (trangThaiMucTieu.parse(kr.objective.status) === "da-bo")
				throw new BadRequestException(T.daBo);
			if (kr.nguonMay?.loai !== "api")
				throw new BadRequestException(T.so.khongNhanApi);
			const hom = ngayVN(now);
			if (hom < kr.objective.cycle.startsOn.toISOString().slice(0, 10))
				throw new BadRequestException(T.so.kyChuaToi);
			if (hom > kr.objective.cycle.endsOn.toISOString().slice(0, 10))
				throw new BadRequestException(T.so.kyDaQua);
			const loi = kiemGiaTriTheoKieu(kieuKr.parse(kr.kind), input.giaTri);
			if (loi) throw new BadRequestException(T.capNhat.giaTri[loi]);
			await tx.okrSoChup.create({
				data: {
					keyResultId: kr.id,
					ngay: ngayDb(hom),
					giaTri: input.giaTri,
					nguon: "api",
					tacGiaUserId: userId,
				},
			});
			if (kr.source === "api")
				await tx.okrKeyResult.update({
					where: { id: kr.id },
					data: { currentValue: input.giaTri },
				});
			await this.okr.vet(
				tx,
				userId,
				"ghi-so-api",
				{ objectiveId: kr.objectiveId, keyResultId: kr.id },
				{ currentValue: Number(kr.currentValue) },
				{ currentValue: input.giaTri },
				input.ghiChu ?? null,
			);
			return { id: kr.id, ngay: hom };
		});
	}

	private async tenNguoi(ids: (string | null)[]) {
		const can = [...new Set(ids.filter((id): id is string => id !== null))];
		if (can.length === 0) return new Map<string, string>();
		const rows = await this.db.user.findMany({
			where: { id: { in: can } },
			select: { id: true, name: true },
		});
		return new Map(rows.map((r) => [r.id, r.name]));
	}

	private async docKr(keyResultId: string, nc: NguCanhXem) {
		const kr = await this.db.okrKeyResult.findFirst({
			where: { id: keyResultId, objective: dieuKienXemMucTieu(nc) },
			select: {
				title: true,
				source: true,
				nguonMay: true,
				objective: {
					select: { cycle: { select: { startsOn: true, endsOn: true } } },
				},
			},
		});
		if (!kr) throw new NotFoundException(T.khongThayMucTieu);
		return kr;
	}

	private async nguCanhCua(userId: string) {
		const q = await this.quyenOkr.quyen(userId);
		return { q, nc: this.quyenOkr.nguCanhXem(q, userId) };
	}

	async lichSuSo(userId: string, keyResultId: string) {
		const { nc } = await this.nguCanhCua(userId);
		await this.docKr(keyResultId, nc);
		const rows = await this.db.okrSoChup.findMany({
			where: { keyResultId, keyResult: { objective: dieuKienXemMucTieu(nc) } },
			orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }],
			select: { ngay: true, giaTri: true, nguon: true, tacGiaUserId: true },
		});
		const ten = await this.tenNguoi(rows.map((r) => r.tacGiaUserId));
		return {
			dong: rows.map((r) => ({
				ngay: ngayVN(r.ngay),
				giaTri: Number(r.giaTri),
				nguon: loaiNguonMay.parse(r.nguon),
				tacGia: r.tacGiaUserId ? (ten.get(r.tacGiaUserId) ?? null) : null,
			})),
		};
	}

	async banGhiChiSo(
		userId: string,
		input: BanGhiChiSoInput,
	): Promise<BanGhiChiSoOutput> {
		const { q, nc } = await this.nguCanhCua(userId);
		const kr = await this.docKr(input.keyResultId, nc);
		if (!docDuocPhamVi(q.role, "doi-tac"))
			throw new ForbiddenException(T.so.danhSachDoiTac);
		const coTrang = OKR_SO.banGhi.coTrang;
		const cua = { bo: (input.trang - 1) * coTrang, lay: coTrang };
		const nguonMay = kr.nguonMay ? parseOkrNguon(kr.nguonMay) : null;
		const chup = await this.db.okrSoChup.findFirst({
			where: {
				keyResultId: input.keyResultId,
				keyResult: { objective: dieuKienXemMucTieu(nc) },
				ngay: input.ngay ? ngayDb(input.ngay) : undefined,
			},
			orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }],
		});
		const hang = chup
			? {
					...parseOkrSoChup(chup),
					ngay: ngayVN(chup.ngay),
					giaTri: Number(chup.giaTri),
				}
			: null;
		const loai = hang?.nguon ?? nguonMay?.loai ?? nguonKr.parse(kr.source);
		const rong = {
			tenKr: kr.title,
			loai,
			dinhNghia: null,
			tu: null,
			den: null,
			ngay: hang?.ngay ?? null,
			soDaChup: hang?.giaTri ?? null,
			soTinhLai: null,
			lech: false,
			tong: 0,
			dong: [],
			lanGhi: [],
		};
		if (loai === "api") {
			const cuaApi = {
				keyResultId: input.keyResultId,
				nguon: "api",
			};
			const tong = await this.db.okrSoChup.count({
				where: { ...cuaApi, keyResult: { objective: dieuKienXemMucTieu(nc) } },
			});
			const lan = await this.db.okrSoChup.findMany({
				where: { ...cuaApi, keyResult: { objective: dieuKienXemMucTieu(nc) } },
				orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }],
				skip: cua.bo,
				take: cua.lay,
				select: { ngay: true, giaTri: true, tacGiaUserId: true },
			});
			const ten = await this.tenNguoi(lan.map((r) => r.tacGiaUserId));
			return {
				...rong,
				tong,
				lanGhi: lan.map((r) => ({
					ngay: ngayVN(r.ngay),
					giaTri: Number(r.giaTri),
					nguoi: r.tacGiaUserId ? (ten.get(r.tacGiaUserId) ?? null) : null,
				})),
			};
		}
		if (loai !== "crm") return rong;
		const dn = dinhNghiaTu(hang) ?? dinhNghiaTu(nguonMay);
		if (!dn) return rong;
		const { startsOn, endsOn } = kr.objective.cycle;
		const k = khoangKy(
			startsOn,
			endsOn,
			hang?.ngay ?? input.ngay ?? ngayVN(new Date()),
		);
		const trang = await banGhiChiSo(this.db, dn, k, cua);
		return {
			...rong,
			dinhNghia: dn,
			...ngayKhoang(k),
			ngay: hang?.ngay ?? input.ngay ?? null,
			soTinhLai: trang.tong,
			lech: rong.soDaChup !== null && rong.soDaChup !== trang.tong,
			tong: trang.tong,
			dong: trang.dong,
		};
	}
}
