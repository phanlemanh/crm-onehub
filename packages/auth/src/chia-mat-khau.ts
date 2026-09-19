import { randomBytes } from "node:crypto";
import { db } from "@crm/db";

const SECOND_MS = 1000;
const HOUR_SECONDS = 60 * 60;

export const PASSWORD = {
	minLength: 12,
	tokenTtlSeconds: HOUR_SECONDS,
	tokenBytes: 24,
	verificationPrefix: "reset-password:",
} as const;

export const CHIA = {
	ttlMs: PASSWORD.tokenTtlSeconds * SECOND_MS,
} as const;

export async function donChiaCu(userId: string): Promise<number> {
	const ket = await db.verification.deleteMany({
		where: {
			value: userId,
			identifier: { startsWith: PASSWORD.verificationPrefix },
		},
	});

	return ket.count;
}

export async function ducChia(input: {
	userId: string;
	appUrl: string;
}): Promise<{ url: string; expiresAt: Date }> {
	await donChiaCu(input.userId);

	const token = randomBytes(PASSWORD.tokenBytes).toString("base64url");
	const expiresAt = new Date(Date.now() + CHIA.ttlMs);

	await db.verification.create({
		data: {
			id: randomBytes(16).toString("hex"),
			identifier: `${PASSWORD.verificationPrefix}${token}`,
			value: input.userId,
			expiresAt,
		},
	});

	return {
		url: new URL(`/dat-mat-khau/${token}`, input.appUrl).toString(),
		expiresAt,
	};
}
