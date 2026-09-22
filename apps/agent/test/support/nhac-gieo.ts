import { db } from "@crm/db";
import { WORKSPACE_ID, workspaceSlug } from "@crm/db/workspace";
import { z } from "zod";
import { stepDoneInput } from "../../../api/src/onboarding/onboarding.contracts";
import { OnboardingGhi } from "../../../api/src/onboarding/onboarding-ghi";

export const DAY_MS = 24 * 60 * 60 * 1000;

export const TIEN_TO = "mn3-";

const TEN_XUONG = "CRM";

let dem = 0;

export function ma(): string {
	dem += 1;
	return `${TIEN_TO}${Date.now().toString(36)}x${dem}`;
}

export async function moXuong(): Promise<void> {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: TEN_XUONG,
			slug: workspaceSlug(TEN_XUONG),
			createdAt: new Date(),
		},
	});
}

export async function donDep(): Promise<void> {
	await db.agentTask.deleteMany({
		where: { kind: "nhac-ke-hoach" },
	});
	await db.onboardingPlan.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
}

export async function gieoNguoi(ten: string, thanhVien = true) {
	const id = ma();
	const nguoi = await db.user.create({
		data: { id, name: ten, email: `${id}@thu.test` },
	});
	if (thanhVien) await vaoXuong(id);
	return nguoi;
}

export async function vaoXuong(userId: string): Promise<void> {
	await db.member.create({
		data: {
			id: `${TIEN_TO}mem-${userId}`,
			organizationId: WORKSPACE_ID,
			userId,
			role: "member",
			createdAt: new Date(),
		},
	});
}

export type BuocGieo = {
	nhan: string;
	han: Date;
	giao?: string;
	xong?: boolean;
};

export async function gieoKeHoach(input: {
	camTrich: string;
	batDau: Date;
	buoc: BuocGieo[];
	dong?: boolean;
	theoDoi?: string[];
	imTu?: Date;
}) {
	const boPhan = await db.department.create({
		data: { name: ma(), position: 0 },
	});
	const congTy = await db.company.create({ data: { name: ma() } });
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId: input.camTrich,
			startedAt: input.batDau,
			targetDays: 30,
			closedAt: input.dong ? new Date() : null,
		},
	});
	const buoc = [];
	for (const [i, b] of input.buoc.entries()) {
		buoc.push(
			await db.onboardingStep.create({
				data: {
					planId: plan.id,
					label: b.nhan,
					departmentId: boPhan.id,
					assigneeId: b.giao ?? null,
					dueAt: b.han,
					completedAt: b.xong ? b.han : null,
					position: i,
				},
			}),
		);
	}
	for (const userId of input.theoDoi ?? []) {
		await db.onboardingWatch.create({ data: { planId: plan.id, userId } });
	}
	if (input.imTu) {
		await db.onboardingStep.updateMany({
			where: { planId: plan.id },
			data: { updatedAt: input.imTu },
		});
	}
	return { plan, buoc };
}

export function phan<T>(ds: T[], i: number): T {
	const gia = ds.at(i);
	if (gia === undefined) {
		throw new Error(
			`khong co phan tu thu ${i} trong danh sach ${ds.length} phan tu`,
		);
	}
	return gia;
}

const ghi = new OnboardingGhi(db);

export async function xongBuoc(
	stepId: string,
	nguoiLam: string,
): Promise<void> {
	await ghi.setStepDone(stepDoneInput.parse({ stepId, done: true }), nguoiLam);
}

export async function noiSlack(userId: string): Promise<void> {
	await db.account.create({
		data: {
			id: `${TIEN_TO}slack-${userId}`,
			accountId: `${TIEN_TO}T`,
			providerId: "slack",
			userId,
			accessToken: "xoxb-mn3",
		},
	});
}

export async function khopSlack(
	crmUserId: string,
	slackUserId: string,
): Promise<void> {
	await db.slackMemberMatch.create({ data: { crmUserId, slackUserId } });
}

const loiGoiSlack = z.object({
	users: z.string().optional(),
	channel: z.string().optional(),
	text: z.string().optional(),
});

export type LoiGoiSlack = { url: string; body: z.infer<typeof loiGoiSlack> };

export type SlackGia = { fetcher: typeof fetch; goi: LoiGoiSlack[] };

export function slackGia(): SlackGia {
	const goi: LoiGoiSlack[] = [];
	const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		goi.push({ url, body: loiGoiSlack.parse(JSON.parse(String(init?.body))) });
		return url.endsWith("conversations.open")
			? Response.json({ ok: true, channel: { id: "D1" } })
			: Response.json({ ok: true, channel: "D1", ts: "1" });
	}) as typeof fetch;
	return { fetcher, goi };
}
