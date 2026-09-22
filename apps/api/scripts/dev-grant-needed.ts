import {
	ensureWorkspaceMembership,
	GOOGLE_PROVIDER_ID,
	IDENTITY_SCOPES,
	MICROSOFT_PROVIDER_ID,
} from "@crm/auth";
import { db } from "@crm/db";

export type CauHinh = "google" | "both" | "clear";

const CAU_HINH: readonly CauHinh[] = ["google", "both", "clear"];

const SCOPE_KHONG_DONG_BO = IDENTITY_SCOPES.join(" ");

const NHA_CUNG_CAP = {
	google: [GOOGLE_PROVIDER_ID],
	both: [GOOGLE_PROVIDER_ID, MICROSOFT_PROVIDER_ID],
} satisfies Record<Exclude<CauHinh, "clear">, readonly string[]>;

export function laCauHinh(value: string): value is CauHinh {
	return (CAU_HINH as readonly string[]).includes(value);
}

export async function gieoGrantNeeded(
	email: string,
	cauHinh: CauHinh,
): Promise<readonly string[]> {
	const name = email.split("@")[0] ?? "Developer";
	const user = await db.user.upsert({
		where: { email },
		create: {
			id: `dev-${Buffer.from(email).toString("hex").slice(0, 20)}`,
			email,
			name,
			emailVerified: true,
			updatedAt: new Date(),
		},
		update: {},
	});

	await ensureWorkspaceMembership(user.id);
	await db.account.deleteMany({ where: { userId: user.id } });

	if (cauHinh === "clear") return [];

	const providers = NHA_CUNG_CAP[cauHinh];
	for (const providerId of providers) {
		await db.account.create({
			data: {
				id: `dev-${providerId}-${user.id}`,
				accountId: `dev-${providerId}-${user.id}`,
				providerId,
				userId: user.id,
				scope: SCOPE_KHONG_DONG_BO,
				updatedAt: new Date(),
			},
		});
	}

	return providers;
}

if (import.meta.main) {
	if (process.env.NODE_ENV === "production") {
		throw new Error("dev-grant-needed is a development helper.");
	}

	const email = process.argv[2] ?? "dev@localhost";
	const cauHinh = process.argv[3] ?? "both";

	if (!laCauHinh(cauHinh)) {
		console.error(
			`cau hinh khong hop le: ${cauHinh}. Co: ${CAU_HINH.join(" ")}`,
		);
		process.exit(2);
	}

	const providers = await gieoGrantNeeded(email, cauHinh);
	console.log(
		`grant-needed=${providers.length ? providers.join(",") : "none"}`,
	);
	await db.$disconnect();
}
