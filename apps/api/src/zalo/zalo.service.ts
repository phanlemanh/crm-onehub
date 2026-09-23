import type { Db } from "@crm/db";
import { kenhSeDungCua, type UuTien } from "@crm/db/kenh-thong-bao";
import { SETTINGS_ID } from "@crm/db/settings";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	goLienKet,
	taoMaLienKet,
	trangThaiLienKet,
	ZALO_LIEN_KET,
} from "@crm/db/zalo-lien-ket";
import { BadRequestException, Injectable } from "@nestjs/common";
import { AgentAccessService } from "../agent/agent-access.service";
import { InjectDatabase } from "../database/database.constants";
import type { ZaloCuaToi, ZaloXuong } from "./zalo.contracts";

export const ZALO_THONG_DIEP = {
	zaloChuaDung: "Zalo chưa dùng được cho bạn — hãy nối Zalo trước.",
	slackChuaDung: "Slack chưa dùng được cho bạn — Slack chưa nhận ra bạn.",
} as const;

@Injectable()
export class ZaloService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly access: AgentAccessService,
	) {}

	async taoMa(userId: string) {
		await this.access.assertMember(userId);
		return taoMaLienKet(this.db, userId);
	}

	async go(userId: string) {
		await this.access.assertMember(userId);
		await goLienKet(this.db, userId);
		return { ok: true as const };
	}

	async luuUuTien(userId: string, channel: UuTien) {
		await this.access.assertMember(userId);
		const k = await kenhSeDungCua(this.db, userId, { coToken: true });
		if (channel === "ZALO" && !k.zaloDuoc) {
			throw new BadRequestException(ZALO_THONG_DIEP.zaloChuaDung);
		}
		if (channel === "SLACK" && !k.slackDuoc) {
			throw new BadRequestException(ZALO_THONG_DIEP.slackChuaDung);
		}
		await this.db.notificationPreference.upsert({
			where: { userId },
			create: { userId, channel },
			update: { channel },
		});
		return { channel };
	}

	async cuaToi(userId: string, now: Date = new Date()): Promise<ZaloCuaToi> {
		await this.access.assertMember(userId);
		const [k, lienKet, caiDat] = await Promise.all([
			kenhSeDungCua(this.db, userId, { coToken: true }),
			trangThaiLienKet(this.db, userId, now),
			this.db.appSetting.findUnique({
				where: { id: SETTINGS_ID },
				select: { zaloBotName: true },
			}),
		]);
		return {
			zaloBat: k.zaloBat,
			tenBot: caiDat?.zaloBotName ?? null,
			lienKet,
			uuTien: k.uuTien,
			zaloDuoc: k.zaloDuoc,
			slackDuoc: k.slackDuoc,
			kenhSeDung: k.kenh,
			lech: k.lech,
		};
	}

	async xuong(userId: string, now: Date = new Date()): Promise<ZaloXuong> {
		await this.access.assertMember(userId);
		const [caiDat, thanhVien] = await Promise.all([
			this.db.appSetting.findUnique({
				where: { id: SETTINGS_ID },
				select: { zaloBotName: true, zaloPolledAt: true },
			}),
			this.db.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: {
					user: {
						select: {
							id: true,
							name: true,
							zaloLink: { select: { zaloDisplayName: true } },
						},
					},
				},
				orderBy: { user: { name: "asc" } },
			}),
		]);
		const nguoi = thanhVien.map(({ user }) => ({
			id: user.id,
			ten: user.name,
			tenZalo: user.zaloLink?.zaloDisplayName ?? null,
		}));
		const pollCuoi = caiDat?.zaloPolledAt ?? null;
		return {
			bat: Boolean(caiDat?.zaloBotName),
			tenBot: caiDat?.zaloBotName ?? null,
			pollCuoi,
			im:
				pollCuoi !== null &&
				now.getTime() - pollCuoi.getTime() > ZALO_LIEN_KET.imSauMs,
			daNoi: nguoi.filter((n) => n.tenZalo !== null).length,
			tong: nguoi.length,
			nguoi,
		};
	}
}
