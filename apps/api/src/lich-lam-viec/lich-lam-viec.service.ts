import { canManageSettings, workspaceRoleOf } from "@crm/auth";
import type { Db } from "@crm/db";
import { docLichLam } from "@crm/db/du-an";
import { themNgayLe } from "@crm/db/du-an-ghi";
import { SETTINGS_ID } from "@crm/db/settings";
import { ngayHan } from "@crm/db/viec";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { dichLoi } from "../viec/viec.service";
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
		await this.db
			.$transaction((tx) =>
				themNgayLe(tx, { nguoiId: userId, ngay: input.ngay, ten: input.ten }),
			)
			.catch(dichLoi);
		return { ok: true };
	}

	async xoaNgayLe(id: string, userId: string): Promise<{ ok: true }> {
		await this.kiem(userId);
		await this.db.ngayNghi.deleteMany({ where: { id } });
		return { ok: true };
	}
}
