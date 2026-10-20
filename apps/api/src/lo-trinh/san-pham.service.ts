import { canManageSettings, WORKSPACE_ID, workspaceRoleOf } from "@crm/auth";
import type { Db } from "@crm/db";
import {
	danhBaSanPham,
	datNguoiXem,
	khoiPhucSanPham,
	luuTruSanPham,
	nguoiXemCua,
	sanPhamXemDuoc,
	suaSanPham,
	taoSanPham,
	timSanPham,
	xoaSanPham,
	xoaVinhVienSanPham,
} from "@crm/db/san-pham-lo-trinh";
import {
	LO_TRINH_SAN_PHAM,
	maTuTen,
	type SanPhamKhai,
} from "@crm/validation/san-pham-lo-trinh";
import { toWorkspaceRole } from "@crm/validation/vai-workspace";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type { SanPhamDanhSach, SanPhamHang } from "./san-pham.contracts";
import { SAN_PHAM_API } from "./san-pham-config";

const M = SAN_PHAM_API.messages;

type HangDanhBa = Awaited<ReturnType<typeof danhBaSanPham>>[number];

@Injectable()
export class SanPhamLoTrinhService {
	private readonly logger = new Logger(SanPhamLoTrinhService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	private async quanTri(userId: string): Promise<boolean> {
		return canManageSettings(await workspaceRoleOf(userId));
	}

	private async canQuanTri(userId: string): Promise<void> {
		if (!(await this.quanTri(userId)))
			throw new ForbiddenException(M.forbidden);
	}

	private async canCo(ma: string) {
		if (ma === LO_TRINH_SAN_PHAM.nguonCrm)
			throw new BadRequestException(M.maCrm);
		const sp = await timSanPham(this.db, ma);
		if (!sp) throw new NotFoundException(M.khongCo);
		return sp;
	}

	private async hang(ds: HangDanhBa[]): Promise<SanPhamHang[]> {
		const banChup = await this.db.banChupLoTrinh.findMany({
			where: { nguon: { in: ds.map((d) => d.ma) } },
			select: { nguon: true, layLuc: true },
		});
		const layLuc = new Map(banChup.map((b) => [b.nguon, b.layLuc]));
		return ds.map((d) => ({
			ma: d.ma,
			ten: d.ten,
			kho: d.kho,
			nhanh: d.nhanh,
			duongTep: d.duongTep,
			trangThaiLay: d.trangThaiLay,
			chiTietLay: d.chiTietLay,
			layLuc: layLuc.get(d.ma)?.toISOString() ?? null,
			phienBanKhuon: d.phienBanKhuon,
			coLichSu: d.layDauLuc !== null,
			nguonDoi: d.nguonDoiLuc !== null,
		}));
	}

	async danhSach(userId: string): Promise<SanPhamDanhSach> {
		const vai = await workspaceRoleOf(userId);
		const quanTri = canManageSettings(vai);
		const tatCa = await danhBaSanPham(this.db, { daLuuTru: false });
		if (quanTri) return { quanTri, sanPham: await this.hang(tatCa) };
		const thay = new Set(
			(await sanPhamXemDuoc(this.db, { userId, vai })).map((s) => s.ma),
		);
		return {
			quanTri,
			sanPham: await this.hang(tatCa.filter((s) => thay.has(s.ma))),
		};
	}

	async daLuuTru(userId: string): Promise<SanPhamHang[]> {
		await this.canQuanTri(userId);
		return this.hang(await danhBaSanPham(this.db, { daLuuTru: true }));
	}

	async nguoiXem(userId: string, ma: string) {
		await this.canQuanTri(userId);
		await this.canCo(ma);
		const [thanhVien, chon] = await Promise.all([
			this.db.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: {
					userId: true,
					role: true,
					user: { select: { name: true, email: true } },
				},
				orderBy: { createdAt: "asc" },
			}),
			nguoiXemCua(this.db, ma),
		]);
		const daChon = new Set(chon);
		return thanhVien.map((t) => {
			const vai = toWorkspaceRole(t.role);
			const luonThay = canManageSettings(vai);
			return {
				userId: t.userId,
				ten: t.user.name || t.user.email,
				vai,
				chon: luonThay || daChon.has(t.userId),
				luonThay,
			};
		});
	}

	async tao(userId: string, vao: SanPhamKhai): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		const ma = maTuTen(vao.ten);
		if (ma === "") throw new BadRequestException(M.maRong);
		if (ma === LO_TRINH_SAN_PHAM.nguonCrm)
			throw new BadRequestException(M.maCrm);
		if (await timSanPham(this.db, ma)) throw new BadRequestException(M.maTrung);
		await taoSanPham(this.db, { ...vao, ma, taoBoiId: userId });
		this.logger.log(`san-pham tao ${ma} boi ${userId}`);
		return { ma };
	}

	async sua(
		userId: string,
		vao: Partial<SanPhamKhai> & { ma: string },
	): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		const { ma, ...doi } = vao;
		await this.canCo(ma);
		const { nguonDoi } = await suaSanPham(this.db, ma, doi, new Date());
		this.logger.log(`san-pham sua ${ma} nguonDoi=${nguonDoi} boi ${userId}`);
		return { ma };
	}

	async datNguoiXem(
		userId: string,
		vao: { ma: string; userIds: string[] },
	): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		await this.canCo(vao.ma);
		const thanhVien = await this.db.member.count({
			where: { organizationId: WORKSPACE_ID, userId: { in: vao.userIds } },
		});
		if (thanhVien !== new Set(vao.userIds).size)
			throw new BadRequestException(M.khongPhaiThanhVien);
		await datNguoiXem(this.db, vao.ma, vao.userIds);
		return { ma: vao.ma };
	}

	async luuTru(userId: string, ma: string): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		await this.canCo(ma);
		await luuTruSanPham(this.db, ma, new Date());
		return { ma };
	}

	async khoiPhuc(userId: string, ma: string): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		await this.canCo(ma);
		if (!(await khoiPhucSanPham(this.db, ma)))
			throw new BadRequestException(M.chuaLuuTru);
		return { ma };
	}

	async xoa(userId: string, ma: string): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		await this.canCo(ma);
		if (!(await xoaSanPham(this.db, ma)))
			throw new BadRequestException(M.coLichSu);
		this.logger.log(`san-pham xoa ${ma} boi ${userId}`);
		return { ma };
	}

	async xoaVinhVien(userId: string, ma: string): Promise<{ ma: string }> {
		await this.canQuanTri(userId);
		await this.canCo(ma);
		if (!(await xoaVinhVienSanPham(this.db, ma)))
			throw new BadRequestException(M.chuaLuuTru);
		this.logger.log(`san-pham xoa-vinh-vien ${ma} boi ${userId}`);
		return { ma };
	}
}
