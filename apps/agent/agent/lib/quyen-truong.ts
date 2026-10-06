import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	laQuanTriWorkspace,
	toWorkspaceRole,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";
import { z } from "zod";
import { isAutomated } from "./approval";
import { FIELDS_AGENT } from "./fields-config";

export type VaiDoiTruong = WorkspaceRole | "khong-thanh-vien" | "tu-dong";

export type HanhDongTruong = "create" | "update-brief" | "archive";

export type LyDoTuChoi = "quyen" | "khong-ghi-duoc";

type Thuoc = Readonly<Record<string, string | readonly string[]>>;

export type NguCanhTruong = {
	readonly session: {
		readonly id: string;
		readonly auth: {
			readonly current?: {
				readonly authenticator?: string;
				readonly principalId?: string;
				readonly principalType?: string;
				readonly attributes?: Thuoc;
			} | null;
			readonly initiator?: { readonly attributes?: Thuoc } | null;
		};
	};
};

const nguoiChat = z.object({
	authenticator: z.literal("crm-app"),
	principalId: z.string().min(1),
});

export async function quyenDoiTruong(
	ctx: NguCanhTruong,
): Promise<{ cho: boolean; vai: VaiDoiTruong }> {
	if (isAutomated(ctx.session)) return { cho: false, vai: "tu-dong" };
	const nguoi = nguoiChat.safeParse(ctx.session.auth.current);
	if (!nguoi.success) return { cho: false, vai: "tu-dong" };
	const member = await db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId: WORKSPACE_ID,
				userId: nguoi.data.principalId,
			},
		},
		select: { role: true },
	});
	if (!member) return { cho: false, vai: "khong-thanh-vien" };
	const vai = toWorkspaceRole(member.role);
	return { cho: laQuanTriWorkspace(vai), vai };
}

export async function ghiDoiTruong(
	sessionId: string,
	data: {
		hanhDong: HanhDongTruong;
		vai: VaiDoiTruong;
		ketQua: "lam" | "tu-choi";
		lyDo?: LyDoTuChoi;
		entity: string;
		key?: string;
	},
): Promise<void> {
	await db.agentEvent.create({
		data: {
			id: randomUUID(),
			sessionId,
			type: FIELDS_AGENT.suKien,
			data,
			emittedAt: new Date(),
		},
	});
}
