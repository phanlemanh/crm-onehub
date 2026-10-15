import { db } from "../../src/client";
import { ActivityType } from "../../src/generated/prisma/enums";
import { WORKSPACE_ID } from "../../src/workspace";

export const KHUON_TU_SHA = "85c0e4cc9";

export type HangCu = {
	createdById: string;
	subject?: string | null;
	body?: string | null;
	dueAt?: Date | null;
	completedAt?: Date | null;
	companyId?: string | null;
	contactId?: string | null;
	dealId?: string | null;
	planId?: string | null;
	createdAt?: Date;
};

async function xong(id: string, completedAt: Date | null | undefined) {
	if (!completedAt) return;
	await db.activity.update({ where: { id }, data: { completedAt } });
}

export async function khuonApi(h: HangCu): Promise<string> {
	const luc = h.createdAt ?? new Date();
	const hang = await db.activity.create({
		data: {
			type: ActivityType.TASK,
			subject: h.subject ?? null,
			body: h.body ?? null,
			occurredAt: luc,
			dueAt: h.dueAt ?? null,
			companyId: h.companyId ?? null,
			contactId: h.contactId ?? null,
			dealId: h.dealId ?? null,
			planId: h.planId ?? null,
			createdById: h.createdById,
			createdAt: luc,
		},
		select: { id: true },
	});
	await xong(hang.id, h.completedAt);
	return hang.id;
}

export async function khuonTacNhan(
	h: HangCu & { agentId: string; runId: string; actionId: string },
): Promise<string> {
	const luc = h.createdAt ?? new Date();
	const hang = await db.activity.create({
		data: {
			id: `agent-action-${h.actionId}`,
			type: ActivityType.TASK,
			subject: h.subject ?? null,
			body: h.body ?? null,
			occurredAt: luc,
			dueAt: h.dueAt ?? null,
			companyId: h.companyId ?? null,
			contactId: h.contactId ?? null,
			dealId: h.dealId ?? null,
			createdById: h.createdById,
			createdAt: luc,
			meta: {
				source: "agent",
				agentId: h.agentId,
				runId: h.runId,
				actionId: h.actionId,
			},
		},
		select: { id: true },
	});
	await xong(hang.id, h.completedAt);
	return hang.id;
}

export async function khuonMaLech(
	h: HangCu & { planId: string; companyId: string; platformBrokerId: string },
): Promise<string> {
	const hang = await db.activity.create({
		data: {
			type: ActivityType.TASK,
			subject: h.subject ?? null,
			body: h.body ?? null,
			dueAt: h.dueAt ?? null,
			planId: h.planId,
			companyId: h.companyId,
			createdById: h.createdById,
			createdAt: h.createdAt ?? new Date(),
			meta: {
				agent: "onboarding-identify",
				platformBrokerId: h.platformBrokerId,
			},
		},
		select: { id: true },
	});
	await xong(hang.id, h.completedAt);
	return hang.id;
}

export async function moToChuc(): Promise<void> {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
	});
}

export async function taoNguoi(id: string, role: string): Promise<string> {
	await db.user.create({ data: { id, name: id, email: `${id}@thu.test` } });
	await db.member.create({
		data: {
			id: `m-${id}`,
			organizationId: WORKSPACE_ID,
			userId: id,
			role,
			createdAt: new Date(0),
		},
	});
	return id;
}

export async function donNguoi(ma: string): Promise<void> {
	const nguoi = await db.user.findMany({
		where: { id: { startsWith: ma } },
		select: { id: true },
	});
	const ids = nguoi.map((n) => n.id);
	await db.viec.deleteMany({
		where: {
			OR: [
				{ taoBoiId: { in: ids } },
				{ nguoiGiaoId: { in: ids } },
				{ nguoiThucHienId: { in: ids } },
			],
		},
	});
	await db.activity.deleteMany({ where: { createdById: { in: ids } } });
	await db.company.deleteMany({ where: { name: { startsWith: ma } } });
	await db.member.deleteMany({ where: { userId: { in: ids } } });
	await db.user.deleteMany({ where: { id: { in: ids } } });
}
