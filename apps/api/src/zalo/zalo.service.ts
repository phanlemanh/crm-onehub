import { canManageConnections } from "@crm/auth";
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
import { docLyDo } from "@crm/validation/zalo-update";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { AgentAccessService } from "../agent/agent-access.service";
import { InjectDatabase } from "../database/database.constants";
import { ZALO_API } from "./zalo.config";
import type { ZaloCuaToi, ZaloXuong } from "./zalo.contracts";
import {
	type NguyenNhanCauNoi,
	ZaloCauNoiService,
} from "./zalo-cau-noi.service";

export const ZALO_THONG_DIEP = {
	zaloChuaDung: "Zalo chưa dùng được cho bạn — hãy nối Zalo trước.",
	slackChuaDung: "Slack chưa dùng được cho bạn — Slack chưa nhận ra bạn.",
	saiDang:
		"Đây không phải Bot Token. Bot Token có dạng <số>:<chuỗi> (vd 1234567890:AbC…), khác Secret Token.",
	cauNoi: {
		"thieu-cau-noi": () =>
			"OneHub Center chưa được nối với dịch vụ nhắc việc. Báo người cài đặt OneHub Center.",
		"khong-toi-duoc": () =>
			"Không gọi được dịch vụ nhắc việc — có thể nó đang tắt hoặc đang khởi động. Thử lại sau ít phút.",
		"sai-khoa": () =>
			"Dịch vụ nhắc việc không nhận khoá của OneHub Center. Báo người cài đặt OneHub Center.",
		"tac-tu-loi": (status?: number) =>
			`Dịch vụ nhắc việc gặp lỗi (mã ${status}). Thử lại; nếu vẫn lỗi, báo người cài đặt OneHub Center.`,
		"sai-khuon": () =>
			"Dịch vụ nhắc việc trả lời theo khuôn OneHub Center không đọc được — có thể hai bên đang chạy hai phiên bản khác nhau. Báo người cài đặt OneHub Center.",
	} satisfies Record<NguyenNhanCauNoi, (status?: number) => string>,
	guiHong: {
		zalo: "Zalo chưa nhận tin thử. Thử lại sau ít phút.",
		slack: "Slack chưa nhận tin thử. Thử lại sau ít phút.",
	},
	chuaCoKenh:
		"Bạn chưa có kênh nào để nhận tin thử — hãy nối Zalo hoặc nhờ quản trị viên ghép Slack.",
	chiQuanTri: "Chỉ quản trị viên thay được bot.",
} as const;

type TrangThaiWebhook = ZaloXuong["webhook"]["trangThai"];

function trangThaiWebhook(
	url: string | null,
	lyDo: string | null,
): TrangThaiWebhook {
	if (url) return "da-dang-ky";
	return docLyDo(lyDo) === "can-https" ? "can-https" : "chua-dang-ky";
}

@Injectable()
export class ZaloService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly access: AgentAccessService,
		private readonly cauNoi: ZaloCauNoiService,
	) {}

	async luuBot(userId: string, token: string | undefined) {
		const role = await this.access.assertMember(userId);
		if (!canManageConnections(role)) {
			throw new ForbiddenException(ZALO_THONG_DIEP.chiQuanTri);
		}
		if (token !== undefined && !ZALO_API.botToken.test(token)) {
			throw new BadRequestException(ZALO_THONG_DIEP.saiDang);
		}
		const ket = await this.cauNoi.datBot(token === undefined ? {} : { token });
		if (!ket.ok) {
			throw new BadRequestException(
				ZALO_THONG_DIEP.cauNoi[ket.nguyenNhan](ket.status),
			);
		}
		if (ket.data.outcome !== "valid") {
			throw new BadRequestException(ket.data.reason);
		}
		return { tenBot: ket.data.tenBot, webhook: ket.data.webhook };
	}

	async guiThu(userId: string) {
		await this.access.assertMember(userId);
		const ket = await this.cauNoi.guiThu(userId);
		if (!ket.ok) {
			throw new BadRequestException(
				ZALO_THONG_DIEP.cauNoi[ket.nguyenNhan](ket.status),
			);
		}
		if (ket.data.kenh === null) {
			throw new BadRequestException(ZALO_THONG_DIEP.chuaCoKenh);
		}
		if (!ket.data.guiDuoc) {
			throw new BadRequestException(ZALO_THONG_DIEP.guiHong[ket.data.kenh]);
		}
		return { kenh: ket.data.kenh };
	}

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
		const role = await this.access.assertMember(userId);
		const canManage = canManageConnections(role);
		const [caiDat, thanhVien] = await Promise.all([
			this.db.appSetting.findUnique({
				where: { id: SETTINGS_ID },
				select: {
					zaloBotName: true,
					zaloPolledAt: true,
					zaloBotToken: true,
					zaloWebhookUrl: true,
					zaloWebhookLyDo: true,
				},
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
		const token = caiDat?.zaloBotToken ?? null;
		const url = caiDat?.zaloWebhookUrl ?? null;
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
			canManage,
			nguonToken: token ? "man-hinh" : caiDat?.zaloBotName ? "env" : null,
			goiToken: canManage && token ? token.slice(-ZALO_API.goiTokenKyTu) : null,
			webhook: {
				trangThai: trangThaiWebhook(url, caiDat?.zaloWebhookLyDo ?? null),
				url,
			},
		};
	}
}
