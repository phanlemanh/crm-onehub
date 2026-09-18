import type { Db } from "@crm/db";

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
