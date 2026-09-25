import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { hopThuCanCap } from "@/lib/hop-thu";

const suffix = `${process.env.TEST_RUN_ID ?? "tuong-hop-thu"}-hopthu`;
const okr = `${suffix}-okr`;
const member = `${suffix}-member`;

async function gieo(userId: string, vai: "okr" | "member") {
	const now = new Date();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
		update: {},
	});
	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: userId,
			email: `${userId}@thu.test`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});
	await db.member.upsert({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		create: {
			id: `member-${userId}`,
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
		update: { role: vai },
	});
	await db.account.upsert({
		where: { id: `acc-google-${userId}` },
		create: {
			id: `acc-google-${userId}`,
			accountId: `google-${userId}`,
			providerId: "google",
			scope: "openid email profile",
			userId,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});
}

async function don() {
	const users = { startsWith: suffix };
	await db.account.deleteMany({ where: { userId: users } });
	await db.member.deleteMany({ where: { userId: users } });
	await db.user.deleteMany({ where: { id: users } });
}

beforeAll(async () => {
	await don();
	await gieo(okr, "okr");
	await gieo(member, "member");
});

afterAll(async () => {
	await don();
	await db.$disconnect();
});

describe("tuong hop thu doc vai o cho noi", () => {
	test("okr chi dang nhap Google khong quyen hop thu -> khong can cap", async () => {
		expect(await hopThuCanCap(okr)).toEqual([]);
	});

	test("member cung dong dang nhap -> can cap google", async () => {
		expect(await hopThuCanCap(member)).toEqual(["google"]);
	});

	test("okr them dong credential -> van khong can cap", async () => {
		const now = new Date();
		await db.account.create({
			data: {
				id: `acc-cred-${okr}`,
				accountId: okr,
				providerId: "credential",
				userId: okr,
				createdAt: now,
				updatedAt: now,
			},
		});
		expect(await hopThuCanCap(okr)).toEqual([]);
	});
});
