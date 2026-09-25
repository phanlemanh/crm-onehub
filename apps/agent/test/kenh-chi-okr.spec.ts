import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	BRIDGE_AUDIENCE,
	BRIDGE_ISSUER,
	repFromCrm,
} from "../agent/channels/eve";

const SECRET = "test-secret-at-least-long-enough-to-be-a-secret";
const auth = repFromCrm(SECRET);
const suffix = `${process.env.TEST_RUN_ID ?? "kenh-chi-okr"}-kenh`;
const chiOkr = `${suffix}-okr`;
const thanhVien = `${suffix}-member`;

type BridgeHeader = { alg: string; typ: string };

type BridgeClaims = {
	iss: string;
	aud: string;
	sub: string;
	email: string;
	name: string;
	iat: number;
	nbf: number;
	exp: number;
};

async function mint(claims: BridgeClaims): Promise<string> {
	const encode = (value: BridgeClaims | BridgeHeader) =>
		Buffer.from(JSON.stringify(value)).toString("base64url");
	const signingInput = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}`;
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(signingInput),
	);
	return `${signingInput}.${Buffer.from(signature).toString("base64url")}`;
}

function request(token: string): Request {
	return new Request("https://agent.example.com/eve/v1/session", {
		method: "POST",
		headers: { authorization: `Bearer ${token}` },
	});
}

function claims(sub: string): BridgeClaims {
	const now = Math.floor(Date.now() / 1000);
	return {
		iss: BRIDGE_ISSUER,
		aud: BRIDGE_AUDIENCE,
		sub,
		email: `${sub}@thu.test`,
		name: sub,
		iat: now,
		nbf: now - 5,
		exp: now + 120,
	};
}

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
}

async function don() {
	const users = { startsWith: suffix };
	await db.member.deleteMany({ where: { userId: users } });
	await db.user.deleteMany({ where: { id: users } });
}

beforeAll(async () => {
	await don();
	await gieo(chiOkr, "okr");
	await gieo(thanhVien, "member");
});

afterAll(async () => {
	await don();
	await db.$disconnect();
});

describe("kenh tro ly AI doc vai", () => {
	test("token hop le cua nguoi chi OKR khong duoc xac thuc", async () => {
		const ketQua = await auth(request(await mint(claims(chiOkr))));
		expect(ketQua, `principal nhan duoc: ${JSON.stringify(ketQua)}`).toBe(null);
	});

	test("token cua thanh vien thanh principal nguoi dung", async () => {
		expect(await auth(request(await mint(claims(thanhVien))))).toMatchObject({
			principalId: thanhVien,
			principalType: "user",
		});
	});

	test("token cua nguoi khong co dong thanh vien khong duoc xac thuc", async () => {
		expect(await auth(request(await mint(claims(`${suffix}-khong-co`))))).toBe(
			null,
		);
	});
});
