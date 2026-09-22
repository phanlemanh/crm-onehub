import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import {
	daToiGioNhac,
	ngayVN,
	type ViecNhac,
	viecCanNhac,
} from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	mucNhac,
	type NhacPayload,
	parseNhacPayload,
} from "@crm/validation/nhac-ke-hoach";
import { sendSlackMessage } from "./run-runtime";
import { slackAccessToken } from "./slack-connection";
import { completeTask } from "./tasks";
import { dungTin } from "./tin-nhac";

export const LOAI_VIEC_NHAC = "nhac-ke-hoach";

const LY_DO = "nhắc buổi sáng";

const CHU_DE = /^user:(.+):\d{4}-\d{2}-\d{2}$/;

export type KetQuaNhac = "da-gui" | "khong-slack" | "khong-khop" | "khong-viec";

export type PhuThuocGui = { fetcher?: typeof fetch; appUrl?: string | null };

export function chuDeNhac(userId: string, now: Date): string {
	return `user:${userId}:${ngayVN(now)}`;
}

function nguoiCua(subject: string | null): string {
	const khop = CHU_DE.exec(subject ?? "");
	if (!khop?.[1]) {
		throw new Error(`subject nhac-ke-hoach hong: ${subject ?? "null"}`);
	}
	return khop[1];
}

function maCua(ds: ViecNhac[]): NhacPayload["muc"] {
	return ds.map(({ loai, planId, stepId }) =>
		mucNhac.parse({ loai, planId, stepId }),
	);
}

export async function lenLichNhac(now = new Date()): Promise<{ ghi: number }> {
	if (!daToiGioNhac(now)) return { ghi: 0 };
	const viec = await viecCanNhac(db, { now });
	if (viec.size === 0) return { ghi: 0 };
	const { count } = await db.agentTask.createMany({
		data: [...viec].map(([userId, ds]) => ({
			kind: LOAI_VIEC_NHAC,
			reason: LY_DO,
			subject: chuDeNhac(userId, now),
			dueAt: now,
			priority: PRIORITY.nhac,
			payload: { muc: maCua(ds) },
		})),
		skipDuplicates: true,
	});
	return { ghi: count };
}

function appUrlMacDinh(): string | null {
	const dau = process.env.APP_URL?.split(",")[0]?.trim().replace(/\/+$/, "");
	return dau || null;
}

async function duongMo(
	appUrl: string | null,
): Promise<(planId: string) => string | null> {
	if (!appUrl) return () => null;
	const xuong = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	const slug = xuong?.slug;
	if (!slug) return () => null;
	return (planId) => `${appUrl}/${slug}?record=plan:${planId}`;
}

async function dong(taskId: string, ket: KetQuaNhac): Promise<KetQuaNhac> {
	await completeTask(taskId, ket);
	return ket;
}

export async function chayNhac(
	task: { id: string },
	deps: PhuThuocGui = {},
): Promise<KetQuaNhac> {
	const hang = await db.agentTask.findUniqueOrThrow({
		where: { id: task.id },
		select: { subject: true, payload: true },
	});
	const userId = nguoiCua(hang.subject);
	const payload = parseNhacPayload(hang.payload);
	const viec =
		(await viecCanNhac(db, { now: new Date(), userId })).get(userId) ?? [];
	if (viec.length === 0) return dong(task.id, "khong-viec");

	const token = await slackAccessToken();
	if (!token) return dong(task.id, "khong-slack");

	const khop = await db.slackMemberMatch.findUnique({
		where: { crmUserId: userId },
		select: { slackUserId: true, crmUser: { select: { name: true } } },
	});
	if (!khop?.slackUserId) return dong(task.id, "khong-khop");

	const ten = khop.crmUser.name;
	const lienKet = await duongMo(
		deps.appUrl === undefined ? appUrlMacDinh() : deps.appUrl,
	);
	const { text, daGui } = dungTin(ten, viec, lienKet);
	await sendSlackMessage(
		token,
		{ kind: "user", id: khop.slackUserId, label: ten },
		text,
		task.id,
		{ fetcher: deps.fetcher },
	);
	await db.agentTask.update({
		where: { id: task.id },
		data: { payload: { ...payload, daGui: maCua(daGui) } },
	});
	await completeTask(task.id, `da-gui:${daGui.length}`);
	return "da-gui";
}
