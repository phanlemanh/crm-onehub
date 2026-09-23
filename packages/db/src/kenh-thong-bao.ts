import type { Db } from "./client";
import { SETTINGS_ID } from "./settings";

export const UU_TIEN = ["AUTO", "ZALO", "SLACK"] as const;
export type UuTien = (typeof UU_TIEN)[number];
export type Kenh = "zalo" | "slack";
export type LuaChonKenh = { kenh: Kenh | null; lech: boolean };

export function chonKenh(
	uuTien: UuTien,
	zaloDuoc: boolean,
	slackDuoc: boolean,
): LuaChonKenh {
	if (uuTien === "SLACK") {
		if (slackDuoc) return { kenh: "slack", lech: false };
		return zaloDuoc
			? { kenh: "zalo", lech: true }
			: { kenh: null, lech: false };
	}
	if (zaloDuoc) return { kenh: "zalo", lech: false };
	if (slackDuoc) return { kenh: "slack", lech: uuTien === "ZALO" };
	return { kenh: null, lech: false };
}

export type KenhSeDung = LuaChonKenh & {
	uuTien: UuTien;
	zaloBat: boolean;
	zaloDuoc: boolean;
	slackDuoc: boolean;
	slackUserId: string | null;
	zaloUserId: string | null;
};

export async function kenhSeDungCua(
	db: Db,
	userId: string,
	chon: { coToken: boolean },
): Promise<KenhSeDung> {
	const [uu, lienKet, caiDat, slack, khop] = await Promise.all([
		db.notificationPreference.findUnique({ where: { userId } }),
		db.zaloLink.findUnique({ where: { crmUserId: userId } }),
		db.appSetting.findUnique({
			where: { id: SETTINGS_ID },
			select: { zaloBotName: true },
		}),
		db.account.findFirst({
			where: { providerId: "slack", accessToken: { not: null } },
			select: { id: true },
		}),
		db.slackMemberMatch.findUnique({
			where: { crmUserId: userId },
			select: { slackUserId: true },
		}),
	]);
	const uuTien: UuTien = uu?.channel ?? "AUTO";
	const zaloBat = Boolean(caiDat?.zaloBotName);
	const zaloDuoc = chon.coToken && zaloBat && lienKet !== null;
	const slackUserId = khop?.slackUserId ?? null;
	const slackDuoc = slack !== null && slackUserId !== null;
	return {
		...chonKenh(uuTien, zaloDuoc, slackDuoc),
		uuTien,
		zaloBat,
		zaloDuoc,
		slackDuoc,
		slackUserId,
		zaloUserId: lienKet?.zaloUserId ?? null,
	};
}
