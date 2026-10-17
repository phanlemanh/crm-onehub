import { canManageSettings, workspaceRoleOf } from "@crm/auth";
import type { Db } from "@crm/db";
import { DU_AN, docLichLam } from "@crm/db/du-an";
import { SETTINGS_ID } from "@crm/db/settings";
import { ngayHan } from "@crm/db/viec";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type { LichLamViecOutput } from "./lich-lam-viec.contracts";

const KHONG_DU_QUYEN = "Chỉ chủ và quản trị đổi được lịch làm việc.";

@Injectable()
export class LichLamViecService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	private async kiem(userId: string): Promise<void> {
		if (!canManageSettings(await workspaceRoleOf(userId))) {
			throw new ForbiddenException(KHONG_DU_QUYEN);
		}
	}

	async get(userId: string): Promise<LichLamViecOutput> {
		const [lich, le] = await Promise.all([
			docLichLam(this.db),
			this.db.ngayNghi.findMany({
				orderBy: { ngay: "asc" },
				select: { id: true, ngay: true, ten: true },
			}),
		]);
		return {
			ngayNghiTuan: [...lich.ngayNghiTuan],
			ngayLe: le.map((h) => ({ id: h.id, ngay: ngayHan(h.ngay), ten: h.ten })),
			sua: canManageSettings(await workspaceRoleOf(userId)),
		};
	}

	async datNgayNghiTuan(
		ngayNghiTuan: number[],
		userId: string,
	): Promise<{ ok: true }> {
		await this.kiem(userId);
		const ds = [...new Set(ngayNghiTuan)].sort();
		await this.db.appSetting.upsert({
			where: { id: SETTINGS_ID },
			create: { id: SETTINGS_ID, ngayNghiTuan: ds },
			update: { ngayNghiTuan: ds },
		});
		return { ok: true };
	}

	async themNgayLe(
		input: { ngay: Date; ten: string },
		userId: string,
	): Promise<{ ok: true }> {
		await this.kiem(userId);
		const [trung, dem] = await Promise.all([
			this.db.ngayNghi.findUnique({
				where: { ngay: input.ngay },
				select: { id: true },
			}),
			this.db.ngayNghi.count(),
		]);
		if (trung) throw new BadRequestException(DU_AN.thongDiep.ngayLeTrung);
		if (dem >= DU_AN.ngayLeToiDa) {
			throw new BadRequestException(`Tối đa ${DU_AN.ngayLeToiDa} ngày lễ.`);
		}
		await this.db.ngayNghi.create({
			data: { ngay: input.ngay, ten: input.ten, taoBoiId: userId },
		});
		return { ok: true };
	}

	async xoaNgayLe(id: string, userId: string): Promise<{ ok: true }> {
		await this.kiem(userId);
		await this.db.ngayNghi.deleteMany({ where: { id } });
		return { ok: true };
	}
}
