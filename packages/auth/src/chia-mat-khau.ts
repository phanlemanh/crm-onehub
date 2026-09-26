import { randomBytes } from "node:crypto";
import { db as khoChung, type Prisma } from "@crm/db";

const SECOND_MS = 1000;
const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;

export const PASSWORD = {
	minLength: 12,
	tokenTtlSeconds: HOUR_SECONDS,
	tokenBytes: 24,
	rowIdBytes: 16,
	verificationPrefix: "reset-password:",
	requestWindowSeconds: MINUTE_SECONDS,
	requestMax: 3,
} as const;

export const CHIA = {
	ttlMs: PASSWORD.tokenTtlSeconds * SECOND_MS,
} as const;

type KhoChia = Prisma.TransactionClient;

export async function donChiaCu(
	userId: string,
	kho: KhoChia = khoChung,
): Promise<number> {
	const ket = await kho.verification.deleteMany({
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
	kho?: KhoChia;
}): Promise<{ url: string; expiresAt: Date }> {
	const kho = input.kho ?? khoChung;

	await donChiaCu(input.userId, kho);

	const token = randomBytes(PASSWORD.tokenBytes).toString("base64url");
	const expiresAt = new Date(Date.now() + CHIA.ttlMs);

	await kho.verification.create({
		data: {
			id: randomBytes(PASSWORD.rowIdBytes).toString("hex"),
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
