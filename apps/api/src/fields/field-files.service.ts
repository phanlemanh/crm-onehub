import { createHash, randomUUID } from "node:crypto";
import { type Db, type Prisma, Prisma as PrismaNamespace } from "@crm/db";
import { donChoXoa, ghiChoXoa } from "@crm/db/blob-cho-xoa";
import { type KhoTepTruong, PATHNAME_TEP } from "@crm/db/blob-tep-truong";
import {
	type FieldEntityName,
	type RecordIdColumn,
	recordColumn,
} from "@crm/db/fields";
import { KIEU_TEP, kieuTheoTen, nhanKieuTep } from "@crm/validation/kieu-tep";
import { TEP_TRUONG } from "@crm/validation/tep-truong";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	Optional,
	PreconditionFailedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { EnvironmentVariables } from "../config/env.validation";
import { InjectDatabase } from "../database/database.constants";
import { kiemPhieu, kyPhieu } from "../tai-lieu/phieu-nguon";
import type {
	FieldFileCompleteInput,
	FieldFileRequestUploadInput,
} from "./field-files.contracts";
import { FIELD_FILES_CONFIG } from "./field-files-config";
import type { NguoiGoiTep } from "./field-files-quyen";
import { KHO_TEP } from "./kho-tep";
import { LUAT_TEP, LUAT_TEP_THAT, type LuatTep } from "./luat-tep";

const T = TEP_TRUONG.thongDiep;

type Tx = Prisma.TransactionClient;
type Client = Db | Tx;

type ODich = { fieldId: string; cot: RecordIdColumn };

class TuChoiNoiDung extends BadRequestException {}

class PhieuSai extends BadRequestException {
	constructor() {
		super(T.phieuSai);
	}
}

function laTrung(loi: unknown): boolean {
	return (
		loi instanceof PrismaNamespace.PrismaClientKnownRequestError &&
		loi.code === "P2002"
	);
}

async function banGhiCua(
	client: Client,
	entity: FieldEntityName,
	recordId: string,
): Promise<{ archivedAt: Date | null } | null> {
	const chon = { where: { id: recordId }, select: { archivedAt: true } };
	if (entity === "DEAL") return client.deal.findUnique(chon);
	if (entity === "COMPANY") return client.company.findUnique(chon);
	return client.contact.findUnique(chon);
}

@Injectable()
export class FieldFilesService {
	private readonly logger = new Logger(FieldFilesService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(KHO_TEP) private readonly kho: KhoTepTruong,
		@Optional()
		@Inject(LUAT_TEP)
		private readonly luat: LuatTep = LUAT_TEP_THAT,
		@Inject(ConfigService)
		private readonly config: ConfigService<EnvironmentVariables, true>,
	) {}

	status() {
		return { bat: this.kho.bat() };
	}

	private canBat(): void {
		if (!this.kho.bat()) throw new PreconditionFailedException(T.tat);
	}

	private khoaPhieu(): string {
		const bi = this.config.get("BETTER_AUTH_SECRET", { infer: true });
		return `${FIELD_FILES_CONFIG.phieu.tienTo}:${bi}`;
	}

	private async oDich(
		client: Client,
		input: { entity: FieldEntityName; recordId: string; fieldKey: string },
	): Promise<ODich> {
		const field = await client.fieldDefinition.findUnique({
			where: { entity_key: { entity: input.entity, key: input.fieldKey } },
			select: { id: true, type: true, archivedAt: true },
		});
		if (!field || field.archivedAt !== null || field.type !== "FILE") {
			throw new TuChoiNoiDung(T.khongNhanTep);
		}
		const banGhi = await banGhiCua(client, input.entity, input.recordId);
		if (!banGhi) throw new NotFoundException(T.khongCoBanGhi);
		if (banGhi.archivedAt !== null) throw new TuChoiNoiDung(T.luuTru);
		return { fieldId: field.id, cot: recordColumn(input.entity) };
	}

	private demTep(client: Client, o: ODich, recordId: string): Promise<number> {
		return client.fieldFile.count({
			where: { fieldId: o.fieldId, [o.cot]: recordId },
		});
	}

	async requestUpload(nguoi: NguoiGoiTep, input: FieldFileRequestUploadInput) {
		this.canBat();
		const o = await this.oDich(this.db, input);
		if (kieuTheoTen(input.tenTep) !== input.kieu) {
			throw new BadRequestException(T.saiKieu);
		}
		if (input.kichThuoc === 0) throw new BadRequestException(T.rong);
		if (input.kichThuoc > TEP_TRUONG.toiDaByte) {
			throw new BadRequestException(T.quaCo);
		}
		if (
			(await this.demTep(this.db, o, input.recordId)) >= TEP_TRUONG.toiDaTepMoiO
		) {
			throw new BadRequestException(T.day);
		}
		const pathname = PATHNAME_TEP(randomUUID());
		const ky = await this.kho.kyPut(pathname, {
			mime: KIEU_TEP[input.kieu].mime,
			toiDa: TEP_TRUONG.toiDaByte,
		});
		const hetHanPhieu = Date.now() + FIELD_FILES_CONFIG.phieu.hanMs;
		const phieu = kyPhieu(
			this.khoaPhieu(),
			{ userId: nguoi.id, pathname },
			hetHanPhieu,
		);
		await ghiChoXoa(this.db, [
			{
				pathname,
				xoaSau: new Date(hetHanPhieu),
				fieldId: o.fieldId,
				banGhiId: input.recordId,
				userId: nguoi.id,
			},
		]);
		return { pathname, url: ky.url, hetHan: ky.hetHan, phieu };
	}

	async complete(nguoi: NguoiGoiTep, input: FieldFileCompleteInput) {
		this.canBat();
		const cuaNguoiGoi = kiemPhieu(
			this.khoaPhieu(),
			{ userId: nguoi.id, pathname: input.pathname },
			input.phieu,
			Date.now(),
		);
		if (!cuaNguoiGoi) {
			await this.boTaiCuaNguoiGoi(nguoi, input.pathname);
			throw new BadRequestException(T.phieuSai);
		}

		try {
			const kq = await this.db.$transaction(
				(tx) => this.nhanTrongKhoa(tx, nguoi, input),
				{ timeout: FIELD_FILES_CONFIG.nhan.timeoutMs },
			);
			if (kq.trung) await this.donNgay(input.pathname);
			return kq;
		} catch (loi) {
			if (laTrung(loi)) {
				const trung = await this.tepTrungSauDua(input);
				if (trung) {
					await this.boTai(input.pathname);
					return { tepId: trung, trung: true };
				}
			}
			if (loi instanceof TuChoiNoiDung) await this.boTai(input.pathname);
			else if (loi instanceof PhieuSai) {
				await this.boTaiCuaNguoiGoi(nguoi, input.pathname);
			}
			throw loi;
		}
	}

	private async khoaDuongLuu(tx: Tx, pathname: string): Promise<void> {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${FIELD_FILES_CONFIG.nhan.khoa}:${pathname}`}))`;
	}

	private async nhanTrongKhoa(
		tx: Tx,
		nguoi: NguoiGoiTep,
		input: FieldFileCompleteInput,
	): Promise<{ tepId: string; trung: boolean }> {
		await this.khoaDuongLuu(tx, input.pathname);
		const cho = await tx.blobChoXoa.findUnique({
			where: { pathname: input.pathname },
		});
		if (!cho || cho.userId !== nguoi.id) throw new PhieuSai();
		const o = await this.oDich(tx, input);
		if (cho.fieldId !== o.fieldId || cho.banGhiId !== input.recordId) {
			throw new PhieuSai();
		}
		const byte = await this.kho.doc(input.pathname);
		if (!byte) throw new BadRequestException(T.chuaTai);
		if (byte.length === 0) throw new TuChoiNoiDung(T.rong);
		if (byte.length > TEP_TRUONG.toiDaByte) throw new TuChoiNoiDung(T.quaCo);
		const nhan = nhanKieuTep(byte);
		if ("loi" in nhan) {
			throw new TuChoiNoiDung(nhan.loi === "macro" ? T.macro : T.saiKieu);
		}
		const sha256 = createHash("sha256").update(byte).digest("hex");
		const trung = await tx.fieldFile.findFirst({
			where: { fieldId: o.fieldId, [o.cot]: input.recordId, sha256 },
			select: { id: true },
		});
		if (trung) {
			await ghiChoXoa(tx, [{ pathname: input.pathname, xoaSau: new Date() }]);
			return { tepId: trung.id, trung: true };
		}
		if ((await this.demTep(tx, o, input.recordId)) >= TEP_TRUONG.toiDaTepMoiO) {
			throw new TuChoiNoiDung(T.day);
		}
		const tep = await tx.fieldFile.create({
			data: {
				fieldId: o.fieldId,
				[o.cot]: input.recordId,
				tenTep: input.tenTep.normalize("NFC"),
				kieu: nhan.kieu,
				kichThuoc: byte.length,
				sha256,
				blobPathname: input.pathname,
				taiBoiId: nguoi.id,
			},
			select: { id: true },
		});
		await tx.blobChoXoa.deleteMany({ where: { pathname: input.pathname } });
		return { tepId: tep.id, trung: false };
	}

	private async tepTrungSauDua(
		input: FieldFileCompleteInput,
	): Promise<string | null> {
		const byte = await this.kho.doc(input.pathname);
		if (!byte) return null;
		const sha256 = createHash("sha256").update(byte).digest("hex");
		const cot = recordColumn(input.entity);
		const field = await this.db.fieldDefinition.findUnique({
			where: { entity_key: { entity: input.entity, key: input.fieldKey } },
			select: { id: true },
		});
		if (!field) return null;
		const trung = await this.db.fieldFile.findFirst({
			where: { fieldId: field.id, [cot]: input.recordId, sha256 },
			select: { id: true },
		});
		return trung?.id ?? null;
	}

	private async boTai(pathname: string): Promise<void> {
		const cuaHang = await this.db.fieldFile.findUnique({
			where: { blobPathname: pathname },
			select: { id: true },
		});
		if (cuaHang) return;
		await ghiChoXoa(this.db, [{ pathname, xoaSau: new Date() }]);
		await this.donNgay(pathname);
	}

	private async boTaiCuaNguoiGoi(
		nguoi: NguoiGoiTep,
		pathname: string,
	): Promise<void> {
		const cho = await this.db.blobChoXoa.findUnique({ where: { pathname } });
		if (!cho || cho.userId !== nguoi.id) return;
		await this.boTai(pathname);
	}

	private async donNgay(pathname: string): Promise<void> {
		if (!this.kho.bat()) return;
		const kq = await donChoXoa(this.db, this.kho, {
			toiDa: 1,
			pathnames: [pathname],
		});
		if (kq.hong.length > 0) {
			this.logger.warn({
				message: "Field file blob not deleted, left for the daily sweep",
				pathname,
			});
		}
	}

	async downloadUrl(nguoi: NguoiGoiTep, tepId: string) {
		const tep = await this.db.fieldFile.findUnique({
			where: { id: tepId },
			select: {
				blobPathname: true,
				fieldId: true,
				companyId: true,
				contactId: true,
				dealId: true,
				company: { select: { ownerId: true } },
				contact: { select: { ownerId: true } },
				deal: { select: { ownerId: true } },
			},
		});
		if (!tep) throw new NotFoundException(T.khongCoTep);
		const phuTrachId =
			(tep.deal ?? tep.company ?? tep.contact)?.ownerId ?? null;
		const vet = {
			tepId,
			fieldId: tep.fieldId,
			recordId: tep.dealId ?? tep.companyId ?? tep.contactId,
			userId: nguoi.id,
			role: nguoi.role,
			laPhuTrach: phuTrachId !== null && phuTrachId === nguoi.id,
		};
		const quyen = this.luat.quyenMoTep({
			vai: nguoi.role,
			userId: nguoi.id,
			phuTrachId,
		});
		if (!quyen.coTheMo) {
			this.logger.log({
				message: "Field file open refused",
				...vet,
				lyDo: quyen.lyDo,
			});
			throw new ForbiddenException(
				quyen.lyDo === "chua-co-phu-trach"
					? T.chuaPhuTrach
					: quyen.lyDo === "khong-phu-trach"
						? T.khongPhuTrach
						: T.khongMo,
			);
		}
		this.canBat();
		const ky = await this.kho.kyGet(tep.blobPathname, TEP_TRUONG.taiVeGiay);
		this.logger.log({ message: "Field file opened", ...vet });
		return { url: ky.url, hetHan: ky.hetHan };
	}

	async remove(nguoi: NguoiGoiTep, tepId: string) {
		const tep = await this.db.fieldFile.findUnique({
			where: { id: tepId },
			select: {
				id: true,
				fieldId: true,
				blobPathname: true,
				taiBoiId: true,
				companyId: true,
				contactId: true,
				dealId: true,
				company: { select: { archivedAt: true, ownerId: true } },
				contact: { select: { archivedAt: true, ownerId: true } },
				deal: { select: { archivedAt: true, ownerId: true } },
			},
		});
		if (!tep) throw new NotFoundException(T.khongCoTep);
		const banGhi = tep.deal ?? tep.company ?? tep.contact;
		if (banGhi?.archivedAt) throw new BadRequestException(T.luuTru);
		if (
			!this.luat.coTheXoaTep({
				vai: nguoi.role,
				userId: nguoi.id,
				phuTrachId: banGhi?.ownerId ?? null,
				taiBoiId: tep.taiBoiId,
			})
		) {
			throw new ForbiddenException(T.khongXoa);
		}
		const recordId = tep.dealId ?? tep.companyId ?? tep.contactId;

		await this.db.$transaction(async (tx) => {
			await ghiChoXoa(tx, [
				{
					pathname: tep.blobPathname,
					xoaSau: new Date(),
					fieldId: tep.fieldId,
					banGhiId: recordId,
					userId: nguoi.id,
				},
			]);
			await tx.fieldFile.delete({ where: { id: tep.id } });
		});

		this.logger.log({
			message: "Field file removed",
			fieldId: tep.fieldId,
			recordId,
			tepId: tep.id,
			userId: nguoi.id,
		});

		await this.donNgay(tep.blobPathname);
		return { tepId: tep.id };
	}
}
