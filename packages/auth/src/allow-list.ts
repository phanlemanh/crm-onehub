import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	conHieuLuc,
	docTrangThai,
	type TrangThaiDaDoc,
} from "@crm/validation/invitation-status";
import { toWorkspaceRole, type WorkspaceRole } from "./roles";

export type AllowanceRow = {
	email: string;
	role: string | null;
	status: TrangThaiDaDoc;
};

export type HangDaDoc = {
	rows: AllowanceRow[];
	loi: string[];
};

export type AllowInput = {
	email: string;
	allowances: readonly AllowanceRow[];
	seedList: string;
	anyUserExists: boolean;
};

export type AllowDecision =
	| { allowed: true; role: WorkspaceRole; source: "table" | "seed" }
	| { allowed: false };

const DENY: AllowDecision = { allowed: false };

export const ALLOWANCE_WITHOUT_EXPIRY = new Date("9999-12-31T00:00:00.000Z");

export function normalizeEmail(value: string): string | null {
	const trimmed = value.trim().toLowerCase();
	if (!trimmed) return null;

	const parts = trimmed.split("@");
	if (parts.length !== 2) return null;

	const [local, host] = parts;
	if (!local || !host) return null;

	return trimmed;
}

function seedAllows(email: string, seedList: string): boolean {
	const domains: string[] = [];
	const addresses: string[] = [];

	for (const raw of seedList.split(",")) {
		const entry = raw.trim().toLowerCase().replace(/^@/, "");
		if (!entry) continue;
		(entry.includes("@") ? addresses : domains).push(entry);
	}

	if (addresses.includes(email)) return true;

	const host = email.split("@")[1];
	if (!host) return false;

	return domains.some(
		(domain) => host === domain || host.endsWith(`.${domain}`),
	);
}

export function decideSignIn(input: AllowInput): AllowDecision {
	const email = normalizeEmail(input.email);
	if (!email) return DENY;

	const row = input.allowances.find(
		(candidate) =>
			normalizeEmail(candidate.email) === email && conHieuLuc(candidate.status),
	);

	if (row) {
		return {
			allowed: true,
			role: toWorkspaceRole(row.role ?? "member"),
			source: "table",
		};
	}

	if (input.allowances.length > 0) return DENY;
	if (input.anyUserExists) return DENY;
	if (!seedAllows(email, input.seedList)) return DENY;

	return { allowed: true, role: "member", source: "seed" };
}

export function docHang(
	rows: readonly { email: string; role: string | null; status: unknown }[],
): HangDaDoc {
	const loi: string[] = [];
	const ra = rows.map((row) => {
		const doc = docTrangThai(row.status);
		if (doc.loi) loi.push(`${row.email}: ${doc.loi}`);
		return { email: row.email, role: row.role, status: doc.trangThai };
	});

	return { rows: ra, loi };
}

export async function readAllowState(email: string): Promise<AllowInput> {
	const normalized = normalizeEmail(email);

	const [rows, anyUser] = await Promise.all([
		normalized
			? db.invitation.findMany({
					where: { organizationId: WORKSPACE_ID, email: normalized },
					select: { email: true, role: true, status: true },
				})
			: Promise.resolve([]),
		db.user.count(),
	]);

	const { rows: allowances, loi } = docHang(rows);

	for (const cau of loi) console.error(`allow-list: ${cau}`);

	return {
		email,
		allowances,
		seedList: process.env.ALLOWED_SIGN_IN ?? "",
		anyUserExists: anyUser > 0,
	};
}

export async function decideSignInFromDb(
	email: string,
): Promise<AllowDecision> {
	return decideSignIn(await readAllowState(email));
}
