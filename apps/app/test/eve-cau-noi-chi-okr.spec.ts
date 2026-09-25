import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { KHONG_TRONG_PHAM_VI } from "@crm/validation/vai-workspace";

const suffix = `${process.env.TEST_RUN_ID ?? "eve-cau-noi-chi-okr"}-okr`;
const thanhVien = `${suffix}-member`;
const chiOkr = `${suffix}-chi-okr`;

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

async function gieoNguoi(userId: string, vai: "member" | "okr") {
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
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		create: {
			id: `member-${userId}`,
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
		update: { role: vai },
	});
}

async function hoiTroLy(userId: string): Promise<Response> {
	phienHienTai = {
		user: { id: userId, email: `${userId}@thu.test`, name: userId },
	};
	return POST(
		new Request("http://localhost:3000/eve/v1/session", {
			method: "POST",
			body: "{}",
		}),
	);
}

async function don() {
	const users = { startsWith: `${suffix}-` };
	await db.member.deleteMany({ where: { userId: users } });
	await db.user.deleteMany({ where: { id: users } });
}

beforeAll(async () => {
	await don();
	await gieoNguoi(thanhVien, "member");
	await gieoNguoi(chiOkr, "okr");
});

afterAll(async () => {
	globalThis.fetch = fetchThat;
	await don();
});

describe("eve-cau-noi-chi-okr", () => {
	test("doi-chung: thanh vien hoi duoc tro ly AI", async () => {
		daChuyenToiAgent.length = 0;
		const res = await hoiTroLy(thanhVien);
		expect(res.status).toBe(200);
		expect(daChuyenToiAgent.length, "thanh vien phai toi duoc agent").toBe(1);
	});

	test("chi-okr: duong noi tu choi ve pham vi, khong chuyen gi sang tro ly AI", async () => {
		daChuyenToiAgent.length = 0;
		const res = await hoiTroLy(chiOkr);
		const body = (await res.json()) as { error?: string };
		expect(
			{
				status: res.status,
				error: body.error,
				soLanToiAgent: daChuyenToiAgent.length,
			},
			"vai chi OKR van duoc chuyen toi tro ly AI",
		).toEqual({ status: 403, error: KHONG_TRONG_PHAM_VI, soLanToiAgent: 0 });
	});
});
