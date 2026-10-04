import type { Db } from "@crm/db";
import { isFreeEmailDomain, normalizeDomain } from "../companies/domain";
import { WORKSPACE_CONFIG } from "./workspace-config";

export const APP_SETTING_ID = "app";

export function parseStaffDomains(value: string | null): readonly string[] {
	if (!value) return [];

	const seen = new Set<string>();

	for (const raw of value.split(",")) {
		const entry = raw.trim().toLowerCase().replace(/^@/, "");
		if (entry) seen.add(entry);
	}

	return [...seen];
}

export async function staffEmailDomains(db: Db): Promise<readonly string[]> {
	const row = await db.appSetting.findFirst({
		select: { staffEmailDomains: true },
	});

	return parseStaffDomains(row?.staffEmailDomains ?? null);
}

export type StaffDomainsResult =
	| { ok: true; domains: string[] }
	| { ok: false; message: string };

export function cleanStaffDomains(
	input: readonly string[],
): StaffDomainsResult {
	const { max } = WORKSPACE_CONFIG.staffDomains;
	const { messages } = WORKSPACE_CONFIG;
	const seen = new Set<string>();

	for (const raw of input) {
		const entry = raw.trim().replace(/^@/, "");
		if (!entry) continue;
		if (entry.includes("@")) {
			return { ok: false, message: messages.staffDomainIsAddress(entry) };
		}
		const domain = normalizeDomain(entry);
		if (domain === null) {
			return { ok: false, message: messages.staffDomainInvalid(entry) };
		}
		if (isFreeEmailDomain(domain)) {
			return { ok: false, message: messages.staffDomainPublic(entry) };
		}
		seen.add(domain);
	}

	if (seen.size > max) {
		return { ok: false, message: messages.staffDomainsTooMany(max) };
	}

	return { ok: true, domains: [...seen] };
}

export async function writeStaffDomains(
	db: Db,
	domains: readonly string[],
): Promise<void> {
	const value = domains.length === 0 ? null : domains.join(",");
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: value },
		update: { staffEmailDomains: value },
	});
}
