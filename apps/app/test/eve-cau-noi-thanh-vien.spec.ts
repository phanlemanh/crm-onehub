import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";

const suffix = `${process.env.TEST_RUN_ID ?? "eve-cau-noi"}-eve`;
const thanhVien = `${suffix}-con`;
const nguoiNgoai = `${suffix}-ngoai`;

let phienHienTai: { user: { id: string; email: string; name: string } } | null =
	null;
const daChuyenToiAgent: string[] = [];

const serverThat = await import("next/server");
mock.module("next/server", () => ({
	...serverThat,
	connection: async () => undefined,
}));
const sessionThat = await import("@/lib/session");
mock.module("@/lib/session", () => ({
	...sessionThat,
	getSession: async () => phienHienTai,
}));

process.env.AGENT_BRIDGE_SECRET = "bi-mat-cau-noi-thu-du-dai-32-ky-tu";
const fetchThat = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL) => {
	daChuyenToiAgent.push(String(input));
	return new Response("{}", { status: 200 });
}) as typeof fetch;

const { POST } = await import("@/app/eve/v1/[...path]/route");

async function gieoNguoi(userId: string, laThanhVien: boolean) {
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
	if (laThanhVien) {
		await db.member.upsert({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId },
			},
			create: {
				id: `member-${userId}`,
				organizationId: WORKSPACE_ID,
				userId,
				role: "member",
				createdAt: now,
			},
			update: {},
		});
	}
}

async function hoiTroLy(userId: string): Promise<number> {
	phienHienTai = {
		user: { id: userId, email: `${userId}@thu.test`, name: userId },
	};
	const res = await POST(
		new Request("http://localhost:3000/eve/v1/session", {
			method: "POST",
			body: "{}",
		}),
	);
	return res.status;
}

async function don() {
	const users = { startsWith: `${suffix}-` };
	await db.member.deleteMany({ where: { userId: users } });
	await db.user.deleteMany({ where: { id: users } });
}

beforeAll(async () => {
	await don();
	await gieoNguoi(thanhVien, true);
	await gieoNguoi(nguoiNgoai, false);
});

afterAll(async () => {
	globalThis.fetch = fetchThat;
	await don();
});

describe("eve-cau-noi-thanh-vien", () => {
	test("doi-chung: thanh vien hoi duoc tro ly", async () => {
		daChuyenToiAgent.length = 0;
		expect(await hoiTroLy(thanhVien)).toBe(200);
		expect(daChuyenToiAgent.length, "thanh vien phai toi duoc agent").toBe(1);
	});

	test("cua-4-tro-ly: nguoi khong con trong kho khong hoi duoc tro ly", async () => {
		daChuyenToiAgent.length = 0;
		const status = await hoiTroLy(nguoiNgoai);
		expect(
			{ status, soLanToiAgent: daChuyenToiAgent.length },
			"nguoi da bi go van duoc chuyen toi tro ly nghien cuu",
		).toEqual({ status: 403, soLanToiAgent: 0 });
	});
});
