import { AUTH_COOKIE_PREFIX, type WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";

const DAY_MS = 24 * 60 * 60 * 1000;
const PHIEN_SONG_NGAY = 7;

export const COOKIE_NAME = `${AUTH_COOKIE_PREFIX}.session_token`;

export async function kyCookie(value: string): Promise<string> {
	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret) throw new Error("BETTER_AUTH_SECRET chua dat");
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const chuKy = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(value),
	);
	const base64 = btoa(String.fromCharCode(...new Uint8Array(chuKy)));
	return encodeURIComponent(`${value}.${base64}`);
}

export async function mintPhien(
	userId: string,
): Promise<{ cookie: string; token: string }> {
	const token = `dev-session-${userId}`;
	await db.session.upsert({
		where: { token },
		create: {
			id: token,
			token,
			userId,
			expiresAt: new Date(Date.now() + PHIEN_SONG_NGAY * DAY_MS),
			updatedAt: new Date(),
			activeOrganizationId: WORKSPACE_ID,
		},
		update: {},
	});
	return { cookie: `${COOKIE_NAME}=${await kyCookie(token)}`, token };
}

export async function dungKho(): Promise<void> {
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

export async function gieoThanhVien(
	userId: string,
	vai: WorkspaceRole,
): Promise<void> {
	const now = new Date();
	await dungKho();
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
