import { beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

const suffix = process.env.TEST_RUN_ID ?? "thanh-vien";

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
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function demDong(email: string) {
	return db.invitation.count({
		where: { organizationId: WORKSPACE_ID, email },
	});
}

describe("chuan-hoa", () => {
	let quan = "";

	beforeEach(async () => {
		await don();
		await dungKho();
		quan = await dungNguoi("quan", "admin");
	});

	it("bang viet truoc, nam dong", async () => {
		const dia = `khue-${suffix}@gmail.com`;

		const dong2 = await workspace.allowEmail(quan, {
			email: `  KHUE-${suffix}@Gmail.com  `,
			role: "member",
		});
		expect([dong2.email, "dong 2 — ha chu thuong va cat khoang trang"]).toEqual([
			dia,
			"dong 2 — ha chu thuong va cat khoang trang",
		]);

		let cau1 = "";
		try {
			await workspace.allowEmail(quan, {
				email: `  KHUE-${suffix}@Gmail.com  `,
				role: "member",
			});
		} catch (e) {
			cau1 = (e as Error).message;
		}
		expect([
			await demDong(dia),
			cau1.includes("already"),
			"dong 1 — khong de dong thu hai, va noi da co",
		]).toEqual([1, true, "dong 1 — khong de dong thu hai, va noi da co"]);

		for (const [n, xau] of [
			[3, "khue"],
			[4, "a@b@c.com"],
			[5, ""],
		] as const) {
			const truoc = await db.invitation.count();
			let daNem = false;
			try {
				await workspace.allowEmail(quan, { email: xau, role: "member" });
			} catch {
				daNem = true;
			}
			const sau = await db.invitation.count();

			expect([n, daNem, sau - truoc, "chan truoc khi cham co so du lieu"]).toEqual(
				[n, true, 0, "chan truoc khi cham co so du lieu"],
			);
		}
	});
});

describe("cho-phep-lai", () => {
	let quan = "";

	beforeEach(async () => {
		await don();
		await dungKho();
		quan = await dungNguoi("quan", "admin");
	});

	it("ba ca, ba ket qua khac nhau", async () => {
		const dia = `lai-${suffix}@gmail.com`;

		const dau = await workspace.allowEmail(quan, { email: dia, role: "member" });

		let khiPending = true;
		try {
			await workspace.allowEmail(quan, { email: dia, role: "member" });
		} catch {
			khiPending = false;
		}

		await db.invitation.update({
			where: { id: dau.id },
			data: { status: "accepted" },
		});

		let khiAccepted = true;
		try {
			await workspace.allowEmail(quan, { email: dia, role: "member" });
		} catch {
			khiAccepted = false;
		}

		await workspace.revokeAllowance(quan, { allowanceId: dau.id });

		const truoc = await demDong(dia);
		let khiCancelled = true;
		try {
			await workspace.allowEmail(quan, { email: dia, role: "member" });
		} catch {
			khiCancelled = false;
		}
		const sau = await demDong(dia);

		if (khiPending === khiCancelled && khiAccepted === khiCancelled) {
			throw new Error(
				`ba ca cho cung mot ket qua (${khiCancelled}) — phep do khong phan biet duoc mo dung ca da rut voi mo tat hay dong tat`,
			);
		}

		expect([
			khiCancelled,
			khiPending,
			khiAccepted,
			"cancelled mo, pending va accepted dong",
		]).toEqual([true, false, false, "cancelled mo, pending va accepted dong"]);

		expect([truoc, sau, "dong cu giu nguyen, loi cho phep moi la dong MOI"]).toEqual(
			[1, 2, "dong cu giu nguyen, loi cho phep moi la dong MOI"],
		);

		const cu = await db.invitation.findUnique({
			where: { id: dau.id },
			select: { status: true },
		});
		expect([cu?.status, "dong cancelled cu con nguyen"]).toEqual([
			"cancelled",
			"dong cancelled cu con nguyen",
		]);
	});
});

describe("chu-cuoi-cung", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("chu cuoi cung khong go duoc, hai chu thi go duoc", async () => {
		const chu = await dungNguoi("chu", "owner");
		const chuMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: chu },
			},
			select: { id: true },
		});

		const demTruoc = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});

		let cau = "";
		try {
			await workspace.removeMember(chu, { memberId: chuMember?.id ?? "" });
		} catch (e) {
			cau = (e as Error).message;
		}

		const demSau = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});

		expect([
			cau.length > 0,
			demSau,
			demTruoc,
			"tu choi, va khong dong nao doi",
		]).toEqual([true, demTruoc, demTruoc, "tu choi, va khong dong nao doi"]);

		const chuHai = await dungNguoi("chu-hai", "owner");
		const chuHaiMember = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: chuHai,
				},
			},
			select: { id: true },
		});

		await workspace.removeMember(chu, { memberId: chuHaiMember?.id ?? "" });

		const conLai = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: chuHai,
				},
			},
			select: { id: true },
		});

		expect([conLai, "doi chung duong: hai chu thi go duoc mot"]).toEqual([
			null,
			"doi chung duong: hai chu thi go duoc mot",
		]);
	});

	it("go mot thanh vien cung rut loi cho phep cua ho", async () => {
		const quan = await dungNguoi("quan", "admin");
		await dungNguoi("chu", "owner");
		const bi = await dungNguoi("bi-go", "member");

		const loi = await workspace.allowEmail(quan, {
			email: `${bi}@onemount.com`,
			role: "member",
		});
		await db.invitation.update({
			where: { id: loi.id },
			data: { status: "accepted" },
		});

		const biMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		await workspace.removeMember(quan, { memberId: biMember?.id ?? "" });

		const hang = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		const sau = await db.invitation.findUnique({
			where: { id: loi.id },
			select: { status: true },
		});

		expect([
			hang,
			sau?.status,
			"hang thanh vien mat, loi cho phep thanh cancelled",
		]).toEqual([
			null,
			"cancelled",
			"hang thanh vien mat, loi cho phep thanh cancelled",
		]);
	});
});
