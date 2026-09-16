import { toWorkspaceRole, type WorkspaceRole } from "./roles";

export type AllowanceStatus = "pending" | "accepted" | "cancelled";

export type AllowanceRow = {
	email: string;
	role: string | null;
	status: AllowanceStatus;
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
			normalizeEmail(candidate.email) === email &&
			candidate.status !== "cancelled",
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
