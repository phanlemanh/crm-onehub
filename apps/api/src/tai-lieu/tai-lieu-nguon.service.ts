import { createHash, randomUUID } from "node:crypto";
import { type Db, type Prisma, Prisma as PrismaNamespace } from "@crm/db";
import { type KhoNguon, PATHNAME_NGUON } from "@crm/db/blob-nguon";
import { dieuKienThay } from "@crm/db/tai-lieu-quyen";
import {
	type DichNguon,
	type KieuNguonTep,
	NGUON,
	parseKieuNguon,
	parseTrangThaiNguon,
} from "@crm/validation/tai-lieu-nguon";
import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	PreconditionFailedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import type { EnvironmentVariables } from "../config/env.validation";
import { InjectDatabase } from "../database/database.constants";
import { KHO_NGUON, nhanKieu } from "./kho-nguon";
import { kiemPhieu, kyPhieu } from "./phieu-nguon";
import {
	dieuKienSoanLai,
	dieuKienThayNguon,
	type NguoiGoi,
	soanLaiDuoc,
} from "./quyen";
import { TaiLieuService, type TrangMoiSach } from "./tai-lieu.service";
import { khongCo as khongCoTrang } from "./tai-lieu-chung";
import { TAI_LIEU_API } from "./tai-lieu-config";
import type {
	NguonDong,
	TaiLieuNguonNhanInput,
	TaiLieuNguonXinChoInput,
	TrangThaiKho,
} from "./tai-lieu-nguon.contracts";

const T = NGUON.thongDiep;
const DANH_SACH_TOI_DA = 100;

type Tx = Prisma.TransactionClient;

type DichSach =
	| { loai: "moi"; trang: TrangMoiSach }
	| { loai: "cap-nhat"; trangId: string };

const CHON_DONG = {
	id: true,
	tenTep: true,
	kieu: true,
	trangThai: true,
	lyDo: true,
	taiLuc: true,
	taiBoiId: true,
	taiBoi: { select: { id: true, name: true } },
	trang: { select: { slug: true, ten: true, chuTrangId: true } },
	deXuat: {
		select: { id: true },
		orderBy: { createdAt: "desc" },
		take: 1,
	},
} as const satisfies Prisma.TaiLieuNguonSelect;

type HangNguon = Prisma.TaiLieuNguonGetPayload<{ select: typeof CHON_DONG }>;

function khongCo(): NotFoundException {
	return new NotFoundException(T.khongCo);
}

function kieuTuTen(tenTep: string): KieuNguonTep | null {
	const thuong = tenTep.toLowerCase();
	if (thuong.endsWith(NGUON.duoi.docx)) return "docx";
	if (thuong.endsWith(NGUON.duoi.pdf)) return "pdf";
	return null;
}

function laTrung(loi: Error): boolean {
	return (
		loi instanceof PrismaNamespace.PrismaClientKnownRequestError &&
		loi.code === "P2002"
	);
}

@Injectable()
export class TaiLieuNguonService {
	private readonly logger = new Logger(TaiLieuNguonService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(KHO_NGUON) private readonly kho: KhoNguon,
		@Inject(AgentTriggerService) private readonly agent: AgentTriggerService,
		@Inject(TaiLieuService) private readonly taiLieu: TaiLieuService,
		@Inject(ConfigService)
		private readonly config: ConfigService<EnvironmentVariables, true>,
	) {}

	private khoaPhieu(): string {
		const bi = this.config.get("BETTER_AUTH_SECRET", { infer: true });
		return `${TAI_LIEU_API.phieuNguon.tienTo}:${bi}`;
	}

	trangThai(): TrangThaiKho {
		return { bat: this.kho.bat() };
	}

	private canBat(): void {
		if (!this.kho.bat()) throw new PreconditionFailedException(T.tat);
	}

	async xinCho(nguoi: NguoiGoi, input: TaiLieuNguonXinChoInput) {
		this.canBat();
		if (kieuTuTen(input.tenTep) !== input.kieu) {
			throw new BadRequestException(T.saiLoai);
		}
		if (input.kichThuoc === 0) throw new BadRequestException(T.rong);
		if (input.kichThuoc > NGUON.toiDaByte) {
			throw new BadRequestException(T.saiLoai);
		}
		const pathname = PATHNAME_NGUON(randomUUID());
		const ky = await this.kho.kyPut(pathname, {
			kieu: input.kieu,
			toiDa: NGUON.toiDaByte,
		});
		const phieu = kyPhieu(
			this.khoaPhieu(),
			{ userId: nguoi.id, pathname },
			Date.now() + TAI_LIEU_API.phieuNguon.hanMs,
		);
		return { pathname, url: ky.url, hetHan: ky.hetHan, phieu };
	}

	async nhan(nguoi: NguoiGoi, input: TaiLieuNguonNhanInput) {
		this.canBat();
		const cuaNguoiGoi = kiemPhieu(
			this.khoaPhieu(),
			{ userId: nguoi.id, pathname: input.pathname },
			input.phieu,
			Date.now(),
		);
		if (!cuaNguoiGoi) throw new BadRequestException(T.phieuSai);
		const daCo = await this.db.taiLieuNguon.findUnique({
			where: { blobPathname: input.pathname },
			select: { id: true },
		});
		if (daCo) throw new BadRequestException(T.phieuSai);
		let dich: DichSach;
		try {
			dich = await this.kiemDich(nguoi, input.dich);
		} catch (loi) {
			if (
				loi instanceof BadRequestException ||
				loi instanceof NotFoundException
			) {
				await this.xoaNeuMoCoi(input.pathname);
			}
			throw loi;
		}
		try {
			const kq = await this.db.$transaction(
				(tx) => this.nhanTrongKhoa(tx, nguoi, input, dich),
				{ timeout: TAI_LIEU_API.nhanNguon.timeoutMs },
			);
			if (!kq.trung) this.agent.danhThucMaySoan();
			return kq;
		} catch (loi) {
			if (!(loi instanceof Error) || !laTrung(loi)) throw loi;
			const byte = await this.kho.doc(input.pathname);
			const sha256 = byte
				? createHash("sha256").update(byte).digest("hex")
				: null;
			const trung = sha256 ? await this.nguonTheoBam(sha256) : null;
			if (!trung) throw loi;
			await this.xoaNeuMoCoi(input.pathname);
			return { nguonId: trung, trung: true };
		}
	}

	private async khoaDuongLuu(tx: Tx, pathname: string): Promise<void> {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${TAI_LIEU_API.nhanNguon.khoa}:${pathname}`}))`;
	}

	private async nhanTrongKhoa(
		tx: Tx,
		nguoi: NguoiGoi,
		input: TaiLieuNguonNhanInput,
		dich: DichSach,
	): Promise<{ nguonId: string; trung: boolean }> {
		await this.khoaDuongLuu(tx, input.pathname);
		const daCo = await tx.taiLieuNguon.findUnique({
			where: { blobPathname: input.pathname },
			select: { id: true },
		});
		if (daCo) throw new BadRequestException(T.phieuSai);
		const byte = await this.kho.doc(input.pathname);
		if (!byte) throw new BadRequestException(T.chuaTai);
		try {
			const kieu = this.kiemTep(byte);
			const sha256 = createHash("sha256").update(byte).digest("hex");
			const trung = await tx.taiLieuNguon.findUnique({
				where: { sha256 },
				select: { id: true },
			});
			if (trung) {
				await this.kho.xoa(input.pathname);
				return { nguonId: trung.id, trung: true };
			}
			const trangId = await this.trangDich(tx, nguoi, dich);
			const nguon = await tx.taiLieuNguon.create({
				data: {
					sha256,
					tenTep: input.tenTep.normalize("NFC"),
					kieu,
					kichThuoc: byte.length,
					blobPathname: input.pathname,
					taiBoiId: nguoi.id,
					trangId,
				},
				select: { id: true },
			});
			await this.agent.soanTuNguon(nguon.id, tx);
			return { nguonId: nguon.id, trung: false };
		} catch (loi) {
			if (loi instanceof BadRequestException) {
				await this.kho.xoa(input.pathname);
			}
			throw loi;
		}
	}

	private async xoaNeuMoCoi(pathname: string): Promise<void> {
		await this.db.$transaction(
			async (tx) => {
				await this.khoaDuongLuu(tx, pathname);
				const cuaHang = await tx.taiLieuNguon.findUnique({
					where: { blobPathname: pathname },
					select: { id: true },
				});
				if (!cuaHang) await this.kho.xoa(pathname);
			},
			{ timeout: TAI_LIEU_API.nhanNguon.timeoutMs },
		);
	}

	private kiemTep(byte: Uint8Array): KieuNguonTep {
		if (byte.length === 0) throw new BadRequestException(T.rong);
		if (byte.length > NGUON.toiDaByte) {
			throw new BadRequestException(T.saiLoai);
		}
		const kieu = nhanKieu(byte);
		if (!kieu) throw new BadRequestException(T.saiLoai);
		return kieu;
	}

	private async kiemDich(nguoi: NguoiGoi, dich: DichNguon): Promise<DichSach> {
		if (dich.loai === "moi") {
			const trang = await this.taiLieu.kiemTrangMoi(nguoi, {
				ten: dich.ten,
				loai: dich.loaiTrang,
				chuTrangId: dich.chuTrangId,
				departmentId: dich.departmentId ?? null,
			});
			return { loai: "moi", trang };
		}
		const trang = await this.db.taiLieuTrang.findFirst({
			where: { AND: [{ slug: dich.slug }, dieuKienThay(nguoi)] },
			select: { id: true, banDangDungId: true, archivedAt: true },
		});
		if (!trang) throw khongCoTrang();
		if (!trang.banDangDungId) throw new BadRequestException(T.dichChuaDung);
		if (trang.archivedAt) {
			throw new BadRequestException(TAI_LIEU_API.thongDiep.daLuuTru);
		}
		return { loai: "cap-nhat", trangId: trang.id };
	}

	private async nguonTheoBam(sha256: string): Promise<string | null> {
		const n = await this.db.taiLieuNguon.findUnique({
			where: { sha256 },
			select: { id: true },
		});
		return n?.id ?? null;
	}

	private async trangDich(
		tx: Tx,
		nguoi: NguoiGoi,
		dich: DichSach,
	): Promise<string> {
		if (dich.loai === "cap-nhat") return dich.trangId;
		const { id } = await this.taiLieu.taoTrangTrong(tx, nguoi, dich.trang);
		return id;
	}

	private dong(nguoi: NguoiGoi, h: HangNguon): NguonDong {
		return {
			id: h.id,
			tenTep: h.tenTep,
			kieu: parseKieuNguon(h.kieu),
			trangThai: parseTrangThaiNguon(h.trangThai),
			lyDo: h.lyDo,
			taiLuc: h.taiLuc,
			taiBoi: { id: h.taiBoi.id, name: h.taiBoi.name },
			trang: { slug: h.trang.slug, ten: h.trang.ten },
			deXuatId: h.deXuat[0]?.id ?? null,
			coTheSoanLai:
				h.trangThai === "LOI" &&
				soanLaiDuoc(nguoi, { taiBoiId: h.taiBoiId, trang: h.trang }),
		};
	}

	async list(nguoi: NguoiGoi): Promise<{ rows: NguonDong[] }> {
		const hang = await this.db.taiLieuNguon.findMany({
			where: dieuKienThayNguon(nguoi),
			select: CHON_DONG,
			orderBy: [{ taiLuc: "desc" }, { id: "asc" }],
			take: DANH_SACH_TOI_DA,
		});
		return { rows: hang.map((h) => this.dong(nguoi, h)) };
	}

	private async timThay(nguoi: NguoiGoi, id: string) {
		const h = await this.db.taiLieuNguon.findFirst({
			where: { AND: [{ id }, dieuKienThayNguon(nguoi)] },
			select: { ...CHON_DONG, chu: true, blobPathname: true },
		});
		if (!h) throw khongCo();
		return h;
	}

	async get(nguoi: NguoiGoi, id: string) {
		const h = await this.timThay(nguoi, id);
		return { ...this.dong(nguoi, h), chu: h.chu };
	}

	async taiVe(nguoi: NguoiGoi, id: string) {
		this.canBat();
		const h = await this.timThay(nguoi, id);
		const ky = await this.kho.kyGet(h.blobPathname, NGUON.giayTaiVe);
		return { url: ky.url, hetHan: ky.hetHan };
	}

	async soanLai(nguoi: NguoiGoi, id: string): Promise<{ ok: true }> {
		const h = await this.db.taiLieuNguon.findFirst({
			where: { AND: [{ id }, dieuKienSoanLai(nguoi)] },
			select: { id: true, trangThai: true },
		});
		if (!h) throw khongCo();
		if (["CHO_DOC", "CHO_SOAN", "DANG_SOAN"].includes(h.trangThai)) {
			throw new ConflictException(T.dangSoan);
		}
		if (h.trangThai !== "LOI") {
			throw new ConflictException(T.khongCanSoanLai);
		}
		await this.db.$transaction(async (tx) => {
			await tx.taiLieuNguon.update({
				where: { id: h.id },
				data: { trangThai: "CHO_DOC", lyDo: null },
			});
			await this.agent.soanTuNguon(h.id, tx);
		});
		this.logger.log({ message: "Source redraft queued", nguonId: h.id });
		this.agent.danhThucMaySoan();
		return { ok: true };
	}
}
