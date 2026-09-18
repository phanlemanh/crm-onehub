import { beforeEach, describe, expect, it } from "bun:test";
import { AUTH_COOKIE_PREFIX, auth } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

const suffix = process.env.TEST_RUN_ID ?? "go-thanh-vien";

const agent = {
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

const workspace = new WorkspaceService(db, agent);

const id = (phan: string) => `${suffix}-${phan}`;

async function dungKho() {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
		update: {},
	});
}

async function dungNguoi(phan: string, vai: string) {
	const now = new Date();
	const userId = id(phan);

	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: phan,
			email: `${userId}@onemount.com`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});

	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		create: {
			id: id(`member-${phan}`),
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
		update: { role: vai },
	});

	return userId;
}

async function don() {
	await db.invitation.deleteMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: `${suffix}` } },
			],
		},
	});
	await db.session.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function nem(chay: () => Promise<unknown>) {
	try {
		await chay();
		return null;
	} catch (loi) {
		return loi instanceof Error ? loi.constructor.name : "khong-phai-Error";
	}
}

async function dongMember(userId: string) {
	const dong = await db.member.findUnique({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		select: { id: true },
	});

	return dong?.id ?? "";
}

describe("bi-go-thi-bi-tu-choi", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("sau thu tuc quan tri, sau hang viet truoc, muoi hai khang dinh", async () => {
		const bi = await dungNguoi("bi-go", "admin");
		const chu = await dungNguoi("chu", "owner");
		const khach = await dungNguoi("khach", "member");

		const loi = await workspace.allowEmail(chu, {
			email: `${id("moi-cu")}@onemount.com`,
			role: "member",
		});

		const khachMember = await dongMember(khach);

		const BANG: readonly [string, () => Promise<unknown>][] = [
			["update", () => workspace.update(bi, { name: "CRM", website: "x.com" })],
			[
				"setMemberRole",
				() =>
					workspace.setMemberRole(bi, {
						memberId: khachMember,
						role: "member",
					}),
			],
			["allowances", () => workspace.allowances(bi)],
			[
				"allowEmail",
				() =>
					workspace.allowEmail(bi, {
						email: `${id("moi")}@onemount.com`,
						role: "member",
					}),
			],
			[
				"revokeAllowance",
				() => workspace.revokeAllowance(bi, { allowanceId: loi.id }),
			],
			[
				"removeMember",
				() => workspace.removeMember(bi, { memberId: khachMember }),
			],
		];

		expect(BANG.length).toBe(6);

		for (const [ten, chay] of BANG) {
			const truoc = await nem(chay);
			expect(
				truoc,
				`thu tuc "${ten}": nguoi CON la quan tri goi thi KHONG duoc nem, nhan ${truoc}`,
			).toBe(null);
		}

		await workspace.removeMember(chu, { memberId: await dongMember(bi) });

		for (const [ten, chay] of BANG) {
			const sau = await nem(chay);
			expect(
				sau,
				`thu tuc "${ten}": nguoi DA BI GO goi thi phai nem ForbiddenException, nhan ${sau}`,
			).toBe("ForbiddenException");
		}
	});
});

const COOKIE_NAME = `${AUTH_COOKIE_PREFIX}.session_token`;

async function kyCookie(value: string) {
	const secret = process.env.BETTER_AUTH_SECRET;

	if (!secret) throw new Error("BETTER_AUTH_SECRET chua dat");

	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(value),
	);
	const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

	return encodeURIComponent(`${value}.${base64}`);
}

async function mintPhien(userId: string) {
	const token = `dev-session-${userId}`;
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	await db.session.upsert({
		where: { token },
		create: {
			id: token,
			token,
			userId,
			expiresAt,
			updatedAt: new Date(),
			activeOrganizationId: WORKSPACE_ID,
		},
		update: { expiresAt },
	});

	return new Headers({ cookie: `${COOKIE_NAME}=${await kyCookie(token)}` });
}

describe("phien-mat-quyen", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("phien dang mo mat quyen ngay khi luot go tra ve, 0 giay", async () => {
		const bi = await dungNguoi("phien-bi", "member");
		const chu = await dungNguoi("phien-chu", "owner");

		const cuaBi = await mintPhien(bi);
		const cuaChu = await mintPhien(chu);

		const truoc = await auth.api.getSession({ headers: cuaBi });

		expect(
			truoc?.user?.id,
			`TRUOC luot go, cua that phai nhan phien cua ${bi}, nhan ${truoc?.user?.id}`,
		).toBe(bi);

		await workspace.removeMember(chu, { memberId: await dongMember(bi) });

		const sau = await auth.api.getSession({ headers: cuaBi });

		expect(
			sau?.user?.id ?? null,
			`NGAY SAU luot go, cua that KHONG duoc nhan phien nao cho ${bi}, nhan ${sau?.user?.id}`,
		).toBe(null);

		const nguoiKhac = await auth.api.getSession({ headers: cuaChu });

		expect(
			nguoiKhac?.user?.id,
			`phien cua nguoi KHAC khong duoc bi dung cham, mong ${chu}, nhan ${nguoiKhac?.user?.id}`,
		).toBe(chu);
	});
});
