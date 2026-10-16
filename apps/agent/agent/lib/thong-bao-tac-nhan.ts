import type { Db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	khoaThongBao,
	type NoiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";

export type KetThucLuot = "cho" | "hong";

export async function noiDungTacNhan(
	db: Db,
	conversationId: string,
	ketThuc: KetThucLuot,
): Promise<{ nguoiNhanId: string; noiDung: NoiDungThongBao } | null> {
	const hoiThoai = await db.agentConversation.findFirst({
		where: { id: conversationId, kind: "BUILDER" },
		select: {
			userId: true,
			title: true,
			pendingInputRequest: true,
			submissions: {
				orderBy: { createdAt: "desc" },
				take: 1,
				select: { id: true, createdAt: true, commandType: true },
			},
		},
	});
	const luot = hoiThoai?.submissions[0];
	if (!hoiThoai || !luot) return null;

	const chung = {
		conversationId,
		luotId: luot.id,
		ten: hoiThoai.title?.trim() ?? "",
	};

	if (ketThuc === "hong") {
		if (luot.commandType !== "CREATE_AGENT") return null;
		return {
			nguoiNhanId: hoiThoai.userId,
			noiDung: { loai: "tac-nhan-hong", ...chung },
		};
	}

	if (hoiThoai.pendingInputRequest !== null) {
		return {
			nguoiNhanId: hoiThoai.userId,
			noiDung: { loai: "tac-nhan-can-tra-loi", ...chung },
		};
	}

	const banMoi = await db.agentVersion.findFirst({
		where: {
			sourceConversationId: conversationId,
			createdAt: { gte: luot.createdAt },
		},
		orderBy: { createdAt: "desc" },
		select: { agent: { select: { name: true } } },
	});
	if (!banMoi) return null;
	return {
		nguoiNhanId: hoiThoai.userId,
		noiDung: {
			loai: "tac-nhan-xong",
			...chung,
			ten: banMoi.agent.name.trim() || chung.ten,
		},
	};
}

export async function ghiThongBaoTacNhan(
	db: Db,
	conversationId: string,
	ketThuc: KetThucLuot,
	now: Date,
): Promise<boolean> {
	const kq = await noiDungTacNhan(db, conversationId, ketThuc);
	if (!kq) return false;
	const homNay = ngayVN(now);
	const ghi = await db.thongBao.createMany({
		data: [
			{
				nguoiNhanId: kq.nguoiNhanId,
				nguon: THONG_BAO.nguon.tacNhan,
				khoa: khoaThongBao(kq.noiDung, now),
				noiDung: kq.noiDung,
				duongDan: `/chat/${conversationId}`,
				ngayDau: homNay,
				thayNgay: homNay,
				taoLuc: now,
			},
		],
		skipDuplicates: true,
	});
	return ghi.count > 0;
}

export async function baoTacNhan(
	conversationId: string,
	ketThuc: KetThucLuot,
	ghi: typeof ghiThongBaoTacNhan = ghiThongBaoTacNhan,
): Promise<void> {
	try {
		const { db } = await import("@crm/db");
		await ghi(db, conversationId, ketThuc, new Date());
	} catch (loi) {
		console.error(
			`[agent] thong bao tac nhan ${conversationId}: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
}
