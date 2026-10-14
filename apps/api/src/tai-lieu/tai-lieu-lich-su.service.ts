import type { Db, Prisma } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import { dieuKienThay } from "@crm/db/tai-lieu-quyen";
import { chuanNfc } from "@crm/validation/tai-lieu";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import {
	BadRequestException,
	ConflictException,
	Injectable,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type { NguoiGoi } from "./quyen";
import type {
	TaiLieuDeXuatTrangInput,
	TaiLieuLichSuOutput,
	TaiLieuPhienBanInput,
	TaiLieuPhienBanOutput,
} from "./tai-lieu.contracts";
import { khongCo, kiemNoiDung } from "./tai-lieu-chung";
import { TAI_LIEU_API } from "./tai-lieu-config";

const T = TAI_LIEU_API.thongDiep;
const NGUOI = { select: { id: true, name: true } } as const;

type Tx = Prisma.TransactionClient;
type LoaiViecTrang = "LUU_TRU" | "KHOI_PHUC";

const TRANG_KHOA = {
	id: true,
	ten: true,
	archivedAt: true,
	banDangDungId: true,
	banDangDung: { select: { noiDung: true } },
} as const;

@Injectable()
export class TaiLieuLichSuService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	private async trangThay(nguoi: NguoiGoi, slug: string) {
		const t = await this.db.taiLieuTrang.findFirst({
			where: { AND: [{ slug }, dieuKienThay(nguoi)] },
			select: {
				id: true,
				slug: true,
				ten: true,
				archivedAt: true,
				banDangDungId: true,
				banDangDung: { select: { so: true, ten: true, noiDung: true } },
			},
		});
		if (!t) throw khongCo();
		return t;
	}

	private async khoaTrang(tx: Tx, nguoi: NguoiGoi, slug: string) {
		const [khoa] = await tx.$queryRaw<{ id: string }[]>`
			SELECT id FROM "taiLieuTrang" WHERE slug = ${slug} FOR UPDATE
		`;
		if (!khoa) throw khongCo();
		const trang = await tx.taiLieuTrang.findFirst({
			where: { AND: [{ id: khoa.id }, dieuKienThay(nguoi)] },
			select: TRANG_KHOA,
		});
		if (!trang) throw khongCo();
		return trang;
	}

	async lichSu(nguoi: NguoiGoi, slug: string): Promise<TaiLieuLichSuOutput> {
		const t = await this.trangThay(nguoi, slug);
		const ban = await this.db.taiLieuPhienBan.findMany({
			where: { trangId: t.id },
			orderBy: { so: "desc" },
			select: {
				id: true,
				so: true,
				ten: true,
				duyetLuc: true,
				duyetBoi: NGUOI,
				deXuat: { select: { taoBoi: NGUOI } },
			},
		});
		return ban.map((b) => ({
			so: b.so,
			ten: b.ten,
			duyetLuc: b.duyetLuc.toISOString(),
			nguoiDuyet: b.duyetBoi,
			nguoiDeXuat: b.deXuat.taoBoi,
			dangDung: b.id === t.banDangDungId,
		}));
	}

	async phienBan(
		nguoi: NguoiGoi,
		input: TaiLieuPhienBanInput,
	): Promise<TaiLieuPhienBanOutput> {
		const t = await this.trangThay(nguoi, input.slug);
		const dangDung = t.banDangDung;
		if (!dangDung) throw khongCo();
		const b = await this.db.taiLieuPhienBan.findUnique({
			where: { trangId_so: { trangId: t.id, so: input.so } },
			select: {
				id: true,
				so: true,
				ten: true,
				noiDung: true,
				duyetLuc: true,
				duyetBoi: NGUOI,
			},
		});
		if (!b) throw khongCo();
		return {
			slug: t.slug,
			tenTrang: t.ten,
			so: b.so,
			ten: b.ten,
			noiDung: b.noiDung,
			duyetLuc: b.duyetLuc.toISOString(),
			nguoiDuyet: b.duyetBoi,
			laBanDangDung: b.id === t.banDangDungId,
			daLuuTru: t.archivedAt !== null,
			dangDung,
		};
	}

	async quayLai(
		nguoi: NguoiGoi,
		input: TaiLieuPhienBanInput,
	): Promise<{ deXuatId: string }> {
		return this.db.$transaction(async (tx) => {
			const trang = await this.khoaTrang(tx, nguoi, input.slug);
			if (trang.archivedAt) throw new BadRequestException(T.daLuuTru);
			const ban = await tx.taiLieuPhienBan.findUnique({
				where: { trangId_so: { trangId: trang.id, so: input.so } },
				select: { id: true, ten: true, noiDung: true },
			});
			const dangDung = trang.banDangDung;
			if (!ban || !dangDung) throw khongCo();
			const noiDung = kiemNoiDung(ban.noiDung);
			if (
				ban.id === trang.banDangDungId ||
				noiDung === chuanHoa(dangDung.noiDung)
			)
				throw new ConflictException(T.chuaDoi);
			return taoDeXuatTaiLieu(tx, {
				trangId: trang.id,
				banGocId: trang.banDangDungId,
				ten: chuanNfc(ban.ten),
				noiDung,
				taoBoiId: nguoi.id,
				suKien: "DE_XUAT",
				tuPhienBanSo: input.so,
			});
		});
	}

	async deXuatLuuTru(
		nguoi: NguoiGoi,
		input: TaiLieuDeXuatTrangInput,
	): Promise<{ deXuatId: string }> {
		return this.deXuatViecTrang(nguoi, input, "LUU_TRU");
	}

	async deXuatKhoiPhuc(
		nguoi: NguoiGoi,
		input: TaiLieuDeXuatTrangInput,
	): Promise<{ deXuatId: string }> {
		return this.deXuatViecTrang(nguoi, input, "KHOI_PHUC");
	}

	private kiemViecTrang(
		trang: { banDangDungId: string | null; archivedAt: Date | null },
		loai: LoaiViecTrang,
	): void {
		if (loai === "LUU_TRU") {
			if (!trang.banDangDungId) throw new BadRequestException(T.chuaTungDuyet);
			if (trang.archivedAt) throw new BadRequestException(T.daLuuTru);
			return;
		}
		if (!trang.archivedAt) throw new BadRequestException(T.chuaLuuTru);
	}

	private async deXuatViecTrang(
		nguoi: NguoiGoi,
		input: TaiLieuDeXuatTrangInput,
		loai: LoaiViecTrang,
	): Promise<{ deXuatId: string }> {
		return this.db.$transaction(async (tx) => {
			const trang = await this.khoaTrang(tx, nguoi, input.slug);
			this.kiemViecTrang(trang, loai);
			const daCo = await tx.taiLieuDeXuat.count({
				where: { trangId: trang.id, trangThai: "CHO_DUYET", loai },
			});
			if (daCo > 0)
				throw new ConflictException(
					loai === "LUU_TRU" ? T.daCoLuuTruCho : T.daCoKhoiPhucCho,
				);
			return taoDeXuatTaiLieu(tx, {
				trangId: trang.id,
				banGocId: trang.banDangDungId,
				ten: trang.ten,
				noiDung: trang.banDangDung?.noiDung ?? "",
				taoBoiId: nguoi.id,
				suKien: "DE_XUAT",
				loai,
				lyDoDeXuat: input.lyDo,
			});
		});
	}
}
